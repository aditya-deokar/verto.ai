import LandingPage from "@/components/LandingPageV2/LandingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verto AI - The Future of Presentations",
  description: "Experience the next generation of presentation design. AI-powered, beautiful, and instant. Start creating for free today.",
};

export default function Home() {
  return <LandingPage />;
}
