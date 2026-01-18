import { CanvasProvider } from "@/mobile-design/context/canvas-context";
import { MobileCanvas } from "./_components/MobileCanvas";
import { MobileHeader } from "./_components/MobileHeader";
import { Loader2 } from "lucide-react";
import { getMobileProject } from "@/mobile-design/actions/get-project";


export default async function MobileDesignPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    let project;
    try {
        const result = await getMobileProject(id);
        project = result.project;
    } catch (error) {
        return (
            <div className="h-screen w-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Project not found</h2>
                    <p className="text-muted-foreground">
                        The mobile design project you're looking for doesn't exist.
                    </p>
                </div>
            </div>
        );
    }

    const hasInitialData = project.frames?.length > 0;

    return (
        <div className="relative h-screen w-full flex flex-col overflow-hidden">
            <CanvasProvider
                initialFrames={project.frames || []}
                initialThemeId={project.theme}
                hasInitialData={hasInitialData}
                projectId={project.id}
            >
                <MobileHeader projectName={project.name} projectId={project.id} />
                <div className="flex flex-1 overflow-hidden">
                    <MobileCanvas
                        projectId={project.id}
                        projectName={project.name}
                        isPending={false}
                    />
                </div>
            </CanvasProvider>
        </div>
    );
}

