'use client'
import { ThemeSwitcher } from '@/components/global/mode-toggle'
import { Button } from '@/components/ui/button'
import Home from '@/icons/Home'
import { Share } from '@/icons/Share'
import { useSlideStore } from '@/store/useSlideStore'
import { HomeIcon, Play } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { toast } from 'sonner'
import PresentationMode from './PresentationMode'
import { ThemeSwitcher } from '@/components/global/mode-toggle'

type Props = {
    presentationId: string
}

const Navbar = ({ presentationId }: Props) => {

    const { currentTheme, project } = useSlideStore();
    const [isPresentationMode, setIsPresentationMode] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(`${window.location.origin}/share/${presentationId}`)

        toast.success('Link Copied',
            {
                description: 'The Link has been copied to your clipboard'
            }
        )
    }


    return (
        <nav className='fixed top-0 left-0 right-0 z-50 w-full h-16 flex justify-between items-center py-3 px-7 border-b bg-background/80 backdrop-blur-md'>
            <Link passHref href={'/dashboard'}>
                <Button
                    variant={'outline'}
                    style={{
                        backgroundColor: currentTheme.navbarColor || currentTheme.backgroundColor,
                        color: currentTheme.accentColor,
                    }}
                >
                    <Home />
                    <span className='hidden sm:inline'>Return Home</span>

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

            <div className='flex items-center gap-4'>
                <Button
                    style={{
                        backgroundColor: currentTheme.navbarColor || currentTheme.backgroundColor,
                        color: currentTheme.accentColor,
                    }}
                    variant={'outline'}
                    onClick={handleCopy}
                >
                    <Share />
                </Button>

                <ThemeSwitcher />

                {/* selling feature */}
                {/* <SellTemplate/> */}

                <Button variant={'default'} className='flex items-center gap-2'
                    onClick={() => setIsPresentationMode(true)}
                >
                    <Play className='w-4 h-4' />
                    <span className='hidden sm:inline'>Present</span>
                </Button>
            </div>
            {/* add presentation */}
            {isPresentationMode && (
                <PresentationMode
                    onClose={() => setIsPresentationMode(false)}
                />
            )}
        </nav>
    )
}

export default Navbar