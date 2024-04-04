import { RefactorActionInfo } from "https://deno.land/x/ts_morph@21.0.1/common/typescript.js";
import { useEffect, useRef, useState } from "preact/hooks";

interface ClickToEditProps {
  text: string;
  onTextChange: (text: string) => void;
}

export default function ClickToEdit(
  { text, onTextChange }: ClickToEditProps,
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

  const handleKeyDown = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsFocused(false);
    }
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
          <input
            type="text"
            ref={inputRef}
            value={inputText}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            autoFocus
            className="text-left self-start p-1"
          />
        )
        : (
          <div
            tabIndex={0}
            onFocus={handleFocus}
            className="text-left w-full"
          >
            {inputText}
          </div>
        )}
    </>
  );
}
