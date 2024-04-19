import { useState } from "preact/hooks";

export default function AddProject() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const addProject = () => {
    if (title === "" || description === "") {
      alert("Please fill in all fields.");
      return;
    }
    localStorage.setItem(
      "Chapter Manager: " + title,
      JSON.stringify({ index: localStorage.length, title: title, description: description, sections: [] }),
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
