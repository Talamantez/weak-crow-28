import {
  safeSessionStorageSetItem
} from "./safeSessionStorageSetItem.ts";
import { safeSessionStorageGetItem } from "./safeSessionStorageGetItem.ts";

export function updateChapterTitle(newText: string, chapterTitle: string) {
  if (newText.trim() === "") return window.location.reload();

  const myKey = "Chapter Manager: " + chapterTitle;

  const stored = safeSessionStorageGetItem({
    key: myKey,
    getItem: (key: string) => {
      return sessionStorage.getItem(key);
    },
    logError: (message: string) => {
      console.error(message);
    }
  });

  const parsedStored = stored ? JSON.parse(stored as string) : {};
  const updatedStored = { ...parsedStored, title: newText };
  const myNewKey = "Chapter Manager: " + newText;

  safeSessionStorageSetItem({
    key: myNewKey,
    value: JSON.stringify(updatedStored),
    setItem: (key: string, value: string) => {
      sessionStorage.setItem(key, value);
    },
    logError: (message: string) => {
      console.error(message);
    }
  });

  window.history.pushState({}, "", `/${newText}`);
  window.location.reload();
}