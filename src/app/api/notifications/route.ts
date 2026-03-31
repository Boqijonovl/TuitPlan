import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) return NextResponse.json([], { status: 400 });

    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    return NextResponse.json(notifications, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Bildirishnomalarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, title, message, link } = await req.json();
    if (!userId || !title) return NextResponse.json({ error: "Ma'lumot to'liq emas" }, { status: 400 });

    const notification = await prisma.notification.create({
      data: { userId, title, message, link }
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Bildirishnoma yaratishda xato" }, { status: 500 });
  }
}
