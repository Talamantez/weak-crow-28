import {
  PDFDocument,
  PDFFont,
  PDFPage,
  rgb,
  StandardFonts,
} from "https://cdn.skypack.dev/pdf-lib@^1.11.1?dts";
import { decode } from "https://deno.land/std@0.152.0/encoding/base64.ts";
import { Handlers } from "https://deno.land/x/fresh@1.6.8/server.ts";
import { coverImageUrl } from "../../data/coverImageUrl.js";
import { Block, Section, Chapter, ResourceRoadmap, RichText } from "../../util/types.ts"

async function fetchImageAsArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  return await response.arrayBuffer();
}

export async function generatePDF(resourceRoadmap: ResourceRoadmap): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRomanBoldFont = await pdfDoc.embedFont(
    StandardFonts.TimesRomanBold,
  );

  const margin = 50;
  const lineSpacing = 1.3;

  let pageCount = 0;
  let contentStartPage = 0;
  const pageToContentMap = new Map();

  let page = pdfDoc.addPage();

  let { width, height } = page.getSize();
  let y = height - margin;

  const maxWidth = width - 2 * margin;
  const pageBottom = margin + 50;

  // Calm color palette
  const colors = {
    background: rgb(0.96, 0.98, 1), // Light blue-gray
    primary: rgb(0.2, 0.4, 0.6), // Deep blue
    secondary: rgb(0.4, 0.6, 0.8), // Medium blue
    accent: rgb(0.8, 0.9, 1), // Light blue
    text: rgb(0.2, 0.2, 0.2), // Dark gray
  };

  // Generate cover page first
  const coverPage = await generateCoverPage();
  pdfDoc.removePage(0);
  pdfDoc.insertPage(0, coverPage);

  async function generateChapterCoverPage(chapter: Chapter) {
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const sansSerifFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const titleFontSize = 36;
    const margin = 50;
    const lineSpacing = 1.5;
    const textPadding = 10;

    let imageDarkness = "left";
    if (chapter.imageUrl) {
      try {
        let imageBytes: Uint8Array;
        let imageType: string;

        if (chapter.imageUrl.startsWith("data:image")) {
          const [, base64Data] = chapter.imageUrl.split(",");
          imageBytes = decode(base64Data);
          [, imageType] = chapter.imageUrl.match(/data:(image\/[^;]+)/) ?? [];
        } else {
          // It's a URL, fetch it
          const arrayBuffer = await fetchImageAsArrayBuffer(chapter.imageUrl);
          imageBytes = new Uint8Array(arrayBuffer);
          imageType = "image/jpeg"; // Assume JPEG for URL images, adjust if needed
        }

        let coverImage = null;
        if (imageType.includes("png")) {
          coverImage = await pdfDoc.embedPng(imageBytes);
        } else if (imageType.includes("jpeg") || imageType.includes("jpg")) {
          coverImage = await pdfDoc.embedJpg(imageBytes);
        }

        if (coverImage) {
          const scaleFactor = Math.max(
            width / coverImage.width,
            height / coverImage.height,
          );
          const scaledWidth = coverImage.width * scaleFactor;
          const scaledHeight = coverImage.height * scaleFactor;

          page.drawImage(coverImage, {
            x: (width - scaledWidth) / 2,
            y: (height - scaledHeight) / 2,
            width: scaledWidth,
            height: scaledHeight,
          });

          imageDarkness = parseInt(chapter.index) % 2 === 0 ? "left" : "right";
        }
      } catch (error) {
        console.error("Error processing image:", error);
      }
    }
    // Draw chapter title
    const maxLineWidth = width / 2 - 2 * margin + 40;
    const lines = wrapText(
      chapter.title,
      maxLineWidth,
      sansSerifFont,
      titleFontSize,
    );

    lines.forEach((line, index) => {
      const lineWidth = sansSerifFont.widthOfTextAtSize(line, titleFontSize);
      const x = imageDarkness === "left" ? margin : width - margin - lineWidth;
      const y = height - margin - index * titleFontSize * lineSpacing;

      // Draw semi-transparent background
      page.drawRectangle({
        x: imageDarkness === "left"
          ? margin - textPadding
          : width - margin - lineWidth - textPadding,
        y: y - textPadding - 8,
        width: lineWidth + 2 * textPadding,
        height: titleFontSize + 2 * textPadding,
        color: colors.primary,
        opacity: 1,
      });

      // Draw text
      page.drawText(line, {
        x: x,
        y: y - 2,
        font: sansSerifFont,
        size: titleFontSize,
        color: rgb(1, 1, 1), // White color
      });
    });
    return page;
  }

  // Helper function to wrap text
  function wrapText(
    text: string,
    maxWidth: number,
    font: PDFFont,
    fontSize: number,
  ): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);

      if (width <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  async function generateCoverPage() {
    const _coverPage = pdfDoc.addPage();
    const { width, height } = _coverPage.getSize();

    // Embed a sans-serif font (Helvetica in this case)
    const sansSerifFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const margin = 50; // Margin from the edges
    const textPadding = 10; // Padding around text for the background

    const [imageData, base64Data] = coverImageUrl.split(",");
    if (base64Data) {
      try {
        const imageBytes = decode(base64Data);
        const imageType = imageData.split(";")[0].split(":")[1];
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
          // Scale image to cover the entire page (full-bleed)
          const scaleFactor = Math.max(
            width / coverImage.width,
            height / coverImage.height,
          );
          const scaledWidth = coverImage.width * scaleFactor;
          const scaledHeight = coverImage.height * scaleFactor;

          _coverPage.drawImage(coverImage, {
            x: (width - scaledWidth) / 2,
            y: (height - scaledHeight) / 2,
            width: scaledWidth,
            height: scaledHeight,
          });
        } else {
          console.warn("Failed to embed image");
        }
      } catch (error) {
        console.error("Error processing image:", error);
      }
    } else {
      console.warn("No base64 data found in image URL");
    }

    // Add title
    const title = "Resource Roadmap";
    const titleSize = 48;
    const titleLines = wrapText(
      title,
      width - 2 * margin,
      sansSerifFont,
      titleSize,
    );

    titleLines.forEach((line, index) => {
      const lineWidth = sansSerifFont.widthOfTextAtSize(line, titleSize);
      const x = width / 2 - lineWidth / 2;
      const y = height - 150 - index * titleSize * 1.5;

      // Draw semi-transparent background for title
      _coverPage.drawRectangle({
        x: x - textPadding,
        y: y - textPadding - 8,
        width: lineWidth + 2 * textPadding,
        height: titleSize + 2 * textPadding,
        color: colors.primary,
        opacity: 1,
      });

      // Draw title text
      _coverPage.drawText(line, {
        x: x,
        y: y,
        size: titleSize,
        font: sansSerifFont,
        color: rgb(1, 1, 1),
      });
    });

    // Add subtitle
    const subtitle = "A Guide to Mental Health";
    const subtitleSize = 24;
    const subtitleLines = wrapText(
      subtitle,
      width - 2 * margin,
      sansSerifFont,
      subtitleSize,
    );

    subtitleLines.forEach((line, index) => {
      const lineWidth = sansSerifFont.widthOfTextAtSize(line, subtitleSize);
      const x = width / 2 - lineWidth / 2;
      const y = height - 250 - index * subtitleSize * 1.5;

      // Draw semi-transparent background for subtitle
      _coverPage.drawRectangle({
        x: x - textPadding - 75,
        y: y - textPadding + 40,
        width: lineWidth + 2 * textPadding,
        height: subtitleSize + 2 * textPadding,
        color: colors.accent,
        opacity: 1,
      });

      // Draw subtitle text
      _coverPage.drawText(line, {
        x: x - 75,
        y: y + 40,
        size: subtitleSize,
        font: sansSerifFont,
        color: colors.primary,
      });
    });

    return _coverPage;
  }

  function addNewPageIfNeeded(
    currentY: number,
    requiredSpace: number,
  ): { newPage: boolean; y: number } {
    if (currentY - requiredSpace < pageBottom) {
      page = pdfDoc.addPage();
      ({ width, height } = page.getSize());
      const newY = height - margin;
      pageCount++;

      // Add calming background to new page
      page.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: height,
        color: colors.background,
      });

      return { newPage: true, y: newY };
    }

    return { newPage: false, y: currentY };
  }

  function splitTextIntoLines(
    text: string,
    maxWidth: number,
    fontSize: number,
    font: any,
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
    startY: number,
    indent: number = 0,
    depth: number = 0,
  ): { page: PDFPage; y: number } {
    const { width } = page.getSize();
    let font;
    let textColor;

    if (isHeader) {
      if (depth === 0) {
        font = timesRomanBoldFont;
        textColor = colors.primary;
      } else if (depth === 1) {
        font = helveticaBoldFont;
        textColor = colors.text;
      } else {
        font = helveticaFont;
        textColor = rgb(0.4, 0.4, 0.4); // Lighter gray for deeper headings
      }
    } else {
      font = isBold ? helveticaBoldFont : helveticaFont;
      textColor = colors.text;
    }

    const lines = splitTextIntoLines(
      text,
      width - 2 * margin - indent,
      fontSize,
      font,
    );
    const lineHeight = fontSize * lineSpacing;
    let y = startY;

    lines.forEach((line, index) => {
      page.drawText(line, {
        x: margin + indent,
        y: y - lineHeight * index,
        size: fontSize,
        font: font,
        color: textColor,
      });
    });

    y -= lineHeight * lines.length;

    // Only draw the line for chapter headings (depth === 0)
    if (isHeader && depth === 0) {
      page.drawLine({
        start: { x: margin + indent, y },
        end: { x: width - margin, y },
        thickness: 0.5,
        color: colors.secondary,
      });
      y -= 10; // Reduced space after header
    }

    if (isHeader && depth !== 0) {
      page.drawLine({
        start: { x: margin + indent, y },
        end: { x: width - margin, y },
        thickness: 0.5,
        color: colors.secondary,
      });
      // y -= 10; // Reduced space after header
    }

    return { page, y };
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

  function toRoman(num: number): string {
    const romanNumerals = [
      ["m", 1000],
      ["cm", 900],
      ["d", 500],
      ["cd", 400],
      ["c", 100],
      ["xc", 90],
      ["l", 50],
      ["xl", 40],
      ["x", 10],
      ["ix", 9],
      ["v", 5],
      ["iv", 4],
      ["i", 1],
    ];
    let result = "";
    for (const [letter, value] of romanNumerals) {
      while (num >= value) {
        result += letter;
        num -= value;
      }
    }
    return result;
  }

  function drawRichText(
    page: PDFPage,
    richText: RichText | string,
    startY: number,
    indent: number = 0,
    depth: number,
  ): { page: PDFPage; y: number } {
    let y = startY;

    if (typeof richText === "string") {
      richText = convertPlainTextToRichText(richText);
    }

    if (
      richText && typeof richText === "object" && Array.isArray(richText.blocks)
    ) {
      for (const block of richText.blocks) {
        if (block.type) {
          let result;
          if (y < margin) {
            page = pdfDoc.addPage();
            y = page.getHeight() - margin;
          }
          if (block.type === "paragraph") {
            result = drawWrappedText(
              page,
              block.text,
              11,
              false,
              false,
              y,
              indent,
              depth,
            );
          } else if (block.type === "header") {
            result = drawWrappedText(
              page,
              block.text,
              14,
              true,
              true,
              y,
              indent,
              depth,
            );
          } else if (block.type === "unordered-list-item") {
            result = drawWrappedText(
              page,
              `• ${block.text}`,
              11,
              false,
              false,
              y,
              indent + 10,
              depth,
            );
          } else {
            console.warn(`Unsupported block type: ${block.type}`);
            continue;
          }
          page = result.page;
          y = result.y - 10; // Reduced space between blocks
        }
      }
    } else {
      console.warn(
        "Invalid input for drawRichText. Expected RichText object or string.",
      );
    }

    return { page, y };
  }

  function drawSection(
    page: PDFPage,
    section: Section,
    depth: number,
    startY: number,
    addNewPage: () => PDFPage,
  ): { page: PDFPage; y: number } {
    let y = startY;
    const indent = depth * 20; // Increase indentation for nested subsections
    const titleFontSize = Math.max(18 - depth * 2, 12); // Decrease font size for deeper subsections, but not below 12
  
    // Check if we need a new page for the section title
    if (y - titleFontSize * lineSpacing < pageBottom) {
      page = addNewPage();
      y = page.getHeight() - margin;
    }
  
    // Draw section title
    let result = drawWrappedText(
      page,
      section.title,
      titleFontSize,
      true,
      true,
      y,
      indent,
      depth,
    );
    page = result.page;
    y = result.y - titleFontSize * lineSpacing;
  
    // Draw section description
    if (section.description) {
      // Check if we need a new page for the description
      if (y - 11 * lineSpacing < pageBottom) {
        page = addNewPage();
        y = page.getHeight() - margin;
      }
      result = drawRichText(page, section.description, y, indent, depth);
      page = result.page;
      y = result.y - 30;
    }
  
    // Draw subsections
    if (section.sections) {
      for (const subSection of section.sections) {
        // Check if we need a new page before drawing the subsection
        if (y - titleFontSize * lineSpacing < pageBottom) {
          page = addNewPage();
          y = page.getHeight() - margin;
        }
        result = drawSection(page, subSection, depth + 1, y, addNewPage);
        page = result.page;
        y = result.y - 20; // Add some space between subsections
  
        // Check if we need a new page after the subsection
        if (y < pageBottom) {
          page = addNewPage();
          y = page.getHeight() - margin;
        }
      }
    }
  
    return { page, y };
  }

  function drawTableOfContents(
    pdfDoc: PDFDocument,
    tocEntries: any[],
  ): PDFPage[] {
    let pages: PDFPage[] = [];
    let page = pdfDoc.addPage();
    pages.push(page);
    let { width, height } = page.getSize();
    let y = height - margin;
    let pageNumber = 1;

    // Draw TOC title
    const titleResult = drawWrappedText(
      page,
      "Table of Contents",
      24,
      true,
      true,
      y,
    );
    page = titleResult.page;
    y = titleResult.y - 40; // Reduced space after title

    for (const entry of tocEntries) {
      const fontSize = entry.level === 0 ? 14 : 12;
      const numberFontSize = 12;
      const indent = entry.level * 20;
      const text = entry.title;

      const font = entry.level === 0 ? helveticaBoldFont : helveticaFont;
      const pageNumWidth = entry.level === 0
        ? helveticaFont.widthOfTextAtSize(
          entry.pageNumber.toString(),
          numberFontSize,
        )
        : 0;
      const availableWidth = maxWidth - indent - pageNumWidth - 20;

      const wrappedLines = wrapText(text, availableWidth, font, fontSize);

      for (let i = 0; i < wrappedLines.length; i++) {
        const line = wrappedLines[i];

        const { newPage, y: newY } = addNewPageIfNeeded(y, fontSize * 1.5);
        y = newY;
        if (newPage) {
          page = pdfDoc.addPage();
          pages.push(page);
          ({ width, height } = page.getSize());
          pageNumber++;
        }

        // Draw the text
        page.drawText(line, {
          x: margin + indent,
          y,
          size: fontSize,
          font: font,
          color: colors.text,
        });

        // Draw the page number only for the last line of level 0 entries
        if (i === wrappedLines.length - 1 && entry.level === 0) {
          page.drawText(entry.pageNumber.toString(), {
            x: width - margin - pageNumWidth,
            y,
            size: numberFontSize,
            font: helveticaBoldFont,
            color: colors.text,
          });
        }

        y -= fontSize * 1.5;
      }

      y -= fontSize * 0.5; // Add a small gap between entries
    }

    // Add Roman numeral page numbers to TOC pages
    pages.forEach((page, index) => {
      const romanNumeral = toRoman(index + 1);
      const pageNumberText = romanNumeral;
      const textWidth = helveticaFont.widthOfTextAtSize(pageNumberText, 10);
      page.drawText(pageNumberText, {
        x: width - margin - textWidth,
        y: margin / 2,
        size: 10,
        font: helveticaFont,
        color: colors.secondary,
      });
    });

    return pages;
  }
  // Create an array to hold all pages
  const pages: PDFPage[] = [];

  // Placeholder for TOC (will be replaced later)
  const tocPlaceholder = pdfDoc.addPage();
  pages.push(tocPlaceholder);
  pageCount++;

  // Set the content start page
  contentStartPage = pageCount;

  function generateChapterContent(chapter: Chapter): PDFPage[] {
    const pages: PDFPage[] = [];
    let currentPage = pdfDoc.addPage();
    pages.push(currentPage);
    let y = currentPage.getHeight() - margin;

    const addNewPage = (): PDFPage => {
      currentPage = pdfDoc.addPage();
      pages.push(currentPage);
      return currentPage;
    };

    // Draw chapter title
    const titleFontSize = 24;
    let result = drawWrappedText(
      currentPage,
      chapter.title,
      titleFontSize,
      true,
      true,
      y,
      0,
      0,
    );
    currentPage = result.page;
    y = result.y - titleFontSize;

    // Draw chapter description
    if (chapter.description) {
      result = drawRichText(currentPage, chapter.description, y, 0, 0);
      currentPage = result.page;
      y = result.y - 20;
    }

    // Draw sections
    for (const section of chapter.sections) {
      result = drawSection(currentPage, section, 0, y, addNewPage);
      currentPage = result.page;
      y = result.y - 20;
    }

    return pages;
  }

  try {
    for (const [_index, chapter] of resourceRoadmap.chapters.entries()) {
      // Generate chapter cover page
      const chapterCoverPage = await generateChapterCoverPage({
        ...chapter,
      });
      pages.push(chapterCoverPage);
      pageCount++;

      // Store the chapter start page
      pageToContentMap.set(chapter.title, pageCount - contentStartPage + 1);

      // Generate chapter content pages
      const contentPages = generateChapterContent(chapter);
      pages.push(...contentPages);
      pageCount += contentPages.length;

      // Store section page numbers
      chapter.sections.forEach((section, sectionIndex) => {
        const sectionPage = pageCount - contentPages.length + sectionIndex;
        pageToContentMap.set(section.title, sectionPage - contentStartPage + 1);
      });
    }
  } catch (error) {
    console.error("Error during content generation:", error);
  }

  // Generate actual table of contents
  function generateTableOfContents(chapters: Chapter[]): any[] {
    const tocEntries: any[] = [];

    chapters.forEach((chapter) => {
      tocEntries.push({
        title: chapter.title,
        level: 0,
        pageNumber: pageToContentMap.get(chapter.title),
      });

      chapter.sections.forEach((section) => {
        tocEntries.push({
          title: section.title,
          level: 1,
          pageNumber: pageToContentMap.get(section.title),
        });
      });
    });

    return tocEntries;
  }

  // Generate TOC entries
  const tocEntries = generateTableOfContents(resourceRoadmap.chapters);

  // Number content pages first
  for (let i = contentStartPage; i < pdfDoc.getPageCount(); i++) {
    const page = pdfDoc.getPage(i);
    const pageNumber = i - contentStartPage;
    const pageNumberText = `${pageNumber}`;
    const { width } = page.getSize();
    const textWidth = helveticaFont.widthOfTextAtSize(pageNumberText, 10);

    page.drawText(pageNumberText, {
      x: width - margin - textWidth,
      y: margin / 2,
      size: 10,
      font: helveticaFont,
      color: colors.secondary,
    });
  }

  // Generate and insert TOC pages
  const tocPages = drawTableOfContents(pdfDoc, tocEntries);

  // Remove the placeholder TOC
  pdfDoc.removePage(1);

  // Insert all TOC pages
  let insertIndex = 1;
  for (const tocPage of tocPages) {
    pdfDoc.insertPage(insertIndex, tocPage);
    insertIndex++;
  }

  // Update contentStartPage to account for multiple TOC pages
  contentStartPage = insertIndex;

  return pdfDoc.save();
}

export const handler: Handlers = {
  async POST(req) {
    console.log("Received request to generate PDF");
    const requestBody = await req.json();
    const chapters: Chapter[] = requestBody;

    const resourceRoadmap: ResourceRoadmap = {
      chapters: chapters.sort((a, b) => parseInt(a.index) - parseInt(b.index)),
    };

    try {
      const pdfBytes = await generatePDF(resourceRoadmap);

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

