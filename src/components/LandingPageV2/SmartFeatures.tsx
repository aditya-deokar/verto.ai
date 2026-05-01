
"use client";

import { motion } from "framer-motion";
import { Wand2, Layout, Palette, Share2, Zap, Layers } from "lucide-react";
import CardFlip from "./CardFlip";

const features = [
    {
        title: "AI Design Engine",
        subtitle: "Pixel-perfect layouts in seconds.",
        description: "Our neural engine analyzes your content and applies professional design principles automatically.",
        features: ["Adaptive Spacing", "Intelligent Color Palettes", "Rule-based Typography", "Context-aware Imagery"],
        icon: Wand2,
        colSpan: "md:col-span-2",
        variant: "design" as const
    },
    {
        title: "Semantic Editor",
        subtitle: "Content is king, treated with care.",
        description: "Edit your presentation using simple text commands. No more dragging boxes or fighting with alignment.",
        features: ["Command-line Interface", "Markdown Support", "Natural Language Editing", "Real-time Sync"],
        icon: Layout,
        colSpan: "md:col-span-1",
        variant: "editor" as const
    },
    {
        title: "Brand Lockdown",
        subtitle: "Consistency across every deck.",
        description: "Enforce your brand guidelines globally. Lock fonts, colors, and logos to prevent creative drift.",
        features: ["Asset Library", "Color Locking", "Custom Font Support", "Logo Protection"],
        icon: Palette,
        colSpan: "md:col-span-1",
        variant: "brand" as const
    },
    {
        title: "Smart Export",
        subtitle: "Presentation anywhere, anytime.",
        description: "Export to fully editable PowerPoint, PDF, or high-fidelity web presentations with zero loss.",
        features: ["PowerPoint (PPTX)", "High-res PDF", "Immersive Webview", "HTML5 Animation"],
        icon: Share2,
        colSpan: "md:col-span-2",
        variant: "export" as const
    },
    {
        title: "AI Co-pilot",
        subtitle: "Your intelligent thinking partner.",
        description: "Stuck on a slide? The co-pilot suggests outlines, finds research, and writes copy while you design.",
        features: ["Auto-Outline", "Research Assistant", "Tone Adjuster", "Image Generation"],
        icon: Zap,
        colSpan: "md:col-span-1",
        variant: "copilot" as const
    },
    {
        title: "Global CDN",
        subtitle: "Collaborate at light speed.",
        description: "Host your presentations on our ultra-fast CDN. Share a link and get real-time analytics.",
        features: ["Real-time Analytics", "Global Delivery", "Password Protection", "Viewer Insights"],
        icon: Layers,
        colSpan: "md:col-span-1",
        variant: "cdn" as const
    }
];


export default function SmartFeatures() {
    return (
        <section id="features" className="py-32 bg-white dark:bg-[#050505] relative overflow-hidden transition-colors duration-500">
            <div className="w-full px-6 md:pl-[120px] md:pr-10">
                
                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 min-h-[800px]">

                    {/* Section Header - Integrated into the first "cell" area */}
                    <div className="col-span-1 md:col-span-2 flex flex-col justify-center pb-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-8xl font-bold tracking-tight text-black dark:text-white mb-6 font-[family-name:var(--font-inter-tight)] leading-[0.9]">
                                Intelligence <br />
                                <span className="text-black/40 dark:text-white/40">Baked In.</span>
                            </h2>
                            <p className="text-black/50 dark:text-white/50 max-w-sm text-lg font-[family-name:var(--font-inter)] leading-relaxed">
                                Not just a design tool. A thinking partner that understands your brand and your message.
                            </p>
                        </motion.div>
                    </div>

                    {/* Featured Card: AI Design Engine */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        viewport={{ once: true }}
                        className="md:col-span-2 md:row-span-1 h-full"
                    >
                        <CardFlip
                            title={features[0].title}
                            subtitle={features[0].subtitle}
                            description={features[0].description}
                            features={features[0].features}
                            icon={features[0].icon}
                            variant={features[0].variant}
                            className="h-full"
                        />
                    </motion.div>

                    {/* Small Card: Semantic Editor */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        viewport={{ once: true }}
                        className="md:col-span-1 h-full"
                    >
                        <CardFlip
                            title={features[1].title}
                            subtitle={features[1].subtitle}
                            description={features[1].description}
                            features={features[1].features}
                            icon={features[1].icon}
                            variant={features[1].variant}
                        />
                    </motion.div>

                    {/* Small Card: Brand Lockdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        viewport={{ once: true }}
                        className="md:col-span-1 h-full"
                    >
                        <CardFlip
                            title={features[2].title}
                            subtitle={features[2].subtitle}
                            description={features[2].description}
                            features={features[2].features}
                            icon={features[2].icon}
                            variant={features[2].variant}
                        />
                    </motion.div>

                    {/* Medium Card: Smart Export */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        viewport={{ once: true }}
                        className="md:col-span-2 h-full"
                    >
                        <CardFlip
                            title={features[3].title}
                            subtitle={features[3].subtitle}
                            description={features[3].description}
                            features={features[3].features}
                            icon={features[3].icon}
                            variant={features[3].variant}
                        />
                    </motion.div>

                    {/* Small Card: AI Co-pilot */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        viewport={{ once: true }}
                        className="md:col-span-1 h-full"
                    >
                        <CardFlip
                            title={features[4].title}
                            subtitle={features[4].subtitle}
                            description={features[4].description}
                            features={features[4].features}
                            icon={features[4].icon}
                            variant={features[4].variant}
                        />
                    </motion.div>

                    {/* Small Card: Global CDN */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                        viewport={{ once: true }}
                        className="md:col-span-1 h-full"
                    >
                        <CardFlip
                            title={features[5].title}
                            subtitle={features[5].subtitle}
                            description={features[5].description}
                            features={features[5].features}
                            icon={features[5].icon}
                            variant={features[5].variant}
                        />
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
