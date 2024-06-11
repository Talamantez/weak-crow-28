export const checkDatabaseInitialized = (db: IDBDatabase, storeName: string): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!db.objectStoreNames.contains(storeName)) {
        resolve(false);
      } else {
        const transaction = db.transaction(storeName, "readonly");
        const objectStore = transaction.objectStore(storeName);
        if (!objectStore.indexNames.contains("titleIndex")) {
          resolve(false);
        } else {
          const request = objectStore.count();
          request.onsuccess = () => {
            const count = request.result;
            resolve(count > 0);
          };
        }
      }
    });
  };