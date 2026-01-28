
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";

export default function SidebarV2({
    onMenuClick,
    isOpen
}: {
    onMenuClick: () => void;
    isOpen: boolean;
}) {
    return (
        <aside className="fixed left-6 top-6 bottom-6 w-[60px] md:w-[72px] bg-black/40 backdrop-blur-2xl border border-white/10 shadow-2xl z-101 flex flex-col items-center py-8 rounded-[36px]">
            {/* Brand Icon / Home Link */}
            <Link href="/landing-v2" className="mb-12 group">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#F55C7A] to-[#F6BC66] opacity-80 group-hover:opacity-100 transition-opacity blur-[1px] group-hover:blur-0 duration-300 shadow-[0_0_20px_rgba(245,92,122,0.3)]" />
            </Link>

            {/* Menu Toggle */}
            <button
                onClick={onMenuClick}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all group border border-transparent hover:border-white/5 active:scale-95"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X size={20} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Menu size={20} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>

            {/* Vertical Text */}
            <div className="flex-1 flex items-center justify-center mt-12 pb-4">
                <div className="rotate-180 [writing-mode:vertical-rl] text-[10px] font-bold tracking-[0.3em] text-white/20 flex items-center gap-6 font-mono uppercase select-none">
                    <span>Verto AI</span>
                    <span className="w-px h-8 bg-white/10" />
                    <span>Est. 2025</span>
                </div>
            </div>
        </aside>
    );
}
