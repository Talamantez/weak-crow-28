import { useState } from "preact/hooks";

export default function AddProject() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const resp = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    const { url } = await resp.json();
    setImageUrl(url);
    form.reset();
  };

  const handleSave = () => {
    if (imageUrl) {
      localStorage.setItem("savedImage", imageUrl);
      alert("Image saved to localStorage!");
    }
  };

  const addProject = () => {
    if (title === "" || description === "" || !imageUrl) {
      alert("Please fill in all fields.");
      return;
    }
    localStorage.setItem(
      "Chapter Manager: " + title,
      JSON.stringify({
        index: localStorage.length,
        title: title,
        description: description,
        sections: [],
        imageUrl: imageUrl,
      }),
    );
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
        <form onSubmit={handleSubmit}>
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
