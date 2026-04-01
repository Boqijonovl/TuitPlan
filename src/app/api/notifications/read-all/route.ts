import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Foydalanuvchi IDsi kiritilmagan" }, { status: 400 });
    }

    // Barcha o'qilmagan xabarlarni bittada o'qilgan deb belgilash
    await prisma.notification.updateMany({
      where: { 
        userId: userId,
        isRead: false 
      },
      data: { isRead: true }
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Notifications read-all error:", error);
    return NextResponse.json({ error: "Xabarlarni o'qishda xatolik yuz berdi" }, { status: 500 });
  }
}
