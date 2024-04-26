import { useEffect, useState } from "preact/hooks";
import { Section } from "../util/SectionData.ts";
import { safeSessionStorageSetItem } from "./SafeSessionStorage.ts";
import chapters from "../static/chapters.json" with { type: "json" };
import introduction from "../static/introduction.json" with { type: "json" };
import { Button } from "../components/Button.tsx";

interface ProjectData {
  index: number;
  title: string;
  description: string;
  sections: Section[];
  imageUrl?: string;
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

const generateIntroduction = () => {
  const { title, description, imageUrl, sections } = introduction as {
    title: string;
    description: string;
    imageUrl: string;
    sections: ({
      title: string;
      description: string;
      subSections: string[];
      chapterTitle: string;
    } | {
      title: string;
      description: string;
      subSections: string;
      chapterTitle: string;
    })[];
  };

  safeSessionStorageSetItem(
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
}

const generateChaptersFromJSON = () => {
  Object.entries(chapters).forEach(([index, content]) => {

    const { title, description, imageUrl, sections } = content as {
      title: string;
      description: string;
      imageUrl: string;
      sections: ({
        title: string;
        description: string;
        subSections: string[];
        chapterTitle: string;
      } | {
        title: string;
        description: string;
        subSections: string;
        chapterTitle: string;
      })[];
    };
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
        <Button onClick={generateIntroduction}>Generate Introduction</Button>
        <Button onClick={generateChaptersFromJSON}>Generate Chapters</Button>
        <Button onClick={clearAllChapters}>Clear All Chapters</Button>
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
