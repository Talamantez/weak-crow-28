import { useEffect, useState } from "preact/hooks";
import { Section } from "../util/SectionData.ts";
// import { getDatabaseInfo } from "./getDatabaseInfo.tsx";
import { initializeDatabase } from "./initializeDatabase.tsx";
import { fetchChaptersFromIndexedDB } from "./fetchChaptersFromIndexedDB.tsx";
interface ChapterData {
  index: number;
  title: string;
  description: string;
  sections: Section[];
  imageUrl?: string;
}

export const dbName = "MyDatabase";
export const storeName = "Chapters";
export const dbVersion = 2;

export default function Chapters() {
  // @ts-ignore - TS2488 [ERROR]: Type '[{}, StateUpdater<{}>]' must have a '[Symbol.iterator]()' method that returns an iterator. It is probably an issue with TS.
  const [chapters, setChapters] = useState<ChapterData[]>([{
    index: 0,
    title: "",
    description: "",
    sections: [],
    imageUrl: "",
  }]);

  useEffect(() => {
    const openDatabase = (indexedDB: IDBFactory): Promise<IDBDatabase> => {
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
  
    const checkDatabaseInitialized = (db: IDBDatabase): Promise<boolean> => {
      return new Promise((resolve) => {
        const transaction = db.transaction(storeName, "readonly");
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.count();
        request.onsuccess = () => {
          const count = request.result;
          resolve(count > 0);
        };
      });
    };
  
    openDatabase(indexedDB)
      .then((db: IDBDatabase) => {
        return checkDatabaseInitialized(db).then((isInitialized) => {
          if (isInitialized) {
            return db;
          } else {
            return initializeDatabase(indexedDB, dbName, dbVersion, storeName).then(() => db);
          }
        });
      })
      // @ts-ignore TS does not see 'Promise'
      .then((db: IDBDatabase) => fetchChaptersFromIndexedDB(db) as Promise<ChapterData[]>)
      .then((chapters: ChapterData[]) => {
        setChapters(chapters);
      })
      .catch((error: any) => {
        console.error("Error initializing database or fetching chapters:", error);
      });
  }, []);

  return (
    <div class="flex flex-col items-center w-full">
      <div class="grid grid-cols-1 gap-y-5 md:(grid-cols-2 gap-x-20 gap-y-10) w-full">
        {/* @ts-ignore */}
        {chapters.length > 0 && chapters[0].title.length > 0 &&
          (
            <>
              {/* @ts-ignore */}
              {chapters!.map((chapter) => (
                <a
                  key={chapter.title}
                  href={`/${chapter.title}`}
                  class="border rounded-md border-gray-300 hover:border-gray-400 py-3 px-5 transition cursor-pointer flex items-center justify-start bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div class="w-3/5">
                    {chapter.imageUrl && (
                      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                        <img
                          src={chapter.imageUrl}
                          alt="chapter cover image"
                          class="w-full h-48 object-cover"
                        />
                      </div>
                    )}

                    <h1 class="font-bold">{chapter.title}</h1>
                    <p class="text-gray-500">{chapter.description}</p>
                    <p class="text-gray-500 mt-2">
                      <span>
                        {(chapter.sections && chapter.sections.length)
                          ? <>{chapter.sections.length} Sections</>
                          : <>0 Sections</>}
                      </span>
                    </p>
                  </div>
                  <div class="flex items-center justify-end w-2/5">
                    <a
                      href={`/${chapter.title}`}
                      class="bg-blue-500 hover:bg-blue-600 rounded-md py-1 px-2 text-gray-100 transition-colors"
                    >
                      View
                    </a>
                  </div>
                </a>
              ))}
            </>
          )}
      </div>
      {/* @ts-ignore */}
      {(!chapters[0] || !chapters[0].title || !chapters[0].title.length) && (
        <div class="flex w-full m-0">
          <h1 class="my-6 w-full text-left m-0">No chapters yet</h1>
        </div>
      )}
    </div>
  );
}
