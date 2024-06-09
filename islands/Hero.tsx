import IconDownload from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/download.tsx";
import IconWand from "https://deno.land/x/tabler_icons_tsx@0.0.3/tsx/wand.tsx";

import { printAllChapters } from "./printAllChapters.tsx";
import { generateChaptersFromJSON } from "../services/generateChaptersFromJSON.ts";
import Button from "../components/Button.tsx";

export default function Hero() {

  const handlePrint = () => {
    printAllChapters();
  }

  return (
    <div
      class="w-full flex px-8 py-10 min-h-[24em] justify-center items-center flex-col gap-8 bg-cover bg-center bg-no-repeat bg-gray-100 rounded-xl text-white"
      style="background-image:linear-gradient(rgba(0, 0, 40, 0.8),rgba(0, 0, 40, 0.8));"
    >
      <div class="flex flex-col gap-4 max-w-md text-white space-y-4 text-center">
        <h1 class="text-4xl inline-block font-bold">Resource Roadmap</h1>
        <p class="text-xl max-w-lg">
         Welcome to Your Local Resource Publication Creator!
        </p>
        <Button text="Generate Example Chapters"
          onClick={() => {
            generateChaptersFromJSON("MyDatabase", "Chapters");
          }}
          styles="flex items-center justify-center gap-2 bg-white rounded-md py-1 px-10 text-blue-800 transition-colors focus:outline-none outline-none mt-5"
          icon={IconWand}
        />
        <Button text="Print Your Roadmap"
          onClick={
            () => {
            handlePrint();
            }}
          styles="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
          icon={IconDownload}
        />
      </div>
    </div>
  );
}