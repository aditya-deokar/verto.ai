'use client'
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

    const { currentTheme } = useSlideStore();
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
        <nav className='w-full h-14 flex justify-between items-center py-2 px-4 border-b z-50 bg-background text-foreground'>
            <Link passHref href={'/dashboard'}>
                <Button
                    variant={'outline'}
                >
                    <Home />
                    <span className='hidden sm:inline'>Return Home</span>
                </Button>
            </Link>

            <Link href={'/presentation/template-market'}
                className='text-lg font-semibold hidden sm:block'>
                Presentation Editor
            </Link>

            <div className='flex items-center gap-4'>
                <ThemeSwitcher />
                <Button
                    variant={'outline'}
                    onClick={handleCopy}
                >
                    <Share />
                </Button>
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