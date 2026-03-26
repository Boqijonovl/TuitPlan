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
