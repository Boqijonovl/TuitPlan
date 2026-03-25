import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");

    const where = departmentId ? { departmentId } : {};

    const plans = await prisma.plan.findMany({
      where,
      include: {
        tasks: true,
        department: { include: { faculty: true } }
      }
    });

    const report = plans.map(plan => {
      const totalTasks = plan.tasks.length;
      const completedTasks = plan.tasks.filter(t => t.status === "COMPLETED").length;
      const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      return {
        planId: plan.id,
        planTitle: plan.title,
        department: plan.department.name,
        faculty: plan.department.faculty.name,
        totalTasks,
        completedTasks,
        progress: Math.round(progress)
      };
    });

    return NextResponse.json(report, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Hisobotlarni yuklashda xatolik" }, { status: 500 });
  }
}
