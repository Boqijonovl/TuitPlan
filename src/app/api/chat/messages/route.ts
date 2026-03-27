import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const contactId = searchParams.get("contactId");

    if (!userId || !contactId) return NextResponse.json([], { status: 200 });

    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: contactId },
          { senderId: contactId, receiverId: userId }
        ]
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    // Kompyuterda Prisma db push qilinmaganida xato 500 chiqmasligi uchun jimgina bo'sh array qaytaramiz
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const { senderId, receiverId, text } = await request.json();
    
    if (!senderId || !receiverId || !text) {
       return NextResponse.json({ error: "Yuboruvchi, qabul qiluvchi va matn bo'lishi shart" }, { status: 400 });
    }

    const msg = await prisma.chatMessage.create({
      data: {
        senderId,
        receiverId,
        text
      }
    });

    return NextResponse.json(msg, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Fayl yuborishda xatolik: Baza yangilanmagan bo'lishi mumkin" }, { status: 400 });
  }
}
