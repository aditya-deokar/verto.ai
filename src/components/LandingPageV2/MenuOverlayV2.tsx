"use client";

import { useRef } from "react";
import { X, ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const menuItems = [
    {
        label: "FEATURES",
        href: "#features",
        description: "The power of GenAI",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2565&auto=format&fit=crop"
    },
    {
        label: "SHOWCASE",
        href: "#showcase",
        description: "Designed by AI",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
    },
    {
        label: "PRICING",
        href: "#pricing",
        description: "Plans for everyone",
        image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop"
    },
    {
        label: "ENTERPRISE",
        href: "#enterprise",
        description: "Scale your workflow",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop"
    },
];

export default function MenuOverlayV2({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const tl = useRef<gsap.core.Timeline | null>(null);

    useGSAP(() => {
        gsap.set(".menu-column", { y: "100%" });

        tl.current = gsap.timeline({ paused: true })
            .to(".menu-column", {
                y: 0,
                duration: 0.5,
                stagger: 0.07,
                ease: "power2.inOut"
            });
    }, { scope: containerRef });

    useGSAP(() => {
        if (isOpen) {
            tl.current?.play();
        } else {
            tl.current?.reverse();
        }
    }, [isOpen]);

    return (
        <div
            ref={containerRef}
            className={cn(
                "fixed inset-0 z-100 flex pl-[96px] md:pl-[120px] pr-6 py-6 overflow-hidden md:pr-10 transition-all duration-0",
                isOpen ? "visible pointer-events-auto delay-0" : "invisible pointer-events-none delay-500"
            )}
        >

            <div className="flex-1 flex h-full pointer-events-auto gap-4 md:gap-6">
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        onClick={onClose}
                        className="menu-column relative flex-1 h-full bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl z-101 flex flex-col items-center justify-center group overflow-hidden cursor-pointer rounded-[32px] hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,0,0,0.5)]"
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

                        <div className="relative z-10 p-4 text-center">
                            <span className="menu-desc block text-xs tracking-[0.2em] text-primary mb-4 font-mono uppercase">
                                {`0${index + 1} / ${item.description}`}
                            </span>
                            <h2 className="menu-text text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-linear-to-r group-hover:from-[#F55C7A] group-hover:to-[#F6BC66] transition-all duration-300 transform group-hover:scale-105">
                                {item.label}
                            </h2>
                            <div className="mt-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mx-auto hover:bg-white hover:text-black transition-colors bg-black/20 backdrop-blur-sm">
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
