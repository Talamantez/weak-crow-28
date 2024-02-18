import { Button } from "../components/Button.tsx";
import Hero from "../components/Hero.tsx";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";

export default function Home() {
  return (
    <>
    <Header active="Home"/>
      <Hero />
      <div class="px-4 py-8 mx-auto bg-[#86efac]">
        <div class="max-w-screen-md mx-auto flex flex-col items-center justify-center">
          <h1 class="text-4xl font-bold">Welcome to Resource Roadmap</h1>
        </div>
      </div>
      <Footer />
    </>
  );
}
