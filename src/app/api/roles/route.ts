import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const roles = await prisma.customRole.findMany({
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(roles, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Rollarni yuklashda xato" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, permissions } = await req.json();
    if (!name || !permissions) {
      return NextResponse.json({ error: "Nomi va huquqlari ko'rsatilmagan" }, { status: 400 });
    }

    const exists = await prisma.customRole.findUnique({ where: { name } });
    if (exists) {
      return NextResponse.json({ error: "Bunday rol allaqachon mavjud" }, { status: 400 });
    }

    const newRole = await prisma.customRole.create({
      data: { name, permissions }
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Rol yaratishda xato" }, { status: 500 });
  }
}
