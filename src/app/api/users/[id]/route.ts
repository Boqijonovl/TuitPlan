import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    const body = await request.json();
    const { name, password, avatarUrl } = body;

    const dataToUpdate: any = { name };
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }
    if (avatarUrl !== undefined) {
      dataToUpdate.avatarUrl = avatarUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, name: updatedUser.name, avatarUrl: (updatedUser as any).avatarUrl, telegramId: (updatedUser as any).telegramId }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Foydalanuvchini yangilashda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const userId = resolvedParams.id;
    
    // Check if the user is the only ADMIN
    const userRole = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
    if (userRole?.role === "ADMIN") {
      const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Oxirgi adminni o'chirish mumkin emas!" }, { status: 400 });
      }
    }

    await prisma.taskSubmission.deleteMany({ where: { userId } });
    await prisma.news.deleteMany({ where: { authorId: userId } });
    
    await prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true }
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Boshqa ma'lumotlarga bog'langan foydalanuvchini o'chirish rad etildi." }, { status: 500 });
  }
}
