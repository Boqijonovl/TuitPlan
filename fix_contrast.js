const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      if (content.includes('text-slate-400')) {
        content = content.replace(/text-slate-400/g, 'text-slate-500');
        changed = true;
      }
      
      if (content.includes('text-slate-300')) {
        content = content.replace(/text-slate-300/g, 'text-slate-400');
        changed = true;
      }
      
      if (content.includes('text-gray-400')) {
        content = content.replace(/text-gray-400/g, 'text-gray-500');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceInDir('./src');
console.log("Contrast fixes applied.");
