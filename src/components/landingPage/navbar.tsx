'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
                transition-all duration-300
                ${isScrolled 
                    ? 'backdrop-blur-xl bg-background/80 border-b border-white/5 shadow-sm' 
                    : 'bg-transparent border-b border-transparent'}
            `}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    
                    {/* Logo */}
                    <Link href={'/'} className="flex items-center gap-2.5 group">
                        <div className="verto-bg p-2 rounded-lg group-hover:scale-105 transition-transform">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold verto">
                            Verto AI
                        </span>
                    </Link>

                    {/* Center Navigation - Desktop */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="#features" className="text-sm font-medium text-primary/60 hover:text-primary transition-colors">
                            Features
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium text-primary/60 hover:text-primary transition-colors">
                            Pricing
                        </Link>
                        <Link href="#faq" className="text-sm font-medium text-primary/60 hover:text-primary transition-colors">
                            FAQ
                        </Link>
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <Button variant="ghost" className="font-medium hidden sm:inline-flex">
                                    Sign In
                                </Button>
                            </SignInButton>
                        </SignedOut>

                        <SignedIn>
                            <Link href="/dashboard">
                                <Button variant="ghost" className="font-medium">
                                    Dashboard
                                </Button>
                            </Link>
                        </SignedIn>

                        <SignedOut>
                            <SignUpButton mode="modal">
                                <Button className="verto-bg hover:opacity-90 font-semibold">
                                    Get Started
                                </Button>
                            </SignUpButton>
                        </SignedOut>

                        <SignedIn>
                            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-9 h-9" } }} />
                        </SignedIn>

                        <ThemeSwitcher />
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar