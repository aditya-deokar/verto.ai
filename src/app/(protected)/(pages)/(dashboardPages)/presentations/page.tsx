import React from "react";
import { getUnifiedProjects } from "@/actions/unified-projects";
import { NotFound } from "@/components/global/not-found";
import ProjectCard from "@/components/global/projects/ProjectCard";
import { motion } from "framer-motion";
import { PresentationsHeader } from "./_components/PresentationsHeader";

export default async function PresentationsPage() {
    const allProjects = await getUnifiedProjects('presentation');

    const presentations = allProjects.data || [];

    return (
        <div className="w-full flex flex-col gap-6 relative">
            <PresentationsHeader count={presentations.length} />

            {presentations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
                    {presentations.map((project, index) => (
                        <ProjectCard
                            key={project.id}
                            projectId={project.id}
                            title={project.title}
                            createdAt={project.createdAt.toString()}
                            isDelete={false}
                            slideData={project.slides}
                            themeName={project.theme || "light"}
                        />
                    ))}
                </div>
            ) : (
                <NotFound />
            )}
        </div>
    );
}
