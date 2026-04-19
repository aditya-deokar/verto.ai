"use client";

import { Button } from "@/components/ui/button";
import { Plus, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { LayoutSwitcher } from "@/components/global/layouts/LayoutSwitcher";

interface MobileDesignsHeaderProps {
    count: number;
}

export function MobileDesignsHeader({ count }: MobileDesignsHeaderProps) {
    const router = useRouter();

    return (
        <div className="flex flex-col-reverse items-start w-full gap-6 sm:flex-row sm:justify-between sm:items-center">
            <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/20">
                        <Smartphone className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h1 className="text-2xl font-semibold dark:text-primary">
                        Mobile Designs
                    </h1>
                </div>
                <p className="text-base font-normal dark:text-secondary text-muted-foreground">
                    {count} design{count !== 1 ? "s" : ""} • AI-generated mobile app interfaces
                </p>
            </div>

            <div className="flex items-center gap-4">
                <LayoutSwitcher />
                {/* <Button
                    size="lg"
                    className="rounded-lg font-semibold bg-violet-600 hover:bg-violet-700"
                    onClick={() => router.push("/mobile-designs/create")}
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Mobile Design
                </Button> */}
            </div>
        </div>
    );
}
