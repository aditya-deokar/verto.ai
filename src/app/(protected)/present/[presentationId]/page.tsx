'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { getProjectById } from '@/actions/projects'
import { themes } from '@/lib/constants'
import { useSlideStore } from '@/store/useSlideStore'
import {
    Loader2,
    ChevronLeft,
    ChevronRight,
    X,
    LayoutGrid,
    Maximize2,
    Minimize2,
    Play,
    Share2,
    Settings2
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { redirect, useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MasterRecursiveComponent } from '../../presentation/[presentationId]/_components/editor/MasterRecursiveComponent'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Theme, Slide } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// --- Scaling Logic for Slide ---
const SlideCanvas = ({ slide, currentTheme, scale = 1, isMobile = false }: { slide: Slide, currentTheme: Theme, scale?: number, isMobile?: boolean }) => {
    // Base resolution matches editor
    const BASE_WIDTH = 960
    const BASE_HEIGHT = 540

    return (
        <div
            style={{
                width: isMobile ? "100%" : BASE_WIDTH,
                height: isMobile ? "auto" : BASE_HEIGHT,
                minHeight: isMobile ? "100vh" : BASE_HEIGHT,
                transform: isMobile ? "none" : `scale(${scale})`,
                backgroundColor: currentTheme.backgroundColor,
                backgroundImage: currentTheme.gradientBackground,
                color: currentTheme.fontColor,
                fontFamily: currentTheme.fontFamily,
            }}
            className={cn(
                "relative shadow-2xl overflow-hidden origin-center transition-all duration-300",
                isMobile ? "rounded-none overflow-y-auto" : "rounded-xl"
            )}
        >
            <div className={cn(
                "w-full h-full select-none pointer-events-none",
                isMobile ? "p-4" : "p-8"
            )}>
                <MasterRecursiveComponent
                    content={slide.content}
                    onContentChange={() => { }}
                    isPreview={true}
                    isEditable={false}
                    slideId={slide.id}
                />
            </div>
        </div>
    )
}

// Animation Variants
type TransitionType = 'slide' | 'fade' | 'scale' | 'stack'

const transitions: Record<TransitionType, any> = {
    slide: {
        initial: { x: 50, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -50, opacity: 0 },
        transition: { duration: 0.5, ease: "easeOut" }
    },
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.6 }
    },
    scale: {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        exit: { scale: 1.1, opacity: 0 },
        transition: { duration: 0.5 }
    },
    stack: {
        initial: { y: 100, opacity: 0, scale: 0.9 },
        animate: { y: 0, opacity: 1, scale: 1 },
        exit: { y: -50, opacity: 0, scale: 0.95 },
        transition: { duration: 0.5, type: "spring", bounce: 0.2 }
    }
}

