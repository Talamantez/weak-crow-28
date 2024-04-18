import {
    PDFDocument,
    rgb,
    StandardFonts,
  } from "https://cdn.skypack.dev/pdf-lib@^1.11.1?dts";
  import { Handlers } from "https://deno.land/x/fresh@1.6.8/server.ts";
  
  const wrapText = (text: string, width: number, font: any, fontSize: number) => {
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
  
  export const handler: Handlers = {
    async POST(req) {
      const requestBody = await req.json();
  
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
      const chapter = requestBody;
  
      console.log(`Rendering chapter: ${chapter.title}`);
      let page = pdfDoc.addPage();
      let { width, height } = page.getSize();
  
      let y = height - 70;
  
      // Draw chapter title
      // Convert to wrap text
      const myTitle = wrapText(chapter.title, width - 90, font, 24)
      const lines = myTitle.split("\n");
      for (const line of lines){
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
          size: 24,
          color: rgb(0, 0, 0),
        });
        y -= font.heightAtSize(24);
      }
  
      // Draw chapter description
      // Convert to wrap text
      const myDescription = wrapText(chapter.description, width - 90, font, 14)
      const descriptionLines = myDescription.split("\n");
      for (const line of descriptionLines){
        page.drawText(line, {
          x: 50,
          y,
          font,
          size: 14,
          color: rgb(0, 0, 0),
        });
        y -= font.heightAtSize(14) + 10;
      }

      for (const section of chapter.sections) {
        // Check if there's enough space on the current page
        if (y < 100) {
          // Add a new page if there's not enough space
          page = pdfDoc.addPage();
          ({ width, height } = page.getSize());
          y = height - 70;
        }
  
        // Draw section title
        // Convert to wrap text
        const myTitle = wrapText(section.title, width - 90, font, 16)
        const lines = myTitle.split("\n");
        for (const line of lines){
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
            size: 16,
            color: rgb(0, 0, 0),
          });
          y -= font.heightAtSize(16) + 10;
        }
  
        // Draw section description
        // Convert to wrap text
        const myDescription = wrapText(section.description, width - 90, font, 12)
        const descriptionLines = myDescription.split("\n");
        for (const line of descriptionLines){
          page.drawText(line, {
            x: 50,
            y,
            font,
            size: 12,
            color: rgb(0, 0, 0),
          });
          y -= font.heightAtSize(12) + 10;
        }
  
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
  
      // Serialize the PDF
      const pdfBytes = await pdfDoc.save();
  
      // Return the PDF as a response
      return new Response(pdfBytes, {
        status: 200,
        headers: new Headers({
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=output.pdf",
        }),
      });
    },
  };