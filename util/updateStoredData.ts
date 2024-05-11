import { safeSessionStorageSetItem } from "./safeSessionStorageSetItem.ts";

// Utility function to update stored data
export function updateStoredData({ chapterTitle, updatedData }: { chapterTitle: string; updatedData: any; }): void {
  safeSessionStorageSetItem({
    key: `Chapter Manager: ${chapterTitle}`,
    value: JSON.stringify(updatedData),
  });
}
