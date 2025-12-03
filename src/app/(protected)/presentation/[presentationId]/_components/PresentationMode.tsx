'use client'
import { useSlideStore } from '@/store/useSlideStore'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useState, useRef } from 'react'
import { MasterRecursiveComponent } from './editor/MasterRecursiveComponent'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, X, Settings2, Maximize, Minimize, Clock, LayoutGrid, PlayCircle, PauseCircle } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'

type Props = {
    onClose: () => void
}

type TransitionType = 'fade' | 'slide' | 'scale' | 'flip' | 'cube'

const PresentationMode = ({ onClose }: Props) => {
    const { currentTheme, getOrderedSlides } = useSlideStore();
    const slides = getOrderedSlides();
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [transitionType, setTransitionType] = useState<TransitionType>('slide');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showTimer, setShowTimer] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [showThumbnails, setShowThumbnails] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const isLastSlide = currentSlideIndex === slides.length - 1

    // Timer logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const goToPreviousSlide = () => {
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))
    }

    const goToNextSlide = () => {
        if (currentSlideIndex === slides.length - 1) {
            onClose()
        } else {
            setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))
        }
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === ' ') {
                if (currentSlideIndex === slides.length - 1) {
                    onClose()
                } else {
                    setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))
                }
            } else if (e.key === 'ArrowLeft') {
                setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))
            } else if (e.key === 'Escape') {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                    setIsFullscreen(false);
                } else {
                    onClose();
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [slides.length, onClose, currentSlideIndex])

    const getTransitionVariants = (type: TransitionType) => {
        switch (type) {
            case 'fade':
                return {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 }
                }
            case 'scale':
                return {
                    initial: { opacity: 0, scale: 0.8 },
                    animate: { opacity: 1, scale: 1 },
                    exit: { opacity: 0, scale: 1.2 }
                }
            case 'flip':
                return {
                    initial: { opacity: 0, rotateY: 90 },
                    animate: { opacity: 1, rotateY: 0 },
                    exit: { opacity: 0, rotateY: -90 }
                }
            case 'cube':
                return {
                    initial: { opacity: 0, rotateX: 90 },
                    animate: { opacity: 1, rotateX: 0 },
                    exit: { opacity: 0, rotateX: -90 }
                }
            default: // slide
                return {
                    initial: { x: '100%', opacity: 0 },
                    animate: { x: 0, opacity: 1 },
                    exit: { x: '-100%', opacity: 0 }
                }
        }
    }

    return (
        <div ref={containerRef} className='fixed inset-0 bg-black flex items-center justify-center z-50 group'>
            <div className='relative w-full h-full overflow-hidden'
                style={{
                    aspectRatio: '16/9',
                    maxHeight: '100vh',
                    maxWidth: '177.78vh'
                }}
            >
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentSlideIndex}
                        {...getTransitionVariants(transitionType)}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className={`w-full h-full flex flex-col ${slides[currentSlideIndex].className}`}
                        style={{
                            backgroundColor: currentTheme.slideBackgroundColor,
                            backgroundImage: currentTheme.gradientBackground,
                            color: currentTheme.fontColor,
                            fontFamily: currentTheme.fontFamily
                        }}
                    >
                        <MasterRecursiveComponent
                            content={slides[currentSlideIndex].content}
                            onContentChange={() => { }}
                            slideId={slides[currentSlideIndex].id}
                            isPreview={false}
                            isEditable={false}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Top Controls Overlay */}
                <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50">
                    <div className="flex items-center gap-4">
                        <div className='text-white bg-black/50 px-3 py-1 rounded-md text-sm font-medium backdrop-blur-sm'>
                            {currentSlideIndex + 1} / {slides.length}
                        </div>

                        {showTimer && (
                            <div className='flex items-center gap-2 text-white bg-black/50 px-3 py-1 rounded-md text-sm font-medium backdrop-blur-sm'>
                                <Clock className="w-4 h-4" />
                                {formatTime(elapsedTime)}
                                <button onClick={() => setIsTimerRunning(!isTimerRunning)} className="hover:text-primary transition-colors">
                                    {isTimerRunning ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("text-white hover:bg-white/20 transition-all", showTimer && "bg-white/20")}
                            onClick={() => {
                                setShowTimer(!showTimer);
                                if (!showTimer) setIsTimerRunning(true);
                            }}
                            title="Toggle Timer"
                        >
                            <Clock className="h-5 w-5" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn("text-white hover:bg-white/20 transition-all", showThumbnails && "bg-white/20")}
                            onClick={() => setShowThumbnails(!showThumbnails)}
                            title="Toggle Thumbnails"
                        >
                            <LayoutGrid className="h-5 w-5" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20 transition-all"
                            onClick={toggleFullscreen}
                            title="Toggle Fullscreen"
                        >
                            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 transition-all">
                                    <Settings2 className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Transition Effect</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => setTransitionType('slide')}>Slide</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTransitionType('fade')}>Fade</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTransitionType('scale')}>Zoom</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTransitionType('flip')}>Flip</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTransitionType('cube')}>Cube</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant={'ghost'}
                            size={'icon'}
                            className='text-white hover:bg-white/20 transition-colors'
                            onClick={onClose}
                            aria-label="Close presentation"
                        >
                            <X className='h-6 w-6' />
                        </Button>
                    </div>
                </div>

                {/* Bottom Navigation Controls */}
                <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50'>
                    <Button
                        variant={'outline'}
                        size={'icon'}
                        onClick={goToPreviousSlide}
                        disabled={currentSlideIndex === 0}
                        className='h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white border-white/20 backdrop-blur-md transition-all hover:scale-110'
                    >
                        <ChevronLeft className='h-6 w-6' />
                    </Button>

                    <Button
                        variant={'outline'}
                        size={'icon'}
                        onClick={goToNextSlide}
                        disabled={isLastSlide}
                        className='h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white border-white/20 backdrop-blur-md transition-all hover:scale-110'
                    >
                        <ChevronRight className='h-6 w-6' />
                    </Button>
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-50">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                {/* Thumbnail Strip */}
                <AnimatePresence>
                    {showThumbnails && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="absolute bottom-24 left-0 w-full p-4 flex justify-center gap-2 z-50 overflow-x-auto"
                        >
                            <div className="flex gap-2 bg-black/50 p-2 rounded-xl backdrop-blur-md">
                                {slides.map((slide, index) => (
                                    <button
                                        key={slide.id}
                                        onClick={() => setCurrentSlideIndex(index)}
                                        className={cn(
                                            "w-24 h-14 rounded border transition-all overflow-hidden relative",
                                            currentSlideIndex === index
                                                ? "border-primary ring-2 ring-primary ring-offset-1 ring-offset-black"
                                                : "border-white/20 hover:border-white/50 opacity-70 hover:opacity-100"
                                        )}
                                        style={{
                                            backgroundColor: currentTheme.slideBackgroundColor,
                                        }}
                                    >
                                        <div className="scale-[0.25] origin-top-left w-[400%] h-[400%] pointer-events-none">
                                            <MasterRecursiveComponent
                                                content={slide.content}
                                                onContentChange={() => { }}
                                                slideId={slide.id}
                                                isPreview={true}
                                                isEditable={false}
                                            />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default PresentationMode