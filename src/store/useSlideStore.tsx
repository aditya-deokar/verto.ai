import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { ContentItem, Slide, Theme } from "@/lib/types";
import { Project } from "@/generated/prisma";


interface SlideState {
  project: Project | null;
  setProject: (id: Project | null) => void;
  slides: Slide[];
  setSlides: (slides: any) => void;
  currentSlide: number;
  currentTheme: Theme;
  addSlide: (slide: Slide) => void;
  removeSlide: (id: string) => void;
  updateSlide: (id: string, content: ContentItem) => void;
  setCurrentSlide: (index: number) => void;
  updateContentItem: (
    slideId: string,
    contentId: string,
    newContent: string | string[] | string[][]
  ) => void;
  getOrderedSlides: () => Slide[];
  setCurrentTheme: (theme: Theme) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  addSlideAtIndex: (slide: Slide, index: number) => void;
  addComponentInSlide: (
    slideId: string,
    item: ContentItem,
    parentId: string,
    index: number
  ) => void;
  removeComponentFromSlide: (slideId: string, componentId: string) => void;
  moveComponentInSlide: (
    slideId: string,
    componentId: string,
    newParentId: string,
    newIndex: number
  ) => void;
  undo: () => void;
  redo: () => void;
  past: Slide[][];
  future: Slide[][];
  resetSlideStore: () => void;
  updateComponent: (
    slideId: string,
    componentId: string,
    updates: Partial<ContentItem>
  ) => void;
  selectedComponentId: string | null;
  setSelectedComponent: (id: string | null) => void;
}

const defaultTheme: Theme = {
  name: "Default",
  fontFamily: "'Inter', sans-serif",
  fontColor: "#333333",
  backgroundColor: "#f0f0f0",
  slideBackgroundColor: "#ffffff",
  accentColor: "#3b82f6",
  type: "light",
};

