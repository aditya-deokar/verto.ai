
"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

export default function FeatureStory() {
    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden">

            {/* Section Header */}
            <div className="max-w-4xl mx-auto text-center mb-20 px-6">
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-[#F55C7A] font-medium tracking-widest text-xs uppercase mb-4 block font-sans"
                >
                    The Reality Check
                </motion.span>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-6 font-[family-name:var(--font-inter-tight)]"
                >
                    You're not a slide designer. <br />
                    <span className="text-white/40">You're a visionary.</span>
                </motion.h2>
                <p className="text-white/50 text-lg max-w-2xl mx-auto">
                    Your value lies in your strategy, not in aligning rectangles at midnight.
                </p>
            </div>

            <div className="container max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* The Old Way - The Efficiency Trap */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="group relative rounded-3xl border border-white/5 bg-[#0A0A0A] p-10 overflow-hidden min-h-[500px] flex flex-col"
                    >
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />

                        <div className="relative z-10 flex-1">
                            <div className="flex items-center gap-3 mb-6 text-red-500/80">
                                <div className="p-2 rounded-full bg-red-500/10"><X size={20} /></div>
                                <span className="font-mono text-sm tracking-widest uppercase">The Efficiency Trap</span>
                            </div>
                            <h3 className="text-3xl font-medium text-white/60 mb-8">The "Quick Edits" that take all night.</h3>

                            <ul className="space-y-4 text-white/40 font-light">
                                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-900/50" />"Final_FINAL_v3.pptx" version chaos</li>
                                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-900/50" />Frankenstein decks with mismatched fonts</li>
                                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-900/50" />Wasting hours on "Make it pop" feedback</li>
                                <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-red-900/50" />Zero time left to rehearse the pitch</li>
                            </ul>
                        </div>

                        {/* Visual - Chaos Files */}
                        <div className="relative h-64 mt-12 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                            <div className="absolute top-4 left-10 py-2 px-4 bg-white/5 border border-white/10 rounded text-xs font-mono text-white/30 rotate-3">pitch_v1.ppt</div>
                            <div className="absolute top-12 left-32 py-2 px-4 bg-white/5 border border-white/10 rounded text-xs font-mono text-white/30 -rotate-6">pitch_final.ppt</div>
                            <div className="absolute top-24 left-16 py-2 px-4 bg-red-500/10 border border-red-500/20 rounded text-xs font-mono text-red-400 rotate-12">pitch_FINAL_REAL.ppt</div>
                        </div>
                    </motion.div>

                    {/* The Verto Way - The Strategic Edge */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="group relative rounded-3xl border border-white/10 bg-linear-to-br from-[#0F0F0F] to-[#050505] p-10 overflow-hidden min-h-[500px] flex flex-col hover:border-white/20 transition-colors"
                    >
                        {/* Glow Effect */}
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F55C7A] opacity-[0.05] blur-[120px] rounded-full pointer-events-none group-hover:opacity-[0.1] transition-opacity duration-700" />

                        <div className="relative z-10 flex-1">
                            <div className="flex items-center gap-3 mb-6 text-[#F6BC66]">
                                <div className="p-2 rounded-full bg-[#F6BC66]/10"><Check size={20} /></div>
                                <span className="font-mono text-sm tracking-widest uppercase">The Strategic Edge</span>
                            </div>
                            <h3 className="text-3xl font-medium text-white mb-8">Boardroom ready in minutes.</h3>

                            <ul className="space-y-4 text-white/80 font-light">
                                <li className="flex items-center gap-3"><Check size={16} className="text-[#F6BC66]" />Story-first generation logic</li>
                                <li className="flex items-center gap-3"><Check size={16} className="text-[#F6BC66]" />Ironclad brand consistency</li>
                                <li className="flex items-center gap-3"><Check size={16} className="text-[#F6BC66]" />Data visualization that actually works</li>
                                <li className="flex items-center gap-3"><Check size={16} className="text-[#F6BC66]" />Focus on the message, not the margins</li>
                            </ul>
                        </div>

                        {/* Visual - Clean Output */}
                        <div className="relative h-64 mt-12 flex items-center justify-center">
                            <div className="w-full max-w-[280px] bg-[#111] border border-white/10 rounded-xl p-4 shadow-2xl skew-y-1">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <div className="h-1 w-20 bg-white/10 rounded" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-20 w-full bg-linear-to-br from-white/10 to-white/5 rounded" />
                                    <div className="h-2 w-full bg-white/5 rounded" />
                                    <div className="h-2 w-2/3 bg-white/5 rounded" />
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="px-2 py-0.5 rounded bg-[#F6BC66]/20 text-[#F6BC66] text-[8px] font-mono">EXPORT READY</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
