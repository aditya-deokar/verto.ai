"use client";

import Link from "next/link";
import { Twitter, Linkedin, Github, DiscIcon as Discord } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { GradientBars } from "./GradientBars";

export default function FooterV2() {
    const { isSignedIn } = useUser();
    return (
        <footer className="relative z-10 py-6 px-4 md:pl-[120px] md:pr-10 bg-white dark:bg-[#050505] transition-colors duration-500">

            <GradientBars colors={["#F55C7A", "#F6BC66", "transparent"]} bars={20} />

            {/* <div className="w-full bg-gray-100/50 dark:bg-[#111] border border-black/5 dark:border-white/5 rounded-[40px] p-10 md:p-20 overflow-hidden relative"> */}

                {/* Optional: Subtle Grain or Gradient Overlay for that extra "Apple" feel */}
                {/* <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/5 dark:to-white/5 opacity-50 pointer-events-none" /> */}

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 mb-20">

                    {/* Brand */}
                    <div className="col-span-1">
                        <Link href="/landing-v2" className="flex items-center gap-2 mb-6">
                            <div className="w-6 h-6 rounded bg-linear-to-br from-[#F55C7A] to-[#F6BC66]" />
                            <span className="text-black dark:text-white font-bold tracking-widest text-sm font-[family-name:var(--font-inter-tight)]">VERTO AI</span>
                        </Link>
                        <p className="text-black/60 dark:text-white/40 text-sm leading-relaxed mb-6 font-[family-name:var(--font-inter)]">
                            The AI workspace that turns your thoughts into broadcast-quality presentations.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" aria-label="Twitter" className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"><Twitter size={20} /></Link>
                            <Link href="#" aria-label="LinkedIn" className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"><Linkedin size={20} /></Link>
                            <Link href="#" aria-label="Discord" className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"><Discord size={20} /></Link>
                            <Link href="#" aria-label="GitHub" className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"><Github size={20} /></Link>
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div className="md:pl-10">
                        <h4 className="text-black dark:text-white font-medium mb-6 font-[family-name:var(--font-inter-tight)]">Product</h4>
                        <ul className="space-y-4 text-sm text-black/50 dark:text-white/50 font-[family-name:var(--font-inter)]">
                            <li><Link href={isSignedIn ? "/presentation" : "/features/presentation"} className="hover:text-black dark:hover:text-white transition-colors">Presentations</Link></li>
                            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Templates</Link></li>
                            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Integrations</Link></li>
                            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Enterprise</Link></li>
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div>
                        <h4 className="text-black dark:text-white font-medium mb-6 font-[family-name:var(--font-inter-tight)]">Company</h4>
                        <ul className="space-y-4 text-sm text-black/50 dark:text-white/50 font-[family-name:var(--font-inter)]">
                            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">About</Link></li>
                            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link></li>
                            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-black dark:text-white font-medium mb-6 font-[family-name:var(--font-inter-tight)]">Updates</h4>
                        <p className="text-black/60 dark:text-white/40 text-sm mb-4 font-[family-name:var(--font-inter)]">Latest features and design tips.</p>
                        <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
                            <input
                                id="newsletter-email"
                                type="email"
                                placeholder="email@domain.com"
                                className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 flex-1 font-[family-name:var(--font-inter)]"
                                aria-label="Email for newsletter"
                            />
                            <button type="submit" className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl text-sm font-medium hover:scale-105 transition-transform active:scale-95 font-[family-name:var(--font-inter-tight)]">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                {/* Premium Big Text Highlight */}
                <div className="relative z-10 mb-20 pointer-events-none select-none">
                    <h2 className="text-[15vw] leading-none font-black tracking-[-0.05em] text-center uppercase text-primary  transition-all duration-700">
                        Verto AI
                    </h2>
                </div>

                {/* Bottom Bar */}
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center text-xs text-black/30 dark:text-white/30 pt-8 border-t border-black/5 dark:border-white/5 font-[family-name:var(--font-inter)]">
                    <div>&copy; 2025 Verto AI Inc. All rights reserved.</div>
                    <div className="flex gap-8 mt-4 md:mt-0">
                        <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Terms of Service</Link>
                        <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">Cookie Settings</Link>
                    </div>
                </div>
            {/* </div> */}
        </footer>
    );
}
