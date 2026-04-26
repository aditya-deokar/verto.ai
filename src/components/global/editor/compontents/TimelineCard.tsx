"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSlideStore } from "@/store/useSlideStore";
import { resolveThemeTokens } from "@/lib/themeUtils";

interface TimelineCardProps {
    className?: string;
    year?: string;
    title?: string;
    description?: string;
    onChange?: (field: "year" | "title" | "description", val: string) => void;
    isPreview?: boolean;
    isEditable?: boolean;
}

const TimelineCard = ({
    className,
    year = "2024",
    title = "Milestone",
    description = "Description of the achievement",
    onChange,
    isPreview,
    isEditable
}: TimelineCardProps) => {
    const { currentTheme } = useSlideStore();
    const tokens = resolveThemeTokens(currentTheme);

    return (
        <div
            className={cn(
                "relative p-6 rounded-2xl flex flex-col gap-3 transition-all duration-300 overflow-hidden",
                !isPreview && "hover:shadow-lg hover:-translate-y-1",
                className
            )}
            style={{
                backgroundColor: tokens.surfaceColor,
                border: `1px solid ${currentTheme.accentColor}15`,
                borderRadius: tokens.borderRadius,
                boxShadow: tokens.shadow,
            }}
        >
            {/* Left accent border */}
            <div
                className="absolute left-0 top-0 w-[3px] h-full rounded-l-2xl"
                style={{
                    background: `linear-gradient(to bottom, ${currentTheme.accentColor}, ${currentTheme.accentColor}40, transparent)`,
                }}
            />

            {/* Connector dot at top */}
            <div
                className="absolute -top-[5px] left-6 w-2.5 h-2.5 rounded-full shadow-sm"
                style={{
                    backgroundColor: currentTheme.accentColor,
                    boxShadow: `0 0 0 3px ${currentTheme.accentColor}20`,
                }}
            />
            {/* Connector line */}
            <div
                className="absolute -top-3 left-[29px] w-px h-3"
                style={{
                    backgroundColor: `${currentTheme.accentColor}30`,
                }}
            />

            {isEditable && !isPreview ? (
                <>
                    <div className="inline-block">
                        <Input
                            value={year}
                            onChange={(e) => onChange?.("year", e.target.value)}
                            className="font-bold text-sm rounded-full px-3 py-1 w-20 text-center border-none shadow-none h-8"
                            style={{
                                background: `linear-gradient(135deg, ${currentTheme.accentColor}20, ${currentTheme.accentColor}10)`,
                                color: currentTheme.accentColor,
                            }}
                        />
                    </div>

                    <Input
                        value={title}
                        onChange={(e) => onChange?.("title", e.target.value)}
                        className="text-lg font-semibold border-none bg-transparent shadow-none p-0 h-auto focus-visible:ring-0"
                    />
                    <Textarea
                        value={description}
                        onChange={(e) => onChange?.("description", e.target.value)}
                        className="text-sm text-muted-foreground border-none bg-transparent shadow-none p-0 min-h-[60px] resize-none focus-visible:ring-0 leading-relaxed"
                    />
                </>
            ) : (
                <>
                    <span
                        className="font-bold text-sm rounded-full px-3 py-1 w-fit"
                        style={{
                            background: `linear-gradient(135deg, ${currentTheme.accentColor}20, ${currentTheme.accentColor}10)`,
                            color: currentTheme.accentColor,
                        }}
                    >
                        {year}
                    </span>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p
                        className="text-sm leading-relaxed"
                        style={{ color: tokens.mutedColor }}
                    >
                        {description}
                    </p>
                </>
            )}
        </div>
    );
};

export default TimelineCard;
