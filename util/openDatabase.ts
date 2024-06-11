export const openDatabase = (indexedDB: IDBFactory, dbName: string, dbVersion: number): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onerror = () => {
        reject(new Error("Error opening database"));
      };
      request.onsuccess = () => {
        const db = request.result;
        resolve(db);
      };
    });
  };