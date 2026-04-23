import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// SIMULATION: TUIT LMS / HEMIS SSO Login API
export async function POST(request: Request) {
  try {
    const { login, password } = await request.json();

    // In a real LMS, this would send an HTTP request to https://lms.tuit.uz/api/login
    // Here we simulate checking against our own DB for convenience, 
    // but treat it as if LMS verified it.
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const user = await prisma.user.findUnique({
      where: { email: login }, // using email as JSHSHIR/login for simplicity
      include: { department: true }
    });

    if (!user) {
      return NextResponse.json({ error: "LMS tizimida bunday foydalanuvchi topilmadi" }, { status: 404 });
    }

    // Simulate password check (in real LMS, LMS does this)
    if (password !== "lms123" && password !== user.email) {
      return NextResponse.json({ error: "LMS Paroli noto'g'ri (Simulyatsiya paroli: lms123)" }, { status: 401 });
    }

    // Generate Mock LMS Token
    const mockLmsToken = "tuit_lms_" + Math.random().toString(36).substring(2) + Date.now();

    return NextResponse.json({
      success: true,
      message: "LMS orqali muvaffaqiyatli avtorizatsiya",
      token: mockLmsToken,
      userData: {
        id: user.id,
        name: user.name,
        role: user.role,
        facultyId: user.facultyId,
        departmentId: user.departmentId,
        lmsId: "LMS-" + Math.floor(Math.random() * 900000 + 100000)
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Mock LMS Login error:", error);
    return NextResponse.json({ error: "LMS serveriga ulanishda xatolik" }, { status: 500 });
  }
}
