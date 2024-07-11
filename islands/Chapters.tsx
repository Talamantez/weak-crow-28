import { useEffect, useState } from "preact/hooks";
// import { Section } from "../util/SectionData.ts";
import { initializeDatabaseIfNeeded } from "../util/initializeDatabaseIfNeeded.ts";
import { fetchChaptersFromIndexedDB } from "./fetchChaptersFromIndexedDB.tsx";
import { dbName, dbVersion, storeName } from "../util/dbInfo.ts";

// Define the RichText interface (similar to the PDF generator)
interface RichText {
  blocks: Block[];
}

interface Block {
  type: BlockType;
  text: string;
}

type BlockType = "paragraph" | "header" | "unordered-list-item";

// Update the ChapterData interface
interface ChapterData {
  index: number;
  title: string; // Change the type of 'title' to string
  description: RichText | string; // Update the type of 'description' to be RichText or string
  sections: Section[];
  imageUrl?: string;
}

// Update the Section interface (assuming it's imported from SectionData.ts)
interface Section {
  title: RichText;
  description?: RichText;
  content?: RichText;
  sections?: Section[];
}

// Helper function to render RichText
function renderRichText(richText: RichText) {
  return richText.blocks.map((block, index) => {
    switch (block.type) {
      case "header":
        return <h2 key={index}>{block.text}</h2>;
      case "paragraph":
        return <p key={index}>{block.text}</p>;
      case "unordered-list-item":
        return <li key={index}>{block.text}</li>;
      default:
        return <span key={index}>{block.text}</span>;
    }
  });
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
    initializeDatabaseIfNeeded(indexedDB, dbName, dbVersion, storeName)
      .then((db: IDBDatabase) =>
        fetchChaptersFromIndexedDB(db) as Promise<ChapterData[]>
      )
      .then((chapters: ChapterData[]) => {
        setChapters(chapters);
      })
      // deno-lint-ignore no-explicit-any
      .catch((error: any) => {
        console.error(
          "Error initializing database or fetching chapters:",
          error,
        );
      });
  }, []);

  return (
    <div class="flex flex-col items-center w-full">
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
                          class="h-48 object-scale-down"
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