const PresentationPage = () => {
    const { currentTheme, setCurrentTheme, setProject, setSlides, slides, currentSlide, setCurrentSlide } = useSlideStore();
    const params = useParams();
    const router = useRouter();
    const { setTheme } = useTheme();

    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [isGridView, setIsGridView] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [scale, setScale] = useState(1);
    const [isMobile, setIsMobile] = useState(false);
    const [transitionType, setTransitionType] = useState<TransitionType>('slide');

    const containerRef = useRef<HTMLDivElement>(null);
    const [mouseIdle, setMouseIdle] = useState(false);
    let idleTimer: NodeJS.Timeout;

    const currentSlideData = slides[currentSlide];

    // --- Init & Data Fetching ---
    useEffect(() => {
        (async () => {
            try {
                const res = await getProjectById(params.presentationId as string);
                if (res?.status !== 200 || !res.data) {
                    toast.error('Error', { description: "Failed to Fetch project" });
                    redirect('/dashboard');
                }

                const findTheme = themes.find((theme) => theme.name === res.data.themeName)
                setCurrentTheme(findTheme || themes[0]);
                setTheme(findTheme?.type === "dark" ? 'dark' : 'light');

                setProject(res.data);
                setSlides(JSON.parse(JSON.stringify(res.data.slides)))
                setCurrentSlide(0)

            } catch (error) {
                toast.error('Error', { description: "An Unexpected Error Occured" });
            } finally {
                setIsLoading(false);
            }
        })()
    }, [params.presentationId, setCurrentTheme, setProject, setSlides, setTheme])

    // --- Resizing Logic ---
    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return
            const width = window.innerWidth;
            const mobileBreakpoint = 768; // Standard tablet/mobile breakpoint

            setIsMobile(width < mobileBreakpoint);

            if (width >= mobileBreakpoint) {
                const padding = 64;
                const availableWidth = width - padding;
                const availableHeight = window.innerHeight - padding;
                const BASE_WIDTH = 960;
                const BASE_HEIGHT = 540;

                const scaleX = availableWidth / BASE_WIDTH
                const scaleY = availableHeight / BASE_HEIGHT
                setScale(Math.min(scaleX, scaleY))
            } else {
                setScale(1); // No scaling on mobile, rely on fluid width
            }
        }

        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])


    // --- Navigation Handlers ---
    const handleNext = useCallback(() => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    }, [currentSlide, slides.length, setCurrentSlide]);

    const handlePrev = useCallback(() => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    }, [currentSlide, setCurrentSlide]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // --- Keyboard Navigation ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isGridView) {
                if (e.key === 'Escape') setIsGridView(false);
                return;
            }

            if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') handleNext();
            else if (e.key === 'ArrowLeft') handlePrev();
            else if (e.key === 'Escape') {
                if (document.fullscreenElement) document.exitFullscreen();
                else router.back();
            }
            else if (e.key.toLowerCase() === 'g') setIsGridView(prev => !prev);
            else if (e.key.toLowerCase() === 'f') toggleFullscreen();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, router, isGridView]);

    // --- Mouse Idle Check for Hiding Controls ---
    const handleMouseMove = () => {
        setMouseIdle(false);
        clearTimeout(idleTimer);
        idleTimer = setTimeout(() => setMouseIdle(true), 3000);
    };

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(idleTimer);
        }
    }, []);


    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-screen bg-[#101010]'>
                <Loader2 className='w-10 h-10 animate-spin text-primary' />
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div
                ref={containerRef}
                className='w-full h-screen relative overflow-hidden bg-[#101010] text-white selection:bg-primary/30'
            >
                {/* ... (Top Bar remains same) ... */}

                {/* Top Bar: Progress & Exit */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: mouseIdle && !isGridView ? 0 : 1, y: mouseIdle && !isGridView ? -20 : 0 }}
                    className="absolute top-0 left-0 w-full z-50 p-4 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent h-24"
                >
                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 h-1 bg-primary transition-all duration-500 ease-out"
                        style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                    />

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10" onClick={() => router.back()}>
                            <X className="w-5 h-5 mr-2" /> Exit
                        </Button>
                    </div>

                </motion.div>

                {/* Main Content Area */}
                <div className="w-full h-full flex items-center justify-center relative">
                    <AnimatePresence mode="wait">
                        {!isGridView && currentSlideData && (
                            <motion.div
                                key={currentSlide}
                                {...transitions[transitionType]}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <SlideCanvas slide={currentSlideData} currentTheme={currentTheme} scale={scale} isMobile={isMobile} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ... (Grid View Overlay remains same) ... */}
                    <AnimatePresence>
                        {isGridView && (
                            <motion.div
                                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                                animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
                                exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                                className="absolute inset-0 z-40 bg-black/60 overflow-y-auto p-12"
                            >
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                                    {slides.map((slide, idx) => (
                                        <motion.div
                                            key={slide.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => {
                                                setCurrentSlide(idx);
                                                setIsGridView(false);
                                            }}
                                            className={cn(
                                                "relative aspect-video rounded-xl overflow-hidden cursor-pointer ring-2 transition-all duration-300 group",
                                                currentSlide === idx ? "ring-primary scale-105 shadow-2xl shadow-primary/20" : "ring-transparent hover:ring-white/50 hover:scale-105"
                                            )}
                                        >
                                            <div className="absolute inset-0 pointer-events-none transform origin-top-left" style={{ transform: 'scale(0.25)', width: '400%', height: '400%' }}>
                                                <div className="w-full h-full p-8" style={{
                                                    backgroundColor: currentTheme.backgroundColor,
                                                    backgroundImage: currentTheme.gradientBackground,
                                                    color: currentTheme.fontColor,
                                                    fontFamily: currentTheme.fontFamily,
                                                }}>
                                                    <MasterRecursiveComponent
                                                        content={slide.content}
                                                        onContentChange={() => { }}
                                                        isPreview={true}
                                                        isEditable={false}
                                                        slideId={slide.id}
                                                    />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                                                {idx + 1}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Floating Control Dock */}
                {/* ... (Dock remains same) ... */}
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: mouseIdle && !isGridView ? 100 : 0, opacity: mouseIdle && !isGridView ? 0 : 1 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50"
                >
                    <div className="flex items-center gap-2 p-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-black/50 transition-colors">

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handlePrev}
                                    disabled={currentSlide === 0}
                                    className="rounded-full text-white hover:bg-white/10 w-10 h-10"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Previous (Left Arrow)</TooltipContent>
                        </Tooltip>

                        <div className="flex items-center gap-1 px-4 text-sm font-medium text-white/90 min-w-[80px] justify-center font-mono">
                            <span className="text-primary">{currentSlide + 1}</span>
                            <span className="text-white/30">/</span>
                            <span>{slides.length}</span>
                        </div>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleNext}
                                    disabled={currentSlide === slides.length - 1}
                                    className="rounded-full text-white hover:bg-white/10 w-10 h-10"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Next (Space/Right Arrow)</TooltipContent>
                        </Tooltip>

                        <div className="w-px h-6 bg-white/10 mx-2" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsGridView(!isGridView)}
                                    className={cn("rounded-full text-white hover:bg-white/10 w-10 h-10", isGridView && "bg-white/20 text-primary")}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Grid View (G)</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleFullscreen}
                                    className="rounded-full text-white hover:bg-white/10 w-10 h-10"
                                >
                                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Fullscreen (F)</TooltipContent>
                        </Tooltip>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10 w-10 h-10">
                                    <Settings2 className="w-5 h-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl" side="top">
                                <DropdownMenuLabel>Transition</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/10" />
                                {(['slide', 'fade', 'scale', 'stack'] as TransitionType[]).map((t) => (
                                    <DropdownMenuItem
                                        key={t}
                                        onClick={() => setTransitionType(t)}
                                        className={cn("cursor-pointer capitalize", transitionType === t && "text-primary")}
                                    >
                                        {t}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                    </div>
                </motion.div>

            </div>
        </TooltipProvider>
    )
}

export default PresentationPage
