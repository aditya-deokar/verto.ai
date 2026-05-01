import { Button } from '@/components/ui/button'
import { containerVariants, CreatePageCard, itemVariants } from '@/lib/constants'
import usePromptStore from '@/store/usePromptStore'
import { motion } from 'framer-motion'
import { ChevronLeft, Play, Sparkles, Brain, LayoutTemplate, Plus, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useMemo } from 'react'
import RecentPrompts from './RecentPrompts'

type Props = {
    onSelectOption: (option: string) => void
}

const iconMap: Record<string, React.ReactNode> = {
    'streamable-slides': <Play className="h-6 w-6 md:h-8 md:w-8" />,
    'creative-ai': <Sparkles className="h-5 w-5" />,
    'agentic-workflow': <Brain className="h-5 w-5" />,
    'template': <LayoutTemplate className="h-5 w-5" />,
    'create-scratch': <Plus className="h-5 w-5" />
};

const gradientMap: Record<string, string> = {
    'streamable-slides': 'from-violet-600 via-fuchsia-600 to-pink-600',
    'creative-ai': 'from-blue-600 to-cyan-500',
    'agentic-workflow': 'from-emerald-500 to-teal-500',
    'template': 'from-orange-500 to-amber-500',
    'create-scratch': 'from-slate-600 to-slate-500'
};

const CreatePage = ({ onSelectOption }: Props) => {
    const { prompts, setPage } = usePromptStore();
    const router = useRouter();

    useEffect(() => {
        setPage('create')
    }, [setPage])

    // Reorder so streamable-slides is first for the bento grid (4-span + 2-span = row 1)
    const orderedCards = useMemo(() => {
        return [...CreatePageCard].sort((a, b) => {
            if (a.type === 'streamable-slides') return -1;
            if (b.type === 'streamable-slides') return 1;
            return 0;
        });
    }, []);

    return (
        <motion.div
            initial='hidden'
            animate='visible'
            className='space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16'
            variants={containerVariants} >
            
            <div className="w-full flex justify-start pt-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full px-6 transition-all"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>
            </div>

            <motion.div variants={itemVariants} className='text-center space-y-6 max-w-3xl mx-auto mt-8 mb-12'>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm text-sm font-medium text-muted-foreground mb-2 shadow-xs">
                    <Sparkles className="w-4 h-4 text-violet-500" />
                    Intelligent Presentation Builder
                </div>
                <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight'>
                    How would you like to <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 via-fuchsia-500 to-orange-500">get started?</span>
                </h1>
                <p className='text-lg md:text-xl text-muted-foreground leading-relaxed'>
                    Choose your preferred method to begin crafting your next masterpiece.
                </p>
            </motion.div>

            <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-6 gap-6">
                {orderedCards.map((option) => {
                    const isFeatured = option.type === 'streamable-slides';
                    const gradient = gradientMap[option.type] || 'from-primary to-primary/50';
                    const icon = iconMap[option.type] || <Sparkles className="w-5 h-5" />;

                    return (
                        <motion.div
                            key={option.type}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectOption(option.type)}
                            className={`group relative cursor-pointer overflow-hidden rounded-3xl border border-border/50 bg-background/50 backdrop-blur-xl transition-all duration-500 hover:border-border hover:shadow-2xl hover:shadow-foreground/5
                                ${isFeatured ? 'md:col-span-4 min-h-[320px]' : 'md:col-span-2 min-h-[260px]'}`}
                        >
                            {/* Background Glow */}
                            <div className={`absolute ${isFeatured ? '-inset-32 blur-[100px]' : '-right-20 -top-20 w-48 h-48 blur-[60px]'} bg-linear-to-br ${gradient} opacity-0 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none`} />

                            <div className={`relative h-full p-8 flex flex-col justify-between ${isFeatured ? 'md:p-10' : ''}`}>
                                <div className="space-y-6">
                                    <div className={`
                                        ${isFeatured ? 'w-16 h-16 md:w-20 md:h-20 rounded-2xl' : 'w-12 h-12 rounded-xl'} 
                                        bg-linear-to-br ${gradient} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500
                                    `}>
                                        {icon}
                                    </div>
                                    <div>
                                        <p className={`${isFeatured ? 'text-xl' : 'text-sm'} font-medium text-muted-foreground mb-2`}>
                                            {option.title}
                                        </p>
                                        <h3 className={`
                                            ${isFeatured ? 'text-4xl md:text-5xl' : 'text-2xl'} 
                                            font-bold text-foreground transition-colors duration-500
                                        `}>
                                            <span className={`bg-clip-text group-hover:text-transparent bg-linear-to-br ${gradient} transition-all duration-500`}>
                                                {option.highlightedText}
                                            </span>
                                        </h3>
                                    </div>
                                </div>
                                
                                <div className={`flex items-end justify-between ${isFeatured ? 'mt-8' : 'mt-6'}`}>
                                    <p className={`
                                        ${isFeatured ? 'text-lg max-w-md' : 'text-sm'} 
                                        text-muted-foreground leading-relaxed line-clamp-3
                                    `}>
                                        {option.description}
                                    </p>
                                    
                                    <div className={`
                                        ${isFeatured ? 'p-4' : 'p-3'} 
                                        rounded-full bg-linear-to-br ${gradient} text-white opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 shadow-xl shrink-0 ml-4
                                    `}>
                                        <ArrowRight className={`${isFeatured ? 'w-6 h-6' : 'w-4 h-4'}`} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>

            {prompts.length > 0 && (
                <motion.div variants={itemVariants} className="pt-8 border-t border-border/50">
                    <RecentPrompts />
                </motion.div>
            )}

        </motion.div>
    )
}

export default CreatePage