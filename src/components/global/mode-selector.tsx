"use client";

import { formatDistanceToNow } from "date-fns";
import { Plus, Presentation, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useTheme } from "next-themes";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createMobileProject } from "@/mobile-design/actions/create-project";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CreateModeSelector({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const router = useRouter();
    const [mode, setMode] = useState<"SELECT" | "MOBILE">("SELECT");

    const handlePresentationSelect = () => {
        onOpenChange(false);
        // Determine where to go for regular PPT creation
        // Based on create-page/page.tsx, it renders RenderPage.
        // So we just stay on this page if it's embeded, BUT
        // this selector handles the "New Project" click.
        // If we are already on /create-page, we might want to just show the regular form.
        // Let's assume this component is used INSIDE /create-page or as a modal.
    };

    if (mode === "MOBILE") {
        return (
            <DashboardMobileCreationForm
                onBack={() => setMode("SELECT")}
                onClose={() => onOpenChange(false)}
            />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <Card
                className="p-6 cursor-pointer hover:border-primary transition-all flex flex-col items-center text-center gap-4 group"
                onClick={handlePresentationSelect}
            >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Presentation className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Presentation</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create AI-powered slide decks and presentations
                    </p>
                </div>
            </Card>

            <Card
                className="p-6 cursor-pointer hover:border-violet-500 transition-all flex flex-col items-center text-center gap-4 group"
                onClick={() => setMode("MOBILE")}
            >
                <div className="h-16 w-16 rounded-full bg-violet-100 dark:bg-violet-900/20 flex items-center justify-center group-hover:bg-violet-200 dark:group-hover:bg-violet-900/40 transition-colors">
                    <Smartphone className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-lg">Mobile App Design</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Generate mobile app interfaces and prototypes
                    </p>
                </div>
            </Card>
        </div>
    );
}

function DashboardMobileCreationForm({
    onBack,
    onClose,
}: {
    onBack: () => void;
    onClose: () => void;
}) {
    const router = useRouter();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<{ name: string; prompt: string }>();

    const [isPending, startTransition] = useTransition();

    const onSubmit = (data: { name: string; prompt: string }) => {
        startTransition(async () => {
            try {
                const res = await createMobileProject(data);
                if (res.project) {
                    toast.success("Mobile design project created!");
                    router.refresh();
                    router.push(`/mobile-design/${res.project.id}`);
                    onClose();
                }
            } catch (error) {
                toast.error("Failed to create project");
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
                    ← Back
                </Button>
                <h3 className="font-semibold">New Mobile App Design</h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Project Name</label>
                    <Input
                        placeholder="E.g., Fitness Tracker"
                        {...register("name", { required: "Name is required" })}
                    />
                    {errors.name && (
                        <span className="text-xs text-red-500">{errors.name.message}</span>
                    )}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                        placeholder="Describe your app features and style..."
                        rows={4}
                        {...register("prompt", { required: "Description is required" })}
                    />
                    {errors.prompt && (
                        <span className="text-xs text-red-500">{errors.prompt.message}</span>
                    )}
                </div>

                <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isSubmitting || isPending}>
                        {(isSubmitting || isPending) ? "Creating..." : "Create Project"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
