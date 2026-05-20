import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const dekanEmail = "igamberdiev@tuit.uz";
  
  // 1. Find the Dekan
  const user = await prisma.user.findUnique({ 
    where: { email: dekanEmail }
  });
  
  if (!user) {
    console.error("XATOLIK: Bunday email (igamberdiev@tuit.uz) tizimda topilmadi!");
    return;
  }

  console.log(`Dekan topildi: ${user.name}`);

  // 2. Define the tasks
  const tasksData = [
    { title: "AKT sohasida kasb ta’limi fakultetining 2024-2025 o‘quv yili uchun ish rejasini tasdiqlash", timeframe: "2024-yil, avgust" },
    { title: "Kafedralarining 2024-2025 o‘quv yiliga o‘quv-meyoriy hujjatlarini tasdiqlash", timeframe: "2024-yil, avgust" },
    { title: "Talabalarning kursdan-kurs o‘tkazish va kursda qoldirish buyruq loyihalarini shaklantirish va imzolashga kiritish", timeframe: "2024-yil, avgust" },
    { title: "1-kurs talabalarning tanishuv uchrashuvini tashkil etish va universitet ustavi va ichki-tartib qoidalarini tanishtirish", timeframe: "2024-yil, sentabr" },
    { title: "Talabalarni shaxsiy varaqalarini shakllantirish", timeframe: "2024-yil, sentabr" },
    { title: "Talabalar kontengenti to‘g‘risida to‘liq ma’lumotlar ro‘yxatini shakllantirish (kurslar bo‘yicha)", timeframe: "2024-2025 o’quv yili davomida" },
    { title: "Talabalarga stipendiya tayinlash bo‘yicha buyruq loyihalarini tayyorlash", timeframe: "O‘quv yili davomida" },
    { title: "Fakultetda va talabalar turar joylarida va ijarada yashovchi talabalar uylariga tashrif buyurish", timeframe: "Reja asosida" },
    { title: "Yakuniy nazoratlarga tayorgarlik ko‘rish va nazorat qilish", timeframe: "2024-yil, dekabr 2025-yil yanvar" },
    { title: "Universitet ma’naviy-ma’rifiy va boshqa tadbirlarida fakultet talabalarining ishtirokini ta’minlash", timeframe: "O‘quv yili davomida" },
    { title: "Fakultet bo‘yicha buyruq loyihalarini tayyorlash va farmoyishlar chiqarish", timeframe: "O‘quv yili davomida" },
    { title: "Talabalarning davomatini nazorat qilib borish, dars qoldirayotgan talabalarning ota-onalari bilan muloqot o‘rnatish va farzandlarining davomati va o‘zlashtirishi xususida ma’lumot berish, tushuntirish xatlari olish", timeframe: "O‘quv yili davomida" },
    { title: "Talabalarning davomati hamda qarzdor talabalar haqida fakultet ilmiy-uslubiy kengashida hisobot berish", timeframe: "Ilmiy kengash rejasi asosida" },
    { title: "Talabalarni bitiruv malakaviy ishlarini himoya qilishga ruxsat berish farmoyish loyihasini tayyorlash va rasmiylashtirish", timeframe: "2025-yil, may, iyun" },
    { title: "Bitiruv malakaviy ishlari himoyalari natijalari bo‘yicha hisobotni tayyorlash va o‘quv –uslubiy boshqarmasiga taqdim qilish", timeframe: "2025-yil, iyun" },
    { title: "Yakuniy nazoratlarga tayorgarlik ko‘rish va nazorat qilish", timeframe: "2025-yil iyun" },
    { title: "Fakultetning 2024-2025 o‘quv yilidagi faoliyati bo‘yicha yillik hisobotni tayorlash", timeframe: "2025-yil, avgust" },
  ];

  // 3. Create Plan with nested Tasks
  const plan = await prisma.plan.create({
    data: {
      title: "AKT sohasida kasb ta'limi fakulteti yillik rejasi (2024-2025)",
      year: 2024,
      status: "APPROVED",
      userId: user.id,
      facultyId: user.facultyId,
      departmentId: null, // Yagona kafedraga emas, butun fakultetga tegishli
      tasks: {
        create: tasksData.map(t => ({
          title: t.title,
          timeframe: t.timeframe,
          status: "BAJARILMAGAN",
          assignedRole: "MUDIR", // Barcha Kafedra Mudirlari uchun qaratilgan!
          pointsReward: 15
        }))
      }
    }
  });

  console.log(`Muvaffaqiyatli saqlandi! Reja ID: ${plan.id}`);
  console.log(`Jami ${tasksData.length} ta vazifa qo'shildi.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
