import { TodoList, TodoListItem } from "../shared/api.ts";
import { z } from "zod";

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
  console.log(`imgUrl: ${imgUrl}`);
  const token = 'ya29.a0Ad52N39hFcjLJINGlyyL5K_IVAyfHfPxx3YDiJeDMyORX_BswHYLXRK49EEAFxptd84O8c20FY0JHu14SzLH3FYCHvtwRbWfh_WyR1g_J3gRpYP_evv4_jljVFlCEcGIlcoJ9zIHj-n1-qLwDrqaNHkLRx0wU4S8D15GaCgYKAYQSARISFQHGX2MiVlqyu36BbZd3saYN1L8hdw0171';
  const bucket = 'nami-resource-roadmap';
  
  const file = await Deno.readFile(imgUrl);
  
  const res = await fetch(`https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=media&name=screenshot.png`, {
      headers: {
          'Content-Type': 'image/png',
          Authorization: `Bearer ${token}`
      },
      method: 'POST',
      body: file
  })
  
  const data = await res.json();
  return data;
}
