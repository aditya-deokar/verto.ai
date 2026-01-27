"use client";

import { DashboardProject } from "@/actions/unified-projects";
import { create } from "zustand";

interface SearchStore {
    query: string;
    results: DashboardProject[];
    isSearching: boolean;
    isOpen: boolean;
    selectedIndex: number;
    setQuery: (query: string) => void;
    setResults: (results: DashboardProject[]) => void;
    setIsSearching: (isSearching: boolean) => void;
    setIsOpen: (isOpen: boolean) => void;
    setSelectedIndex: (index: number) => void;
    clearSearch: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
    query: "",
    results: [],
    isSearching: false,
    isOpen: false,
    selectedIndex: 0,
    setQuery: (query) => set({ query }),
    setResults: (results) => set({ results }),
    setIsSearching: (isSearching) => set({ isSearching }),
    setIsOpen: (isOpen) => set({ isOpen }),
    setSelectedIndex: (index) => set({ selectedIndex: index }),
    clearSearch: () =>
        set({
            query: "",
            results: [],
            isSearching: false,
            isOpen: false,
            selectedIndex: 0,
        }),
}));
