import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const taskId = resolvedParams.id;
    const { status, note, fileUrl, userId } = await request.json();
    
    const oldTask = await prisma.task.findUnique({ where: { id: taskId } });
    
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status, note, fileUrl }
    });

    // Gamification KPI Points Engine
    if (userId && status) {
      const reward = oldTask?.pointsReward || 10;
      
      // Award points if freshly completed
      if (oldTask?.status !== "BAJARILGAN" && status === "BAJARILGAN") {
        await prisma.user.update({ where: { id: userId }, data: { points: { increment: reward } } });
      }
      // Deduct points if reverted from completion
      else if (oldTask?.status === "BAJARILGAN" && status !== "BAJARILGAN") {
        await prisma.user.update({ where: { id: userId }, data: { points: { decrement: reward } } });
      }
    }

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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await prisma.task.update({
      where: { id: resolvedParams.id },
      data: { isDeleted: true }
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Vazifani o'chirishda xatolik yuz berdi" }, { status: 500 });
  }
}
