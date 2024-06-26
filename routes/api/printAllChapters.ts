import {
  PDFDocument,
  PDFPage,
  rgb,
  StandardFonts,
} from "https://cdn.skypack.dev/pdf-lib@^1.11.1?dts";
import { decode } from "https://deno.land/std@0.152.0/encoding/base64.ts";
import { Handlers } from "https://deno.land/x/fresh@1.6.8/server.ts";

async function createDocumentCoverPage(
    pdfDoc: PDFDocument,
    font: any,
    title: string,
    chapters: any[],
  ): Promise<PDFPage> {
    const coverPage = pdfDoc.addPage();
    const { width, height } = coverPage.getSize();
  
    let myHeight = height;
  
    // Find the first chapter with a valid image URL
    const chapterWithImage = chapters.find((chapter) => chapter.imageUrl);
  
    if (chapterWithImage && chapterWithImage.imageUrl) {
      const imageUrl = chapterWithImage.imageUrl;
      const [imageData, base64Data] = imageUrl.split(",");
  
      if (base64Data) {
        const imageBytes = decode(base64Data);
        const imageType = imageData.split(";")[0].split(":")[1];
        const imageBlob = new Blob([imageBytes], { type: imageType });
        let coverImage = null;
  
        if (imageType === "image/png") {
          coverImage = await pdfDoc.embedPng(await imageBlob.arrayBuffer());
        } else if (imageType === "image/jpeg") {
          coverImage = await pdfDoc.embedJpg(await imageBlob.arrayBuffer());
        }
  
        if (coverImage) {
          let imageDims = coverImage.size();
          if (imageDims.width > width || imageDims.height > height) {
            imageDims = coverImage.scaleToFit(width, height);
          }
  
          coverPage.drawImage(coverImage, {
            x: width / 2 - imageDims.width / 2,
            y: height / 2 - imageDims.height / 2 + 100,
            width: imageDims.width,
            height: imageDims.height,
          });
        }
      }
    }
  
    // Draw the title
    const myTitle = wrapText(title, width - 80, font, 48);
    const lines = myTitle.split("\n");
    for (const line of lines) {
      coverPage.drawText(line, {
        x: width / 2 - font.widthOfTextAtSize(line, 48) / 2,
        y: myHeight / 2,
        font,
        size: 48,
        color: rgb(1, 1, 1),
      });
      myHeight -= 100;
    }
  
    return coverPage;
  }

