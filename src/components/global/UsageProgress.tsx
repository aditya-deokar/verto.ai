'use client'

import { useEffect, useState } from 'react'
import { Progress } from "@/components/ui/progress"
import { getUserUsage } from '@/actions/usage'
import { Loader2, Zap } from 'lucide-react'
import Link from 'next/link'

export function UsageProgress() {
  const [usage, setUsage] = useState<{usage: number, limit: number, isUnlimited: boolean} | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await getUserUsage()
        if (res.status === 200 && res.data) {
          setUsage(res.data)
        }
      } catch (err) {
        console.error("Failed to fetch usage:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsage()
  }, [])

  if (loading) return <div className="p-4 flex justify-center"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
  
  // Don't show if unlimited or if we couldn't load usage
  if (!usage || usage.isUnlimited) return null

  const percentage = Math.min((usage.usage / usage.limit) * 100, 100)
  const isNearLimit = usage.usage >= usage.limit - 1
  const isAtLimit = usage.usage >= usage.limit

  return (
    <div className="w-full space-y-2.5 p-3 rounded-xl bg-muted/30 border border-border/50">
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground font-medium">Generation Usage</span>
        <span className={isAtLimit ? "text-destructive font-bold" : "text-foreground font-semibold"}>
          {usage.usage} / {usage.limit}
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className={`h-1.5 transition-all ${isAtLimit ? "bg-destructive/20" : ""}`}
      />
      
      {isNearLimit && usage.limit <= 5 && (
        <Link href="/settings" className="block group">
           <p className="text-[10px] text-vivid group-hover:text-vivid/80 transition-colors flex items-center gap-1.5 font-medium">
             <Zap className="w-3 h-3 fill-vivid" /> 
             Unlock +10 projects by adding API key
           </p>
        </Link>
      )}
      
      {isAtLimit && (
        <p className="text-[10px] text-destructive/80 font-medium leading-tight">
          Limit reached. Add an API key or upgrade to continue.
        </p>
      )}
    </div>
  )
}
