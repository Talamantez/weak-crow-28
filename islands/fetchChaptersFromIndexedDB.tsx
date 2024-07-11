import { storeName } from "../util/dbInfo.ts";

export const fetchChaptersFromIndexedDB = (db: IDBDatabase): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const objectStore = transaction.objectStore(storeName);
    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = function (event: Event) {
      const chapters = (event.target as IDBRequest).result;
      
      // Ensure all chapters have a valid index
      const chaptersWithIndex = chapters.map((chapter, i) => ({
        ...chapter,
        index: typeof chapter.index === 'number' ? chapter.index : i
      }));
      
      // Sort chapters based on index
      const sortedChapters = chaptersWithIndex.sort((a, b) => {
        return (a.index ?? Infinity) - (b.index ?? Infinity);
      });
      
      console.log("Sorted chapters:", sortedChapters.map(c => c.index));
      resolve(sortedChapters);
    };

    getAllRequest.onerror = function (event: Event) {
      const errorEvent = event as ErrorEvent;
      console.error("Error fetching chapters:", errorEvent.error);
      reject(errorEvent.error);
    };
  });
};