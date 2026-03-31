import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const role = searchParams.get("role") || "OQITUVCHI"; // Kim qidirayapti

    if (!q || q.length < 2) return NextResponse.json({ results: [] }, { status: 200 });

    const searchTerm = `%${q}%`;
    const results: any[] = [];

    // 1. Xodimlarni qidirish (Faqat ism yoki email bo'yicha)
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { isDeleted: false },
          { OR: [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }] }
        ]
      },
      take: 5
    });

    users.forEach(u => {
      let roleName = u.role === "ADMIN" ? "Administrator" : u.role === "DEKAN" ? "Fakultet Dekani" : u.role === "MUDIR" ? "Kafedra Mudiri" : "O'qituvchi";
      results.push({ type: "USER", id: u.id, title: u.name, subtitle: `${roleName} / ${u.email}`, link: "/dashboard/users" });
    });

    // 2. Rejalarni qidirish
    const plans = await prisma.plan.findMany({
      where: {
        AND: [
          { isDeleted: false },
          { title: { contains: q, mode: "insensitive" } }
        ]
      },
      take: 5
    });

    plans.forEach(p => {
      results.push({ type: "PLAN", id: p.id, title: p.title, subtitle: `${p.year}-yilgi reja`, link: "/dashboard/plans" });
    });

    // 3. Vazifalarni qidirish
    const tasks = await prisma.task.findMany({
      where: {
        AND: [
          { isDeleted: false },
          { OR: [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }] }
        ]
      },
      take: 5
    });

    tasks.forEach(t => {
      let statusName = t.status === "NEW" ? "Yangi" : t.status === "IN_PROGRESS" ? "Jarayonda" : "Yakunlandi";
      results.push({ type: "TASK", id: t.id, title: t.title, subtitle: `Holati: ${statusName}`, link: "/dashboard/tasks" }); // Agar tasks alohida sahifa bo'lsa
    });

    return NextResponse.json({ results }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Qidiruv tizimida xatolik" }, { status: 500 });
  }
}