const wrapText = (
  text: string | undefined,
  width: number,
  font: any,
  fontSize: number,
) => {
  if (!text) {
    return "";
  }

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

async function createCoverPage(
  pdfDoc: PDFDocument,
  font: any,
  title: string,
  imageUrl: string | undefined,
): Promise<void> {
  const coverPage = pdfDoc.addPage();
  const { width, height } = coverPage.getSize();

  let myHeight = height;

  if (imageUrl) {
    const [imageData, base64Data] = imageUrl.split(",");

    if (base64Data) {
      const imageBytes = decode(base64Data);
      const imageType = imageData.split(";")[0].split(":")[1];
      const imageBlob = new Blob([imageBytes], { type: imageType });
      let coverImage = null;

      if (imageType === "image/png") {
        coverImage = await pdfDoc.embedPng(await imageBlob.arrayBuffer());
      } else if (imageType === "image/jpeg") {
        coverImage = await pdfDoc.embedJpg(await imageBlob.arrayBuffer());
      }

      if (coverImage) {
        let imageDims = coverImage.size();
        if (imageDims.width > width || imageDims.height > height) {
          imageDims = coverImage.scaleToFit(width, height);
        }

        coverPage.drawImage(coverImage, {
          x: width / 2 - imageDims.width / 2,
          y: height / 2 - imageDims.height / 2 + 100,
          width: imageDims.width,
          height: imageDims.height,
        });
      }
    }
  }

  // Draw chapter title
  const myTitle = wrapText(title, width - 80, font, 36);
  const lines = myTitle.split("\n");
  for (const line of lines) {
    coverPage.drawText(line, {
      x: width / 10,
      y: myHeight / 2,
      font,
      size: 36,
      color: rgb(1, 1, 1),
    });
    myHeight -= 100;
  }
}

async function createChapterPage(
  pdfDoc: PDFDocument,
  font: any,
  chapter: any,
): Promise<void> {
  if (!chapter.title) {
    console.log("Skipping chapter with undefined title");
    return;
  }

  console.log(`Rendering chapter: ${chapter.title}`);
  let page = pdfDoc.addPage();
  let { width, height } = page.getSize();

  let y = height - 70;

  // Draw chapter title
  const myTitle = wrapText(chapter.title, width - 90, font, 24);
  const lines = myTitle.split("\n");
  for (const line of lines) {
    if (y < 100) {
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
  const chapterDescription = wrapText(
    chapter.description,
    width - 90,
    font,
    12,
  );
  const descriptionLines = chapterDescription.split("\n");
  for (const line of descriptionLines) {
    if (y < 100) {
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

  for (const section of chapter.sections) {
    if (y < 100) {
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
    const mySectionDescription = wrapText(
      section.description,
      width - 90,
      font,
      12,
    );
    const sectionLines = mySectionDescription.split("\n");
    for (const line of sectionLines) {
      if (y < 100) {
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
      const mySubSection = wrapText(subSection, width - 90, font, 12);
      const lines = mySubSection.split("\n");
      for (const line of lines) {
        if (y < 100) {
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

    y -= 20;
  }
}

async function addHeaderAndFooter(
  pdfDoc: PDFDocument,
  font: any,
): Promise<void> {
  const pages = pdfDoc.getPages();
  for (let i = 1; i < pages.length; i++) {
    const page = pages[i];
    const { width, height } = page.getSize();

    // Draw header
    const headerText = "Resource Roadmap";
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
}

export const handler: Handlers = {
  async POST(req) {
    const requestBody = await req.json();
    const chapters = requestBody;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let pageNumber = 1;

    // pageNumber++;

    for (const chapter of chapters) {
      if (!chapter.title) {
        console.log("Skipping chapter with undefined title");
        continue;
      }

      // Create the cover page with an image from sessionStorage
      await createCoverPage(pdfDoc, font, chapter.title, chapter.imageUrl);
      pageNumber++;

      // Create the chapter pages
      await createChapterPage(pdfDoc, font, chapter);
      chapter.pageNumber = pageNumber; // Store the page number for the table of contents
      pageNumber++;
    }

    // Add header and footer to each page (excluding the cover pages and table of contents)
    await addHeaderAndFooter(pdfDoc, font);

    // Create the table of contents page and insert it after the document cover page
    const tocPage = await pdfDoc.insertPage(0);
    const { width, height } = tocPage.getSize();

    let y = height - 70;

    // Draw the table of contents title
    const tocTitle = "Table of Contents";
    const tocTitleWidth = font.widthOfTextAtSize(tocTitle, 24);
    tocPage.drawText(tocTitle, {
      x: (width - tocTitleWidth) / 2,
      y,
      font,
      size: 24,
      color: rgb(0, 0, 0),
    });
    y -= font.heightAtSize(24) + 20;

    // Draw the chapter entries
    for (const chapter of chapters) {
      if (!chapter.title) continue;

      const chapterTitle = chapter.title;
      const chapterPage = chapter.pageNumber;

      tocPage.drawText(chapterTitle, {
        x: 50,
        y,
        font,
        size: 12,
        color: rgb(0, 0, 0),
      });

      const pageNumberText = `Page ${chapterPage}`;
      const pageNumberWidth = font.widthOfTextAtSize(pageNumberText, 12);
      tocPage.drawText(pageNumberText, {
        x: width - pageNumberWidth - 50,
        y,
        font,
        size: 12,
        color: rgb(0, 0, 0),
      });

      y -= font.heightAtSize(12) + 10;
    }

    const documentCoverPage = await createDocumentCoverPage(pdfDoc, font, "Resource Roadmap", chapters);
    pdfDoc.insertPage(0, documentCoverPage);
    // get last page number and remove it
    const lastPage = pdfDoc.getPages().length;
    pdfDoc.removePage(lastPage - 1);
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
