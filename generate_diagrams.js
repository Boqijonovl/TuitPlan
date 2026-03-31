const fs = require('fs');
const zlib = require('zlib');

function createKrokiUrl(code) {
  const data = Buffer.from(code, 'utf8');
  const compressed = zlib.deflateSync(data);
  const base64 = compressed.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
  return `https://kroki.io/mermaid/png/${base64}`;
}

const flowchartCode = `flowchart TD
    Start([Boshlanishi]) --> LoginPoint{Login qismi}
    LoginPoint -- xato --> ErrorMsg([Xatolik haqida xabar])
    ErrorMsg -.-> LoginPoint
    LoginPoint -- Togri --> Dashboard[Dashboard Bosh sahifa]
    Dashboard --> RoleCheck{Rolni tekshirish}
    RoleCheck -- Mudir yoki Dekan --> CreateTask[Yangi Vazifa yaratish]
    CreateTask --> Assing[Vazifa muddat bilan oqituvchiga biriktirildi]
    Assing --> WaitTeacher([Kutish rejimiga otdi])
    RoleCheck -- Oqituvchi --> ViewTasks[Vazifalar oynasiga kirish]
    WaitTeacher -.-> ViewTasks
    ViewTasks --> UploadFile[Hisobot faylini tanlash va yuklash]
    UploadFile --> SendReq[Rahbar tasdigiga yuborildi]
    SendReq --> Verifier{Mudir tekshiruvi qoniqarlimi?}
    Verifier -- Rad etish --> Rejected[Vazifa izoh bilan qaytarildi]
    Rejected -.-> UploadFile
    Verifier -- Qo'shilish --> Success[Vazifa tasdiqlandi]
    Success --> KPI[Xodim hisobiga KPI Ball urildi]
    KPI --> End([Tugallandi])`;

const erdCode = `erDiagram
    FACULTY {
        string id PK
        string name
        boolean isDeleted
    }
    DEPARTMENT {
        string id PK
        string name
        string facultyId FK
    }
    USER {
        string id PK
        string role
        string departmentId FK
        string facultyId FK
    }
    PLAN {
        string id PK
        string status
        string departmentId FK
    }
    TASK {
        string id PK
        string status
        string planId FK
        string userId FK
    }
    FACULTY ||--o{ DEPARTMENT : "contains 1:N"
    FACULTY ||--o{ USER : "employs 1:N"
    DEPARTMENT ||--o{ USER : "staff 1:N"
    DEPARTMENT ||--o{ PLAN : "documents 1:N"
    PLAN ||--o{ TASK : "tasks 1:N"
    USER ||--o{ TASK : "assigned 1:N"`;

const useCaseCode = `flowchart LR
    Admin([Bosh Admin])
    Dean([Dekan])
    Hod([Kafedra Mudiri])
    Teacher([Oqituvchi])
    Chat(Yashirin Chat)
    UC1(Rol yaratish yohud uzgartirish)
    UC2(Admin Tahlil Jurnali)
    UC3(Rejani Tasdiqlash yohud Rad etish)
    UC4(Xodimlarni boshqaruv markazi)
    UC5(Faoliyat rejasini ishlab chiqish)
    UC6(Xodimga yopiq dars yoki vazifa yuklash)
    UC7(Topshiriq hisobot faylini biriktirish)
    UC8(KPI Ballarini jamlanmasini yigish)
    
    Admin -.-> UC1
    Admin -.-> UC2
    Admin -.-> Chat
    Dean -.-> UC3
    Dean -.-> UC4
    Dean -.-> Chat
    Hod -.-> UC5
    Hod -.-> UC6
    Hod -.-> UC4
    Hod -.-> Chat
    Teacher -.-> UC7
    Teacher -.-> UC8
    Teacher -.-> Chat`;

const htmlContent = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: "Times New Roman", serif; font-size: 14pt; line-height: 1.5; padding: 20px; }
    h1 { font-size: 18pt; text-align: center; font-weight: bold; }
    h2 { font-size: 16pt; font-weight: bold; margin-top: 20px; text-decoration: underline; }
    p { text-align: justify; }
    img { max-width: 100%; height: auto; display: block; margin: 10px auto; }
  </style>
</head>
<body>
  <h1>TUIT Enterprise System: Algoritm va Chizmalar Mantiqiy Qatlamlari</h1>
  
  <h2>1. Tizim Algoritmlar Sxemasi (Flowchart)</h2>
  <p>Quyidagi chizmada Tizimning umumiy xodim tomonidan ishlatilish hayotiy davri hamda Topshiriqning qanday aylanib tasdiqlanishgacha borishi algoritmi keltirilgan:</p>
  <img src="${createKrokiUrl(flowchartCode)}" alt="Flowchart"/>
  
  <h2>2. Ma'lumotlar Bazasi Modeli (ERD Diagramma)</h2>
  <p>Ushbu chizma yordamida Fakultet, Kafedra va Foydalanuvchi jadvallarining vazifa (TasK) lari orasida qanday qilib tashqi (FK - Foreign Key) hamda birlamchi kalit (PK - Primary) bog'lamlari mavjudligi tasvirlangan.</p>
  <img src="${createKrokiUrl(erdCode)}" alt="ERD Diagram"/>
  
  <h2>3. UML Use Case Lentalari (Rollar Tizimi)</h2>
  <p>Loyiha o'z ichiga oladigan yopiq himoya - RBAC modeli chizmasi. Ya'ni qaysi mansab vakili qay turdagi yopiq funksiyallikka to'g'ridan to'g'ri ta'sir ko'rsata olishi UML yo'lagi orqali markazlashtirildi.</p>
  <img src="${createKrokiUrl(useCaseCode)}" alt="Use Case Diagram"/>

  <br/><br/><br/>
  <p style="text-align: right;"><b>Himoyachi Imzosi: _____________________</b></p>
</body>
</html>
`;

fs.writeFileSync('TUIT_Plan_Diplom_Diagrammalari.doc', htmlContent, 'utf8');
console.log('Word file generated successfully with embedded dynamic images.');
