// AI suggestion:  import Chapter from "../routes/[chapter].tsx";

import intro from "../data/chapters/Introduction.json" with { type: "json" };
import overview from "../data/chapters/An Overview of Mental Health Conditions.json" with { type: "json" };
import specific from "../data/chapters/Specific Mental Health Conditions.json" with { type: "json" };
import treatment from "../data/chapters/Treatment and Recovery.json" with { type: "json" };

const chapters = {
  Chapters: [
    {
      title: intro.title,
      description: intro.description,
      sections: intro.sections,
      imageUrl: intro.imageUrl,
    },
    {
      title: overview.title,
      description: overview.description,
      sections: overview.sections,
      imageUrl: overview.imageUrl,
    },
    {
      title: specific.title,
      description: specific.description,
      sections: specific.sections,
      imageUrl: specific.imageUrl,
    },
    {
      title: treatment.title,
      description: treatment.description,
      sections: treatment.sections,
      imageUrl: treatment.imageUrl,
    },
  ],
};

export const generateChaptersFromJSON = async (dbName: string, storeName: string) => {
  console.log(`Starting generateChaptersFromJSON function for database: ${dbName}, store: ${storeName}`);
  try {
    const request = indexedDB.open(dbName, 5);

    request.onerror = (event: Event) => {
      console.error("Error opening database:", (event.target as IDBOpenDBRequest).error);
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      console.log(`Upgrading database: ${dbName}`);
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "index" });
        console.log(`Object store ${storeName} created`);
      } else {
        console.log(`Object store ${storeName} already exists`);
      }
    };

    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = (event: Event) => {
        console.log(`Database ${dbName} opened successfully`);
        resolve((event.target as IDBOpenDBRequest).result);
      };
      request.onerror = reject;
    });

    const transaction = db.transaction([storeName], "readwrite");
    const objectStore = transaction.objectStore(storeName);

    for (const [index, chapter] of chapters.Chapters.entries()) {
      console.log(`Storing chapter ${index} in ${storeName}`);
      const chapterData = {
        index: index.toString(),
        title: chapter.title,
        description: chapter.description.blocks[0].text,
        sections: chapter.sections,
        imageUrl: chapter.imageUrl,
      };

      await new Promise<void>((resolve, reject) => {
        const request = objectStore.put(chapterData);
        request.onerror = (event: Event) => {
          console.error(`Error storing chapter ${index} in ${storeName}:`, (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
        request.onsuccess = () => {
          console.log(`Chapter ${index} stored successfully in ${storeName}`);
          resolve();
        };
      });
    }

    await new Promise<void>((resolve) => {
      transaction.oncomplete = () => {
        console.log(`All chapters stored in ${storeName}, closing database ${dbName}`);
        db.close();
        console.log("Database closed, reloading page");
        resolve();
      };
    });

    window.location.reload();
  } catch (error) {
    console.error(`Error in generateChaptersFromJSON for ${dbName}, ${storeName}:`, error);
  }
};