import { useEffect, useState } from "preact/hooks";

export const useLoadChapters = (dbName: string, storeName: string, dbVersion: number) => {
  const [chapters, setChapters] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadChapters = async () => {
      try {
        const db = await openDatabase(dbName, storeName, dbVersion);
        const loadedChapters = await getAllChapters(db, storeName);
        setChapters(loadedChapters);
      } catch (err) {
        console.error('Error loading chapters:', err);
        setError(err.message || 'An error occurred while loading chapters');
      }
    };

    loadChapters();
  }, [dbName, storeName, dbVersion]);

  return { chapters, error };
};

const openDatabase = (dbName: string, storeName: string, dbVersion: number): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = () => reject(new Error('Failed to open database'));

    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        // If the object store doesn't exist, close the database and reopen it with a new dbVersion
        db.close();
        const newDbVersion = db.version + 1;
        openDatabase(dbName, storeName, newDbVersion).then(resolve).catch(reject);
      } else {
        resolve(db);
      }
    };

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "index" });
      }
    };
  });
};

const getAllChapters = (db: IDBDatabase, storeName: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const objectStore = transaction.objectStore(storeName);
    const request = objectStore.getAll();
    
    request.onerror = () => reject(new Error('Failed to retrieve chapters'));
    request.onsuccess = () => {
      const chapters = request.result.map(chapter => ({
        index: chapter.index || '',
        title: chapter.title || '',
        description: chapter.description || { blocks: [{ type: 'paragraph', text: '' }] },
        sections: chapter.sections || [],
        imageUrl: chapter.imageUrl || './static/images/default-chapter.jpg'
      }));
      resolve(chapters);
    };
  });
};