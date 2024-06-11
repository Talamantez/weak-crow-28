export const getDatabaseInfo = (db: IDBDatabase) => {
  console.log("Database name:", db.name);
  console.log("Database version:", db.version);

  const objectStoreNames = db.objectStoreNames;
  console.log("Object stores:");
  for (let i = 0; i < objectStoreNames.length; i++) {
    const storeName = objectStoreNames[i];
    console.log("- " + storeName);

    const transaction = db.transaction(storeName, "readonly");
    const objectStore = transaction.objectStore(storeName);

    const countRequest = objectStore.count();
    countRequest.onsuccess = function (event: Event) {
      const count = (event.target as IDBRequest).result;
      console.log(`  Number of items in ${storeName}: ${count}`);
    };
  }
};
