import { Chapter } from "./types.ts";

export function PdfPreview({ chapters }: { chapters: Chapter[] }) {
  console.log("previewing chapters")
  console.log(chapters)
  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-h-screen overflow-y-auto">
      {chapters.map((chapter) => (
        <div key={chapter.index} className="mb-6">
          <h3 className="text-xl font-semibold mb-2">{chapter.title}</h3>
          {chapter.imageUrl && (
            <img
              src={chapter.imageUrl}
              alt={chapter.title}
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
          )}
          <p className="text-sm mb-2">{chapter.description}</p>
        </div>
      ))}
    </div>
  );
}