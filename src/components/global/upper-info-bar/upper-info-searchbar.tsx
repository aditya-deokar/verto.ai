"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Loader2 } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";
import { searchProjects } from "@/actions/unified-projects";
import SearchResultsDropdown from "./SearchResultsDropdown";

const SearchBar = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    query,
    results,
    isSearching,
    isOpen,
    selectedIndex,
    setQuery,
    setResults,
    setIsSearching,
    setIsOpen,
    setSelectedIndex,
    clearSearch,
  } = useSearchStore();

  // Debounced search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchProjects(searchQuery);
      if (response.status === 200 && response.data) {
        setResults(response.data);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [setResults, setIsSearching]);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(true);
    setSelectedIndex(0);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new debounce
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Handle clear button
  const handleClear = () => {
    clearSearch();
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(Math.min(selectedIndex + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(Math.max(selectedIndex - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          const project = results[selectedIndex];
          // Navigate is handled in the dropdown component
          const event = new CustomEvent("search-navigate", { detail: project });
          window.dispatchEvent(event);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Global keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [setIsOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsOpen]);

  // Handle navigation from keyboard Enter
  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => {
      const project = e.detail;
      if (project.type === "PRESENTATION") {
        window.location.href = `/presentation/${project.id}`;
      } else {
        window.location.href = `/mobile-design/${project.id}`;
      }
      clearSearch();
    };

    window.addEventListener("search-navigate", handleNavigate as EventListener);
    return () => window.removeEventListener("search-navigate", handleNavigate as EventListener);
  }, [clearSearch]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="min-w-[60%] relative">
      <div className="relative flex items-center border rounded-full bg-primary-90 transition-all focus-within:ring-2 focus-within:ring-vivid/30">
        {/* Search Icon / Loading */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="absolute left-0 h-full rounded-l-none bg-transparent hover:bg-transparent pointer-events-none"
        >
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="sr-only">Search</span>
        </Button>

        {/* Input */}
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search projects..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 ml-6 pr-20"
        />

        {/* Right side: Clear button and shortcut hint */}
        <div className="absolute right-2 flex items-center gap-1">
          {query && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleClear}
              className="h-6 w-6 p-0 hover:bg-muted rounded-full"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
          {!query && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      <SearchResultsDropdown inputRef={inputRef} />
    </div>
  );
};

export default SearchBar;
