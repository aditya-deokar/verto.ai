"use client";

import { Button } from "@/components/ui/button";
import { Plus, Presentation } from "lucide-react";
import { useRouter } from "next/navigation";
import { LayoutSwitcher } from "@/components/global/layouts/LayoutSwitcher";

interface PresentationsHeaderProps {
    count: number;
}

export function PresentationsHeader({ count }: PresentationsHeaderProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col-reverse items-start w-full gap-6 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Presentation className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-2xl font-semibold dark:text-primary">
                        Presentations
                    </h1>
                </div>
                <p className="text-base font-normal dark:text-secondary text-muted-foreground">
                    {count} presentation{count !== 1 ? "s" : ""} • AI-powered slide decks
                </p>
            </div>

            <div className="flex items-center gap-4">
                <LayoutSwitcher />
                {/* <Button
                    size="lg"
                    className="rounded-lg font-semibold"
                    onClick={() => router.push("/create-page")}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Presentation
                </Button> */}
            </div>
        </div>
    );
}
