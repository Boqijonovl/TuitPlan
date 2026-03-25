import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, action, details } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "Foydalanuvchi yoki harakat ko'rsatilmagan" }, { status: 400 });
    }

    const log = await prisma.activityLog.create({
      data: {
        userId,
        action,
        details,
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("Log yaratishda xatolik:", error);
    return NextResponse.json({ error: "Log saqlanmadi" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    if (role !== "ADMIN") {
      return NextResponse.json({ error: "Ruxsat etilmagan" }, { status: 403 });
    }

    if (userId) {
      const logs = await prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(logs);
    }

    // Default: Get all logs or users
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        user: { select: { name: true, role: true } }
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("Loglarni olishda xatolik:", error);
    return NextResponse.json({ error: "Loglar topilmadi" }, { status: 500 });
  }
}
