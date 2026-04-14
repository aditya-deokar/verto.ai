"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
    return (
        <div className={cn("relative p-6 rounded-2xl border border-border bg-background/50 backdrop-blur-sm flex flex-col gap-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300", className)}>
            {/* Connector Line (Decorative) */}
            <div className="absolute -top-3 left-8 w-px h-6 bg-primary/20" />
            <div className="absolute -top-4 left-[29px] w-2 h-2 rounded-full bg-primary" />

            {isEditable && !isPreview ? (
                <>
                    <div className="inline-block">
                        <Input
                            value={year}
                            onChange={(e) => onChange?.("year", e.target.value)}
                            className="bg-primary/10 text-primary font-bold text-sm rounded-full px-3 py-1 w-20 text-center border-none shadow-none h-8"
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
                    <span className="bg-primary/10 text-primary font-bold text-sm rounded-full px-3 py-1 w-fit">
                        {year}
                    </span>
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </>
            )}
        </div>
    );
};

export default TimelineCard;
