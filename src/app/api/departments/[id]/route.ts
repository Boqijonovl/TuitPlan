import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const departmentId = resolvedParams.id;
    
    // Kafedrani haqiqiy o'chirish o'rniga Soft Delete qilamiz va unga bog'langan xodimlarni asrab qolamiz.
    await prisma.department.update({
      where: { id: departmentId },
      data: { isDeleted: true }
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kafedrani o'chirishda xatolik yuz berdi" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { name } = await request.json();
    
    if (!name) return NextResponse.json({ error: "Nomi kiritilishi shart" }, { status: 400 });

    const updated = await prisma.department.update({
      where: { id: resolvedParams.id },
      data: { name }
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Kafedrani tahrirlashda xatolik yuz berdi" }, { status: 500 });
  }
}
