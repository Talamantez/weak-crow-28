import {
  PDFDocument,
  rgb,
  StandardFonts,
} from "https://cdn.skypack.dev/pdf-lib@^1.11.1?dts";

import intro from "../../data/chapters/Introduction.json" assert { type: "json" };
import overview from "../../data/chapters/An Overview of Mental Health Conditions.json" assert { type: "json" };
import specific from "../../data/chapters/Specific Mental Health Conditions.json" assert { type: "json" };
import treatment from "../../data/chapters/Treatment and Recovery.json" assert { type: "json" };

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
  description?: RichText;
  content?: RichText;
  sections?: Section[];
}

interface Chapter {
  title: string;
  description: RichText;
  sections: Section[];
  imageURL: string;
}

interface Data {
  Chapters: Chapter[];
}

const chapters: Data = {
  Chapters: [
    intro as Chapter,
    overview as Chapter,
    specific as Chapter,
    treatment as Chapter,
  ],
};

export async function generatePDF(data: Data): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

  const margin = 50;
  let page = pdfDoc.addPage();
  let { width, height } = page.getSize();
  let y = height - margin;

  const maxWidth = width - 2 * margin;
  const pageBottom = margin + 50;

  let pageCount = 1;
  // console.log(`Page ${pageCount} created. Height: ${height}, Initial y: ${y}`);

  // Calm color palette
  const colors = {
    background: rgb(0.96, 0.98, 1), // Light blue-gray
    primary: rgb(0.2, 0.4, 0.6), // Deep blue
    secondary: rgb(0.4, 0.6, 0.8), // Medium blue
    accent: rgb(0.8, 0.9, 1), // Light blue
    text: rgb(0.2, 0.2, 0.2), // Dark gray
  };

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

      // console.log(
      //   `New page ${pageCount} created. Height: ${height}, New y: ${y}`
      // );
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
    text: string,
    fontSize: number,
    isBold: boolean = false,
    isHeader: boolean = false
  ): number {
    const font = isHeader
      ? timesRomanFont
      : isBold
      ? helveticaBoldFont
      : helveticaFont;
    const lines = splitTextIntoLines(text, maxWidth, fontSize, font);
    const lineHeight = fontSize * 1.4;
    const totalHeight = lineHeight * lines.length + (isHeader ? 20 : 10);

    if (addNewPageIfNeeded(totalHeight)) return 0;

    // console.log(
    //   `Drawing text: "${text.substring(0, 20)}..." - ${lines.length} lines`
    // );

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
        end: { x: margin + maxWidth, y: y - lineHeight * lines.length - 5 },
        thickness: 0.5,
        color: colors.secondary,
      });
    }

    y -= totalHeight;
    // console.log(`Text drawing completed. New y: ${y}`);
    return totalHeight;
  }

  function drawRichText(richText: RichText): number {
    let totalHeight = 0;
    richText.blocks.forEach((block) => {
      switch (block.type) {
        case "paragraph":
          totalHeight += drawWrappedText(block.text, 11, false);
          break;
        case "header":
          if (addNewPageIfNeeded(30)) return totalHeight;
          totalHeight += drawWrappedText(block.text, 16, true, true);
          break;
        case "unordered-list-item":
          totalHeight += drawWrappedText(`• ${block.text}`, 11, false);
          break;
      }
    });
    return totalHeight;
  }

  function drawSection(section: Section, depth: number = 0) {
    const fontSize = 20 - depth * 2;
    const headerHeight = fontSize * 1.4 + 20; // Estimated height of the section header
    const minContentHeight = 50; // Minimum content to include with the header

    // Check if there's enough space for the header and some content
    if (y - (headerHeight + minContentHeight) < pageBottom) {
      addNewPageIfNeeded(height); // Force a new page
    }

    drawWrappedText(section.title, fontSize, true, true);

    if (section.description) {
      drawRichText(section.description);
    }
    if (section.content) {
      drawRichText(section.content);
    }
    section.sections?.forEach((subSection) =>
      drawSection(subSection, depth + 1)
    );
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

  // New function to generate table of contents
  function generateTableOfContents(chapters: any[]): any[] {
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

  // New function to draw table of contents
  function drawTableOfContents(tocEntries: any[]) {
    addNewPageIfNeeded(height); // Start TOC on a new page

    // Draw TOC title
    drawWrappedText("Table of Contents", 24, true, true);
    y -= 20;

    tocEntries.forEach((entry) => {
      const fontSize = entry.level === 0 ? 14 : 12;
      const indent = entry.level * 20;
      const text = `${entry.title}`;

      const font = entry.level === 0 ? helveticaBoldFont : helveticaFont;
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const pageNumWidth = helveticaFont.widthOfTextAtSize(
        entry.pageNumber.toString(),
        fontSize
      );
      const dotsWidth = maxWidth - textWidth - pageNumWidth - indent;

      let line = text;
      if (dotsWidth > 0) {
        const dots = ".".repeat(
          Math.floor(dotsWidth / helveticaFont.widthOfTextAtSize(".", fontSize))
        );
        line += " " + dots;
      }

      if (addNewPageIfNeeded(fontSize * 1.5)) return;

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
        size: fontSize,
        font: helveticaFont,
        color: colors.text,
      });

      y -= fontSize * 1.5;
    });

    // Add a page break after the Table of Contents
    addNewPageIfNeeded(height);
    // console.log("Added page break after Table of Contents");
  }

  // console.log("Starting PDF generation");

  // Generate TOC entries
  const tocEntries = generateTableOfContents(data.Chapters);
  // console.log(`Generated ${tocEntries.length} TOC entries`);

  // Draw background for cover page
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: height,
    color: colors.background,
  });

  // Draw title on cover page
  const titleFontSize = 36;
  const title = "Mental Health Guide";
  const titleWidth = timesRomanFont.widthOfTextAtSize(title, titleFontSize);
  page.drawText(title, {
    x: (width - titleWidth) / 2,
    y: height - 200,
    size: titleFontSize,
    font: timesRomanFont,
    color: colors.primary,
  });

  // Draw subtitle
  const subtitle = "A Comprehensive Overview";
  const subtitleFontSize = 24;
  const subtitleWidth = helveticaFont.widthOfTextAtSize(
    subtitle,
    subtitleFontSize
  );
  page.drawText(subtitle, {
    x: (width - subtitleWidth) / 2,
    y: height - 250,
    size: subtitleFontSize,
    font: helveticaFont,
    color: colors.secondary,
  });

  // Draw decorative element on cover
  const coverElementSize = 100;
  page.drawCircle({
    x: width / 2,
    y: height / 2,
    size: coverElementSize,
    color: colors.accent,
  });

  // Draw table of contents
  drawTableOfContents(tocEntries);

  // Reset page count for main content
  pageCount = 1;

  // Main content generation
  data.Chapters.forEach((chapter, index) => {
    // console.log(`Processing Chapter ${index + 1}: ${chapter.title}`);
    if (addNewPageIfNeeded(80)) {
      // console.log(`New page added for Chapter ${index + 1}`);
    }
    // Add decorative element for chapter title
    page.drawRectangle({
      x: margin,
      y: y - 10,
      width: maxWidth,
      height: 50,
      color: colors.accent,
    });

    y -= 20; // Space before chapter title
    drawWrappedText(chapter.title, 28, true, true);
    y -= 20; // Space after chapter title

    drawRichText(chapter.description);
    // console.log(`Drew description for Chapter ${index + 1}`);

    // Add a pull quote after the chapter description
    if (chapter.description && chapter.description.blocks.length > 0) {
      const descriptionText = chapter.description.blocks
        .map((block) => block.text)
        .join(" ");
      drawPullQuote(descriptionText);
      // console.log(`Drew pull quote for Chapter ${index + 1}`);
    }

    chapter.sections.forEach((section, sectionIndex) => {
      // console.log(
      //   `Processing Section ${sectionIndex + 1}: ${section.title} of Chapter ${
      //     index + 1
      //   }`
      // );
      drawSection(section);

      // Add decorative element between sections
      if (sectionIndex < chapter.sections.length - 1) {
        drawDecorativeElement();
      }
    });

    y -= 40; // Extra space between chapters
  });

  // console.log(`PDF generation completed. Total pages: ${pageCount}`);
  return pdfDoc.save();
}

