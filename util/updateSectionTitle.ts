import { Section } from "./SectionData.ts";
import { safeSessionStorageGetItem, safeSessionStorageSetItem } from "./SafeSessionStorage.ts";


export function updateSectionTitle(
  { newText, title, chapterTitle }: { newText: string; title: string; chapterTitle: string; }
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
