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

const ScaledPreview = ({ index, isActive, slide }: Props) => {
    const { currentTheme } = useSlideStore()

    return (
        <div
            className={cn(
                'w-full relative aspect-video rounded-md overflow-hidden transition-all duration-200 shadow-sm',
                'border border-border', // Default border
                isActive
                    ? 'ring-2 ring-primary ring-offset-1'
                    : 'group-hover:ring-1 group-hover:ring-primary/20'
            )}
            style={{
                fontFamily: currentTheme.fontFamily,
                color: currentTheme.accentColor,
                backgroundColor: currentTheme.slideBackgroundColor,
                backgroundImage: currentTheme.gradientBackground,
            }}

        >
            {/* <div className="scale-[0.03] origin-top-left w-[100%] h-[100%] overflow-hidden pointer-events-none"> */}
                <MasterRecursiveComponent
                    slideId={slide.id}
                    content={slide.content}
                    onContentChange={() => { }}
                    isPreview={true}
                    isEditable={false}
                />
            {/* </div> */}

        </div>
    )
}

export default ScaledPreview
