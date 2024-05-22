// LoaderIsland.tsx
import { useEffect, useState } from "preact/hooks";
import Loader from "../components/Loader.tsx";
import HomeContent from "./HomeContent.tsx";
export default function LoaderIsland() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for demonstration purposes
    console.log("Loading...");
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      {loading ? <Loader /> : <HomeContent />}
    </div>
  );
}
