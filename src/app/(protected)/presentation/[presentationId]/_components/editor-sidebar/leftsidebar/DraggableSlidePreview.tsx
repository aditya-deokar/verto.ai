import { Slide } from '@/lib/types'
import { useDrag, useDrop } from 'react-dnd'
import { cn } from '@/lib/utils'
import { useSlideStore } from '@/store/useSlideStore'
import React, { useRef } from 'react'
import ScaledPreview from './ScaledPreview'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

type Props = {
    slide: Slide
    index: number
    moveSlide: (dragIndex: number, hoverIndex: number) => void
}

const DraggableSlidePreview = ({ index, moveSlide, slide }: Props) => {
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
                'group relative flex items-start gap-2 p-2 rounded-lg transition-all duration-200',
                isDragging ? 'opacity-50' : 'opacity-100',
                index === currentSlide ? 'bg-primary/10' : 'hover:bg-muted/50'
            )}
            onClick={() => setCurrentSlide(index)}
        >
            {/* Slide Number */}
            <div className={cn(
                "text-xs font-medium w-4 text-muted-foreground pt-1 transition-colors",
                index === currentSlide && "text-primary"
            )}>
                {index + 1}
            </div>

            {/* Preview Container */}
            <div className="flex-1 relative cursor-pointer">
                <ScaledPreview
                    slide={slide}
                    isActive={index === currentSlide}
                    index={index}
                />

                {/* Delete Button - Visible on Group Hover */}
                <Button
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                    onClick={(e) => {
                        e.stopPropagation()
                        removeSlide(slide.id)
                    }}
                >
                    <Trash2 className="w-3 h-3" />
                </Button>
            </div>
        </div>
    )
}

export default DraggableSlidePreview