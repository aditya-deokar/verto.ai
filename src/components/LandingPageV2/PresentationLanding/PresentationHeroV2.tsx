
"use client";

import { motion } from "framer-motion";
import { presentationLandingData } from "@/lib/presentation-landing-data";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PresentationHeroV2() {
    const { hero } = presentationLandingData;

    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 pb-20 px-6 overflow-hidden bg-white dark:bg-black transition-colors duration-500">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] uppercase rounded-full border border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-md text-black/60 dark:text-white/60">
                        AI-Powered Storytelling
                    </span>
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-[0.9] lg:leading-[0.85] text-black dark:text-white">
                        {hero.title.split("—").map((part, i) => (
                            <span key={i} className={i === 1 ? "block text-vivid mt-2" : "block"}>
                                {part.trim()}
                            </span>
                        ))}
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-black/60 dark:text-white/50 mb-10 leading-relaxed font-[family-name:var(--font-inter)]">
                        {hero.subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/sign-up">
                            <Button size="lg" className="rounded-full h-14 px-10 text-lg font-bold bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 transition-all hover:scale-105 active:scale-95 group shadow-xl">
                                {hero.cta}
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Hero Preview Card */}
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "circOut" }}
                    className="mt-20 relative group"
                >
                    <div className="absolute -inset-1 bg-linear-to-r from-red-500 to-orange-500 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-white dark:bg-black border border-black/5 dark:border-white/10 rounded-[30px] overflow-hidden shadow-2xl backdrop-blur-3xl">
                        <div className="flex items-center gap-2 px-6 py-4 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-orange-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="flex-1 text-center">
                                <span className="text-[10px] uppercase tracking-widest text-black/30 dark:text-white/30 font-bold">Verto Editor — Untitled Deck</span>
                            </div>
                        </div>
                        <img 
                            src={hero.image} 
                            alt="Presentation Preview" 
                            className="w-full aspect-video object-cover opacity-90 dark:opacity-80 transition-opacity"
                        />
                        {/* Overlay to make it look like an editor */}
                        <div className="absolute inset-0 pointer-events-none border-[12px] border-gray-100/40 dark:border-black/40 shadow-inner"></div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
