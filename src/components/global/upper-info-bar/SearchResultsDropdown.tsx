"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchStore } from "@/store/useSearchStore";
import { Presentation, Smartphone, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSlideStore } from "@/store/useSlideStore";
import { timeAgo } from "@/lib/utils";

interface SearchResultsDropdownProps {
    inputRef: React.RefObject<HTMLInputElement | null>;
}

const SearchResultsDropdown = ({ inputRef }: SearchResultsDropdownProps) => {
    const router = useRouter();
    const { setSlides } = useSlideStore();
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    const {
        query,
        results,
        isSearching,
        isOpen,
        selectedIndex,
        setSelectedIndex,
        clearSearch,
    } = useSearchStore();

    // Mount check for portal
    useEffect(() => {
        setMounted(true);
    }, []);

    // Update position based on input ref
    useEffect(() => {
        if (isOpen && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            // Get the parent container for proper width
            const parentRect = inputRef.current.closest('.min-w-\\[60\\%\\]')?.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 8,
                left: parentRect ? parentRect.left + window.scrollX : rect.left + window.scrollX,
                width: parentRect ? parentRect.width : rect.width,
            });
        }
    }, [isOpen, inputRef, query]);

    const handleNavigate = (project: (typeof results)[0]) => {
        if (project.type === "PRESENTATION") {
            if (project.slides) {
                setSlides(JSON.parse(JSON.stringify(project.slides)));
            }
            router.push(`/presentation/${project.id}`);
        } else {
            router.push(`/mobile-design/${project.id}`);
        }
        clearSearch();
    };

    // Highlight matching text in title
    const highlightMatch = (title: string, searchQuery: string) => {
        if (!searchQuery.trim()) return title;

        const regex = new RegExp(`(${searchQuery.trim()})`, "gi");
        const parts = title.split(regex);

        return parts.map((part, index) =>
            regex.test(part) ? (
                <span key={index} className="bg-vivid/30 text-vivid font-semibold rounded px-0.5">
                    {part}
                </span>
            ) : (
                part
            )
        );
    };

    if (!isOpen || !mounted) return null;

    const dropdownContent = (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                style={{
                    position: 'fixed',
                    top: position.top,
                    left: position.left,
                    width: position.width,
                }}
                className="bg-background border rounded-xl shadow-2xl z-[99999] overflow-hidden max-h-[400px] overflow-y-auto"
            >
                {/* Loading State */}
                {isSearching && (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span>Searching...</span>
                    </div>
                )}

                {/* Results */}
                {!isSearching && results.length > 0 && (
                    <div className="py-2">
                        <p className="text-xs text-muted-foreground px-4 py-2">
                            {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
                        </p>
                        {results.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.03 }}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${selectedIndex === index
                                        ? "bg-muted"
                                        : "hover:bg-muted/50"
                                    }`}
                                onClick={() => handleNavigate(project)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                {/* Type Icon */}
                                <div
                                    className={`p-2 rounded-lg shrink-0 ${project.type === "PRESENTATION"
                                            ? "bg-primary/10"
                                            : "bg-violet-500/10"
                                        }`}
                                >
                                    {project.type === "PRESENTATION" ? (
                                        <Presentation className="h-4 w-4 text-primary" />
                                    ) : (
                                        <Smartphone className="h-4 w-4 text-violet-500" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-primary truncate">
                                        {highlightMatch(project.title, query)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span
                                            className={`text-xs px-1.5 py-0.5 rounded ${project.type === "PRESENTATION"
                                                    ? "bg-primary/10 text-primary"
                                                    : "bg-violet-500/10 text-violet-500"
                                                }`}
                                        >
                                            {project.type === "PRESENTATION" ? "Presentation" : "Mobile Design"}
                                        </span>
                                        <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                                            {timeAgo(project.updatedAt.toString())}
                                        </span>
                                    </div>
                                </div>

                                {/* Shortcut hint for selected */}
                                {selectedIndex === index && (
                                    <div className="text-xs text-muted-foreground shrink-0">
                                        <kbd className="px-1.5 py-0.5 bg-muted-foreground/10 rounded text-[10px]">
                                            ↵
                                        </kbd>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isSearching && results.length === 0 && query.length >= 2 && (
                    <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                        <p className="text-sm">No results found for "{query}"</p>
                        <p className="text-xs mt-1">Try a different search term</p>
                    </div>
                )}

                {/* Hint for short query */}
                {!isSearching && query.length > 0 && query.length < 2 && (
                    <div className="flex items-center justify-center py-6 text-muted-foreground">
                        <p className="text-sm">Type at least 2 characters to search</p>
                    </div>
                )}

                {/* Keyboard shortcuts hint */}
                {results.length > 0 && (
                    <div className="border-t px-4 py-2 flex items-center justify-between text-xs text-muted-foreground bg-muted/30">
                        <div className="flex items-center gap-3">
                            <span>
                                <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↑</kbd>
                                <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] ml-0.5">↓</kbd>
                                {" "}to navigate
                            </span>
                            <span>
                                <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">↵</kbd>
                                {" "}to open
                            </span>
                        </div>
                        <span>
                            <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">esc</kbd>
                            {" "}to close
                        </span>
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );

    // Render via portal to document.body to escape overflow:hidden parents
    return createPortal(dropdownContent, document.body);
};

export default SearchResultsDropdown;
