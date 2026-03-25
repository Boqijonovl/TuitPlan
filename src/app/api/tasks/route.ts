import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const planId = searchParams.get("planId");
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");

    const where: any = {};
    if (planId) where.planId = planId;
    
    // Add User-specific plan scoping
    if (userId && role !== "ADMIN") {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      const userFacultyId = dbUser?.facultyId || null;
      // @ts-ignore
      const userDepartmentId = dbUser?.departmentId || null;
      
      if (role === "HOD" || role === "TEACHER") {
         where.plan = {
            status: "APPROVED",
            OR: [
              userDepartmentId ? { departmentId: userDepartmentId } : {},
              { facultyId: userFacultyId, departmentId: null },
              { facultyId: null, departmentId: null }
            ]
         };
      } else {
         where.plan = {
            status: "APPROVED",
            OR: [
              { facultyId: userFacultyId },
              { facultyId: null }
            ]
         };
      }
    } else {
      where.plan = { status: "APPROVED" };
    }

    if (page && limit) {
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const take = parseInt(limit);
      const [tasks, total] = await Promise.all([
        prisma.task.findMany({
          where,
          skip,
          take,
          include: { 
            user: true, 
            plan: true,
            submissions: { include: { user: true } },
            comments: { include: { user: true }, orderBy: { createdAt: "asc" } }
          },
          orderBy: { createdAt: "desc" }
        }),
        prisma.task.count({ where })
      ]);
      return NextResponse.json({ data: tasks, meta: { total, hasMore: skip + take < total } }, { status: 200 });
    }

    // Default backward compatible fetch
    // @ts-ignore
    const tasks = await prisma.task.findMany({
      where,
      include: { 
        user: true, 
        plan: true,
        submissions: { include: { user: true } },
        comments: { include: { user: true }, orderBy: { createdAt: "asc" } }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Vazifalarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, description, deadline, timeframe, note, userId, planId, status } = await request.json();
    const task = await prisma.task.create({
      data: {
        title,
        description,
        deadline: deadline ? new Date(deadline) : null,
        timeframe,
        note,
        userId: userId || null,
        planId,
        status: status || "NEW"
      }
    });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Vazifa yaratishda xatolik" }, { status: 500 });
  }
}
