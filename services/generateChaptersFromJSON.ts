export const generateChaptersFromJSON = async (dbName: string, storeName: string) => {
  const chapters = await fetch("./static/chapters.json").then((res) => res.json());

  // Open the IndexedDB database
  const request = indexedDB.open(dbName, 2);

  request.onerror = function (event) {
    if ((event.target as IDBOpenDBRequest).error) {
      console.error("Error opening database:", (event.target as IDBOpenDBRequest).error);
    }
  };

  request.onupgradeneeded = function (event) {
    const db = (event.target as IDBOpenDBRequest).result;
    db.createObjectStore(storeName, { keyPath: "index" });
  };

  request.onsuccess = function (event) {
    const db = (event.target as IDBOpenDBRequest).result;
    const transaction = db.transaction([storeName], "readwrite");
    const objectStore = transaction.objectStore(storeName);

    Object.entries(chapters).forEach(([index]) => {
      const { title, description, imageUrl, sections } = chapters[index];
      const chapter = {
        index: index,
        title: title,
        description: description,
        sections: sections,
        imageUrl: imageUrl,
      };

      // Store the chapter data in IndexedDB
      const request = objectStore.put(chapter);

      request.onsuccess = function (_event) {
        console.log(`Chapter ${index} stored successfully`);
      };

      request.onerror = function (event) {
        if (event.target) {
          console.error(`Error storing chapter ${index}:`, event.target);
        } else {
          console.error(`Error storing chapter ${index}:`, "Unknown error");
        }
      };
    });

    transaction.oncomplete = function () {
      db.close();
      window.location.reload();
    };
  };
};
