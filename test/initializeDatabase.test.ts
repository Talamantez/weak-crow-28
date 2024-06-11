// initializeDatabase.test.ts
import { initializeDatabase } from "../islands/initializeDatabase.tsx";
import "https://deno.land/x/indexeddb@v1.1.0/polyfill.ts";
import { dbName, dbVersion, storeName } from "../islands/Chapters.tsx";
import { assert } from "https://deno.land/std@0.224.0/assert/assert.ts";

Deno.test({
  name: "initializeDatabase should create the database and object store",
  async fn() {
    await initializeDatabase(indexedDB, dbName, dbVersion, storeName);

    const request = indexedDB.open(dbName, dbVersion);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onerror = () => {
        reject(new Error("Error opening database"));
      };
      request.onsuccess = (event: Event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };
    });

    try {
      assert(db instanceof IDBDatabase, "Database should be created");
      assert(
        db.objectStoreNames.contains(storeName),
        "Object store should be created",
      );

      const transaction = db.transaction(storeName, "readonly");
      const objectStore = transaction.objectStore(storeName);

      assert(
        objectStore.indexNames.contains("titleIndex"),
        "Index should be created",
      );

      await new Promise<void>((resolve, reject) => {
        transaction.oncomplete = () => {
          resolve();
        };
        transaction.onerror = () => {
          reject(new Error("Transaction error"));
        };
      });
    } finally {
      db.close();
    }
  },
  sanitizeResources: false,
  sanitizeOps: false,
});