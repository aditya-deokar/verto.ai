
"use client";

import { motion } from "framer-motion";
import { presentationLandingData } from "@/lib/presentation-landing-data";
import { cn } from "@/lib/utils";

export default function UseCaseSection() {
    const { useCases } = presentationLandingData;

    return (
        <section className="py-24 px-6 md:pl-[120px] md:pr-10 bg-white dark:bg-[#050505] relative overflow-hidden transition-colors duration-500">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mb-16 md:mb-24"
                >
                    <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-black dark:text-white">
                        {useCases.title}
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {useCases.items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "group relative h-[400px] rounded-[32px] overflow-hidden border border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20 transition-all duration-500 shadow-sm hover:shadow-xl",
                                index === 0 && "md:col-span-2 lg:col-span-2",
                                index === 3 && "md:col-span-2 lg:col-span-1"
                            )}
                        >
                            <img
                                src={item.image}
                                alt={item.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0 opacity-60 dark:opacity-40"
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black via-black/20 to-transparent opacity-80" />
                            
                            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-vivid mb-3 block">
                                    {`0${index + 1} / Use Case`}
                                </span>
                                <h3 className="text-3xl font-black tracking-tighter mb-2 group-hover:translate-x-2 transition-transform duration-500 text-white">
                                    {item.title}
                                </h3>
                                <p className="text-white/70 dark:text-white/50 text-sm max-w-[260px] group-hover:text-white transition-colors duration-500">
                                    {item.description}
                                </p>
                            </div>

                            {/* Hover Decorative Element */}
                            <div className="absolute top-6 right-6 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/10 backdrop-blur-md">
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
