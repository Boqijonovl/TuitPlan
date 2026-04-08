import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    const facultyId = searchParams.get("facultyId");
    const admin = searchParams.get("admin");

    let whereClause: any = { isDeleted: false };
    let docTitle = "Xodimlar Ro'yxati";

    if (admin === "true") {
       whereClause.role = "ADMIN";
       docTitle = "Tizim Administratorlari Ro'yxati";
    } else if (departmentId) {
       whereClause.departmentId = departmentId;
       const dept = await prisma.department.findUnique({ where: { id: departmentId } });
       if (dept) docTitle = `${dept.name} xodimlari ro'yxati`;
    } else if (facultyId) {
       whereClause.facultyId = facultyId;
       const fac = await prisma.faculty.findUnique({ where: { id: facultyId } });
       if (fac) docTitle = `${fac.name} ro'yxati`;
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' }
    });

    // Har bir xodimni parolini asli (default) ekanigiga tekshirib formatlaymiz
    const outputRows = await Promise.all(users.map(async (u, index) => {
        const isDefault = await bcrypt.compare("123456", u.password);
        const passText = isDefault ? "123456" : "Shifrlangan (O'zgargan)";
        
        let roleUz = "O'qituvchi";
        if (u.role === "ADMIN") roleUz = "Tizim Admini";
        if (u.role === "DEKAN") roleUz = "Dekan";
        if (u.role === "MUDIR") roleUz = "Kafedra mudiri";

        return `
            <tr>
                <td style="border: 1px solid black; padding: 8px;">${index + 1}</td>
                <td style="border: 1px solid black; padding: 8px;"><b>${u.name}</b></td>
                <td style="border: 1px solid black; padding: 8px;">${roleUz}</td>
                <td style="border: 1px solid black; padding: 8px;">${u.email}</td>
                <td style="border: 1px solid black; padding: 8px; color: ${isDefault ? 'black' : 'red'};">${passText}</td>
            </tr>
        `;
    }));

    // Boshlang'ich MS Word formatida HTML hujjatini teramiz
    const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
            <meta charset="utf-8">
            <title>${docTitle}</title>
            <style>
                body { font-family: 'Times New Roman', serif; }
                table { border-collapse: collapse; width: 100%; margin-top: 20px; }
                th { background-color: #f2f2f2; font-weight: bold; border: 1px solid black; padding: 10px; text-align: left; }
                h2 { text-align: center; color: #333; }
            </style>
        </head>
        <body>
            <h2>${docTitle}</h2>
            <table>
                <thead>
                    <tr>
                        <th width="5%">T/R</th>
                        <th width="30%">Ism familiyasi</th>
                        <th width="15%">Lavozimi (Roli)</th>
                        <th width="25%">Logini (Pochta)</th>
                        <th width="25%">Paroli</th>
                    </tr>
                </thead>
                <tbody>
                    ${outputRows.join("")}
                </tbody>
            </table>
            <br/><br/>
            <p><i>Ushbu hujjat tizim tomonidan avtomatik generatsiya qilindi.</i></p>
        </body>
        </html>
    `;

    // Word Doc kabi o'qilishini Header da majburlaymiz
    const headers = new Headers();
    headers.set("Content-Type", "application/vnd.ms-word; charset=utf-8");
    headers.set("Content-Disposition", `attachment; filename="Xodimlar_Royxati.doc"`);

    return new NextResponse(htmlContent, {
      status: 200,
      headers
    });

  } catch (error: any) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Eksport qilishda xatolik yuz berdi" }, { status: 500 });
  }
}
