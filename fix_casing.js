const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if(file.endsWith('.ts') || file.endsWith('.tsx')) {
               results.push(file);
            }
        }
    });
    return results;
}

const files = walk('src/app');
files.forEach(f => {
    let raw = fs.readFileSync(f, 'utf8');
    let content = raw;
    const rules = {
        'Global Sozlamalar': 'Global sozlamalar',
        'Strukturaviy Qulflash': 'Strukturaviy qulflash',
        'Ishchi Holati': 'Ishchi holati',
        'Tizim Holati': 'Tizim holati',
        'Akademik Yil': 'Akademik yil',
        'Yangi Akademik Yil': 'Yangi akademik yil',
        "Umumiy Tizim A'zolari": "Umumiy tizim a'zolari",
        'Umumiy Tizim': 'Umumiy tizim',
        'Tasdiqlangan Rejalar': 'Tasdiqlangan rejalar',
        'Bajarilgan Vazifalar': 'Bajarilgan vazifalar',
        'Demografik Tarqalish': 'Demografik tarqalish',
        'Serverdagi Aktiv Faollik': 'Serverdagi aktiv faollik',
        'Terminal Jurnali': 'Terminal jurnali',
        'Tizim Tarixiga': 'Tizim tarixiga',
        "O'tish": "O'tish",
        'Fayllar Arxivi': 'Fayllar arxivi',
        'Yangi Maxsus Rol': 'Yangi maxsus rol',
        'Rollar Va Huquqlar': 'Rollar va huquqlar',
        'Boshqaruv Paneli': 'Boshqaruv paneli',
        'Kafedra Mudirlari': 'Kafedra mudirlari',
        'Yangi Fakultet': 'Yangi fakultet',
        "Jonli Efir": "Jonli efir",
        "Jonli Rejim": "Jonli rejim",
        "Oxirgi Harakatlar": "Oxirgi harakatlar",
        "O'tgan Yillar Arxivi": "O'tgan yillar arxivi",
        "Yillik Rejalar": "Yillik rejalar",
        "O'tgan Yillar": "O'tgan yillar",
        "Monitoring Paneli": "Monitoring paneli",
        "Barcha Foydalanuvchilar": "Barcha foydalanuvchilar",
        "Foydalanuvchilar Boshqaruvi": "Foydalanuvchilar boshqaruvi",
        "Xodim Qo'shish": "Xodim qo'shish",
        "Yangi Xodim": "Yangi xodim",
        "Kafedra Qo'shish": "Kafedra qo'shish",
        "Tizimga Kirish": "Tizimga kirish"
    };

    for (const [k, v] of Object.entries(rules)) {
        content = content.replace(new RegExp(k, 'g'), v);
    }
    
    content = content.replace(/>([A-Z][a-z]+)\s+([A-Z][a-z]+)</g, (match, p1, p2) => {
        return `>${p1} ${p2.toLowerCase()}<`;
    });
    
    content = content.replace(/>([A-Z][a-z]+)\s+([A-Z][a-z]+)\s+([A-Z][a-z]+)</g, (match, p1, p2, p3) => {
        return `>${p1} ${p2.toLowerCase()} ${p3.toLowerCase()}<`;
    });

    if (content !== raw) {
        fs.writeFileSync(f, content, 'utf8');
        console.log(`Casing fixed in: ${f}`);
    }
});
