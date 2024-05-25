// LoaderIsland.tsx
import { useEffect, useState } from "preact/hooks";

import Loader from "../components/Loader.tsx";
import HomeContent from "./HomeContent.tsx";

export default function LoaderIsland() {
  const [loading, setLoading] = useState(true);
  const [retries, setRetries] = useState(0);
  const maxRetries = 3;
  const initialDelay = 1000;
  const maxDelay = 10000;

  useEffect(() => {
    const originalConsoleError = console.error;

    const handleConsoleError = () => {
      if (retries < maxRetries) {
        const delay = Math.min(initialDelay * 2 ** retries, maxDelay);
        console.warn(`Retrying in ${delay}ms...`);
        setRetries(retries + 1);
        setTimeout(() => {
          setLoading(false);
        }, delay);
      } else {
        console.error("Content loading failed after maximum retries");
        // Refresh the page
        window.location.reload();
      }
    };

    console.error = (...args) => {
      originalConsoleError(...args);
      handleConsoleError();
    };

    globalThis.addEventListener("error", handleConsoleError);

    // Set loading state to false when the component mounts
    setLoading(false);

    return () => {
      console.error = originalConsoleError;
      globalThis.removeEventListener("error", handleConsoleError);
    };
  }, [retries]);

  return (
    <div>
      {loading ? <Loader /> : <HomeContent />}
    </div>
  );
}