import { useState } from "preact/hooks";
import Button from "../components/Button.tsx";
import { dbName, dbVersion, storeName } from "../util/dbInfo.ts";

const NewChapterModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const addChapterToIndexedDB = (newChapter) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onerror = (event) => {
        console.error("Database error:", event.target.error);
        reject("Failed to open database");
      };
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readwrite");
        const objectStore = transaction.objectStore(storeName);
        
        const addRequest = objectStore.add(newChapter);
        
        addRequest.onerror = (event) => {
          console.error("Error adding new chapter:", event.target.error);
          reject("Failed to add new chapter");
        };
        
        addRequest.onsuccess = () => {
          console.log("New chapter added successfully to IndexedDB");
          resolve(newChapter);
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      };
    });
  };

  const verifyChapterInIndexedDB = (chapterId) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onerror = (event) => {
        console.error("Database error:", event.target.error);
        reject("Failed to open database for verification");
      };
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(storeName, "readonly");
        const objectStore = transaction.objectStore(storeName);
        
        const getRequest = objectStore.get(chapterId);
        
        getRequest.onerror = (event) => {
          console.error("Error verifying chapter:", event.target.error);
          reject("Failed to verify chapter");
        };
        
        getRequest.onsuccess = () => {
          if (getRequest.result) {
            console.log("Chapter verified in IndexedDB");
            resolve(true);
          } else {
            console.log("Chapter not found in IndexedDB");
            resolve(false);
          }
        };
        
        transaction.oncomplete = () => {
          db.close();
        };
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const createNewChapter = (imageUrl = null) => ({
      id: Date.now().toString(),
      title,
      description: { blocks: [{ type: "paragraph", text: description }] },
      imageUrl,
      sections: [],
    });

    try {
      let newChapter;
      if (imageFile) {
        const reader = new FileReader();
        newChapter = await new Promise((resolve, reject) => {
          reader.onloadend = () => resolve(createNewChapter(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });
      } else {
        newChapter = createNewChapter();
      }

      await addChapterToIndexedDB(newChapter);
      const isVerified = await verifyChapterInIndexedDB(newChapter.id);
      
      if (isVerified) {
        onSave(newChapter);
        onClose();
      } else {
        throw new Error("Failed to verify chapter in IndexedDB");
      }
    } catch (error) {
      console.error("Failed to add or verify chapter:", error);
      setError("Failed to add chapter. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add New Chapter</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block mb-2">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="description" className="block mb-2">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="coverImage" className="block mb-2">Cover Image</label>
            <input
              type="file"
              id="coverImage"
              onChange={(e) => setImageFile(e.target.files[0])}
              accept="image/*"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex justify-end">
            <Button
              text="Cancel"
              onClick={onClose}
              styles="bg-gray-300 hover:bg-gray-400 text-black rounded px-4 py-2 mr-2"
              disabled={isSubmitting}
            />
            <Button
              text={isSubmitting ? "Saving..." : "Save"}
              type="submit"
              styles="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChapterModal;