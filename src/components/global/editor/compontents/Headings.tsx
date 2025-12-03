'use client';

import { cn } from '@/lib/utils';
import { useSlideStore } from '@/store/useSlideStore';
import React, { useEffect, useRef } from 'react';

interface HeadingProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
  styles?: React.CSSProperties;
  isPreview?: boolean;
}

const createHeading = (displayName: string, defaultClassName: string, useAccentColor: boolean = false) => {
  const Heading = React.forwardRef<HTMLTextAreaElement, HeadingProps>(
    ({ children, styles, isPreview = false, className, ...props }, ref) => {
      const textareaRef = useRef<HTMLTextAreaElement>(null);
      const { currentTheme } = useSlideStore();

      useEffect(() => {
        const textarea = textareaRef.current;

        if (textarea && !isPreview) {
          const adjustHeight = () => {
            textarea.style.height = '0'
            textarea.style.height = `${textarea.scrollHeight}px`
          }


          textarea.addEventListener('input', adjustHeight);
          adjustHeight();
          return () => textarea.removeEventListener('input', adjustHeight);
        }
      }, [isPreview])

      return (
        <textarea
          className={cn(
            `w-full bg-transparent ${defaultClassName} font-bold text-gray-900 placeholder:text-gray-300/50 focus:outline-hidden resize-none overflow-hidden leading-[1.1] tracking-tight`,
            isPreview ? 'cursor-default' : '',
            className
          )}
          style={{
            padding: 0,
            margin: 0,
            color: useAccentColor ? currentTheme.accentColor : 'inherit',
            boxSizing: 'content-box',
            lineHeight: '1.1em',
            minHeight: '1.1em',
            ...styles,
          }}
          ref={(el) => {
            (textareaRef.current as HTMLTextAreaElement | null) = el
            if (typeof ref === 'function') ref(el)
            else if (ref) ref.current = el
          }}
          readOnly={isPreview}
          {...props}
        ></textarea>
      );
    }
  );


  Heading.displayName = displayName;
  return Heading;
};

const Heading1 = createHeading('Heading1', 'text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4', true)
const Heading2 = createHeading('Heading2', 'text-3xl md:text-4xl lg:text-5xl font-bold mb-3')
const Heading3 = createHeading('Heading3', 'text-2xl md:text-3xl lg:text-4xl font-semibold mb-2')
const Heading4 = createHeading('Heading4', 'text-xl md:text-2xl lg:text-3xl font-medium mb-2')
const Title = createHeading('Title', 'text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tighter', true)

export { Heading1, Heading2, Heading3, Heading4, Title }