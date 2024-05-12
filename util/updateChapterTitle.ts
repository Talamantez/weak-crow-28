import { getStoredData } from "./getStoredData.ts";
import { reloadPage } from "./reloadPage.ts";
import { safeSessionStorageRemoveItem } from "./safeSessionStorageRemoveItem.ts";
import { updateStoredData } from "./updateStoredData.ts";


export function updateChapterTitle({
  newText,
  chapterTitle,
}: {
  newText: string;
  chapterTitle: string;
}): void {
  if (newText.trim() === "") return reloadPage();

  const stored = getStoredData({ chapterTitle });
  const updatedData = { ...stored, title: newText };
  updateStoredData(updatedData); // Fix: Pass a single argument to the updateStoredData function
  safeSessionStorageRemoveItem({ key: `Chapter Manager: ${chapterTitle}` });
  globalThis.history.pushState({}, "", `/${newText}`);
  reloadPage();
}