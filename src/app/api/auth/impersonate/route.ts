import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tish majburiy" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    } catch {
      return NextResponse.json({ error: "Yaroqsiz token" }, { status: 401 });
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Super Admin huquqi talab qilinadi" }, { status: 403 });
    }

    const { targetUserId } = await request.json();
    if (!targetUserId) {
      return NextResponse.json({ error: "Xodim tanlanmagan" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
    }

    // Super Admin xarakati arxivlanadi
    await prisma.activityLog.create({
      data: {
        userId: decoded.userId,
        action: "Impersonation",
        details: `${targetUser.name} (${targetUser.role}) roliga kirib tizimni ochdi`,
      }
    });

    let permissions: string[] = [];
    const customRole = await prisma.customRole.findUnique({ where: { name: targetUser.role } });
    if (customRole) permissions = customRole.permissions;

    const newToken = jwt.sign(
      { userId: targetUser.id, email: targetUser.email, role: targetUser.role, name: targetUser.name, permissions },
      process.env.JWT_SECRET || "fallback_secret",
      { expiresIn: "4h" }
    );

    return NextResponse.json({
      message: `${targetUser.name} sifatida tizimga kirdingiz`,
      token: newToken,
      user: { id: targetUser.id, name: targetUser.name, email: targetUser.email, role: targetUser.role, permissions, departmentId: targetUser.departmentId, facultyId: targetUser.facultyId, avatarUrl: targetUser.avatarUrl }
    }, { status: 200 });
  } catch (error) {
    console.error("Impersonate API xatosi:", error);
    return NextResponse.json({ error: "Ichki server xatosi" }, { status: 500 });
  }
}
