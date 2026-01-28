
"use client";

import { motion } from "framer-motion";
import { Wand2, Layout, Palette, Share2, Zap, Layers } from "lucide-react";

const features = [
    {
        title: "AI Writer & Designer",
        description: "Generates professional content and layouts in seconds.",
        icon: Wand2,
        colSpan: "md:col-span-2",
        bg: "bg-linear-to-br from-purple-900/10 to-blue-900/10"
    },
    {
        title: "Smart Layouts",
        description: "Auto-adjusts content to fit perfectly.",
        icon: Layout,
        colSpan: "md:col-span-1",
        bg: "bg-white/5"
    },
    {
        title: "Brand Systems",
        description: "Lock your fonts, colors, and logos.",
        icon: Palette,
        colSpan: "md:col-span-1",
        bg: "bg-white/5"
    },
    {
        title: "One-Click Export",
        description: "Export to editable PowerPoint or PDF.",
        icon: Share2,
        colSpan: "md:col-span-2",
        bg: "bg-linear-to-br from-orange-900/20 to-red-900/20"
    },
    {
        title: "Instant Remix",
        description: "Try 10 design variations with one click.",
        icon: Zap,
        colSpan: "md:col-span-1",
        bg: "bg-white/5"
    },
    {
        title: "Templates",
        description: "Start with premium frameworks.",
        icon: Layers,
        colSpan: "md:col-span-2",
        bg: "bg-white/5"
    }
];


export default function SmartFeatures() {
    return (
        <section id="features" className="py-32 bg-white dark:bg-[#050505] relative overflow-hidden transition-colors duration-500">
            <div className="w-full px-6 md:pl-[120px] md:pr-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {/* Section Header */}
                    <div className="col-span-1 md:col-span-4 mb-20">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl md:text-8xl font-bold tracking-tight text-black dark:text-white mb-6 font-[family-name:var(--font-inter-tight)] leading-[0.9]"
                        >
                            Intelligence <br />
                            <span className="text-black/40 dark:text-white/40">Baked In.</span>
                        </motion.h2>
                        <p className="text-black/50 dark:text-white/50 max-w-xl text-xl font-[family-name:var(--font-inter)]">
                            Not just a design tool. A thinking partner.
                        </p>
                    </div>

                    {/* Feature Cards - Grid Layout */}
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className={`group relative p-8 rounded-[32px] border border-black/5 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20 transition-all duration-500 overflow-hidden flex flex-col justify-between
                                ${feature.colSpan === "md:col-span-1" ? "h-[320px]" : "h-[320px]"}
                                ${feature.colSpan}
                                ${feature.bg ? "" : "bg-gray-50 dark:bg-[#0A0A0A]"}
                                ${feature.bg && feature.bg.includes('gradient') ? feature.bg : ''}
                            `}
                        >
                            {/* Hover Glow */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br from-black/5 to-transparent dark:from-white/5 pointer-events-none" />

                            {/* Icon */}
                            <div className="relative z-10 w-12 h-12 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-white/5 flex items-center justify-center mb-6 text-black dark:text-white group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                                <feature.icon className="w-5 h-5" />
                            </div>

                            {/* Content */}
                            <div className="relative z-10 mt-auto">
                                <h3 className="text-2xl font-bold mb-3 text-black dark:text-white font-[family-name:var(--font-inter-tight)]">{feature.title}</h3>
                                <p className="text-black/60 dark:text-white/50 text-base leading-relaxed font-[family-name:var(--font-inter)]">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}

                </div>
            </div>
        </section>
    );
}
