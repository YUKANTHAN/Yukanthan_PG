const pdfParse = require('pdf-parse/dist/pdf-parse/cjs/index.cjs');
const fs = require('fs');

async function readPdf() {
  const pdfBytes = fs.readFileSync('public/certificates/symbo-yukanthan.pdf');
  const data = await pdfParse(pdfBytes);
  console.log(data.text);
}

readPdf().catch(console.error);