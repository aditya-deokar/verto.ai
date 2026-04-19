import React from "react";
import { getUnifiedProjects } from "@/actions/unified-projects";
import { NotFound } from "@/components/global/not-found";
import { MobileProjectCard } from "@/components/MobileProjectCard";
import { MobileDesignsHeader } from "./_components/MobileDesignsHeader";
import { ProjectGalleryWrapper } from "@/components/global/projects/ProjectGalleryWrapper";

export default async function MobileDesignsPage() {
    const allProjects = await getUnifiedProjects('mobile');

    const mobileDesigns = allProjects.data || [];

    return (
        <div className="w-full flex flex-col gap-6 relative p-6">
            <MobileDesignsHeader count={mobileDesigns.length} />

            {mobileDesigns.length > 0 ? (
                <ProjectGalleryWrapper>
                    {mobileDesigns.map((project) => (
                        <MobileProjectCard
                            key={project.id}
                            project={{
                                ...project,
                                name: project.title,
                                frames: project.frames || [],
                            }}
                        />
                    ))}
                </ProjectGalleryWrapper>
            ) : (
                <NotFound />
            )}
        </div>
    );
}
