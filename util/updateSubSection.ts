import { Section } from "./SectionData.ts";
import { safeSessionStorageGetItem, safeSessionStorageSetItem } from "./SafeSessionStorage.ts";


export function updateSubSection(
  { newText, subSection, sectionTitle, chapterTitle }: { newText: string; subSection: string; sectionTitle: string; chapterTitle: string; }
): void {
  if (newText.trim() === "") return window.location.reload();
  const stored = JSON.parse(
    safeSessionStorageGetItem(`Chapter Manager: ${chapterTitle}`)!
  );
  const updatedSections = stored.sections.map((s: Section) => {
    if (s.title === sectionTitle) {
      const updatedSubSections = s.subSections.map((ss) => ss === subSection ? newText : ss
      );
      return { ...s, subSections: updatedSubSections };
    }
    return s;
  });
  safeSessionStorageSetItem(
    `Chapter Manager: ${chapterTitle}`,
    JSON.stringify({
      ...stored,
      sections: updatedSections,
    })
  );
  window.location.reload();
}
