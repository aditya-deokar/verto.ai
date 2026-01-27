"use client";

import { Button } from "@/components/ui/button";
import { DashboardProject } from "@/actions/unified-projects";
import { Presentation, Smartphone, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ProjectCard from "@/components/global/projects/ProjectCard";
import { MobileProjectCard } from "@/components/MobileProjectCard";
import Link from "next/link";
import { ShineBorder } from "@/components/global/ui/shine-border";
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
                    whileHover={{
                        // scale: 1.02,
                        transition: { duration: 0.01 },
                    }}
                    className="group rounded-xl p-px transition-all duration-300 ease-in-out hover:bg-vivid-gradient border border-border/50"
                    onClick={() => router.push("/create-page")}
                >
                    <ShineBorder className="w-full h-full" duration={14} borderClassName="rounded-xl">
                        <div className="w-full h-full p-6 flex flex-col gap-y-4 bg-background rounded-xl relative overflow-hidden group-hover:bg-background/90 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <Presentation className="h-8 w-8 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-primary text-xl font-bold">Presentations</p>
                                    <p className="text-sm text-muted-foreground">AI-powered slide decks</p>
                                </div>
                            </div>

                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Create stunning presentations with Creative AI, Advanced AI, or start from scratch.
                            </p>

                            <div className="pt-2 mt-auto">
                                <Button className="w-full group-hover:bg-primary transition-colors font-semibold">
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Create Presentation
                                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </ShineBorder>
                </motion.div>


                {/* Create Mobile Design Card */}
                <motion.div
                    whileHover={{
                        // scale: 1.02,
                        transition: { duration: 0.01 },
                    }}
                    className="group rounded-xl p-px transition-all duration-300 ease-in-out hover:bg-vivid-gradient border border-border/50"
                    onClick={() => router.push("/mobile-designs/create")}
                >
                    <ShineBorder className="w-full h-full" duration={14} borderClassName="rounded-xl">
                        <div className="w-full h-full p-6 flex flex-col gap-y-4 bg-background rounded-xl relative overflow-hidden group-hover:bg-background/90 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/20 group-hover:bg-violet-200 dark:group-hover:bg-violet-900/40 transition-colors">
                                    <Smartphone className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xl font-bold text-violet-600 dark:text-violet-400">Mobile Designs</p>
                                    <p className="text-sm text-muted-foreground">AI-generated app interfaces</p>
                                </div>
                            </div>

                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Generate beautiful mobile app interfaces and prototypes with AI assistance.
                            </p>

                            <div className="pt-2 mt-auto">
                                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold">
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Create Mobile Design
                                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                        </div>
                    </ShineBorder>
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
