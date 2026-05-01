import { MasterRecursiveComponent } from '@/app/(protected)/presentation/[presentationId]/_components/editor/MasterRecursiveComponent'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ContentItem } from '@/lib/types'
import { cn } from '@/lib/utils'
import React, { useEffect, useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

type Props = {
  content: ContentItem[],
  className?: string,
  isPreview?: boolean,
  slideId: string
  onContentChange: (
    contentId: string,
    newContent: string | string[] | string[][]
  ) => void
  isEditable?: boolean
}

const ColumnComponent = ({
  content,
  className,
  slideId,
  onContentChange,
  isPreview = false,
  isEditable = true,
}: Props) => {
  const [columns, setColumns] = useState<ContentItem[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  const createDefaultColumns = (count: number) => {
    return Array(count)
      .fill(null)
      .map(() => ({
        id: uuidv4(),
        type: 'paragraph' as const,
        name: 'paragraph',
        content: '',
        placeholder: 'Start typing...',
      }))
  }

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (content.length === 0) {
      setColumns(createDefaultColumns(2))
    } else {
      setColumns(content)
    }

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setIsMobile(entry.contentRect.width < 600)
      }
    })

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [content])

  return (
    <div className="relative w-full h-full" ref={containerRef}>
      <ResizablePanelGroup
        direction={isMobile ? "vertical" : "horizontal"}
        className={cn(
          'h-full w-full flex',
          isMobile ? 'flex-col' : 'flex-row',
          !isEditable && 'border-0!'
        )}
      >
        {columns.map((item, index) => (
          <React.Fragment key={item.id}>
            <ResizablePanel
              minSize={20}
              defaultSize={100 / columns.length}
            >
              <div className={cn('h-full w-full',
                item.className
              )}>
                <MasterRecursiveComponent
                  content={item}
                  isPreview={isPreview}
                  onContentChange={onContentChange}
                  slideId={slideId}
                  isEditable={isEditable}
                />
              </div>
            </ResizablePanel>
            {index < columns.length - 1 && isEditable && (
              <ResizableHandle withHandle={!isPreview} />
            )}
          </React.Fragment>
        ))}
      </ResizablePanelGroup>
    </div>
  )
}

export default ColumnComponent
