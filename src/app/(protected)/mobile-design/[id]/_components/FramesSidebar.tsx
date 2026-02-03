"use client";

import { X, Layers, RotateCw, Wand2, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvas } from "@/mobile-design/context/canvas-context";
import { cn } from "@/lib/utils";
import { FrameType } from "@/mobile-design/types/project";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { regenerateFrame } from "@/mobile-design/actions/regenerate-frame";
import { toast } from "sonner";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface FramesSidebarProps {
    onClose?: () => void;
    projectId: string;
}

export function FramesSidebar({ onClose, projectId }: FramesSidebarProps) {
    const { frames, selectedFrameId, setSelectedFrameId } = useCanvas();

    return (
        <div className="w-full h-full flex flex-col bg-background/50">
            <div className="p-4 border-b flex justify-between items-center bg-background/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-indigo-500" />
                    <h3 className="font-semibold text-sm">Screens ({frames.length})</h3>
                </div>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {frames.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                        <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center">
                            <Layers className="h-6 w-6 opacity-20" />
                        </div>
                        <p className="text-sm">No screens yet</p>
                    </div>
                ) : (
                    frames.map((frame, index) => (
                        <SidebarFrameItem
                            key={frame.id}
                            frame={frame}
                            index={index}
                            isSelected={selectedFrameId === frame.id}
                            onSelect={() => setSelectedFrameId(frame.id)}
                            projectId={projectId}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

function SidebarFrameItem({
    frame,
    index,
    isSelected,
    onSelect,
    projectId,
}: {
    frame: FrameType;
    index: number;
    isSelected: boolean;
    onSelect: () => void;
    projectId: string;
}) {
    const [isPending, startTransition] = useTransition();
    const [promptValue, setPromptValue] = useState("");
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const router = useRouter();

    const handleRegenerate = () => {
        if (!promptValue.trim()) return;

        startTransition(async () => {
            try {
                toast.success("Regenerating frame...");
                await regenerateFrame(frame.id, projectId, promptValue);
                setPromptValue("");
                setIsPopoverOpen(false);
                router.refresh();
            } catch (error) {
                toast.error("Failed to regenerate frame");
            }
        });
    };

    return (
        <div
            className={cn(
                "group relative w-full p-2.5 rounded-[16px] transition-all duration-200 border cursor-pointer hover:shadow-md",
                isSelected
                    ? "bg-background border-indigo-500/50 shadow-sm ring-1 ring-indigo-500/20"
                    : "bg-card/50 border-transparent hover:bg-background hover:border-border/50"
            )}
            onClick={onSelect}
        >
            <div className="flex gap-3">
                {/* Visual Thumbnail Placeholder */}
                <div className={cn(
                    "h-16 w-10 shrink-0 rounded-lg flex items-center justify-center border transition-colors",
                    isSelected
                        ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200/50 dark:border-indigo-800/50"
                        : "bg-muted/30 border-border/50"
                )}>
                    <span className="text-[10px] font-bold text-muted-foreground/50 group-hover:text-indigo-500/70 transition-colors">
                        {index + 1}
                    </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className={cn(
                        "font-medium text-sm truncate transition-colors",
                        isSelected ? "text-primary" : "text-foreground group-hover:text-foreground"
                    )}>
                        {frame.title || `Screen ${index + 1}`}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium opacity-70">
                        Mobile Frame
                    </p>
                </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 scale-95 group-hover:scale-100" onClick={(e) => e.stopPropagation()}>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7 rounded-lg shadow-sm bg-background/80 backdrop-blur border"
                            disabled={isPending}
                            title="Regenerate Screen"
                        >
                            {isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                            ) : (
                                <Wand2 className="h-3.5 w-3.5 text-muted-foreground hover:text-indigo-500 transition-colors" />
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-80 p-1.5 rounded-xl shadow-xl border-border/50 bg-background/95 backdrop-blur-xl" sideOffset={5}>
                        <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                            <Input
                                placeholder="Describe changes..."
                                value={promptValue}
                                onChange={(e) => setPromptValue(e.target.value)}
                                className="flex-1 border-0 shadow-none bg-transparent focus-visible:ring-0 h-9 text-sm"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleRegenerate();
                                }}
                                autoFocus
                            />
                            <Button
                                size="icon"
                                className="h-8 w-8 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                                disabled={!promptValue.trim() || isPending}
                                onClick={handleRegenerate}
                            >
                                {isPending ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                ) : (
                                    <Send className="size-3.5" />
                                )}
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
