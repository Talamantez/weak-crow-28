import {
  safeSessionStorageSetItem
} from "./safeSessionStorageSetItem.ts";
import { safeSessionStorageRemoveItem } from "./safeSessionStorageRemoveItem.ts";
import { safeSessionStorageGetItem } from "./safeSessionStorageGetItem.ts";

export function updateChapterTitle(newText: string, chapterTitle: string) {
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
