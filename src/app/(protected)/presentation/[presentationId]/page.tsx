'use client'

import { getProjectById } from '@/actions/projects'
import { themes } from '@/lib/constants'
import { useSlideStore } from '@/store/useSlideStore'
import { Loader2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import { redirect, useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Navbar from './_components/Navbar'
import EditorLeftSidebar from './_components/editor-sidebar/new-leftsidebar/EditorLeftSidebar'
import Editor from './_components/editor/Editor'
import EditorSlidebar from './_components/rightSlidebar'

type Props = {}

const page = (props: Props) => {


  const { currentTheme, setCurrentTheme, setProject, setSlides } = useSlideStore();
  const params = useParams();
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
        console.log(res.data)

        setSlides(JSON.parse(JSON.stringify(res.data.slides)))

      } catch (error) {
        toast.error('Error', {
          description: "An Unexpected Error Occured",
        });
      } finally {
        setIsLoading(false);
      }


    })()


  }, [])


  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen '>
        <Loader2 className='w-8 h-8 animate-spin text-primary' />
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className='h-screen bg-secondary/10 p-1.5 sm:p-2 overflow-hidden flex flex-col gap-1.5 sm:gap-2'>
        {/* Floating Navbar */}
        <div className='h-12 sm:h-14 rounded-xl bg-background/80 backdrop-blur-md shadow-sm border mx-auto w-full z-50 overflow-hidden flex-shrink-0'>
          <Navbar presentationId={params.presentationId as string} />
        </div>

        <div className='flex-1 flex gap-1.5 sm:gap-2 min-h-0 w-full mx-auto font-sans z-0'>
          {/* Floating Left Sidebar — hidden on small, narrow on md, full on lg */}
          <div className='hidden md:block md:w-64 lg:w-72 xl:w-80 h-full rounded-xl bg-background/80 backdrop-blur-md shadow-sm border overflow-hidden flex-shrink-0 transition-all duration-200'>
            <EditorLeftSidebar />
          </div>

          {/* Main Canvas Area — takes all remaining space */}
          <div className='flex-1 h-full rounded-xl bg-muted/30 border overflow-hidden relative shadow-inner min-w-0'>
            <Editor isEditable={true} />
          </div>

          {/* Floating Right Sidebar — hidden on small/md, narrow on lg, full on xl */}
          <div className='hidden lg:block lg:w-64 xl:w-80 h-full rounded-xl bg-background/80 backdrop-blur-md shadow-sm border overflow-hidden flex-shrink-0 transition-all duration-200'>
            <EditorSlidebar />
          </div>

        </div>
      </div>
    </DndProvider>
  )
}

export default page