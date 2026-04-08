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
        'Rollar va Huquqlar \\(RBAC\\)': 'Rollar va huquqlar (RBAC)',
        'Admin Monitoring paneli': 'Admin monitoring paneli',
        'Xavfsizlik Jurnali': 'Xavfsizlik jurnali',
        'Admin Monitoring': 'Admin monitoring',
        'Rollar va Huquqlar': 'Rollar va huquqlar'
    };

    for (const [k, v] of Object.entries(rules)) {
        content = content.replace(new RegExp(k, 'g'), v);
    }

    if (content !== raw) {
        fs.writeFileSync(f, content, 'utf8');
        console.log(`Casing fixed part 3 in: ${f}`);
    }
});
