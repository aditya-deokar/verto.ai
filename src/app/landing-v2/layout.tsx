
import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const interTight = Inter_Tight({ subsets: ["latin"], variable: "--font-inter-tight" });

export const metadata: Metadata = {
    title: "Verto AI - Craft Brilliance",
    description: "Transform raw ideas into professional presentations instantly.",
};

export default function LandingV2Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className={`min-h-screen bg-white dark:bg-[#050505] text-black dark:text-white ${inter.variable} ${interTight.variable} font-sans selection:bg-black/10 dark:selection:bg-white/20 transition-colors duration-500`}>
            {children}
        </div>
    );
}