function drawSection(section: Section, depth: number = 0) {
  // console.log(`Drawing section: ${section.title} at depth ${depth}`);
  const fontSize = 20 - depth * 2;
  const headerHeight = fontSize * 1.4 + 20; // Estimated height of the section header
  const minContentHeight = 50; // Minimum content to include with the header

  // Check if there's enough space for the header and some content
  if (y - (headerHeight + minContentHeight) < pageBottom) {
    addNewPageIfNeeded(height); // Force a new page
    // console.log(`New page added for section: ${section.title}`);
  }

  drawWrappedText(section.title, fontSize, true, true);

  if (section.description) {
    drawRichText(section.description);
    // console.log(`Drew description for section: ${section.title}`);
  }
  if (section.content) {
    drawRichText(section.content);
    // console.log(`Drew content for section: ${section.title}`);
  }
  section.sections?.forEach((subSection, index) => {
    // console.log(
    //   `Processing subsection ${index + 1} of section: ${section.title}`
    // );
    drawSection(subSection, depth + 1);
  });
}

// Main function to generate and save the PDF
async function main() {
  try {
    // console.log("Starting PDF generation process");
    const pdfBytes = await generatePDF(chapters);
    await Deno.writeFile("mental_health_overview.pdf", pdfBytes);
    // console.log(
    //   "PDF has been generated and saved as 'mental_health_overview.pdf'"
    // );
  } catch (error) {
    // console.error("An error occurred:", error);
  }
}

// Run the main function
main();
