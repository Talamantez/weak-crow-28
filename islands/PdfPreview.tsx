interface Chapter {
  index: number;
  title: string;
  imageUrl?: string;
  description: string;
}

export function PdfPreview({ chapters }: { chapters: Chapter[] }) {
  return (
    <div
      className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-h-screen overflow-y-auto"
      style={{
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        background:
          "linear-gradient(to right, #f9f9f9 0%, #ffffff 5%, #ffffff 95%, #f9f9f9 100%)",
      }}
    >
      {[...chapters]
        .sort((a, b) => a.index - b.index)
        .map((chapter) => (
          <div key={chapter.index + 'preview'} className="mb-6">
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
