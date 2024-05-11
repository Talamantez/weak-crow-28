import { safeSessionStorageGetItem } from "./safeSessionStorageGetItem.ts";

// Utility function to retrieve stored data
export function getStoredData({ chapterTitle }: { chapterTitle: string }): any {
  const sessionStorageItem = "Chapter Manager: " + chapterTitle;
  const storedData = safeSessionStorageGetItem({ key: sessionStorageItem });
  return JSON.parse(
    storedData as string || JSON.stringify({ title: "", description: "" }),
  );
}