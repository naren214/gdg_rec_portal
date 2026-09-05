import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

const Home = () => {
  return (
    <main className="min-h-screen flex flex-col">
      <NavBar />
      <Hero />
      <Footer />
    </main>
  );
};

export default Home;
