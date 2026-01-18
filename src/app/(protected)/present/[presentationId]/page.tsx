'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { getProjectById } from '@/actions/projects'
import { themes } from '@/lib/constants'
import { useSlideStore } from '@/store/useSlideStore'
import { Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import { redirect, useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MasterRecursiveComponent } from '../../presentation/[presentationId]/_components/editor/MasterRecursiveComponent'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Theme } from '@/lib/types'
import { Slide } from '@/lib/types'

// Internal component for handling scaling logic
const SlideCanvas = ({ slide, currentTheme }: { slide: Slide, currentTheme: Theme }) => {
    const [scale, setScale] = useState(1)
    const containerRef = useRef<HTMLDivElement>(null)

    // Base resolution for the slide (matches typical editor width on laptop)
    const BASE_WIDTH = 960
    const BASE_HEIGHT = 540 // 16:9 aspect ratio

    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current) return

            // Get available window dimensions
            const windowWidth = window.innerWidth
            const windowHeight = window.innerHeight

            // Calculate scale to fit
            const scaleX = windowWidth / BASE_WIDTH
            const scaleY = windowHeight / BASE_HEIGHT

            // Use the smaller scale to ensure it fits entirely
            const newScale = Math.min(scaleX, scaleY)
            setScale(newScale)
        }

        // Initial calc
        handleResize()

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center overflow-hidden"
        >
            <div
                style={{
                    width: BASE_WIDTH,
                    height: BASE_HEIGHT,
                    transform: `scale(${scale})`,
                    backgroundColor: currentTheme.backgroundColor,
                    backgroundImage: currentTheme.gradientBackground,
                    color: currentTheme.fontColor, // Use fontColor, not accentColor for main text
                    fontFamily: currentTheme.fontFamily,
                }}
                className="relative shadow-2xl overflow-hidden rounded-xl"
            >
                {/* 
                  Matches Editor padding structure: 
                  Editor has p-8 on the container. Here we recreate that safe zone.
                */}
                <div className="w-full h-full p-8">
                    <MasterRecursiveComponent
                        content={slide.content}
                        onContentChange={() => { }}
                        isPreview={true} // Setting this to true disables drag handlers
                        isEditable={false}
                        slideId={slide.id}
                    />
                </div>
            </div>
        </div>
    )
}

const PresentationPage = () => {
    const { currentTheme, setCurrentTheme, setProject, setSlides, slides, currentSlide, setCurrentSlide } = useSlideStore();
    const params = useParams();
    const router = useRouter();
    const { setTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await getProjectById(params.presentationId as string);

                if (res?.status !== 200 || !res.data) {
                    toast.error('Error', {
                        description: "Failed to Fetch project",
                    });
                    redirect('/dashboard');
                }

                const findTheme = themes.find((theme) => theme.name === res.data.themeName)
                setCurrentTheme(findTheme || themes[0]);
                setTheme(findTheme?.type === "dark" ? 'dark' : 'light');

                setProject(res.data);
                setSlides(JSON.parse(JSON.stringify(res.data.slides)))

            } catch (error) {
                toast.error('Error', {
                    description: "An Unexpected Error Occured",
                });
            } finally {
                setIsLoading(false);
            }
        })()
    }, [params.presentationId, setCurrentTheme, setProject, setSlides, setTheme])

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

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' || e.key === 'Space') {
                handleNext();
            } else if (e.key === 'ArrowLeft') {
                handlePrev();
            } else if (e.key === 'Escape') {
                router.back();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, router]);

    if (isLoading) {
        return (
            <div className='flex items-center justify-center h-screen bg-background'>
                <Loader2 className='w-8 h-8 animate-spin text-primary' />
            </div>
        )
    }

    const slide = slides[currentSlide];

    return (
        <div className='w-full h-screen relative overflow-hidden bg-black flex flex-col items-center justify-center'>
            {/* Close / Exit Button */}
            <div className="absolute top-4 right-4 z-50 opacity-0 hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="icon" onClick={() => router.back()} className="rounded-full bg-black/50 hover:bg-black/70 text-white border-none">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Main Presentation Area */}
            {slide ? (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={slide.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                    >
                        <SlideCanvas slide={slide} currentTheme={currentTheme} />
                    </motion.div>
                </AnimatePresence>
            ) : (
                <div className="flex items-center justify-center h-full text-white">
                    Slide Not Found
                </div>
            )}

            {/* Navigation Controls (Floating Bottom) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 opacity-0 hover:opacity-100 transition-opacity duration-300 p-2 rounded-full bg-black/50 backdrop-blur-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrev}
                    disabled={currentSlide === 0}
                    className="text-white hover:bg-white/20 rounded-full"
                >
                    <ChevronLeft className="w-6 h-6" />
                </Button>

                <span className="text-white/80 text-sm font-medium min-w-12 text-center">
                    {currentSlide + 1} / {slides.length}
                </span>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentSlide === slides.length - 1}
                    className="text-white hover:bg-white/20 rounded-full"
                >
                    <ChevronRight className="w-6 h-6" />
                </Button>
            </div>
        </div>
    )
}

export default PresentationPage
