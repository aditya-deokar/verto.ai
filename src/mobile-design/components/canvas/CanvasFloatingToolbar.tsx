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
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
            <div className="flex items-center gap-2 p-1.5 bg-background/80 dark:bg-gray-900/80 backdrop-blur-xl border border-border/50 rounded-full shadow-2xl ring-1 ring-white/10">

                {/* AI Generate Button - Prominent */}
                <Popover open={promptOpen} onOpenChange={setPromptOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            size="sm"
                            className="relative h-9 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-black/5 transition-all duration-300 hover:scale-105 overflow-hidden group/ai-btn"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/ai-btn:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
                            <Wand2 className="size-4 mr-2 group-hover/ai-btn:rotate-12 transition-transform duration-300" />
                            <span className="font-medium relative z-10">Design AI</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-3 rounded-2xl shadow-xl border-border/50 bg-background/95 backdrop-blur-xl mb-2" side="top" sideOffset={10}>
                        <Textarea
                            placeholder="Describe the screens you want to generate..."
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                            className="min-h-[100px] resize-none bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
                        />
                        <Button
                            disabled={isGenerating || !promptText.trim()}
                            className="mt-3 w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={handleAIGenerate}
                        >
                            {isGenerating ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                "Generate Screens"
                            )}
                        </Button>
                    </PopoverContent>
                </Popover>

                <Separator orientation="vertical" className="h-6 mx-1 bg-border/50" />

                {/* Theme Selector */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" className="h-9 rounded-full px-3 gap-2 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors group">
                            <Palette className="size-4 group-hover:text-foreground transition-colors" />
                            <div className="flex -space-x-1.5">
                                {themes.slice(0, 3).map((theme, index) => {
                                    const colors = parseThemeColors(theme.style);
                                    return (
                                        <div
                                            key={index}
                                            className="w-4 h-4 rounded-full ring-1 ring-background shadow-sm"
                                            style={{
                                                background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                            <ChevronDown className="size-3 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 rounded-xl shadow-xl border-border/50 w-auto mb-2" side="top" sideOffset={10}>
                        <ThemeSelector />
                    </PopoverContent>
                </Popover>

                <Separator orientation="vertical" className="h-6 mx-1 bg-border/50" />

                {/* Actions Group */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                        disabled={isScreenshotting}
                        onClick={onScreenshot}
                        title="Take Screenshot"
                    >
                        {isScreenshotting ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Camera className="size-4" />
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-3 rounded-full hover:bg-emerald-500/10 hover:text-emerald-600 text-muted-foreground transition-colors"
                        onClick={handleSaveTheme}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <Save className="size-4" />
                                <span className="text-sm font-medium">Save</span>
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
