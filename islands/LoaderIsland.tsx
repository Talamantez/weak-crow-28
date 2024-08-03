import { useEffect, useState } from "preact/hooks";
import ContextAwareNAMILoader from "../components/ContextAwareNAMILoader.tsx";
// import GeneralizedNAMILoader from "../components/GeneralizedNAMILoader.tsx"
import HomeContent from "./HomeContent.tsx";

export default function LoaderIsland() {
  const [loading, setLoading] = useState(true);

  const handleLoadComplete = () => {
    // You can add a small delay here if you want to ensure the animation is fully visible
    setTimeout(() => setLoading(false), 1000);
  };

  useEffect(() => {
    // deno-lint-ignore no-explicit-any
    const handleError = (event: any) => {
      console.error("An error occurred:", event.error);
      // Refresh the page on the first error
      window.location.reload();
    };
    globalThis.addEventListener("error", handleError);
    // Set loading state to false when the component mounts
    // delay for debugging purposes
    setTimeout(() => {
      setLoading(false);
    }, 10000);
    // setLoading(false);
    return () => {
      globalThis.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <div>
      {loading ? <ContextAwareNAMILoader context="general" onLoadComplete={handleLoadComplete}/> : <HomeContent />}
    </div>
  );
}
