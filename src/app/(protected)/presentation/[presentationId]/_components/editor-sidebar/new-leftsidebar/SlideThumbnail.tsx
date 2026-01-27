import { LayoutSlides, Slide } from '@/lib/types'
import { useDrag, useDrop } from 'react-dnd'
import { cn } from '@/lib/utils'
import { useSlideStore } from '@/store/useSlideStore'
import React, { useRef } from 'react'
import ThumbnailPreview from './ThumbnailPreview'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


type Props = {
    slide: Slide
    index: number
    moveSlide: (dragIndex: number, hoverIndex: number) => void
    onInsert?: (layout: LayoutSlides, index: number) => void
}

const SlideThumbnail = ({ index, moveSlide, slide, onInsert }: Props) => {
    const { currentSlide, setCurrentSlide, removeSlide } = useSlideStore()
    const ref = useRef<HTMLDivElement>(null)

    const [{ isDragging }, drag] = useDrag({
        type: 'SLIDE',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    const [{ isOver, canDrop, itemType }, drop] = useDrop({
        accept: ['SLIDE', 'layout'],
        hover(item: { index: number, type: string }, monitor) {
            if (!ref.current) {
                return
            }
            if (monitor.getItemType() === 'layout') {
                return
            }
            const dragIndex = item.index
            const hoverIndex = index
            if (dragIndex === hoverIndex) {
                return
            }
            moveSlide(dragIndex, hoverIndex)
            item.index = hoverIndex
        },
        drop(item: any, monitor) {
            if (monitor.getItemType() === 'layout' && onInsert && item.component) {
                // Insert after the current slide
                onInsert(item.component, index + 1)
            }
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
            itemType: monitor.getItemType(),
        }),
    })

    drag(drop(ref))

    return (
        <div ref={ref} className="relative w-full">
            {/* Slide Card */}
            <div
                className={cn(
                    'group relative flex flex-col gap-2 p-2 rounded-lg transition-all duration-200 border border-transparent',
                    isDragging ? 'opacity-40' : 'opacity-100',
                    index === currentSlide ? 'bg-muted/50 border-primary/10' : 'hover:bg-muted/30 hover:border-border/50',
                )}
                onClick={() => setCurrentSlide(index)}
            >
                <div className="flex items-center justify-between px-1">
                    <span className={cn(
                        "text-xs font-medium w-5 h-5 flex items-center justify-center rounded-full",
                        index === currentSlide
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground bg-muted"
                    )}>
                        {index + 1}
                    </span>

                    {/* Options Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MoreHorizontal className="w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    removeSlide(slide.id)
                                }}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Slide
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="relative cursor-grab active:cursor-grabbing">
                    <ThumbnailPreview
                        slide={slide}
                        isActive={index === currentSlide}
                        index={index}
                    />
                </div>
            </div>

            {/* Drop Zone - Expands to create gap */}
            {canDrop && itemType === 'layout' && (
                <div className={cn(
                    "w-full transition-all duration-200 ease-in-out overflow-hidden mt-1",
                    isOver ? "h-16 opacity-100" : "h-2 opacity-50"
                )}>
                    <div className={cn(
                        "w-full h-full rounded-lg border-2 border-dashed flex items-center justify-center backdrop-blur-sm transition-colors",
                        isOver
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-muted-foreground/30 bg-muted/20 text-muted-foreground"
                    )}>
                        <span className="text-xs font-medium flex items-center gap-2">
                            <Plus className="w-3 h-3" /> Insert Slide
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default SlideThumbnail
