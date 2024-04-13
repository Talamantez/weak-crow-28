import {
  PDFDocument,
  rgb,
  StandardFonts,
} from "https://cdn.skypack.dev/pdf-lib@^1.11.1?dts";

async function generatePDF() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Read the 'chapters.json' file
  const jsonContent = await Deno.readTextFile('static/chapters.json');

  // Parse the JSON content
  const chapters = JSON.parse(jsonContent);

  for (const chapter of chapters) {
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    // Draw chapter title
    page.drawText(chapter.title, {
      x: 50,
      y: height - 70,
      font,
      size: 24,
      color: rgb(0, 0, 0),
    });

    // Draw chapter description
    page.drawText(chapter.description, {
      x: 50,
      y: height - 100,
      font,
      size: 12,
      color: rgb(0, 0, 0),
    });

    let y = height - 140;

    for (const section of chapter.sections) {
      // Draw section title
      page.drawText(section.title, {
        x: 50,
        y,
        font,
        size: 18,
        color: rgb(0, 0, 0),
      });
      y -= 30;

      // Draw section description
      page.drawText(section.description, {
        x: 70,
        y,
        font,
        size: 12,
        color: rgb(0, 0, 0),
      });
      y -= 20;

      // Draw subsections
      for (const subSection of section.subSections) {
        page.drawText(subSection, {
          x: 90,
          y,
          font,
          size: 12,
          color: rgb(0, 0, 0),
        });
        y -= 20;
      }

      y -= 20; // Add extra spacing between sections
    }
  }

  // Add header and footer to each page
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    // Draw header
    const headerText = 'Mental Health Resource Guide';
    const headerTextWidth = font.widthOfTextAtSize(headerText, 12);
    page.drawText(headerText, {
      x: width - headerTextWidth - 50,
      y: height - 30,
      size: 12,
      color: rgb(0, 0, 0),
    });

    // Draw footer
    const footerText = `Page ${i + 1} of ${pages.length}`;
    const footerTextWidth = font.widthOfTextAtSize(footerText, 12);
    page.drawText(footerText, {
      x: (width - footerTextWidth) / 2,
      y: 30,
      size: 12,
      color: rgb(0, 0, 0),
    });
  }

  // Serialize the PDF and save it to a file
  const pdfBytes = await pdfDoc.save();
  await Deno.writeFile('output.pdf', pdfBytes);
}

generatePDF();

generatePDF().catch((err) => {
  console.error(err);
  Deno.exit(1);
});