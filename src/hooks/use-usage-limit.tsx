'use client'

import { useState, useCallback } from 'react'
import { getUserUsage } from '@/actions/usage'
import { LimitReachedModal } from '@/components/global/LimitReachedModal'

export function useUsageLimit() {
  const [showModal, setShowModal] = useState(false)
  const [usageData, setUsageData] = useState<{usage: number, limit: number} | null>(null)

  const checkUsage = useCallback(async () => {
    try {
      const res = await getUserUsage()
      if (res.status === 200 && res.data) {
        const { usage, limit, isUnlimited } = res.data
        
        // If we reached the limit, show the modal and return false
        if (!isUnlimited && usage >= limit) {
          setUsageData({ usage, limit })
          setShowModal(true)
          return false
        }
      }
      return true
    } catch (error) {
      console.error("Error checking usage limit:", error)
      return true // Default to allowing if there's an error fetching status
    }
  }, [])

  const UsageModal = () => (
    <LimitReachedModal 
      isOpen={showModal} 
      onClose={() => setShowModal(false)} 
      usage={usageData?.usage || 0}
      limit={usageData?.limit || 0}
    />
  )

  return { checkUsage, UsageModal }
}
