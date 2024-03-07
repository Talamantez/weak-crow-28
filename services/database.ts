import { TodoList, TodoListItem } from "../shared/api.ts";
import { z } from "zod";

export const db = await Deno.openKv();
export const inputSchema = z.array(z.object({
  id: z.string(),
  text: z.string().nullable(),
  imgUrl: z.string().nullable(),
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
  const token = 'ya29.a0AfB_byDbqbnDs_KV6VYt5YmM7bvgrR1V3oyXrYFMQmzzymQGe3P48q8T91xy6099uFPFpM3zJ3ThOqBwlQFIiLdi48xPw9ACsx-AGmrs5S0IQf1wV83LlJw5FnMJ28grZudL7rMaaPbqP7UHvqBdFC-7ZRmrKHdSm9tbaCgYKAZQSARISFQHGX2MiBrb-VBRsSIAZY3IvH3eXTg0171';
  const bucket = 'nami-resource-roadmap';
  
  const file = await Deno.readFile('static\\screenshot.png');
  
  const res = await fetch(`https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=screenshot.png`, {
      headers: {
          'Content-Type': 'image/png',
          Authorization: `Bearer ${token}`
      },
      method: 'POST',
      body: file
  })
  
  const data = await res.json();
  console.log(data);  
}
