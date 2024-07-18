import { useEffect, useRef, useState } from "preact/hooks";
import { Head } from "$fresh/runtime.ts";
import Footer from "../components/Footer.tsx";
import Button from "../components/Button.tsx";
import IconPlus from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/plus.tsx";
import IconX from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/x.tsx";
import { useLoadChapters } from "../services/useLoadChapters.ts";
import { dbName, dbVersion, storeName } from "../util/dbInfo.ts";
import { generateChaptersFromJSON } from "../services/generateChaptersFromJSON.ts";
import { PdfPreview } from "./PdfPreview.tsx";
import NewChapterModal from "./NewChapterModal.tsx";

import {
  Block,
  BlockType,
  Chapter,
  Content,
  RichText,
  Section,
} from "./types.ts";

const RenderBlock = ({ block, onDelete, isActive, setActiveBlock }) => {
  const baseClasses = "mb-2 p-2 rounded transition-all duration-300";
  const activeClasses = isActive ? "border-4 border-yellow-400 shadow-lg" : "";
  const displayClasses = "bg-purple-200 text-purple-800";

  switch (block.type) {
    case "paragraph":
      return (
        <div
          class={`flex items-center ${baseClasses} ${activeClasses}`}
          onClick={() => setActiveBlock(block.id)}
        >
          <p class={`flex-grow ${displayClasses}`}>{block.text}</p>
          <Button
            text="Delete"
            onClick={onDelete}
            styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 ml-2"
          />
        </div>
      );
    case "header":
      return (
        <div
          class={`flex items-center ${baseClasses} ${activeClasses}`}
          onClick={() => setActiveBlock(block.id)}
        >
          <h3 class={`text-xl font-bold flex-grow ${displayClasses}`}>
            {block.text}
          </h3>
          <Button
            text="Delete"
            onClick={onDelete}
            styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 ml-2"
          />
        </div>
      );
    case "unordered-list-item":
      return (
        <div
          class={`flex items-center ${baseClasses} ${activeClasses}`}
          onClick={() => setActiveBlock(block.id)}
        >
          <li class={`flex-grow ${displayClasses}`}>{block.text}</li>
          <Button
            text="Delete"
            onClick={onDelete}
            styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 ml-2"
          />
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

const ChapterComponent = (
  { chapter, onUpdate, onDelete }: {
    chapter: Chapter;
    onUpdate: (updatedChapter: Chapter) => void;
    onDelete: () => void;
  },
) => {
  const [activeBlock, setActiveBlock] = useState(null);

  const addSection = () => {
    const newSection: Section = {
      title: "New Section",
      description: { blocks: [] },
    };
    const updatedSections = [...chapter.sections, newSection];
    onUpdate({ ...chapter, sections: updatedSections });
  };

  return (
    <div class="bg-white rounded-lg shadow-md p-4 mb-4 border-2 border-green-500">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold bg-purple-200 text-purple-800 p-2 rounded">
          {chapter.title}
        </h2>
        <Button
          text="Delete Chapter"
          onClick={onDelete}
          styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1"
        />
      </div>
      {chapter.imageUrl && (
        <img
          src={chapter.imageUrl}
          alt={chapter.title || "Chapter image"}
          class="w-full h-32 object-cover rounded-t-lg mb-2"
        />
      )}
      <p class="mb-4 bg-purple-200 text-purple-800 p-2 rounded">
        {chapter.description}
      </p>
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
          activeBlock={activeBlock}
          setActiveBlock={setActiveBlock}
        />
      ))}
      <AddBlockButton onAdd={addSection} text="Add Section" />
    </div>
  );
};

