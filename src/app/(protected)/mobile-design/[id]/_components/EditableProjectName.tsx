"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { updateMobileProject } from "@/mobile-design/actions/update-project";
import { toast } from "sonner";

export function EditableProjectName({
    projectId,
    initialName
}: {
    projectId: string;
    initialName: string;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(initialName);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        if (name.trim() && name !== initialName) {
            startTransition(async () => {
                try {
                    await updateMobileProject(projectId, { name: name.trim() });
                    toast.success("Project name updated");
                    router.refresh();
                    setIsEditing(false);
                } catch (error) {
                    toast.error("Failed to update name");
                    setName(initialName);
                }
            });
        } else {
            setName(initialName);
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setName(initialName);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <Input
                    ref={inputRef}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSave();
                        if (e.key === "Escape") handleCancel();
                    }}
                    onBlur={handleSave}
                    className="h-8 max-w-xs"
                />
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleSave}
                    disabled={isPending}
                    className="h-8 w-8"
                >
                    <Check className="h-4 w-4" />
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleCancel}
                    className="h-8 w-8"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{name}</h1>
            <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8"
            >
                <Pencil className="h-4 w-4" />
            </Button>
        </div>
    );
}
