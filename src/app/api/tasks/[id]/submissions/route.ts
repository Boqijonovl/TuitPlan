import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const taskId = resolvedParams.id;
    const { userId, note, fileUrl, fileHash, fileSize, originalName } = await request.json();

    // ANTI-CHEAT (Plagiat Tizimi) Check
    if (fileHash) {
      const existingSubmission = await prisma.taskSubmission.findFirst({
        where: { fileHash },
        include: { user: true }
      });

      if (existingSubmission) {
        return NextResponse.json(
          { error: `PLAGIAT ANIQLANDI: Bu hujjat avval ${existingSubmission.user?.name} tomonidan yuklangan!` },
          { status: 403 }
        );
      }
    }

    const submission = await prisma.taskSubmission.create({
      data: {
        taskId,
        userId,
        note,
        fileUrl,
        fileHash,
        fileSize,
        originalName
      }
    });

    if (userId) {
      // @ts-ignore
      await prisma.activityLog.create({
        data: {
          userId,
          action: "Vazifaga hisobot biriktirdi",
          details: `Qayd: ${note || 'Fayl'}`
        }
      });
    }

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("Task submission error:", error);
    return NextResponse.json({ error: "Hisobotni saqlashda xatolik yuz berdi" }, { status: 500 });
  }
}
