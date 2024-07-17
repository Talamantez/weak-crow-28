import { useState, useEffect, useRef } from "preact/hooks";
import { Head } from "$fresh/runtime.ts";
import Footer from "../components/Footer.tsx";
import Button from "../components/Button.tsx";
import IconPlus from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/plus.tsx";
import IconX from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/x.tsx";
import { useLoadChapters } from "../services/useLoadChapters.ts";
import { dbName, storeName, dbVersion } from "../util/dbInfo.ts";
import { generateChaptersFromJSON } from "../services/generateChaptersFromJSON.ts";

import { Chapter, Section, Content, RichText, Block, BlockType } from "./types.ts";

const renderBlock = (block: Block, onDelete: () => void) => {
  switch (block.type) {
    case "paragraph":
      return (
        <div className="flex items-center">
          <p className="mb-2 flex-grow">{block.text}</p>
          <Button text="Delete" onClick={onDelete} styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 ml-2" />
        </div>
      );
    case "header":
      return (
        <div className="flex items-center">
          <h3 className="text-xl font-bold mb-2 flex-grow">{block.text}</h3>
          <Button text="Delete" onClick={onDelete} styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 ml-2" />
        </div>
      );
    case "unordered-list-item":
      return (
        <div className="flex items-center">
          <li className="flex-grow">{block.text}</li>
          <Button text="Delete" onClick={onDelete} styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 ml-2" />
        </div>
      );
    default:
      return null;
  }
};

const AddBlockButton = ({ onAdd, text }) => (
  <Button
    text={text}
    onClick={onAdd}
    styles="bg-green-500 hover:bg-green-600 text-white rounded px-2 py-1 mr-2 mt-2"
    icon={IconPlus}
  />
);

const ChapterSection = ({ section, depth = 1, onUpdate, onDelete }: { section: Section, depth?: number, onUpdate: (updatedSection: Section) => void, onDelete: () => void }) => {
  const HeadingTag = `h${Math.min(depth + 2, 6)}` as keyof JSX.IntrinsicElements;

  const addBlock = (type: BlockType) => {
    const newBlock: Block = { type, text: "" };
    const updatedContent: RichText = section.content
      ? { blocks: [...section.content.blocks, newBlock] }
      : { blocks: [newBlock] };
    onUpdate({ ...section, content: updatedContent });
  };

  const updateBlock = (index: number, updatedBlock: Block) => {
    if (section.content) {
      const updatedBlocks = [...section.content.blocks];
      updatedBlocks[index] = updatedBlock;
      onUpdate({ ...section, content: { blocks: updatedBlocks } });
    }
  };

  const deleteBlock = (index: number) => {
    if (section.content) {
      const updatedBlocks = section.content.blocks.filter((_, i) => i !== index);
      onUpdate({ ...section, content: { blocks: updatedBlocks } });
    }
  };

  const addSubsection = () => {
    const newSubsection: Section = { title: "New Subsection", content: { blocks: [] } };
    const updatedSections = section.sections ? [...section.sections, newSubsection] : [newSubsection];
    onUpdate({ ...section, sections: updatedSections });
  };

  return (
    <div className={`ml-${depth * 4} border-l-2 border-gray-200 pl-4 my-4`}>
      <div className="flex items-center justify-between">
        <HeadingTag className="font-bold mt-2 text-lg">{section.title}</HeadingTag>
        <Button text="Delete Section" onClick={onDelete} styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1" />
      </div>
      {section.content && section.content.blocks.map((block, index) => (
        <div key={index}>
          {renderBlock(block, () => deleteBlock(index))}
          <input
            type="text"
            value={block.text}
            onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
            className="w-full p-2 border rounded mb-2"
          />
        </div>
      ))}
      <div className="flex flex-wrap">
        <AddBlockButton onAdd={() => addBlock("paragraph")} text="Add Paragraph" />
        <AddBlockButton onAdd={() => addBlock("header")} text="Add Header" />
        <AddBlockButton onAdd={() => addBlock("unordered-list-item")} text="Add List Item" />
        <AddBlockButton onAdd={addSubsection} text="Add Subsection" />
      </div>
      {section.sections?.map((subSection, index) => (
        <ChapterSection
          key={index}
          section={subSection}
          depth={depth + 1}
          onUpdate={(updatedSubSection) => {
            const updatedSections = [...(section.sections || [])];
            updatedSections[index] = updatedSubSection;
            onUpdate({ ...section, sections: updatedSections });
          }}
          onDelete={() => {
            const updatedSections = (section.sections || []).filter((_, i) => i !== index);
            onUpdate({ ...section, sections: updatedSections });
          }}
        />
      ))}
    </div>
  );
};

