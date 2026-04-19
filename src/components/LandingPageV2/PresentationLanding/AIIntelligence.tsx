
"use client";

import { motion } from "framer-motion";
import { presentationLandingData } from "@/lib/presentation-landing-data";
import { CheckCircle2 } from "lucide-react";

export default function AIIntelligence() {
    const { aiIntelligence } = presentationLandingData;

    return (
        <section className="py-24 px-6 md:pl-[120px] md:pr-10 bg-white dark:bg-[#050505] relative overflow-hidden transition-colors duration-500">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 md:gap-24">
                {/* AI Visualization / Image */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 relative group w-full"
                >
                    <div className="absolute -inset-10 bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="relative aspect-square md:aspect-16/10 rounded-[40px] overflow-hidden border border-black/5 dark:border-white/10 shadow-xl dark:shadow-2xl">
                        <img 
                            src={aiIntelligence.image} 
                            alt="AI Intelligence"
                            className="w-full h-full object-cover grayscale opacity-90 dark:opacity-70 group-hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-linear-to-tr from-red-500/20 to-transparent pointer-events-none" />
                    </div>
                </motion.div>

                {/* Text content */}
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="flex-1 space-y-8"
                >
                    <div className="space-y-4">
                        <span className="text-vivid font-bold tracking-[0.2em] uppercase text-xs">
                          AI Core
                        </span>
                        <h2 className="text-4xl md:text-7xl font-black tracking-tighter leading-none uppercase text-black dark:text-white">
                            {aiIntelligence.title}
                        </h2>
                        <p className="text-black/60 dark:text-white/50 text-xl leading-relaxed font-[family-name:var(--font-inter)]">
                            {aiIntelligence.description}
                        </p>
                    </div>

                    <div className="space-y-4 pt-4">
                        {aiIntelligence.points.map((point, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-4 p-5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            >
                                <div className="mt-1">
                                    <CheckCircle2 className="w-6 h-6 text-vivid shadow-[0_0_10px_rgba(245,92,122,0.3)]" />
                                </div>
                                <p className="text-black/80 dark:text-white/80 font-bold tracking-tight text-lg">
                                    {point}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
