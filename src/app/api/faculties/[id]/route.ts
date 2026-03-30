import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    await prisma.faculty.update({
      where: { id: resolvedParams.id },
      data: { isDeleted: true }
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "O'chirishda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { name } = body;
    
    if (!name) return NextResponse.json({ error: "Nomi kiritilishi shart" }, { status: 400 });

    const updated = await prisma.faculty.update({
      where: { id: resolvedParams.id },
      data: { name }
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Tahrirlashda xatolik yuz berdi" }, { status: 500 });
  }
}
