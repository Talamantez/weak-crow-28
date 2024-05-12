import { Section } from "./SectionData.ts";
import { getStoredData } from "./getStoredData.ts";
import { reloadPage } from "./reloadPage.ts";
import { updateStoredData } from "./updateStoredData.ts";

export function updateSectionTitle({
  newText,
  title,
  chapterTitle,
}: {
  newText: string;
  title: string;
  chapterTitle: string;
}): void {
  if (newText.trim() === "") return reloadPage();

  const stored = getStoredData({ chapterTitle });
  const updatedSections = stored.sections.map((s: Section) =>
    s.title === title ? { ...s, title: newText } : s
  );
  const updatedData = { ...stored, sections: updatedSections };
  updateStoredData(updatedData); // Fix: Pass updatedData as a single argument
  reloadPage();
}