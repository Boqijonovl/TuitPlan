import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const departmentId = resolvedParams.id;
    
    // Xavfsiz o'chirish: Barcha bog'langan foydalanuvchilar va rejalardan bu kafedrani uzib qoyamiz (SetNull o'rniga manual)
    // @ts-ignore
    await prisma.user.updateMany({ where: { departmentId }, data: { departmentId: null } });
    // @ts-ignore
    await prisma.plan.updateMany({ where: { departmentId }, data: { departmentId: null } });
    
    // Kafedrani to'liq o'chirish
    await prisma.department.delete({
      where: { id: departmentId }
    });
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Kafedrani o'chirishda xatolik yuz berdi" }, { status: 500 });
  }
}
