"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Smartphone, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { toast } from "sonner";
import { createMobileProject } from "@/mobile-design/actions/create-project";

interface FormData {
    name: string;
    prompt: string;
}

export default function CreateMobileDesignPage() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<FormData>();

    const onSubmit = (data: FormData) => {
        startTransition(async () => {
            try {
                const res = await createMobileProject(data);
                if (res.project) {
                    toast.success("Mobile design project created!");
                    router.refresh();
                    router.push(`/mobile-design/${res.project.id}`);
                }
            } catch (error) {
                toast.error("Failed to create project");
            }
        });
    };

    return (
        <div className="w-full max-w-2xl mx-auto py-8 px-4">
            {/* Back Button */}
            <Button
                variant="ghost"
                size="sm"
                className="mb-6 -ml-2"
                onClick={() => router.push("/mobile-designs")}
            >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Mobile Designs
            </Button>

            <Card className="border-violet-200 dark:border-violet-900/50">
                <CardHeader className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                            <Smartphone className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Create Mobile Design</CardTitle>
                            <CardDescription>
                                Generate AI-powered mobile app interfaces and prototypes
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project Name</label>
                            <Input
                                placeholder="E.g., Fitness Tracker App"
                                {...register("name", { required: "Name is required" })}
                                className="h-12"
                            />
                            {errors.name && (
                                <span className="text-xs text-red-500">{errors.name.message}</span>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">App Description</label>
                            <Textarea
                                placeholder="Describe your app features, target users, and desired style...&#10;&#10;Example: A minimalist fitness tracking app with dark mode, featuring workout logging, progress charts, and a clean dashboard."
                                rows={6}
                                {...register("prompt", { required: "Description is required" })}
                                className="resize-none"
                            />
                            {errors.prompt && (
                                <span className="text-xs text-red-500">{errors.prompt.message}</span>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/mobile-designs")}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || isPending}
                                className="bg-violet-600 hover:bg-violet-700"
                            >
                                {isSubmitting || isPending ? (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2 animate-pulse" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Generate Design
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
