'use client'
import React, { useState, useRef, useEffect, memo } from 'react'
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

type ResizeDirection =
    | 'top' | 'bottom' | 'left' | 'right'
    | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

const ResizableComponent = ({ content, slideId, children, isEditable, isPreview }: Props) => {
    const { updateComponent, setSelectedComponent, selectedComponentId } = useSlideStore()
    const ref = useRef<HTMLDivElement>(null)
    const dragControls = useDragControls()

    const [width, setWidth] = useState<number | string>(content.width || '100%')
    const [height, setHeight] = useState<number | string>(content.height || 'auto')
    const [x, setX] = useState(content.x || 0)
    const [y, setY] = useState(content.y || 0)

    useEffect(() => {
        if (content.width) setWidth(content.width)
        if (content.height) setHeight(content.height)
        if (content.x !== undefined) setX(content.x)
        if (content.y !== undefined) setY(content.y)
    }, [content.width, content.height, content.x, content.y])

    // If preview or not editable, render static
    if (isPreview || !isEditable) {
        return (
            <div
                style={{
                    width: content.width || '100%',
                    height: content.height || '100%',
                    position: content.x !== undefined ? 'absolute' : 'relative',
                    left: content.x,
                    top: content.y,
                    zIndex: content.x !== undefined ? 10 : 1,
                }}
                className={cn("relative", content.className)}
            >
                {children}
            </div>
        )
    }

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        // We need to calculate the *final* absolute position relative to the parent container
        const parentRect = ref.current?.parentElement?.getBoundingClientRect()
        const elementRect = ref.current?.getBoundingClientRect()

        if (parentRect && elementRect) {
            // Calculate position relative to the parent container
            const newX = elementRect.left - parentRect.left
            const newY = elementRect.top - parentRect.top

            setX(newX)
            setY(newY)
            updateComponent(slideId, content.id, { x: newX, y: newY })
        }
    }

    const handleResizeStart = (e: React.MouseEvent, direction: ResizeDirection) => {
        e.stopPropagation()
        e.preventDefault()

        const startX = e.clientX
        const startY = e.clientY
        const startWidth = ref.current?.offsetWidth || 0
        const startHeight = ref.current?.offsetHeight || 0
        const startLeft = x
        const startTop = y

        const handleMouseMove = (moveEvent: MouseEvent) => {
            let newWidth = startWidth
            let newHeight = startHeight
            let newX = startLeft
            let newY = startTop

            const diffX = moveEvent.clientX - startX
            const diffY = moveEvent.clientY - startY

            // Calculate new dimensions based on direction
            if (direction.includes('right')) newWidth = startWidth + diffX
            if (direction.includes('left')) {
                newWidth = startWidth - diffX
                newX = startLeft + diffX
            }
            if (direction.includes('bottom')) newHeight = startHeight + diffY
            if (direction.includes('top')) {
                newHeight = startHeight - diffY
                newY = startTop + diffY
            }

            setWidth(newWidth > 20 ? newWidth : 20)
            setHeight(newHeight > 20 ? newHeight : 20)
            if (direction.includes('left') || direction.includes('top')) {
                setX(newX)
                setY(newY)
            }
        }

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)

            if (ref.current) {
                const finalUpdates: Partial<ContentItem> = {
                    width: ref.current.offsetWidth,
                    height: ref.current.offsetHeight
                }

                // Only update position if we resized from top/left
                if (direction.includes('left') || direction.includes('top')) {
                    finalUpdates.x = x // Use state value which was updated during move
                    finalUpdates.y = y
                }

                updateComponent(slideId, content.id, finalUpdates)
            }
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
    }

    const isAbsolute = content.x !== undefined && content.y !== undefined
    const isSelected = selectedComponentId === content.id

    // Render Resize Handles
    const renderResizeHandle = (direction: ResizeDirection) => {
        // Position classes
        const positions = {
            'top': 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-1',
            'bottom': 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-8 h-1',
            'left': 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-1',
            'right': 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-8 w-1',
            'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3',
            'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-3',
            'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-3 h-3',
            'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3 h-3',
        }

        const cursors = {
            'top': 'cursor-n-resize',
            'bottom': 'cursor-s-resize',
            'left': 'cursor-w-resize',
            'right': 'cursor-e-resize',
            'top-left': 'cursor-nw-resize',
            'top-right': 'cursor-ne-resize',
            'bottom-left': 'cursor-sw-resize',
            'bottom-right': 'cursor-se-resize',
        }

        return (
            <div
                key={direction}
                className={cn(
                    "absolute z-50 bg-primary/80 border border-white shadow-sm transition-opacity",
                    positions[direction],
                    cursors[direction],
                    // Show dots for corners, lines for edges? Or simple boxes.
                    direction.includes('-') ? 'rounded-full' : 'rounded-sm',
                    isSelected ? 'opacity-100' : 'opacity-0'
                )}
                onMouseDown={(e) => handleResizeStart(e, direction)}
            />
        )
    }

    return (
        <motion.div
            ref={ref}
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setSelectedComponent(content.id)
            }}
            // Always allow dragging if editable. Even if it was relative, dragging it should make it absolute.
            drag={isEditable && !content.restrictToDrop}
            dragListener={false} // Use manual controls
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
                "group/resize",
                content.className,
                isSelected ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"
            )}
        >
            {children}

            {isEditable && isSelected && (
                <>
                    {/* Move Handle - Top Center, slightly outside */}
                    <div
                        className="absolute -top-8 left-1/2 -translate-x-1/2 w-8 h-6 bg-primary text-primary-foreground shadow-md rounded-md flex items-center justify-center cursor-move z-50"
                        onPointerDown={(e) => dragControls.start(e)}
                    >
                        <Move className="w-4 h-4" />
                    </div>

                    {/* Resize Handles */}
                    {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((dir) =>
                        renderResizeHandle(dir as ResizeDirection)
                    )}
                    {/* Edge Handles (Optional, can be added if needed for precision) */}
                    {['top', 'bottom', 'left', 'right'].map((dir) =>
                        renderResizeHandle(dir as ResizeDirection)
                    )}
                </>
            )}
        </motion.div>
    )
}

export default memo(ResizableComponent)
