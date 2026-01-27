import { CanvasProvider } from "@/mobile-design/context/canvas-context";
import { MobileCanvas } from "./_components/MobileCanvas";
import { MobileHeader } from "./_components/MobileHeader";
import { FramesSidebar } from "./_components/FramesSidebar";
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
        <div className='h-screen bg-secondary/10 p-2 overflow-hidden flex flex-col gap-2'>
            <CanvasProvider
                initialFrames={project.frames || []}
                initialThemeId={project.theme ?? undefined}
                hasInitialData={hasInitialData}
                projectId={project.id}
            >
                {/* Floating Navbar */}
                <div className='h-14 rounded-xl bg-background/80 backdrop-blur-md shadow-sm border mx-auto w-full max-w-[calc(100%-1rem)] z-50 overflow-hidden'>
                    <MobileHeader projectName={project.name} projectId={project.id} />
                </div>

                <div className='flex-1 flex gap-2 min-h-0 w-full max-w-[calc(100%-1rem)] mx-auto font-sans z-0'>
                    {/* Floating Left Sidebar */}
                    <div className='w-80 h-full rounded-xl bg-background/80 backdrop-blur-md shadow-sm border overflow-hidden'>
                        <FramesSidebar projectId={project.id} />
                    </div>

                    {/* Main Canvas Area */}
                    <div className='flex-1 h-full rounded-xl bg-muted/30 border overflow-hidden relative shadow-inner'>
                        <MobileCanvas
                            projectId={project.id}
                            projectName={project.name}
                            isPending={false}
                        />
                    </div>
                </div>
            </CanvasProvider>
        </div>
    );
}
