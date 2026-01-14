import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import InteractiveDashboard from "@/components/InteractiveDashboard";
import Scenarios from "@/components/Scenarios";
import CaseStudies from "@/components/CaseStudies";
import Services from "@/components/Services";
import AboutMe from "@/components/AboutMe";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

export default function Home() {
  // Set document title when component mounts
  useEffect(() => {
    document.title = "Amin Hasan | BI & Analytics Consultant";
  }, []);

  return (
    <div className="min-h-screen">
      <PageTransition />
      <Navbar />
      <Hero />
      <InteractiveDashboard />
      <Scenarios />
      <CaseStudies />
      <Services />
      <AboutMe />
      <Contact />
      <Footer />
    </div>
  );
}
