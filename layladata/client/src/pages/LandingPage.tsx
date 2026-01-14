import Hero from "@/components/Hero";
import Navigation from "@/components/Navigation";
import AtmosphereSection from "@/components/AtmosphereSection";
import WhoSection from "@/components/WhoSection";
import EventDetails from "@/components/EventDetails";
import HostsSection from "@/components/HostsSection";
import InvitationForm from "@/components/InvitationForm";
import Footer from "@/components/Footer";

export default function LandingPage() {
  return (
    <div className="bg-black min-h-screen">
      <Navigation />
      <Hero />
      <AtmosphereSection />
      <WhoSection />
      <EventDetails />
      <HostsSection />
      <InvitationForm />
      <Footer />
    </div>
  );
}
