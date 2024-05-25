import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";
import LoaderIsland from "../islands/LoaderIsland.tsx";

export default function Home() {

  return (
    <div>
      <Header active="home" />
      <LoaderIsland />
      <Footer />
    </div>
  );
}
