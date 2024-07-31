import intro from "../data/chapters/Introduction.json" with { type: "json" };
import overview from "../data/chapters/An Overview of Mental Health Conditions.json" with { type: "json" };
// import specific from "../data/chapters/Specific Mental Health Conditions.json" with { type: "json" };
import treatment from "../data/chapters/Treatment and Recovery.json" with { type: "json" };
import housing from "../data/chapters/Housing.json" with { type: "json" };
import employment from "../data/chapters/Employment.json" with { type: "json" };
import hipaa from "../data/chapters/Understanding HIPAA.json" with { type: "json" };
import crisis from "../data/chapters/What to Do in a Crisis.json" with { type: "json" };
import advocacy from "../data/chapters/Advocacy.json" with { type: "json" };
import guardianship from "../data/chapters/Guardianship and Alternatives.json" with { type: "json" };
import justice from "../data/chapters/The Criminal Justice System.json" with { type: "json" };
import toolkit from "../data/chapters/Toolkit.json" with { type: "json" };
import appendices from "../data/chapters/Appendicies.json" with { type: "json" };
import acknowlegments from "../data/chapters/Acknowledgments.json" with { type: "json" };


const chapters = {
  Chapters: [
    {
      index: "0",
      title: intro.title,
      description: intro.description,
      sections: intro.sections,
      imageUrl: intro.imageUrl,
    },
    {
      index: "1",
      title: overview.title,
      description: overview.description,
      sections: overview.sections,
      imageUrl: overview.imageUrl,
    },
    {
      index: "2",
      title: treatment.title,
      description: treatment.description,
      sections: treatment.sections,
      imageUrl: treatment.imageUrl,
    },
    {
      index: "3",
      title: crisis.title,
      description: crisis.description,
      sections: crisis.sections,
      imageUrl: crisis.imageUrl,
    },
    {
      index: "4",
      title: justice.title,
      description: justice.description,
      sections: justice.sections,
      imageUrl: justice.imageUrl,
    },
    {
      index: "5",
      title: employment.title,
      description: employment.description,
      sections: employment.sections,
      imageUrl: employment.imageUrl,
    },
    {
      index: "6",
      title: housing.title,
      description: housing.description,
      sections: housing.sections,
      imageUrl: housing.imageUrl,
    },
    {
      index: "7",
      title: guardianship.title,
      description: guardianship.description,
      sections: guardianship.sections,
      imageUrl: guardianship.imageUrl,
    },
    {
      index: "8",
      title: hipaa.title,
      description: hipaa.description,
      sections: hipaa.sections,
      imageUrl: hipaa.imageUrl,
    },
    {
      index: "9",
      title: toolkit.title,
      description: toolkit.description,
      sections: toolkit.sections,
      imageUrl: toolkit.imageUrl,
    },
    {
      index: "10",
      title: advocacy.title,
      description: advocacy.description,
      sections: advocacy.sections,
      imageUrl: advocacy.imageUrl,
    },
    {
      index: "11",
      title: appendices.title,
      description: appendices.description,
      sections: appendices.sections,
      imageUrl: appendices.imageUrl,
    },
    {
      index: "12",
      title: acknowlegments.title,
      description: acknowlegments.description,
      sections: acknowlegments.sections,
      imageUrl: acknowlegments.imageUrl,
    },
  ],
};

export const generateChaptersFromJSON = async (dbName: string, storeName: string) => {
  console.log(`Starting generateChaptersFromJSON function for database: ${dbName}, store: ${storeName}`);
  try {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, 5);
      request.onerror = (event: Event) => {
        console.error("Error opening database:", (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
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
      request.onsuccess = (event: Event) => {
        console.log(`Database ${dbName} opened successfully`);
        resolve((event.target as IDBOpenDBRequest).result);
      };
    });

    const transaction = db.transaction([storeName], "readwrite");
    const objectStore = transaction.objectStore(storeName);

    // Get the current highest index
    const countRequest = objectStore.count();
    const count = await new Promise<number>((resolve, reject) => {
      countRequest.onsuccess = () => resolve(countRequest.result);
      countRequest.onerror = () => reject(countRequest.error);
    });

    for (const [index, chapter] of chapters.Chapters.entries()) {
      const newIndex = (count + index).toString();
      console.log(`Storing chapter ${newIndex} in ${storeName}`);
      const chapterData = {
        index: newIndex,
        title: chapter.title,
        description: chapter.description.blocks[0].text,
        sections: chapter.sections,
        imageUrl: chapter.imageUrl,
        isIncluded: true,
      };
      await new Promise<void>((resolve, reject) => {
        const request = objectStore.add(chapterData);
        request.onerror = (event: Event) => {
          console.error(`Error storing chapter ${newIndex} in ${storeName}:`, (event.target as IDBRequest).error);
          reject((event.target as IDBRequest).error);
        };
        request.onsuccess = () => {
          console.log(`Chapter ${newIndex} stored successfully in ${storeName}`);
          resolve();
        };
      });
    }

    await new Promise<void>((resolve) => {
      transaction.oncomplete = () => {
        console.log(`All new chapters stored in ${storeName}, closing database ${dbName}`);
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