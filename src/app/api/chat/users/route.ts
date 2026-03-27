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
      const userDepartmentId = dbUser?.departmentId || null;

      if (role === "HOD" || role === "TEACHER") {
          whereParams.OR = [
            { departmentId: userDepartmentId },
            { role: "DEAN", facultyId: userFacultyId }, // Can talk to their Dean
            { role: "ADMIN" } // Can talk to Admin
          ];
      } else if (role === "DEAN") {
        whereParams.OR = [
          { facultyId: userFacultyId },
          { role: "ADMIN" } 
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
