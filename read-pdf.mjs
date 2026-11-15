import { PDFParse } from 'pdf-parse';
import fs from 'fs';

const pdfBytes = fs.readFileSync('public/certificates/Yukanthan Symbo Event.pdf');
const parser = new PDFParse({});
await parser.load(pdfBytes);
const text = await parser.getText();
console.log(text);