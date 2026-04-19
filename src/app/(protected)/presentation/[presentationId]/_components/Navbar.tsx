'use client'

import { publishProject, unpublishProject } from '@/actions/project-share'
import { ThemeSwitcher } from '@/components/global/mode-toggle'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Home from '@/icons/Home'
import { Share } from '@/icons/Share'
import { useSlideStore } from '@/store/useSlideStore'
import { Globe, Layers, Loader2, Lock, Play } from 'lucide-react'
import Link from 'next/link'
import React, { useMemo, useState } from 'react'
import { toast } from 'sonner'
import PresentationExportButton from './PresentationExportButton'
import SaveAsTemplateModal from './SaveAsTemplateModal'

type Props = {
    presentationId: string
}

const Navbar = ({ presentationId }: Props) => {
    const { currentTheme, project, setProject, slides } = useSlideStore();
    const [isShareLoading, setIsShareLoading] = useState(false);
    const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);

    const shareUrl = useMemo(() => {
        if (typeof window === 'undefined') {
            return ''
        }

        return `${window.location.origin}/share/${presentationId}`
    }, [presentationId])

    const syncPublishedState = (isPublished: boolean) => {
        if (!project) {
            return
        }

        setProject({
            ...project,
            isPublished,
        })
    }

    const copyShareLink = async () => {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Link copied', {
            description: 'The public share link is now on your clipboard.',
        })
    }

    const handlePublishAndCopy = async () => {
        setIsShareLoading(true)

        try {
            const response = await publishProject(presentationId)

            if (response.status !== 200) {
                toast.error('Unable to enable sharing', {
                    description: response.error ?? 'Please try again in a moment.',
                })
                return
            }

            syncPublishedState(true)
            await copyShareLink()
        } catch (error) {
            toast.error('Unable to enable sharing', {
                description: 'Please try again in a moment.',
            })
        } finally {
            setIsShareLoading(false)
        }
    }

    const handleDisableSharing = async () => {
        setIsShareLoading(true)

        try {
            const response = await unpublishProject(presentationId)

            if (response.status !== 200) {
                toast.error('Unable to disable sharing', {
                    description: response.error ?? 'Please try again in a moment.',
                })
                return
            }

            syncPublishedState(false)
            toast.success('Public link disabled', {
                description: 'This presentation is private again.',
            })
        } catch (error) {
            toast.error('Unable to disable sharing', {
                description: 'Please try again in a moment.',
            })
        } finally {
            setIsShareLoading(false)
        }
    }

    return (
        <>
            <nav className='w-full h-full flex justify-between items-center py-2 px-4'>
                <Link passHref href={'/dashboard'}>
                    <Button
                        variant={'ghost'}
                        className="hover:bg-muted/30 p-2"
                        style={{
                            color: currentTheme.accentColor,
                        }}
                    >
                        <Home className="w-5 h-5" />
                        <span className='hidden sm:inline ml-2'>Return Home</span>
                    </Button>
                </Link>

                <Link href={'/presentation/template-market'} className='hidden sm:block'>
                    <h1 className='text-lg font-semibold truncate max-w-[400px]'
                        style={{
                            color: currentTheme.accentColor,
                        }}
                    >
                        {project?.title || 'Presentation Editor'}
                    </h1>
                </Link>

                <div className='flex items-center gap-2'>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                style={{
                                    color: currentTheme.accentColor,
                                }}
                                variant={'ghost'}
                                size="icon"
                                className="hover:bg-muted/30"
                                disabled={isShareLoading}
                            >
                                {isShareLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Share />}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className='w-56'>
                            <DropdownMenuLabel className='flex items-center gap-2'>
                                {project?.isPublished ? <Globe className='h-4 w-4' /> : <Lock className='h-4 w-4' />}
                                {project?.isPublished ? 'Public link enabled' : 'Private presentation'}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {project?.isPublished ? (
                                <DropdownMenuItem onClick={copyShareLink}>
                                    Copy share link
                                </DropdownMenuItem>
                            ) : (
                                <DropdownMenuItem onClick={handlePublishAndCopy}>
                                    Publish and copy link
                                </DropdownMenuItem>
                            )}
                            {project?.isPublished ? (
                                <DropdownMenuItem onClick={handleDisableSharing}>
                                    Disable public link
                                </DropdownMenuItem>
                            ) : null}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <PresentationExportButton />

                    {/* Save as Template button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted/30"
                        style={{ color: currentTheme.accentColor }}
                        onClick={() => setIsSaveTemplateOpen(true)}
                        title="Save as Template"
                    >
                        <Layers className="h-4 w-4" />
                    </Button>

                    <ThemeSwitcher />

                    <Link href={`/present/${presentationId}`}>
                        <Button variant={'default'} className='flex items-center gap-2 rounded-full px-6 shadow-md hover:shadow-lg transition-all'>
                            <Play className='w-4 h-4' />
                            <span className='hidden sm:inline'>Present</span>
                        </Button>
                    </Link>
                </div>
            </nav>

            {/* Save as Template Modal */}
            <SaveAsTemplateModal
                isOpen={isSaveTemplateOpen}
                onClose={() => setIsSaveTemplateOpen(false)}
                projectId={presentationId}
                slideCount={slides?.length || 0}
            />
        </>
    )
}

export default Navbar

