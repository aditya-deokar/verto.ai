
import { getRecentProjects } from '@/actions/projects'
import { onAuthenticateUser } from '@/actions/user'
import { AppSidebar } from '@/components/global/app-sidebar'
import UpperInfoBar from '@/components/global/upper-info-bar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = { children: React.ReactNode }

export const runtime = 'nodejs'

const Layout = async ({ children }: Props) => {
  const recentProjects = await getRecentProjects()
  const checkUser = await onAuthenticateUser()

  if (!checkUser.user) {
    redirect('/sign-in')
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background p-4 gap-4">
        <AppSidebar
          recentProjects={recentProjects?.data || []}
          user={checkUser.user}
          className="fixed! top-4 left-4 bottom-4 w-[--sidebar-width]! h-auto! bg-background/80! backdrop-blur-xl border rounded-xl shadow-sm hidden md:flex overflow-hidden z-50"
        />
        <div className="flex flex-col flex-1 h-full gap-4 overflow-hidden">
          <UpperInfoBar user={checkUser.user} />
          <div className="flex-1 overflow-y-auto bg-background/50 border shadow-sm rounded-xl relative">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default Layout
