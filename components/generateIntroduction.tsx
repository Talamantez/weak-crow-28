import { safeSessionStorageSetItem } from "../util/safeSessionStorageSetItem.ts";

const generateIntroduction = async () => {
  const introduction = await fetch("./static/introduction.json").then((res) => res.json()
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
    })
  );
  window.location.reload();
};
