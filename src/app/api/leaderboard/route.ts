import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    let whereParams: any = { role: { not: "ADMIN" } };
    if (departmentId) whereParams.departmentId = departmentId;

    if (userId && role !== "ADMIN") {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      // @ts-ignore
      if (dbUser?.facultyId) {
        // @ts-ignore
        whereParams.facultyId = dbUser.facultyId;
      }
    }

    const users = await prisma.user.findMany({
      where: whereParams,
      include: {
        department: true,
      }
    });

    // @ts-ignore
    const allSubmissions = await prisma.taskSubmission.findMany();

    const leaderboard = users.map(user => {
      const submissions = allSubmissions.filter((s: any) => s.userId === user.id);
      
      // @ts-ignore
      const dbPoints = user.points || 0;
      // Agar tizim yangilanishdan oldingi KPI bo'lsa, uni asrab qolamiz
      const points = dbPoints > 0 ? dbPoints : (submissions.length * 10);
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        // @ts-ignore
        avatarUrl: user.avatarUrl,
        // @ts-ignore
        department: user.department?.name || "Kafedrasiz",
        points,
        submissionsCount: submissions.length
      };
    }).sort((a, b) => b.points - a.points); // Kattadan kichikka

    // O'rinlarni (Ranking) biriktiramiz
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    return NextResponse.json(rankedLeaderboard, { status: 200 });
  } catch (error) {
    console.error("Leaderboard xatosi:", error);
    return NextResponse.json({ error: "Liderlar reytingini yuklashda xatolik" }, { status: 500 });
  }
}
