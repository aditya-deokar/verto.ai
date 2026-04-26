'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import React, { useState } from 'react'

type Props = {
    src: string
    alt: string
    className?: string
    isPreview?: boolean
    contentId: string
    onContentChange: (
        contentId: string,
        newContent: string | string[] | string[][]
    ) => void
    isEditable?: boolean
}

const CustomImage = ({
    src,
    alt,
    className,
    isPreview = false,
    contentId,
    onContentChange,
    isEditable = true,
}: Props) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={cn(
                "relative w-full h-full rounded-xl overflow-hidden group transition-all duration-500",
                !isPreview && "hover:shadow-xl",
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Image
                src={src}
                alt={alt}
                width={800}
                height={600}
                className={cn(
                    "w-full h-full object-cover transition-transform duration-700 ease-out",
                    !isPreview && isHovered && "scale-[1.03]"
                )}
            />

            {/* Subtle bottom gradient overlay for text readability */}
            <div
                className="absolute inset-x-0 bottom-0 h-1/4 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.15), transparent)',
                }}
            />
        </div>
    )
}

export default CustomImage