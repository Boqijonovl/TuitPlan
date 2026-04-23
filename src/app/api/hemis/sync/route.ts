import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { token, hemisUrl } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "HEMIS integratsiyasi uchun API Token kiritilmagan!" }, { status: 400 });
    }

    // Bu yerda aslida universitetning HEMIS tizimiga so'rov yuboriladi:
    // const res = await fetch(`${hemisUrl}/api/v1/employees`, { headers: { 'Authorization': `Bearer ${token}` }})
    // const employees = await res.json();
    
    // Simulyatsiya (Mock data): Async kabi kutish va bazaga yozish
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockHemisEmployees = [
      { name: "Aliev Vali", email: "vali.aliev@hemis.uz", role: "DOTSENT" },
      { name: "Qodirova Nargiza", email: "n.qodirova@hemis.uz", role: "ASSISTENT" },
      { name: "Rustamov Jasur", email: "j.rustamov@hemis.uz", role: "MUDIR" }
    ];

    let addedCount = 0;
    for (const emp of mockHemisEmployees) {
      const exists = await prisma.user.findUnique({ where: { email: emp.email } });
      if (!exists) {
        await prisma.user.create({
          data: {
            name: emp.name,
            email: emp.email,
            password: await bcrypt.hash("hemis123", 10),
            role: emp.role
          }
        });
        addedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `HEMIS tarmog'i bilan muvaffaqiyatli sinxronlandi. ${addedCount} ta yangi foydalanuvchi tizimga qo'shildi.` 
    }, { status: 200 });

  } catch (error) {
    console.error("HEMIS Sync Error:", error);
    return NextResponse.json({ error: "Sinxronlashda noma'lum xatolik yuz berdi" }, { status: 500 });
  }
}
