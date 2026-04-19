
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { presentationLandingData } from "@/lib/presentation-landing-data";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";

export default function ClosingCTA() {
    const { closing } = presentationLandingData;
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

    return (
        <section ref={containerRef} className="py-48 px-6 md:pl-[120px] md:pr-10 bg-white dark:bg-black relative overflow-hidden min-h-[80vh] flex items-center justify-center transition-colors duration-500">
            {/* Immersive Background Elements */}
            <motion.div 
                style={{ y: y1, rotate }}
                className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" 
            />
            <motion.div 
                style={{ y: y2, rotate: -rotate }}
                className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] bg-vivid/10 rounded-full blur-[100px] pointer-events-none" 
            />

            <div className="max-w-6xl w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className="relative group"
                >
                    {/* Glass Card */}
                    <div className="absolute -inset-1 bg-linear-to-r from-red-500/20 to-vivid/20 rounded-[48px] blur-sm opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                    
                    <div className="relative bg-gray-50/80 dark:bg-[#0a0a0a]/80 backdrop-blur-3xl border border-black/5 dark:border-white/10 rounded-[48px] p-12 md:p-24 overflow-hidden text-center shadow-xl dark:shadow-none">
                        {/* Decorative Sparkle */}
                        <div className="absolute top-12 left-1/2 -translate-x-1/2">
                            <motion.div 
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            >
                                <Sparkles className="w-8 h-8 text-vivid/50" />
                            </motion.div>
                        </div>

                        <h2 className="text-5xl md:text-9xl font-black tracking-[-0.04em] mb-10 leading-[0.9] uppercase text-black dark:text-white">
                            From <span className="italic font-serif text-black/20 dark:text-white/40 lowercase pr-4">idea</span>
                            <br />
                            to <span className="text-vivid">Impact</span>
                        </h2>
                        
                        <p className="text-black/60 dark:text-white/50 text-xl md:text-2xl mb-16 max-w-2xl mx-auto leading-relaxed font-[family-name:var(--font-inter)]">
                            {closing.description}
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <Link href="/sign-up">
                                <Button size="lg" className="rounded-full h-20 px-16 text-2xl font-black bg-black dark:bg-white text-white dark:text-black hover:bg-vivid hover:text-white transition-all duration-500 hover:scale-110 active:scale-95 group shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                                    {closing.cta}
                                    <ArrowRight className="ml-4 w-8 h-8 group-hover:translate-x-3 transition-transform duration-500" />
                                </Button>
                            </Link>
                        </div>

                        {/* Aesthetic Grid Overlay */}
                        <div className="absolute inset-0 dotted-grid pointer-events-none opacity-20 dark:opacity-100" />
                    </div>
                </motion.div>
            </div>

            {/* Bottom Glow Line */}
            <div className="absolute bottom-0 left-0 w-full h-px bg-linear-to-r from-transparent via-black/10 dark:via-white/20 to-transparent" />
        </section>
    );
}
