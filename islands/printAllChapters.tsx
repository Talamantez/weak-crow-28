import { safeSessionStorageGetItem } from "../util/safeSessionStorageGetItem.ts";


export async function printAllChapters(): Promise<void> {
  // Retrieve all chapters from session storage
  const chapters = [];

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith("Chapter Manager:")) {
      const stored = await safeSessionStorageGetItem(key);
      if (stored) {
        chapters.push(JSON.parse(stored));
      }
    }
  }

  const sortedChapters = chapters.sort((a, b) => a.index - b.index);

  fetch("/api/printAllChapters", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sortedChapters),
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
