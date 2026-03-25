import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const uzbekMonths: Record<string, number> = {
  yanvar: 0, fevral: 1, mart: 2, aprel: 3, may: 4, iyun: 5,
  iyul: 6, avgust: 7, sentyabr: 8, oktyabr: 9, noyabr: 10, dekabr: 11
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    if (!userId) return NextResponse.json([], { status: 400 });
    if (role === "ADMIN") return NextResponse.json([], { status: 200 });

    const dbUser = await prisma.user.findUnique({ where: { id: userId } });
    // @ts-ignore
    const userFacultyId = dbUser?.facultyId || null;

    const tasks = await prisma.task.findMany({
      where: {
        AND: [
          { plan: { 
              status: "APPROVED",
              OR: [
                // @ts-ignore
                { facultyId: userFacultyId },
                // @ts-ignore
                { facultyId: null }
              ] 
            } 
          },
          {
            OR: [
              { assignedRole: null },
              { assignedRole: "" },
              ...(role ? [{ assignedRole: role }] : [])
            ]
          },
          {
            submissions: {
              none: { userId } // Only tasks that I haven't submitted yet
            }
          }
        ]
      },
      include: {
        plan: { select: { title: true } }
      }
    });

    // Muddat o'tganlarni olib tashlash (Filter out past deadlines)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const validTasks = tasks.filter(t => {
      if (t.deadline) return new Date(t.deadline) >= now;
      
      if (t.timeframe) {
        const lower = t.timeframe.toLowerCase();
        let yearMatch = lower.match(/(\d{4})/);
        let year = yearMatch ? parseInt(yearMatch[1]) : currentYear;
        
        let month = currentMonth + 1; // Default assumes future if month not explicitly found and year matches
        for (const [mName, mIdx] of Object.entries(uzbekMonths)) {
          if (lower.includes(mName)) {
            month = mIdx;
            break;
          }
        }
        
        if (year < currentYear) return false;
        if (year === currentYear && month < currentMonth) return false;
      }
      
      return true; 
    });

    const taskReminders = validTasks.map(t => ({
      id: `task-${t.id}`,
      title: t.title,
      // @ts-ignore
      plan: t.plan,
      timeframe: t.timeframe,
      deadline: t.deadline,
      type: "TASK_REMINDER",
      isRead: false
    }));

    // @ts-ignore
    const physicalNotifs = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    const combined = [...taskReminders, ...physicalNotifs];

    return NextResponse.json(combined, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Bildirishnomalarni yuklashda xatolik" }, { status: 500 });
  }
}
