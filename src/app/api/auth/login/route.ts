import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email va parolni kiriting" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: "Parol noto'g'ri" }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "1d" }
    );

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: "Tizimga kirdi",
      }
    });

    return NextResponse.json({
      message: "Muvaffaqiyatli kirdingiz",
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, departmentId: user.departmentId, facultyId: user.facultyId }
    }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Ichki server xatoligi" }, { status: 500 });
  }
}
