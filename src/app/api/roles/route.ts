import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const defaultRoles = [
      { name: "ADMIN", permissions: ["VIEW_MONITORING", "VIEW_FACULTIES", "VIEW_USERS", "EDIT_USERS", "VIEW_HISTORY", "VIEW_SETTINGS", "VIEW_ARCHIVE", "VIEW_CHAT"] },
      { name: "DEKAN", permissions: ["VIEW_FACULTIES", "VIEW_USERS", "VIEW_ARCHIVE", "VIEW_CHAT"] },
      { name: "MUDIR", permissions: ["VIEW_USERS", "VIEW_ARCHIVE", "VIEW_CHAT"] },
      { name: "OQITUVCHI", permissions: ["VIEW_CHAT"] }
    ];

    for (const dr of defaultRoles) {
      const exists = await prisma.customRole.findUnique({ where: { name: dr.name } });
      if (!exists) {
         await prisma.customRole.create({ data: dr });
      }
    }

    const roles = await prisma.customRole.findMany({
      orderBy: { name: "asc" } // Alifbo boyicha (ADMIN tepadaroq boladi doim)
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
      return NextResponse.json({ error: "Bunday rol tizimda allaqachon mavjud" }, { status: 400 });
    }

    const newRole = await prisma.customRole.create({
      data: { name, permissions }
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Rol yaratishda xato" }, { status: 500 });
  }
}
