import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      select: {
         id: true,
         name: true,
         email: true,
         role: true,
         degree: true,
         departmentId: true,
         facultyId: true,
         points: true,
         lastSeen: true,
         avatarUrl: true,
         department: { select: { id: true, name: true } },
         faculty: { select: { id: true, name: true } }
      }
    });
    // Foydalanuvchi ma'lumotlari xavfsiz shaklda uzatiladi, chunki password umuman so'ralmadi
    return NextResponse.json(users, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Foydalanuvchilarni yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, password, role, degree, departmentId, facultyId } = await request.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        role,
        degree: degree || "NONE",
        departmentId: departmentId || null,
        facultyId: facultyId || null 
      }
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Foydalanuvchi yaratishda xatolik" }, { status: 500 });
  }
}
