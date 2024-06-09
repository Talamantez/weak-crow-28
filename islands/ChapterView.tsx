import { useEffect, useState } from "preact/hooks";
import { Section } from "../util/SectionData.ts";
import ClickToEditHeading from "../components/ClickToEditHeading.tsx";
import ClickToEdit from "../components/ClickToEdit.tsx";
import ClickToEditTextArea from "../components/ClickToEditTextArea.tsx";
import {
  safeSessionStorageSetItem,
} from "../util/safeSessionStorageSetItem.ts";
import { safeSessionStorageGetItem } from "../util/safeSessionStorageGetItem.ts";
import { updateChapterTitle } from "../util/updateChapterTitle.tsx";
import { updateSubSection } from "../util/updateSubSection.tsx";
import { AddSubSection } from "../util/AddSubSection.tsx";
import { AddSection } from "../util/AddSection.tsx";
import Loader from "../components/Loader.tsx";

const dbName = "MyDatabase";
const storeName = "Chapters";

export default function ChapterData({ title }: { title: string }) {
  const [loading, setLoading] = useState(true);
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
    setLoading(false);
  }, []);

  useEffect(() => {
    const request = indexedDB.open(dbName);

    request.onerror = function (event: Event) {
      console.error("Error opening database:", event.target.error);
    };

    request.onsuccess = function (event: Event) {
      const db = event.target.result;

      const transaction = db.transaction(storeName, "readonly");

      const objectStore = transaction.objectStore(storeName);

      const getRequest = objectStore.get(title);

      getRequest.onsuccess = function (event: Event) {
        const stored = event.target.result;
        if (stored) {
          setDescription(stored.description);
          setSections(stored.subSections);
        }
      };

      getRequest.onerror = function (event: Event) {
        console.error("Error retrieving chapter data:", event.target.error);
      };
    };
  }, []);

  useEffect(() => {
    const request = indexedDB.open(dbName);

    request.onerror = function (event: Event) {
      console.error("Error opening database:", event.target.error);
    };

    request.onsuccess = function (event: Event) {
      const db = event.target.result;
      const transaction = db.transaction(storeName, "readonly");
      const objectStore = transaction.objectStore(storeName);
      const getRequest = objectStore.get(title);

      getRequest.onsuccess = function (event: Event) {
        const stored = event.target.result;
        if (stored) {
          setDescription(stored.description);
          setSections(stored.sections);
        }
      };

      getRequest.onerror = function (event: Event) {
        console.error("Error retrieving chapter data:", event.target.error);
      };
    };
  }, [isAddingSection]);

  const deleteChapter = () => {
    const request = indexedDB.open(dbName);

    request.onerror = function (event: Event) {
      console.error("Error opening database:", event.target.error);
    };

    request.onsuccess = function (event: Event) {
      const db = event.target.result;
      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);

      const deleteRequest = objectStore.delete(title);

      deleteRequest.onsuccess = function () {
        window.location.href = "/";
      };

      deleteRequest.onerror = function (event: Event) {
        console.error("Error deleting chapter:", event.target.error);
      };
    };
  };

  const deleteSection = (section: Section) => {
    const request = indexedDB.open(dbName);

    request.onerror = function (event: Event) {
      console.error("Error opening database:", event.target.error);
    };

    request.onsuccess = function (event: Event) {
      const db = event.target.result;
      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);

      const getRequest = objectStore.get(title);

      getRequest.onsuccess = function (event: Event) {
        const stored = event.target.result;

        const updatedSections = stored.sections.filter((t) =>
          t.title !== section.title
        );

        const updatedChapter = {
          ...stored,
          sections: updatedSections,
        };

        const putRequest = objectStore.put(updatedChapter);

        putRequest.onsuccess = function () {
          location.reload();
        };

        putRequest.onerror = function (event: Event) {
          console.error("Error updating chapter:", event.target.error);
        };
      };

      getRequest.onerror = function (event: Event) {
        console.error("Error retrieving chapter data:", event.target.error);
      };
    };
  };

  const findSection = (sections: Section[], sectionTitle: string) => {
    return sections.find((section) => section.title === sectionTitle);
  };
  const deleteSubSection = (sectionTitle: string, subSection: string) => {
    const request = indexedDB.open(dbName);

    request.onerror = function (event: Event) {
      console.error("Error opening database:", event.target.error);
    };

    request.onsuccess = function (event: Event) {
      const db = event.target.result;
      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);

      const getRequest = objectStore.get(title);

      getRequest.onsuccess = function (event: Event) {
        const stored = event.target.result;

        const section = findSection(stored.sections, sectionTitle);

        if (!section) {
          console.log(`Section ${sectionTitle} not found`);
          return;
        }

        const updatedSection = removeSubSection(section, subSection);

        if (!updatedSection) {
          console.log(`removeSubSection failed.`);
          return;
        }

        const updatedSections = updateSections(
          stored.sections,
          sectionTitle,
          updatedSection,
        );

        const updatedChapter = {
          ...stored,
          sections: updatedSections,
        };

        const putRequest = objectStore.put(updatedChapter);

        putRequest.onsuccess = function () {
          location.reload();
        };

        putRequest.onerror = function (event: Event) {
          console.error("Error updating chapter:", event.target.error);
        };
      };

      getRequest.onerror = function (event: Event) {
        console.error("Error retrieving chapter data:", event.target.error);
      };
    };
  };
  // removeSubSection is a component of deleteSubSection - it is not redundant
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
        const stored = event.target.result;

        const updatedSections = stored.sections.map((s: Section) =>
          s.title === title ? { ...s, title: newText } : s
        );

        const updatedChapter = {
          ...stored,
          sections: updatedSections,
        };

        const putRequest = objectStore.put(updatedChapter);

        putRequest.onsuccess = function () {
          window.location.reload();
        };

        putRequest.onerror = function (event: Event) {
          console.error("Error updating chapter:", event.target.error);
        };
      };

      getRequest.onerror = function (event: Event) {
        console.error("Error retrieving chapter data:", event.target.error);
      };
    };
  }

  function updateSectionDescription(
    newText: string,
    title: string,
    chapterTitle: string,
  ): void {
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
        const stored = event.target.result;

        const updatedSections = stored.sections.map((s: Section) =>
          s.title === title ? { ...s, description: newText } : s
        );

        const updatedChapter = {
          ...stored,
          sections: updatedSections,
        };

        const putRequest = objectStore.put(updatedChapter);

        putRequest.onsuccess = function () {
          window.location.reload();
        };

        putRequest.onerror = function (event: Event) {
          console.error("Error updating chapter:", event.target.error);
        };
      };

      getRequest.onerror = function (event: Event) {
        console.error("Error retrieving chapter data:", event.target.error);
      };
    };
  }

  function updateChapterDescription(
    newText: string,
  ): void {
    if (newText.trim() === "") return window.location.reload();

    const request = indexedDB.open(dbName);

    request.onerror = function (event: Event) {
      console.error("Error opening database:", event.target.error);
    };

    request.onsuccess = function (event: Event) {
      const db = event.target.result;
      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);

      const getRequest = objectStore.get(title);

      getRequest.onsuccess = function (event: Event) {
        const stored = event.target.result;

        const updatedChapter = {
          ...stored,
          description: newText,
        };

        const putRequest = objectStore.put(updatedChapter);

        putRequest.onsuccess = function () {
          window.location.reload();
        };

        putRequest.onerror = function (event: Event) {
          console.error("Error updating chapter:", event.target.error);
        };
      };

      getRequest.onerror = function (event: Event) {
        console.error("Error retrieving chapter data:", event.target.error);
      };
    };
  }

  async function printChapter(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);

      request.onerror = function (event: Event) {
        console.error("Error opening database:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = function (event: Event) {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readonly");
        const objectStore = transaction.objectStore(storeName);

        const getRequest = objectStore.get(title);

        getRequest.onsuccess = function (event: Event) {
          const stored = event.target.result;

          fetch("/api/printChapterWithCover", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(stored),
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

              resolve();
            })
            .catch((error) => {
              console.error("Error:", error);
              reject(error);
            });
        };

        getRequest.onerror = function (event: Event) {
          console.error("Error retrieving chapter data:", event.target.error);
          reject(event.target.error);
        };
      };
    });
  }

  return (
    <div>
      {loading ? <Loader /> : (
        <div>
          <div class="w-full flex items-center justify-between flex-col md:flex-row">
            <div class="w-full md:w-4/5 flex items-center justify-start flex-col">
              <a
                href="/"
                class="text-gray-500 hover:text-blue-500 transition-colors w-full text-left mb-5"
              >
                ⬅️ Back
              </a>
              <div class="font-bold text-2xl text-left w-full"
              >{title}</div>
              
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
                            updateSectionDescription(
                              newText,
                              section.title,
                              title,
                            )}
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
            chapterTitle={title}
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
        </div>
      )}
    </div>
  );
}
