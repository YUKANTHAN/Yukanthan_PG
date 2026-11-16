const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function rotateCerts() {
  const certDir = 'public/certificates';
  
  // First 9 certificates to rotate (IDs 34-42), excluding the last one (ZYNEX 2K26 Paper Presentation)
  const filesToRotate = [
    'Yukanthan B-Plan Competition (Francis Xavier Engineering College).jpg',
    'Yukanthan Dream2Reality Idea Competition (PSR Engineering College).jpg',
    'Yukanthan INFOVATE 2026 Paper Presentation (JP College of Engineering).jpg',
    'Yukanthan INFOVATE 2026 Participation (JP College of Engineering).jpg',
    'Yukanthan NEC Tech Fest Code Relay (National Engineering College).jpg',
    'Yukanthan NEC Tech Fest Dig the Bug (National Engineering College).jpg',
    'Yukanthan Nzevotrix 24 Clueless Code (PSR Engineering College).jpg',
    'Yukanthan SCIMIT 26 Mega Project (Manakula Vinayagar Institute of Technology).jpg',
    'Yukanthan ZYNEX 2K26 Check Mate (SVeerasamy Chettiar College).jpg',
  ];
  
  for (const filename of filesToRotate) {
    const inputPath = path.join(certDir, filename);
    const tempPath = inputPath + '.tmp';
    
    try {
      await sharp(inputPath)
        .rotate(90)  // clockwise 90 degrees
        .toFile(tempPath);
      
      // Replace original with rotated version
      fs.renameSync(tempPath, inputPath);
      console.log(`Rotated: ${filename}`);
    } catch (err) {
      console.error(`Failed to rotate ${filename}:`, err.message);
    }
  }
  
  console.log('Done! Skipped: Yukanthan ZYNEX 2K26 Paper Presentation (SVeerasamy Chettiar College).jpg');
}

rotateCerts().catch(console.error);