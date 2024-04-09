import { Head } from "$fresh/runtime.ts";
import Projects from "../islands/Projects.tsx";
import Hero from "../components/Hero.tsx";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";
import { safeLocalStorageSetItem } from "../islands/SafeLocalStorage.ts";
import { Button } from "../components/Button.tsx";

export default function Home() {
    const fetchChapters = async () => {
      alert("Fetching chapters");
      try {
        const response = await fetch("/static/chapters.json");
        const chapters = await response.json();
        // safeLocalStorageSetItem("chapters", JSON.stringify(chapters));
        Object.entries(chapters).forEach(([title, description]) => {
          safeLocalStorageSetItem(
            "Chapter Manager: " + title,
            JSON.stringify({ title: title, description: description, sections: [] }),
          );
        });
      } catch (error) {
        console.error("Error fetching chapters:", error);
      }
    };


  return (
    <>
      <Head>
        <title>Resource Roadmap Editor</title>
      </Head>
      <main class="flex flex-col items-center justify-start my-10 p-4 mx-auto max-w-screen-lg">
      <Header active="Home" />
        <Hero />
        <div class="w-full flex justify-between mb-10 mt-10">
          <h1 class="font-bold text-2xl w-3/5 text-left">Chapters</h1>
          <a
            href="/new-project"
            class="bg-blue-500 hover:bg-blue-600 rounded-md py-1 px-2 text-gray-100 transition-colors w-2/5 md:w-1/5 flex items-center justify-center"
          >
            + Add Chapter
          </a>
          <Button onClick={()=>console.log('clicked')}>Generate Data</Button>
        </div>
        <Projects />
        <Footer />
      </main>
    </>
  );
}
