import { useEffect, useState } from "preact/hooks";
import ContextAwareNAMILoader from "../components/ContextAwareNAMILoader.tsx";
import HomeContent from "./HomeContent.tsx";

export default function LoaderIsland() {
  const [loading, setLoading] = useState(true);
  const [contentReady, setContentReady] = useState(false);
  const [showLoader, setShowLoader] = useState(true);

  const handleLoadComplete = () => {
    setContentReady(true);
  };

  useEffect(() => {
    const minLoadTime = 3000; // Minimum time to show the loader (3 seconds)
    const loadStartTime = Date.now();

    // deno-lint-ignore no-explicit-any
    const handleError = (event: any) => {
      console.error("An error occurred:", event.error);
      // Refresh the page on the first error
      window.location.reload();
    };

    globalThis.addEventListener("error", handleError);

    // Simulate content loading (remove this in production)
    const contentLoadTimeout = setTimeout(() => {
      setLoading(false);
    }, 0); // Simulated 2-second content load time

    return () => {
      globalThis.removeEventListener("error", handleError);
      clearTimeout(contentLoadTimeout);
    };
  }, []);

  useEffect(() => {
    if (!loading && contentReady) {
      const fadeOutDuration = 1000; // 1 second fade-out
      setTimeout(() => {
        setShowLoader(false);
      }, fadeOutDuration);
    }
  }, [loading, contentReady]);

  return (
    <div className="relative">
      {showLoader && (
        <div className={`fixed inset-0 z-50 transition-opacity duration-1000 ${(!loading && contentReady) ? 'opacity-0' : 'opacity-100'}`}>
          <ContextAwareNAMILoader context="general" onLoadComplete={handleLoadComplete} />
        </div>
      )}
      <div className={`transition-opacity duration-1000 ${showLoader ? 'opacity-0' : 'opacity-100'}`}>
        <HomeContent />
      </div>
    </div>
  );
}