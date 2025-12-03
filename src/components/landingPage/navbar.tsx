'use client'

import React, { useState, useEffect } from 'react'
import { ThemeSwitcher } from '../global/mode-toggle'
import Link from 'next/link'
import { SignedIn, SignedOut, UserButton, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Button } from '../ui/button'
import { Sparkles } from 'lucide-react'


const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header 
            className={`
                fixed top-0 left-0 right-0 z-50 
                backdrop-blur-md bg-background/80 
                border-b border-border
                transition-all duration-300
                hero-gradient
                ${isScrolled ? 'shadow-xs' : ''}
            `}
        >
            {/* Content Container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* Logo Section */}
                    <Link href={'/'} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="verto-bg p-2 rounded-lg">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold verto">
                                Verto AI
                            </span>
                        </div>
                    </Link>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button 
                                    variant="ghost" 
                                    className="font-medium"
                                >
                                    Sign In
                                </Button>
                            </SignInButton>
                        </SignedOut>

                        <SignedIn>
                            <Link href="/dashboard">
                                <Button 
                                    variant="ghost" 
                                    className="font-medium"
                                >
                                    Dashboard
                                </Button>
                            </Link>
                        </SignedIn>

                        <SignedOut>
                            <SignUpButton mode="modal">
                                <Button 
                                    className="
                                        verto-bg
                                        hover:opacity-90
                                        transition-opacity
                                        font-medium
                                    "
                                >
                                    Get Started
                                </Button>
                            </SignUpButton>
                        </SignedOut>

                        <SignedIn>
                            <UserButton 
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9"
                                    }
                                }}
                            />
                        </SignedIn>

                        {/* Theme Toggle */}
                        <ThemeSwitcher />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar