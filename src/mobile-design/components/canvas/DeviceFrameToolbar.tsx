"use client";

import { cn } from "@/lib/utils";
import {
    CodeIcon,
    DownloadIcon,
    GripVertical,
    MoreHorizontalIcon,
    Trash2Icon,
    Wand2,
    Send,
} from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

type PropsType = {
    title: string;
    isSelected?: boolean;
    disabled?: boolean;
    isDownloading: boolean;
    scale?: number;
    isRegenerating?: boolean;
    isDeleting?: boolean;
    onOpenHtmlDialog: () => void;
    onDownloadPng?: () => void;
    onRegenerate?: (prompt: string) => void;
    onDeleteFrame?: () => void;
};

export function DeviceFrameToolbar({
    title,
    isSelected,
    disabled,
    scale = 1.7,
    isDownloading,
    isRegenerating = false,
    isDeleting = false,
    onOpenHtmlDialog,
    onDownloadPng,
    onRegenerate,
    onDeleteFrame,
}: PropsType) {
    const [promptValue, setPromptValue] = useState("");
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    const handleRegenerate = () => {
        if (promptValue.trim()) {
            onRegenerate?.(promptValue);
            setPromptValue("");
            setIsPopoverOpen(false);
        }
    };

    return (
        <div
            className={cn(
                "absolute -mt-2 flex items-center gap-1 z-50 transition-all duration-300 ease-out",
                isSelected
                    ? "left-1/2 -translate-x-1/2 bg-background/90 dark:bg-gray-900/90 backdrop-blur-xl border border-border/50 shadow-xl rounded-full p-1 pl-3 min-w-[280px] h-[42px] ring-1 ring-white/10"
                    : "left-6 bg-background/60 backdrop-blur-md border border-border/30 shadow-md rounded-full px-3 py-1.5 h-auto hover:bg-background/80"
            )}
            style={{
                top: isSelected ? "-80px" : "-40px",
                transformOrigin: "center bottom",
                transform: `scale(${scale})`,
            }}
        >
            <div
                role="button"
                className="flex flex-1 cursor-grab items-center justify-start gap-2 active:cursor-grabbing h-full group/drag"
            >
                <GripVertical className="size-4 text-muted-foreground/50 group-hover/drag:text-muted-foreground transition-colors" />
                <div
                    className={cn(
                        "font-medium text-sm truncate transition-all duration-300",
                        isSelected ? "max-w-[120px]" : "max-w-[100px]"
                    )}
                >
                    {title}
                </div>
            </div>

            {isSelected && (
                <>
                    <div className="h-4 w-px bg-border/50 mx-1" />

                    <div className="flex items-center gap-0.5 animate-in fade-in slide-in-from-left-2 duration-300">
                        <TooltipProvider delayDuration={300}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        disabled={disabled}
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-full h-8 w-8 hover:bg-muted/50 hover:text-foreground transition-colors"
                                        onClick={onOpenHtmlDialog}
                                    >
                                        <CodeIcon className="size-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">View Code</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider delayDuration={300}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        disabled={disabled || isDownloading}
                                        size="icon"
                                        className="rounded-full h-8 w-8 hover:bg-muted/50 hover:text-foreground transition-colors"
                                        variant="ghost"
                                        onClick={onDownloadPng}
                                    >
                                        {isDownloading ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <DownloadIcon className="size-4" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">Download Image</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <TooltipProvider delayDuration={300}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <PopoverTrigger asChild>
                                            <Button
                                                disabled={disabled}
                                                size="icon"
                                                className={cn(
                                                    "rounded-full h-8 w-8 transition-all duration-300",
                                                    isPopoverOpen ? "bg-primary/10 text-primary dark:bg-primary/20" : "hover:bg-muted/50 hover:text-foreground"
                                                )}
                                                variant="ghost"
                                            >
                                                {isRegenerating ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <Wand2 className="size-4" />
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="text-xs">AI Edit</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <PopoverContent align="end" className="w-80 p-1.5 rounded-xl shadow-xl border-border/50 bg-background/95 backdrop-blur-xl" sideOffset={15}>
                                <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
                                    <div className="h-8 w-8 flex items-center justify-center rounded-md bg-background shadow-sm">
                                        <Wand2 className="size-4 text-foreground" />
                                    </div>
                                    <Input
                                        placeholder="Describe changes..."
                                        value={promptValue}
                                        onChange={(e) => setPromptValue(e.target.value)}
                                        className="flex-1 border-0 shadow-none bg-transparent focus-visible:ring-0 h-9 text-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleRegenerate();
                                            }
                                        }}
                                        autoFocus
                                    />
                                    <Button
                                        size="icon"
                                        className="h-8 w-8 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                                        disabled={!promptValue.trim() || isRegenerating}
                                        onClick={handleRegenerate}
                                    >
                                        {isRegenerating ? (
                                            <Loader2 className="size-3.5 animate-spin" />
                                        ) : (
                                            <Send className="size-3.5" />
                                        )}
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="rounded-full h-8 w-8 hover:bg-muted/50 hover:text-red-500 transition-colors"
                                >
                                    <MoreHorizontalIcon className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 shadow-lg border-border/50 bg-background/95 backdrop-blur-xl">
                                <DropdownMenuItem
                                    disabled={disabled || isDeleting}
                                    onClick={onDeleteFrame}
                                    className="cursor-pointer rounded-lg text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="size-4 animate-spin mr-2" />
                                    ) : (
                                        <Trash2Icon className="size-4 mr-2" />
                                    )}
                                    Delete Frame
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </>
            )}
        </div>
    );
}
