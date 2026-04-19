"use client";

import { Button } from "@/components/ui/button";
import { DashboardProject } from "@/actions/unified-projects";
import { Presentation, Smartphone, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ProjectCard from "@/components/global/projects/ProjectCard";
import { MobileProjectCard } from "@/components/MobileProjectCard";
import Link from "next/link";

import { containerVariants, itemVariants } from "@/lib/constants";

interface DashboardHomeProps {
    projects: DashboardProject[];
    userName?: string;
    presentationCount: number;
    mobileDesignCount: number;
}

export function DashboardHome({
    projects,
    userName,
    presentationCount,
    mobileDesignCount,
}: DashboardHomeProps) {
    const router = useRouter();
    const recentProjects = projects.slice(0, 6);

    return (
        <motion.div
            className="space-y-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {/* Welcome Header */}
            <motion.div variants={itemVariants} className="space-y-2">
                <h1 className="text-3xl font-bold dark:text-primary">
                    Welcome back{userName ? `, ${userName}` : ""}! 👋
                </h1>
                <p className="text-muted-foreground">
                    You have {presentationCount} presentation{presentationCount !== 1 ? "s" : ""} and {mobileDesignCount} mobile design{mobileDesignCount !== 1 ? "s" : ""}
                </p>
            </motion.div>

            {/* Quick Create Cards */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Create Presentation Card */}
                <motion.div
                    whileHover={{ y: -4, transition: { duration: 0.4, ease: "easeOut" } }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative cursor-pointer overflow-hidden rounded-[32px] border border-black/[0.03] dark:border-white/[0.05] bg-white/80 dark:bg-black/40 backdrop-blur-xl hover:border-black/10 dark:hover:border-white/10 transition-all duration-500 ease-out shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] dark:hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)] h-[280px] flex flex-col"
                    onClick={() => router.push("/create-page")}
                >
                    {/* Apple-style Inner Highlight */}
                    <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-black/5 dark:ring-white/5 pointer-events-none z-10" />

                    {/* Hover Glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                    <div className="relative z-10 flex flex-col h-full p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="p-4 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                                <Presentation className="h-8 w-8 text-primary" />
                            </div>
                            <div className="h-10 w-10 rounded-full border border-black/5 dark:border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <ArrowRight className="h-5 w-5 text-primary -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                        </div>

                        <div className="mt-auto space-y-2">
                            <h3 className="text-2xl font-bold text-primary">Create Presentation</h3>
                            <p className="text-muted-foreground text-base leading-relaxed max-w-[90%]">
                                Craft stunning slides with Creative AI, Advanced AI, or start from scratch.
                            </p>
                        </div>
                    </div>
                </motion.div>


                {/* Create Mobile Design Card */}
                <motion.div
                    whileHover={{ y: -4, transition: { duration: 0.4, ease: "easeOut" } }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative cursor-pointer overflow-hidden rounded-[32px] border border-black/[0.03] dark:border-white/[0.05] bg-white/80 dark:bg-black/40 backdrop-blur-xl hover:border-black/10 dark:hover:border-white/10 transition-all duration-500 ease-out shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] dark:hover:shadow-[0_8px_40px_rgba(255,255,255,0.03)] h-[280px] flex flex-col"
                    onClick={() => router.push("/mobile-designs/create")}
                >
                    {/* Apple-style Inner Highlight */}
                    <div className="absolute inset-0 rounded-[32px] ring-1 ring-inset ring-black/5 dark:ring-white/5 pointer-events-none z-10" />

                    {/* Hover Glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-violet-500/5 via-transparent to-transparent pointer-events-none" />

                    <div className="relative z-10 flex flex-col h-full p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="p-4 rounded-2xl bg-violet-100/50 dark:bg-violet-900/20 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/30 transition-colors">
                                <Smartphone className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div className="h-10 w-10 rounded-full border border-black/5 dark:border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <ArrowRight className="h-5 w-5 text-violet-600 dark:text-violet-400 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                        </div>

                        <div className="mt-auto space-y-2">
                            <h3 className="text-2xl font-bold text-violet-600 dark:text-violet-400">Mobile Designs</h3>
                            <p className="text-muted-foreground text-base leading-relaxed max-w-[90%]">
                                Generate beautiful mobile app interfaces and prototypes with AI.
                            </p>
                        </div>
                    </div>
                </motion.div>

            </motion.div>

            {/* Recent Projects Section */}
            {recentProjects.length > 0 && (
                <motion.div variants={itemVariants} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold dark:text-primary">Recent Projects</h2>
                        <Link
                            href="/dashboard"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                        >
                            View All
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentProjects.map((project) =>
                            project.type === "MOBILE_DESIGN" ? (
                                <MobileProjectCard
                                    key={project.id}
                                    project={{
                                        ...project,
                                        name: project.title,
                                        frames: project.frames || [],
                                    }}
                                />
                            ) : (
                                <ProjectCard
                                    key={project.id}
                                    projectId={project.id}
                                    title={project.title}
                                    createdAt={project.createdAt.toString()}
                                    isDelete={false}
                                    slideData={project.slides}
                                    themeName={project.theme || "light"}
                                />
                            )
                        )}
                    </div>
                </motion.div>
            )}

            {/* Empty State */}
            {recentProjects.length === 0 && (
                <motion.div variants={itemVariants} className="text-center py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Sparkles className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                    <p className="text-muted-foreground mb-4">
                        Get started by creating your first presentation or mobile design
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
}
