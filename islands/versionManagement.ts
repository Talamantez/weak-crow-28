import { Chapter } from "./types.ts";
import { dbName, dbVersion } from "../util/roadmapVersionInfo.ts";

export const VERSION_STORE_NAME = "roadmapVersions";

export interface RoadmapVersion {
  id: string;
  name: string;
  date: string;
  chapters: Chapter[];
}

const openDatabase = (dbName: string, storeName: string, dbVersion: number): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    
    request.onerror = () => reject(new Error('Failed to open database'));
    
    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
    
    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id" });
      }
    };
  });
};

export async function saveVersion(name: string, chapters: Chapter[]): Promise<void> {
  const db = await openDatabase(dbName, VERSION_STORE_NAME, dbVersion);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VERSION_STORE_NAME, "readwrite");
    const store = tx.objectStore(VERSION_STORE_NAME);
    const newVersion: RoadmapVersion = {
      id: Date.now().toString(),
      name,
      date: new Date().toISOString(),
      chapters,
    };
    const request = store.add(newVersion);
    request.onerror = () => reject(new Error('Failed to save version'));
    request.onsuccess = () => resolve();
  });
}

export async function loadVersions(): Promise<RoadmapVersion[]> {
  const db = await openDatabase(dbName, VERSION_STORE_NAME, dbVersion);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VERSION_STORE_NAME, "readonly");
    const store = tx.objectStore(VERSION_STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject(new Error('Failed to load versions'));
    request.onsuccess = () => resolve(request.result);
  });
}

export async function loadVersion(id: string): Promise<RoadmapVersion | undefined> {
  const db = await openDatabase(dbName, VERSION_STORE_NAME, dbVersion);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VERSION_STORE_NAME, "readonly");
    const store = tx.objectStore(VERSION_STORE_NAME);
    const request = store.get(id);
    request.onerror = () => reject(new Error('Failed to load version'));
    request.onsuccess = () => resolve(request.result);
  });
}

export async function deleteVersion(id: string): Promise<void> {
  const db = await openDatabase(dbName, VERSION_STORE_NAME, dbVersion);
  return new Promise((resolve, reject) => {
    const tx = db.transaction(VERSION_STORE_NAME, "readwrite");
    const store = tx.objectStore(VERSION_STORE_NAME);
    const request = store.delete(id);
    request.onerror = () => reject(new Error('Failed to delete version'));
    request.onsuccess = () => resolve();
  });
}