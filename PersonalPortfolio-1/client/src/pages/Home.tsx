import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ProductOverviewSection from "@/components/BlueprintSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FaqSection from "@/components/FaqSection";
import Footer from "@/components/Footer";
import CallToAction from "@/components/CallToAction";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />
      <main>
        <HeroSection />
        <ProductOverviewSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <Footer />
      <CallToAction />
    </div>
  );
}
