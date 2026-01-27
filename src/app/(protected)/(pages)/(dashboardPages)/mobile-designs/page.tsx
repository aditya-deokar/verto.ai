import React from "react";
import { getUnifiedProjects } from "@/actions/unified-projects";
import { NotFound } from "@/components/global/not-found";
import { MobileProjectCard } from "@/components/MobileProjectCard";
import { MobileDesignsHeader } from "./_components/MobileDesignsHeader";

export default async function MobileDesignsPage() {
    const allProjects = await getUnifiedProjects('mobile');

    const mobileDesigns = allProjects.data || [];

    return (
        <div className="w-full flex flex-col gap-6 relative">
            <MobileDesignsHeader count={mobileDesigns.length} />

            {mobileDesigns.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
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
                </div>
            ) : (
                <NotFound />
            )}
        </div>
    );
}
