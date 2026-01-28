
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
        <section id="features" className="py-32 px-6 bg-black relative overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <div className="mb-16 text-center">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-6xl font-bold tracking-tighter mb-6 font-[family-name:var(--font-inter-tight)]"
                    >
                        Intelligence Baked In.
                    </motion.h2>
                    <p className="text-white/50 max-w-2xl mx-auto text-lg">
                        Not just a design tool. A thinking partner.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className={`group relative p-8 rounded-3xl border border-white/10 hover:border-white/20 transition-colors overflow-hidden ${feature.colSpan} ${feature.bg}`}
                        >
                            {/* Hover Glow */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

                            <div className="relative z-10">
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform duration-300">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
