import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useSlideStore } from '@/store/useSlideStore'
import React from 'react'

type Props = {
    code?: string
    language?: string
    onChange: (newCode: string) => void
    className?: string
}

const CodeBlock = ({ code, language = 'javascript', onChange, className }: Props) => {
    const { currentTheme } = useSlideStore()

    return (
        <div className={cn("rounded-lg overflow-hidden shadow-lg my-4", className)}
            style={{ backgroundColor: '#1e1e1e' }} // Always dark background for code looks better usually, or use theme
        >
            <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-[#3e3e3e]">
                <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="ml-4 text-xs text-gray-400 font-mono">{language}</span>
            </div>
            <div className="p-4 overflow-x-auto">
                <textarea
                    value={code}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full min-h-[100px] bg-transparent outline-hidden font-mono text-base resize-none"
                    style={{
                        color: '#d4d4d4',
                        fontFamily: "'Fira Code', 'Consolas', monospace"
                    }}
                    spellCheck={false}
                />
            </div>
        </div>
    )
}

export default CodeBlock