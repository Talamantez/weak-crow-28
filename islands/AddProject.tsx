import { useState } from "preact/hooks";
import Loader from "../components/Loader.tsx";

export default function AddProject() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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
      alert(error.message)
    }
    setUploading(false);
    imageForm.reset();
  };

  const handleSave = () => {
    if (imageUrl) {
      setSaving(true);
      try {
        sessionStorage.setItem("savedImage", imageUrl);        
      } catch (error) {
        setSaving(false);
        return alert(error.message)
      }
      setSaving(false);
      alert("Image saved to session storage.");
    }
  };

  const addProject = () => {
    if (title === "" || description === "" || !imageUrl) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      sessionStorage.setItem(
        "Chapter Manager: " + title,
        JSON.stringify({
          index: sessionStorage.length,
          title: title,
          description: description,
          sections: [],
          imageUrl: imageUrl,
        }),
      );
    } catch (error) {
      alert(error.message)
    }

    window.location.href = "/";
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
      <div class="w-4/5 border-2 rounded-md mt-2 px-2 py-1 border-blue-500 focus:border-blue-600 outline-none">
        <h1>Photo Upload</h1>
        {uploading ? <Loader /> : null}
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
            <button
              onClick={handleSave}
              class="bg-blue-500 hover:bg-blue-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5 max-h-32"
            >
              Accept and Save Image
            </button>
            <img class="max-h-56" src={imageUrl} alt="Uploaded" />
          </div>
        )}
      </div>
      <div class="w-4/5 flex items-center justify-between">
        <a
          href="/"
          class="bg-red-500 hover:bg-red-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
        >
          Cancel
        </a>
        <button
          onClick={() => addProject()}
          class="bg-blue-500 hover:bg-blue-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
        >
          Add
        </button>
      </div>
    </>
  );
}
