import { safeSessionStorageGetItem, safeSessionStorageSetItem } from "./SafeSessionStorage.ts"


export function updateChapterDescription(
  { newText, title }: { newText: string; title: string; }
): void {
  if (newText.trim() === "") return window.location.reload();

  const stored = JSON.parse(
    safeSessionStorageGetItem(`Chapter Manager: ${title}`)!
  );
  safeSessionStorageSetItem(
    `Chapter Manager: ${title}`,
    JSON.stringify({ ...stored, description: newText })
  );
  window.location.reload();
}
