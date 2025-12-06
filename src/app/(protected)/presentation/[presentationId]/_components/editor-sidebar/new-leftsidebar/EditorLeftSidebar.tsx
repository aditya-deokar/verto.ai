'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useSlideStore } from '@/store/useSlideStore'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, LayoutGrid, List } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { Slide } from '@/lib/types'
import SlideThumbnail from './SlideThumbnail'
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Separator } from '@/components/ui/separator'

type Props = {}

const EditorLeftSidebar = (props: Props) => {
    const { getOrderedSlides, reorderSlides, addSlide } = useSlideStore();
    const [loading, setLoading] = useState(true)
    const slides = getOrderedSlides();

    const moveSlide = (dragIndex: number, hoverIndex: number) => {
        reorderSlides(dragIndex, hoverIndex);
    }

    const handleAddSlide = () => {
        const newSlide: Slide = {
            id: uuidv4(),
            slideName: `Slide ${slides.length + 1}`,
            type: 'slide',
            content: {
                id: uuidv4(),
                type: 'column',
                name: 'Column',
                content: [],
                columns: 1,
            },
            slideOrder: slides.length,
        }
        addSlide(newSlide)
    }

    useEffect(() => {
        if (typeof window !== 'undefined') setLoading(false);
    }, [])

    return (
        <div className='w-80 h-[calc(100vh-4rem)] fixed left-0 top-16 border-r bg-background flex flex-col overflow-hidden'>
            {/* Header */}
            <div className="px-4 py-3 border-b bg-background/95 backdrop-blur z-10 flex items-center justify-between">
                <span className='text-sm font-semibold'>Slides</span>
                <div className="flex items-center gap-1">
                    <span className='text-xs text-muted-foreground mr-2'>{slides.length} slides</span>
                </div>
            </div>

            {/* Content */}
            <ScrollArea className='flex-1 w-full'>
                {loading ? (
                    <div className='w-full px-4 flex flex-col space-y-4 py-4'>
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className='h-24 w-full rounded-lg' />
                        ))}
                    </div>
                ) : (
                    <div className='p-4 space-y-2 pb-24'>
                        {slides?.map((slide, index) => (
                            <SlideThumbnail
                                key={slide.id || index}
                                slide={slide}
                                index={index}
                                moveSlide={moveSlide}
                            />
                        ))}

                        {/* Add Slide Button at the end of the list */}
                        <div className="pt-4 flex justify-center">
                            <Button
                                onClick={handleAddSlide}
                                className="w-full h-12 border-dashed border-2 hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary transition-colors"
                                variant="outline"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add New Slide
                            </Button>
                        </div>
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}

export default EditorLeftSidebar
