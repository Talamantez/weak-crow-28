import { useEffect, useState } from "preact/hooks";
import { Section } from "../util/SectionData.ts"

export default function SectionData({ title, chapterTitle }: { title: string, chapterTitle: string }) {
  const [description, setDescription] = useState("");
  const [subSections, setSubSections] = useState([""]);
  const [isAddingSubSection, setIsAddingSubSection] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem(`Chapter Manager: " + ${chapterTitle}`)!,
    );
    setDescription(stored.sections.description);
    setSubSections(stored.subSections);
  }, []);

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem(`Chapter Manager: " + ${chapterTitle}`)!,
    );
    setSubSections(stored.subSections);
  }, [isAddingSubSection]);

  const deleteSection = () => {
    localStorage.removeItem(`Chapter Manager: " + ${chapterTitle}`);
    window.location.href = `/${chapterTitle}`;
  };

  const deleteSubSection = (subSection: string) => {
    const tempSubSections = subSections.filter((t) => t !== subSection);
    localStorage.setItem(
      "Chapter Manager:  " + chapterTitle + "/" + title,
      JSON.stringify({
        chapterTitle: chapterTitle,
        title: title,
        description: description,
        subSections: tempSubSections,
      }),
    );
    location.reload();
  };

  return (
    <>
      <div class="w-full flex items-center justify-between flex-col md:flex-row">
        <div class="w-full md:w-4/5 flex items-center justify-start flex-col">
          <a
            href={`/${chapterTitle}/${title}`}
            class="text-gray-500 hover:text-blue-500 transition-colors w-full text-left mb-5"
          >
            ⬅️ Back
          </a>
          <h1 class="font-bold text-2xl text-left w-full">{title}</h1>
          <p class="text-left w-full">{description}</p>
        </div>
        <div class="w-full md:w-1/5 flex items-center justify-start md:justify-end">
          <button
            onClick={() => deleteSection()}
            class="bg-red-500 hover:bg-red-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
          >
            Delete
          </button>
        </div>
      </div>

      <div class="flex flex-col items-start justify-start w-full mt-5 gap-y-5">
        {subSections.map((subSection) => (
          <div class="border w-full p-5 rounded-md flex items-center justify-between flex-col md:flex-row">
            <p class="text-left w-full md:w-3/5">{subSection}</p>
            <div class="flex items-center justify-center md:justify-end w-full md:w-2/5 gap-x-2 md:gap-x-5 mt-2 md:mt-0">
              <button
                onClick={() => deleteSubSection(subSection)}
                class="border border-red-500 hover:bg-red-500 rounded-md py-1 px-5 text-red-500 hover:text-gray-100 transition-colors focus:outline-none outline-none"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <AddSubSection
        chapterTitle={chapterTitle}
        sectionTitle={title}
        description={description}
        subSections={subSections}
        isAddingSubSection={isAddingSubSection}
        setIsAddingSubSection={setIsAddingSubSection}
      />

      <button
        onClick={() => setIsAddingSubSection(true)}
        class="text-gray-500 border border-gray-500 hover:(text-blue-500 border-blue-500) rounded-md py-1 px-2 transition-colors flex items-center justify-center mt-5 focus:outline-none"
      >
        + Add SubSection
      </button>
    </>
  );
}

interface AddSubSectionProps {
  chapterTitle: string;
  sectionTitle: string;
  description: string;
  subSections: string[];
  isAddingSubSection: boolean;
  setIsAddingSubSection: (isAddingSubSection: boolean) => void;
}

export function AddSubSection(
  { chapterTitle, sectionTitle, description, subSections, isAddingSubSection, setIsAddingSubSection }:
    AddSubSectionProps,
) {

  const [subSection, setSubSection] = useState("");

  const addSubSection = () => {
    let newSubSections: string[] = [];
    let newSections: Section[] = [];

    if (subSection) {
      if (subSections[0] === "") newSubSections = [subSection];
      else newSubSections = [...subSections, subSection];

      const chapter = JSON.parse(localStorage.getItem("Chapter Manager: " + chapterTitle))
      
      // Update the 
      // newSections = chapter.sections.map((sect:Section){
      //   sect.title !== sectionTitle ? chapter.section: })

        newSections = chapter.sections.map(function(s:Section) {
          if(s.title !== sectionTitle){
            return s
          } else {
            s.subSections = [...s.subSections, subSection]
            return s
          }
        });
        alert(JSON.stringify(newSections))

      localStorage.setItem(
        "Chapter Manager: " + chapterTitle,
        JSON.stringify(
          {
            title: chapter.title,
            description: chapter.description,
            sections: newSections
          }
        )
      )

      // localStorage.setItem(
      //   "Chapter Manager:  " + chapterTitle,
      //   JSON.stringify(
      //     {
      //       chapterTitle: chapterTitle,
      //       title: sectionTitle,
      //       description: description,
      //       subSections: newSubSections,
      //   }
      //   ),
      // );
    }

    window.location.href = `/${chapterTitle}`

    setIsAddingSubSection(false);
  };

  return (
    <div class={isAddingSubSection ? "block w-full mt-5" : "hidden"}>
      <input
        type="text"
        placeholder="SubSection Name"
        onChange={(e) => setSubSection((e.target as HTMLInputElement).value)}
        class="w-full border-2 rounded-md mt-2 p-5 text-left border-blue-500 focus:border-blue-600 outline-none"
      />
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
