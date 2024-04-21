import { useEffect, useRef, useState } from "preact/hooks";

interface ClickToEditProps {
  text: string;
  onTextChange: (text: string) => void;
}

export default function ClickToEdit({ text, onTextChange }: ClickToEditProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputText, setInputText] = useState(text);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    setDragOffsetX(e.clientX - containerRef.current.offsetLeft);
    setDragOffsetY(e.clientY - containerRef.current.offsetTop);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      const newLeft = e.clientX - dragOffsetX;
      const newTop = e.clientY - dragOffsetY;
      containerRef.current.style.left = `${newLeft}px`;
      containerRef.current.style.top = `${newTop}px`;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ position: "relative" }}
    >
      {isFocused ? (
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
      ) : (
        <div
          tabIndex={0}
          onFocus={handleFocus}
          className="text-left w-full"
        >
          {inputText}
        </div>
      )}
    </div>
  );
}