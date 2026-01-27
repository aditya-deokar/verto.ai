"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, FileCode, Palette } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
    theme_style,
    open,
    onOpenChange,
}: HtmlDialogProps) {
    const [copiedHtml, setCopiedHtml] = useState(false);
    const [copiedTheme, setCopiedTheme] = useState(false);

    const handleCopy = async (text: string, type: 'html' | 'theme') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'html') {
                setCopiedHtml(true);
                setTimeout(() => setCopiedHtml(false), 2000);
            } else {
                setCopiedTheme(true);
                setTimeout(() => setCopiedTheme(false), 2000);
            }
            toast.success(`${type === 'html' ? 'HTML' : 'Theme'} copied to clipboard`);
        } catch (error) {
            toast.error("Failed to copy");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] p-0 flex flex-col gap-0 bg-background/95 backdrop-blur-xl overflow-hidden border-border/50">
                <DialogHeader className="p-4 px-6 border-b shrink-0 bg-muted/20">
                    <DialogTitle className="flex items-center gap-2">
                        <FileCode className="size-5 text-foreground" />
                        <span>{title}</span>
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="html" className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="px-6 pt-4 shrink-0">
                        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-lg grid grid-cols-2 w-[300px]">
                            <TabsTrigger value="html" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <FileCode className="size-3.5" />
                                HTML Structure
                            </TabsTrigger>
                            <TabsTrigger value="theme" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Palette className="size-3.5" />
                                Theme Variables
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value="html" className="flex-1 min-h-0 flex flex-col relative m-0 p-0 data-[state=inactive]:hidden">
                        <div className="absolute top-4 right-6 z-10 flex gap-2 place-items-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopy(html, 'html')}
                                className="h-8 gap-2 bg-background/50 hover:bg-background shadow-sm backdrop-blur-sm"
                            >
                                {copiedHtml ? (
                                    <>
                                        <Check className="size-3.5 text-emerald-500" />
                                        <span className="text-emerald-500 font-medium">Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="size-3.5" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto bg-[#1e1e1e] p-0">
                            <SyntaxHighlighter
                                language="html"
                                style={vscDarkPlus}
                                customStyle={{
                                    margin: 0,
                                    padding: '1.5rem',
                                    background: 'transparent',
                                    fontSize: '0.8rem',
                                    lineHeight: '1.5',
                                }}
                                showLineNumbers={true}
                                wrapLines={true}
                            >
                                {html}
                            </SyntaxHighlighter>
                        </div>
                    </TabsContent>

                    <TabsContent value="theme" className="flex-1 min-h-0 flex flex-col relative m-0 p-0 data-[state=inactive]:hidden">
                        <div className="absolute top-4 right-6 z-10 flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopy(theme_style || '', 'theme')}
                                disabled={!theme_style}
                                className="h-8 gap-2 bg-background/50 hover:bg-background shadow-sm backdrop-blur-sm"
                            >
                                {copiedTheme ? (
                                    <>
                                        <Check className="size-3.5 text-emerald-500" />
                                        <span className="text-emerald-500 font-medium">Copied</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="size-3.5" />
                                        <span>Copy</span>
                                    </>
                                )}
                            </Button>
                        </div>
                        <div className="flex-1 overflow-auto bg-[#1e1e1e] p-0">
                            {theme_style ? (
                                <SyntaxHighlighter
                                    language="css"
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: 0,
                                        padding: '1.5rem',
                                        background: 'transparent',
                                        fontSize: '0.8rem',
                                        lineHeight: '1.5',
                                    }}
                                    showLineNumbers={true}
                                    wrapLines={true}
                                >
                                    {theme_style}
                                </SyntaxHighlighter>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2 opacity-50">
                                    <Palette className="size-8" />
                                    <p>No custom theme applied</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
