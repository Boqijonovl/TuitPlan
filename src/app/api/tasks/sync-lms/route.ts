import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createBlockchainLedger } from "@/lib/blockchain";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Foydalanuvchi ID si topilmadi" }, { status: 400 });
    }

    // 1. Fetch Mock LMS Data (Buni serverda localhost orqali chaqiramiz yoki to'g'ridan to'g'ri logika)
    // As in reality we would fetch https://lms.tuit.uz/api/sync?userId=...
    const lmsRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/mock-lms/sync?userId=${userId}`);
    const lmsData = await lmsRes.json();

    if (!lmsRes.ok) {
      throw new Error(lmsData.error || "LMS bilan aloqada xatolik");
    }

    const { recentlyCompletedTasks, workloadStats } = lmsData.data;

    // 2. O'qituvchining joriy BAJARILMAGAN vazifalarini topamiz
    const userTasks = await prisma.task.findMany({
      where: {
        status: { not: "BAJARILGAN" },
        plan: {
          department: {
            users: { some: { id: userId } }
          }
        }
      }
    });

    let autoCompletedCount = 0;

    // 3. Smart Mapping: LMS dagi ish nomlari bizning rejadagi qaysi ishlarga mos tushishini qidiramiz
    // Masalan: "Oraliq nazorat" kabi kalit so'zlarni qidiradi
    for (const lmsTask of recentlyCompletedTasks) {
      const matchingTask = userTasks.find(t => 
        t.title.toLowerCase().includes("oraliq") || 
        t.title.toLowerCase().includes("nazorat") ||
        t.title.toLowerCase().includes("davomat") ||
        t.title.toLowerCase().includes("mustaqil")
      );

      if (matchingTask) {
        // Avtomatik bajarildi deb belgilaymiz va LMS ma'lumotini saqlaymiz
        await prisma.task.update({
          where: { id: matchingTask.id },
          data: {
            status: "BAJARILGAN",
            note: `LMS Tizimidan avtomatik sinxronizatsiya qilindi. Yuklama ID: ${lmsTask.id}`
          }
        });

        // KPI Ball berish
        await prisma.user.update({
          where: { id: userId },
          data: { points: { increment: matchingTask.pointsReward || 10 } }
        });

        // Blockchain
        await createBlockchainLedger("KPI", userId, "POINTS_AWARDED_VIA_LMS", {
          taskId: matchingTask.id,
          taskTitle: matchingTask.title,
          lmsReference: lmsTask.id,
          rewardPoints: matchingTask.pointsReward || 10
        });

        autoCompletedCount++;
        // Ro'yxatdan olib tashlaymiz 2 marta bajarmaslik uchun
        userTasks.splice(userTasks.indexOf(matchingTask), 1);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sinxronizatsiya muvaffaqiyatli yakunlandi. ${autoCompletedCount} ta vazifa avtomatik yopildi!`,
      autoCompletedCount,
      workloadStats
    }, { status: 200 });

  } catch (error) {
    console.error("Smart Sync error:", error);
    return NextResponse.json({ error: "LMS dan ma'lumot olishda tizimli xatolik yuz berdi" }, { status: 500 });
  }
}
