import { safeSessionStorageGetItem } from "./safeSessionStorageGetItem.ts";


export async function printChapter({ title }: { title: string; }): Promise<void> {
  const stored = await safeSessionStorageGetItem({ key: `Chapter Manager: ${title}` });
  console.log(stored);
  fetch("/api/printChapterWithCover", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: stored,
  })
    .then((response) => {
      if (response.ok) {
        return response.blob();
      } else {
        throw new Error("Request failed.");
      }
    })
    .then((blob) => {
      // Create a temporary URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a temporary link element and trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.download = "output.pdf";
      link.click();

      // Clean up the temporary URL
      URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
