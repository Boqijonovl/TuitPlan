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
        'hodim': 'xodim', 'Hodim': 'Xodim',
        'hatolik': 'xatolik', 'Hatolik': 'Xatolik',
        'hato': 'xato', 'Hato': 'Xato',
        'malumot': "ma'lumot", 'Malumot': "Ma'lumot",
        'qoshish': "qo'shish", 'Qoshish': "Qo'shish",
        'qoshildi': "qo'shildi", 'Qoshildi': "Qo'shildi",
        'ochirish': "o'chirish", 'Ochirish': "O'chirish",
        'ochirildi': "o'chirildi", 'Ochirildi': "O'chirildi",
        'xafsizlik': 'xavfsizlik', 'Xafsizlik': 'Xavfsizlik',
        'kiritsh': 'kiritish', 'yeki': 'yoki',
        'hujat': 'hujjat', 'Hujat': 'Hujjat',
        'togirlash': "to'g'irlash", 'Togirlash': "To'g'irlash",
        'tasdiqlamad': "tasdiqlamadi",
        'fayill': 'fayll', 'Fayill': 'Fayll'
    };
    for (const [k, v] of Object.entries(rules)) {
        content = content.replace(new RegExp('\\b' + k + '\\b', 'g'), v); // \b applies word boundary to protect sub-words like 'whatever' if any english is present
        // Wait, \b might not trigger perfectly for words followed by apostrophe, but for our simple mistypes it's perfect.
        // Let's also do a raw replace without word boundary for common suffixes.
        content = content.replace(new RegExp(k, 'g'), v);
    }
    if (content !== raw) {
        fs.writeFileSync(f, content, 'utf8');
        console.log(`Fixed in: ${f}`);
    }
});
