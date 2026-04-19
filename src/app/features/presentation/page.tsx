
import PresentationLandingPageClient from "@/components/LandingPageV2/PresentationLanding/PresentationLandingPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Verto AI - Create Powerful AI Pitch Decks in Seconds",
    description: "Turn your ideas into stunning, investor-ready presentations instantly. AI-powered storytelling with premium design.",
};

export default function PresentationLandingPage() {
    return <PresentationLandingPageClient />;
}
