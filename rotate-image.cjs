const sharp = require('sharp');
const fs = require('fs');

async function rotateImage() {
  const inputPath = 'public/certificates/Yukanthan AI Olympics (Kalasalingam University).png';
  const outputPath = 'public/certificates/Yukanthan AI Olympics (Kalasalingam University).png';
  
  await sharp(inputPath)
    .rotate(-90)
    .toFile(outputPath + '.tmp');
  
  fs.renameSync(outputPath + '.tmp', outputPath);
  console.log('Rotated -90 degrees (anti-clockwise)');
}

rotateImage().catch(console.error);