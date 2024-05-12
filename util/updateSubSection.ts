import { Section } from "./SectionData.ts";
import { getStoredData } from "./getStoredData.ts";
import { reloadPage } from "./reloadPage.ts";
import { updateStoredData } from "./updateStoredData.ts";

export function updateSubSection({
  newText,
  subSection,
  sectionTitle,
  chapterTitle,
}: {
  newText: string;
  subSection: string;
  sectionTitle: string;
  chapterTitle: string;
}): void {
  if (newText.trim() === "") return reloadPage();

  const stored = getStoredData({ chapterTitle });
  const updatedSections = stored.sections.map((s: Section) => {
    if (s.title === sectionTitle) {
      const updatedSubSections = s.subSections.map((ss) =>
        ss === subSection ? newText : ss
      );
      return { ...s, subSections: updatedSubSections };
    }
    return s;
  });
  const updatedData = { ...stored, sections: updatedSections };
  updateStoredData(updatedData);
  reloadPage();
}