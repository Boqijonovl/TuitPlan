import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParams = searchParams.get("limit");
    const limit = limitParams ? parseInt(limitParams) : 10;

    const news = await prisma.news.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        author: {
          select: { name: true, role: true }
        }
      }
    });
    
    return NextResponse.json(news, { status: 200 });
  } catch (error) {
    console.error("News GET Error:", error);
    return NextResponse.json({ error: "Yangiliklarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content, type, authorId } = await request.json();
    
    if (!title || !content || !authorId) {
      return NextResponse.json({ error: "Barcha maydonlar to'ldirilishi shart" }, { status: 400 });
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        type: type || "UNIVERSITET",
        authorId
      }
    });

    // @ts-ignore
    await prisma.activityLog.create({
      data: {
        userId: authorId,
        action: "Yangilik qo'shdi",
        details: title
      }
    });

    return NextResponse.json(news, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Yangilik qo'shishda xatolik" }, { status: 500 });
  }
}
