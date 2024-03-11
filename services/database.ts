import { TodoList, TodoListItem } from "../shared/api.ts";
import { z } from "zod";
import { load } from "https://deno.land/std@0.219.0/dotenv/mod.ts";
import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib@^1.11.1?dts";
import { degrees } from "https://cdn.skypack.dev/pdf-lib@^1.11.1?dts";

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
  const env = await load();
  const token = env["TOKEN"];
  const bucket = "nami-resource-roadmap";

  const file = await Deno.readFile(imgUrl);

  const res = await fetch(
    `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=screenshot.png`,
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

  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();
  console.log(`
    
    
    
    `);
  // Add a page to the PDFDocument and draw some text
  const page = pdfDoc.addPage();
  console.log("Hello");

  async function image() {
  console.log("Hello");

    // const imageBytes = await fetch(
    //   "static\\Bernadine-1_Bush-Medicine-Leaves.jpg"
    // ).then((res) => res.arrayBuffer());
    console.log('imageBytes');
    // console.log(imageBytes);
    // const jpgImage = await pdfDoc.embedJpg(imageBytes);
    // console.log(jpgImage);
    // page.drawImage(jpgImage, {
    //   x: 100,
    //   y: 100,
    //   width: jpgImage.width,
    //   height: jpgImage.height,
    // });
    // Save the PDFDocument and write it to a file
    const pdfBytes = await pdfDoc.save();
    await Deno.writeFile("create.pdf", pdfBytes);
    console.log("PDF file written to create.pdf");

  }
  await image();
  // Serialize the PDFDocument to a Uint8Array and write it to apage.drawImage()

  // Done! 💥
  return data;
}
