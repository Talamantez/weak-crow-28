import { getStoredData } from "./getStoredData.ts";
import { reloadPage } from "./reloadPage.ts";
import { updateStoredData } from "./updateStoredData.ts";

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
  updateStoredData({ chapterTitle: title, updatedData }); // Fix: Pass an object with the chapterTitle and updatedData properties as a single argument
  reloadPage();
}