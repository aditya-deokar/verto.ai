'use client'

import React from 'react'
import { useDrop, useDragDropManager } from 'react-dnd'
import { v4 as uuidv4 } from 'uuid'
import { cn } from '@/lib/utils'
import { useSlideStore } from '@/store/useSlideStore'
import { ContentItem } from '@/lib/types'


type DropZoneProps = {
  index: number
  parentId: string
  slideId: string
}

/**
 * Inner component that uses the actual DnD hooks
 */
const DropZoneInner = ({ index, parentId, slideId }: DropZoneProps) => {
  const addComponentInSlide = useSlideStore((state) => state.addComponentInSlide)
  const moveComponentInSlide = useSlideStore((state) => state.moveComponentInSlide)

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ['CONTENT_ITEM', 'SLIDE_ITEM'],
    drop: (item: {
      type: string
      componentType: string
      label: string
      component: ContentItem
      id?: string
    }) => {
      if (item.type === 'component') {
        addComponentInSlide(
          slideId,
          {
            ...item.component,
            id: uuidv4()
          },
          parentId,
          index
        )
      } else if (item.type === 'move' && item.id) {
        moveComponentInSlide(slideId, item.id, parentId, index);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop()
    })
  })

  return (
    <div
      ref={drop as unknown as React.RefObject<HTMLDivElement>}
      className={cn(
        'w-full transition-all duration-200 rounded-md',
        isOver && canDrop ? 'h-24 border-2 border-dashed border-blue-500 bg-blue-50' : 'h-4 hover:h-8 border border-transparent hover:border-blue-300 hover:bg-blue-50/50',
      )}
    >
      {isOver && canDrop && (
        <div className="w-full h-full flex text-sm items-center justify-center text-blue-600 font-medium">
          Drop here
        </div>
      )}
    </div>
  )
}

/**
 * Wrapper component that checks for DnD context
 */
const DropZone = (props: DropZoneProps) => {
  // Check if we're inside a DndProvider by trying to get the manager
  // This is a safe way to check without throwing
  let hasDndContext = false;

  try {
    const manager = useDragDropManager();
    hasDndContext = !!manager;
  } catch {
    hasDndContext = false;
  }

  if (!hasDndContext) {
    // Return null if no DnD context - this prevents the error
    return null;
  }

  return <DropZoneInner {...props} />;
}

export default DropZone