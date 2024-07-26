import { ChapterComponent } from "../components/ChapterComponent.tsx";

export const ChapterList = ({ chapters, isReordering, onUpdate, onDelete, expandedChapters, onToggleExpand, onDragStart, onDragOver, onDragEnd, onDrop, highlightedElement, highlightClass }) => (
  <div class={`w-full grid grid-cols-1 gap-4 ${isReordering ? "cursor-move" : ""}`}>
    {chapters.map((chapter) => (
      <div
        key={chapter.index}
        id={`chapter-${chapter.index}`}
        class={`relative transition-all duration-300 ${
          highlightedElement === `chapter-${chapter.index}` ? highlightClass : ""
        } ${isReordering ? "border-2 border-dashed border-gray-400 p-4 pt-10" : ""}`}
        draggable={isReordering}
        onDragStart={(e) => isReordering && onDragStart(e, chapter.index)}
        onDragOver={(e) => isReordering && onDragOver(e)}
        onDragEnd={onDragEnd}
        onDrop={(e) => isReordering && onDrop(e, chapter.index)}
      >
        {isReordering && (
          <div class={`absolute top-0 left-0 right-0 text-center text-sm`}>
            Drag to reorder
          </div>
        )}
        <ChapterComponent
          chapter={chapter}
          onUpdate={onUpdate}
          onDelete={() => onDelete(chapter.index)}
          isExpanded={false}
          onToggleExpand={() => onToggleExpand(chapter.index)}
        />
      </div>
    ))}
  </div>
);