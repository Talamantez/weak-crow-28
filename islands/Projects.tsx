import { useEffect, useState } from "preact/hooks";
import { Section } from "../util/SectionData.ts";
import { safeSessionStorageGetItem } from "../util/safeSessionStorageGetItem.ts";
import { safeSessionStorageSetItem } from "../util/safeSessionStorageSetItem.ts";

interface ProjectData {
  index: number;
  title: string;
  description: string;
  sections: Section[];
  imageUrl?: string;
}

async function printAllChapters(): Promise<void> {
  // Retrieve all chapters from session storage
  const chapters = [];
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith("Chapter Manager:")) {
      const stored = await safeSessionStorageGetItem(key);
      if (stored) {
        chapters.push(JSON.parse(stored));
      }
    }
  }

  fetch("/api/printAllChapters", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(chapters),
  })
    .then((response) => {
      if (response.ok) {
        return response.blob();
      } else {
        throw new Error("Request failed.");
      }
    })
    .then((blob) => {
      // Create a temporary URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a temporary link element and trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.download = "output.pdf";
      link.click();

      // Clean up the temporary URL
      URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

const clearAllChapters = () => {
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key?.includes("Chapter Manager")) {
      sessionStorage.removeItem(key);
    }
  }
  window.location.reload();
};

const generateIntroduction = async () => {
  const introduction = await fetch("./static/introduction.json").then((res) =>
    res.json()
  );
  const { title, description, imageUrl, sections } = introduction;
  await safeSessionStorageSetItem(
    `Chapter Manager: ${title}`,
    JSON.stringify({
      index: 0,
      title: title,
      description: description,
      sections: sections,
      imageUrl: imageUrl,
    }),
  );
  window.location.reload();
};

const generateChaptersFromJSON = async () => {
  const chapters = await fetch("./static/chapters.json").then((res) =>
    res.json()
  );

  await Object.entries(chapters).forEach(([index]) => {
    const { title, description, imageUrl, sections } = chapters[index];
    safeSessionStorageSetItem(
      `Chapter Manager: ${title}`,
      JSON.stringify({
        index: index,
        title: title,
        description: description,
        sections: sections,
        imageUrl: imageUrl,
      }),
    );
  });
  window.location.reload();
};

export default function Projects() {
  const [projects, setProjects] = useState<ProjectData[]>([{
    index: 0,
    title: "",
    description: "",
    sections: [],
    imageUrl: "",
  }]);

  useEffect(() => {
    const tempProjects = [];
    let sortedTempProjects = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key?.includes("Chapter")) {
        const stored = JSON.parse(sessionStorage.getItem(key)!);
        tempProjects.push(stored);
      }
    }
    sortedTempProjects = tempProjects.sort((a, b) => a.index - b.index);
    setProjects(sortedTempProjects);
  }, []);

  return (
    <>
      <div class="flex">
        <button
          onClick={() => printAllChapters()}
          class="bg-green-500 hover:bg-green-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
        >
          Print All Chapters
        </button>
        <button
          onClick={generateIntroduction}
          class="bg-green-500 hover:bg-green-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
        >
          Generate Introduction
        </button>
        <button
          onClick={generateChaptersFromJSON}
          class="bg-green-500 hover:bg-green-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
        >
          Generate Chapters
        </button>
        <button
          onClick={clearAllChapters}
          class="bg-green-500 hover:bg-green-600 rounded-md py-1 px-10 text-gray-100 transition-colors focus:outline-none outline-none mt-5"
        >
          Clear All Chapters
        </button>
      </div>
      <div class="grid grid-cols-1 gap-y-5 md:(grid-cols-2 gap-x-20 gap-y-10) w-full">
        {projects.length > 0 && projects[0].title.length > 0 &&
          (
            <>
              {projects!.map((project) => (
                <a
                  key={project.title}
                  href={`/${project.title}`}
                  class="border rounded-md border-gray-300 hover:border-gray-400 py-3 px-5 transition cursor-pointer flex items-center justify-start bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div class="w-3/5">
                    {project.imageUrl && (
                      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
                        <img
                          src={project.imageUrl}
                          alt="chapter cover image"
                          class="w-full h-48 object-cover"
                        />
                      </div>
                    )}

                    <h1 class="font-bold">{project.title}</h1>
                    <p class="text-gray-500">{project.description}</p>
                    <p class="text-gray-500 mt-2">
                      <span>
                        {(project.sections && project.sections.length)
                          ? <>{project.sections.length} Sections</>
                          : <>0 Sections</>}
                      </span>
                    </p>
                  </div>
                  <div class="flex items-center justify-end w-2/5">
                    <a
                      href={`/${project.title}`}
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
      {(!projects[0] || !projects[0].title || !projects[0].title.length) && (
        <div class="flex w-full m-0">
          <h1 class="my-6 w-full text-left m-0">No chapters yet</h1>
        </div>
      )}
    </>
  );
}