export const useSlideStore = create(
  persist<SlideState>(
    (set, get) => ({
      project: null,
      setProject: (project) => set({ project }),
      slides: [],
      past: [],
      future: [],
      setSlides: (slides: any) => set({ slides }),
      currentSlide: 0,
      currentTheme: defaultTheme,
      undo: () => set((state) => {
        if (state.past.length === 0) return state;
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, -1);
        return {
          slides: previous,
          past: newPast,
          future: [state.slides, ...state.future]
        };
      }),
      redo: () => set((state) => {
        if (state.future.length === 0) return state;
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        return {
          slides: next,
          past: [...state.past, state.slides],
          future: newFuture
        };
      }),
      addSlide: (slide: Slide) =>
        set((state) => {
          const newPast = [...state.past, state.slides];
          const newSlides = [...state.slides];
          const insertIndex = slide.slideOrder;
          newSlides.splice(insertIndex as number, 0, { ...slide, id: uuidv4() });

          for (let i = insertIndex!; i < newSlides.length; i++) {
            newSlides[i].slideOrder = i;
          }

          return { slides: newSlides, currentSlide: insertIndex, past: newPast, future: [] };
        }),
      removeSlide: (id) =>
        set((state) => ({
          past: [...state.past, state.slides],
          future: [],
          slides: state.slides.filter((slide) => slide.id !== id),
        })),
      updateSlide: (id, content) =>
        set((state) => ({
          past: [...state.past, state.slides],
          future: [],
          slides: state.slides.map((slide) =>
            slide.id === id ? { ...slide, content } : slide
          ),
        })),
      setCurrentSlide: (index) => set({ currentSlide: index }),
      updateContentItem: (slideId, contentId, newContent) =>
        set((state) => {
          const updateContentRecursively = (item: ContentItem): ContentItem => {
            if (item.id === contentId) {
              // Ensure newContent matches the correct type
              return { ...item, content: newContent };
            }
            if (
              Array.isArray(item.content) &&
              item.content.every((i) => typeof i !== "string")
            ) {
              return {
                ...item,
                content: item.content.map((subItem) => {
                  if (typeof subItem !== "string") {
                    return updateContentRecursively(subItem as ContentItem);
                  }
                  return subItem; // String remains unchanged
                }) as ContentItem[], // Explicitly type the content as ContentItem[]
              };
            }
            return item;
          };

          return {
            past: [...state.past, state.slides],
            future: [],
            slides: state.slides.map((slide) =>
              slide.id === slideId
                ? { ...slide, content: updateContentRecursively(slide.content) }
                : slide
            ),
          };
        }),

      getOrderedSlides: () => {
        const state = get();
        return Array.isArray(state.slides)
          ? [...state.slides].sort((a, b) => a.slideOrder! - b.slideOrder!)
          : [];
      },
      setCurrentTheme: (theme: Theme) => set({ currentTheme: theme }),
      reorderSlides: (fromIndex: number, toIndex: number) =>
        set((state) => {
          const newSlides = [...state.slides];
          const [removed] = newSlides.splice(fromIndex, 1);
          newSlides.splice(toIndex, 0, removed);
          return {
            past: [...state.past, state.slides],
            future: [],
            slides: newSlides.map((slide, index) => ({
              ...slide,
              slideOrder: index,
            })),
          };
        }),
      addSlideAtIndex: (slide: Slide, index: number) =>
        set((state) => {
          const newSlides = [...state.slides];
          newSlides.splice(index, 0, { ...slide, id: uuidv4() });

          newSlides.forEach((s, i) => {
            s.slideOrder = i;
          });

          return { slides: newSlides, currentSlide: index, past: [...state.past, state.slides], future: [] };
        }),
      addComponentInSlide: (
        slideId: string,
        item: ContentItem,
        parentId: string,
        index: number
      ) => {
        set((state) => {
          const updatedSlides = state.slides.map((slide) => {
            if (slide.id !== slideId) return slide;

            const updateContent = (content: ContentItem): ContentItem => {
              // Check if this is the direct parent
              if (content.id === parentId && Array.isArray(content.content)) {
                return {
                  ...content,
                  content: [
                    ...(content.content as ContentItem[]).slice(0, index),
                    item,
                    ...(content.content as ContentItem[]).slice(index)
                  ]
                };
              }

              // Recursively search nested content
              if (Array.isArray(content.content)) {
                return {
                  ...content,
                  content: (content.content as ContentItem[]).map(updateContent)
                };
              }

              return content;
            };

            return {
              ...slide,
              content: updateContent(slide.content)
            };
          });

          return { slides: updatedSlides, past: [...state.past, state.slides], future: [] };
        });
      },
      removeComponentFromSlide: (slideId: string, componentId: string) => {
        set((state) => {
          const updatedSlides = state.slides.map((slide) => {
            if (slide.id !== slideId) return slide;

            const removeContent = (content: ContentItem): ContentItem => {
              if (Array.isArray(content.content)) {
                return {
                  ...content,
                  content: (content.content as ContentItem[])
                    .filter((item) => item.id !== componentId)
                    .map(removeContent),
                };
              }
              return content;
            };

            return {
              ...slide,
              content: removeContent(slide.content),
            };
          });

          return { slides: updatedSlides, past: [...state.past, state.slides], future: [] };
        });
      },
      moveComponentInSlide: (
        slideId: string,
        componentId: string,
        newParentId: string,
        newIndex: number
      ) => {
        set((state) => {
          const slideIndex = state.slides.findIndex((s) => s.id === slideId);
          if (slideIndex === -1) return state;

          const newSlides = [...state.slides];
          const slide = { ...newSlides[slideIndex] };

          let movedComponent: ContentItem | null = null;

          // 1. Remove the component from its old position
          const removeRecursive = (content: ContentItem): ContentItem => {
            if (Array.isArray(content.content)) {
              // Check if it's an array of ContentItems by checking the first element or if it's empty (doesn't matter if empty)
              // But to be safe for TS, we cast or check.
              // Since we are looking for an ID, we only care if it holds ContentItems.
              const isContentItemArray = content.content.length === 0 || (typeof content.content[0] === 'object' && !Array.isArray(content.content[0]));

              if (isContentItemArray) {
                const items = content.content as ContentItem[];
                const index = items.findIndex((c) => c.id === componentId);

                if (index !== -1) {
                  movedComponent = items[index];
                  const newContent = [...items];
                  newContent.splice(index, 1);

                  // Adjust newIndex if we are moving within the same parent and removed from before the target
                  if (content.id === newParentId && index < newIndex) {
                    newIndex--;
                  }

                  return { ...content, content: newContent };
                }

                return {
                  ...content,
                  content: items.map(removeRecursive),
                };
              }
            }
            return content;
          };

          slide.content = removeRecursive(slide.content);

          if (!movedComponent) return state;

          // 2. Insert the component into the new position
          const insertRecursive = (content: ContentItem): ContentItem => {
            if (content.id === newParentId && Array.isArray(content.content)) {
              // We assume if we are dropping into it, it accepts ContentItems
              const items = content.content as ContentItem[];
              const newContent = [...items];
              newContent.splice(newIndex, 0, movedComponent!);
              return { ...content, content: newContent };
            }

            if (Array.isArray(content.content)) {
              const isContentItemArray = content.content.length === 0 || (typeof content.content[0] === 'object' && !Array.isArray(content.content[0]));
              if (isContentItemArray) {
                return {
                  ...content,
                  content: (content.content as ContentItem[]).map(insertRecursive),
                };
              }
            }
            return content;
          };

          slide.content = insertRecursive(slide.content);
          newSlides[slideIndex] = slide;

          return { slides: newSlides, past: [...state.past, state.slides], future: [] };
        });
      },
      updateComponent: (slideId, componentId, updates) => {
        set((state) => {
          const updatedSlides = state.slides.map((slide) => {
            if (slide.id !== slideId) return slide;

            const updateRecursive = (content: ContentItem): ContentItem => {
              if (content.id === componentId) {
                return { ...content, ...updates };
              }

              if (Array.isArray(content.content)) {
                return {
                  ...content,
                  content: (content.content as ContentItem[]).map(updateRecursive),
                };
              }

              return content;
            };

            return {
              ...slide,
              content: updateRecursive(slide.content),
            };
          });

          return { slides: updatedSlides, past: [...state.past, state.slides], future: [] };
        });
      },
      selectedComponentId: null,
      setSelectedComponent: (id) => set({ selectedComponentId: id }),
      resetSlideStore: () => {
        console.log("🟢 Resetting slide store");
        set({
          project: null,
          slides: [],
          past: [],
          future: [],
          currentSlide: 0,
          currentTheme: defaultTheme,
        });
        localStorage.removeItem("slides-storage"); // 👈 Clears persisted data too
      },
    }),
    {
      name: "slides-storage",
      partialize: (state) => {
        const { past, future, ...rest } = state;
        return rest as unknown as SlideState;
      },
    }
  )
);

