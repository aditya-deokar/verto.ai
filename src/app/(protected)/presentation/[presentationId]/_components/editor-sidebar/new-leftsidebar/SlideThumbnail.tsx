import { Slide } from '@/lib/types'
import { useDrag, useDrop } from 'react-dnd'
import { cn } from '@/lib/utils'
import { useSlideStore } from '@/store/useSlideStore'
import React, { useRef } from 'react'
import ThumbnailPreview from './ThumbnailPreview'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Trash2 } from 'lucide-react'
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
}

const SlideThumbnail = ({ index, moveSlide, slide }: Props) => {
    const { currentSlide, setCurrentSlide, removeSlide } = useSlideStore()
    const ref = useRef<HTMLDivElement>(null)

    const [{ isDragging }, drag] = useDrag({
        type: 'SLIDE',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    const [, drop] = useDrop({
        accept: 'SLIDE',
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        hover(item: { index: number }, monitor) {
            if (!ref.current) {
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
    })

    drag(drop(ref))

    return (
        <div
            ref={ref}
            className={cn(
                'group relative flex flex-col gap-2 p-2 rounded-lg transition-all duration-200',
                isDragging ? 'opacity-40' : 'opacity-100',
                index === currentSlide ? 'bg-muted/50' : 'hover:bg-muted/30'
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
    )
}

export default SlideThumbnail
