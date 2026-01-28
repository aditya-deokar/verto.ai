
"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Wand2 } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export default function HeroV2() {
    const containerRef = useRef<HTMLDivElement>(null);
    // Removed scroll animations for cleaner/static feel per user request
    const opacity = 1;
    const y = 0;

    return (
        <section ref={containerRef} className="relative min-h-[120vh] flex flex-col items-center pt-32 md:pt-48 bg-[#050505] overflow-hidden">

            {/* Background Glow - Subtle & Clean */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[500px] bg-[#F55C7A] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-[#F6BC66] opacity-[0.02] blur-[120px] rounded-full pointer-events-none" />

            {/* Grid - Very Subtle */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <motion.div
                style={{ opacity }}
                className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center"
            >
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8"
                >
                    <span className="flex h-2 w-2 rounded-full bg-[#F55C7A] animate-pulse"></span>
                    <span className="text-xs font-medium tracking-wide text-white/70 font-sans">Verto AI 2.0 is live</span>
                </motion.div>

                {/* Heading */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    className="text-5xl md:text-7xl font-semibold tracking-tight text-white mb-8 font-[family-name:var(--font-inter-tight)]"
                >
                    Presentations that <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">design themselves.</span>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
                >
                    Transform rough notes into investor-ready decks in seconds.
                    No formatting, no design skills—just pure storytelling.
                </motion.p>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Button size="lg" className="h-12 px-8 rounded-full bg-white text-black hover:bg-gray-100 font-medium text-base transition-transform hover:scale-105">
                        Generate Deck <Wand2 className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline" size="lg" className="h-12 px-8 rounded-full border-white/10 text-white hover:bg-white/5 hover:text-white font-medium text-base backdrop-blur-sm">
                        View Gallery <Play className="w-4 h-4 ml-2" />
                    </Button>
                </motion.div>
            </motion.div>

            {/* Floating UI Mockup */}
            <motion.div
                style={{ y, opacity }}
                initial={{ opacity: 0, y: 100, rotateX: 20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-6xl mx-auto mt-20 px-4 perspective-1000"
            >
                <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden aspect-[16/9] group">
                    {/* UI Header */}
                    <div className="h-10 border-b border-white/5 bg-white/5 flex items-center px-4 gap-2">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/20" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                            <div className="w-3 h-3 rounded-full bg-green-500/20" />
                        </div>
                        <div className="flex-1 text-center">
                            <div className="inline-block px-3 py-1 rounded bg-black/40 text-[10px] text-white/30 font-mono">verto-ai-studio.app</div>
                        </div>
                    </div>

                    {/* UI Body (Simulated) */}
                    <div className="flex h-full">
                        {/* Sidebar */}
                        <div className="w-16 md:w-64 border-r border-white/5 bg-black/20 hidden md:block p-4 space-y-4">
                            <div className="h-8 w-3/4 bg-white/5 rounded animate-pulse" />
                            <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse opacity-50" />
                            <div className="h-4 w-2/3 bg-white/5 rounded animate-pulse opacity-50" />
                            <div className="h-4 w-1/3 bg-white/5 rounded animate-pulse opacity-50" />
                        </div>

                        {/* Main Canvas */}
                        <div className="flex-1 bg-linear-to-br from-[#050505] to-[#111] p-8 md:p-16 flex items-center justify-center">
                            <div className="relative w-full max-w-2xl aspect-[4/3] bg-black border border-white/10 rounded-lg shadow-2xl flex flex-col overflow-hidden group-hover:scale-[1.02] transition-transform duration-700">
                                {/* Slide Content */}
                                <div className="flex-1 p-12 flex flex-col justify-center items-start">
                                    <div className="w-12 h-12 rounded-lg bg-linear-to-tr from-[#F55C7A] to-[#F6BC66] mb-8" />
                                    <h3 className="text-4xl font-bold text-white mb-4">Q3 Growth Strategy</h3>
                                    <p className="text-white/50 text-lg w-3/4">Leveraging AI to accelerate market penetration and optimize operational efficiency.</p>
                                </div>

                                {/* Slide Footer */}
                                <div className="h-12 border-t border-white/5 flex items-center px-6 justify-between">
                                    <span className="text-xs text-white/30 font-mono">CONFIDENTIAL</span>
                                    <span className="text-xs text-white/30 font-mono">01 / 15</span>
                                </div>

                                {/* AI Cursor Simulated */}
                                <div className="absolute top-1/2 left-1/2 bg-[#F55C7A] px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-lg translate-x-12 translate-y-12 animate-float">
                                    Generating Chart...
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reflection/Shine */}
                    <div className="absolute inset-0 bg-linear-to-tr from-white/5 to-transparent pointer-events-none" />
                </div>

                {/* Bottom Glow */}
                <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[90%] h-[100px] bg-[#F55C7A] opacity-[0.1] blur-[80px] rounded-full pointer-events-none" />
            </motion.div>

        </section>
    );
}
