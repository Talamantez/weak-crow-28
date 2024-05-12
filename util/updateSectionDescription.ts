import { Section } from "./SectionData.ts";
import { getStoredData } from "./getStoredData.ts";
import { reloadPage } from "./reloadPage.ts";
import { updateStoredData } from "./updateStoredData.ts";

export function updateSectionDescription({
  newText,
  title,
  chapterTitle,
}: {
  newText: string;
  title: string;
  chapterTitle: string;
}): void {
  const stored = getStoredData({ chapterTitle });
  const updatedSections = stored.sections.map((s: Section) =>
    s.title === title ? { ...s, description: newText } : s
  );
  const updatedData = { ...stored, sections: updatedSections };
  updateStoredData(updatedData); // Fix: Pass a single argument to updateStoredData function
  reloadPage();
}