"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface HtmlDialogProps {
    html: string;
    title?: string;
    theme_style?: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function HtmlDialog({
    html,
    title = "Screen",
    open,
    onOpenChange,
}: HtmlDialogProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(html);
            setCopied(true);
            toast.success("HTML copied to clipboard");
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            toast.error("Failed to copy");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>{title} - HTML Code</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopy}
                            className="gap-2"
                        >
                            {copied ? (
                                <>
                                    <Check className="size-4" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="size-4" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </DialogTitle>
                </DialogHeader>
                <div className="overflow-auto max-h-[60vh] bg-muted rounded-lg p-4">
                    <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                        <code>{html}</code>
                    </pre>
                </div>
            </DialogContent>
        </Dialog>
    );
}
