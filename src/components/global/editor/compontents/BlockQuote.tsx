'use client';

import { cn } from '@/lib/utils';
import { useSlideStore } from '@/store/useSlideStore';
import { resolveThemeTokens } from '@/lib/themeUtils';
import React from 'react';

type Props = {
    children: React.ReactNode;
    className?: string;
};

const BlockQuote = ({ children, className }: Props) => {
    const { currentTheme } = useSlideStore();
    const tokens = resolveThemeTokens(currentTheme);

    return (
        <div
            className={cn(
                'relative pl-8 py-4 my-4 overflow-hidden',
                className
            )}
        >
            {/* Gradient accent left border */}
            <div
                className="absolute left-0 top-0 w-1 h-full rounded-full"
                style={{
                    background: tokens.accentGradient,
                }}
            />

            {/* Large decorative quotation mark */}
            <div
                className="absolute -top-2 left-3 text-7xl font-serif leading-none pointer-events-none select-none"
                style={{
                    color: currentTheme.accentColor,
                    opacity: 0.12,
                    fontFamily: 'Georgia, "Times New Roman", serif',
                }}
            >
                &#x201C;
            </div>

            {/* Quote content */}
            <div className="relative z-10 italic" style={{ fontStyle: 'italic' }}>
                {children}
            </div>
        </div>
    );
};

export default BlockQuote;