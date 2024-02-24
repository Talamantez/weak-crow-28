import { useRef, useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import type { FileDropEvent } from "https://esm.sh/file-drop-element@1.0.1";
import ImageLayout from "../components/ImageLayout.tsx";

if (IS_BROWSER) {
  await import("https://esm.sh/file-drop-element");
}

interface FileDropProps {
  accept: string;
  multiple?: boolean;
}

export default function FileDrop(props: FileDropProps) {
  const [accept] = useState(props.accept);
  const [multiple] = useState(props.multiple);
  const imageLayout = useRef(null);
  let [files, setFiles] = useState("");
  let x: FileDropEvent;

  const onFileDrop: FileDropEvent = (event) => {
    setFiles(event.files);
  };

  const onFileSelect: Event = (event) => {
    setFiles(event.target.files);
  };

  return (
    <div class="flex flex-col">
      <div>
        <file-drop
          onfiledrop={onFileDrop}
          accept={accept}
          multiple={multiple}
        >
          <input
            id="file-picker"
            class="file-picker__input p-2 bg-blue-600 text-white rounded disabled:opacity-50"
            type="file"
            accept="image/*"
            multiple
            onChange={onFileSelect}
          />
          <label for="file-picker" class="file-picker__label">
            <svg viewBox="0 0 24 24" class="file-picker__icon">
              <path d="M19 7v3h-2V7h-3V5h3V2h2v3h3v2h-3zm-3 4V8h-3V5H5a2 2 0 00-2 2v12c0 1.1.9 2 2 2h12a2 2 0 002-2v-8h-3zM5 19l3-4 2 3 3-4 4 5H5z" />
            </svg>
          </label>
        </file-drop>
      </div>
      <div>
        <ImageLayout files={files} ref={imageLayout}>
        </ImageLayout>
      </div>
    </div>
  );
}
