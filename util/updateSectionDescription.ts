import { Section } from "./SectionData.ts";
import { safeSessionStorageGetItem, safeSessionStorageSetItem } from "./SafeSessionStorage.ts";


export function updateSectionDescription(
  { newText, title, chapterTitle }: { newText: string; title: string; chapterTitle: string; }
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
