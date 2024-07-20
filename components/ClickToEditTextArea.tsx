import { useEffect, useRef, useState } from "preact/hooks";

interface ClickToEditProps {
  text: string;
  rows?: number;
  cols?: number;
  onTextChange: (text: string) => void;
}

export default function ClickToEdit(
  { text, onTextChange, rows, cols }: ClickToEditProps,
) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputText, setInputText] = useState(text);
  const inputRef = useRef(null);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleTextChange(e);
    setIsFocused(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    onTextChange(e.target.value);
  }

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      {isFocused
        ? (
          <textarea
            type="text"
            ref={inputRef}
            value={inputText}
            onChange={handleChange}
            onBlur={handleBlur}
            autoFocus
            rows={rows || 10}
            cols={cols || 80}
            class="text-left self-start p-1"
          />
        )
        : (
          <div
            tabIndex={0}
            onFocus={handleFocus}
            class="text-left w-full break-words"
          >
            {inputText}
          </div>
        )}
    </>
  );
}
