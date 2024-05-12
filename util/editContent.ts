import { updateChapterDescription } from "./updateChapterDescription.ts";
import { updateChapterTitle } from "./updateChapterTitle.ts";
import { updateSectionTitle } from "./updateSectionTitle.ts";
import { updateSectionDescription } from "./updateSectionDescription.ts";
import { updateSubSection } from "./updateSubSection.ts";
import { getStoredData } from "./getStoredData.ts";
import { updateStoredData } from "./updateStoredData.ts";
import { reloadPage } from "./reloadPage.ts";

export function updateChapterDescription({
  newText,
  title,
}: {
  newText: string;
  title: string;
}): void {
  if (newText.trim() === "") return reloadPage();

  const stored = getStoredData({ chapterTitle: title });
  const updatedData = { ...stored, description: newText };
  updateStoredData({ chapterTitle: title, updatedData });
  reloadPage();
}

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
  updateStoredData({ chapterTitle, updatedData });
  reloadPage();
}

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
  updateStoredData({ chapterTitle, updatedData });
  reloadPage();
}

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
  updateStoredData({ chapterTitle, updatedData });
  reloadPage();
}
