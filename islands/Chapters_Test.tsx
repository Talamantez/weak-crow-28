import { useEffect, useState } from "preact/hooks";
import { Section } from "../util/SectionData.ts";

const clearAllChapters = () => {
  const dbName = "MyDatabase";
  const storeName = "Chapters";

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);

    request.onerror = function (event: Event) {
      console.error("Error opening database:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = function (event: Event) {
      const db = event.target.result;
      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);

      // Clear all chapters from the object store
      const clearRequest = objectStore.clear();

      clearRequest.onsuccess = function () {
        console.log("All chapters cleared from IndexedDB");
        db.close();
        resolve();
      };

      clearRequest.onerror = function (event: Event) {
        console.error("Error clearing chapters from IndexedDB:", event.target.error);
        db.close();
        reject(event.target.error);
      };
    };
  })
    .then(() => {
      window.location.reload();
    })
    .catch((error) => {
      console.error("Error clearing chapters:", error);
    });
};
interface ChapterData {
  index: number;
  title: string;
  description: string;
  sections: Section[];
  imageUrl?: string;
}

export default function Chapters() {
  const [chapters, setChapters] = useState<ChapterData[]>([{
    index: 0,
    title: "",
    description: "",
    sections: [],
    imageUrl: "",
  }]);

  useEffect(() => {
    const tempChapters = [];
    let sortedTempChapters = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.includes("Chapter")) {
        const stored = JSON.parse(sessionStorage.getItem(key)!);
        tempChapters.push(stored);
      }
    }
    sortedTempChapters = tempChapters.sort((a, b) => a.index - b.index);
    setChapters(sortedTempChapters);
  }, []);

  return (
    <div class="flex flex-col items-center w-full">
      <div class="flex justify-end w-full">

        <button
          onClick={clearAllChapters}
          class="bg-green-500 hover:bg-green-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
        >
          Clear Chapters
        </button>
      </div>

      <div class="grid grid-cols-1 gap-y-5 md:(grid-cols-2 gap-x-20 gap-y-10) w-full">
        {chapters.length > 0 && chapters[0].title.length > 0 &&
          (
            <>
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
      {(!chapters[0] || !chapters[0].title || !chapters[0].title.length) && (
        <div class="flex w-full m-0">
          <h1 class="my-6 w-full text-left m-0">No chapters yet</h1>
        </div>
      )}
    </div>
  );
}
