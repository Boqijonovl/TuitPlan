import { NextResponse } from "next/server";

// SIMULATION: TUIT LMS / HEMIS Workload & Tasks Sync API
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "LMS ID talab qilinadi" }, { status: 400 });
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Simulate Workload (soat)
    // We randomly generate a high or normal workload to test the Analytics system
    const isHighWorkload = Math.random() > 0.6; 
    const workloadHours = isHighWorkload ? Math.floor(Math.random() * 400 + 700) : Math.floor(Math.random() * 200 + 300); // 700-1100 = high, 300-500 = normal

    // Simulate Completed LMS Duties (that should trigger Smart Sync)
    const completedLmsTasks = [
      { id: "lms_1", title: "Oraliq nazorat jurnallarini to'ldirish", completedAt: new Date().toISOString(), type: "NAZORAT" },
      { id: "lms_2", title: "Mustaqil ishlarni tekshirish", completedAt: new Date(Date.now() - 86400000).toISOString(), type: "MUSTAQIL_ISH" },
      { id: "lms_3", title: "Talabalar davomatini belgilash", completedAt: new Date().toISOString(), type: "DAVOMAT" }
    ];

    return NextResponse.json({
      success: true,
      data: {
        workloadStats: {
          totalHours: workloadHours,
          lectures: Math.floor(workloadHours * 0.4),
          practices: Math.floor(workloadHours * 0.6),
          status: isHighWorkload ? "OVERLOADED" : "NORMAL"
        },
        recentlyCompletedTasks: completedLmsTasks
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Mock LMS Sync error:", error);
    return NextResponse.json({ error: "LMS serveriga ulanishda xatolik" }, { status: 500 });
  }
}
