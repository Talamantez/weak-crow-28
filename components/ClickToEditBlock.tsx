import { useEffect, useRef, useState } from "preact/hooks";

export default function ClickToEditBlock({ text }) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputText, setInputText] = useState(text);
  const inputRef = useRef(null);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setIsFocused(false);
    }
  };

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
            className="font-bold text-2xl text-left w-full"
          >
            {inputText || "Click to edit"}
          </div>
        )}
    </>
  );
}
