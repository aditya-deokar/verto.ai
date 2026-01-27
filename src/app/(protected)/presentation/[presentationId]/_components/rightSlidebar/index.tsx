"use client";
import React, { useState } from "react";
import { useSlideStore } from "@/store/useSlideStore";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, Palette, Type, X, ChevronRight } from "lucide-react";
import LayoutChooser from "./tabs/LayoutChooser";
import ThemeChooser from "./tabs/ThemeChooser";
import TextTypography from "./tabs/TextTypography";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

type TabType = 'layout' | 'typography' | 'theme' | null;

const EditorSidebar = () => {
    const [activeTab, setActiveTab] = useState<TabType>('layout');

    return (
        <div className="w-full h-full flex flex-col bg-transparent">
            {/* Header / Tabs */}
            <div className="flex items-center justify-around p-2 border-b bg-muted/20 shrink-0 gap-1">
                <Button
                    variant={activeTab === 'layout' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('layout')}
                    className="flex-1 gap-2 rounded-lg"
                >
                    <LayoutTemplate className="w-4 h-4" />
                    <span className="hidden lg:inline text-xs">Layouts</span>
                </Button>
                <Button
                    variant={activeTab === 'typography' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('typography')}
                    className="flex-1 gap-2 rounded-lg"
                >
                    <Type className="w-4 h-4" />
                    <span className="hidden lg:inline text-xs">Text</span>
                </Button>
                <Button
                    variant={activeTab === 'theme' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('theme')}
                    className="flex-1 gap-2 rounded-lg"
                >
                    <Palette className="w-4 h-4" />
                    <span className="hidden lg:inline text-xs">Themes</span>
                </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative p-4">
                <div className="h-full w-full overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-transparent">
                    {activeTab === 'layout' && <LayoutChooser />}
                    {activeTab === 'typography' && <TextTypography />}
                    {activeTab === 'theme' && <ThemeChooser />}
                </div>
            </div>
        </div>
    );
};

export default EditorSidebar;
