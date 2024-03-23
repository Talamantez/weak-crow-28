import { TodoList, TodoListItem } from "../shared/api.ts";
import { z } from "zod";
import { load } from "https://deno.land/std@0.219.0/dotenv/mod.ts";
import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib@^1.11.1?dts";

export const db = await Deno.openKv();
export const inputSchema = z.array(z.object({
  id: z.string(),
  text: z.string().nullable(),
  imgUrl: z.string(),
}));
export type InputSchema = z.infer<typeof inputSchema>;

export async function loadList(
  id: string,
  consistency: "strong" | "eventual",
): Promise<TodoList> {
  const out: TodoList = {
    items: [],
  };

  const it = db.list({ prefix: ["list", id] }, {
    reverse: true,
    consistency,
  });
  for await (const entry of it) {
    const item = entry.value as TodoListItem;
    item.id = entry.key[entry.key.length - 1] as string;
    item.versionstamp = entry.versionstamp!;
    out.items.push(item);
  }
  return out;
}

export async function writeItems(
  listId: string,
  inputs: InputSchema,
): Promise<void> {
  const currentEntries = await db.getMany(
    inputs.map((input) => ["list", listId, input.id]),
  );

  const op = db.atomic();

  inputs.forEach((input, i) => {
    if (input.text === null) {
      op.delete(["list", listId, input.id]);
    } else {
      const current = currentEntries[i].value as TodoListItem | null;
      const now = Date.now();
      const createdAt = current?.createdAt ?? now;

      const item: TodoListItem = {
        text: input.text,
        imgUrl: input.imgUrl,
        createdAt,
        updatedAt: now,
      };
      op.set(["list", listId, input.id], item);
    }
  });
  op.set(["list_updated", listId], true);
  await op.commit();
}

export async function postImage(imgUrl: string) {
  try {
    const env = await load();
    const token = env["TOKEN"];
    const bucket = "nami-resource-roadmap";

    // fetch the file first, we are getting a cors error

    // const file = await fetch(imgUrl)
    //   .then((res) => {
    //     if (res.ok) {
    //       return res;
    //     } else{
    //       throw new Error("Error fetching image");
    //     }
    //   });

    const file = await Deno.readFile(imgUrl);
    console.log('/nnnnnnnnnnnnn************************ File: ')
    console.dir(file)


    const name = "testFile.png";
    const res = await fetch(
      `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=${name}`,
      {
        headers: {
          "Content-Type": "image/png",
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
        body: file,
      },
    );
    const data = await res.json();

    // Serialize the PDFDocument to a Uint8Array and write it to apage.drawImage()

    // Done! 💥
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
}
export async function storeTempImage(file: File){
  const myTempDir = await makeTempDir();
  const myUint8Array = new Uint8Array(await file.arrayBuffer());

  // In a browser environment, you can use the File System Access API
  // to write the file to a temporary directory
  const root = await navigator.storage.getDirectory();
  const tempDir = await root.getDirectoryHandle(myTempDir, { create: true });
  const fileHandle = await tempDir.getFileHandle(file.name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(myUint8Array);
  await writable.close();

  return `${myTempDir}/${file.name}`;
}
async function makeTempDir(): Promise<string> {
  const tempDir = await Deno.makeTempDir();
  return tempDir;
}
export async function embedImage() {
  // const jpgUrl = 'https://pdf-lib.js.org/assets/cat_riding_unicorn.jpg'
  const pngUrl = "https://consciousrobot-956159009.imgix.net/logo.png";

  const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer());

  const pdfDoc = await PDFDocument.create();

  const pngImage = await pdfDoc.embedPng(pngImageBytes);

  const pngDims = pngImage.scale(0.5);

  const page = pdfDoc.addPage();

  page.drawImage(pngImage, {
    x: page.getWidth() / 2 - pngDims.width / 2 + 75,
    y: page.getHeight() / 2 - pngDims.height + 250,
    width: pngDims.width,
    height: pngDims.height,
  });

  const pdfBytes = await pdfDoc.save();
  await Deno.writeFile("image.pdf", pdfBytes);
  console.log("PDF file written to create.pdf");
}
