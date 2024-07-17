import { useEffect, useState } from "preact/hooks";

interface PdfPreviewProps {
  chapters: Chapter[];
}

export const PdfPreview = ({ chapters }: PdfPreviewProps) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const generatePdfPreview = async () => {
      try {
        const response = await fetch("/api/generate-pdf-preview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(chapters),
        });

        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        } else {
          console.error("Failed to generate PDF preview");
        }
      } catch (error) {
        console.error("Error generating PDF preview:", error);
      }
    };

    generatePdfPreview();

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [chapters]);

  if (!pdfUrl) {
    return <div>Loading PDF preview...</div>;
  }

  return (
    <div className="pdf-preview h-screen overflow-y-auto border-l border-gray-200">
      <iframe src={pdfUrl} className="w-full h-full" />
    </div>
  );
};