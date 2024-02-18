// To run this script with Deno:
//   deno run --allow-write https://gist.githubusercontent.com/Hopding/8304b9f07c52904587f7b45fae4bcb8c/raw/pdf-lib-deno-create-script.ts

import { PDFDocument } from 'https://cdn.skypack.dev/pdf-lib@^1.11.1?dts';

// Create a new PDFDocument
const pdfDoc = await PDFDocument.create();

// Add a page to the PDFDocument and draw some text
const page = pdfDoc.addPage();
page.drawText('Creating PDFs in Deno is awesome!', {
  x: 100,
  y: 700,
});

// Save the PDFDocument and write it to a file
const pdfBytes = await pdfDoc.save();
await Deno.writeFile('create.pdf', pdfBytes);

// Done! 💥
console.log('PDF file written to create.pdf');