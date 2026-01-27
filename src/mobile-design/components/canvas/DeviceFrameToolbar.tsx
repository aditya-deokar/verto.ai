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
                `absolute -mt-2 flex items-center justify-between gap-2 rounded-full z-50`,
                isSelected
                    ? `left-1/2 -translate-x-1/2 border bg-card dark:bg-muted pl-2 py-1 shadow-sm min-w-[260px] h-[35px]`
                    : "w-[150px] h-auto left-10"
            )}
            style={{
                top: isSelected ? "-70px" : "-38px",
                transformOrigin: "center top",
                transform: `scale(${scale})`,
            }}
        >
            <div
                role="button"
                className="flex flex-1 cursor-grab items-center justify-start gap-1.5 active:cursor-grabbing h-full"
            >
                <GripVertical className="size-4 text-muted-foreground" />
                <div
                    className={cn(
                        `min-w-20 font-medium text-sm mx-px truncate mt-0.5`,
                        isSelected && "w-[100px]"
                    )}
                >
                    {title}
                </div>
            </div>

            {isSelected && (
                <>
                    <Separator orientation="vertical" className="h-5 bg-border" />
                    <div className="flex gap-0.5 justify-end pr-2 h-full">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        disabled={disabled}
                                        size="icon"
                                        variant="ghost"
                                        className="rounded-full h-6 w-6"
                                        onClick={onOpenHtmlDialog}
                                    >
                                        <CodeIcon className="size-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>View HTML</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        disabled={disabled || isDownloading}
                                        size="icon"
                                        className="rounded-full h-6 w-6"
                                        variant="ghost"
                                        onClick={onDownloadPng}
                                    >
                                        {isDownloading ? (
                                            <Loader2 className="size-3.5 animate-spin" />
                                        ) : (
                                            <DownloadIcon className="size-3.5" />
                                        )}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Download PNG</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <PopoverTrigger asChild>
                                            <Button
                                                disabled={disabled}
                                                size="icon"
                                                className="rounded-full h-6 w-6"
                                                variant="ghost"
                                            >
                                                {isRegenerating ? (
                                                    <Loader2 className="size-3.5 animate-spin" />
                                                ) : (
                                                    <Wand2 className="size-3.5" />
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>AI Regenerate</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <PopoverContent align="end" className="w-80 p-1 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Wand2 className="size-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Edit with AI..."
                                        value={promptValue}
                                        onChange={(e) => setPromptValue(e.target.value)}
                                        className="flex-1 border-0 shadow-none bg-transparent focus-visible:ring-0"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                handleRegenerate();
                                            }
                                        }}
                                    />
                                    <Button
                                        size="icon"
                                        className="h-7 w-7"
                                        disabled={!promptValue.trim() || isRegenerating}
                                        onClick={handleRegenerate}
                                    >
                                        {isRegenerating ? (
                                            <Loader2 className="size-3.5 animate-spin" />
                                        ) : (
                                            <Send className="size-4" />
                                        )}
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <DropdownMenu>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full h-6 w-6"
                                            >
                                                <MoreHorizontalIcon className="size-3.5" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>More options</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <DropdownMenuContent align="end" className="w-32 rounded-md p-0">
                                <DropdownMenuItem
                                    disabled={disabled || isDeleting}
                                    onClick={onDeleteFrame}
                                    className="cursor-pointer"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2Icon className="size-4" />
                                            Delete
                                        </>
                                    )}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </>
            )}
        </div>
    );
}
