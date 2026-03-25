import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    if (!q || q.length < 2) return NextResponse.json({ results: [] });

    // 1. Search Users
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q } },
          { email: { contains: q } }
        ]
      },
      take: 5
    });

    // 2. Search Plans (Restricted to User's faculty)
    let planWhere: any = { title: { contains: q } };
    if (userId && role !== "ADMIN") {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      if ((dbUser as any)?.facultyId) {
        planWhere.OR = [
          { department: { facultyId: (dbUser as any).facultyId } },
          { departmentId: null }
        ];
      }
    }
    const plans = await prisma.plan.findMany({ where: planWhere, take: 5, include: { department: true } });

    // 3. Search Tasks
    let taskWhere: any = { title: { contains: q } };
    if (userId && role !== "ADMIN") {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      if ((dbUser as any)?.facultyId) {
        taskWhere.plan = {
          OR: [
            { department: { facultyId: (dbUser as any).facultyId } },
            { departmentId: null }
          ]
        };
      }
    }
    const tasks = await prisma.task.findMany({ where: taskWhere, take: 5, include: { plan: true } });

    // Combine results into a normalized format
    const results = [
      ...users.map(u => ({ type: "USER", id: u.id, title: u.name, subtitle: u.role, link: "/dashboard/users" })),
      ...plans.map(p => ({ type: "PLAN", id: p.id, title: p.title, subtitle: p.department?.name || "Umumiy", link: "/dashboard/plans" })),
      ...tasks.map(t => ({ type: "TASK", id: t.id, title: t.title, subtitle: t.plan?.title || "Rejasiz", link: `/dashboard/tasks` }))
    ];

    return NextResponse.json({ results });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
