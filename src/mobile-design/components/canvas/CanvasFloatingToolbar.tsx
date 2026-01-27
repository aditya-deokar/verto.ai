"use client";

import { Camera, ChevronDown, Palette, Save, Wand2, Loader2 } from "lucide-react";
import { useCanvas } from "@/mobile-design/context/canvas-context";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useState, useTransition } from "react";
import { ThemeSelector } from "./ThemeSelector";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateScreens } from "@/mobile-design/actions/generate-screens";
import { updateProjectTheme } from "@/mobile-design/actions/update-project";
import { toast } from "sonner";

function parseThemeColors(style?: string): { primary: string; accent: string } {
    if (!style) return { primary: "#3b82f6", accent: "#8b5cf6" };

    const primaryMatch = style.match(/--primary:\s*([^;]+)/);
    const accentMatch = style.match(/--accent:\s*([^;]+)/);

    return {
        primary: primaryMatch?.[1]?.trim() || "#3b82f6",
        accent: accentMatch?.[1]?.trim() || "#8b5cf6",
    };
}

interface CanvasFloatingToolbarProps {
    projectId: string;
    isScreenshotting?: boolean;
    onScreenshot?: () => void;
}

export function CanvasFloatingToolbar({
    projectId,
    isScreenshotting = false,
    onScreenshot,
}: CanvasFloatingToolbarProps) {
    const { themes, theme: currentTheme, setTheme, setLoadingStatus } = useCanvas();
    const [promptText, setPromptText] = useState<string>("");
    const [isGenerating, startGenerating] = useTransition();
    const [isSaving, startSaving] = useTransition();
    const [promptOpen, setPromptOpen] = useState(false);

    const handleAIGenerate = () => {
        if (!promptText.trim()) return;

        startGenerating(async () => {
            try {
                setLoadingStatus("running");
                await generateScreens(projectId, promptText, currentTheme?.id);
                setPromptText("");
                setPromptOpen(false);
            } catch (error) {
                toast.error("Failed to generate screens");
                setLoadingStatus(null);
            }
        });
    };

    const handleSaveTheme = () => {
        if (!currentTheme) return;

        startSaving(async () => {
            try {
                await updateProjectTheme(projectId, currentTheme.id);
                toast.success("Theme saved");
            } catch (error) {
                toast.error("Failed to save theme");
            }
        });
    };

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
            <div className="w-full max-w-2xl bg-background dark:bg-gray-950 rounded-full shadow-xl border">
                <div className="flex flex-row items-center gap-2 px-3">
                    {/* AI Generate Button */}
                    <Popover open={promptOpen} onOpenChange={setPromptOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                size="sm"
                                className="px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-purple-200/50 cursor-pointer"
                            >
                                <Wand2 className="size-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-2 rounded-xl shadow-lg border mt-1">
                            <Textarea
                                placeholder="Describe the screens you want to generate..."
                                value={promptText}
                                onChange={(e) => setPromptText(e.target.value)}
                                className="min-h-[100px] ring-1 ring-purple-500 rounded-xl shadow-none border-muted resize-none"
                            />
                            <Button
                                disabled={isGenerating || !promptText.trim()}
                                className="mt-2 w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl shadow-lg shadow-purple-200/50 cursor-pointer"
                                onClick={handleAIGenerate}
                            >
                                {isGenerating ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <>Design</>
                                )}
                            </Button>
                        </PopoverContent>
                    </Popover>

                    {/* Theme Selector */}
                    <Popover>
                        <PopoverTrigger>
                            <div className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/50 rounded-full transition-colors">
                                <Palette className="size-4" />
                                <div className="flex gap-1.5">
                                    {themes.slice(0, 4).map((theme, index) => {
                                        const colors = parseThemeColors(theme.style);
                                        return (
                                            <div
                                                role="button"
                                                key={index}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setTheme(theme.id);
                                                }}
                                                className={cn(
                                                    `w-6 h-6 rounded-full cursor-pointer transition-all`,
                                                    currentTheme?.id === theme.id && "ring-2 ring-offset-1 ring-primary"
                                                )}
                                                style={{
                                                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    +{Math.max(0, themes.length - 4)} more
                                    <ChevronDown className="size-4" />
                                </div>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="p-0 rounded-xl shadow border w-auto">
                            <ThemeSelector />
                        </PopoverContent>
                    </Popover>

                    {/* Divider */}
                    <Separator orientation="vertical" className="h-4" />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full cursor-pointer h-8 w-8"
                            disabled={isScreenshotting}
                            onClick={onScreenshot}
                        >
                            {isScreenshotting ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Camera className="size-4" />
                            )}
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="rounded-full cursor-pointer"
                            onClick={handleSaveTheme}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    Save
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
