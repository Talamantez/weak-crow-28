import { useEffect, useRef, useState } from "preact/hooks";
import { Head } from "$fresh/runtime.ts";
import Footer from "../components/Footer.tsx";
import Button from "../components/Button.tsx";
import IconPlus from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/plus.tsx";
import IconX from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/x.tsx";
import IconArrowsSort from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/arrows-sort.tsx";
import IconChevronDown from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/chevron-down.tsx";
import IconChevronUp from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/chevron-up.tsx";
import IconCheck from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/check.tsx";
import { useLoadChapters } from "../services/useLoadChapters.ts";
import { dbName, dbVersion, storeName } from "../util/dbInfo.ts";
import { generateChaptersFromJSON } from "../services/generateChaptersFromJSON.ts";
import { PdfPreview } from "./PdfPreview.tsx";
import NewChapterModal from "./NewChapterModal.tsx";
import ConfirmationModal from "./ConfirmationModal.tsx";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(chapter.description);

  useEffect(() => {
    setDescription(chapter.description);
  }, [chapter.description]);

  const toggleInclude = () => {
    onUpdate({ ...chapter, isIncluded: !chapter.isIncluded });
  };

  const handleDeleteClick = () => {
    setIsConfirmModalOpen(true);
  };

  const addSection = () => {
    const newSection: Section = {
      title: "New Section",
      description: { blocks: [] },
    };
    const updatedSections = [...chapter.sections, newSection];
    onUpdate({ ...chapter, sections: updatedSections });
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleDescriptionChange = (e: Event) => {
    const newDescription = (e.target as HTMLTextAreaElement).value;
    setDescription(newDescription);
  };

  const handleDescriptionBlur = () => {
    if (description !== chapter.description) {
      onUpdate({ ...chapter, description });
    }
  };

  const handleDescriptionSave = () => {
    onUpdate({ ...chapter, description });
    setIsEditingDescription(false);
  };

  return (
    <div class="bg-white rounded-lg shadow-md p-4 mb-4 border-2 border-green-500">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <Button
            text=""
            onClick={toggleCollapse}
            styles="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 mr-2"
            icon={isCollapsed ? IconChevronDown : IconChevronUp}
          />
          <button
            onClick={toggleInclude}
            class={`mr-2 w-6 h-6 flex items-center justify-center border-2 rounded ${
              chapter.isIncluded
                ? "bg-blue-500 border-blue-500"
                : "border-gray-400"
            }`}
          >
            {chapter.isIncluded && <IconCheck class="w-4 h-4 text-white" />}
          </button>
          <h2 class="text-xl font-bold bg-purple-200 text-purple-800 p-2 rounded">
            {chapter.title}
          </h2>
        </div>
        <div class="flex items-center">
          <Button
            text="Delete Chapter"
            onClick={handleDeleteClick}
            styles="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1"
          />
        </div>
      </div>
      {!isCollapsed && (
        <>
          {chapter.imageUrl && (
            <img
              src={chapter.imageUrl}
              alt={chapter.title || "Chapter image"}
              class="w-full h-32 object-cover rounded-t-lg mb-2"
            />
          )}
          <p class="flex-grow bg-purple-200 text-purple-800 p-2 rounded mr-2">
            {chapter.description}
          </p>
          <div>
            <input
              type="text"
              value={description}
              onChange={handleDescriptionChange}
              class="w-full p-2 border-2 border-blue-500 rounded mb-2 focus:(outline-none ring-4 ring-yellow-400)"
            />
            <Button
              text="Save"
              onClick={handleDescriptionSave}
              styles="bg-green-500 hover:bg-green-600 text-white rounded px-4 py-2 mr-2"
            />
            <Button
              text="Cancel"
              onClick={() => {
                setIsEditingDescription(false);
                setDescription(chapter.description);
              }}
              styles="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2"
            />
          </div>
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
                const updatedSections = chapter.sections.filter((_, i) =>
                  i !== index
                );
                onUpdate({ ...chapter, sections: updatedSections });
              }}
              activeBlock={activeBlock}
              setActiveBlock={setActiveBlock}
            />
          ))}
          <AddBlockButton onAdd={addSection} text="Add Section" />
        </>
      )}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={onDelete}
        message={`Are you sure you want to delete the chapter "${chapter.title}"? This action cannot be undone.`}
      />
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
  const HeadingTag = `h${
    Math.min(depth + 2, 6)
  }` as keyof JSX.IntrinsicElements;

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
      const updatedBlocks = section.description.blocks.filter((_, i) =>
        i !== index
      );
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
            const updatedSections = (section.sections || []).filter((_, i) =>
              i !== index
            );
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
  const [isReordering, setIsReordering] = useState(false);
  const [draggedChapter, setDraggedChapter] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState("");

  const showConfirmModal = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setIsConfirmModalOpen(true);
  };

  const handleDeleteAllChapters = () => {
    showConfirmModal(
      "Are you sure you want to delete all chapters? This action cannot be undone.",
      clearAllChapters,
    );
  };

  const onDragStart = (e: DragEvent, chapterId: string) => {
    setDraggedChapter(chapterId);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", chapterId);
    }
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  };

  const onDrop = (e: DragEvent, targetChapterId: string) => {
    e.preventDefault();
    const sourceChapterId = draggedChapter;
    if (sourceChapterId !== targetChapterId) {
      setChapters((prevChapters) => {
        const newChapters = [...prevChapters];
        const sourceIndex = newChapters.findIndex((ch) =>
          ch.index === sourceChapterId
        );
        const targetIndex = newChapters.findIndex((ch) =>
          ch.index === targetChapterId
        );
        const [removed] = newChapters.splice(sourceIndex, 1);
        newChapters.splice(targetIndex, 0, removed);
        return newChapters;
      });
      updateChapterOrder(chapters);
    }
    setDraggedChapter(null);
  };

  const updateChapterOrder = async (newChapters) => {
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);

      for (let i = 0; i < newChapters.length; i++) {
        const chapter = newChapters[i];
        chapter.index = i.toString();
        await store.put(chapter);
      }

      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });

      db.close();
    } catch (error) {
      console.error("Error updating chapter order:", error);
      // Handle error (e.g., show an error message to the user)
    }
  };

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
            const newObjectStore = newDb.transaction(storeName).objectStore(
              storeName,
            );
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
      const includedChapters = chapters.filter((chapter) => chapter.isIncluded);
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(includedChapters),
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
        prevChapters.map((ch) => {
          return ch.index === updatedChapter.index ? { ...updatedChapter } : ch;
        })
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
      setChapters(chapters.filter((ch) => ch.index !== chapterId));
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
                text={isReordering ? "Save Order" : "Reorder Chapters"}
                onClick={() => setIsReordering(!isReordering)}
                styles="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md py-2 px-4 transition-colors focus:outline-none outline-none"
                icon={IconArrowsSort}
              />
              <Button
                text="Delete All Chapters"
                onClick={handleDeleteAllChapters}
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
              <div
                className={`w-full grid grid-cols-1 md:grid-cols-2 gap-4 ${
                  isReordering ? "cursor-move" : ""
                }`}
              >
                {chapters.map((chapter) => (
                  <div
                    key={chapter.index}
                    draggable={isReordering}
                    onDragStart={(e) =>
                      isReordering && onDragStart(e, chapter.index)}
                    onDragOver={(e) => isReordering && onDragOver(e)}
                    onDrop={(e) => isReordering && onDrop(e, chapter.index)}
                    className={`relative ${
                      isReordering
                        ? "border-2 border-dashed border-gray-400 p-2"
                        : ""
                    }`}
                  >
                    {isReordering && (
                      <div className="absolute top-0 left-0 right-0 bg-gray-200 text-center text-sm py-1">
                        Drag to reorder
                      </div>
                    )}
                    <ChapterComponent
                      chapter={chapter}
                      onUpdate={updateChapter}
                      onDelete={() => deleteChapter(chapter.index)}
                    />
                  </div>
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
        onSave={() => {
          setIsModalOpen(false);
          window.location.reload();
        }}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmAction}
        message={confirmMessage}
      />
    </div>
  );
}
