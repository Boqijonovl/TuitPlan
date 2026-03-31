import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { points, action } = await req.json(); // action == "ADD" | "SUBTRACT"

    if (!points || typeof points !== "number") {
      return NextResponse.json({ error: "Noto'g'ri qiymat" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });

    const newPoints = action === "ADD" ? user.points + points : Math.max(0, user.points - points);

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { points: newPoints }
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Ball tizimida xatolik yuz berdi" }, { status: 500 });
  }
}
