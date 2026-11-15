const pdfParse = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function extractPage() {
  const pdfBytes = fs.readFileSync('public/certificates/symbo.pdf');
  
  const pdf = await PDFDocument.load(pdfBytes);
  const pageCount = pdf.getPageCount();
  
  console.log(`Total pages: ${pageCount}`);
  
  for (let i = 0; i < pageCount; i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdf, [i]);
    newPdf.addPage(copiedPage);
    const singlePageBytes = await newPdf.save();
    
    const pageData = await pdfParse(singlePageBytes);
    if (pageData.text.includes('Yukanthan') || pageData.text.includes('yukanthan') || pageData.text.includes('YUKANTHAN')) {
      console.log(`Found "Yukanthan" on page ${i + 1}`);
      console.log(pageData.text.substring(0, 1000));
      
      fs.writeFileSync('public/certificates/symbo-yukanthan.pdf', singlePageBytes);
      console.log('Saved to public/certificates/symbo-yukanthan.pdf');
      return;
    }
  }
  
  console.log('Not found on any page');
}

extractPage().catch(console.error);