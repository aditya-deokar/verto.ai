import { MasterRecursiveComponent } from '@/app/(protected)/presentation/[presentationId]/_components/editor/MasterRecursiveComponent'
import { Slide, Theme } from '@/lib/types'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { useLayoutStore } from '@/store/useLayoutStore'


import React from 'react'

type Props={
    slide:Slide,
    theme:Theme,
}

const ThumnailPreview = ({ slide, theme }: Props) => {
  const { layout } = useLayoutStore();
  const isList = layout === 'list';
  const isShowcase = layout === 'showcase';

  return (
    <div
      className={cn(
        'w-full h-full relative overflow-hidden transition-all duration-200 flex items-center justify-center'
      )}
      style={{
        fontFamily: theme.fontFamily,
        color: theme.accentColor,
        backgroundColor: theme.slideBackgroundColor,
        backgroundImage: theme.gradientBackground,
      }}
    >
      {slide ? (
        <div 
          className="w-[1280px] h-[720px] shrink-0"
          style={{ 
            transform: `scale(${isList ? 0.08 : (isShowcase ? 0.28 : 0.18)})`, 
            transformOrigin: 'center center',
          }}
        >
          <MasterRecursiveComponent
            content={slide.content}
            onContentChange={() => {}}
            isPreview={true}
            isEditable={false}
            slideId={slide.id}
          />
        </div>
      ) : (
        <div className="w-full h-full bg-muted/20 flex justify-center items-center pointer-events-none">
          <Image src={'/file.svg'} alt="image" width={30} height={30} className="opacity-20 translate-y-[-10%]" />
        </div>
      )}
      
      {/* Subtle overlay for better contrast */}
      <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 dark:ring-white/5" />
    </div>
  )
}

export default ThumnailPreview