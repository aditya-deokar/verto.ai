"use client";

import { useState } from "react";
import RenderPage from "./RenderPage";
import { CreateModeSelector } from "@/components/global/mode-selector";
import { useRouter } from "next/navigation";

export function CreatePageClient() {
    const router = useRouter();
    const [showSelector, setShowSelector] = useState(true);

    if (!showSelector) {
        return <RenderPage />;
    }

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto px-4">
            <div className="flex flex-col items-start">
                <h1 className="text-2xl font-semibold dark:text-primary">
                    Create New Project
                </h1>
                <p className="text-base font-normal dark:text-secondary">
                    Choose what you want to build today
                </p>
            </div>

            <CreateModeSelector
                open={showSelector}
                onOpenChange={(open) => {
                    if (!open) setShowSelector(false); // If selector closes (Presentation selected), show RenderPage
                }}
            />
        </div>
    );
}
