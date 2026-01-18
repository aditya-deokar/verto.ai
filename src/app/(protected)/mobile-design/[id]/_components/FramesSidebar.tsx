"use client";

import { X, Layers, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvas } from "@/mobile-design/context/canvas-context";
import { cn } from "@/lib/utils";
import { FrameType } from "@/mobile-design/types/project";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { regenerateFrame } from "@/mobile-design/actions/regenerate-frame";
import { toast } from "sonner";

interface FramesSidebarProps {
    frames: FrameType[];
    onClose: () => void;
    projectId: string;
}

export function FramesSidebar({ frames, onClose, projectId }: FramesSidebarProps) {
    const { selectedFrameId, setSelectedFrameId } = useCanvas();
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleRegenerate = (frameId: string) => {
        startTransition(async () => {
            try {
                toast.success("Regenerating frame...");
                await regenerateFrame(frameId, projectId);
                router.refresh();
            } catch (error) {
                toast.error("Failed to regenerate frame");
            }
        });
    };

    return (
        <div className="absolute left-0 top-0 bottom-0 w-72 bg-background border-r z-10 flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    <h3 className="font-semibold">Screens ({frames.length})</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {frames.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        No screens yet
                    </div>
                ) : (
                    frames.map((frame, index) => (
                        <div
                            key={frame.id}
                            className={cn(
                                "w-full p-3 rounded-lg border transition-all",
                                selectedFrameId === frame.id
                                    ? "bg-primary/10 border-primary"
                                    : "border-transparent hover:border-border"
                            )}
                        >
                            <button
                                onClick={() => setSelectedFrameId(frame.id)}
                                className="w-full text-left"
                            >
                                <div className="font-medium text-sm">{frame.title}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    Screen {index + 1}
                                </div>
                            </button>
                            <div className="mt-2 pt-2 border-t flex justify-end">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRegenerate(frame.id);
                                    }}
                                    disabled={isPending}
                                    className="h-7 px-2"
                                >
                                    <RotateCw className={cn(
                                        "h-3 w-3 mr-1",
                                        isPending && "animate-spin"
                                    )} />
                                    <span className="text-xs">Regenerate</span>
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
