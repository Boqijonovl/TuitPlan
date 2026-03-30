import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    let whereParams: any = { isDeleted: false, id: { not: userId || undefined } };

    if (userId && role !== "ADMIN") {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      const userFacultyId = dbUser?.facultyId || null;

      if (userFacultyId) {
         whereParams.OR = [
            { facultyId: userFacultyId },     // O'zining fakultetidagi barcha xodimlar
            { role: "ADMIN" }                 // Va Tizim administratori har doim ochiq
         ];
      } else {
         whereParams.OR = [
            { role: "ADMIN" }                 // Fakultetsiz xodimlar faqat Admin bilan bog'lana oladi
         ];
      }
    }

    const users = await prisma.user.findMany({
      where: whereParams,
      include: {
        department: true,
        faculty: true
      },
      orderBy: { name: "asc" }
    });

    const formattedUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      role: u.role,
      avatarUrl: u.avatarUrl,
      department: u.department?.name,
      faculty: u.faculty?.name,
      // @ts-ignore
      lastSeen: u.lastSeen
    }));

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Foydalanuvchilarni yuklashda xatolik" }, { status: 500 });
  }
}
