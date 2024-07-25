import { useState } from "preact/hooks";
import Button from "./Button.tsx";
import Loader from "./Loader.tsx";
import { dbName, dbVersion, storeName } from "../util/dbInfo.ts";

const ImageUploader = ({ onImageUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = async (e: Event) => {
    e.preventDefault();
    setUploading(true);
    setError(null);
    const form = e.target as HTMLFormElement;
    const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
    const file = fileInput.files[0];

    if (file) {
      try {
        const base64String = await convertToBase64(file);
        onImageUploaded(base64String);
      } catch (error) {
        console.error("Upload error:", error);
        setError("Failed to encode image. Please try again.");
      } finally {
        setUploading(false);
      }
    } else {
      setError("No file selected");
      setUploading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div>
      {error && <p class="text-red-500 mb-2">{error}</p>}
      {uploading ? (
        <Loader />
      ) : (
        <form onSubmit={handleImageUpload}>
          <input type="file" name="image" accept="image/*" required />
          <button
            type="submit"
            class="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 mt-2"
          >
            Upload Image
          </button>
        </form>
      )}
    </div>
  );
};

const NewChapterModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUploaded = (base64String: string) => {
    setImageUrl(base64String);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (title === "" || description === "" || !imageUrl) {
      setError("Please fill in all fields and upload an image.");
      setIsSubmitting(false);
      return;
    }

    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);

      const countRequest = objectStore.count();
      const count = await new Promise<number>((resolve, reject) => {
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = () => reject(countRequest.error);
      });

      const newChapter = {
        index: count.toString(),
        title,
        description,
        sections: [],
        imageUrl,
        isIncluded: true,
      };

      await new Promise<void>((resolve, reject) => {
        const addRequest = objectStore.add(newChapter);
        addRequest.onerror = (event) => {
          console.error("Error details:", event.target.error);
          reject(event.target.error);
        };
        addRequest.onsuccess = () => resolve();
      });

      onSave(newChapter);
      onClose();
    } catch (error) {
      console.error("Error adding chapter:", error);
      setError("Failed to add chapter. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Add New Chapter</h2>
        {error && <p class="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div class="mb-4">
            <label htmlFor="title" class="block mb-2">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              class="w-full p-2 border rounded"
              required
            />
          </div>
          <div class="mb-4">
            <label htmlFor="description" class="block mb-2">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              class="w-full p-2 border rounded"
              rows="3"
              required
            />
          </div>
          <div class="mb-4">
            <label htmlFor="coverImage" class="block mb-2">Cover Image</label>
            <ImageUploader onImageUploaded={handleImageUploaded} />
            {imageUrl && (
              <div class="mt-2">
                <img class="max-h-32 object-cover" src={imageUrl} alt="Uploaded" />
              </div>
            )}
          </div>
          <div class="flex justify-end">
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
              disabled={isSubmitting || !imageUrl}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChapterModal;