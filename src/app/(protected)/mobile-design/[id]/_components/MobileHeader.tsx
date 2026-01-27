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
        <header className="w-full h-full flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>

                <EditableProjectName projectId={projectId} initialName={projectName} />
            </div>

            <div className="flex items-center gap-2">
                <ExportDialog projectName={projectName} frames={frames} />
                <DeleteProjectButton projectId={projectId} projectName={projectName} />
            </div>
        </header>
    );
}
