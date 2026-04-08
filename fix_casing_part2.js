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
        'Ishni Boshlash': 'Ishni boshlash',
        'Yuklangan Hujjat': 'Yuklangan hujjat',
        'Ta Kiruvchi Kafedra': 'ta kiruvchi kafedra',
        'KPI Reyting': 'KPI reyting',
        "Ommaviy Qizil E'lon": "Ommaviy qizil e'lon",
        'Matnni Saqlash': 'Matnni saqlash',
        "Standart O'quv Yili Boshqaruvi": "Standart o'quv yili boshqaruvi",
        'Yilni Tasdiqlash': 'Yilni tasdiqlash',
        'Enterprise Tizim Olib qochishiga (Qulflash)': 'Enterprise tizim qulflash (Lock)',
        'Yangi Korporativ Rol': 'Yangi korporativ rol',
        'TA HUQUQ': 'ta huquq',
        'Rolni Tahrirlash': 'Rolni tahrirlash',
        "Yangi Rol Qo'shish": "Yangi rol qo'shish",
        'Kafedra Mudiri': 'Kafedra mudiri',
        'Fakultet Dekani': 'Fakultet dekani',
        'Umumiy Reja': 'Umumiy reja',
        'Super Admin paneli': 'Super admin paneli',
        "To'liq Tarix": "To'liq tarix",
        'Maxsus Boshqaruv': 'Maxsus boshqaruv',
        'Demografik tarqalish': 'Demografik tarqalish'
    };

    for (const [k, v] of Object.entries(rules)) {
        content = content.replace(new RegExp(k, 'g'), v);
    }

    if (content !== raw) {
        fs.writeFileSync(f, content, 'utf8');
        console.log(`Casing fixed part 2 in: ${f}`);
    }
});
