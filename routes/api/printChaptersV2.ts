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
  console.log(`Page ${pageCount} created. Height: ${height}, Initial y: ${y}`);

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

    console.log(
      `Drawing text: "${text.substring(0, 20)}..." - ${lines.length} lines`
    );

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
    console.log(`Text drawing completed. New y: ${y}`);
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
    console.log("Added page break after Table of Contents");
  }

  console.log("Starting PDF generation");

  // Generate TOC entries
  const tocEntries = generateTableOfContents(data.Chapters);
  console.log(`Generated ${tocEntries.length} TOC entries`);

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
    console.log(`Processing Chapter ${index + 1}: ${chapter.title}`);
    if (addNewPageIfNeeded(80)) {
      console.log(`New page added for Chapter ${index + 1}`);
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
    console.log(`Drew description for Chapter ${index + 1}`);

    // Add a pull quote after the chapter description
    if (chapter.description && chapter.description.blocks.length > 0) {
      const descriptionText = chapter.description.blocks
        .map((block) => block.text)
        .join(" ");
      drawPullQuote(descriptionText);
      console.log(`Drew pull quote for Chapter ${index + 1}`);
    }

    chapter.sections.forEach((section, sectionIndex) => {
      console.log(
        `Processing Section ${sectionIndex + 1}: ${section.title} of Chapter ${
          index + 1
        }`
      );
      drawSection(section);

      // Add decorative element between sections
      if (sectionIndex < chapter.sections.length - 1) {
        drawDecorativeElement();
      }
    });

    y -= 40; // Extra space between chapters
  });

  console.log(`PDF generation completed. Total pages: ${pageCount}`);
  return pdfDoc.save();
}

