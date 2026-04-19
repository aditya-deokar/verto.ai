import { cn } from '@/lib/utils'
import { AlertCircle, AlertTriangle, CheckCircle, HelpCircle, Info } from 'lucide-react'
import React from 'react'

type Props = {
    type: 'success' | 'warning' | 'info' | 'question' | 'caution'
    children : React.ReactNode
    className?: string
}

const icons = {
    success: CheckCircle,
    warning: AlertTriangle,
    info: Info,
    question: HelpCircle,
    caution: AlertCircle,
}

const  CalloutBox = ({ type, children, className }: Props) => {
  
    const Icon = icons[type]

    const colors = {
        success: {
            bg: 'bg-green-500/10 dark:bg-green-500/20',
            border: 'border-green-500/50',
            text: 'text-green-700 dark:text-green-400',
        },
        warning: {
            bg: 'bg-yellow-500/10 dark:bg-yellow-500/20',
            border: 'border-yellow-500/50',
            text: 'text-yellow-700 dark:text-yellow-400',
        },
        info: {
            bg: 'bg-blue-500/10 dark:bg-blue-500/20',
            border: 'border-blue-500/50',
            text: 'text-blue-700 dark:text-blue-400',
        },
        question: {
            bg: 'bg-purple-500/10 dark:bg-purple-500/20',
            border: 'border-purple-500/50',
            text: 'text-purple-700 dark:text-purple-400',
        },
        caution: {
            bg: 'bg-red-500/10 dark:bg-red-500/20',
            border: 'border-red-500/50',
            text: 'text-red-700 dark:text-red-400',
        },
    }

    return <div
             className={cn(
                'p-5 rounded-xl border flex items-start backdrop-blur-md shadow-sm transition-all duration-300',
                colors[type].bg,
                colors[type].border,
                colors[type].text,
                className
             )}
           >
                <div className={cn("p-2 rounded-full bg-background/50 mr-4 shadow-sm", colors[type].border, "border")}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 w-full mt-1.5">{children}</div>
           </div>;
};

export default CalloutBox