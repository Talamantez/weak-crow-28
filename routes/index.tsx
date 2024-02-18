import Hero from "../components/Hero.tsx";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";
import Testimonial from "../components/Testimonial.tsx";
import Sidebar from "../components/Sidebar.tsx";

export default function Home() {
  return (
    <div>
      <Header active="Home" />
      <div class="flex flex-row">
        <Sidebar />
        <div class="flex flex-col">
          <Hero />
          <Testimonial />
        </div>
      </div>
      <Footer />
    </div>
  );
}
