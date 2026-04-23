import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, permissions } = await req.json();
    
    // Tizim rollari (ADMIN, DEKAN, MUDIR, PROFESSOR, DOTSENT, KATTA_OQITUVCHI, ASSISTENT) ismini o'zgartirib bo'lmaydi
    const existingRole = await prisma.customRole.findUnique({ where: { id } });
    if (!existingRole) return NextResponse.json({ error: "Rol topilmadi" }, { status: 404 });

    if (["ADMIN", "DEKAN", "MUDIR", "PROFESSOR", "DOTSENT", "KATTA_OQITUVCHI", "ASSISTENT"].includes(existingRole.name) && name !== existingRole.name) {
       return NextResponse.json({ error: "Tizim (Baza) rollarining original nomini o'zgartirib bo'lmaydi! Faqat ruxsatlarni tahrirlang." }, { status: 403 });
    }

    const role = await prisma.customRole.update({
      where: { id },
      data: { name, permissions }
    });

    return NextResponse.json(role, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Rolni yangilashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existingRole = await prisma.customRole.findUnique({ where: { id } });
    if (!existingRole) return NextResponse.json({ error: "Rol topilmadi" }, { status: 404 });

    if (["ADMIN", "DEKAN", "MUDIR", "PROFESSOR", "DOTSENT", "KATTA_OQITUVCHI", "ASSISTENT"].includes(existingRole.name)) {
       return NextResponse.json({ error: "DIQQAT: Tizimning asosiy (Base) roli butunlay o'chirib yuborilishi mumkin emas! Xavfsizlik protokoli faollashdi." }, { status: 403 });
    }

    await prisma.customRole.delete({ where: { id } });
    return NextResponse.json({ message: "Muvaffaqiyatli o'chirildi" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "O'chirishda xatolik" }, { status: 500 });
  }
}
