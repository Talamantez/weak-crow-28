import { dbName } from "../util/dbInfo.ts";

export function printAllChapters(): Promise<void> {  const storeName = "Chapters";

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);

    request.onerror = function (event: Event) {
      console.error("Error opening database:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = function (event: Event) {
      const db = event.target.result;
      const transaction = db.transaction(storeName, "readonly");
      const objectStore = transaction.objectStore(storeName);

      const getAllRequest = objectStore.getAll();

      getAllRequest.onsuccess = function (event: Event) {
        const chapters = event.target.result;
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
            db.close();
            resolve();
          })
          .catch((error) => {
            console.error("Error:", error);
            db.close();
            reject(error);
          });
      };

      getAllRequest.onerror = function (event: Event) {
        console.error("Error retrieving chapters from IndexedDB:", event.target.error);
        db.close();
        reject(event.target.error);
      };
    };
  });
}
