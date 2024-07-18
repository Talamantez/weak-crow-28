import { useState } from "preact/hooks";
import Button from "../components/Button.tsx";
import Loader from "../components/Loader.tsx";
import { dbName, dbVersion, storeName } from "../util/dbInfo.ts";

const NewChapterModal = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

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
      setError(error.message);
    }
    setUploading(false);
    imageForm.reset();
  };

  const handleSubmit = async (e: Event) => {
    // alert("Running handleSubmit");
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (title === "" || description === "" || !imageUrl) {
      setError("Please fill in all fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      // alert("Running try block");
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(dbName, dbVersion);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);

      // Get the current highest index
      const countRequest = objectStore.count();
      const count = await new Promise<number>((resolve, reject) => {
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = () => reject(countRequest.error);
      });
      // alert("Initializing new chapter object")
      const newChapter = {
        index: count.toString(), // Use the current count as the new index
        title,
        description, // Store description as a string
        sections: [],
        imageUrl,
        isIncluded: true,
      };

      // alert("Initialize Add Request Promise")

      await new Promise<void>((resolve, reject) => {
        // alert("Running Promise")
        const addRequest = objectStore.add(newChapter);
        addRequest.onerror = (event) => {
          // alert("Promise errorer out")
          // alert(event.target.error)
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add New Chapter</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
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
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="coverImage" className="block mb-2">Cover Image</label>
            {uploading ? (
              <Loader />
            ) : (
              <div>
                <form onSubmit={handleImageUpload}>
                  <input type="file" name="image" accept="image/*" required />
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 mt-2"
                  >
                    Upload and Preview Image
                  </button>
                </form>
                {imageUrl && (
                  <div className="mt-2">
                    <img className="max-h-32 object-cover" src={imageUrl} alt="Uploaded" />
                  </div>
                )}
              </div>
            )}
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
              disabled={isSubmitting || !imageUrl}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChapterModal;