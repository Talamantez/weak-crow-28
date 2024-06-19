import { Head } from "$fresh/runtime.ts";
import Hero from "./Hero.tsx";
import Footer from "../components/Footer.tsx";
import Chapters from "./Chapters.tsx";
import Button from "../components/Button.tsx";
import IconPlus from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/plus.tsx";
import IconX from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/x.tsx";
import { dbName, storeName } from "../util/dbInfo.ts";

const clearAllChapters = () => {

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);

    request.onerror = function (event: Event) {
      console.error("Error opening database:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = function (event: Event) {
      const db = event.target.result;
      const transaction = db.transaction(storeName, "readwrite");
      const objectStore = transaction.objectStore(storeName);

      // Clear all chapters from the object store
      const clearRequest = objectStore.clear();

      clearRequest.onsuccess = function () {
        console.log("All chapters cleared from IndexedDB");
        db.close();
        resolve();
      };

      clearRequest.onerror = function (event: Event) {
        console.error("Error clearing chapters from IndexedDB:", event.target.error);
        db.close();
        reject(event.target.error);
      };
    };
  })
    .then(() => {
      window.location.reload();
    })
    .catch((error) => {
      console.error("Error clearing chapters:", error);
    });
};

export default function HomeContent() {
  return (
    <div>
      <Head>
        <title>Resource Roadmap Editor</title>
      </Head>
      <main class="flex flex-col items-center justify-start my-10 p-4 mx-auto max-w-screen-lg">
        <Hero />

        <div class="w-full flex-col justify-between mb-10 mt-10">
          <h1 class="font-bold text-2xl w-3/5 text-left">Chapters</h1>
          <div class="flex flex-col sm:flex-row justify-between w-full">
            <Button
              text="Add&nbsp;New&nbsp;Chapter"
              onClick={() => {
                window.location.href = "/new-chapter";
              }}
              styles="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
              icon={IconPlus}
            />
            <Button
              text="Delete&nbsp;All&nbsp;Chapters"
              onClick={() => {
                clearAllChapters();
              }}
              styles="flex items-center justify-center gap-2  bg-red-500 text-white rounded-md py-1 px-10 text-blue-900 transition-colors focus:outline-none outline-none mt-5"
              icon={IconX}
            />
          </div>
        </div>
        <Chapters />
        <Footer />
      </main>
    </div>
  );
}
