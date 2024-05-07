import { useState } from "preact/hooks";
import { Section } from "./SectionData.ts";
import { safeSessionStorageSetItem } from "./safeSessionStorageSetItem.ts";
import { safeSessionStorageGetItem } from "./safeSessionStorageGetItem.ts";

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
    let newSubSections: string[] = [];
    let newSections: Section[] = [];

    if (subSection) {
      if (subSections[0] === "") newSubSections = [subSection];
      else newSubSections = [...subSections, subSection];

      const storedString = safeSessionStorageGetItem(
        `Chapter Manager: ${chapterTitle}`
      );
      if (!storedString) return console.error("No stored data found");
      const chapter = JSON.parse(storedString as string);

      newSections = chapter.sections.map(function (s: Section) {
        if (s.title !== sectionTitle) {
          return s;
        } else {
          s.subSections = [...s.subSections, subSection];
          return s;
        }
      });

      safeSessionStorageSetItem(
        "Chapter Manager: " + chapterTitle,
        JSON.stringify(
          {
            title: chapter.title,
            description: chapter.description,
            imageUrl: chapter.imageUrl,
            sections: newSections,
          }
        )
      );
    }

    location.reload();

    setIsAddingSubSection(false);
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
