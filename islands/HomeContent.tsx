import { useEffect, useRef, useState } from "preact/hooks";
import { apply } from "https://esm.sh/@twind/core@1.1.3";
import { Head } from "$fresh/runtime.ts";
import Footer from "../components/Footer.tsx";
import Button from "../components/Button.tsx";
import IconPlus from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/plus.tsx";
import IconX from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/x.tsx";
import IconArrowsSort from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/arrows-sort.tsx";
import IconCheck from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/check.tsx";
import IconSearch from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/search.tsx";
import { useLoadChapters } from "../services/useLoadChapters.ts";
import { dbName, dbVersion, storeName } from "../util/dbInfo.ts";
import { generateChaptersFromJSON } from "../services/generateChaptersFromJSON.ts";
import { PdfPreview } from "../components/PdfPreview.tsx";
import NewChapterModal from "../components/NewChapterModal.tsx";
import ConfirmationModal from "../components/ConfirmationModal.tsx";
import { ChapterComponent } from "../components/ChapterComponent.tsx";
import { VersionManagementModal } from "../components/VersionManagementModal.tsx";
import {
  deleteVersion,
  loadVersion,
  loadVersions,
  RoadmapVersion,
  saveVersion,
} from "../util/versionManagement.ts";

import { Chapter } from "../util/types.ts";
import { useSearch } from "./useSearch.tsx";
import { SearchBar } from "./SearchBar.tsx";
import { SearchResults } from "./SearchResults.tsx";

export default function HomeContent() {
  const [versions, setVersions] = useState<RoadmapVersion[]>([]);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { error } = useLoadChapters(dbName, storeName, dbVersion);
  const [originalOrder, setOriginalOrder] = useState<Chapter[]>([]);
  const scrollPositionRef = useRef(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [draggedChapter, setDraggedChapter] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState("");
  // const [searchTerm, setSearchTerm] = useState("");
  // const [searchResults, setSearchResults] = useState<Chapter[]>([]);

  const initialSearchResults = [];

  const { searchTerm, setSearchTerm, searchResults, setSearchResults } =
    useSearch(initialSearchResults);

  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(),
  );
  const [highlightedElement, setHighlightedElement] = useState(null);

  const handleSearch = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

    const results = chapters.filter((chapter) =>
      chapter.title.toLowerCase().includes(value.toLowerCase()) ||
      chapter.description.toLowerCase().includes(value.toLowerCase()) ||
      chapter.sections.some((section) =>
        section.title.toLowerCase().includes(value.toLowerCase()) ||
        section.description?.blocks.some((block) =>
          block.text.toLowerCase().includes(value.toLowerCase())
        )
      )
    );

    setSearchResults(results);
  };

  const highlightClass = apply`transition-colors duration-300 bg-yellow-200`;

  const renderSearchResults = () => {
    if (searchTerm.trim() === "") {
      return null;
    }

    if (searchResults.length === 0) {
      return <p>No results found</p>;
    }

    return (
          <SearchResults
            searchTerm={searchTerm}
            searchResults={searchResults}
            onEditChapter={()=>console.log("edit chapter")}
            onEditSection={()=>console.log("edit section")}
          />
    );
  };

  // Function to handle scrolling
  const handleScroll = () => {
    globalThis.scrollTo({
      top: scrollPositionRef.current,
      behavior: "smooth",
    });
  };

  const toggleChapterExpansion = (chapterIndex: string) => {
    setExpandedChapters((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chapterIndex)) {
        newSet.delete(chapterIndex);
      } else {
        newSet.add(chapterIndex);
      }
      return newSet;
    });
  };

  const scrollToElement = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightedElement(id);
      setTimeout(() => setHighlightedElement(null), 2000);
    }
  };

  const updateScrollPosition = () => {
    scrollPositionRef.current = window.pageYOffset;
  };

  const startReordering = () => {
    setOriginalOrder([...chapters]);
    setIsReordering(true);
  };

  const cancelReordering = () => {
    setChapters(originalOrder);
    setIsReordering(false);
  };

  const saveReordering = async () => {
    updateScrollPosition();
    await updateChapterOrder(chapters);
    setIsReordering(false);
  };

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
      e.dataTransfer.setData("text/plain", chapterId);
    }
  };

  const onDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const onDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDropTarget(null);
  };

  const onDrop = (e: DragEvent, targetChapterId: string) => {
    e.preventDefault();
    updateScrollPosition();
    const sourceChapterId = e.dataTransfer?.getData("text/plain");

    if (sourceChapterId && sourceChapterId !== targetChapterId) {
      setChapters((prevChapters) => {
        const newChapters = [...prevChapters];
        const sourceIndex = newChapters.findIndex((ch) =>
          ch.index === sourceChapterId
        );
        const targetIndex = newChapters.findIndex((ch) =>
          ch.index === targetChapterId
        );

        if (sourceIndex !== -1 && targetIndex !== -1) {
          const [removed] = newChapters.splice(sourceIndex, 1);
          newChapters.splice(targetIndex, 0, removed);

          // Update indices
          return newChapters.map((ch, index) => ({
            ...ch,
            index: index.toString(),
          }));
        }

        return prevChapters;
      });
    }

    setDraggedChapter(null);
  };
  const onDragEnd = () => {
    setDraggedChapter(null);
  };

  useEffect(() => {
    window.scrollTo(0, scrollPositionRef.current);
  }, [chapters]);

  useEffect(() => {
    if (!isReordering) {
      updateChapterOrder(chapters);
    }
  }, [chapters, isReordering]);

  const updateChapterOrder = async (newChapters) => {
    // updateScrollPosition();
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
    handleScroll();
  }, [chapters]);

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

  useEffect(() => {
    loadVersions().then(setVersions);
  }, []);

  const handleSaveVersion = async (name: string) => {
    await saveVersion(name, chapters);
    setVersions(await loadVersions());
  };

  const handleLoadVersion = async (id: string) => {
    const version = await loadVersion(id);
    if (version) {
      setChapters(version.chapters);
    }
  };

  const handleDeleteVersion = async (id: string) => {
    await deleteVersion(id);
    setVersions(await loadVersions());
  };

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
    updateScrollPosition();

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
    updateScrollPosition();
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
    updateScrollPosition();
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
      <main class="flex flex-col lg:flex-row items-start justify-between my-10 p-4 mx-auto max-w-screen-xl">
