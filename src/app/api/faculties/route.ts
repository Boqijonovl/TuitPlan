import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const faculties = await prisma.faculty.findMany({
      include: { 
        departments: {
          include: {
            _count: { select: { users: true } }
          }
        },
        _count: { select: { users: true } }
      }
    });
    return NextResponse.json(faculties, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Fakultetlarni yuklashda xatolik" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    if (!name) return NextResponse.json({ error: "Fakultet nomi kiritilishi shart" }, { status: 400 });

    const faculty = await prisma.faculty.create({
      data: { name, description }
    });
    return NextResponse.json(faculty, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Fakultet yaratishda xatolik" }, { status: 500 });
  }
}
