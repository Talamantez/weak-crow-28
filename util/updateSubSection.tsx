import { Section } from "./SectionData.ts";

export function updateSubSection(
  newText: string,
  subSection: string,
  sectionTitle: string,
  chapterTitle: string
): Promise<void> {
  if (newText.trim() === "") {
    return Promise.resolve().then(() => {
      window.location.reload();
    });
  }

  const dbName = "MyDatabase";
  const storeName = "Chapters";

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);

    request.onerror = function (event: Event) {
      console.error("Error opening database:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = function (event: Event) {
      const db = event.target.result;
      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);
      const getRequest = objectStore.get(chapterTitle);

      getRequest.onsuccess = function (event: Event) {
        const chapter = event.target.result;

        if (chapter) {
          const updatedSections = chapter.sections.map((s: Section) => {
            if (s.title === sectionTitle) {
              const updatedSubSections = s.subSections.map((ss) =>
                ss === subSection ? newText : ss
              );
              return { ...s, subSections: updatedSubSections };
            }
            return s;
          });

          const updatedChapter = {
            ...chapter,
            sections: updatedSections,
          };

          const putRequest = objectStore.put(updatedChapter);

          putRequest.onsuccess = function () {
            resolve();
            window.location.reload();
          };

          putRequest.onerror = function (event: Event) {
            console.error("Error updating subsection:", event.target.error);
            reject(event.target.error);
          };
        } else {
          reject(new Error("Chapter not found"));
        }
      };

      getRequest.onerror = function (event: Event) {
        console.error("Error retrieving chapter:", event.target.error);
        reject(event.target.error);
      };
    };
  });
}