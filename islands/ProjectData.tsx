import { useEffect, useState } from "preact/hooks";
import { Section } from "../util/SectionData.ts";

export default function ProjectData({ title }: { title: string }) {
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState<Section[]>([{
    title: "",
    description: "",
    subSections: [],
    chapterTitle: title,
  }]);
  const [activeSection, setActiveSection] = useState("");
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [isAddingSubSection, setIsAddingSubSection] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem(`Chapter Manager: ${title}`)!,
    );
    setDescription(stored.description);
    setSections(stored.sections);
  }, []);

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem(`Chapter Manager: ${title}`)!,
    );
    setSections(stored.sections);
  }, [isAddingSection]);

  const deleteProject = () => {
    localStorage.removeItem(`Chapter Manager: ${title}`);
    window.location.href = "/";
  };

  const deleteSection = (section: Section) => {
    const tempSections = sections.filter((t) => t.title !== section.title);
    localStorage.setItem(
      "Chapter Manager: " + title,
      JSON.stringify({
        title: title,
        description: description,
        sections: tempSections,
      }),
    );
    location.reload();
  };

  const deleteSubSection = (sectionTitle: string, subSection: string) => {

    const section = findSection(sections, sectionTitle);

    if(!section) return console.log(`Section ${sectionTitle} not found`)

    const updatedSection = removeSubSection(section, subSection);

    if(!updatedSection) return console.log(`removeSubSection failed.`)
    const updatedSections = updateSections(sections, sectionTitle, updatedSection)

    localStorage.setItem(
      "Chapter Manager: " + title,
      JSON.stringify({
        title: title,
        description: description,
        sections: updatedSections,
      }),
    );
    location.reload();
  };

  const findSection = (sections: Section[], sectionTitle: string) => {
    return sections.find(section => section.title === sectionTitle);
  };
  
  const removeSubSection = (section:Section, subSection: string) => {
    if (!section) {
      console.log('Section not found');
      return;
    }
  
    const updatedSubSections = section.subSections.filter(s => s !== subSection);
    return { ...section, subSections: updatedSubSections };
  };
  
  const updateSections = (sections: Section[], sectionTitle: string, updatedSection: Section) => {
    return sections.map(section => {
      if (section.title === sectionTitle) {
        return updatedSection;
      }
      return section;
    });
  };

  return (
    <>
      <div class="w-full flex items-center justify-between flex-col md:flex-row">
        <div class="w-full md:w-4/5 flex items-center justify-start flex-col">
          <a
            href="/"
            class="text-gray-500 hover:text-blue-500 transition-colors w-full text-left mb-5"
          >
            ⬅️ Back
          </a>
          <h1 class="font-bold text-2xl text-left w-full">{title}</h1>
          <p class="text-left w-full">{description}</p>
        </div>
        <div class="w-full md:w-1/5 flex items-center justify-start md:justify-end">
          <button
            onClick={() => deleteProject()}
            class="bg-red-500 hover:bg-red-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
          >
            Delete Chapter
          </button>
        </div>
      </div>

      <div class="flex flex-col items-start justify-start w-full mt-5 gap-y-5">
        {sections &&
          sections.map((section) => (
            <div class="border w-full p-5 rounded-md flex items-center justify-between flex-col md:flex-row">
              <p class="text-left w-full md:w-3/5">
                <h1 class="font-bold">{section.title}</h1>
                <p>{section.description}</p>
                {section.subSections &&
                  section.subSections.map((subSection) => (
                    <div class="flex border mt-2.5 mb-2.5">
                      <p class="flex grow">{subSection}</p>
                      <button
                        onClick={() => deleteSubSection(section.title, subSection)}
                        class="bg-red-500 hover:bg-red-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none"
                      >
                        Delete
                      </button>
                      <hr />
                    </div>
                  ))}
              </p>

              <div class="flex items-center justify-center md:justify-end w-full md:w-2/5 gap-x-2 md:gap-x-5 mt-2 md:mt-0">
                <AddSubSection
                  isActive={section.title === activeSection}
                  chapterTitle={title}
                  sectionTitle={section.title}
                  subSections={section.subSections}
                  isAddingSubSection={isAddingSubSection}
                  setIsAddingSubSection={setIsAddingSubSection}
                />
                {!isAddingSubSection &&
                  (
                    <button
                      onClick={() => {
                        setActiveSection(section.title);
                        setIsAddingSubSection(true);
                      }}
                      class="text-gray-500 border border-gray-500 hover:(text-blue-500 border-blue-500) rounded-md py-1 px-2 transition-colors focus:outline-none outline-none"
                    >
                      + Add SubSection
                    </button>
                  )}
                <button
                  onClick={() => deleteSection(section)}
                  class="border border-red-500 hover:bg-red-500 rounded-md py-1 px-5 text-red-500 hover:text-gray-100 transition-colors focus:outline-none outline-none"
                >
                  Delete Section
                </button>
              </div>
            </div>
          ))}
      </div>

      <AddSection
        projectTitle={title}
        description={description}
        sections={sections}
        isAddingSection={isAddingSection}
        setIsAddingSection={setIsAddingSection}
      />

      <button
        onClick={() => setIsAddingSection(true)}
        class="text-gray-500 border border-gray-500 hover:(text-blue-500 border-blue-500) rounded-md py-1 px-2 transition-colors flex items-center justify-center mt-5 focus:outline-none"
      >
        + Add Section
      </button>
    </>
  );
}

