'use client'
import { useSlideStore } from '@/store/useSlideStore'
import { redirect, useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useAnimation } from 'framer-motion'
import { Theme } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import ThemeCard from './ThemeCard'
import ThemePicker from './ThemePicker'
import { themes } from '@/lib/constants'
import { getProjectById } from '@/actions/projects'
import { toast } from 'sonner'

type Props = {}

const ThemePreview = (props: Props) => {
    const params = useParams();
    const router = useRouter();
    const controls = useAnimation();

    const { currentTheme, setCurrentTheme, project, setProject } = useSlideStore();

    const [selectedTheme, setSelectedTheme] = useState<Theme>(currentTheme);


    useEffect(() => {
        if (project?.slides) {
            redirect(`/presentation/${params.presentationId}`);
        }
    }, [project])

    useEffect(() => {
        if (!project || project.id !== params.presentationId) {
            const fetchProject = async () => {
                try {
                    const res = await getProjectById(params.presentationId as string);
                    if (res.status === 200 && res.data) {
                        setProject(res.data as any);
                    } else {
                        toast.error("Error", { description: "Project not found." });
                        router.push("/create-page");
                    }
                } catch (error) {
                    console.error(error);
                }
            };
            fetchProject();
        }
    }, [params.presentationId, project?.id, setProject, router]);

    useEffect(() => {
        controls.start('visible')

    }, [controls, selectedTheme])

    const leftCardContent = (

        <div className='space-y4'>
            <div className='rounded-xl p-6'
                style={
                    { backgroundColor: selectedTheme.accentColor + '10' }
                }>
                <h3 className='text-xl font-semibold mb-4'
                    style={
                        { color: selectedTheme.accentColor }
                    }>Quick Start Guide</h3>

                <ol className='list-decimal list-inside space-y-2'
                    style={{ color: selectedTheme.accentColor }}
                >
                    <li>Choose a Theme</li>
                    <li>Customize colors and fonts</li>
                    <li>Add your content</li>
                    <li>Preview and publish</li>
                </ol>
            </div>

            <Button className='w-full h-12 text-lg font-medium'
                style={{
                    backgroundColor: selectedTheme.accentColor,
                    color: selectedTheme.accentColor
                }}>
                Get Started
            </Button>
        </div>
    )

    const mainCardContent = (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                    className="rounded-xl p-6"
                    style={{ backgroundColor: selectedTheme.accentColor + "10" }}
                >
                    <p style={{ color: selectedTheme.accentColor }}>
                        This is a smart layout: it acts as a text box.
                    </p>
                </div>
                <div
                    className="rounded-xl p-6"
                    style={{ backgroundColor: selectedTheme.accentColor + "10" }}
                >
                    <p style={{ color: selectedTheme.accentColor }}>
                        You can get these by typing /smart
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap gap-4">
                <Button
                    className="h-12 px-6 text-lg font-medium"
                    style={{
                        backgroundColor: selectedTheme.accentColor,
                        color: selectedTheme.fontColor,
                    }}
                >
                    Primary button
                </Button>
                <Button
                    variant="outline"
                    className="h-12 px-6 text-lg font-medium"
                    style={{
                        borderColor: selectedTheme.accentColor,
                        color: selectedTheme.fontColor,
                    }}
                >
                    Secondary button
                </Button>
            </div>
        </div>
    );

    const rightCardContent = (
        <div className="space-y-4">
            <div
                className="rounded-xl p-6"
                style={{ backgroundColor: selectedTheme.accentColor + "10" }}
            >
                <h3
                    className="text-xl font-semibold mb-4"
                    style={{ color: selectedTheme.accentColor }}
                >
                    Theme Features
                </h3>
                <ul
                    className="list-disc list-inside space-y-2"
                    style={{ color: selectedTheme.accentColor }}
                >
                    <li>Responsive design</li>
                    <li>Dark and light modes</li>
                    <li>Custom color schemes</li>
                    <li>Accessibility optimized</li>
                </ul>
            </div>
            <Button
                variant="outline"
                className="w-full h-12 text-lg font-medium"
                style={{
                    borderColor: selectedTheme.accentColor,
                    color: selectedTheme.fontColor,
                }}
            >
                Explore Features
            </Button>
        </div>
    );

    const applyTheme = (theme:Theme)=>{
        setSelectedTheme(theme)
        setCurrentTheme(theme)
    }


    return (
        <div className='h-screen w-full flex overflow-hidden'
        style={{
            backgroundColor:selectedTheme.backgroundColor,
            color:selectedTheme.accentColor,
            fontFamily:selectedTheme.fontFamily,
            backgroundImage: `radial-gradient(circle at top left, ${selectedTheme.accentColor}15 0%, transparent 40%), radial-gradient(circle at bottom right, ${selectedTheme.accentColor}10 0%, transparent 40%)`,
        }}>
            <div className='grow overflow-hidden flex flex-col relative'>
                {/* Header */}
                <div className='absolute top-0 left-0 w-full p-8 flex items-center justify-between z-10'>
                    <Button
                        variant={"outline"}
                        className='rounded-full px-6 h-12 flex items-center shadow-sm hover:shadow-md transition-all duration-300 backdrop-blur-md'
                        style={{
                            backgroundColor:selectedTheme.backgroundColor + 'cc',
                            color:selectedTheme.accentColor,
                            borderColor:selectedTheme.accentColor + '30',
                        }}
                        onClick={()=> router.push('/create-page')}
                    >
                        <ArrowLeft className='mr-2 h-5 w-5'/>
                        Back to Outline
                    </Button>
                    
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold uppercase tracking-wider opacity-60">Live Preview</span>
                        <span className="text-xl font-bold">{selectedTheme.name}</span>
                    </div>
                </div>

                <div className='w-full h-full flex flex-col justify-center items-center relative grow px-12 pt-20 pb-12'>
                    {/* Decorative Background Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] blur-[120px] rounded-full opacity-20 pointer-events-none transition-all duration-1000" style={{ backgroundColor: selectedTheme.accentColor }} />
                    
                    <div className='w-full max-w-6xl flex justify-center items-center relative z-10 scale-95 origin-center transition-all duration-500 hover:scale-100'>
                        <ThemeCard
                            title='Setup'
                            content={leftCardContent}
                            description='Quick instructions'
                            variant='left'
                            theme={selectedTheme}
                            controls={controls}
                        />
                        <ThemeCard
                            title='Content Elements'
                            content={mainCardContent}
                            description='Typography and buttons'
                            variant='main'
                            theme={selectedTheme}
                            controls={controls}
                        />
                        <ThemeCard
                            title='Key Features'
                            content={rightCardContent}
                            description='Theme capabilities'
                            variant='right'
                            theme={selectedTheme}
                            controls={controls}
                        />
                    </div>
                </div>
            </div>

            <ThemePicker 
                selectedTheme={selectedTheme}
                themes={themes}
                onThemeSelect={applyTheme}
            />
        </div>
    )
}

export default ThemePreview