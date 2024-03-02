import { TodoList, TodoListItem } from "../shared/api.ts";
import { z } from "zod";

export const db = await Deno.openKv();
export const inputSchema = z.array(z.object({
  id: z.string(),
  text: z.string().nullable(),
  completed: z.boolean(),
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
        completed: input.completed,
        createdAt,
        updatedAt: now,
      };
      op.set(["list", listId, input.id], item);
    }
  });
  op.set(["list_updated", listId], true);
  await op.commit();
}

export async function postImage() {
  const token = 'ya29.a0AfB_byDVV_sHcYV3qMV_fOnEHnqATQPkKjfBR94ylGzXdMkIq6LYG7vqw-1f_kumG0quJEvT7QuTzruzXIprOj9SrZqA4jyMXh-oQVsQGPveu9vQq1fl8s7iUiLG7CXx9jRjkX7Zv5RdhY5uLIEnWeTDeXtiPQn-p2guaCgYKAbkSARISFQHGX2MiGml5pIQbqU3gv8NIgdvpiA0171';
  const bucket = 'nami-resource-roadmap';
  
  const file = await Deno.readFile('sample.txt');
  
  const res = await fetch(`https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=sample.txt`, {
      headers: {
          'Content-Type': 'text/plain',
          Authorization: `Bearer ${token}`
      },
      method: 'POST',
      body: file
  })
  
  const data = await res.json();
  console.log(data);  
}
