import Hero from "../components/Hero.tsx";
import Footer from "../components/Footer.tsx";
import Header from "../components/Header.tsx";
import Testimonial from "../components/Testimonial.tsx";
import Sidebar from "../components/Sidebar.tsx";

export default function Home() {
  return (
    <>
      <Header active="Home" />
      <Hero />
      <Testimonial />
      <Footer />
    </>
  );
}