const ChapterComponent = ({ chapter, onUpdate, onDelete }: { chapter: Chapter, onUpdate: (updatedChapter: Chapter) => void, onDelete: () => void }) => {
  const addSection = () => {
    const newSection: Section = { title: "New Section", content: { blocks: [] } };
    const updatedSections = [...chapter.sections, newSection];
    onUpdate({ ...chapter, sections: updatedSections });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{chapter.title}</h2>
        <Button text="Delete Chapter" onClick={onDelete} styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1" />
      </div>
      {chapter.imageUrl && (
        <img src={chapter.imageUrl} alt={chapter.title || 'Chapter image'} className="w-full h-32 object-cover rounded-t-lg mb-2" />
      )}
      {chapter.description && chapter.description.blocks.map((block, index) => (
        <div key={index}>{renderBlock(block, () => {})}</div>
      ))}
      {chapter.sections.map((section, index) => (
        <ChapterSection
          key={index}
          section={section}
          onUpdate={(updatedSection) => {
            const updatedSections = [...chapter.sections];
            updatedSections[index] = updatedSection;
            onUpdate({ ...chapter, sections: updatedSections });
          }}
          onDelete={() => {
            const updatedSections = chapter.sections.filter((_, i) => i !== index);
            onUpdate({ ...chapter, sections: updatedSections });
          }}
        />
      ))}
      <AddBlockButton onAdd={addSection} text="Add Section" />
    </div>
  );
};

export default function HomeContent() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const { error } = useLoadChapters(dbName, storeName, dbVersion);
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const loadChapters = async () => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(storeName, "readonly");
        const objectStore = transaction.objectStore(storeName);
        const getAll = objectStore.getAll();
        getAll.onsuccess = () => {
          setChapters(getAll.result);
        };
      };
    };

    loadChapters();
  }, []);

  useEffect(() => {
    window.scrollTo(0, scrollPositionRef.current);
  }, [chapters]);

  const handlePrint = async () => {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chapters),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "resource_roadmap.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleGenerate = async () => {
    console.log("Generate button clicked");
    try {
      await generateChaptersFromJSON(dbName, storeName);
      console.log("Generation completed successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error generating chapters:", error);
    }
  };

  const updateChapter = (updatedChapter: Chapter) => {
    scrollPositionRef.current = window.pageYOffset;

    const request = indexedDB.open(dbName, dbVersion);
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);
      objectStore.put(updatedChapter);
      setChapters(chapters.map(ch => ch.id === updatedChapter.id ? updatedChapter : ch));
    };
  };

  const deleteChapter = (chapterId: string) => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);
      objectStore.delete(chapterId);
      setChapters(chapters.filter(ch => ch.id !== chapterId));
    };
  };

  const addNewChapter = () => {
    const newChapter: Chapter = {
      id: Date.now().toString(),
      title: "New Chapter",
      sections: [],
      description: { blocks: [] }
    };
    const request = indexedDB.open(dbName, dbVersion);
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);
      objectStore.add(newChapter);
      setChapters([...chapters, newChapter]);
    };
  };

  const clearAllChapters = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);

      request.onerror = function (event: Event) {
        console.error("Error opening database:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = function (event: Event) {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readwrite");
        const objectStore = transaction.objectStore(storeName);

        const clearRequest = objectStore.clear();

        clearRequest.onsuccess = function () {
          console.log("All chapters cleared from IndexedDB");
          db.close();
          resolve();
        };

        clearRequest.onerror = function (event: Event) {
          console.error(
            "Error clearing chapters from IndexedDB:",
            event.target.error,
          );
          db.close();
          reject(event.target.error);
        };
      };
    })
      .then(() => {
        setChapters([]);
      })
      .catch((error) => {
        console.error("Error clearing chapters:", error);
      });
  };

  return (
    <div>
      <Head>
        <title>Resource Roadmap Editor</title>
      </Head>
      <main className="flex flex-col items-center justify-start my-10 p-4 mx-auto max-w-screen-lg">
        <div className="bg-gray-800 text-white w-full rounded-lg p-8 mb-10">
          <h1 className="text-3xl font-bold mb-4">Resource Roadmap</h1>
          <p className="mb-4">Welcome to Your Local Resource Publication Creator!</p>
          <Button
            text="Generate Example Chapters"
            styles="bg-white text-gray-800 rounded px-4 py-2 mb-2 w-full"
            onClick={handleGenerate}
          />
          <Button
            text="Print Your Roadmap"
            styles="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 w-full"
            onClick={handlePrint}
          />
        </div>
        
        <div className="w-full flex-col justify-between mb-10">
          <h2 className="font-bold text-2xl w-3/5 text-left mb-4">Chapters</h2>
          <div className="flex flex-col sm:flex-row justify-between w-full">
            <Button
              text="Add New Chapter"
              onClick={addNewChapter}
              styles="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 rounded-md py-2 px-4 text-white transition-colors focus:outline-none outline-none"
              icon={IconPlus}
            />
            <Button
              text="Delete All Chapters"
              onClick={clearAllChapters}
              styles="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-md py-2 px-4 transition-colors focus:outline-none outline-none"
              icon={IconX}
            />
          </div>
        </div>
        
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapters.map(chapter => (
            <ChapterComponent
              key={chapter.id}
              chapter={chapter}
              onUpdate={updateChapter}
              onDelete={() => deleteChapter(chapter.id)}
            />
          ))}
        </div>
        
        <Footer />
      </main>
    </div>
  );
}