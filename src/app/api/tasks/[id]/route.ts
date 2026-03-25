import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const taskId = resolvedParams.id;
    const { status, note, fileUrl, userId } = await request.json();
    
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status, note, fileUrl }
    });

    if (userId && status) {
      // @ts-ignore
      await prisma.activityLog.create({
        data: {
          userId,
          action: "Vazifa holatini o'zgartirdi",
          details: `Vazifa: ${task.title} -> ${status}`
        }
      });
    }

    return NextResponse.json(task, { status: 200 });
  } catch (error) {
    console.error("Task update error:", error);
    return NextResponse.json({ error: "Vazifani o'zgartirishda xatolik yuz berdi" }, { status: 500 });
  }
}
