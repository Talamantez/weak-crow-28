import { useEffect, useState } from "preact/hooks";
import { Section } from "./SectionData.ts";

export interface AddSectionProps {
  chapterTitle: string;
  description: string;
  sections: Section[];
  isAddingSection: boolean;
  setIsAddingSection: (isAddingSection: boolean) => void;
}

export function AddSection(
  { chapterTitle, sections, isAddingSection, setIsAddingSection }: AddSectionProps
) {
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [section, setSection] = useState<Section>(
    {
      title: "",
      description: "",
      subSections: [],
      chapterTitle: chapterTitle,
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
          const newSections = section ? [...sections, section] : [section];

          const updatedChapter = {
            ...chapter,
            sections: newSections,
          };

          const putRequest = objectStore.put(updatedChapter);

          putRequest.onsuccess = function () {
            location.reload();
            setIsAddingSection(false);
          };

          putRequest.onerror = function (event: Event) {
            console.error("Error updating chapter:", event.target.error);
          };
        }
      };

      getRequest.onerror = function (event: Event) {
        console.error("Error retrieving chapter:", event.target.error);
      };
    };
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