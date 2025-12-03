import { cn } from '@/lib/utils'
import { useSlideStore } from '@/store/useSlideStore'
import { Quote } from 'lucide-react'

interface BlockQuoteProps extends React.HTMLAttributes<HTMLQuoteElement> {
    children: React.ReactNode
    className?: string
}
const BlockQuote = ({ children, className, ...props }: BlockQuoteProps) => {

    const { currentTheme } = useSlideStore();

    return (
        <blockquote className={cn(
            'relative pl-8 pr-4 py-4 my-6 border-l-4 rounded-r-lg bg-opacity-5',
            'text-xl md:text-2xl italic font-serif leading-relaxed',
            'text-gray-700 dark:text-gray-300',
            className
        )}
            style={{
                borderLeftColor: currentTheme.accentColor,
                backgroundColor: `${currentTheme.accentColor}10`, // 10% opacity
            }}
            {...props}
        >
            <Quote
                className="absolute top-2 left-2 w-4 h-4 opacity-40"
                style={{ color: currentTheme.accentColor }}
            />
            <div className="relative z-10">
                {children}
            </div>
        </blockquote>
    )
}

export default BlockQuote