interface AddSectionProps {
  projectTitle: string;
  description: string;
  sections: Section[];
  isAddingSection: boolean;
  setIsAddingSection: (isAddingSection: boolean) => void;
}

function AddSection(
  { projectTitle, sections, isAddingSection, setIsAddingSection }:
    AddSectionProps,
) {
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [section, setSection] = useState<Section>(
    {
      title: "",
      description: "",
      subSections: [],
      chapterTitle: projectTitle,
    },
  );

  useEffect(() => {
    setSection({
      title: title,
      description: description,
      subSections: section.subSections,
      chapterTitle: section.chapterTitle,
    });
  }, [description, title]);

  const addSection = () => {
    let newSections: Section[] = [];

    if (section) {
      if (!section) newSections = [section];
      else newSections = [...sections, section];

      localStorage.setItem(
        "Chapter Manager: " + projectTitle,
        JSON.stringify({
          title: projectTitle,
          description: description,
          sections: newSections,
        }),
      );
    }

    window.location.href = `/${projectTitle}`;

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
        class="w-full border-2 rounded-md mt-2 p-5 text-left border-blue-500 focus:border-blue-600 outline-none"
      />
      <textarea
        type="text"
        placeholder="Section Description"
        onChange={(e) => {
          setDescription((e.target as HTMLInputElement).value);
        }}
        rows={10}
        class="w-full border-2 rounded-md mt-2 px-2 py-1 text-left border-blue-500 focus:border-blue-600 outline-none"
      />
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

interface AddSubSectionProps {
  isActive: boolean;
  chapterTitle: string;
  sectionTitle: string;
  subSections: string[];
  isAddingSubSection: boolean;
  setIsAddingSubSection: (isAddingSubSection: boolean) => void;
}

function AddSubSection(
  {
    isActive,
    chapterTitle,
    sectionTitle,
    subSections,
    isAddingSubSection,
    setIsAddingSubSection,
  }: AddSubSectionProps,
) {
  const [subSection, setSubSection] = useState("");

  const addSubSection = () => {
    let newSubSections: string[] = [];
    let newSections: Section[] = [];

    if (subSection) {
      if (subSections[0] === "") newSubSections = [subSection];
      else newSubSections = [...subSections, subSection];

      const chapter = JSON.parse(
        localStorage.getItem("Chapter Manager: " + chapterTitle),
      );

      newSections = chapter.sections.map(function (s: Section) {
        if (s.title !== sectionTitle) {
          return s;
        } else {
          s.subSections = [...s.subSections, subSection];
          return s;
        }
      });

      localStorage.setItem(
        "Chapter Manager: " + chapterTitle,
        JSON.stringify(
          {
            title: chapter.title,
            description: chapter.description,
            sections: newSections,
          },
        ),
      );
    }

    window.location.href = `/${chapterTitle}`;

    setIsAddingSubSection(false);
  };

  return (
    <div
      class={isActive && isAddingSubSection ? "block w-full mt-5" : "hidden"}
    >
      <input
        type="text"
        placeholder="SubSection Content"
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
