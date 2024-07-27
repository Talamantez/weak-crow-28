import { useState, useEffect } from "preact/hooks";
import { PdfPreview } from "../components/PdfPreview.tsx";
import { ChapterComponent } from "../components/ChapterComponent.tsx";
import IconChevronLeft from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/chevron-left.tsx";
import IconChevronRight from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/chevron-right.tsx";
import IconSearch from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/search.tsx";

export const PdfPreviewChapterEditor = ({
  chapters,
  onUpdate,
  onDelete,
  onToggleExpand,
  isReordering,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  highlightedElement,
  highlightClass,
  searchTerm,
  setSearchTerm,
  searchResults,
  setSearchResults
}) => {
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  const includedChapters = chapters.filter((ch) => ch.isIncluded);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handlePrevChapter = () => {
    setSelectedChapterIndex((prev) =>
      prev > 0 ? prev - 1 : includedChapters.length - 1
    );
  };

  const handleNextChapter = () => {
    setSelectedChapterIndex((prev) =>
      prev < includedChapters.length - 1 ? prev + 1 : 0
    );
  };

  const handleSearch = (event: Event) => {
    const value = (event.target as HTMLInputElement).value;
    setLocalSearchTerm(value);
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
    
    if (results.length > 0) {
      const firstResultIndex = includedChapters.findIndex(ch => ch.index === results[0].index);
      if (firstResultIndex !== -1) {
        setSelectedChapterIndex(firstResultIndex);
        setShowPreview(false);
      }
    }
  };

  const selectedChapter = includedChapters[selectedChapterIndex];

  return (
    <div class='w-full lg:w-1/3 sticky top-0 mt-10 lg:mt-0 flex flex-col h-screen'>
      <h2 class='font-bold text-2xl mb-4'>PDF Preview & Chapter Editor</h2>
      <div class='flex flex-col mb-4'>
        <div class='flex justify-between items-center mb-2'>
          <button
            onClick={() => setShowPreview(!showPreview)}
            class='bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2'
          >
            {showPreview ? 'Show Editor' : 'Show Preview'}
          </button>
          {!showPreview && (
            <div class='flex items-center'>
              <button onClick={handlePrevChapter} class='mr-2'>
                <IconChevronLeft />
              </button>
              <span>Chapter {selectedChapterIndex + 1} of {includedChapters.length}</span>
              <button onClick={handleNextChapter} class='ml-2'>
                <IconChevronRight />
              </button>
            </div>
          )}
        </div>
        <div class="relative flex-grow mr-2 mb-4 sm:mb-0">
          <input
            type="text"
            placeholder="Search chapters and sections..."
            value={localSearchTerm}
            onInput={handleSearch}
            class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <IconSearch class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      {showPreview ? (
        <div class='flex-grow overflow-auto'>
          <PdfPreview chapters={includedChapters} />
        </div>
      ) : (
        <div class='flex-grow overflow-auto'>
          <div
            key={selectedChapter.index}
            id={`chapter-${selectedChapter.index}`}
            class={`relative transition-all duration-300 ${
              highlightedElement === `chapter-${selectedChapter.index}` ? highlightClass : ""
            } ${isReordering ? "border-2 border-dashed border-gray-400 p-4 pt-10" : ""}`}
            draggable={isReordering}
            onDragStart={(e) => isReordering && onDragStart(e, selectedChapter.index)}
            onDragOver={(e) => isReordering && onDragOver(e)}
            onDragEnd={onDragEnd}
            onDrop={(e) => isReordering && onDrop(e, selectedChapter.index)}
          >
            {isReordering && (
              <div class='absolute top-0 left-0 right-0 text-center text-sm'>
                Drag to reorder
              </div>
            )}
            <ChapterComponent
              chapter={selectedChapter}
              onUpdate={onUpdate}
              onDelete={() => onDelete(selectedChapter.index)}
              isExpanded={true}
              onToggleExpand={() => onToggleExpand(selectedChapter.index)}
              searchTerm={searchTerm}
              hideExpandButton={true}
              hideCheckbox={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};