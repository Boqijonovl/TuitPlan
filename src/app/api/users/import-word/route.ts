import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import mammoth from "mammoth";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const facultyId = formData.get("facultyId") as string;
    const departmentId = formData.get("departmentId") as string;

    if (!file || !facultyId || !departmentId) {
      return NextResponse.json({ error: "Fayl topilmadi yoki kafedra tanlanmadi!" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Mammoth orqali word fayldagi sof matnlarni o'qib olish
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value || "";

    // Matnni qatorlarga ajratish (faqat uzun qatorlar - ism/familiya bo'lishi ehtimoli yuqorilar)
    const lines = text.split('\n').filter(line => line.trim().length > 3);
    const usersToCreate: any[] = [];

    // Barcha ma'lum email larni xavfsizlik (duplikatlarning oldini olish) uchun tayyorlash
    const existingUsers = await prisma.user.findMany({ select: { email: true } });
    const emailSet = new Set(existingUsers.map(u => u.email));

    // Foydalanuvchi so'raganidek faqat Familiyasini shablon qilib elektron email yasaydigan generator
    const generateEmail = (lastName: string, firstName: string) => {
        let base = lastName.toLowerCase().replace(/[^a-z]/g, '');
        if (!base) base = "xodim"; // Agar ism ruschada klaviaturada yoki maxsus simvolda bo'lsa
        const fallback = firstName.toLowerCase().replace(/[^a-z]/g, '') || "ism";
        if (base === "xodim") base = fallback;

        let email = `${base}@tuit.uz`;
        let counter = 1;
        while (emailSet.has(email) || usersToCreate.some(u => u.email === email)) {
            email = `${base}${counter}@tuit.uz`;
            counter++;
        }
        return email;
    };

    const passwordHash = await bcrypt.hash("123456", 10);

    for (const line of lines) {
       // Qatorlarni so'zlar bo'yicha ajratamiz (probellar)
       const words = line.trim().split(/\s+/);
       if (words.length < 2) continue; // Agar bitta so'z bo'lsa xodim emas deb o'ylaymiz

       const lastName = words[0];
       const firstName = words[1];
       const roleDescription = words.slice(2).join(" ").toLowerCase();

       let role = "TEACHER"; // Default
       if (roleDescription.includes("mudir")) role = "HOD";
       else if (roleDescription.includes("dekan")) role = "DEAN";
       
       const email = generateEmail(lastName, firstName);
       const name = `${lastName} ${firstName}`;

       usersToCreate.push({
          name,
          email,
          password: passwordHash,
          role,
          facultyId,
          departmentId
       });
    }

    if (usersToCreate.length === 0) {
       return NextResponse.json({ error: "Hujjatdan Ism Familiyalar taniy olmadim. To'g'ri Word fayl yuklang." }, { status: 400 });
    }

    // Yaratish - Prisma qisqa API
    const created = await prisma.user.createMany({
       data: usersToCreate,
       skipDuplicates: true
    });

    return NextResponse.json({ message: `${created.count} ta kadr muvaffaqiyatli Word dan import qilindi!` }, { status: 200 });

  } catch (error: any) {
    console.error("Word import error:", error);
    return NextResponse.json({ error: error.message || "Faylni tekshirishda xato yuz berdi" }, { status: 500 });
  }
}