const ChapterSection = ({
  section,
  depth = 1,
  onUpdate,
  onDelete,
  activeBlock,
  setActiveBlock,
}: {
  section: Section;
  depth?: number;
  onUpdate: (updatedSection: Section) => void;
  onDelete: () => void;
  activeBlock: string | null;
  setActiveBlock: (id: string | null) => void;
}) => {
  const HeadingTag = `h${Math.min(depth + 2, 6)}` as keyof JSX.IntrinsicElements;

  const addBlock = (type: string) => {
    const newBlock: Block = { type, text: "" };
    const updatedDescription = section.description
      ? { blocks: [...section.description.blocks, newBlock] }
      : { blocks: [newBlock] };
    onUpdate({ ...section, description: updatedDescription });
  };

  const updateBlock = (index: number, updatedBlock: Block) => {
    if (section.description) {
      const updatedBlocks = [...section.description.blocks];
      updatedBlocks[index] = updatedBlock;
      onUpdate({ ...section, description: { blocks: updatedBlocks } });
    }
  };

  const deleteBlock = (index: number) => {
    if (section.description) {
      const updatedBlocks = section.description.blocks.filter((_, i) => i !== index);
      onUpdate({ ...section, description: { blocks: updatedBlocks } });
    }
  };

  const addSubsection = () => {
    const newSubsection: Section = {
      title: "New Subsection",
      description: { blocks: [] },
    };
    const updatedSections = section.sections
      ? [...section.sections, newSubsection]
      : [newSubsection];
    onUpdate({ ...section, sections: updatedSections });
  };

  return (
    <div class={`ml-${depth * 4} border-l-2 border-blue-500 pl-4 my-4`}>
      <div class="flex items-center justify-between">
        <HeadingTag class="font-bold mt-2 text-lg bg-purple-200 text-purple-800 p-2 rounded">
          {section.title}
        </HeadingTag>
        <Button
          text="Delete Section"
          onClick={onDelete}
          styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1"
        />
      </div>
      {section.description &&
        section.description.blocks.map((block, index) => (
          <div key={index}>
            <RenderBlock
              block={block}
              onDelete={() => deleteBlock(index)}
              isActive={activeBlock === block.id}
              setActiveBlock={setActiveBlock}
            />
            <input
              type="text"
              value={block.text}
              onChange={(e) =>
                updateBlock(index, {
                  ...block,
                  text: (e.target as HTMLInputElement).value,
                })}
              class="w-full p-2 border-2 border-blue-500 rounded mb-2 focus:(outline-none ring-4 ring-yellow-400)"
              onFocus={() => setActiveBlock(block.id)}
            />
          </div>
        ))}
      <div class="flex flex-wrap">
        <AddBlockButton
          onAdd={() => addBlock("paragraph")}
          text="Add Paragraph"
        />
        <AddBlockButton onAdd={() => addBlock("header")} text="Add Header" />
        <AddBlockButton
          onAdd={() => addBlock("unordered-list-item")}
          text="Add List Item"
        />
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
          activeBlock={activeBlock}
          setActiveBlock={setActiveBlock}
        />
      ))}
    </div>
  );
};

