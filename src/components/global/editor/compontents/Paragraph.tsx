import { cn } from '@/lib/utils'
import { useSlideStore } from '@/store/useSlideStore'
import React, { useEffect, useRef } from 'react'

interface ParagraphProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string
    styles?: React.CSSProperties
    isPreview?: boolean
}

const Paragraph = React.forwardRef<HTMLTextAreaElement, ParagraphProps>(
    ({ className, styles, isPreview = false, ...props }, ref) => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);

        const { currentTheme } = useSlideStore();

        useEffect(() => {
            const textarea = textareaRef.current

            if (textarea && !isPreview) {
                const adjustHeight = () => {
                    textarea.style.height = '0';
                    textarea.style.height = `${textarea.scrollHeight}px`
                }

                textarea.addEventListener('input', adjustHeight);
                adjustHeight();

                return () => textarea.removeEventListener('input', adjustHeight)
            }
        }, [isPreview]);


        return (
            <textarea
                className={cn(
                    `w-full bg-transparent font-normal placeholder:text-muted-foreground/30 focus:placeholder:text-muted-foreground/10 focus:outline-hidden transition-colors duration-200 resize-none leading-relaxed tracking-wide hover:bg-black/5 dark:hover:bg-white/5 focus:bg-transparent rounded-md`,
                    isPreview ? 'text-sm leading-normal cursor-default pointer-events-none hover:bg-transparent dark:hover:bg-transparent' : 'text-xl',
                    className
                )}
                style={{
                    padding: 0,
                    margin: 0,
                    color: styles?.color || currentTheme.fontColor,
                    boxSizing: 'content-box',
                    lineHeight: '1.6',
                    minHeight: '1.6em',
                    ...styles
                }}

                ref={(el) => {
                    (textareaRef.current as HTMLTextAreaElement | null) = el

                    if (typeof ref === 'function') ref(el)
                    else if (ref) ref.current = el
                }}

                readOnly={isPreview}
                {...props}
            ></textarea>
        )

    })

export default Paragraph