
"use client";

import { motion } from "framer-motion";
import { Sparkles, Layers, PenTool, Zap } from "lucide-react";

const mobileFeatures = [
    {
        title: "Text to Design",
        desc: "Describe your app idea, and Verto builds fully layered, high-fidelity UI screens.",
        icon: Sparkles,
        color: "bg-blue-500/10 text-blue-500"
    },
    {
        title: "Smart Auto-Layout",
        desc: "Components generated with perfect padding and spacing. No broken layouts.",
        icon: Layers,
        color: "bg-purple-500/10 text-purple-500"
    },
    {
        title: "Fully Editable",
        desc: "Every button, input, and card is a vector object. Tweak it just like a pro tool.",
        icon: PenTool,
        color: "bg-green-500/10 text-green-500"
    }
];

export default function MobileShowcase() {
    return (
        <section className="py-32 bg-gray-50 dark:bg-[#0A0A0A] overflow-hidden transition-colors duration-500">
            <div className="w-full px-6 md:pl-[120px] md:pr-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                {/* Text Content - Floating Cards Style */}
                <div className="order-2 lg:order-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="space-y-8"
                    >
                        {/* Header Box */}
                        <header className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 p-8 rounded-[40px] shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-bl from-[#F55C7A]/10 to-transparent rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                            <div className="flex items-center gap-2 mb-6 relative z-10">
                                <span className="h-px w-8 bg-black/20 dark:bg-white/20"></span>
                                <span className="text-sm font-bold uppercase tracking-widest text-[#F55C7A] font-[family-name:var(--font-inter)]">
                                    AI UI Generator
                                </span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-black dark:text-white mb-4 font-[family-name:var(--font-inter-tight)] relative z-10">
                                <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">Professional</span> designs, generated instantly.
                            </h2>
                            <p className="text-lg text-black/60 dark:text-white/60 font-[family-name:var(--font-inter)] leading-relaxed relative z-10">
                                Skip the wireframing. Transform text descriptions into professional, production-ready mobile UI screens with perfect layers.
                            </p>
                        </header>

                        {/* Feature Cards Stack */}
                        <div className="flex flex-col gap-4">
                            {mobileFeatures.map((feat, i) => (
                                <motion.article
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 + 0.2 }}
                                    className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 p-6 rounded-[32px] flex items-center gap-6 shadow-sm hover:shadow-md transition-shadow group"
                                >
                                    <div className={`w-14 h-14 rounded-2xl ${feat.color} flex items-center justify-center shrink-0`}>
                                        <feat.icon size={24} strokeWidth={2} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-black dark:text-white mb-1 font-[family-name:var(--font-inter-tight)]">{feat.title}</h3>
                                        <p className="text-sm text-black/50 dark:text-white/50 font-[family-name:var(--font-inter)]">{feat.desc}</p>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Visual Content: Floating Phone Mockup */}
                <figure className="order-1 lg:order-2 flex justify-center lg:justify-end relative">
                    <motion.div
                        initial={{ opacity: 0, y: 40, rotate: -6 }}
                        whileInView={{ opacity: 1, y: 0, rotate: -6 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative z-10"
                    >
                        {/* Phone Bezel */}
                        <div className="w-[300px] h-[600px] border-[12px] border-black dark:border-[#222] rounded-[56px] bg-black overflow-hidden relative shadow-2xl dark:shadow-white/5">
                            {/* Dynamic Island / Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-7 w-28 bg-black rounded-b-2xl z-20"></div>

                            {/* Screen Content - UI Design Mockup */}
                            <div className="w-full h-full bg-white dark:bg-[#111] relative overflow-hidden flex flex-col">
                                {/* Header */}
                                <div className="h-20 bg-white/50 dark:bg-white/5 backdrop-blur-sm flex items-end justify-between px-6 pb-4 border-b border-black/5 dark:border-white/5 z-10">
                                    <div className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10"></div>
                                    <div className="font-[family-name:var(--font-inter-tight)] text-xs font-bold text-black/40 dark:text-white/40 uppercase tracking-wider">Generated UI</div>
                                </div>

                                {/* Generated UI Layout */}
                                <div className="p-6 space-y-6 flex-1 overflow-hidden relative">
                                    {/* Hero Card */}
                                    <div className="w-full h-48 bg-linear-to-br from-indigo-500/10 to-purple-500/10 rounded-3xl border border-indigo-500/20 p-5 relative overflow-hidden">
                                        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/40 backdrop-blur-md"></div>
                                        <div className="absolute bottom-5 left-5 space-y-2">
                                            <div className="w-24 h-4 bg-black/10 dark:bg-white/10 rounded-md"></div>
                                            <div className="w-32 h-6 bg-black/20 dark:bg-white/20 rounded-lg"></div>
                                        </div>
                                    </div>

                                    {/* Grid items */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="h-32 rounded-3xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 flex flex-col justify-end">
                                            <div className="w-8 h-8 rounded-xl bg-orange-500/20 mb-auto"></div>
                                            <div className="w-16 h-4 bg-black/10 dark:bg-white/10 rounded-md"></div>
                                        </div>
                                        <div className="h-32 rounded-3xl bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 flex flex-col justify-end">
                                            <div className="w-8 h-8 rounded-xl bg-blue-500/20 mb-auto"></div>
                                            <div className="w-16 h-4 bg-black/10 dark:bg-white/10 rounded-md"></div>
                                        </div>
                                    </div>

                                    {/* Selection Lines (Professional style) */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute top-[24px] left-[24px] right-[24px] h-[192px] border-2 border-[#0099FF] rounded-3xl opacity-0 animate-pulse delay-1000">
                                            <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-[#0099FF]"></div>
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-[#0099FF]"></div>
                                            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-[#0099FF]"></div>
                                            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-[#0099FF]"></div>
                                            <div className="absolute -top-6 left-0 bg-[#0099FF] px-2 py-0.5 rounded text-[10px] text-white font-mono">Mobile UI</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Fab */}
                                <div className="absolute bottom-8 right-6 w-14 h-14 bg-black dark:bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer z-20">
                                    <Zap size={24} className="text-white dark:text-black" fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Decorative Background Elements behind phone */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-linear-to-tr from-indigo-500/20 to-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
                </figure>
            </div>
        </section >
    );
}