export default function HomeContent() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { error } = useLoadChapters(dbName, storeName, dbVersion);
  const scrollPositionRef = useRef(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadChapters = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const request = indexedDB.open(dbName, dbVersion);
      request.onerror = (event) => {
        console.error("Database error:", event.target.error);
        setLoadError("Failed to open database");
      };
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(storeName, "readonly");
        const objectStore = transaction.objectStore(storeName);
        const getAll = objectStore.getAll();
        getAll.onerror = (event) => {
          console.error("Error fetching chapters:", event.target.error);
          setLoadError("Failed to fetch chapters");
        };
        getAll.onsuccess = () => {
          const chapters = getAll.result;
          console.log("Chapters loaded:", chapters);
          setChapters(chapters);
        };
      };
    } catch (error) {
      console.error("Error in loadChapters:", error);
      setLoadError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChapters();
  }, []);

  useEffect(() => {
    const dbOpenRequest = indexedDB.open(dbName, dbVersion);
    dbOpenRequest.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.onversionchange = () => {
        db.close();
        alert("Database is outdated, please reload the page.");
      };
      const objectStore = db.transaction(storeName).objectStore(storeName);
      const countRequest = objectStore.count();
      countRequest.onsuccess = () => {
        const currentCount = countRequest.result;
        db.close();
        
        const checkForChanges = setInterval(() => {
          const newRequest = indexedDB.open(dbName, dbVersion);
          newRequest.onsuccess = (event) => {
            const newDb = (event.target as IDBOpenDBRequest).result;
            const newObjectStore = newDb.transaction(storeName).objectStore(storeName);
            const newCountRequest = newObjectStore.count();
            newCountRequest.onsuccess = () => {
              if (newCountRequest.result !== currentCount) {
                console.log("Database changed, reloading chapters");
                loadChapters();
                clearInterval(checkForChanges);
              }
              newDb.close();
            };
          };
        }, 1000); // Check every second

        return () => clearInterval(checkForChanges);
      };
    };
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

      setChapters((prevChapters) =>
        prevChapters.map((ch) =>
          ch.id === updatedChapter.id ? { ...updatedChapter } : ch
        )
      );
    };
  };

  const deleteChapter = (chapterId: string) => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);
      objectStore.delete(chapterId);
      setChapters(chapters.filter((ch) => ch.id !== chapterId));
    };
  };

  const addNewChapter = (newChapter: Chapter) => {
    alert("addNewChapter");
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onerror = (event) => {
        console.error("Database error:", event.target.error);
        setLoadError("Failed to open database");
        reject(event.target.error);
      };
      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = db.transaction(storeName, "readwrite");
        const objectStore = transaction.objectStore(storeName);
        
        const addRequest = objectStore.add(newChapter);
        
        addRequest.onerror = (event) => {
          console.error("Error adding new chapter:", event.target.error);
          setLoadError("Failed to add new chapter");
          reject(event.target.error);
        };
        
        addRequest.onsuccess = () => {
          console.log("New chapter added successfully to IndexedDB");
          setChapters(prevChapters => {
            const updatedChapters = [...prevChapters, newChapter];
            console.log("Updated chapters:", updatedChapters);
            return updatedChapters;
          });
          resolve();
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      };
    });
  };

  const handleAddNewChapter = async (newChapter: Chapter) => {
    try {
      await addNewChapter(newChapter);
      console.log("Chapter added successfully");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add new chapter:", error);
      setLoadError("Failed to add new chapter");
    }
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
      <main className="flex flex-row items-start justify-between my-10 p-4 mx-auto max-w-screen-xl">
        <div className="flex-grow mr-4">
          <div className="bg-gray-800 text-white w-full rounded-lg p-8 mb-10">
            <h1 className="text-3xl font-bold mb-4">Resource Roadmap</h1>
            <p className="mb-4">
              Welcome to Your Local Resource Publication Creator!
            </p>
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
            <h2 className="font-bold text-2xl w-3/5 text-left mb-4">
              Chapters
            </h2>
            <div className="flex flex-col sm:flex-row justify-between w-full">
              <Button
                text="Add New Chapter"
                onClick={() => setIsModalOpen(true)}
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

          {loading
            ? <p>Loading chapters...</p>
            : loadError
            ? <p className="text-red-500">Error: {loadError}</p>
            : chapters.length === 0
            ? (
              <p>
                No chapters found. Try adding a new chapter or generating
                example chapters.
              </p>
            )
            : (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapters.map((chapter) => (
                  <ChapterComponent
                    key={chapter.id || chapter.index}
                    chapter={chapter}
                    onUpdate={updateChapter}
                    onDelete={() => deleteChapter(chapter.id || chapter.index)}
                  />
                ))}
              </div>
            )}

          <Footer />
        </div>

        <div className="w-1/3 sticky top-0">
          <h2 className="font-bold text-2xl mb-4">PDF Preview</h2>
          <PdfPreview chapters={chapters} />
        </div>
      </main>
      <NewChapterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(newChapter) => {
          console.log("New chapter saved:", newChapter);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}
