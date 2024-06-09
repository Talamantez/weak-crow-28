import { useState } from "preact/hooks";
import { Section } from "./SectionData.ts";

export interface AddSubSectionProps {
  isActive: boolean;
  chapterTitle: string;
  sectionTitle: string;
  subSections: string[];
  isAddingSubSection: boolean;
  setIsAddingSubSection: (isAddingSubSection: boolean) => void;
}

export function AddSubSection(
  {
    isActive, chapterTitle, sectionTitle, subSections, isAddingSubSection, setIsAddingSubSection,
  }: AddSubSectionProps
) {
  const [subSection, setSubSection] = useState("");

  const addSubSection = () => {
    if (subSection) {
      const dbName = "MyDatabase";
      const storeName = "Chapters";

      const request = indexedDB.open(dbName);

      request.onerror = function (event: Event) {
        console.error("Error opening database:", event.target.error);
      };

      request.onsuccess = function (event: Event) {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readwrite");
        const objectStore = transaction.objectStore(storeName);
        const getRequest = objectStore.get(chapterTitle);

        getRequest.onsuccess = function (event: Event) {
          const chapter = event.target.result;

          if (chapter) {
            const newSubSections = subSections[0] === "" ? [subSection] : [...subSections, subSection];
            const newSections = chapter.sections.map((s: Section) => {
              if (s.title !== sectionTitle) {
                return s;
              } else {
                s.subSections = [...s.subSections, subSection];
                return s;
              }
            });

            const updatedChapter = {
              ...chapter,
              sections: newSections,
            };

            const putRequest = objectStore.put(updatedChapter);

            putRequest.onsuccess = function () {
              location.reload();
              setIsAddingSubSection(false);
            };

            putRequest.onerror = function (event: Event) {
              console.error("Error updating chapter:", event.target.error);
            };
          } else {
            console.error("Chapter not found");
          }
        };

        getRequest.onerror = function (event: Event) {
          console.error("Error retrieving chapter:", event.target.error);
        };
      };
    }
  };

  return (
    <div
      class={isActive && isAddingSubSection
        ? "block w-full mt-5 ml-10"
        : "hidden"}
    >
      <input
        type="text"
        placeholder="SubSection Content"
        onChange={(e) => setSubSection((e.target as HTMLInputElement).value)}
        class="w-full border-2 rounded-md mt-2 p-5 text-left border-blue-500 focus:border-blue-600 outline-none" />
      <div class="w-full flex items-center justify-between">
        <button
          onClick={() => setIsAddingSubSection(false)}
          class="bg-red-500 hover:bg-red-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
        >
          Cancel
        </button>
        <button
          onClick={() => addSubSection()}
          class="bg-blue-500 hover:bg-blue-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
        >
          Add
        </button>
      </div>
    </div>
  );
}