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
    const { currentTheme } = useSlideStore();
    const [activeTab, setActiveTab] = useState<TabType>(null);

    const toggleTab = (tab: TabType) => {
        setActiveTab(current => current === tab ? null : tab);
    };

    const NavButton = ({
        icon: Icon,
        label,
        isActive,
        onClick
    }: {
        icon: any,
        label: string,
        isActive: boolean,
        onClick: () => void
    }) => (
        <TooltipProvider delayDuration={0}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={isActive ? "default" : "ghost"}
                        size="icon"
                        onClick={onClick}
                        className={cn(
                            "h-12 w-12 rounded-xl transition-all duration-200",
                            isActive
                                ? "bg-primary text-primary-foreground shadow-md scale-110"
                                : "hover:bg-muted hover:scale-105 text-muted-foreground"
                        )}
                    >
                        <Icon className="h-6 w-6" />
                        <span className="sr-only">{label}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left" className="font-medium">
                    {label}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );

    return (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex items-start h-[80vh] pointer-events-none ">
            {/* Content Panel */}
            <div
                className={cn(
                    "h-full bg-background border-y border-l shadow-2xl transition-all duration-300 ease-in-out overflow-hidden flex flex-col pointer-events-auto rounded-l-2xl mr-4",
                    activeTab ? "w-[400px] opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-10 border-none"
                )}
            >
                {/* Panel Header */}
                <div className="h-14 border-b flex items-center justify-between px-4 shrink-0 bg-muted/30">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        {activeTab === 'layout' && <><LayoutTemplate className="w-5 h-5 text-blue-500" /> Layouts</>}
                        {activeTab === 'typography' && <><Type className="w-5 h-5 text-green-500" /> Components</>}
                        {activeTab === 'theme' && <><Palette className="w-5 h-5 text-purple-500" /> Themes</>}
                    </h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveTab(null)}
                        className="h-8 w-8 rounded-full hover:bg-muted"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-hidden relative">
                    {activeTab === 'layout' && <LayoutChooser />}
                    {activeTab === 'typography' && <TextTypography />}
                    {activeTab === 'theme' && <ThemeChooser />}
                </div>
            </div>

            {/* Navigation Dock */}
            <div className="pointer-events-auto flex flex-col gap-4 p-2 bg-background border shadow-xl rounded-l-2xl mr-0 transition-all duration-300">
                <NavButton
                    icon={LayoutTemplate}
                    label="Layouts"
                    isActive={activeTab === 'layout'}
                    onClick={() => toggleTab('layout')}
                />
                <NavButton
                    icon={Type}
                    label="Components"
                    isActive={activeTab === 'typography'}
                    onClick={() => toggleTab('typography')}
                />
                <NavButton
                    icon={Palette}
                    label="Themes"
                    isActive={activeTab === 'theme'}
                    onClick={() => toggleTab('theme')}
                />
            </div>
        </div>
    );
};

export default EditorSidebar;
