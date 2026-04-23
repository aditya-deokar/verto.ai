'use client';

import { cn } from '@/lib/utils'
import { useSlideStore } from '@/store/useSlideStore'
import { resolveThemeTokens } from '@/lib/themeUtils'
import { AlertCircle, AlertTriangle, CheckCircle, HelpCircle, Info } from 'lucide-react'
import React from 'react'

type Props = {
    type: 'success' | 'warning' | 'info' | 'question' | 'caution'
    children: React.ReactNode
    className?: string
}

const icons = {
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info,
    question: HelpCircle,
    caution: AlertCircle,
}

const colorTokens = {
    success: {
        hue: '142',
        lightBg: 'rgba(34, 197, 94, 0.08)',
        darkBg: 'rgba(34, 197, 94, 0.12)',
        lightText: '#15803d',
        darkText: '#4ade80',
        accent: '#22c55e',
    },
    warning: {
        hue: '45',
        lightBg: 'rgba(234, 179, 8, 0.08)',
        darkBg: 'rgba(234, 179, 8, 0.12)',
        lightText: '#a16207',
        darkText: '#facc15',
        accent: '#eab308',
    },
    info: {
        hue: '217',
        lightBg: 'rgba(59, 130, 246, 0.08)',
        darkBg: 'rgba(59, 130, 246, 0.12)',
        lightText: '#1d4ed8',
        darkText: '#60a5fa',
        accent: '#3b82f6',
    },
    question: {
        hue: '270',
        lightBg: 'rgba(168, 85, 247, 0.08)',
        darkBg: 'rgba(168, 85, 247, 0.12)',
        lightText: '#7e22ce',
        darkText: '#c084fc',
        accent: '#a855f7',
    },
    caution: {
        hue: '0',
        lightBg: 'rgba(239, 68, 68, 0.08)',
        darkBg: 'rgba(239, 68, 68, 0.12)',
        lightText: '#b91c1c',
        darkText: '#f87171',
        accent: '#ef4444',
    },
}

const CalloutBox = ({ type, children, className }: Props) => {
    const { currentTheme } = useSlideStore();
    const Icon = icons[type];
    const tokens = colorTokens[type];
    const isDark = currentTheme.type === 'dark';
    const themeTokens = resolveThemeTokens(currentTheme);

    return (
        <div
            className={cn(
                'relative p-5 rounded-xl flex items-start overflow-hidden transition-all duration-300',
                className
            )}
            style={{
                backgroundColor: isDark ? tokens.darkBg : tokens.lightBg,
                border: `1px solid ${tokens.accent}20`,
                borderRadius: themeTokens.borderRadius,
            }}
        >
            {/* Gradient accent left bar */}
            <div
                className="absolute left-0 top-0 w-1 h-full rounded-l-xl"
                style={{
                    background: `linear-gradient(to bottom, ${tokens.accent}, ${tokens.accent}60, ${tokens.accent}20)`,
                }}
            />

            {/* Icon with gradient background */}
            <div
                className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mr-4 shadow-sm"
                style={{
                    background: `linear-gradient(135deg, ${tokens.accent}20, ${tokens.accent}10)`,
                    border: `1px solid ${tokens.accent}25`,
                }}
            >
                <Icon
                    className="h-4.5 w-4.5"
                    style={{ color: isDark ? tokens.darkText : tokens.lightText }}
                />
            </div>

            {/* Content */}
            <div
                className="flex-1 w-full mt-1"
                style={{ color: isDark ? tokens.darkText : tokens.lightText }}
            >
                {children}
            </div>
        </div>
    );
};

export default CalloutBox