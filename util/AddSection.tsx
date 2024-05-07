import { useEffect, useState } from "preact/hooks";
import { Section } from "./SectionData.ts";
import { safeSessionStorageSetItem } from "./safeSessionStorageSetItem.ts";
import { safeSessionStorageGetItem } from "./safeSessionStorageGetItem.ts";

export interface AddSectionProps {
  projectTitle: string;
  description: string;
  sections: Section[];
  isAddingSection: boolean;
  setIsAddingSection: (isAddingSection: boolean) => void;
}

export function AddSection(
  { projectTitle, sections, isAddingSection, setIsAddingSection }: AddSectionProps
) {
  const [description, setDescription] = useState("");

  const [title, setTitle] = useState("");
  const [section, setSection] = useState<Section>(
    {
      title: "",
      description: "",
      subSections: [],
      chapterTitle: projectTitle,
    }
  );

  useEffect(() => {
    if (title.trim() === "") return;
    setSection({
      title: title,
      description: description,
      subSections: section.subSections,
      chapterTitle: section.chapterTitle,
    });
  }, [title, description]);

  const addSection = () => {
    let newSections: Section[] = [];

    const stored = safeSessionStorageGetItem(
      `Chapter Manager: ${projectTitle}`
    );

    const chapter = JSON.parse(stored as string);

    if (section) {
      if (!section) newSections = [section];
      else newSections = [...sections, section];

      safeSessionStorageSetItem(
        "Chapter Manager: " + projectTitle,
        JSON.stringify({
          title: projectTitle,
          description: chapter.description,
          imageUrl: chapter.imageUrl,
          sections: newSections,
        })
      );
    }
    location.reload();

    setIsAddingSection(false);
  };

  return (
    <div class={isAddingSection ? "block w-full mt-5" : "hidden"}>
      <input 
        type="text"
        placeholder="Section Title"
        onChange={(e) => {
          setTitle((e.target as HTMLInputElement).value);
        }}
        class="w-full border-2 rounded-md mt-2 p-5 text-left border-blue-500 focus:border-blue-600 outline-none" />
      <textarea 
        type="text"
        placeholder="Section Description"
        onChange={(e) => {
          setDescription((e.target as HTMLInputElement).value);
        }}
        rows={10}
        class="w-full border-2 rounded-md mt-2 px-2 py-1 text-left border-blue-500 focus:border-blue-600 outline-none" />
      <div class="w-full flex items-center justify-between">
        <button 
          onClick={() => setIsAddingSection(false)}
          class="bg-red-500 hover:bg-red-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
        >
          Cancel
        </button>
        <button 
          onClick={() => addSection()}
          class="bg-blue-500 hover:bg-blue-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
        >
          Add
        </button>
      </div>
    </div>
  );
}
