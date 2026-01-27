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
                <Button
                    style={{
                        color: currentTheme.accentColor,
                    }}
                    variant={'ghost'}
                    size="icon"
                    onClick={handleCopy}
                    className="hover:bg-muted/30"
                >
                    <Share />
                </Button>

                <ThemeSwitcher />

                {/* selling feature */}
                {/* <SellTemplate/> */}

                <Link href={`/present/${presentationId}`}>
                    <Button variant={'default'} className='flex items-center gap-2 rounded-full px-6 shadow-md hover:shadow-lg transition-all'>
                        <Play className='w-4 h-4' />
                        <span className='hidden sm:inline'>Present</span>
                    </Button>
                </Link>
            </div>
        </nav>
    )
}

export default Navbar