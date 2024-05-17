import { safeSessionStorageSetItem } from "../util/safeSessionStorageSetItem.ts";

export const generateChaptersFromJSON = async () => {
  const chapters = await fetch("./static/chapters.json").then((res) => res.json()
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
      })
    );
  });
  window.location.reload();
};
