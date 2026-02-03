
"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

export default function FeatureStory() {
    return (
        <section className="py-32 bg-white dark:bg-[#050505] relative overflow-hidden transition-colors duration-500">
            <div className="w-full px-6 md:pl-[120px] md:pr-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {/* Section Header - Left Aligned */}
                    <div className="col-span-1 md:col-span-4 mb-20">
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-[#F55C7A] font-medium tracking-widest text-xs uppercase mb-4 block font-[family-name:var(--font-inter)]"
                        >
                            The Reality Check
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-4xl md:text-8xl font-bold tracking-tight text-black dark:text-white mb-6 font-[family-name:var(--font-inter-tight)] leading-[0.9]"
                        >
                            You're not a slide designer. <br />
                            <span className="text-black/40 dark:text-white/40">You're a visionary.</span>
                        </motion.h2>
                        <p className="text-black/50 dark:text-white/50 text-xl max-w-xl font-[family-name:var(--font-inter)]">
                            Your value lies in your strategy, not in aligning rectangles at midnight.
                        </p>
                    </div>

                    {/* Cards Container */}
                    <div className="col-span-1 md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* The Old Way - The Efficiency Trap */}
                        <motion.article
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="group relative rounded-[32px] border border-black/5 dark:border-white/5 bg-gray-50 dark:bg-[#0A0A0A] p-10 overflow-hidden min-h-[500px] flex flex-col"
                        >
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />

                            <div className="relative z-10 flex-1">
                                <div className="flex items-center gap-3 mb-6 text-red-500/80">
                                    <div className="p-2 rounded-full bg-red-500/10"><X size={20} /></div>
                                    <span className="font-mono text-sm tracking-widest uppercase">The Efficiency Trap</span>
                                </div>
                                <h3 className="text-3xl font-medium text-black/60 dark:text-white/60 mb-8 font-[family-name:var(--font-inter-tight)]">The "Quick Edits" that take all night.</h3>

                                <ul className="space-y-4 text-black/40 dark:text-white/40 font-light font-[family-name:var(--font-inter)]">
                                    <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-900/50" />"Final_FINAL_v3.pptx" version chaos</li>
                                    <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-900/50" />Frankenstein decks with mismatched fonts</li>
                                    <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-900/50" />Wasting hours on "Make it pop" feedback</li>
                                    <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-900/50" />Zero time left to rehearse the pitch</li>
                                </ul>
                            </div>

                            {/* Visual - Chaos Files */}
                            <figure className="relative h-64 mt-12 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                                <div className="absolute top-4 left-10 py-2 px-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded text-xs font-mono text-black/30 dark:text-white/30 rotate-3">pitch_v1.ppt</div>
                                <div className="absolute top-12 left-32 py-2 px-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded text-xs font-mono text-black/30 dark:text-white/30 -rotate-6">pitch_final.ppt</div>
                                <div className="absolute top-24 left-16 py-2 px-4 bg-red-500/10 border border-red-500/20 rounded text-xs font-mono text-red-600 dark:text-red-400 rotate-12">pitch_FINAL_REAL.ppt</div>
                            </figure>
                        </motion.article>

                        {/* The Verto Way - The Strategic Edge */}
                        <motion.article
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="group relative rounded-[32px] border border-black/10 dark:border-white/10 bg-white dark:bg-linear-to-br dark:from-[#0F0F0F] dark:to-[#050505] p-10 overflow-hidden min-h-[500px] flex flex-col hover:border-black/20 dark:hover:border-white/20 transition-colors shadow-xl dark:shadow-none"
                        >
                            {/* Glow Effect */}
                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F55C7A] opacity-[0.05] blur-[120px] rounded-full pointer-events-none group-hover:opacity-[0.1] transition-opacity duration-700" />

                            <div className="relative z-10 flex-1">
                                <div className="flex items-center gap-3 mb-6 text-[#F6BC66]">
                                    <div className="p-2 rounded-full bg-[#F6BC66]/10"><Check size={20} /></div>
                                    <span className="font-mono text-sm tracking-widest uppercase">The Strategic Edge</span>
                                </div>
                                <h3 className="text-3xl font-medium text-black dark:text-white mb-8 font-[family-name:var(--font-inter-tight)]">Boardroom ready in minutes.</h3>

                                <ul className="space-y-4 text-black/80 dark:text-white/80 font-light font-[family-name:var(--font-inter)]">
                                    <li className="flex items-center gap-3"><Check size={16} className="text-[#F6BC66]" />Story-first generation logic</li>
                                    <li className="flex items-center gap-3"><Check size={16} className="text-[#F6BC66]" />Ironclad brand consistency</li>
                                    <li className="flex items-center gap-3"><Check size={16} className="text-[#F6BC66]" />Data visualization that actually works</li>
                                    <li className="flex items-center gap-3"><Check size={16} className="text-[#F6BC66]" />Focus on the message, not the margins</li>
                                </ul>
                            </div>

                            {/* Visual - Clean Output */}
                            <figure className="relative h-64 mt-12 flex items-center justify-center">
                                <div className="w-full max-w-[280px] bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-xl p-4 shadow-2xl skew-y-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <div className="h-1 w-20 bg-black/10 dark:bg-white/10 rounded" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-20 w-full bg-linear-to-br from-black/5 to-black/10 dark:from-white/10 dark:to-white/5 rounded" />
                                        <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded" />
                                        <div className="h-2 w-2/3 bg-black/5 dark:bg-white/5 rounded" />
                                    </div>
                                    <div className="mt-4 flex justify-between items-center">
                                        <div className="px-2 py-0.5 rounded bg-[#F6BC66]/20 text-[#F6BC66] text-[8px] font-mono">EXPORT READY</div>
                                    </div>
                                </div>
                            </figure>
                        </motion.article>

                    </div>
                </div>
            </div>
        </section>
    );
}
