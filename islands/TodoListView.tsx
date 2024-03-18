import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import type { TodoList, TodoListItem } from "../shared/api.ts";
import axios from "axios-web";
import { createContext } from "preact";

interface LocalMutation {
  text: string | null;
  imgUrl: string;
}

type Image = {
  fileUrl: string;
};

const ImageContext = createContext("https://consciousrobot-956159009.imgix.net/logo.png");

export default function TodoListView(
  props: { initialData: TodoList; latency: number },
) {
  const [data, setData] = useState(props.initialData);

  const [dirty, setDirty] = useState(false);
  const localMutations = useRef(new Map<string, LocalMutation>());
  const [hasLocalMutations, setHasLocalMutations] = useState(false);
  const busy = hasLocalMutations || dirty;
  const [adding, setAdding] = useState(false);

  const [myImgUrl, setMyImgUrl] = useState("https://consciousrobot-956159009.imgix.net/logo.png");

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
      imgUrl: myImgUrl,
    });
    setHasLocalMutations(true);
    setAdding(true);
  }, []);

  const saveTodo = useCallback(
    (item: TodoListItem, text: string | null, imgUrl: string) => {
      localMutations.current.set(item.id!, {
        text,
        imgUrl,
      });
      setHasLocalMutations(true);
    },
    [],
  );

  return (
    <ImageContext.Provider value={myImgUrl}>
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
                imgUrl={myImgUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </ImageContext.Provider>
  );
}

function TodoItem(
  { item, save }: {
    item: TodoListItem;
    imgUrl: string;
    save: (item: TodoListItem, text: string | null, imgUrl: string) => void;
  },
) {

  const input = useRef<HTMLInputElement>(null);
  const imageLayout = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const [files, setFiles] = useState("");

  const onFileSelect: Event = (event) => {
    console.log(event.target.files)
    console.log("files", files)
    setFiles(event.target.files);
  };

  const doSave = useCallback(() => {
    console.log("\n\n*******  saving  *******\n\n");
    if (!input.current || !fileInput.current || !fileInput.current.files ){
      console.log('missing data')
      return;
    }
    setBusy(true);

    const newImgUrl = URL.createObjectURL(fileInput.current.files[0]);
    console.log("newImgUrl", newImgUrl)
    console.log("\n\n*******  SAVING  *******\n\n");

    save(item, input.current.value, newImgUrl);
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
    save(item, null, "");
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
                ref={fileInput}
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
          <ImageLayout files={files}/>
        </div>
      </div>
  );
}

function generateItemId(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}

const renderImages = (fileUrls) => {
  return (
    <div>
      {fileUrls && fileUrls.map((fileUrl) => (
        <div key={fileUrl.fileUrl}>
          <img src={fileUrl.fileUrl} />
        </div>
      ))}
    </div>
  );
};

function ImageLayout({ files }) {
  const [images, setImages] = useState();

  useEffect(() => {
    console.log(`images changed:`);
    console.dir(images);
  }, [images]);

  useEffect(() => {
    console.log(`From ImageLayout.tsx. files: ${files}`);

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
