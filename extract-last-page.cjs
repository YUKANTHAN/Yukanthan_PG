const { PDFDocument } = require('pdf-lib');
const fs = require('fs');

async function extractLastPage() {
  const pdfBytes = fs.readFileSync('public/certificates/symbo.pdf');
  const pdf = await PDFDocument.load(pdfBytes);
  const pageCount = pdf.getPageCount();
  
  console.log(`Total pages: ${pageCount}`);
  
  const newPdf = await PDFDocument.create();
  const [lastPage] = await newPdf.copyPages(pdf, [pageCount - 1]);
  newPdf.addPage(lastPage);
  const singlePageBytes = await newPdf.save();
  
  fs.writeFileSync('public/certificates/symbo-yukanthan.pdf', singlePageBytes);
  console.log('Saved last page to public/certificates/symbo-yukanthan.pdf');
}

extractLastPage().catch(console.error);