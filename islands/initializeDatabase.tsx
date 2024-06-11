export const initializeDatabase = (
  indexedDB: IDBFactory = globalThis.indexedDB,
  dbName: string,
  dbVersion: number,
  storeName: string,
) => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onerror = function (event: Event) {
      const request = event.target as IDBOpenDBRequest;
      if (event.target !== null) {
        console.error("Error opening database:", request.error);
        reject(request.error);
      } else {
        console.error("Error opening database: event.target is null");
        reject(new Error("Error opening database: event.target is null"));
      }
    };
    request.onupgradeneeded = function (event: IDBVersionChangeEvent) {
      const request = event.target as IDBOpenDBRequest;
      const db = request.result;
      if (db instanceof IDBDatabase) {
        if (!db.objectStoreNames.contains(storeName)) {
          const objectStore = db.createObjectStore(storeName, { keyPath: "title" });
          objectStore.createIndex("titleIndex", "title", { unique: true });
        }
      } else {
        console.error("Error upgrading database: db is not an instance of IDBDatabase");
      }
    };
    request.onsuccess = function (event: Event) {
      const request = event.target as IDBOpenDBRequest;
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        const objectStore = db.createObjectStore(storeName, { keyPath: "title" });
        objectStore.createIndex("titleIndex", "title", { unique: true });
      }
      console.log("Database initialized successfully.");
      resolve(db);
    };
  });
};