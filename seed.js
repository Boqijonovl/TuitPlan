const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eduplan.uz' },
    update: {},
    create: {
      name: 'Asosiy Administrator',
      email: 'admin@eduplan.uz',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin yaratildi:', admin.email);

  // Fakultet va kafedra (Dekanat) yaratish
  const faculty = await prisma.faculty.create({
    data: {
      name: 'AKT sohasida kasb ta’limi',
      departments: {
        create: [
          { name: 'Fakultet Dekanati' }
        ]
      }
    },
    include: {
      departments: true
    }
  });

  const dekanat = faculty.departments[0];
  console.log('Fakultet va dekanat yaratildi:', faculty.name);

  // Reja va vazifalar yaratish
  const plan = await prisma.plan.create({
    data: {
      title: 'AKT sohasida kasb ta’limi fakulteti dekanatining 2024-2025 o‘quv yili uchun ISH REJASI',
      year: 2024,
      status: 'APPROVED',
      departmentId: dekanat.id,
      tasks: {
        create: [
          { title: "AKT sohasida kasb ta’limi fakultetining 2024-2025 o‘quv yili uchun ish rejasini tasdiqlash", timeframe: "2024-yil, avgust", status: "BAJARILMAGAN" },
          { title: "Kafedralarining 2024-2025 o‘quv yiliga o‘quv-meyoriy hujjatlarini tasdiqlash", timeframe: "2024-yil, avgust", status: "BAJARILMAGAN" },
          { title: "Talabalarning kursdan-kurs o‘tkazish va kursda qoldirish buyruq loyihalarini shaklantirish va imzolashga kiritish", timeframe: "2024-yil, avgust", status: "BAJARILMAGAN" },
          { title: "1-kurs talabalarning tanishuv uchrashuvini tashkil etish va universitet ustavi va ichki-tartib qoidalarini tanishtirish", timeframe: "2024-yil, sentabr", status: "BAJARILMAGAN" },
          { title: "Talabalarni shaxsiy varaqalarini shakllantirish", timeframe: "2024-yil, sentabr", status: "BAJARILMAGAN" },
          { title: "Talabalar kontengenti to‘g‘risida to‘liq ma’lumotlar ro‘yxatini shakllantirish (kurslar bo‘yicha)", timeframe: "2024-2025 o’quv yili davomida", status: "BAJARILMAGAN" },
          { title: "Talabalarga stipendiya tayinlash bo‘yicha buyruq loyihalarini tayyorlash", timeframe: "O‘quv yili davomida", status: "BAJARILMAGAN" },
          { title: "Fakultetda va talabalar turar joylarida va ijarada yashovchi talabalar uylariga tashrif buyurish", timeframe: "Reja asosida", status: "BAJARILMAGAN" },
          { title: "Yakuniy nazoratlarga tayorgarlik ko‘rish va nazorat qilish", timeframe: "2024-yil, dekabr 2025-yil yanvar", status: "BAJARILMAGAN" },
          { title: "Universitet ma’naviy-ma’rifiy va boshqa tadbirlarida fakultet talabalarining ishtirokini ta’minlash", timeframe: "O‘quv yili davomida", status: "BAJARILMAGAN" },
          { title: "Fakultet bo‘yicha buyruq loyihalarini tayyorlash va farmoyishlar chiqarish", timeframe: "O‘quv yili davomida", status: "BAJARILMAGAN" },
          { title: "Talabalarning davomatini nazorat qilib borish, dars qoldirayotgan talabalarning ota-onalari bilan muloqot o‘rnatish va farzandlarining davomati va o‘zlashtirishi xususida ma’lumot berish, tushuntirish xatlari olish", timeframe: "O‘quv yili davomida", status: "BAJARILMAGAN" },
          { title: "Talabalarning davomati hamda qarzdor talabalar haqida fakultet ilmiy-uslubiy kengashida hisobot berish", timeframe: "Ilmiy kengash rejasi asosida", status: "BAJARILMAGAN" },
          { title: "Talabalarni bitiruv malakaviy ishlarini himoya qilishga ruxsat berish farmoyish loyihasini tayyorlash va rasmiylashtirish", timeframe: "2025-yil, may, iyun", status: "BAJARILMAGAN" },
          { title: "Bitiruv malakaviy ishlari himoyalari natijalari bo‘yicha hisobotni tayyorlash va o‘quv –uslubiy boshqarmasiga taqdim qilish", timeframe: "2025-yil, iyun", status: "BAJARILMAGAN" },
          { title: "Yakuniy nazoratlarga tayorgarlik ko‘rish va nazorat qilish", timeframe: "2025-yil iyun", status: "BAJARILMAGAN" },
          { title: "Fakultetning 2024-2025 o‘quv yilidagi faoliyati bo‘yicha yillik hisobotni tayorlash", timeframe: "2025-yil, avgust", status: "BAJARILMAGAN" }
        ]
      }
    }
  });
  console.log('Reja va 17 ta vazifa yaratildi:', plan.title);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
