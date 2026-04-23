import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    const statusParam = searchParams.get("status");

    const conditions: any[] = [{ isDeleted: false }];
    if (departmentId) conditions.push({ departmentId });
    if (statusParam) conditions.push({ status: statusParam });

    if (userId && role !== "ADMIN") {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      // @ts-ignore
      const userFacultyId = dbUser?.facultyId || null;
      // @ts-ignore
      const userDepartmentId = dbUser?.departmentId || null;
      
      if (role === "MUDIR" || ["PROFESSOR", "DOTSENT", "KATTA_OQITUVCHI", "ASSISTENT"].includes(role as string)) {
         conditions.push({
            OR: [
              userDepartmentId ? { departmentId: userDepartmentId } : {},
              { facultyId: userFacultyId, departmentId: null },
              { facultyId: null, departmentId: null }
            ]
         });
      } else {
        // Defaults to DEKAN faculty-only scope + Global Plans
        conditions.push({
          OR: [
            { facultyId: userFacultyId },
            { facultyId: null }
          ]
        });
      }
    }

    if (role && role !== "ADMIN") {
      conditions.push({
        OR: [
          { status: "APPROVED" },
          { status: "DRAFT", userId: userId || "none" }
        ]
      });
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    const plans = await prisma.plan.findMany({
      where,
      include: { 
        tasks: { 
          orderBy: { createdAt: "desc" },
          include: { submissions: true }
        }, 
        department: true 
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(plans, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Rejalarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, year, departmentId, status, tasks, userId, bulkDistribute } = await request.json();
    
    let userFacultyId = null;
    let userDepartmentId = departmentId || null;
    let creator: any = null;
    
    if (userId) {
      creator = await prisma.user.findUnique({ where: { id: userId } });
      // @ts-ignore
      if (creator && creator.facultyId) {
         // @ts-ignore
         userFacultyId = creator.facultyId;
      }
      // Force department context for MUDIR explicitly to avoid cheating
      // @ts-ignore
      if (creator && creator.role === "MUDIR") {
         // @ts-ignore
         userDepartmentId = creator.departmentId || userDepartmentId;
      }
    }
    
    let targetDepartments: any[] = [];
    if (bulkDistribute) {
       const depFilters: any = { isDeleted: false };
       if (creator && creator.role === "DEKAN" && userFacultyId) {
          depFilters.facultyId = userFacultyId;
       }
       targetDepartments = await prisma.department.findMany({ where: depFilters });
    } else {
       targetDepartments = [{ id: userDepartmentId, facultyId: userFacultyId }];
    }

    const createdPlans = [];
    for (const target of targetDepartments) {
      const planData: any = { 
        title, 
        year: Number(year), 
        departmentId: target.id, 
        facultyId: target.facultyId,
        status: status || "DRAFT",
        userId 
      };
      
      if (tasks && Array.isArray(tasks) && tasks.length > 0) {
        planData.tasks = {
          create: tasks.map(t => ({
            title: t.title,
            timeframe: t.timeframe,
            assignedRole: t.assignedRole || null,
            category: t.category || "OQUV",
            hours: t.hours || 0,
            status: "BAJARILMAGAN"
          }))
        };
      }

      const plan = await prisma.plan.create({
        data: planData,
        include: { tasks: true }
      });
      createdPlans.push(plan);
    }

    if (userId) {
      // @ts-ignore
      await prisma.activityLog.create({
        data: {
          userId,
          action: "Yangi reja yaratdi",
          details: `Reja: ${title}`
        }
      });
    }

    return NextResponse.json(createdPlans[0] || {}, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Reja yaratishda xatolik" }, { status: 500 });
  }
}
