import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GalleryLayoutType = 'grid' | 'list' | 'showcase';

interface LayoutState {
  layout: GalleryLayoutType;
  setLayout: (layout: GalleryLayoutType) => void;
}

export const useLayoutStore = create<LayoutState>()(
  persist(
    (set) => ({
      layout: 'grid',
      setLayout: (layout) => set({ layout }),
    }),
    {
      name: 'gallery-layout-preference',
    }
  )
);
