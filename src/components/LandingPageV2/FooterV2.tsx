
import Link from "next/link";
import { Twitter, Linkedin, Github, DiscIcon as Discord } from "lucide-react";

export default function FooterV2() {
    return (
        <footer className="bg-[#050505] border-t border-white/5 pt-24 pb-12 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-24 mb-24">

                {/* Brand */}
                <div className="col-span-1 md:col-span-1">
                    <Link href="/landing-v2" className="flex items-center gap-2 mb-6">
                        <div className="w-6 h-6 rounded bg-linear-to-br from-[#F55C7A] to-[#F6BC66]" />
                        <span className="text-white font-bold tracking-widest text-sm">VERTO AI</span>
                    </Link>
                    <p className="text-white/40 text-sm leading-relaxed mb-6">
                        The AI workspace that turns your thoughts into broadcast-quality presentations.
                    </p>
                    <div className="flex gap-4">
                        <Link href="#" className="text-white/40 hover:text-white transition-colors"><Twitter size={20} /></Link>
                        <Link href="#" className="text-white/40 hover:text-white transition-colors"><Linkedin size={20} /></Link>
                        <Link href="#" className="text-white/40 hover:text-white transition-colors"><Discord size={20} /></Link>
                        <Link href="#" className="text-white/40 hover:text-white transition-colors"><Github size={20} /></Link>
                    </div>
                </div>

                {/* Links Column 1 */}
                <div>
                    <h4 className="text-white font-medium mb-6">Product</h4>
                    <ul className="space-y-4 text-sm text-white/50">
                        <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Templates</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Integrations</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Enterprise</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Changelog</Link></li>
                    </ul>
                </div>

                {/* Links Column 2 */}
                <div>
                    <h4 className="text-white font-medium mb-6">Company</h4>
                    <ul className="space-y-4 text-sm text-white/50">
                        <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Legal</Link></li>
                        <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h4 className="text-white font-medium mb-6">Updates</h4>
                    <p className="text-white/40 text-sm mb-4">Latest features and design tips.</p>
                    <div className="flex gap-2">
                        <input
                            type="email"
                            placeholder="email@domain.com"
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 flex-1"
                        />
                        <button className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-white/30 pt-8 border-t border-white/5">
                <div>&copy; 2025 Verto AI Inc. All rights reserved.</div>
                <div className="flex gap-8 mt-4 md:mt-0">
                    <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    <Link href="#" className="hover:text-white transition-colors">Cookie Settings</Link>
                </div>
            </div>
        </footer>
    );
}
