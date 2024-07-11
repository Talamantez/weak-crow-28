import {
  PDFDocument,
  rgb,
  StandardFonts,
} from "https://cdn.skypack.dev/pdf-lib@^1.11.1?dts";
import { decode } from "https://deno.land/std@0.152.0/encoding/base64.ts";
import { Handlers } from "https://deno.land/x/fresh@1.6.8/server.ts";

// Define types
type BlockType = "paragraph" | "header" | "unordered-list-item";

interface Block {
  type: BlockType;
  text: string;
}

interface RichText {
  blocks: Block[];
}

interface Section {
  title: string;
  description?: RichText | string;
  content?: RichText | string;
  sections?: Section[];
}

interface Chapter {
  title: string;
  description: RichText | string;
  sections: Section[];
  imageUrl?: string;
}

interface Data {
  Chapters: Chapter[];
}

export async function generatePDF(data: Data): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const margin = 50;
  let pageCount = 0;

  let page = pdfDoc.addPage();

  let { width, height } = page.getSize();
  let y = height - margin;

  const maxWidth = width - 2 * margin;
  const pageBottom = margin + 50;

  // let pageCount = 1;
  console.log(`Page ${pageCount} created. Height: ${height}, Initial y: ${y}`);

  // Calm color palette
  const colors = {
    background: rgb(0.96, 0.98, 1), // Light blue-gray
    primary: rgb(0.2, 0.4, 0.6), // Deep blue
    secondary: rgb(0.4, 0.6, 0.8), // Medium blue
    accent: rgb(0.8, 0.9, 1), // Light blue
    text: rgb(0.2, 0.2, 0.2), // Dark gray
  };

  async function generateChapterCoverPage(chapter: Chapter) {
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    pageCount++;

    // Add image if available
    if (chapter.imageURL) {
      const [imageData, base64Data] = chapter.imageURL.split(",");
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
          let imageDims = coverImage.scale(1);
          if (
            imageDims.width > width - 2 * margin ||
            imageDims.height > height - 2 * margin
          ) {
            imageDims = coverImage.scaleToFit(
              width - 2 * margin,
              height - 2 * margin
            );
          }

          page.drawImage(coverImage, {
            x: width / 2 - imageDims.width / 2,
            y: height / 2 - imageDims.height / 2 + 50,
            width: imageDims.width,
            height: imageDims.height,
          });
        }
      }
    }

    // Draw chapter title
    const titleFontSize = 36;
    const wrappedTitle = wrapText(
      chapter.title,
      width - 2 * margin,
      timesRomanFont,
      titleFontSize
    );
    const titleLines = wrappedTitle.split("\n");

    titleLines.forEach((line, index) => {
      page.drawText(line, {
        x:
          width / 2 - timesRomanFont.widthOfTextAtSize(line, titleFontSize) / 2,
        y: height / 4 - index * titleFontSize * 1.5,
        font: timesRomanFont,
        size: titleFontSize,
        color: rgb(0, 0, 0),
      });
    });

    return page;
  }

  async function generateCoverPage() {
    const coverPage = pdfDoc.addPage();
    const { width, height } = coverPage.getSize();

    // Add background color
    coverPage.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: colors.background,
    });

    // Find the first chapter with a valid image URL
    const chapterWithImage = data.Chapters.find((chapter) => chapter.imageUrl);
    if (chapterWithImage && chapterWithImage.imageUrl) {
      // console.log("Found chapter with image URL:", chapterWithImage.imageUrl);
      const imageUrl = chapterWithImage.imageUrl;
      const [imageData, base64Data] = imageUrl.split(",");
      if (base64Data) {
        try {
          const imageBytes = decode(base64Data);
          const imageType = imageData.split(";")[0].split(":")[1];
          // console.log("Image type:", imageType);
          const imageBlob = new Blob([imageBytes], { type: imageType });
          let coverImage = null;
          if (imageType === "image/png") {
            coverImage = await pdfDoc.embedPng(await imageBlob.arrayBuffer());
          } else if (imageType === "image/jpeg") {
            coverImage = await pdfDoc.embedJpg(await imageBlob.arrayBuffer());
          } else {
            console.warn("Unsupported image type:", imageType);
          }
          if (coverImage) {
            console.log("Image embedded successfully");
            let imageDims = coverImage.scale(1);
            console.log("Original image dimensions:", imageDims);
            if (
              imageDims.width > width - 2 * margin ||
              imageDims.height > height - 2 * margin
            ) {
              imageDims = coverImage.scaleToFit(
                width - 2 * margin,
                height - 2 * margin
              );
              console.log("Scaled image dimensions:", imageDims);
            }
            coverPage.drawImage(coverImage, {
              x: width / 2 - imageDims.width / 2,
              y: height / 2 - imageDims.height / 2,
              width: imageDims.width,
              height: imageDims.height,
              opacity: 1,
            });
            console.log("Image drawn on cover page");
          } else {
            console.warn("Failed to embed image");
          }
        } catch (error) {
          console.error("Error processing image:", error);
        }
      } else {
        console.warn("No base64 data found in image URL");
      }
    } else {
      console.warn("No chapter found with a valid image URL");
    }

    // Add title
    const title = "Resource Roadmap";
    const titleSize = 48;
    const titleWidth = timesRomanFont.widthOfTextAtSize(title, titleSize);
    coverPage.drawText(title, {
      x: width / 2 - titleWidth / 2,
      y: height - 150,
      size: titleSize,
      font: timesRomanFont,
      color: colors.primary,
    });

    // Add subtitle
    const subtitle = "A Guide to Mental Health";
    const subtitleSize = 24;
    const subtitleWidth = helveticaFont.widthOfTextAtSize(
      subtitle,
      subtitleSize
    );
    coverPage.drawText(subtitle, {
      x: width / 2 - subtitleWidth / 2,
      y: height - 200,
      size: subtitleSize,
      font: helveticaFont,
      color: colors.secondary,
    });

    console.log("Cover page generated");
    return coverPage;
  }

  function addNewPageIfNeeded(requiredSpace: number): boolean {
    if (y - requiredSpace < pageBottom) {
      page = pdfDoc.addPage();
      ({ width, height } = page.getSize());
      y = height - margin;
      pageCount++;

      // Add calming background to new page
      page.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: height,
        color: colors.background,
      });

      // Add page number
      addPageNumber();

      console.log(
        `New page ${pageCount} created. Height: ${height}, New y: ${y}`
      );
      return true;
    }
    return false;
  }

  function addPageNumber() {
    const pageNumberText = `Page ${pageCount}`;
    const textWidth = helveticaFont.widthOfTextAtSize(pageNumberText, 10);
    page.drawText(pageNumberText, {
      x: width - margin - textWidth,
      y: margin / 2,
      size: 10,
      font: helveticaFont,
      color: colors.secondary,
    });
  }

  function drawDecorativeElement() {
    const elementSize = 20;
    if (addNewPageIfNeeded(elementSize * 2)) return;
    page.drawCircle({
      x: margin + elementSize / 2,
      y: y - elementSize / 2,
      size: elementSize / 2,
      color: colors.accent,
    });
    y -= elementSize * 2; // Increased spacing
  }

  function selectPullQuote(text: string): string {
    // Split the text into sentences
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

    // Filter and score sentences
    const candidateQuotes = sentences
      .filter((sentence) => sentence.length > 30 && sentence.length < 150) // Filter by length
      .map((sentence) => ({
        text: sentence.trim(),
        score: scoreSentence(sentence),
      }))
      .sort((a, b) => b.score - a.score); // Sort by score, highest first

    // Return the highest scored quote, or a default message if no suitable quote is found
    return candidateQuotes.length > 0
      ? candidateQuotes[0].text
      : "Key information highlighted here.";
  }

  function scoreSentence(sentence: string): number {
    let score = 0;

    // Prefer sentences with quotation marks
    if (
      sentence.includes('"') ||
      sentence.includes('"') ||
      sentence.includes('"')
    ) {
      score += 3;
    }

    // Prefer sentences with important-sounding words
    const importantWords = [
      "key",
      "important",
      "significant",
      "crucial",
      "essential",
      "vital",
      "critical",
    ];
    importantWords.forEach((word) => {
      if (sentence.toLowerCase().includes(word)) {
        score += 2;
      }
    });

    // Slightly prefer shorter sentences
    if (sentence.length < 100) {
      score += 1;
    }

    return score;
  }

  function drawPullQuote(text: string) {
    const quoteWidth = maxWidth * 0.8;
    const fontSize = 13; // Slightly reduced font size
    const lineHeight = fontSize * 1.4; // Increased line height
    const padding = 15; // Increased padding

    // Select a smart pull quote
    const pullQuote = selectPullQuote(text);

    // Calculate required height and check for new page
    const lines = splitTextIntoLines(
      pullQuote,
      quoteWidth - padding * 2,
      fontSize,
      timesRomanFont
    );
    const requiredHeight = lineHeight * lines.length + padding * 2;

    if (addNewPageIfNeeded(requiredHeight + 20)) return; // Extra space for safety

    // Draw background
    page.drawRectangle({
      x: margin + (maxWidth - quoteWidth) / 2,
      y: y - requiredHeight,
      width: quoteWidth,
      height: requiredHeight,
      color: colors.accent,
    });

    // Draw quote text
    lines.forEach((line, index) => {
      page.drawText(line, {
        x: margin + (maxWidth - quoteWidth) / 2 + padding,
        y: y - padding - lineHeight * index,
        size: fontSize,
        font: timesRomanFont,
        color: colors.primary,
      });
    });

    y -= requiredHeight + 30; // Extra space after pull quote
  }

  function splitTextIntoLines(
    text: string,
    maxWidth: number,
    fontSize: number,
    font: any
  ): string[] {
    const words = text.split(" ");
    let lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && currentLine !== "") {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  function drawWrappedText(
    page: PDFPage,
    text: string,
    fontSize: number,
    isBold: boolean = false,
    isHeader: boolean = false,
    startY: number
  ): number {
    console.log("\n");
    console.log("Drawing wrapped text for text: " + text);
    console.log("n");

    // console.log(page)
    const { width, height } = page.getSize();
    const font = isHeader
      ? timesRomanFont
      : isBold
      ? helveticaBoldFont
      : helveticaFont;
    const lines = splitTextIntoLines(text, width - 2 * margin, fontSize, font);
    const lineHeight = fontSize * 1.4;
    const totalHeight = lineHeight * lines.length + (isHeader ? 20 : 10);

    let y = startY;

    lines.forEach((line, index) => {
      page.drawText(line, {
        x: margin,
        y: y - lineHeight * index,
        size: fontSize,
        font: font,
        color: isHeader ? colors.primary : colors.text,
      });
    });

    if (isHeader) {
      page.drawLine({
        start: { x: margin, y: y - lineHeight * lines.length - 5 },
        end: { x: width - margin, y: y - lineHeight * lines.length - 5 },
        thickness: 0.5,
        color: colors.secondary,
      });
    }

    return y - totalHeight;
  }
  function convertPlainTextToRichText(text: string): RichText {
    // Split the text into paragraphs
    const paragraphs = text.split("\n\n");

    // Convert each paragraph to a RichText block
    const blocks: Block[] = paragraphs.map((paragraph) => ({
      type: "paragraph",
      text: paragraph.trim(),
    }));

    return { blocks };
  }
  function drawRichText(
    page: PDFPage,
    richText: RichText | string,
    startY: number
  ): number {
    console.log("\n");
    console.log("Drawing rich text or plain text");
    console.log("\n");

    let y = startY;

    if (typeof richText === "string") {
      // Convert plain text to RichText object
      richText = convertPlainTextToRichText(richText);
    }

    if (
      richText &&
      typeof richText === "object" &&
      Array.isArray(richText.blocks)
    ) {
      // Handle RichText input
      console.log("Processing RichText input");
      richText.blocks.forEach((block) => {
        switch (block.type) {
          case "paragraph":
            y = drawWrappedText(page, block.text, 11, false, false, y);
            break;
          case "header":
            y = drawWrappedText(page, block.text, 16, true, true, y);
            break;
          case "unordered-list-item":
            y = drawWrappedText(page, `• ${block.text}`, 11, false, false, y);
            break;
          default:
            console.warn(`Unsupported block type: ${block.type}`);
        }
      });
    } else {
      console.warn(
        "Invalid input for drawRichText. Expected RichText object or string."
      );
    }

    return y;
  }

  function drawSection(
    page: PDFPage,
    section: Section,
    depth: number,
    y: number,
    addNewPageIfNeeded: () => void
  ): number {
    addNewPageIfNeeded();
    y = drawWrappedText(page, section.title, 20 - depth * 2, true, true, y);

    if (section.description) {
      addNewPageIfNeeded();
      y = drawRichText(page, section.description, y);
    }

    if (section.content) {
      addNewPageIfNeeded();
      y = drawRichText(page, section.content, y);
    }

    if (section.sections) {
      for (const subSection of section.sections) {
        addNewPageIfNeeded();
        y = drawSection(page, subSection, depth + 1, y, addNewPageIfNeeded);
      }
    }

    return y;
  }

  // Add calming background to first page
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: height,
    color: colors.background,
  });

  // Add page number to first page
  addPageNumber();

  // Generate TOC entries
  function generateTableOfContents(chapters: Chapter[]): any[] {
    console.log("\n");
    console.log("Generating table of contents");
    console.log("\n");

    const tocEntries: any[] = [];
    let pageNumber = 3; // Assuming TOC takes 1 page and starts on page 2

    chapters.forEach((chapter, chapterIndex) => {
      tocEntries.push({
        title: chapter.title,
        level: 0,
        pageNumber: pageNumber,
      });
      pageNumber++; // Assume each chapter starts on a new page

      chapter.sections.forEach((section: { title: any }, sectionIndex: any) => {
        tocEntries.push({
          title: section.title,
          level: 1,
          pageNumber: pageNumber,
        });
        pageNumber++; // Simplification: assume each section takes a page
      });
    });

    return tocEntries;
  }

  function drawTableOfContents(page: PDFPage, tocEntries: any[]) {
    addNewPageIfNeeded(height); // Start TOC on a new page

    // Ensure y is a valid number
    let y = height - margin;
    if (isNaN(y)) {
      console.warn(
        `Invalid y value in drawTableOfContents: ${y}. Using default.`
      );
      y = height - margin;
    }

    // Draw TOC title
    y = drawWrappedText(page, "Table of Contents", 24, true, true, y);
    y -= 20;

    console.log("Drawing TOC entries");
    console.log(tocEntries);

    // Draw TOC entries
    tocEntries.forEach((entry) => {
      const fontSize = entry.level === 0 ? 14 : 12;
      const numberFontSize = 12;
      const indent = entry.level * 20;
      const text = `${entry.title}`;

      const font = entry.level === 0 ? helveticaBoldFont : helveticaFont;
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const pageNumWidth = helveticaFont.widthOfTextAtSize(
        entry.pageNumber.toString(),
        numberFontSize
      );
      const dotsWidth = maxWidth - textWidth - pageNumWidth - indent - 10;

      let line = text;
      if (dotsWidth > 0) {
        const dots = ".".repeat(
          Math.floor(dotsWidth / helveticaFont.widthOfTextAtSize(".", fontSize))
        );
        line += " " + dots;
      }

      if (addNewPageIfNeeded(fontSize * 1.5)) return;

      if (!isNaN(y)) {
        // Draw the text and dots
        page.drawText(line, {
          x: margin + indent,
          y,
          size: fontSize,
          font: font,
          color: colors.text,
        });

        // Draw the page number
        page.drawText(entry.pageNumber.toString(), {
          x: width - margin - pageNumWidth,
          y,
          size: numberFontSize,
          font: helveticaFont,
          color: colors.text,
        });

        y -= fontSize * 1.5;
      } else {
        console.warn(`Skipping TOC entry due to invalid y value: ${y}`);
      }
    });

    // Add a page break after the Table of Contents
    addNewPageIfNeeded(height);
    console.log("Added page break after Table of Contents");
  }

  // Generate TOC entries
  const tocEntries = generateTableOfContents(data.Chapters);

  // Generate cover page
  const coverPage = await generateCoverPage();
  pdfDoc.insertPage(0, coverPage);

  // Draw table of contents
  drawTableOfContents(page, tocEntries);

  // Reset page count for main content
  pageCount = 1;

  function generateChapterContent(chapter: Chapter): PDFPage[] {
    console.log(
      `\nStarting content generation for chapter: "${chapter.title}"`
    );
    const pages: PDFPage[] = [];
    let currentPage = pdfDoc.addPage();
    let y = currentPage.getHeight() - margin;

    function addNewPageIfNeeded() {
      if (y < margin + 100) {
        currentPage = pdfDoc.addPage();
        pages.push(currentPage);
        y = currentPage.getHeight() - margin;
        console.log(`New page added. Y reset to: ${y}`);
      }
    }

    // Draw chapter title
    y = drawWrappedText(currentPage, chapter.title, 24, true, true, y);
    console.log(`Y position after title: ${y}`);

    // Draw chapter description
    if (chapter.description) {
      addNewPageIfNeeded();
      y = drawRichText(currentPage, chapter.description, y);
      console.log(`Y position after description: ${y}`);
    }

    // Draw sections
    for (const section of chapter.sections) {
      addNewPageIfNeeded();
      y = drawSection(currentPage, section, 0, y, addNewPageIfNeeded);
      console.log(`Y position after section: ${y}`);
    }

    pages.push(currentPage);
    console.log(
      `Generated ${pages.length} pages for chapter: "${chapter.title}"\n`
    );
    return pages;
  }

  // Main content generation
  for (const [index, chapter] of data.Chapters.entries()) {
    console.log(
      `\n--- Processing Chapter ${index + 1}: "${chapter.title}" ---`
    );

    // Generate and add chapter cover page
    const coverPage = await generateChapterCoverPage(chapter);
    pdfDoc.addPage(coverPage);
    console.log(`Added cover page for Chapter ${index + 1}`);

    // Generate and add chapter content pages
    const contentPages = generateChapterContent(chapter);
    console.log(
      `Generated ${contentPages.length} content pages for Chapter ${index + 1}`
    );

    contentPages.forEach((page, pageIndex) => {
      pdfDoc.addPage(page);
      console.log(
        `Added content page ${pageIndex + 1} for Chapter ${index + 1}`
      );
    });

    console.log(`Completed processing Chapter ${index + 1}`);
  }

  console.log(
    `\nPDF generation completed. Total pages: ${pdfDoc.getPageCount()}`
  );

  return pdfDoc.save();
}

export const handler: Handlers = {
  async POST(req) {
    const requestBody = await req.json();
    const chapters: Chapter[] = requestBody;

    const data: Data = {
      Chapters: chapters,
    };

    try {
      const pdfBytes = await generatePDF(data);

      return new Response(pdfBytes, {
        status: 200,
        headers: new Headers({
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=output.pdf",
        }),
      });
    } catch (error) {
      console.error("An error occurred while generating the PDF:", error);
      return new Response("Error generating PDF", { status: 500 });
    }
  },
};

function wrapText(
  text: string,
  maxWidth: number,
  font: any,
  fontSize: number
): string {
  const words = text.split(" ");
  let lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = font.widthOfTextAtSize(currentLine + " " + word, fontSize);
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);

  return lines.join("\n");
}
