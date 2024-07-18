export const initializeDatabase = (
  indexedDB: IDBFactory,
  dbName: string,
  dbVersion: number,
  storeName: string,
  versionStoreName: string
): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = (event) => {
      reject("Error opening database");
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "index" });
      }

      // Create the new object store for versions if it doesn't exist
      if (!db.objectStoreNames.contains(versionStoreName)) {
        db.createObjectStore(versionStoreName, { keyPath: "id" });
      }
    };
  });
};