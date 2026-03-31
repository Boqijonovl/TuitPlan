import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const role = url.searchParams.get("role");

    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    const [users, faculties, departments, plans, tasks, logs] = await Promise.all([
      prisma.user.findMany(),
      prisma.faculty.findMany(),
      prisma.department.findMany(),
      prisma.plan.findMany(),
      prisma.task.findMany(),
      prisma.activityLog.findMany({ take: 500 }), // Oxirgi 500 ta jurnal
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      data: {
        users, faculties, departments, plans, tasks, logs
      }
    };

    return new NextResponse(JSON.stringify(backupData, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="tuit-edu-backup-${new Date().getTime()}.json"`,
      },
    });
  } catch (error) {
    console.error("Backup xatosi:", error);
    return NextResponse.json({ error: "Arxiv yaratishda xatolik yuz berdi" }, { status: 500 });
  }
}
