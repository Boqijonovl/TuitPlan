import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      include: { 
        department: true,
        faculty: true
      }
    });
    const safeUsers = users.map(user => {
      const { password, ...rest } = user;
      return rest;
    });
    return NextResponse.json(safeUsers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Foydalanuvchilarni yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, password, role, departmentId, facultyId } = await request.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        role, 
        departmentId: departmentId || null,
        facultyId: facultyId || null 
      }
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Foydalanuvchi yaratishda xatolik" }, { status: 500 });
  }
}
