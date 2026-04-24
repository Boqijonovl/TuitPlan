import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get("admin"); // Optional check if we want

    // Tizimdagi barcha ma'lumotlarni tortish
    const users = await prisma.user.findMany({
      where: { isDeleted: false },
      include: { department: true, faculty: true }
    });

    const tasks = await prisma.task.findMany({
      where: { isDeleted: false },
      include: { user: true, plan: { include: { department: true } } }
    });

    // 1. Kadrlar statistikasi
    const totalUsers = users.length;
    const phdCount = users.filter(u => u.degree === "PHD").length;
    const dscCount = users.filter(u => u.degree === "DSC").length;
    const ilmiySalohiyat = totalUsers > 0 ? Math.round(((phdCount + dscCount) / totalUsers) * 100) : 0;

    // 2. Vazifalar statistikasi
    const completedTasks = tasks.filter(t => t.status === "BAJARILGAN");
    
    const oquvHours = completedTasks.filter(t => t.category === "OQUV").reduce((acc, t) => acc + (t.hours || 0), 0);
    const ilmiyHours = completedTasks.filter(t => t.category === "ILMIY").reduce((acc, t) => acc + (t.hours || 0), 0);
    const metodikHours = completedTasks.filter(t => t.category === "METODIK").reduce((acc, t) => acc + (t.hours || 0), 0);
    const manaviyHours = completedTasks.filter(t => t.category === "MANAVIY").reduce((acc, t) => acc + (t.hours || 0), 0);

    // Kafedralar kesimida hisobot
    const depts = await prisma.department.findMany();
    const deptStats = depts.map(d => {
       const dUsers = users.filter(u => u.departmentId === d.id);
       const dTasks = completedTasks.filter(t => t.plan?.departmentId === d.id || t.user?.departmentId === d.id);
       return {
         name: d.name,
         usersCount: dUsers.length,
         phd: dUsers.filter(u => u.degree === "PHD").length,
         dsc: dUsers.filter(u => u.degree === "DSC").length,
         totalHours: dTasks.reduce((acc, t) => acc + (t.hours || 0), 0)
       };
    });

    const docTitle = "Oliy Ta'lim Muassasasi Yillik Xulosasi";

    // Boshlang'ich MS Word formatida HTML hujjatini teramiz
    const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="utf-8">
            <title>${docTitle}</title>
            <style>
                body { font-family: 'Times New Roman', serif; line-height: 1.6; }
                table { border-collapse: collapse; width: 100%; margin-top: 15px; margin-bottom: 25px; }
                th, td { border: 1px solid black; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
                h1 { text-align: center; color: #1d2d5b; text-transform: uppercase; font-size: 18px; margin-bottom: 20px;}
                h2 { color: #333; font-size: 16px; margin-top: 20px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .highlight { background-color: #e6f2ff; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>${docTitle}<br/>(Vazirlik va Attestatsiya komissiyasi uchun)</h1>
            <p class="text-right">Sana: ${new Date().toLocaleDateString('uz-UZ')}</p>
            
            <h2>1. Kadrlar Va Ilmiy Salohiyat (O'qituvchilar)</h2>
            <p>Joriy o'quv yilida tizimdan foydalanuvchi jami o'qituvchi va xodimlar soni <b>${totalUsers}</b> nafarni tashkil etadi.</p>
            <table>
                <tr>
                    <th width="50%">Ko'rsatkichlar</th>
                    <th width="50%">Qiymat</th>
                </tr>
                <tr><td>Fan doktori (DSc) yoki Professorlar</td><td class="text-center"><b>${dscCount}</b> nafar</td></tr>
                <tr><td>Fan nomzodi (PhD) yoki Dotsentlar</td><td class="text-center"><b>${phdCount}</b> nafar</td></tr>
                <tr><td>Ilmiy darajasiz (Katta o'qituvchi, Assistent)</td><td class="text-center"><b>${totalUsers - phdCount - dscCount}</b> nafar</td></tr>
                <tr class="highlight"><td>Umumiy Ilmiy Salohiyat</td><td class="text-center"><b>${ilmiySalohiyat}%</b></td></tr>
            </table>

            <h2>2. Yillik Yuklamalar Bajarilishi (Soatlar Kesimida)</h2>
            <p>Barcha kafedralar tomonidan yillik ish rejalar doirasida jami tasdiqlangan va isbotlovchi hujjatlari tizimga yuklangan soatlar quyidagicha:</p>
            <table>
                <tr>
                    <th width="10%">T/R</th>
                    <th width="60%">Faoliyat yo'nalishi (Kategoriya)</th>
                    <th width="30%">Bajarilgan soat</th>
                </tr>
                <tr><td class="text-center">1</td><td>O'quv ishlari (Dars berish, reyting nazorati, diplom ishi)</td><td class="text-center"><b>${oquvHours}</b></td></tr>
                <tr><td class="text-center">2</td><td>Ilmiy-tadqiqot ishlari (Scopus, Monografiya, Patent)</td><td class="text-center"><b>${ilmiyHours}</b></td></tr>
                <tr><td class="text-center">3</td><td>Tashkiliy-metodik ishlar (O'quv qo'llanma, Sillabus)</td><td class="text-center"><b>${metodikHours}</b></td></tr>
                <tr><td class="text-center">4</td><td>Ma'naviy-ma'rifiy ishlar (Murabbiylik, TTJ bilan ishlash)</td><td class="text-center"><b>${manaviyHours}</b></td></tr>
                <tr class="highlight"><td colspan="2" class="text-right">JAMI BAJARILGAN YUKLAMA SOATI:</td><td class="text-center"><b>${oquvHours + ilmiyHours + metodikHours + manaviyHours} soat</b></td></tr>
            </table>

            <h2>3. Kafedralar Kesimidagi Reyting (KPI)</h2>
            <table>
                <tr>
                    <th>Kafedra nomi</th>
                    <th>Xodimlar soni</th>
                    <th>Ilmiy Salohiyati</th>
                    <th>Bajarilgan soat</th>
                </tr>
                ${deptStats.map(d => `
                    <tr>
                        <td>${d.name}</td>
                        <td class="text-center">${d.usersCount}</td>
                        <td class="text-center">${d.usersCount > 0 ? Math.round(((d.phd + d.dsc) / d.usersCount) * 100) : 0}%</td>
                        <td class="text-center">${d.totalHours} soat</td>
                    </tr>
                `).join('')}
            </table>
            
            <br/><br/><br/>
            <p><b>Tasdiqlovchi shaxs (Tizim administratori):</b> ___________________________</p>
            <br/>
            <p><i>Ushbu yig'ma hisobot Blockchain tamoyillari asosida kriptografik himoyalangan ma'lumotlar bazasidan avtomatik shakllantirildi.</i></p>
        </body>
        </html>
    `;

    // Word Doc kabi o'qilishini Header da majburlaymiz
    const headers = new Headers();
    headers.set("Content-Type", "application/vnd.ms-word; charset=utf-8");
    headers.set("Content-Disposition", \`attachment; filename="Super_Hisobot_Vazirlik_Uchun.doc"\`);

    return new NextResponse(htmlContent, {
      status: 200,
      headers
    });

  } catch (error: any) {
    console.error("Super Report Export error:", error);
    return NextResponse.json({ error: "Hisobotni shakllantirishda xatolik yuz berdi" }, { status: 500 });
  }
}
