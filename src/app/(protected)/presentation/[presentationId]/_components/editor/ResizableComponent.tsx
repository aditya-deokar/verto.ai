'use client'
import React, { useState, useRef, useEffect } from 'react'
import { ContentItem } from '@/lib/types'
import { useSlideStore } from '@/store/useSlideStore'
import { cn } from '@/lib/utils'
import { motion, PanInfo, useDragControls } from 'framer-motion'
import { Move } from 'lucide-react'

type Props = {
    content: ContentItem
    slideId: string
    children: React.ReactNode
    isEditable: boolean
    isPreview: boolean
}

const ResizableComponent = ({ content, slideId, children, isEditable, isPreview }: Props) => {
    const { updateComponent, setSelectedComponent, selectedComponentId } = useSlideStore()
    const ref = useRef<HTMLDivElement>(null)
    const dragControls = useDragControls()

    // Local state for smooth interactions
    const [width, setWidth] = useState<number | string>(content.width || '100%')
    const [height, setHeight] = useState<number | string>(content.height || 'auto')
    const [x, setX] = useState(content.x || 0)
    const [y, setY] = useState(content.y || 0)

    useEffect(() => {
        if (content.width) setWidth(content.width)
        if (content.height) setHeight(content.height)
        if (content.x) setX(content.x)
        if (content.y) setY(content.y)
    }, [content.width, content.height, content.x, content.y])

    if (isPreview || !isEditable) {
        return (
            <div
                style={{
                    width: content.width || '100%',
                    height: content.height || '100%',
                    position: content.x !== undefined ? 'absolute' : 'relative',
                    left: content.x,
                    top: content.y
                }}
                className={cn("relative", content.className)}
            >
                {children}
            </div>
        )
    }

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // When using animate prop for x/y, the element is visually at 'x' (from state) + drag offset.
        // We need to commit this new position to state.
        const newX = Number(x) + info.offset.x
        const newY = Number(y) + info.offset.y
        setX(newX)
        setY(newY)
        updateComponent(slideId, content.id, { x: newX, y: newY })
    }

    // Simple resize implementation
    const handleResizeStart = (e: React.MouseEvent, direction: string) => {
        e.stopPropagation()
        e.preventDefault()

        const startX = e.clientX
        const startY = e.clientY
        const startWidth = ref.current?.offsetWidth || 0
        const startHeight = ref.current?.offsetHeight || 0

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (direction.includes('right')) {
                const newWidth = startWidth + (moveEvent.clientX - startX)
                setWidth(newWidth)
            }
            if (direction.includes('bottom')) {
                const newHeight = startHeight + (moveEvent.clientY - startY)
                setHeight(newHeight)
            }
            // Add other directions if needed
        }

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)

            // Update store
            if (ref.current) {
                updateComponent(slideId, content.id, {
                    width: ref.current.offsetWidth,
                    height: ref.current.offsetHeight
                })
            }
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    const isAbsolute = content.x !== undefined && content.y !== undefined
    const isSelected = selectedComponentId === content.id

    return (
        <motion.div
            ref={ref}
            onClick={(e) => {
                e.stopPropagation()
                setSelectedComponent(content.id)
            }}
            drag={isEditable && !content.restrictToDrop}
            dragListener={false} // Disable auto drag listener
            dragControls={dragControls}
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            animate={{
                x: isAbsolute ? x : 0,
                y: isAbsolute ? y : 0,
            }}
            style={{
                width: width,
                height: height,
                position: isAbsolute ? 'absolute' : 'relative',
                zIndex: isAbsolute ? 10 : 1,
            }}
            className={cn(
                "group/resize relative",
                content.className,
                isEditable && "hover:ring-1 hover:ring-blue-500",
                isSelected && "ring-2 ring-blue-500"
            )}
        >
            {children}

            {isEditable && (
                <>
                    {/* Drag Handle */}
                    <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white shadow-sm border rounded-full flex items-center justify-center cursor-move opacity-0 group-hover/resize:opacity-100 z-50 transition-opacity"
                        onPointerDown={(e) => dragControls.start(e)}
                    >
                        <Move className="w-3 h-3 text-blue-500" />
                    </div>

                    {/* Resize Handle */}
                    <div
                        className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-0 group-hover/resize:opacity-100 z-50 rounded-tl-md transition-opacity"
                        onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
                    />
                </>
            )}
        </motion.div>
    )
}

export default ResizableComponent