<div class="flex flex-row">
        <div class="flex-grow mr-4 w-full lg:w-2/3">
          <div class="bg-gray-800 text-white w-full rounded-lg p-8 mb-10">
            <h1 class="text-3xl font-bold mb-4">Resource Roadmap</h1>
            <p class="mb-4">
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
            <Button
              text="Manage Versions"
              onClick={() => setIsVersionModalOpen(true)}
              styles="bg-purple-500 hover:bg-purple-600 text-white rounded px-4 py-2 my-2"
            />
          </div>

          <div class="w-full mb-10">
            <h2 class="font-bold text-2xl w-full text-left mb-4">
              Chapters
            </h2>
            <div class="flex flex-col sm:flex-row justify-between w-full mb-4">
              <div class="relative flex-grow mr-2 mb-4 sm:mb-0">
                <input
                  type="text"
                  placeholder="Search chapters and sections..."
                  value={searchTerm}
                  onInput={handleSearch}
                  class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <IconSearch class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {renderSearchResults()}

            <div class="flex flex-col sm:flex-row justify-between w-full mt-4">
              <Button
                text="Add New Chapter"
                onClick={() => setIsModalOpen(true)}
                styles="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 rounded-md py-2 px-4 text-white transition-colors focus:outline-none outline-none"
                icon={IconPlus}
              />
              {isReordering
                ? (
                  <>
                    <Button
                      text="Save Order"
                      onClick={saveReordering}
                      styles="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-md py-2 px-4 transition-colors focus:outline-none outline-none mb-2 sm:mb-0"
                      icon={IconCheck}
                    />
                    <Button
                      text="Cancel"
                      onClick={cancelReordering}
                      styles="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-md py-2 px-4 transition-colors focus:outline-none outline-none"
                      icon={IconX}
                    />
                  </>
                )
                : (
                  <Button
                    text="Reorder Chapters"
                    onClick={startReordering}
                    styles="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md py-2 px-4 transition-colors focus:outline-none outline-none mb-2 sm:mb-0"
                    icon={IconArrowsSort}
                  />
                )}
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
            ? <p class="text-red-500">Error: {loadError}</p>
            : chapters.length === 0
            ? (
              <p>
                No chapters found. Try adding a new chapter or generating
                example chapters.
              </p>
            )
            : (
              <div
                class={`w-full grid grid-cols-1 gap-4 ${
                  isReordering ? "cursor-move" : ""
                }`}
              >
                {chapters.map((chapter) => (
                  <div
                    key={chapter.index}
                    id={`chapter-${chapter.index}`}
                    class={`relative transition-all duration-300 ${
                      highlightedElement === `chapter-${chapter.index}`
                        ? highlightClass
                        : ""
                    } ${
                      isReordering
                        ? "border-2 border-dashed border-gray-400 p-4 pt-10"
                        : ""
                    } ${draggedChapter === chapter.index ? "opacity-50" : ""}`}
                    draggable={isReordering}
                    onDragStart={(e) =>
                      isReordering && onDragStart(e, chapter.index)}
                    onDragOver={(e) => isReordering && onDragOver(e)}
                    onDragEnd={onDragEnd}
                    onDrop={(e) => isReordering && onDrop(e, chapter.index)}
                  >
                    {isReordering && (
                      <div class="absolute top-0 left-0 right-0 text-center text-sm">
                        Drag to reorder
                      </div>
                    )}
                    <ChapterComponent
                      chapter={chapter}
                      onUpdate={updateChapter}
                      onDelete={() => deleteChapter(chapter.index)}
                      isExpanded={expandedChapters.has(chapter.index)}
                      onToggleExpand={() =>
                        toggleChapterExpansion(chapter.index)}
                    />
                  </div>
                ))}
              </div>
            )}

          <Footer />
        </div>
     
     
        <div>
          <h2 class="font-bold text-2xl mb-4">PDF Preview</h2>
          <PdfPreview chapters={chapters.filter((ch) => ch.isIncluded)} />
        </div>
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
      <VersionManagementModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        onSave={handleSaveVersion}
        onLoad={handleLoadVersion}
        onDelete={handleDeleteVersion}
        versions={versions}
      />
    </div>
  );
}
