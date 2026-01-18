"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCanvas } from "@/mobile-design/context/canvas-context";
import { EditableProjectName } from "./EditableProjectName";
import { ExportDialog } from "./ExportDialog";
import { DeleteProjectButton } from "./DeleteProjectButton";

export function MobileHeader({
    projectName,
    projectId
}: {
    projectName: string;
    projectId: string;
}) {
    const { frames } = useCanvas();

    return (
        <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>

                <EditableProjectName projectId={projectId} initialName={projectName} />

                <div className="ml-auto flex items-center gap-2">
                    <ExportDialog projectName={projectName} frames={frames} />
                    <DeleteProjectButton projectId={projectId} projectName={projectName} />
                </div>
            </div>
        </header>
    );
}
