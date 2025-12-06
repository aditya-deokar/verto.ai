import { Slide } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useSlideStore } from '@/store/useSlideStore'
import React from 'react'
import { MasterRecursiveComponent } from '../../editor/MasterRecursiveComponent'

type Props = {
    slide: Slide
    isActive: boolean
    index: number
}

const ThumbnailPreview = ({ index, isActive, slide }: Props) => {
    const { currentTheme } = useSlideStore()

    return (
        <div
            className={cn(
                'w-full relative aspect-video rounded-lg overflow-hidden transition-all duration-200',
                isActive
                    ? 'ring-2 ring-primary shadow-md'
                    : 'hover:ring-1 hover:ring-primary/50'
            )}
            style={{
                fontFamily: currentTheme.fontFamily,
                color: currentTheme.accentColor,
                backgroundColor: currentTheme.slideBackgroundColor,
                backgroundImage: currentTheme.gradientBackground,
            }}
        >
            {/* Overlay to prevent interactions with slide content */}
            <div className="absolute inset-0 z-10 bg-transparent" />

            <div className="absolute inset-0 scale-[0.2] origin-top-left w-[500%] h-[500%] overflow-hidden pointer-events-none">
                <MasterRecursiveComponent
                    slideId={slide.id}
                    content={slide.content}
                    onContentChange={() => { }}
                    isPreview={true}
                    isEditable={false}
                />
            </div>
        </div>
    )
}

export default ThumbnailPreview
