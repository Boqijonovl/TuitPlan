import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    const statusParam = searchParams.get("status");

    const conditions: any[] = [];
    if (departmentId) conditions.push({ departmentId });
    if (statusParam) conditions.push({ status: statusParam });

    if (userId && role !== "ADMIN") {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      // @ts-ignore
      const userFacultyId = dbUser?.facultyId || null;
      // @ts-ignore
      const userDepartmentId = dbUser?.departmentId || null;
      
      if (role === "HOD" || role === "TEACHER") {
         conditions.push({
            OR: [
              userDepartmentId ? { departmentId: userDepartmentId } : {},
              { facultyId: userFacultyId, departmentId: null },
              { facultyId: null, departmentId: null }
            ]
         });
      } else {
        // Defaults to DEAN faculty-only scope + Global Plans
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
    const { title, year, departmentId, status, tasks, userId } = await request.json();
    
    let userFacultyId = null;
    let userDepartmentId = departmentId || null;
    
    if (userId) {
      const creator = await prisma.user.findUnique({ where: { id: userId } });
      // @ts-ignore
      if (creator && creator.facultyId) {
         // @ts-ignore
         userFacultyId = creator.facultyId;
      }
      // Force department context for HOD explicitly to avoid cheating
      // @ts-ignore
      if (creator && creator.role === "HOD") {
         // @ts-ignore
         userDepartmentId = creator.departmentId || userDepartmentId;
      }
    }
    
    const planData: any = { 
      title, 
      year: Number(year), 
      departmentId: userDepartmentId, 
      facultyId: userFacultyId,
      status: status || "DRAFT",
      userId 
    };
    
    if (tasks && Array.isArray(tasks) && tasks.length > 0) {
      planData.tasks = {
        create: tasks.map(t => ({
          title: t.title,
          timeframe: t.timeframe,
          assignedRole: t.assignedRole || null,
          status: "BAJARILMAGAN"
        }))
      };
    }

    const plan = await prisma.plan.create({
      data: planData,
      include: { tasks: true }
    });

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

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Reja yaratishda xatolik" }, { status: 500 });
  }
}
