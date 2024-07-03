import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

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

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  chapter: {
    fontSize: 24,
    marginBottom: 10,
    color: '#333333',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    color: '#444444',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555555',
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 5,
    color: '#666666',
  },
});

// RichText to PDF converter
const RichTextToPDF: React.FC<{ blocks: Block[] }> = ({ blocks }) => {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'paragraph':
            return <Text key={index} style={styles.paragraph}>{block.text}</Text>;
          case 'header':
            return <Text key={index} style={styles.subtitle}>{block.text}</Text>;
          case 'unordered-list-item':
            return <Text key={index} style={styles.paragraph}>• {block.text}</Text>;
          default:
            return <Text key={index}>{block.text}</Text>;
        }
      })}
    </>
  );
};

// Section renderer
const SectionRenderer: React.FC<{ section: Section; depth?: number }> = ({ section, depth = 0 }) => {
  const titleStyle = depth === 0 ? styles.title : styles.subtitle;
  return (
    <View style={styles.section}>
      <Text style={titleStyle}>{section.title}</Text>
      {section.description && <RichTextToPDF blocks={section.description.blocks} />}
      {section.content && <RichTextToPDF blocks={section.content.blocks} />}
      {section.sections && section.sections.map((subSection, index) => (
        <SectionRenderer key={index} section={subSection} depth={depth + 1} />
      ))}
    </View>
  );
};

// Sample data (same as before, but now with type annotations)
const sampleData: Data = {
  "Chapters": [
    {
      "title": "An Overview of Mental Health Conditions",
      "description": {
        "blocks": [
          {
            "type": "paragraph",
            "text": "This chapter provides an overview of mental health conditions, their prevalence, and general information about diagnosis and treatment."
          }
        ]
      },
      "sections": [
        {
          "title": "Understanding Mental Health",
          "description": {
            "blocks": [
              {
                "type": "paragraph",
                "text": "This section covers the basics of mental health, including prevalence and diagnosis."
              }
            ]
          },
          "sections": [
            {
              "title": "Prevalence and Diagnosis",
              "description": {
                "blocks": [
                  {
                    "type": "paragraph",
                    "text": "Mental health conditions are common and can affect anyone. The diagnosis process often involves multiple steps and consultations."
                  }
                ]
              },
              "sections": [
                {
                  "title": "Statistics",
                  "content": {
                    "blocks": [
                      {
                        "type": "paragraph",
                        "text": "One in five people in the United States will face a mental health condition in their lifetime."
                      }
                    ]
                  },
                  "sections": [
                    {
                      "title": "Adult Statistics",
                      "content": {
                        "blocks": [
                          {
                            "type": "paragraph",
                            "text": "Approximately 20% of adults experience a mental illness each year."
                          }
                        ]
                      },
                      "sections": [
                        {
                          "title": "Common Conditions",
                          "content": {
                            "blocks": [
                              {
                                "type": "paragraph",
                                "text": "Among adults, anxiety disorders and depression are the most prevalent mental health conditions."
                              }
                            ]
                          }
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// PDF Document component
const MyDocument: React.FC<{ data: Data }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {data.Chapters.map((chapter, index) => (
        <View key={index}>
          <Text style={styles.chapter}>{chapter.title}</Text>
          <RichTextToPDF blocks={chapter.description.blocks} />
          {chapter.sections.map((section, sIndex) => (
            <SectionRenderer key={sIndex} section={section} />
          ))}
        </View>
      ))}
    </Page>
  </Document>
);

// Main Editor component
const Editor: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'auto' }}>
      <div style={{ width: '800px', height: '1130px', margin: '20px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', backgroundColor: '#fff' }}>
        <MyDocument data={sampleData} />
      </div>
    </div>
  );
};

export default Editor;