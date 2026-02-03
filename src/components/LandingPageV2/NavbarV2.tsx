
"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { useUser, UserButton } from "@clerk/nextjs";

export default function NavbarV2() {
    const { setTheme, theme } = useTheme();
    const { isSignedIn, isLoaded } = useUser();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;
    return (
        <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="fixed top-6 right-6 md:right-10 z-[102] w-[calc((100vw-120px)/4)] md:w-[calc((100vw-232px)/4)] pl-6 pr-2 py-2 bg-white/80 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-full shadow-lg transition-colors duration-500"
        >
            <div className="flex items-center justify-between gap-4">
                {/* Theme Toggle & Login */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        aria-label="Toggle theme"
                        className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors relative"
                    >
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-black dark:text-white" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-black dark:text-white" />
                        </div>
                    </button>
                    {isLoaded && !isSignedIn && (
                        <Link href="/sign-in" className="text-xs font-bold tracking-widest text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-colors uppercase">
                            Sign In
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {isLoaded && isSignedIn ? (
                        <Link href="/dashboard">
                            <Button
                                variant="outline"
                                className="rounded-full h-10 px-6 border-black/10 dark:border-white/10 bg-black dark:text-black text-white hover:bg-black/90 dark:bg-white  dark:hover:bg-white/90 transition-all font-semibold hover:text-white"
                            >
                                Open Dashboard
                            </Button>
                        </Link>
                    ) : (
                        <Link href="/sign-up">
                            <Button
                                variant="outline"
                                className="rounded-full h-10 px-6 border-black/10 dark:border-white/10 bg-black dark:text-black text-white hover:bg-black/90 dark:bg-white  dark:hover:bg-white/90 transition-all font-semibold hover:text-white"
                            >
                                Get Started
                            </Button>
                        </Link>
                    )}

                    {isLoaded && isSignedIn && (
                        <UserButton afterSignOutUrl="/" />
                    )}
                </div>
            </div>
        </motion.nav>
    );
}
