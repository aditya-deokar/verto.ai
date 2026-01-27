"use client";

import { cn } from "@/lib/utils";
import { useCanvas } from "@/mobile-design/context/canvas-context";

function parseThemeColors(style?: string): { primary: string; accent: string } {
    if (!style) return { primary: "#3b82f6", accent: "#8b5cf6" };

    const primaryMatch = style.match(/--primary:\s*([^;]+)/);
    const accentMatch = style.match(/--accent:\s*([^;]+)/);

    return {
        primary: primaryMatch?.[1]?.trim() || "#3b82f6",
        accent: accentMatch?.[1]?.trim() || "#8b5cf6",
    };
}

interface ThemeSelectorProps {
    onClose?: () => void;
}

export function ThemeSelector({ onClose }: ThemeSelectorProps) {
    const { themes, theme: currentTheme, setTheme } = useCanvas();

    return (
        <div className="p-4 max-h-[400px] overflow-y-auto">
            <h4 className="font-semibold text-sm mb-3">Choose Theme</h4>
            <div className="grid grid-cols-4 gap-3">
                {themes.map((theme) => {
                    const colors = parseThemeColors(theme.style);
                    const isSelected = currentTheme?.id === theme.id;

                    return (
                        <button
                            key={theme.id}
                            onClick={() => {
                                setTheme(theme.id);
                                onClose?.();
                            }}
                            className={cn(
                                "group relative flex flex-col items-center gap-2 p-2 rounded-lg transition-all",
                                isSelected
                                    ? "bg-primary/10 ring-2 ring-primary"
                                    : "hover:bg-muted"
                            )}
                        >
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full shadow-md transition-transform",
                                    "group-hover:scale-110"
                                )}
                                style={{
                                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                                }}
                            />
                            <span className="text-xs font-medium truncate max-w-full">
                                {theme.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
