'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { containerVariants } from '@/lib/constants'
import ProjectCard from './ProjectCard'
import { MobileProjectCard } from '@/components/MobileProjectCard'
import { DashboardProject } from '@/actions/unified-projects'

type Props = {
  projects: DashboardProject[]
}

const Projects = ({ projects }: Props) => {
  return (
    <motion.div
      className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-10'
      variants={containerVariants}
      initial='hidden'
      animate='visible'>

      {
        projects.map((project, index) => (
          project.type === "MOBILE_DESIGN" ? (
            <MobileProjectCard
              key={project.id}
              project={{
                ...project,
                name: project.title,
                frames: project.frames || [],
              }}
            />
          ) : (
            <ProjectCard
              key={index}
              projectId={project.id}
              title={project.title}
              createdAt={project.createdAt.toString()}
              isDelete={false} // Unified logic needs to handle this if we want delete/recover in dashboard
              slideData={project.slides}
              themeName={project.theme || "light"}
            />
          )
        ))
      }

    </motion.div>
  )
}

export default Projects