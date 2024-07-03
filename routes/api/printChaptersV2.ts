import { PDFDocument, rgb, StandardFonts } from "https://cdn.skypack.dev/pdf-lib@^1.11.1?dts";

// Define types
type BlockType = 'paragraph' | 'header' | 'unordered-list-item';

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
}

interface Data {
  Chapters: Chapter[];
}

async function generatePDF(data: Data): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
    const margin = 50;
    let page = pdfDoc.addPage();
    let { width, height } = page.getSize();
    let y = height - margin;
  
    const maxWidth = width - 2 * margin;
    const pageBottom = margin + 50; // Increased bottom margin
  
    let pageCount = 1;
    console.log(`Page ${pageCount} created. Height: ${height}, Initial y: ${y}`);
  
    function addNewPageIfNeeded(requiredSpace: number): boolean {
      if (y - requiredSpace < pageBottom) {
        page = pdfDoc.addPage();
        ({ width, height } = page.getSize());
        y = height - margin;
        pageCount++;
        console.log(`New page ${pageCount} created. Height: ${height}, New y: ${y}`);
        return true;
      }
      return false;
    }
  
    function drawWrappedText(text: string, fontSize: number, isBold: boolean = false) {
      const words = text.split(' ');
      let lines: string[] = [];
      let currentLine = '';
      const lineHeight = fontSize * 1.2;
  
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const testWidth = (isBold ? boldFont : font).widthOfTextAtSize(testLine, fontSize);
  
        if (testWidth > maxWidth && currentLine !== '') {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) {
        lines.push(currentLine);
      }
  
      console.log(`Drawing text: "${text.substring(0, 20)}..." - ${lines.length} lines`);
  
      lines.forEach((line, index) => {
        if (addNewPageIfNeeded(lineHeight)) {
          console.log(`New page created while drawing line ${index + 1} of ${lines.length}`);
        }
  
        page.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font: isBold ? boldFont : font,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;
        console.log(`Line drawn at y: ${y}`);
      });
  
      y -= fontSize * 0.5; // Add some extra space between paragraphs
      console.log(`Text drawing completed. New y: ${y}`);
    }
  
    function drawRichText(richText: RichText) {
      richText.blocks.forEach(block => {
        switch (block.type) {
          case 'paragraph':
            drawWrappedText(block.text, 12);
            break;
          case 'header':
            addNewPageIfNeeded(20);
            drawWrappedText(block.text, 14, true);
            break;
          case 'unordered-list-item':
            drawWrappedText(`• ${block.text}`, 12);
            break;
        }
      });
    }
  
    function drawSection(section: Section, depth: number = 0) {
      const fontSize = 18 - depth * 2;
      addNewPageIfNeeded(fontSize * 2);
      drawWrappedText(section.title, fontSize, true);
      if (section.description) {
        drawRichText(section.description);
      }
      if (section.content) {
        drawRichText(section.content);
      }
      section.sections?.forEach(subSection => drawSection(subSection, depth + 1));
    }
  
    data.Chapters.forEach((chapter, index) => {
      console.log(`Drawing Chapter ${index + 1}: ${chapter.title}`);
      addNewPageIfNeeded(50);
      drawWrappedText(chapter.title, 24, true);
      drawRichText(chapter.description);
      chapter.sections.forEach((section, sectionIndex) => {
        console.log(`Drawing Section ${sectionIndex + 1}: ${section.title}`);
        drawSection(section);
      });
    });
  
    console.log(`PDF generation completed. Total pages: ${pageCount}`);
    return pdfDoc.save();
  }

