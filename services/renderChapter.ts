import {
  PDFDocument,
  rgb,
  StandardFonts,
} from "https://cdn.skypack.dev/pdf-lib@^1.11.1?dts";
import * as mod from "https://deno.land/std@0.110.0/node/module.ts";


const wrapText = (text, width, font, fontSize) => {
  const words = text.split(" ");
  let line = "";
  let result = "";
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + " ";
    const testWidth = font.widthOfTextAtSize(testLine, fontSize);
    if (testWidth > width) {
      result += line + "\n";
      line = words[n] + " ";
    } else {
      line = testLine;
    }
  }
  result += line;
  return result;
};

export default async function renderChapter(data: any) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  // Read the 'chapters.json' file
  // const jsonContent = await Deno.readTextFile("static/introduction.json");

  // Parse the JSON content
  const chapter = JSON.parse(data);

  console.log(`Rendering chapter: ${chapter.title}`);
  let page = pdfDoc.addPage();
  let { width, height } = page.getSize();

  let y = height - 70;

  // Draw chapter title
  page.drawText(chapter.title, {
    x: 50,
    y,
    font,
    size: 24,
    color: rgb(0, 0, 0),
  });
  y -= font.heightAtSize(24) + 10;

  // Draw chapter description
  page.drawText(chapter.description, {
    x: 50,
    y,
    font,
    size: 12,
    color: rgb(0, 0, 0),
  });
  y -= font.heightAtSize(12) + 10;

  for (const section of chapter.sections) {
    // Check if there's enough space on the current page
    if (y < 100) {
      // Add a new page if there's not enough space
      page = pdfDoc.addPage();
      ({ width, height } = page.getSize());
      y = height - 70;
    }

    // Draw section title
    page.drawText(section.title, {
      x: 50,
      y,
      font,
      size: 18,
      color: rgb(0, 0, 0),
    });
    y -= font.heightAtSize(18) + 10;

    // Draw section description
    page.drawText(section.description, {
      x: 50,
      y,
      font,
      size: 12,
      color: rgb(0, 0, 0),
    });
    y -= font.heightAtSize(12) + 10;

    // Draw subsections
    for (const subSection of section.subSections) {
      // Convert to wrap text
      const mySubSection = wrapText(subSection, width - 90, font, 12);
      const lines = mySubSection.split("\n");
      for (const line of lines) {
        // Check if there's enough space on the current page
        if (y < 100) {
          // Add a new page if there's not enough space
          page = pdfDoc.addPage();
          ({ width, height } = page.getSize());
          y = height - 70;
        }

        page.drawText(line, {
          x: 50,
          y,
          font,
          size: 12,
          color: rgb(0, 0, 0),
        });
        y -= font.heightAtSize(12);
      }
      y -= 10;
    }

    y -= 20; // Add extra spacing between sections
  }

  // Add header and footer to each page
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    // Draw header
    const headerText = "Mental Health Resource Guide";
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
  console.log(pdfBytes);
  try {
    await Deno.writeFile("output.pdf", pdfBytes);
  } catch (error) {
    console.log(error);
  }
}



// renderPdf().catch((err) => {
//   console.error(err);
//   Deno.exit(1);
// });
