"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useSlideStore } from "@/store/useSlideStore";
import { resolveThemeTokens } from "@/lib/themeUtils";

interface StatBoxProps {
    className?: string;
    icon?: string;
    value?: string;
    label?: string;
    onChange?: (field: "icon" | "value" | "label", val: string) => void;
    isPreview?: boolean;
    isEditable?: boolean;
}

const StatBox = ({
    className,
    icon = "📈",
    value = "150%",
    label = "Growth",
    onChange,
    isPreview,
    isEditable
}: StatBoxProps) => {
    const { currentTheme } = useSlideStore();
    const tokens = resolveThemeTokens(currentTheme);

    return (
        <div
            className={cn(
                "relative p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3 overflow-hidden transition-all duration-300 group",
                isPreview ? "" : "hover:shadow-xl hover:-translate-y-1",
                className
            )}
            style={{
                backgroundColor: tokens.surfaceColor,
                border: `1px solid ${currentTheme.accentColor}15`,
                borderRadius: tokens.borderRadius,
                boxShadow: tokens.shadow,
            }}
        >
            {/* Subtle radial gradient overlay behind value */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at center, ${currentTheme.accentColor}08, transparent 70%)`,
                }}
            />

            {isEditable && !isPreview ? (
                <>
                    <Input
                        value={icon}
                        onChange={(e) => onChange?.("icon", e.target.value)}
                        className="text-4xl w-16 text-center border-none bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-none p-1 rounded-lg h-auto focus-visible:ring-1 focus-visible:ring-primary/50"
                    />

                    {/* Decorative dotted separator */}
                    <div
                        className="w-8 h-px my-1"
                        style={{
                            backgroundImage: `repeating-linear-gradient(to right, ${currentTheme.accentColor}40, ${currentTheme.accentColor}40 3px, transparent 3px, transparent 6px)`,
                        }}
                    />

                    <Input
                        value={value}
                        onChange={(e) => onChange?.("value", e.target.value)}
                        className="text-3xl font-bold text-center border-none bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-none p-1 rounded-lg h-auto focus-visible:ring-1 focus-visible:ring-primary/50 text-foreground"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                    />
                    <Input
                        value={label}
                        onChange={(e) => onChange?.("label", e.target.value)}
                        className="text-sm text-muted-foreground text-center border-none bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-none p-1 rounded-lg h-auto focus-visible:ring-1 focus-visible:ring-primary/50 font-medium uppercase tracking-[0.15em] mt-1"
                    />
                </>
            ) : (
                <>
                    <div className="text-4xl mb-1 relative z-10">{icon}</div>

                    {/* Decorative dotted separator */}
                    <div
                        className="w-8 h-px"
                        style={{
                            backgroundImage: `repeating-linear-gradient(to right, ${currentTheme.accentColor}40, ${currentTheme.accentColor}40 3px, transparent 3px, transparent 6px)`,
                        }}
                    />

                    <div
                        className="text-3xl font-bold relative z-10"
                        style={{
                            color: currentTheme.accentColor,
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {value}
                    </div>
                    <div
                        className="text-sm font-medium uppercase relative z-10"
                        style={{
                            letterSpacing: '0.15em',
                            color: tokens.mutedColor,
                        }}
                    >
                        {label}
                    </div>
                </>
            )}
        </div>
    );
};

export default StatBox;
