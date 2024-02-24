import { useEffect, useState } from "preact/hooks";
import { renderImages } from "./renderImages.tsx";

export type Image = {
  fileUrl: string;
};

export default function ImageLayout({ files }) {
  const [images, setImages] = useState();

  useEffect(async () => {
    console.log(files);

    const images: Image[] = [];
    for (const file of files) {
      const fileUrl = URL.createObjectURL(file);
      images.push({ fileUrl });
    }
    setImages(images);
  }, [files]);

  return (
    <>
      {renderImages(images)}
    </>
  );
}

