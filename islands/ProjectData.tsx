import { useEffect, useState } from "preact/hooks";
import { Section } from "../util/SectionData.ts";
import ClickToEditHeading from "../components/ClickToEditHeading.tsx";
import ClickToEdit from "../components/ClickToEdit.tsx";
import ClickToEditTextArea from "../components/ClickToEditTextArea.tsx";
import {
  safeLocalStorageGetItem,
  safeLocalStorageRemoveItem,
  safeLocalStorageSetItem,
} from "./SafeLocalStorage.ts";

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
  // Step 1: Function to save scroll position

  function saveScrollPosition() {
    safeLocalStorageSetItem("scrollX", globalThis.scrollX.toString());
    safeLocalStorageSetItem("scrollY", globalThis.scrollY.toString());
  }

  // Step 2: Save scroll position on scroll
  globalThis.addEventListener("scroll", saveScrollPosition);

  // Step 3: Set scroll position on component mount
  useEffect(() => {
    const scrollX = safeLocalStorageGetItem("scrollX");
    const scrollY = safeLocalStorageGetItem("scrollY");

    if (scrollX !== null && scrollY !== null) {
      // Delay the scroll until after the page has fully loaded
      setTimeout(() => {
        globalThis.scrollTo(parseInt(scrollX), parseInt(scrollY));
      }, 0);
    }
    return () => {
      globalThis.scrollTo(0, 0);
      globalThis.removeEventListener("scroll", saveScrollPosition);
    };
  }, []);

  useEffect(() => {
    const storedString = safeLocalStorageGetItem(`Chapter Manager: ${title}`);

    if (storedString) {
      const stored = JSON.parse(storedString);

      if (stored && typeof stored === "object") {
        setDescription(stored.description);
        setSections(stored.sections);
      } else {
        console.error("Stored data is not an object");
      }
    } else {
      console.error("No stored data found");
    }
  }, []);

  useEffect(() => {
    const storedString = safeLocalStorageGetItem(`Chapter Manager: ${title}`);

    if (storedString) {
      const stored = JSON.parse(storedString);

      if (stored && typeof stored === "object") {
        setSections(stored.sections);
      } else {
        console.error("Stored data is not an object");
      }
    } else {
      console.error("No stored data found");
    }
  }, [isAddingSection]);

  const deleteChapter = () => {
    safeLocalStorageRemoveItem(`Chapter Manager: ${title}`);
    window.location.href = "/";
  };

  const deleteSection = (section: Section) => {
    const tempSections = sections.filter((t) => t.title !== section.title);
    safeLocalStorageSetItem(
      "Chapter Manager: " + title,
      JSON.stringify({
        title: title,
        description: description,
        sections: tempSections,
      }),
    );
    location.reload();
  };

  const findSection = (sections: Section[], sectionTitle: string) => {
    return sections.find((section) => section.title === sectionTitle);
  };
  const deleteSubSection = (sectionTitle: string, subSection: string) => {
    const section = findSection(sections, sectionTitle);

    if (!section) return console.log(`Section ${sectionTitle} not found`);

    const updatedSection = removeSubSection(section, subSection);

    if (!updatedSection) return console.log(`removeSubSection failed.`);
    const updatedSections = updateSections(
      sections,
      sectionTitle,
      updatedSection,
    );

    safeLocalStorageSetItem(
      "Chapter Manager: " + title,
      JSON.stringify({
        title: title,
        description: description,
        sections: updatedSections,
      }),
    );
    location.reload();
  };

  const removeSubSection = (section: Section, subSection: string) => {
    if (!section) {
      console.log("Section not found");
      return;
    }

    const updatedSubSections = section.subSections.filter((s) =>
      s !== subSection
    );
    return { ...section, subSections: updatedSubSections };
  };

  const updateSections = (
    sections: Section[],
    sectionTitle: string,
    updatedSection: Section,
  ) => {
    return sections.map((section) => {
      if (section.title === sectionTitle) {
        return updatedSection;
      }
      return section;
    });
  };

  function updateSectionTitle(
    newText: string,
    title: string,
    chapterTitle: string,
  ): void {
    if (newText.trim() === "") return window.location.reload();

    const stored = JSON.parse(
      safeLocalStorageGetItem(`Chapter Manager: ${chapterTitle}`)!,
    );
    safeLocalStorageSetItem(
      `Chapter Manager: ${chapterTitle}`,
      JSON.stringify({
        ...stored,
        sections: stored.sections.map((s: Section) =>
          s.title === title ? { ...s, title: newText } : s
        ),
      }),
    );
    window.location.reload();
  }
  function updateSectionDescription(
    newText: string,
    title: string,
    chapterTitle: string,
  ): void {
    const stored = JSON.parse(
      safeLocalStorageGetItem(`Chapter Manager: ${chapterTitle}`)!,
    );
    safeLocalStorageSetItem(
      `Chapter Manager: ${chapterTitle}`,
      JSON.stringify({
        ...stored,
        sections: stored.sections.map((s: Section) =>
          s.title === title ? { ...s, description: newText } : s
        ),
      }),
    );
    window.location.reload();
  }
  function updateChapterDescription(
    newText: string,
  ): void {
    if (newText.trim() === "") return window.location.reload();

    const stored = JSON.parse(
      safeLocalStorageGetItem(`Chapter Manager: ${title}`)!,
    );
    safeLocalStorageSetItem(
      `Chapter Manager: ${title}`,
      JSON.stringify({ ...stored, description: newText }),
    );
    window.location.reload();
  }

  async function printChapter(): Promise<void> {
    const stored = await safeLocalStorageGetItem(`Chapter Manager: ${title}`);
    console.log(stored);
    fetch("/api/printChapter", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: stored
    })
      .then(response => {
        if (response.ok) {
          return response.blob();
        } else {
          throw new Error("Request failed.");
        }
      })
      .then(blob => {
        // Create a temporary URL for the blob
        const url = URL.createObjectURL(blob);
    
        // Create a temporary link element and trigger the download
        const link = document.createElement("a");
        link.href = url;
        link.download = "output.pdf";
        link.click();
    
        // Clean up the temporary URL
        URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error("Error:", error);
      });
  }

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
          <ClickToEditHeading
            text={title}
            onTextChange={(newText) => updateChapterTitle(newText, title)}
          />
          {description !== "" && (
            <ClickToEditTextArea
              text={description}
              onTextChange={(newText) => updateChapterDescription(newText)}
            />
          )}
        </div>
        <div class="w-full md:w-1/5 flex items-center justify-start md:justify-end">
          <button
            onClick={() => printChapter()}
            class="bg-green-500 hover:bg-green-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
          >
            Print Chapter
          </button>

          <button
            onClick={() => deleteChapter()}
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
                {section.title && (
                  <h1 class="font-bold">
                    <ClickToEdit
                      text={section.title}
                      onTextChange={(newText) =>
                        updateSectionTitle(newText, section.title, title)}
                    />
                  </h1>
                )}
                {section.description && (
                  <p>
                    <ClickToEditTextArea
                      text={section.description}
                      onTextChange={(newText) =>
                        updateSectionDescription(newText, section.title, title)}
                    />
                  </p>
                )}
                {section.subSections &&
                  section.subSections.map((subSection) => (
                    <div class="flex mt-5 border rounded-md p-5">
                      <div class="w-full">
                        {subSection && (
                          <p>
                            <ClickToEditTextArea
                              text={subSection}
                              cols={70}
                              onTextChange={(newText) =>
                                updateSubSection(
                                  newText,
                                  subSection,
                                  section.title,
                                  title,
                                )}
                            />
                          </p>
                        )}
                      </div>
                      <div class="ml-5">
                        <button
                          onClick={() =>
                            deleteSubSection(section.title, subSection)}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                            display: "inline-block",
                            position: "relative",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-block",
                              width: "24px",
                              height: "24px",
                              position: "relative",
                              border: "2px solid red",
                              borderRadius: "50%",
                            }}
                          >
                            <span
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                width: "60%",
                                height: "2px",
                                backgroundColor: "red",
                                transform:
                                  "translate(-50%, -50%) rotate(45deg)",
                              }}
                            >
                            </span>
                            <span
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                width: "60%",
                                height: "2px",
                                backgroundColor: "red",
                                transform:
                                  "translate(-50%, -50%) rotate(-45deg)",
                              }}
                            >
                            </span>
                          </span>
                        </button>
                      </div>
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

    const storedString = safeLocalStorageGetItem(
      `Chapter Manager: ${projectTitle}`,
    );

    const chapter = JSON.parse(storedString as string);

    if (section) {
      if (!section) newSections = [section];
      else newSections = [...sections, section];

      safeLocalStorageSetItem(
        "Chapter Manager: " + projectTitle,
        JSON.stringify({
          title: projectTitle,
          description: chapter.description,
          sections: newSections,
        }),
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

      const storedString = safeLocalStorageGetItem(
        `Chapter Manager: ${chapterTitle}`,
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

      safeLocalStorageSetItem(
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

function updateChapterTitle(newText: string, chapterTitle: string) {
  if (newText.trim() === "") return window.location.reload();

  const stored = JSON.parse(
    safeLocalStorageGetItem(`Chapter Manager: ${chapterTitle}`)!,
  );
  safeLocalStorageRemoveItem(`Chapter Manager: ${chapterTitle}`);
  const updatedStored = { ...stored, title: newText };
  safeLocalStorageSetItem(
    `Chapter Manager: ${newText}`,
    JSON.stringify(updatedStored),
  );
  safeLocalStorageRemoveItem(`Chapter Manager: ${chapterTitle}`);
  window.history.pushState({}, "", `/${newText}`);
}

function updateSubSection(
  newText: string,
  subSection: string,
  sectionTitle: string,
  chapterTitle: string,
) {
  if (newText.trim() === "") return window.location.reload();
  const stored = JSON.parse(
    safeLocalStorageGetItem(`Chapter Manager: ${chapterTitle}`)!,
  );
  const updatedSections = stored.sections.map((s: Section) => {
    if (s.title === sectionTitle) {
      const updatedSubSections = s.subSections.map((ss) =>
        ss === subSection ? newText : ss
      );
      return { ...s, subSections: updatedSubSections };
    }
    return s;
  });
  safeLocalStorageSetItem(
    `Chapter Manager: ${chapterTitle}`,
    JSON.stringify({
      ...stored,
      sections: updatedSections,
    }),
  );
  window.location.reload();
}
