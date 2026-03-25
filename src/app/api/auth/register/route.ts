import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { name, email, password, role, departmentId } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Barcha majburiy maydonlarni to'ldiring" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Bu email allaqachon ro'yxatdan o'tgan" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "TEACHER",
        departmentId: departmentId || null,
      },
    });

    return NextResponse.json({ message: "Muvaffaqiyatli ro'yxatdan o'tdingiz", user: { id: user.id, email: user.email, role: user.role } }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Ichki server xatoligi" }, { status: 500 });
  }
}
