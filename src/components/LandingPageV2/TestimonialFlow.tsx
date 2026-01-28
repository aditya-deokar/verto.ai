
"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
    {
        name: "Alex Rivera",
        role: "Product Director at TechFlow",
        content: "Verto AI isn't just a tool; it's a design partner. I generated a full Series B pitch deck in 5 minutes that looked like it cost $10k.",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
    },
    {
        name: "Sarah Chen",
        role: "Marketing VP at CloudScale",
        content: "The brand consistency is what sold us. Every slide perfectly matches our design system automatically. It's magic.",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d"
    },
    {
        name: "Marcus Johnson",
        role: "Founder at Nexus",
        content: "I used to dread investor updates. Now I actually look forward to creating them. The storytelling AI is uncannily good.",
        avatar: "https://i.pravatar.cc/150?u=a04258114e29026302d"
    },
    {
        name: "Emily Davis",
        role: "Consultant at StrategyFirst",
        content: "For a non-designer like me, this is a game changer. The layouts are always balanced and professional.",
        avatar: "https://i.pravatar.cc/150?u=a04258114e29026708c"
    },
    {
        name: "David Kim",
        role: "Operations Lead at SwiftGo",
        content: "We moved our entire internal reporting to Verto. The productivity boost is measurable and significant.",
        avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d"
    }
];

export default function TestimonialFlow() {
    return (
        <section className="py-24 bg-white dark:bg-[#050505] overflow-hidden transition-colors duration-500">
            <div className="w-full px-6 md:pl-[120px] md:pr-10 mb-16">
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-black dark:text-white mb-6 font-[family-name:var(--font-inter-tight)]">
                    Loved by innovators.
                </h2>
                <p className="text-black/50 dark:text-white/50 text-xl font-[family-name:var(--font-inter)]">
                    Join 50,000+ founders and leaders transforming how they present ideas.
                </p>
            </div>

            <div className="relative flex overflow-hidden group">
                <div className="flex animate-scroll hover:pause gap-6 px-6">
                    {[...testimonials, ...testimonials, ...testimonials].map((t, i) => (
                        <div
                            key={i}
                            className="flex-shrink-0 w-[400px] bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-[32px] p-8 hover:border-black/10 dark:hover:border-white/10 transition-colors"
                        >
                            <div className="flex gap-1 mb-6 text-[#F6BC66]">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" />
                                ))}
                            </div>
                            <p className="text-black/80 dark:text-white/80 text-lg leading-relaxed mb-8 font-light italic font-[family-name:var(--font-inter)]">"{t.content}"</p>
                            <div className="flex items-center gap-4">
                                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full grayscale opacity-70" />
                                <div>
                                    <h4 className="text-black dark:text-white font-medium font-[family-name:var(--font-inter-tight)]">{t.name}</h4>
                                    <p className="text-black/40 dark:text-white/40 text-sm font-[family-name:var(--font-inter)]">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Gradients to fade edges */}
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white dark:from-[#050505] to-transparent z-10" />
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white dark:from-[#050505] to-transparent z-10" />
            </div>
        </section>
    );
}
