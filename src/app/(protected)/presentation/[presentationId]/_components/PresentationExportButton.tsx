'use client'

import React, { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { useSlideStore } from '@/store/useSlideStore'
import { MasterRecursiveComponent } from './editor/MasterRecursiveComponent'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Slide, Theme } from '@/lib/types'

function sanitizeFileName(input: string) {
    return input
        .trim()
        .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80) || 'presentation'
}

const ExportSlide = ({ slide, theme }: { slide: Slide; theme: Theme }) => {
    return (
        <div
            data-export-slide="true"
            className={cn('relative overflow-hidden')}
            style={{
                width: 960,
                height: 540,
                backgroundColor: theme.slideBackgroundColor || theme.backgroundColor,
                backgroundImage: theme.gradientBackground,
                color: theme.fontColor,
                fontFamily: theme.fontFamily,
            }}
        >
            <div className="h-full w-full p-8 pointer-events-none select-none">
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

const PresentationExportButton = () => {
    const { project, currentTheme, getOrderedSlides } = useSlideStore()
    const [isExporting, setIsExporting] = useState(false)
    const exportContainerRef = useRef<HTMLDivElement>(null)

    const handleExportPdf = async () => {
        const orderedSlides = getOrderedSlides()

        if (!project || orderedSlides.length === 0) {
            toast.error('Nothing to export', {
                description: 'Generate or add slides before exporting.',
            })
            return
        }

        setIsExporting(true)

        try {
            await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
            await new Promise((resolve) => setTimeout(resolve, 100))

            const slideNodes = Array.from(
                exportContainerRef.current?.querySelectorAll<HTMLElement>('[data-export-slide="true"]') ?? []
            )

            if (slideNodes.length === 0) {
                throw new Error('Export renderer did not produce any slides.')
            }

            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [960, 540],
                compress: true,
            })

            for (let index = 0; index < slideNodes.length; index++) {
                const slideNode = slideNodes[index]
                const canvas = await html2canvas(slideNode, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: currentTheme.slideBackgroundColor || currentTheme.backgroundColor,
                    width: 960,
                    height: 540,
                    windowWidth: 960,
                    windowHeight: 540,
                })

                const imageData = canvas.toDataURL('image/png')

                if (index > 0) {
                    pdf.addPage([960, 540], 'landscape')
                }

                pdf.addImage(imageData, 'PNG', 0, 0, 960, 540, undefined, 'FAST')
            }

            pdf.save(`${sanitizeFileName(project.title)}.pdf`)
            toast.success('PDF exported', {
                description: 'Your presentation PDF has been downloaded.',
            })
        } catch (error) {
            console.error(error)
            toast.error('Export failed', {
                description: error instanceof Error ? error.message : 'Please try again.',
            })
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="gap-2 hover:bg-muted/30"
                onClick={handleExportPdf}
                disabled={isExporting}
                style={{ color: currentTheme.accentColor }}
            >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span className="hidden sm:inline">Export PDF</span>
            </Button>

            <div
                ref={exportContainerRef}
                aria-hidden="true"
                className="fixed left-[-20000px] top-0 pointer-events-none opacity-0"
            >
                {getOrderedSlides().map((slide) => (
                    <ExportSlide
                        key={slide.id}
                        slide={slide}
                        theme={currentTheme}
                    />
                ))}
            </div>
        </>
    )
}

export default PresentationExportButton
