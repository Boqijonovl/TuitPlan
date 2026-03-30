import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    let facultyId = null;
    let whereUser: any = { role: { not: "ADMIN" } };
    let wherePlan: any = { status: "APPROVED" };
    let whereTask: any = { status: "BAJARILGAN" };
    let whereTaskInProgress: any = { status: "BAJARILMAGAN" };
    let whereRecentPlan: any = {};

    if (userId && role !== "ADMIN") {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      // @ts-ignore
      facultyId = dbUser?.facultyId || null;

      if (facultyId) {
        whereUser = { ...whereUser, facultyId };
        wherePlan = { ...wherePlan, facultyId };
        whereTask = { ...whereTask, plan: { facultyId } };
        whereTaskInProgress = { ...whereTaskInProgress, plan: { facultyId } };
        whereRecentPlan = { facultyId };
      }
    }

    const [totalUsers, activePlans, completedTasks, inProgressTasks, recentPlans, totalDeans, totalHODs, totalTeachers] = await Promise.all([
      prisma.user.count({ where: whereUser }),
      prisma.plan.count({ where: wherePlan }),
      prisma.task.count({ where: whereTask }),
      prisma.task.count({ where: whereTaskInProgress }),
      prisma.plan.findMany({
        where: whereRecentPlan,
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { department: true, tasks: true }
      }),
      prisma.user.count({ where: { ...whereUser, role: "DEAN" } }),
      prisma.user.count({ where: { ...whereUser, role: "HOD" } }),
      prisma.user.count({ where: { ...whereUser, role: "TEACHER" } })
    ]);

    return NextResponse.json({
      totalUsers,
      totalDeans,
      totalHODs,
      totalTeachers,
      activePlans,
      completedTasks,
      inProgressTasks,
      recentPlans
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ error: "Statistikani yuklashda xatolik" }, { status: 500 });
  }
}
