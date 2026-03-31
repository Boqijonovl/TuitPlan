import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Agar id "read-all" bo'lsa, foydalanuvchining barcha xabarlarini o'qilgan qilamiz
    if (id === "read-all") {
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get("userId");
      if (!userId) return NextResponse.json({ error: "User topilmadi" }, { status: 400 });

      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true }
      });
      return NextResponse.json({ message: "Barchasi o'qildi" }, { status: 200 });
    }

    // Bitta ma'lum xabarni o'qilgan qilish
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return NextResponse.json(notification, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Holatni o'zgartirishda xatolik" }, { status: 500 });
  }
}
