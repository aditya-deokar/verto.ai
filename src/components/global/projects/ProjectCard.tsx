'use client'
import { JsonValue } from '@/generated/prisma/runtime/library'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { itemVariants, themes } from '@/lib/constants'
import { useSlideStore } from '@/store/useSlideStore'
import { useRouter } from 'next/navigation'

import { timeAgo } from '@/lib/utils'
import { AlertDialogBox } from '../alert-dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { deleteProject, recoverProject } from '@/actions/projects'
import ThumnailPreview from './ThumnailPreview'



type Props = {
  projectId: string;
  title: string;
  createdAt: string;
  themeName: string;
  isDelete?: boolean;
  slideData: JsonValue;
};

const ProjectCard = ({
  projectId,
  title,
  createdAt,
  themeName,
  isDelete = false,
  slideData,
}: Props) => {

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { setSlides } = useSlideStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const theme = themes.find((theme) => theme.name === themeName) || themes[0];

  const handleDelete = async () => {
    setLoading(true);
    if (!projectId) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Project not found",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await deleteProject(projectId);
      if (res.status !== 200) {
        throw new Error("Failed to delete project");
      }
      router.refresh();
      setOpen(false);
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async () => {
    setLoading(true);
    if (!projectId) {
      setLoading(false);
      toast({
        title: "Error",
        description: "Project not found",
        variant: "destructive",
      });
      return;
    }
    try {
      const res = await recoverProject(projectId);
      if (res.status !== 200) {
        throw new Error("Failed to recover project");
      }
      setOpen(false);
      router.refresh();
      toast({
        title: "Success",
        description: "Project recovered successfully",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const HandleNavigation = () => {
    console.log(slideData);
    setSlides(JSON.parse(JSON.stringify(slideData)));
    router.push(`/presentation/${projectId}`);
  };

  return (
    <motion.div
      className={`group w-full flex flex-col gap-y-3 rounded-[24px] p-4 transition-all duration-300 relative overflow-hidden border border-black/5 dark:border-white/10 bg-white dark:bg-[#0A0A0A] hover:border-black/10 dark:hover:border-white/20 hover:shadow-lg`}
      variants={itemVariants}
    >
      {/* Hover Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-linear-to-br from-black/5 to-transparent dark:from-white/5 pointer-events-none rounded-[24px]" />

      <div className='relative aspect-16/10 overflow-hidden rounded-xl cursor-pointer z-10'
        onClick={HandleNavigation}>
        <ThumnailPreview
          theme={theme}
          slide={JSON.parse(JSON.stringify(slideData))?.[0]}
        />
      </div>

      <div className='w-full z-10'>
        <div className='space-y-1 '>
          <h3 className='font-semibold text-base text-primary line-clamp-1'>{title}</h3>
          <div className='flex w-full justify-between items-center gap-2'>
            <p className='text-sm text-muted-foreground' suppressHydrationWarning>
              {timeAgo(createdAt)}
            </p>

            {isDelete ? (
              <AlertDialogBox
                description="This will recover your project and restore your data."
                className="bg-green-500 text-white dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700"
                onClick={handleRecover}
                loading={loading}
                open={open}
                handleOpen={() => setOpen(!open)}
              >
                <Button
                  size="sm"
                  variant="default"
                  // className="bg-background-80 dark:hover:bg-background-90"
                  disabled={loading}
                >
                  Recover
                </Button>
              </AlertDialogBox>
            ) : (
              <AlertDialogBox
                description="This will delete your project and send to trash."
                className="bg-red-500 text-white dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700"
                onClick={handleDelete}
                loading={loading}
                open={open}
                handleOpen={() => setOpen(!open)}
              >
                <Button
                  size="sm"
                  variant="outline"
                  // className="bg-background-80 dark:hover:bg-background-90"
                  disabled={loading}
                >
                  Delete
                </Button>
              </AlertDialogBox>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ProjectCard