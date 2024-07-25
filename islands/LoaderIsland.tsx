// LoaderIsland.tsx
import { useEffect, useState } from "preact/hooks";

import Loader from "../components/Loader.tsx";
import HomeContent from "./HomeContent.tsx";

export default function LoaderIsland() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // deno-lint-ignore no-explicit-any
    const handleError = (event:any) => {
      console.error("An error occurred:", event.error);
      // Refresh the page on the first error
      window.location.reload();
    };

    globalThis.addEventListener("error", handleError);

    // Set loading state to false when the component mounts
    setLoading(false);

    return () => {
      globalThis.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <div>
      {loading ? <Loader message={`We're setting up your editor...`} /> : <HomeContent />}
    </div>
  );
}