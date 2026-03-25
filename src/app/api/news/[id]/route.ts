import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const resolvedParams = await params;
    
    const targetNews = await prisma.news.findUnique({ where: { id: resolvedParams.id } });
    await prisma.news.delete({ where: { id: resolvedParams.id } });
    
    if (userId && targetNews) {
      // @ts-ignore
      await prisma.activityLog.create({
        data: {
          userId,
          action: "Yangilikni o'chirdi",
          details: `Sarlavha: ${targetNews.title}`
        }
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
