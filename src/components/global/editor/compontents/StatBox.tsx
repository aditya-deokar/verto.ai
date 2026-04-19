"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

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
    return (
        <div className={cn("p-6 rounded-3xl border border-border/50 bg-background/50 backdrop-blur-xl flex flex-col items-center justify-center text-center gap-2 hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 group", className)}>
            {isEditable && !isPreview ? (
                <>
                    <Input
                        value={icon}
                        onChange={(e) => onChange?.("icon", e.target.value)}
                        className="text-4xl w-16 text-center border-none bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-none p-1 rounded-lg h-auto focus-visible:ring-1 focus-visible:ring-primary/50"
                    />
                    <Input
                        value={value}
                        onChange={(e) => onChange?.("value", e.target.value)}
                        className="text-3xl font-bold text-center border-none bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-none p-1 rounded-lg h-auto focus-visible:ring-1 focus-visible:ring-primary/50 text-foreground"
                    />
                    <Input
                        value={label}
                        onChange={(e) => onChange?.("label", e.target.value)}
                        className="text-sm text-muted-foreground text-center border-none bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors shadow-none p-1 rounded-lg h-auto focus-visible:ring-1 focus-visible:ring-primary/50 font-medium uppercase tracking-wider mt-1"
                    />
                </>
            ) : (
                <>
                    <div className="text-4xl mb-2">{icon}</div>
                    <div className="text-3xl font-bold text-primary">{value}</div>
                    <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
                </>
            )}
        </div>
    );
};

export default StatBox;
