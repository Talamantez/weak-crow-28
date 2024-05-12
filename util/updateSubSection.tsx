import { Section } from "./SectionData.ts";
import { safeSessionStorageSetItem } from "./safeSessionStorageSetItem.ts";
import { safeSessionStorageGetItem } from "./safeSessionStorageGetItem.ts";

export function updateSubSection(
  newText: string,
  subSection: string,
  sectionTitle: string,
  chapterTitle: string
) {
  if (newText.trim() === "") return window.location.reload();
  const myKey = "Chapter Manager: " + chapterTitle;

  const stored = safeSessionStorageGetItem({
    key: myKey,
    getItem: (key: string) => {
      return sessionStorage.getItem(key);
    },
    logError: (message: string) => {
      console.error(message);
    }
  });

  const parsedStored = stored ? JSON.parse(stored as string) : {};
  const updatedSections = parsedStored.sections.map((s: Section) => {
    if (s.title === sectionTitle) {
      const updatedSubSections = s.subSections.map((ss) => ss === subSection ? newText : ss
      );
      return { ...s, subSections: updatedSubSections };
    }
    return s;
  });
  safeSessionStorageSetItem({
    key: myKey,
    value: JSON.stringify(updatedSections),
    setItem: (key: string, value: string) => {
      sessionStorage.setItem(key, value);
    },
    logError: (message: string) => {
      console.error(message);
    }
  });
  window.location.reload();
}
