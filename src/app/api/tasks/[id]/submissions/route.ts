import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const taskId = resolvedParams.id;
    const { userId, note, fileUrl } = await request.json();

    const submission = await prisma.taskSubmission.create({
      data: {
        taskId,
        userId,
        note,
        fileUrl
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
