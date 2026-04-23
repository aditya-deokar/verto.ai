'use client';

import { cn } from '@/lib/utils';
import { useSlideStore } from '@/store/useSlideStore';
import { resolveThemeTokens } from '@/lib/themeUtils';
import React from 'react';

type Props = {
    className?: string;
};
const Divider = ({ className }: Props) => {
    const { currentTheme } = useSlideStore();
    const tokens = resolveThemeTokens(currentTheme);

    return (
        <div className={cn('flex items-center justify-center w-full my-6 gap-3', className)}>
            {/* Left gradient line */}
            <div
                className="flex-1 h-px rounded-full"
                style={{
                    background: tokens.accentGradient,
                    opacity: 0.3,
                }}
            />

            {/* Center diamond ornament */}
            <div
                className="w-1.5 h-1.5 rotate-45 rounded-[1px] flex-shrink-0"
                style={{
                    backgroundColor: currentTheme.accentColor,
                    opacity: 0.5,
                }}
            />

            {/* Right gradient line */}
            <div
                className="flex-1 h-px rounded-full"
                style={{
                    background: tokens.accentGradient,
                    opacity: 0.3,
                }}
            />
        </div>
    );
};

export default Divider;