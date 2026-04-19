
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { presentationLandingData } from "@/lib/presentation-landing-data";
import { useRef } from "react";

export default function FeatureHighlight() {
    const { features } = presentationLandingData;
    const containerRef = useRef<HTMLDivElement>(null);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Cross-fade transforms for 2 features
    // Feature 1: Visible from 0 to 0.5 (fades out between 0.4 and 0.6)
    const opacity1 = useTransform(scrollYProgress, [0, 0.4, 0.6], [1, 1, 0]);
    const scale1 = useTransform(scrollYProgress, [0, 0.4, 0.6], [1, 1, 1.1]);
    
    // Feature 2: Visible from 0.5 to 1 (fades in between 0.4 and 0.6)
    const opacity2 = useTransform(scrollYProgress, [0.4, 0.6, 1], [0, 1, 1]);
    const scale2 = useTransform(scrollYProgress, [0.4, 0.6, 1], [0.9, 1, 1]);

    const opacities = [opacity1, opacity2];
    const scales = [scale1, scale2];

    return (
        <section ref={containerRef} className="relative bg-white dark:bg-black transition-colors duration-500">
            <div className="flex flex-col md:flex-row min-h-[200vh]">
                {/* Sticky Visual Side */}
                <div className="md:sticky md:top-0 h-[50vh] md:h-screen w-full md:w-1/2 flex items-center justify-center p-6 md:p-24 overflow-hidden order-1 md:order-2">
                    <div className="relative w-full aspect-square md:aspect-4/3 max-w-2xl">
                        {/* Background Glow base */}
                        <div className="absolute inset-0 bg-linear-to-br from-red-500/10 to-vivid/10 blur-[100px] rounded-full" />
                        
                        {features.map((feature, index) => (
                            <motion.div
                                key={feature.id}
                                style={{ 
                                    opacity: opacities[index],
                                    scale: scales[index],
                                    zIndex: index === 0 ? 10 : 20
                                }}
                                className="absolute inset-0 w-full h-full rounded-[48px] overflow-hidden border border-black/5 dark:border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.1)] dark:shadow-[0_0_80px_rgba(0,0,0,0.5)] bg-black/5 dark:bg-white/5"
                            >
                                <img 
                                    src={feature.image} 
                                    alt={feature.subtitle}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent opacity-60" />
                                
                                {/* Floating Glass Fragments */}
                                <div className="absolute top-8 right-8 p-4 bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/20 rounded-2xl shadow-2xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-vivid animate-pulse" />
                                        <span className="text-[10px] font-bold tracking-widest text-white/50 uppercase">Analysis active</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/40 dark:bg-black/40 backdrop-blur-md border border-black/5 dark:border-white/10 rounded-2xl">
                                    <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: "0%" }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            className="h-full bg-vivid"
                                        />
                                    </div>
                                    <div className="mt-3 flex justify-between">
                                        <span className="text-[10px] text-black/40 dark:text-white/40 uppercase">Verto AI Intelligence</span>
                                        <span className="text-[10px] text-vivid font-bold uppercase">Optimizing...</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Scrolling Content Side */}
                <div className="w-full md:w-1/2 md:pl-[120px] order-2 md:order-1 relative z-30">
                    {features.map((feature, index) => (
                        <div 
                            key={feature.id} 
                            className="h-screen flex flex-col justify-center px-6 md:pr-12"
                        >
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ margin: "-20%" }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="space-y-8"
                            >
                                <span className="text-vivid font-black tracking-[0.3em] uppercase text-xs">
                                    {feature.title}
                                </span>
                                <h3 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase text-black dark:text-white">
                                    {feature.subtitle}
                                </h3>
                                <p className="text-black/60 dark:text-white/40 text-xl md:text-2xl leading-relaxed font-[family-name:var(--font-inter)] max-w-lg">
                                    {feature.description}
                                </p>
                                
                                <div className="pt-8">
                                    <div className="flex items-center gap-4 text-black/20 dark:text-white/20">
                                        <span className="text-xl font-black font-mono">0{index + 1}</span>
                                        <div className="w-12 h-px bg-black/20 dark:bg-white/20" />
                                        <span className="text-[10px] tracking-widest uppercase font-bold">Capabilities</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
