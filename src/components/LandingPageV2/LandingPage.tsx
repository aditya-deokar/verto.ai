"use client";

import { useState } from "react";
import { Inter, Inter_Tight } from "next/font/google";
import HeroV2 from "@/components/LandingPageV2/HeroV2";
import NavbarV2 from "@/components/LandingPageV2/NavbarV2";
import SidebarV2 from "@/components/LandingPageV2/SidebarV2";
import MenuOverlayV2 from "@/components/LandingPageV2/MenuOverlayV2";
import FeatureStory from "@/components/LandingPageV2/FeatureStory";
import SmartFeatures from "@/components/LandingPageV2/SmartFeatures";
import MobileShowcase from "@/components/LandingPageV2/MobileShowcase";
import TestimonialFlow from "@/components/LandingPageV2/TestimonialFlow";
import FooterV2 from "@/components/LandingPageV2/FooterV2";
import PresentationWorkflow from "./PresentationLanding/PresentationWorkflow";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight" });

export default function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className={`${inter.variable} ${interTight.variable} font-sans`}>
            <main className="relative min-h-screen bg-black text-white selection:bg-white/20">
                {/* Sidebar & Menu System */}
                <SidebarV2
                    isOpen={isMenuOpen}
                    onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
                />
                <MenuOverlayV2
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                />

                {/* Existing Navbar */}
                <div className="hidden md:block">
                    <NavbarV2 />
                </div>

                {/* Page Content */}
                <HeroV2 />
                {/* <FeatureStory /> */}
                <PresentationWorkflow />
                <SmartFeatures />

                <MobileShowcase />
                <TestimonialFlow />
                <FooterV2 />
            </main>
        </div>
    );
}
