'use client'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useSlideStore } from '@/store/useSlideStore'
import React, { useEffect, useState } from 'react'
import DraggableSlidePreview from './DraggableSlidePreview'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { Slide } from '@/lib/types'

type Props = {}

const LayoutPreview = (props: Props) => {
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
        <div className='w-64 h-full border-r bg-background flex flex-col shadow-sm shrink-0'>
            <div className="p-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-10">
                <div className='flex items-center justify-between mb-4'>
                    <h2 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>Slides</h2>
                    <span className='text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full'>
                        {slides?.length}
                    </span>
                </div>
                <Button onClick={handleAddSlide} className="w-full" size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    New Slide
                </Button>
            </div>

            <ScrollArea className='flex-1 w-full'>
                {loading ? (
                    <div className='w-full px-4 flex flex-col space-y-4 py-4'>
                        <Skeleton className='h-24 w-full rounded-lg' />
                        <Skeleton className='h-24 w-full rounded-lg' />
                        <Skeleton className='h-24 w-full rounded-lg' />
                    </div>
                ) : (
                    <div className='p-4 pr-8 pb-32 space-y-4'>
                        {slides?.map((slide, index) => (
                            <DraggableSlidePreview
                                key={slide.id || index}
                                slide={slide}
                                index={index}
                                moveSlide={moveSlide}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    )
}

export default LayoutPreview