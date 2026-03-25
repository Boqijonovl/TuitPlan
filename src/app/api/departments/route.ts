import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: { faculty: true }
    });
    return NextResponse.json(departments, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Kafedralarni yuklashda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, facultyId } = await request.json();
    const department = await prisma.department.create({
      data: { name, facultyId }
    });
    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Kafedra yaratishda xatolik" }, { status: 500 });
  }
}
