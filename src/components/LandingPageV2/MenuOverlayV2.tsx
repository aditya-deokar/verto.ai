"use client";

import { useRef } from "react";
import { X, ArrowRight, Sun, Moon } from "lucide-react";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

const menuItems = [
    {
        label: "CREATE PPT",
        href: "/presentation", // Dynamically handled below
        description: "Generate Presentations",
        image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2670"
    },
    {
        label: "MOBILE DESIGN",
        href: "/mobile-design",
        description: "UI/UX Generation",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
    },
    {
        label: "SHOWCASE",
        href: "#showcase",
        description: "Made with AI",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop"
    },
    {
        label: "FEATURES",
        href: "#features",
        description: "Explore Capabilities",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop"
    },
];

export default function MenuOverlayV2({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { setTheme, theme } = useTheme();
    const { isSignedIn } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        gsap.set(".menu-column", { y: "100%" });
        gsap.set(".overlay-bg", { opacity: 0 });

        tl.current = gsap.timeline({ paused: true })
            .to(".overlay-bg", { opacity: 1, duration: 0.5, ease: "power2.out" })
            .to(".menu-column", {
                y: 0,
                duration: 0.5,
                stagger: 0.07,
                ease: "power2.in"
            }, "-=0.5");
    }, { scope: containerRef });

    useGSAP(() => {
        if (isOpen) {
            tl.current?.play();
        } else {
            tl.current?.reverse();
        }
    }, [isOpen]);

    return (
        <nav
            ref={containerRef}
            aria-label="Main Menu Overlay"
            className={cn(
                "fixed inset-0 z-100 flex pl-[96px] md:pl-[120px] pr-6 py-6 overflow-hidden md:pr-10 transition-all duration-0",
                isOpen ? "visible pointer-events-auto delay-0" : "invisible pointer-events-none delay-500"
            )}
        >

            <div className="overlay-bg absolute inset-0 bg-background/40 backdrop-blur-md z-0" />
            <div className="flex-1 flex h-full pointer-events-auto gap-4 md:gap-6 relative z-10">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        href={index === 0 ? (isSignedIn ? "/presentation" : "/features/presentation") : item.href}
                        onClick={onClose}
                        className={cn(
                            "menu-column relative flex-1 bg-background/80 backdrop-blur-2xl border border-black/5 dark:border-white/10 shadow-2xl z-101 flex flex-col items-center justify-center group overflow-hidden cursor-pointer rounded-[32px] hover:border-black/20 dark:hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_40px_rgba(0,0,0,0.5)]",
                            index === menuItems.length - 1 ? "md:mt-[110px] md:h-[calc(100%-110px)] h-full" : "h-full"
                        )}
                    >
                        {/* Background Image Effect */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-700 z-0">
                            <img
                                src={item.image}
                                alt=""
                                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-transform duration-1000 ease-out grayscale group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />
                        </div>

                        <div className={cn("relative z-10 p-4 text-center", index === menuItems.length - 1 && "md:-translate-y-[55px]")}>
                            <span className="menu-desc block text-xs tracking-[0.2em] text-primary dark:text-primary mb-4 font-mono uppercase">
                                {`0${index + 1} / ${item.description}`}
                            </span>
                            <h2 className="menu-text text-4xl md:text-5xl lg:text-6xl font-[family-name:var(--font-inter)] font-black tracking-tighter text-black dark:text-white transition-all duration-300 transform group-hover:scale-105">
                                {item.label}
                            </h2>
                            <div className="mt-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                <div className="w-12 h-12 rounded-full border border-black/10 dark:border-white/20 flex items-center justify-center mx-auto hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors bg-white/50 dark:bg-black/20 backdrop-blur-sm shadow-sm text-black dark:text-white">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}

            </div>
        </nav>
    );
}
