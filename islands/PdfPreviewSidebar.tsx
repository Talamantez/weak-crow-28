// PdfPreviewSidebar.tsx
import { PdfPreview } from "../components/PdfPreview.tsx";

export const PdfPreviewSidebar = ({ chapters }) => (
  <div class='w-full lg:w-1/3 sticky top-0 mt-10 lg:mt-0'>
    <h2 class='font-bold text-2xl mb-4'>PDF Preview</h2>
    <PdfPreview chapters={chapters.filter((ch) => ch.isIncluded)} />
  </div>
);