function drawSection(section: Section, depth: number = 0) {
  console.log(`Drawing section: ${section.title} at depth ${depth}`);
  const fontSize = 20 - depth * 2;
  const headerHeight = fontSize * 1.4 + 20; // Estimated height of the section header
  const minContentHeight = 50; // Minimum content to include with the header

  // Check if there's enough space for the header and some content
  if (y - (headerHeight + minContentHeight) < pageBottom) {
    addNewPageIfNeeded(height); // Force a new page
    console.log(`New page added for section: ${section.title}`);
  }

  drawWrappedText(section.title, fontSize, true, true);

  if (section.description) {
    drawRichText(section.description);
    console.log(`Drew description for section: ${section.title}`);
  }
  if (section.content) {
    drawRichText(section.content);
    console.log(`Drew content for section: ${section.title}`);
  }
  section.sections?.forEach((subSection, index) => {
    console.log(
      `Processing subsection ${index + 1} of section: ${section.title}`
    );
    drawSection(subSection, depth + 1);
  });
}
// Sample data
// const sampleData: Data = {
//   "Chapters": [
//     {
//       "title": "Introduction",
//       "description": {
//         "blocks": [
//           {
//             "type": "paragraph",
//             "text":
//               "Living with mental illness is a challenge, and often the effects of living with mental health challenges extend to friends and family. A person affected by mental health conditions faces the ups and downs on the road to recovery—from diagnosis and treatment to managing their wellness to balancing work, school and mental health. But more often than not, the journey on that road to recovery can involve parents, siblings, partners, grandparents and children, too.",
//           },
//         ],
//       },
//       "sections": [
//         {
//           "title": "About the affiliate/How can NAMI help?",
//           "description": {
//             "blocks": [
//               {
//                 "type": "paragraph",
//                 "text":
//                   "NAMI Seattle is a chapter of the National Alliance on Mental Illness, the nation's largest grassroots organization that focuses on mental health conditions. We are a non-partisan 501(c)(3) nonprofit organization and join hundreds of other NAMI affiliates across the country in fighting discrimination against people with mental health conditions and building a community of hope.",
//               },
//             ],
//           },
//           "sections": [],
//         },
//       ],
//     },
//     {
//       "title": "An Overview of Mental Health Conditions",
//       "description": {
//         "blocks": [
//           {
//             "type": "paragraph",
//             "text":
//               "In the United States, one in five people will face a mental health condition in their lifetime. Diagnosing mental illness can be a complicated process that can take years, as there is no uniform medical test.",
//           },
//         ],
//       },
//       "sections": [
//         {
//           "title": "An Overview",
//           "description": {
//             "blocks": [
//               {
//                 "type": "paragraph",
//                 "text":
//                   "Health care providers consult the Diagnostic and Statistical Manual of Mental Disorders (DSM) to identify symptoms to diagnose mental health conditions. Treatment varies from illness to illness and person to person, but it is critical to have a good system of care in place and a holistic approach to recovery.",
//               },
//             ],
//           },
//           "sections": [],
//         },
//         {
//           "title": "What is Mental Illness?",
//           "description": {
//             "blocks": [
//               {
//                 "type": "paragraph",
//                 "text":
//                   "Mental illnesses are conditions that disrupt a person's thinking, feeling, mood, ability to relate to others and/or daily functioning. Although we often use the term \"mental illness\" to refer to all mental health challenges, it is important to remember that this term refers to many different conditions and diagnoses, and that each person's experience with mental health issues is unique.",
//               },
//             ],
//           },
//           "sections": [],
//         },
//         {
//           "title": "What Causes Mental Illness?",
//           "description": {
//             "blocks": [
//               {
//                 "type": "paragraph",
//                 "text":
//                   "Modern science cannot yet pinpoint the cause of mental illness. However, researchers generally agree that multiple factors play a role, rather than a single cause. Mental illnesses have nothing to do with personal weakness or lack of character. Examples of possible factors: trauma (including generational trauma), genetic predispositions, environment, biochemistry, chronic stress and serious loss.",
//               },
//             ],
//           },
//           "sections": [],
//         },
//       ],
//     },
//     {
//       "title": "Specific Mental Health Conditions",
//       "description": {
//         "blocks": [
//           {
//             "type": "paragraph",
//             "text":
//               "This chapter provides detailed information about various mental health conditions, their symptoms, and treatment approaches.",
//           },
//         ],
//       },
//       "sections": [
//         {
//           "title": "Anxiety Disorders",
//           "description": {
//             "blocks": [
//               {
//                 "type": "paragraph",
//                 "text":
//                   "Anxiety disorders are the most common mental health concern in the United States. Over 40 million adults in the U.S. (19.1%) have an anxiety disorder. Meanwhile, approximately 7% of children aged 3-17 experience issues with anxiety each year.",
//               },
//             ],
//           },
//           "sections": [
//             {
//               "title": "Common Symptoms",
//               "description": {
//                 "blocks": [
//                   {
//                     "type": "paragraph",
//                     "text":
//                       "Anxiety disorders are a group of related conditions, and each has unique symptoms. However, all anxiety disorders have one thing in common: persistent, excessive fear or worry in situations that are not threatening.",
//                   },
//                 ],
//               },
//               "sections": [
//                 {
//                   "title": "Emotional symptoms",
//                   "content": {
//                     "blocks": [
//                       {
//                         "type": "paragraph",
//                         "text":
//                           "Feelings of apprehension or dread, feeling tense and jumpy, restlessness or irritability, anticipating the worst and being watchful for signs of danger.",
//                       },
//                     ],
//                   },
//                 },
//                 {
//                   "title": "Physical symptoms",
//                   "content": {
//                     "blocks": [
//                       {
//                         "type": "paragraph",
//                         "text":
//                           "Pounding or racing heart and shortness of breath, sweating, tremors and twitches, headaches, fatigue and insomnia, upset stomach, frequent urination or diarrhea.",
//                       },
//                     ],
//                   },
//                 },
//               ],
//             },
//           ],
//         },
//         {
//           "title": "Bipolar Disorder",
//           "description": {
//             "blocks": [
//               {
//                 "type": "paragraph",
//                 "text":
//                   "Affecting at least 6 million Americans, bipolar disorder is characterized by dramatic shifts in a person's mood, energy and ability to think clearly. People with bipolar have high and low moods, known as mania and depression, which differ from the typical ups and downs most people experience.",
//               },
//             ],
//           },
//           "sections": [
//             {
//               "title": "Common Symptoms",
//               "description": {
//                 "blocks": [
//                   {
//                     "type": "paragraph",
//                     "text":
//                       "Bipolar disorder is characterized by both manic and depressive episodes.",
//                   },
//                 ],
//               },
//               "sections": [
//                 {
//                   "title": "Symptoms of mania",
//                   "content": {
//                     "blocks": [
//                       {
//                         "type": "paragraph",
//                         "text":
//                           "Irritable mood, overconfidence or extremely inflated self-esteem, increased talkativeness, decreased amount of sleep, engaging in risky behavior, racing thoughts, unpredictable behavior, impaired judgement.",
//                       },
//                     ],
//                   },
//                 },
//                 {
//                   "title": "Symptoms of depression",
//                   "content": {
//                     "blocks": [
//                       {
//                         "type": "paragraph",
//                         "text":
//                           "Diminished capacity for pleasure or loss of interest in activities once enjoyed, a long period of feeling hopeless, helpless, or low self-esteem, decreased amount of energy, feeling constantly tired, changes in eating, sleeping, or other daily habits, thoughts of death and/or suicide attempts, decision-making feels overwhelming.",
//                       },
//                     ],
//                   },
//                 },
//               ],
//             },
//           ],
//         },
//       ],
//     },
//     {
//       "title": "Treatment and Recovery",
//       "description": {
//         "blocks": [
//           {
//             "type": "paragraph",
//             "text":
//               "This chapter covers various aspects of treatment and recovery for mental health conditions, including medication, therapy, and other support systems.",
//           },
//         ],
//       },
//       "sections": [
//         {
//           "title": "What is recovery?",
//           "description": {
//             "blocks": [
//               {
//                 "type": "paragraph",
//                 "text":
//                   "Recovery is often a lifelong wellness plan when someone is living with mental illness. Treatment can include diet and exercise, work, sleep, mental health and an overall treatment plan. Evidence-based medications, therapy and psychosocial services such as psychiatric rehabilitation, housing, employment and peer supports have made wellness and recovery a reality for people living with mental health conditions.",
//               },
//             ],
//           },
//           "sections": [],
//         },
//         {
//           "title": "The Elements of Recovery",
//           "description": {
//             "blocks": [
//               {
//                 "type": "paragraph",
//                 "text":
//                   "Looking at an array of research, models and experience, NAMI believes there are core elements to recovery.",
//               },
//             ],
//           },
//           "sections": [
//             {
//               "title": "Acceptance",
//               "content": {
//                 "blocks": [
//                   {
//                     "type": "paragraph",
//                     "text":
//                       "Acceptance that you or a loved one has mental illness is often the most difficult hurdle in recovery. When individuals or family members first hear that they or someone they love has a diagnosis, they frequently find themselves experiencing a wide range of emotions including denial, fear, relief, embarrassment, guilt, frustration.",
//                   },
//                 ],
//               },
//             },
//             {
//               "title": "Hope",
//               "content": {
//                 "blocks": [
//                   {
//                     "type": "paragraph",
//                     "text":
//                       "Individuals with mental illness must believe that there is hope for recovery. Those who have previous episodes of mental illnesses can look back and realize that because they recovered once, they can do it again.",
//                   },
//                 ],
//               },
//             },
//           ],
//         },
//       ],
//     },
//   ],
// };

// Main function to generate and save the PDF
async function main() {
  try {
    console.log("Starting PDF generation process");
    const pdfBytes = await generatePDF(chapters);
    await Deno.writeFile("mental_health_overview.pdf", pdfBytes);
    console.log(
      "PDF has been generated and saved as 'mental_health_overview.pdf'"
    );
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Run the main function
main();
