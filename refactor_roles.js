const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..', 'c:', 'Users', 'hp', 'Desktop', '2 varyant', 'edu-plan');
// Given absolute paths are better
const targetDirs = [
  'c:\\Users\\hp\\Desktop\\2 varyant\\edu-plan\\src',
  'c:\\Users\\hp\\Desktop\\2 varyant\\edu-plan\\prisma'
];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace exact bounded words
  content = content.replace(/\bDEAN\b/g, 'DEKAN');
  content = content.replace(/\bHOD\b/g, 'MUDIR');
  content = content.replace(/\bTEACHER\b/g, 'OQITUVCHI');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else {
      if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.prisma')) {
        replaceInFile(fullPath);
      }
    }
  }
}

targetDirs.forEach(processDirectory);
console.log("Refactoring complete.");
