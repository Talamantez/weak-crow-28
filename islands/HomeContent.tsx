import { Head } from "$fresh/runtime.ts";
import Footer from "../components/Footer.tsx";
import Button from "../components/Button.tsx";
import IconPlus from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/plus.tsx";
import IconX from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/x.tsx";
import { useLoadChapters } from "../services/useLoadChapters.ts";
import { dbName, storeName, dbVersion } from "../util/dbInfo.ts";
import { generateChaptersFromJSON } from "../services/generateChaptersFromJSON.ts";

const ChapterSection = ({ section, depth = 1 }) => {
  const renderHeading = () => {
    switch (depth) {
      case 1:
        return <h3 class="font-bold mt-2">{section.title}</h3>;
      case 2:
        return <h4 class="font-bold mt-2">{section.title}</h4>;
      case 3:
        return <h5 class="font-bold mt-2">{section.title}</h5>;
      default:
        return <h6 class="font-bold mt-2">{section.title}</h6>;
    }
  };

  return (
    <div class={`ml-${depth * 4}`}>
      {renderHeading()}
      <p>{section.description?.blocks?.[0]?.text || ''}</p>
      {section.sections?.map((subSection, index) => (
        <ChapterSection key={index} section={subSection} depth={depth + 1} />
      ))}
    </div>
  );
};

const Chapter = ({ chapter, onUpdate }) => {
  return (
    <div class="bg-white rounded-lg shadow-md p-4 mb-4">
      {chapter.imageUrl && (
        <img src={chapter.imageUrl} alt={chapter.title || 'Chapter image'} class="w-full h-32 object-cover rounded-t-lg mb-2" />
      )}
      <h2 class="text-xl font-bold mb-2">{chapter.title || 'Untitled Chapter'}</h2>
      {chapter.sections?.map((section, index) => (
        <ChapterSection key={index} section={section} />
      ))}
      <Button
        text="Edit"
        styles="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-1 mt-2"
        onClick={() => onUpdate(chapter)}
      />
    </div>
  );
};

export default function HomeContent() {
  const { chapters = [], error } = useLoadChapters(dbName, storeName, dbVersion);

  const handlePrint = async () => {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(chapters),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = "resource_roadmap.pdf";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const handleGenerate = async () => {
    console.log("Generate button clicked");
    try {
      await generateChaptersFromJSON("MyDatabase", "Chapters");
      console.log("Generation completed successfully");
    } catch (error) {
      console.error("Error generating chapters:", error);
    }
  }

  const updateChapter = (updatedChapter) => {
    if (!updatedChapter || !updatedChapter.id) {
      console.error("Invalid chapter data");
      return;
    }

    const request = indexedDB.open(dbName);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);
      objectStore.put(updatedChapter);
      setChapters(chapters.map(ch => ch.id === updatedChapter.id ? updatedChapter : ch));
    };
  };

  const clearAllChapters = () => {
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

  return (
    <div>
      <Head>
        <title>Resource Roadmap Editor</title>
      </Head>
      <main className="flex flex-col items-center justify-start my-10 p-4 mx-auto max-w-screen-lg">
        <div className="bg-gray-800 text-white w-full rounded-lg p-8 mb-10">
          <h1 className="text-3xl font-bold mb-4">Resource Roadmap</h1>
          <p className="mb-4">Welcome to Your Local Resource Publication Creator!</p>
          <Button
            text="Generate Example Chapters"
            styles="bg-white text-gray-800 rounded px-4 py-2 mb-2 w-full"
            onClick={handleGenerate}
          />
          <Button
            text="Print Your Roadmap"
            styles="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 w-full"
            onClick={handlePrint}
          />
        </div>
        
        <div className="w-full flex-col justify-between mb-10">
          <h2 className="font-bold text-2xl w-3/5 text-left mb-4">Chapters</h2>
          <div className="flex flex-col sm:flex-row justify-between w-full">
            <Button
              text="Add New Chapter"
              onClick={() => {window.location.href = "/new-chapter";}}
              styles="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 rounded-md py-2 px-4 text-white transition-colors focus:outline-none outline-none"
              icon={IconPlus}
            />
            <Button
              text="Delete All Chapters"
              onClick={clearAllChapters}
              styles="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-md py-2 px-4 transition-colors focus:outline-none outline-none"
              icon={IconX}
            />
          </div>
        </div>
        
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {chapters.map(chapter => (
            <Chapter key={chapter.id} chapter={chapter} onUpdate={updateChapter} />
          ))}
        </div>
        
        <Footer />
      </main>
    </div>
  );
}