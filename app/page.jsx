import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import LandingHero from "@/components/sections/LandingHero";
import StatsBand from "@/components/sections/StatsBand";
import HowItWorks from "@/components/sections/HowItWorks";
import DepartmentsShowcase from "@/components/sections/DepartmentsShowcase";
import CallToAction from "@/components/sections/CallToAction";

const Home = () => {
  return (
    <main className="min-h-screen flex flex-col noise">
      <NavBar />
      <LandingHero />
      <StatsBand />
      <HowItWorks />
      <DepartmentsShowcase />
      <CallToAction />
      <Footer />
    </main>
  );
};

export default Home;
