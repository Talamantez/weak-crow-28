import { useState } from "preact/hooks";

export default function AddSection() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const addSection = () => {
    localStorage.setItem(
      "Fresh Section Manager: " + title,
      JSON.stringify({ title: title, description: description, tasks: [""] }),
    );
    window.location.href = "/";
  };

  return (
    <>
      <textarea
        type="text"
        placeholder="Section Title"
        onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
        class="w-4/5 border-2 rounded-md mt-2 px-2 py-1 text-center border-blue-500 focus:border-blue-600 outline-none"
      />

      <div class="w-4/5 flex items-center justify-between">
        <a
          href="/"
          class="bg-red-500 hover:bg-red-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
        >
          Cancel
        </a>
        <button
          onClick={() => addSection()}
          class="bg-blue-500 hover:bg-blue-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
        >
          Add
        </button>
      </div>
    </>
  );
}
