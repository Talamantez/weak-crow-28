import {
  safeSessionStorageGetItem,
  safeSessionStorageRemoveItem,
  safeSessionStorageSetItem
} from "./SafeSessionStorage.ts";


export function updateChapterTitle({ newText, chapterTitle }: { newText: string; chapterTitle: string; }): void {
  if (newText.trim() === "") return window.location.reload();

  const stored = JSON.parse(
    safeSessionStorageGetItem(`Chapter Manager: ${chapterTitle}`)!
  );

  const updatedStored = { ...stored, title: newText };
  safeSessionStorageSetItem(
    `Chapter Manager: ${newText}`,
    JSON.stringify(updatedStored)
  );
  safeSessionStorageRemoveItem(`Chapter Manager: ${chapterTitle}`);

  window.history.pushState({}, "", `/${newText}`);
  window.location.reload();
}
