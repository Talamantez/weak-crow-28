import {
  PDFDocument,
  rgb,
  StandardFonts,
} from "https://cdn.skypack.dev/pdf-lib@^1.11.1?dts";
import { decode } from "https://deno.land/std@0.152.0/encoding/base64.ts";
import { Handlers } from "https://deno.land/x/fresh@1.6.8/server.ts";
import * as base64 from "jsr:@std/encoding/base64";

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

// Function to create a cover page with an image from localStorage
async function createCoverPage(
  pdfDoc: PDFDocument,
  font: any,
  imageUrl: string,
): Promise<void> {
  const coverPage = pdfDoc.addPage();
  const { width, height } = coverPage.getSize();

  // Get the image data from localStorage
//   const imageData = localStorage.getItem(coverImage);

  const base64Data = imageUrl.split(",")[1];

  if (base64Data) {
    const imageBytes = decode(base64Data);
    // const imageType = localStorage.getItem("coverImageType");
    // const imageType = "image/png";

    const imageBlob = new Blob([imageBytes], { type: "image/png" });

    const coverImage = await pdfDoc.embedPng(await imageBlob.arrayBuffer());

    if (coverImage) {
      let imageDims = coverImage.size();
      // Make sure the image is not larger than the page, and scale down to fit if it is
      if (imageDims.width > width || imageDims.height > height) {
        imageDims = coverImage.scaleToFit(width, height);
      }

      // Draw the cover image in the center of the cover page
      coverPage.drawImage(coverImage, {
        x: width / 2 - imageDims.width / 2,
        y: height / 2 - imageDims.height / 2 + 100,
        width: imageDims.width,
        height: imageDims.height,
      });
    }
  }

  // Draw the title on the cover page
  const titleText = "Mental Health Resource Guide";
  const titleFontSize = 36;
  const titleTextWidth = font.widthOfTextAtSize(titleText, titleFontSize);
  coverPage.drawText(titleText, {
    x: width / 2 - titleTextWidth / 2,
    y: height / 2 - titleFontSize,
    size: titleFontSize,
    color: rgb(0, 0, 0),
  });
}

export const handler: Handlers = {
  async POST(req) {
    const requestBody = await req.json();

    console.log(requestBody);
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const chapter = requestBody;

    // Create the cover page with an image from localStorage
    //   await createCoverPage(pdfDoc, font, `Chapter Manager: ${chapter.title}-CoverImage`);
    await createCoverPage(
      pdfDoc,
      font,
      chapter.imageUrl,
    );

    console.log(`Rendering chapter: ${chapter.title}`);
    let page = pdfDoc.addPage();
    let { width, height } = page.getSize();

    let y = height - 70;

    // Draw chapter title
    // Convert to wrap text
    const myTitle = wrapText(chapter.title, width - 90, font, 24);
    const lines = myTitle.split("\n");
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
        size: 24,
        color: rgb(0, 0, 0),
      });
      y -= font.heightAtSize(24);
    }

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
      // Convert to wrap text
      const mySectionDescription = wrapText(
        section.description,
        width - 90,
        font,
        12,
      );
      const sectionLines = mySectionDescription.split("\n");
      for (const line of sectionLines) {
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

    // Add header and footer to each page (excluding the cover page)
    const pages = pdfDoc.getPages();
    for (let i = 1; i < pages.length; i++) {
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
      const footerText = `Page ${i} of ${pages.length - 1}`;
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