import { useState, useEffect } from "preact/hooks";
import { Head } from "$fresh/runtime.ts";
import Footer from "../components/Footer.tsx";
import Button from "../components/Button.tsx";
import IconPlus from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/plus.tsx";
import IconX from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/x.tsx";
import IconEdit from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/edit.tsx";
import IconCheck from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/check.tsx";
import { dbName, storeName } from "../util/dbInfo.ts";

const EditableText = ({ initialText, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(initialText);

  return isEditing ? (
    <div className="flex items-center">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="border rounded px-2 py-1 mr-2"
      />
      <Button
        icon={IconCheck}
        onClick={() => {
          onSave(text);
          setIsEditing(false);
        }}
        styles="bg-green-500 hover:bg-green-600 text-white rounded-full p-1"
      />
    </div>
  ) : (
    <div className="flex items-center">
      <span className="mr-2">{text}</span>
      <Button
        icon={IconEdit}
        onClick={() => setIsEditing(true)}
        styles="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1"
      />
    </div>
  );
};

const Chapter = ({ chapter, onUpdate }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <img src={chapter.imageUrl} alt={chapter.title} className="w-full h-32 object-cover rounded-t-lg mb-2" />
      <EditableText
        initialText={chapter.title}
        onSave={(newTitle) => onUpdate({ ...chapter, title: newTitle })}
      />
      <EditableText
        initialText={`${chapter.sections} Sections`}
        onSave={(newSections) => onUpdate({ ...chapter, sections: parseInt(newSections) })}
      />
      <Button
        text="View"
        styles="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-1 mt-2"
        onClick={() => {/* Handle view action */}}
      />
    </div>
  );
};

export default function HomeContent() {
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    // Load chapters from IndexedDB
    const request = indexedDB.open(dbName);
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(storeName, "readonly");
      const objectStore = transaction.objectStore(storeName);
      const getAllRequest = objectStore.getAll();
      getAllRequest.onsuccess = () => {
        setChapters(getAllRequest.result);
      };
    };
  }, []);

  const updateChapter = (updatedChapter) => {
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
            onClick={() => {/* Handle generation */}}
          />
          <Button
            text="Print Your Roadmap"
            styles="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 w-full"
            onClick={() => {/* Handle printing */}}
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
};