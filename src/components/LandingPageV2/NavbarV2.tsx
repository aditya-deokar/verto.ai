
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NavbarV2() {
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="fixed top-6 right-6 z-40 pl-6 pr-2 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-lg"
        >
            <div className="flex items-center gap-6">
                <Link href="/login" className="text-xs font-bold tracking-widest text-white/60 hover:text-white transition-colors uppercase">
                    Login
                </Link>
                <Button
                    variant="outline"
                    className="rounded-full h-10 px-6 border-white/10 bg-white text-black hover:bg-white/90 hover:text-black transition-all font-semibold"
                >
                    Get Started
                </Button>
            </div>
        </motion.nav>
    );
}
