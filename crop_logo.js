const sharp = require('sharp');
const path = require('path');

const inputPath = path.join(__dirname, 'public', 'logo1.png');
const outputPath = path.join(__dirname, 'public', 'logo1_cropped.png');

sharp(inputPath)
  .trim()
  .toFile(outputPath)
  .then(info => {
    console.log("Muvaffaqiyatli qirqildi! Yangi piksellar hajmi:", info.width, "x", info.height);
  })
  .catch(err => {
    console.error("Qirqishda xatolik:", err);
  });
