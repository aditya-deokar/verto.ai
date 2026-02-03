'use client'
import usePromptStore from '@/store/usePromptStore'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/constants'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { timeAgo } from '@/lib/utils'
import useCreativeAIStore from '@/store/useCreativeAiStore'
import { toast } from '@/hooks/use-toast'
import { ShineBorder } from '@/components/global/ui/shine-border'
import { ChevronDown, ChevronUp } from 'lucide-react'

const RecentPrompts = () => {

  const { prompts, setPage } = usePromptStore();
  const { addMultipleOutlines, setCurrentAiPrompt } = useCreativeAIStore();
  const [showAll, setShowAll] = useState(false);

  const handleEdit = (id: string) => {
    const prompt = prompts.find((prompt) => prompt?.id === id)

    if (prompt) {
      setPage("creative-ai");
      addMultipleOutlines(
        prompt?.outlines
      )
      setCurrentAiPrompt(prompt?.title);
    }
    else {
      toast({
        title: "Error",
        description: "Prompt not found",
        variant: "destructive",
        duration: 2000
      });
    }
  }

  const displayedPrompts = showAll ? prompts : prompts.slice(0, 5);

  return (
    <motion.div variants={containerVariants}
      className='space-y-4 mt-20!'>
      <motion.h2 className='text-2xl font-semibold text-center' variants={itemVariants}>
        Your Recent Prompts
      </motion.h2>

      <motion.div variants={containerVariants}
        className='space-y-2 w-full lg:max-w-[80%] mx-auto'>
        <AnimatePresence>
          {displayedPrompts.map((prompt, i) => (
            <motion.div
              variants={itemVariants}
              key={prompt?.id || i}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <ShineBorder className='p-4 flex items-center justify-between' borderClassName='border border-primary/30'>
                <div className="max-w-[70%]">
                  <h3 className="font-semibold text-xl line-clamp-1">{prompt?.title}</h3>
                  <p className="font-semibold text-sm text-muted-foreground">
                    {timeAgo(prompt?.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-vivid">Creative AI</span>

                  <Button
                    variant="default"
                    size="sm"
                    className="rounded-lg bg-primary-20 dark:hover:bg-gray-700 hover:bg-gray-200 text-primary"
                    onClick={() => handleEdit(prompt?.id)}
                  >
                    Edit
                  </Button>
                </div>

              </ShineBorder>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {prompts.length > 5 && (
        <motion.div
          variants={itemVariants}
          className="flex justify-center mt-4"
        >
          <Button
            variant="ghost"
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-2"
          >
            {showAll ? (
              <>
                Show Less <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                View More <ChevronDown className="h-4 w-4" />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

export default RecentPrompts