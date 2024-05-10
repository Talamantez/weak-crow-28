import { useEffect, useState } from "preact/hooks";
import { Section } from "../util/SectionData.ts";
import ClickToEditHeading from "../components/ClickToEditHeading.tsx";
import ClickToEdit from "../components/ClickToEdit.tsx";
import ClickToEditTextArea from "../components/ClickToEditTextArea.tsx";
import {
  safeSessionStorageSetItem
} from "../util/safeSessionStorageSetItem.ts";
import { safeSessionStorageRemoveItem } from "../util/safeSessionStorageRemoveItem.ts";
import { safeSessionStorageGetItem } from "../util/safeSessionStorageGetItem.ts";
import { updateChapterTitle } from "../util/updateChapterTitle.tsx";
import { updateSubSection } from "../util/updateSubSection.tsx";
import { AddSubSection } from "../util/AddSubSection.tsx";
import { AddSection } from "../util/AddSection.tsx";

export default function ProjectData({ title }: { title: string; }) {
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
    safeSessionStorageSetItem("scrollX", globalThis.scrollX.toString());
    safeSessionStorageSetItem("scrollY", globalThis.scrollY.toString());
  }

  // Step 2: Save scroll position on scroll
  globalThis.addEventListener("scroll", saveScrollPosition);

  // Step 3: Set scroll position on component mount
  useEffect(() => {
    const scrollX = safeSessionStorageGetItem("scrollX");
    const scrollY = safeSessionStorageGetItem("scrollY");

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
    const storedString = safeSessionStorageGetItem(`Chapter Manager: ${title}`);

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
    const storedString = safeSessionStorageGetItem(`Chapter Manager: ${title}`);

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
    safeSessionStorageRemoveItem(`Chapter Manager: ${title}`);
    window.location.href = "/";
  };

  const deleteSection = (section: Section) => {
    const tempSections = sections.filter((t) => t.title !== section.title);
    const stored = JSON.parse(
      safeSessionStorageGetItem(`Chapter Manager: ${title}`)!
    );
    safeSessionStorageSetItem(
      "Chapter Manager: " + title,
      JSON.stringify({
        title: title,
        description: description,
        imageUrl: stored.imageUrl,
        sections: tempSections,
      })
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
      updatedSection
    );
    const stored = JSON.parse(
      safeSessionStorageGetItem(`Chapter Manager: ${title}`)!
    );
    safeSessionStorageSetItem(
      "Chapter Manager: " + title,
      JSON.stringify({
        title: title,
        description: description,
        imageUrl: stored.imageUrl,
        sections: updatedSections,
      })
    );
    location.reload();
  };

  const removeSubSection = (section: Section, subSection: string) => {
    if (!section) {
      console.log("Section not found");
      return;
    }

    const updatedSubSections = section.subSections.filter((s) => s !== subSection
    );
    return { ...section, subSections: updatedSubSections };
  };

  const updateSections = (
    sections: Section[],
    sectionTitle: string,
    updatedSection: Section
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
    chapterTitle: string
  ): void {
    if (newText.trim() === "") return window.location.reload();

    const stored = JSON.parse(
      safeSessionStorageGetItem(`Chapter Manager: ${chapterTitle}`)!
    );
    safeSessionStorageSetItem(
      `Chapter Manager: ${chapterTitle}`,
      JSON.stringify({
        ...stored,
        sections: stored.sections.map((s: Section) => s.title === title ? { ...s, title: newText } : s
        ),
      })
    );
    window.location.reload();
  }
  function updateSectionDescription(
    newText: string,
    title: string,
    chapterTitle: string
  ): void {
    const stored = JSON.parse(
      safeSessionStorageGetItem(`Chapter Manager: ${chapterTitle}`)!
    );
    safeSessionStorageSetItem(
      `Chapter Manager: ${chapterTitle}`,
      JSON.stringify({
        ...stored,
        sections: stored.sections.map((s: Section) => s.title === title ? { ...s, description: newText } : s
        ),
      })
    );
    window.location.reload();
  }
  
  function updateChapterDescription(
    newText: string
  ): void {
    if (newText.trim() === "") return window.location.reload();

    const stored = JSON.parse(
      safeSessionStorageGetItem(`Chapter Manager: ${title}`)!
    );
    safeSessionStorageSetItem(
      `Chapter Manager: ${title}`,
      JSON.stringify({ ...stored, description: newText })
    );
    window.location.reload();
  }

  async function printChapter(): Promise<void> {
    const stored = await safeSessionStorageGetItem(`Chapter Manager: ${title}`);
    console.log(stored);
    fetch("/api/printChapterWithCover", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: stored,
    })
      .then((response) => {
        if (response.ok) {
          return response.blob();
        } else {
          throw new Error("Request failed.");
        }
      })
      .then((blob) => {
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
      .catch((error) => {
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
            onTextChange={(newText) => updateChapterTitle(newText, title)} />
          {description !== "" && (
            <ClickToEditTextArea 
              text={description}
              onTextChange={(newText) => updateChapterDescription(newText)} />
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
                      onTextChange={(newText) => updateSectionTitle(newText, section.title, title)} />
                  </h1>
                )}
                {section.description && (
                  <p>
                    <ClickToEditTextArea 
                      text={section.description}
                      onTextChange={(newText) => updateSectionDescription(newText, section.title, title)} />
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
                              onTextChange={(newText) => updateSubSection(
                                newText,
                                subSection,
                                section.title,
                                title
                              )} />
                          </p>
                        )}
                      </div>
                      <div class="ml-5">
                        <button 
                          onClick={() => deleteSubSection(section.title, subSection)}
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
                                transform: "translate(-50%, -50%) rotate(45deg)",
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
                                transform: "translate(-50%, -50%) rotate(-45deg)",
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
                  setIsAddingSubSection={setIsAddingSubSection} />
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
        setIsAddingSection={setIsAddingSection} />
      <button 
        onClick={() => setIsAddingSection(true)}
        class="text-gray-500 border border-gray-500 hover:(text-blue-500 border-blue-500) rounded-md py-1 px-2 transition-colors flex items-center justify-center mt-5 focus:outline-none"
      >
        + Add Section
      </button>
    </>
  );
}





