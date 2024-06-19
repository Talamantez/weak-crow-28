import { useState } from "preact/hooks";
import Loader from "../components/Loader.tsx";
import { dbName, storeName } from "../util/dbInfo.ts";

export default function AddChapter() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: Event) => {
    e.preventDefault();
    setUploading(true);
    const imageForm = e.target as HTMLFormElement;

    try {
      const imageFormData = new FormData(imageForm);
      const resp = await fetch("/api/upload", {
        method: "POST",
        body: imageFormData,
      });
      const { url } = await resp.json();
      setImageUrl(url);
    } catch (error) {
      alert(error.message);
    }
    setUploading(false);
    imageForm.reset();
  };

  const addChapter = () => {
    if (title === "" || description === "" || !imageUrl) {
      alert("Please fill in all fields.");
      return;
    }

    const request = indexedDB.open(dbName);

    request.onerror = function (event: Event) {
      console.error("Error opening database:", event.target.error);
      alert("Error opening database. Please try again.");
    };

    request.onsuccess = function (event: Event) {
      const db = event.target.result;
      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);

      const chapter = {
        index: Date.now(), // Use current timestamp as index
        title: title,
        description: description,
        sections: [],
        imageUrl: imageUrl,
      };

      const addRequest = objectStore.add(chapter);

      addRequest.onsuccess = function () {
        console.log("Chapter added to IndexedDB");
        db.close();
        window.location.href = "/";
      };

      addRequest.onerror = function (event: Event) {
        console.error("Error adding chapter to IndexedDB:", event.target.error);
        alert("Error adding chapter. Please try again.");
        db.close();
      };
    };
  };

  return (
    <>
      <input
        type="text"
        placeholder="Chapter Title"
        onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
        class="w-4/5 border-2 rounded-md mt-2 px-2 py-1 text-center border-blue-500 focus:border-blue-600 outline-none"
        autoFocus
      />
      <textarea
        type="text"
        placeholder="Chapter Description"
        onChange={(e) => setDescription((e.target as HTMLInputElement).value)}
        rows={10}
        class="w-4/5 border-2 rounded-md mt-2 px-2 py-1 text-left border-blue-500 focus:border-blue-600 outline-none"
      />
      {uploading
        ? <Loader />
        : (
          <div class="w-4/5 border-2 rounded-md mt-2 px-2 py-1 border-blue-500 focus:border-blue-600 outline-none">
            <h1>Photo Upload</h1>
            <form onSubmit={handleImageUpload}>
              <input type="file" name="image" accept="image/*" />
              <button
                type="submit"
                class="bg-blue-500 hover:bg-blue-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
              >
                Upload
              </button>
            </form>
            {imageUrl && (
              <div class="flex">
                <img class="max-h-56" src={imageUrl} alt="Uploaded" />
              </div>
            )}
          </div>
        )}
      <div class="w-4/5 flex items-center justify-between">
        <a
          href="/"
          class="bg-red-500 hover:bg-red-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
        >
          Cancel
        </a>
        <button
          onClick={() => addChapter()}
          class="bg-blue-500 hover:bg-blue-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
        >
          Add
        </button>
      </div>
    </>
  );
}
