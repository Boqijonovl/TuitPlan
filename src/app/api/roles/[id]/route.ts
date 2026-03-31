import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const { name, permissions } = await req.json();
    
    const role = await prisma.customRole.update({
      where: { id },
      data: { name, permissions }
    });

    return NextResponse.json(role, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Rolni yangilashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    await prisma.customRole.delete({ where: { id } });
    return NextResponse.json({ message: "Muvaffaqiyatli o'chirildi" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 });
  }
}
