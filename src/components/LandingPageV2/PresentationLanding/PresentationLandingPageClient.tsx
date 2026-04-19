
"use client";

import { useState } from "react";
import NavbarV2 from "@/components/LandingPageV2/NavbarV2";
import SidebarV2 from "@/components/LandingPageV2/SidebarV2";
import MenuOverlayV2 from "@/components/LandingPageV2/MenuOverlayV2";
import FooterV2 from "@/components/LandingPageV2/FooterV2";
import PresentationHeroV2 from "@/components/LandingPageV2/PresentationLanding/PresentationHeroV2";
import UseCaseSection from "@/components/LandingPageV2/PresentationLanding/UseCaseSection";
import FeatureHighlight from "@/components/LandingPageV2/PresentationLanding/FeatureHighlight";
import AIIntelligence from "@/components/LandingPageV2/PresentationLanding/AIIntelligence";
import PresentationWorkflow from "@/components/LandingPageV2/PresentationLanding/PresentationWorkflow";
import ClosingCTA from "@/components/LandingPageV2/PresentationLanding/ClosingCTA";

export default function PresentationLandingPageClient() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <main className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white selection:bg-vivid/20 transition-colors duration-500">
            {/* Sidebar & Menu System */}
            <SidebarV2
                isOpen={isMenuOpen}
                onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
            />
            <MenuOverlayV2
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />

            {/* Navbar */}
            <div className="hidden md:block">
                <NavbarV2 />
            </div>

            {/* Core Sections */}
            <PresentationHeroV2 />
            <UseCaseSection />
            <FeatureHighlight />
            <AIIntelligence />
            <PresentationWorkflow />
            <ClosingCTA />

            <FooterV2 />
        </main>
    );
}
