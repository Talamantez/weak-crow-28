import { useCallback, useRef, useState } from "preact/hooks";
import type { TodoListItem } from "../shared/api.ts";
import FileDrop from "./File.tsx";

export function TodoItem(
  { item, save }: {
    item: TodoListItem;
    save: (item: TodoListItem, text: string | null, completed: boolean) => void;
  }
) {
  const input = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const doSave = useCallback(() => {
    if (!input.current) return;
    setBusy(true);
    save(item, input.current.value, item.completed);
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
    save(item, null, item.completed);
  }, [item]);

  const doSaveCompleted = useCallback((completed: boolean) => {
    setBusy(true);
    save(item, item.text, completed);
  }, [item]);

  return (
    <div 
      class="flex my-2 border-b border-gray-300 items-center h-16"
      {...{ "data-item-id": item.id! }}
    >
      {editing && (
        <>
          <input 
            class="border rounded w-full py-2 px-3 mr-4"
            ref={input}
            defaultValue={item.text} />
          <button 
            class="p-2 rounded mr-2 disabled:opacity-50"
            title="Save"
            onClick={doSave}
            disabled={busy}
          >
            💾
          </button>
          <FileDrop class="border-solid"/>

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
          <input 
            type="checkbox"
            checked={item.completed}
            disabled={busy}
            onChange={(e) => doSaveCompleted(e.currentTarget.checked)}
            class="mr-2" />
          <div class="flex flex-col w-full font-mono">
            <p>
              {item.text}
            </p>
            <p class="text-xs opacity-50 leading-loose">
              {new Date(item.createdAt).toISOString()}
            </p>
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
  );
}