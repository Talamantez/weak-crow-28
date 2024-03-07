import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import type { TodoList, TodoListItem } from "../shared/api.ts";
import axios from "axios-web";
import ImageLayout from "../components/ImageLayout.tsx";
import { CHAR_0 } from "https://deno.land/std@0.140.0/path/_constants.ts";

interface LocalMutation {
  text: string | null;
  imgUrl: string | null;
}

export default function TodoListView(
  props: { initialData: TodoList; latency: number },
) {
  const [data, setData] = useState(props.initialData);
  const [dirty, setDirty] = useState(false);
  const localMutations = useRef(new Map<string, LocalMutation>());
  const [hasLocalMutations, setHasLocalMutations] = useState(false);
  const busy = hasLocalMutations || dirty;
  const [adding, setAdding] = useState(false);
  useEffect(() => {
    let es = new EventSource(window.location.href);

    es.addEventListener("message", (e) => {
      const newData: TodoList = JSON.parse(e.data);
      setData(newData);
      setDirty(false);
      setAdding(false);
    });

    es.addEventListener("error", async () => {
      es.close();
      const backoff = 10000 + Math.random() * 5000;
      await new Promise((resolve) => setTimeout(resolve, backoff));
      es = new EventSource(window.location.href);
    });
  }, []);

  useEffect(() => {
    (async () => {
      while (1) {
        const mutations = Array.from(localMutations.current);
        localMutations.current = new Map();
        setHasLocalMutations(false);

        if (mutations.length) {
          setDirty(true);
          const chunkSize = 10;
          for (let i = 0; i < mutations.length; i += chunkSize) {
            const chunk = mutations.slice(i, i + chunkSize).map((
              [id, mut],
            ) => ({
              id,
              text: mut.text,
              imgUrl: mut.imgUrl,
            }));
            while (true) {
              try {
                await axios.post(window.location.href, chunk);
                break;
              } catch {
                await new Promise((resolve) => setTimeout(resolve, 1000));
              }
            }
          }
        }

        await new Promise((resolve) =>
          setTimeout(
            () => requestAnimationFrame(resolve), // pause when the page is hidden
            1000,
          )
        );
      }
    })();
  }, []);

  const addTodoInput = useRef<HTMLInputElement>(null);
  const addTodo = useCallback(() => {
    const value = addTodoInput.current!.value;
    if (!value) return;
    addTodoInput.current!.value = "";

    const id = generateItemId();
    localMutations.current.set(id, {
      text: value,
      imgUrl: value,
    });
    setHasLocalMutations(true);
    setAdding(true);
  }, []);

  const saveTodo = useCallback(
    (item: TodoListItem, text: string | null, imgUrl: string | null) => {
      localMutations.current.set(item.id!, {
        text,
        imgUrl,
      });
      setHasLocalMutations(true);
    },
    [],
  );

  return (
    <div class="flex gap-2 w-full items-center justify-center py-4 xl:py-16 px-2">
      <div class="rounded w-full xl:max-w-xl">
        <div class="flex flex-col gap-4 pb-4">
          <div class="flex flex-row gap-2 items-center">
            <h1 class="font-bold text-xl">Local Resource List</h1>
            <div
              class={`inline-block h-2 w-2 ${
                busy ? "bg-yellow-600" : "bg-green-600"
              }`}
              style={{ borderRadius: "50%" }}
            >
            </div>
          </div>
          <div class="flex">
            <p class="opacity-50 text-sm">
              Local Resources
            </p>
          </div>
          <div class="flex">
            <input
              class="border rounded w-full py-2 px-3 mr-4"
              placeholder="Name your resource here"
              ref={addTodoInput}
            />
            <button
              class="p-2 bg-blue-600 text-white rounded disabled:opacity-50"
              onClick={addTodo}
              disabled={adding}
            >
              Add
            </button>
          </div>
        </div>
        <div>
          {data.items.map((item) => (
            <TodoItem
              key={item.id! + ":" + item.versionstamp!}
              item={item}
              save={saveTodo}
            />
          ))}
        </div>
        <div class="pt-6 opacity-50 text-sm">
          <p>
            Initial data fetched in {props.latency}ms
          </p>
          <p>
            <a
              href="https://github.com/denoland/showcase_todo"
              class="underline"
            >
              Source code
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function TodoItem(
  { item, save }: {
    item: TodoListItem;
    save: (item: TodoListItem, text: string | null, imgUrl: string | null) => void;
  },
) {

  let [files, setFiles] = useState("");
  const onFileSelect: Event = (event) => {
    setFiles(event.target.files);
  };

  const input = useRef<HTMLInputElement>(null);
  const imageLayout = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const doSave = useCallback(() => {
    if (!input.current) return;
    if (!imageLayout.current) return;
    console.log(`input.current:`)
    console.dir(input.current);
    console.log(`files:`)
    console.dir(files);
    console.log(`imageLayout.current.files[0]:`)

    imageLayout.current.files && console.dir(imageLayout.current.files[0]);

    setBusy(true);
    save(item, input.current.value, imageLayout.current.value);
  }, [item]);
  const cancelEdit = useCallback(() => {
    if (!input.current) return;
    setEditing(false);
    input.current.value = item.text;
  }, []);
  const doDelete = useCallback(() => {
    const yes = confirm("Are you sure you want to delete this item?");
    if (!yes) return;
    setBusy(true);
    save(item, null, null);
  }, [item]);

  return (
    <div>
      <div
        class="flex my-2 items-center"
        {...{ "data-item-id": item.id! }}
      >
        {editing && (
          <>
            <input
              class="border rounded w-full py-2 px-3 mr-4"
              ref={input}
              defaultValue={item.text}
            />
            <input
              id="file-picker"
              class="file-picker__input p-2 bg-blue-600 text-white rounded disabled:opacity-50"
              type="file"
              accept="image/*"
              multiple
              onChange={onFileSelect}
              ref={imageLayout}
            />
            <label for="file-picker" class="file-picker__label">
              <svg viewBox="0 0 24 24" class="file-picker__icon">
                <path d="M19 7v3h-2V7h-3V5h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5a2 2 0 00-2 2v12c0 1.1.9 2 2 2h12a2 2 0 002-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z" />
              </svg>
            </label>
            <button
              class="p-2 rounded mr-2 disabled:opacity-50"
              title="Save"
              onClick={doSave}
              disabled={busy}
            >
              💾
            </button>
            <button
              class="p-2 rounded disabled:opacity-50"
              title="Cancel"
              onClick={cancelEdit}
              disabled={busy}
            >
              🚫
            </button>
          </>
        )}
        {!editing && (
          <>
            <div class="flex flex-col w-full font-mono">
              <div>
                <p>
                  {item.text}
                </p>
              </div>
            </div>
            <button
              class="p-2 mr-2 disabled:opacity-50"
              title="Edit"
              onClick={() => setEditing(true)}
              disabled={busy}
            >
              ✏️
            </button>
            <button
              class="p-2 disabled:opacity-50"
              title="Delete"
              onClick={doDelete}
              disabled={busy}
            >
              🗑️
            </button>
          </>
        )}
      </div>

      <div>
        <ImageLayout files={files} ref={imageLayout}>
        </ImageLayout>
      </div>
    </div>
  );
}

function generateItemId(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}
