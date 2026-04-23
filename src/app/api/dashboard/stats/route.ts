import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const role = searchParams.get("role");

    let facultyId = null;
    let whereUser: any = { role: { not: "ADMIN" } };
    let wherePlan: any = { status: "APPROVED" };
    let whereTask: any = { status: "BAJARILGAN" };
    let whereTaskInProgress: any = { status: "BAJARILMAGAN" };
    let whereRecentPlan: any = {};

    if (userId && role !== "ADMIN") {
      const dbUser = await prisma.user.findUnique({ where: { id: userId } });
      // @ts-ignore
      facultyId = dbUser?.facultyId || null;

      if (facultyId) {
        whereUser = { ...whereUser, facultyId };
        wherePlan = { ...wherePlan, facultyId };
        whereTask = { ...whereTask, plan: { facultyId } };
        whereTaskInProgress = { ...whereTaskInProgress, plan: { facultyId } };
        whereRecentPlan = { facultyId };
      }
    }

    const [totalUsers, activePlans, completedTasks, inProgressTasks, recentPlans, totalDeans, totalHODs, totalTeachers, totalDegreeHolders] = await Promise.all([
      prisma.user.count({ where: whereUser }),
      prisma.plan.count({ where: wherePlan }),
      prisma.task.count({ where: whereTask }),
      prisma.task.count({ where: whereTaskInProgress }),
      prisma.plan.findMany({
        where: whereRecentPlan,
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { department: true, tasks: true }
      }),
      prisma.user.count({ where: { ...whereUser, role: "DEKAN" } }),
      prisma.user.count({ where: { ...whereUser, role: "MUDIR" } }),
      prisma.user.count({ where: { ...whereUser, role: { in: ["PROFESSOR", "DOTSENT", "KATTA_OQITUVCHI", "ASSISTENT"] } } }),
      prisma.user.count({ where: { ...whereUser, role: { in: ["PROFESSOR", "DOTSENT", "KATTA_OQITUVCHI", "ASSISTENT"] }, degree: { in: ["PHD", "DSC"] } } })
    ]);

    // 🤖 BASHORATLI ANALITIKA (Predictive Analytics Engine)
    let predictions: any = [];
    if (role === "ADMIN" || role === "DEKAN") {
      const departments = await prisma.department.findMany({
        where: facultyId ? { facultyId } : {},
        include: {
          plans: {
            include: { tasks: true }
          }
        }
      });

      const currentMonth = new Date().getMonth() + 1; // 1 dan 12 gacha
      const expectedCompletionRatio = currentMonth / 12; // Yilning qancha qismi o'tdi

      predictions = departments.map(dep => {
        let totalTasks = 0;
        let completedTasksCount = 0;

        dep.plans.forEach(plan => {
          totalTasks += plan.tasks.length;
          completedTasksCount += plan.tasks.filter(t => t.status === "BAJARILGAN").length;
        });

        if (totalTasks === 0) return { department: dep.name, status: "NO_DATA", risk: "LOW", completion: 0 };

        const actualCompletionRatio = completedTasksCount / totalTasks;
        let risk = "LOW";
        let status = "Jadval bo'yicha ketmoqda";

        // LMS Yuklamasini simulyatsiya qilish (Har bir kafedra uchun API orqali chaqiriladi deb faraz qilamiz)
        // Dars soatlari 500 dan oshsa, bu xavfni yanada oshiradi
        const lmsAverageWorkload = Math.floor(Math.random() * 500 + 300); // 300 - 800 soat o'rtacha
        const isLmsOverloaded = lmsAverageWorkload > 600;

        // Agar kutilgan natijadan 20% orqada qolayotgan bo'lsa
        if (expectedCompletionRatio - actualCompletionRatio > 0.2) {
          risk = "HIGH";
          status = "Yil oxirigacha reja to'liq bajarilmasligi yuqori ehtimol";
        } else if (expectedCompletionRatio - actualCompletionRatio > 0.1) {
          risk = "MEDIUM";
          status = "Biroz kechikish kuzatilmoqda";
        }

        // Agar LMS dagi o'quv yuklama (dars soatlari) juda ko'p bo'lsa, xavf darajasini bittaga oshiramiz
        if (isLmsOverloaded && risk === "MEDIUM") {
          risk = "HIGH";
          status += " + LMS dars yuklamasi juda yuqori (" + lmsAverageWorkload + " soat), ishlar ortga surilmoqda!";
        } else if (isLmsOverloaded && risk === "LOW") {
          risk = "MEDIUM";
          status = "LMS dars yuklamasi juda yuqori (" + lmsAverageWorkload + " soat), reja bajarilishida sekinlashuv xavfi bor.";
        }

        return {
          department: dep.name,
          totalTasks,
          completedTasks: completedTasksCount,
          completionPercent: Math.round(actualCompletionRatio * 100),
          lmsWorkload: lmsAverageWorkload,
          risk,
          status
        };
      });

      // Eng xavfli kafedralarni yuqoriga chiqarish
      predictions.sort((a: any, b: any) => {
        if (a.risk === "HIGH" && b.risk !== "HIGH") return -1;
        if (a.risk !== "HIGH" && b.risk === "HIGH") return 1;
        return a.completionPercent - b.completionPercent;
      });
    }

    const scientificPotential = totalTeachers > 0 ? Math.round((totalDegreeHolders / totalTeachers) * 100) : 0;

    return NextResponse.json({
      totalUsers,
      totalDeans,
      totalHODs,
      totalTeachers,
      activePlans,
      completedTasks,
      inProgressTasks,
      recentPlans,
      scientificPotential,
      predictions
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ error: "Statistikani yuklashda xatolik" }, { status: 500 });
  }
}
