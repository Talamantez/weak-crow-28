// LoaderIsland.tsx
import { useEffect, useState } from "preact/hooks";
import Loader from "../components/Loader.tsx";
import HomeContent from "./HomeContent.tsx";
export default function LoaderIsland() {
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    setLoading(false)
  }, []);

  return (
    <div>
      {loading ? <Loader /> : <HomeContent />}
    </div>
  );
}
