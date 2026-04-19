
"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { presentationLandingData } from "@/lib/presentation-landing-data";
import { useRef } from "react";

export default function PresentationWorkflow() {
    const { workflow } = presentationLandingData;
    const containerRef = useRef<HTMLDivElement>(null);
    
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    const pathLength = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <section ref={containerRef} className="py-32 px-6 md:pl-[120px] md:pr-10 bg-white dark:bg-[#050505] relative overflow-hidden transition-colors duration-500">
            {/* Background Decorative Text */}
            <div className="absolute top-20 right-[-10%] text-[20vw] font-black text-black/[0.02] dark:text-white/[0.02] select-none pointer-events-none uppercase tracking-tighter">
                Process
            </div>

            <div className="max-w-7xl mx-auto relative">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-32"
                >
                    <span className="text-vivid font-bold tracking-[0.3em] uppercase text-xs mb-4 block">
                        How it works
                    </span>
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none uppercase text-black dark:text-white">
                        {workflow.title}
                    </h2>
                </motion.div>

                <div className="relative">
                    {/* Animated Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-black/5 dark:bg-white/5 -translate-x-1/2">
                        <motion.div 
                            style={{ scaleY: pathLength }}
                            className="w-full h-full bg-linear-to-b from-vivid via-red-500 to-transparent origin-top"
                        />
                    </div>

                    <div className="space-y-32 md:space-y-64">
                        {workflow.steps.map((step, i) => (
                            <div 
                                key={i}
                                className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${
                                    i % 2 === 1 ? "md:flex-row-reverse" : ""
                                }`}
                            >
                                {/* Content Side */}
                                <motion.div 
                                    initial={{ opacity: 0, x: i % 2 === 1 ? 100 : -100 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.8, ease: "circOut" }}
                                    className="flex-1 space-y-6"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-6xl font-black text-black/10 dark:text-white/10 font-mono">
                                            0{i + 1}
                                        </div>
                                        <div className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                                    </div>
                                    <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase group text-black dark:text-white">
                                        <span className="group-hover:text-vivid transition-colors duration-500">
                                            {step.title}
                                        </span>
                                    </h3>
                                    <p className="text-black/60 dark:text-white/40 text-lg md:text-xl leading-relaxed font-[family-name:var(--font-inter)] max-w-lg">
                                        {step.description}
                                    </p>
                                </motion.div>

                                {/* Visual Side */}
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 1, ease: "circOut" }}
                                    className="flex-1 relative"
                                >
                                    <div className="relative z-10 w-full aspect-square md:aspect-16/10 rounded-[48px] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center group overflow-hidden shadow-2xl">
                                        {/* Dynamic Background Glow */}
                                        <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        
                                        <div className="text-8xl md:text-9xl transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700 select-none filter drop-shadow-[0_0_30px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                            {step.icon}
                                        </div>

                                        {/* Tech Overlay */}
                                        <div className="absolute bottom-8 right-8 flex gap-2">
                                            {[1, 2, 3].map(dot => (
                                                <div key={dot} className="w-1.5 h-1.5 rounded-full bg-black/20 dark:bg-white/20" />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Number Watermark */}
                                    <div className={`absolute top-1/2 -translate-y-1/2 text-[15vw] font-black text-black/[0.03] dark:text-white/[0.03] select-none pointer-events-none font-mono ${
                                        i % 2 === 1 ? "left-[-20%]" : "right-[-20%]"
                                    }`}>
                                        {i + 1}
                                    </div>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
