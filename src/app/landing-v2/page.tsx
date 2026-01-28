
"use client";

import { useState } from "react";
import HeroV2 from "@/components/LandingPageV2/HeroV2";
import NavbarV2 from "@/components/LandingPageV2/NavbarV2";
import SidebarV2 from "@/components/LandingPageV2/SidebarV2";
import MenuOverlayV2 from "@/components/LandingPageV2/MenuOverlayV2";
import FeatureStory from "@/components/LandingPageV2/FeatureStory";
import SmartFeatures from "@/components/LandingPageV2/SmartFeatures";

import TestimonialFlow from "@/components/LandingPageV2/TestimonialFlow";
import FooterV2 from "@/components/LandingPageV2/FooterV2";

export default function LandingPageV2() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <main className="relative min-h-screen bg-black">
            {/* Sidebar & Menu System */}
            <SidebarV2
                isOpen={isMenuOpen}
                onMenuClick={() => setIsMenuOpen(!isMenuOpen)}
            />
            <MenuOverlayV2
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />

            {/* Existing Navbar (hidden or adapted as top tools if needed, mainly for desktop links or CTA) */}
            <div className="hidden md:block">
                <NavbarV2 />
            </div>

            {/* Page Content */}
            <HeroV2 />
            <FeatureStory />
            <SmartFeatures />
            <TestimonialFlow />
            <FooterV2 />
        </main>
    );
}
