import { Head } from "$fresh/runtime.ts";
import AddProject from "../islands/AddProject.tsx";
import { safeLocalStorageSetItem } from "../islands/SafeLocalStorage.ts";

export default function NewChapter() {
  const fetchChapters = async () => {
    alert("Fetching chapters");
    try {
      const response = await fetch("/static/chapters.json");
      const chapters = await response.json();
      Object.entries(chapters).forEach(([title, description]) => {
        safeLocalStorageSetItem(
          "Chapter Manager: " + title,
          JSON.stringify({
            title: title,
            description: description,
            sections: [],
          }),
        );
      });
    } catch (error) {
      console.error("Error fetching chapters:", error);
    }
    fetchChapters();

    return (
      <>
        <Head>
          <title>Resource Roadmap | Add Chapter</title>
        </Head>
        <main class="flex flex-col items-center justify-center mx-auto max-w-screen-lg h-screen">
          <h1 class="text-2xl">Add Chapter</h1>
          <AddProject />
        </main>
      </>
    );
  };
}
