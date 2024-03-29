import { useEffect, useState } from "preact/hooks";

export interface SectionData {
  title: string;
  description: string;
  subSections: [];
}

export default function Sections() {
  const [sections, setSections] = useState<SectionData[]>([{
    title: "",
    description: "",
    subSections: [],
  }]);

  useEffect(() => {
    let tempSections = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes("Fresh Section Manager")) {
        const stored = JSON.parse(localStorage.getItem(key)!);
        tempSections.push(stored);
      }
    }
    setSections(tempSections);
  }, []);

  return (
    <>
      <div class="grid grid-cols-1 gap-y-5 md:(grid-cols-2 gap-x-20 gap-y-10) w-full">
        {sections.length > 0 && sections[0].description.length > 0 &&
          (
            <>
              {sections!.map((section) => (
                <a
                  key={section.description}
                  href={`/${section.description}`}
                  class="border rounded-md border-gray-300 hover:border-gray-400 py-3 px-5 transition cursor-pointer flex items-center justify-start"
                >
                  <div class="w-3/5">
                    <h1 class="font-bold">{section.description}</h1>
                    <h2 class="text-gray-500">{section.description}</h2>
                  </div>
                  <div class="flex items-center justify-end w-2/5">
                    <a
                      href={`/${section.description}`}
                      class="bg-blue-500 hover:bg-blue-600 rounded-md py-1 px-2 text-gray-100 transition-colors"
                    >
                      View
                    </a>
                  </div>
                </a>
              ))}
            </>
          )}
      </div>
      {!sections[0].description.length && (
        <div class="flex w-full m-0">
          <h1 class="my-6 w-full text-left m-0">No chapters yet</h1>
        </div>
      )}
    </>
  );
}