// Sample data
const sampleData: Data = {
    "Chapters": [
      {
        "title": "Introduction",
        "description": {
          "blocks": [
            {
              "type": "paragraph",
              "text": "Living with mental illness is a challenge, and often the effects of living with mental health challenges extend to friends and family. A person affected by mental health conditions faces the ups and downs on the road to recovery—from diagnosis and treatment to managing their wellness to balancing work, school and mental health. But more often than not, the journey on that road to recovery can involve parents, siblings, partners, grandparents and children, too."
            }
          ]
        },
        "sections": [
          {
            "title": "About the affiliate/How can NAMI help?",
            "description": {
              "blocks": [
                {
                  "type": "paragraph",
                  "text": "NAMI Seattle is a chapter of the National Alliance on Mental Illness, the nation's largest grassroots organization that focuses on mental health conditions. We are a non-partisan 501(c)(3) nonprofit organization and join hundreds of other NAMI affiliates across the country in fighting discrimination against people with mental health conditions and building a community of hope."
                }
              ]
            },
            "sections": []
          }
        ]
      },
      {
        "title": "An Overview of Mental Health Conditions",
        "description": {
          "blocks": [
            {
              "type": "paragraph",
              "text": "In the United States, one in five people will face a mental health condition in their lifetime. Diagnosing mental illness can be a complicated process that can take years, as there is no uniform medical test."
            }
          ]
        },
        "sections": [
          {
            "title": "An Overview",
            "description": {
              "blocks": [
                {
                  "type": "paragraph",
                  "text": "Health care providers consult the Diagnostic and Statistical Manual of Mental Disorders (DSM) to identify symptoms to diagnose mental health conditions. Treatment varies from illness to illness and person to person, but it is critical to have a good system of care in place and a holistic approach to recovery."
                }
              ]
            },
            "sections": []
          },
          {
            "title": "What is Mental Illness?",
            "description": {
              "blocks": [
                {
                  "type": "paragraph",
                  "text": "Mental illnesses are conditions that disrupt a person's thinking, feeling, mood, ability to relate to others and/or daily functioning. Although we often use the term \"mental illness\" to refer to all mental health challenges, it is important to remember that this term refers to many different conditions and diagnoses, and that each person's experience with mental health issues is unique."
                }
              ]
            },
            "sections": []
          },
          {
            "title": "What Causes Mental Illness?",
            "description": {
              "blocks": [
                {
                  "type": "paragraph",
                  "text": "Modern science cannot yet pinpoint the cause of mental illness. However, researchers generally agree that multiple factors play a role, rather than a single cause. Mental illnesses have nothing to do with personal weakness or lack of character. Examples of possible factors: trauma (including generational trauma), genetic predispositions, environment, biochemistry, chronic stress and serious loss."
                }
              ]
            },
            "sections": []
          }
        ]
      },
      {
        "title": "Specific Mental Health Conditions",
        "description": {
          "blocks": [
            {
              "type": "paragraph",
              "text": "This chapter provides detailed information about various mental health conditions, their symptoms, and treatment approaches."
            }
          ]
        },
        "sections": [
          {
            "title": "Anxiety Disorders",
            "description": {
              "blocks": [
                {
                  "type": "paragraph",
                  "text": "Anxiety disorders are the most common mental health concern in the United States. Over 40 million adults in the U.S. (19.1%) have an anxiety disorder. Meanwhile, approximately 7% of children aged 3-17 experience issues with anxiety each year."
                }
              ]
            },
            "sections": [
              {
                "title": "Common Symptoms",
                "description": {
                  "blocks": [
                    {
                      "type": "paragraph",
                      "text": "Anxiety disorders are a group of related conditions, and each has unique symptoms. However, all anxiety disorders have one thing in common: persistent, excessive fear or worry in situations that are not threatening."
                    }
                  ]
                },
                "sections": [
                  {
                    "title": "Emotional symptoms",
                    "content": {
                      "blocks": [
                        {
                          "type": "paragraph",
                          "text": "Feelings of apprehension or dread, feeling tense and jumpy, restlessness or irritability, anticipating the worst and being watchful for signs of danger."
                        }
                      ]
                    }
                  },
                  {
                    "title": "Physical symptoms",
                    "content": {
                      "blocks": [
                        {
                          "type": "paragraph",
                          "text": "Pounding or racing heart and shortness of breath, sweating, tremors and twitches, headaches, fatigue and insomnia, upset stomach, frequent urination or diarrhea."
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          },
          {
            "title": "Bipolar Disorder",
            "description": {
              "blocks": [
                {
                  "type": "paragraph",
                  "text": "Affecting at least 6 million Americans, bipolar disorder is characterized by dramatic shifts in a person's mood, energy and ability to think clearly. People with bipolar have high and low moods, known as mania and depression, which differ from the typical ups and downs most people experience."
                }
              ]
            },
            "sections": [
              {
                "title": "Common Symptoms",
                "description": {
                  "blocks": [
                    {
                      "type": "paragraph",
                      "text": "Bipolar disorder is characterized by both manic and depressive episodes."
                    }
                  ]
                },
                "sections": [
                  {
                    "title": "Symptoms of mania",
                    "content": {
                      "blocks": [
                        {
                          "type": "paragraph",
                          "text": "Irritable mood, overconfidence or extremely inflated self-esteem, increased talkativeness, decreased amount of sleep, engaging in risky behavior, racing thoughts, unpredictable behavior, impaired judgement."
                        }
                      ]
                    }
                  },
                  {
                    "title": "Symptoms of depression",
                    "content": {
                      "blocks": [
                        {
                          "type": "paragraph",
                          "text": "Diminished capacity for pleasure or loss of interest in activities once enjoyed, a long period of feeling hopeless, helpless, or low self-esteem, decreased amount of energy, feeling constantly tired, changes in eating, sleeping, or other daily habits, thoughts of death and/or suicide attempts, decision-making feels overwhelming."
                        }
                      ]
                    }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "title": "Treatment and Recovery",
        "description": {
          "blocks": [
            {
              "type": "paragraph",
              "text": "This chapter covers various aspects of treatment and recovery for mental health conditions, including medication, therapy, and other support systems."
            }
          ]
        },
        "sections": [
          {
            "title": "What is recovery?",
            "description": {
              "blocks": [
                {
                  "type": "paragraph",
                  "text": "Recovery is often a lifelong wellness plan when someone is living with mental illness. Treatment can include diet and exercise, work, sleep, mental health and an overall treatment plan. Evidence-based medications, therapy and psychosocial services such as psychiatric rehabilitation, housing, employment and peer supports have made wellness and recovery a reality for people living with mental health conditions."
                }
              ]
            },
            "sections": []
          },
          {
            "title": "The Elements of Recovery",
            "description": {
              "blocks": [
                {
                  "type": "paragraph",
                  "text": "Looking at an array of research, models and experience, NAMI believes there are core elements to recovery."
                }
              ]
            },
            "sections": [
              {
                "title": "Acceptance",
                "content": {
                  "blocks": [
                    {
                      "type": "paragraph",
                      "text": "Acceptance that you or a loved one has mental illness is often the most difficult hurdle in recovery. When individuals or family members first hear that they or someone they love has a diagnosis, they frequently find themselves experiencing a wide range of emotions including denial, fear, relief, embarrassment, guilt, frustration."
                    }
                  ]
                }
              },
              {
                "title": "Hope",
                "content": {
                  "blocks": [
                    {
                      "type": "paragraph",
                      "text": "Individuals with mental illness must believe that there is hope for recovery. Those who have previous episodes of mental illnesses can look back and realize that because they recovered once, they can do it again."
                    }
                  ]
                }
              }
            ]
          }
        ]
      }
    ]
  };

// Main function to generate and save the PDF
async function main() {
  try {
    const pdfBytes = await generatePDF(sampleData);
    await Deno.writeFile("mental_health_overview.pdf", pdfBytes);
    console.log("PDF has been generated and saved as 'mental_health_overview.pdf'");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Run the main function
main();