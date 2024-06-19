import { storeName } from "../util/dbInfo.ts";

export const fetchChaptersFromIndexedDB = (db: IDBDatabase) => {
  // @ts-ignore TS7006 [ERROR]: Parameter 'reject' implicitly has an 'any' type.
  return new Promise((resolve, reject) => {

    const transaction = db.transaction(storeName, "readonly");
    const objectStore = transaction.objectStore(storeName);
    const getAllRequest = objectStore.getAll();

    getAllRequest.onsuccess = function (event: Event) {
      const chapters = (event.target as IDBRequest).result;
      const sortedChapters = chapters.sort((a: { index: number; }, b: { index: number; }) => a.index - b.index);
      resolve(sortedChapters);
    };

    getAllRequest.onerror = function (event: Event) {
      const errorEvent = event as ErrorEvent;
      console.error("Error fetching chapters:", errorEvent.error);
      reject(errorEvent.error);
    };
  });
};
