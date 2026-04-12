'use client'

import React from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { Theme } from '@/lib/types'

type Props = {
  themes: Theme[]
  selectedTheme: Theme
  onThemeSelect: (theme: Theme) => void
  disabled?: boolean
}

export default function InlineThemeSelector({
  themes,
  selectedTheme,
  onThemeSelect,
  disabled = false,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold">
          <span className="text-red-500">*</span> Select Theme
        </p>
        <Badge variant="outline">{selectedTheme.name}</Badge>
      </div>

      <ScrollArea className="h-[260px] rounded-xl border bg-muted/20 p-4">
        <div className="grid grid-cols-2 gap-3">
          {themes.map((theme) => {
            const isActive = selectedTheme.name === theme.name

            return (
              <Button
                key={theme.name}
                type="button"
                onClick={() => onThemeSelect(theme)}
                disabled={disabled}
                className="relative h-auto w-full flex-col items-start gap-2 border-2 p-4"
                style={{
                  fontFamily: theme.fontFamily,
                  color: theme.fontColor,
                  background: theme.gradientBackground || theme.backgroundColor,
                  borderColor: isActive ? theme.accentColor : 'transparent',
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                {isActive && (
                  <div
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full shadow-lg"
                    style={{ backgroundColor: theme.accentColor }}
                  >
                    <Check className="h-4 w-4" style={{ color: theme.backgroundColor }} />
                  </div>
                )}

                <div className="w-full text-left">
                  <p className="mb-1 text-sm font-bold">{theme.name}</p>
                  <Badge
                    variant="secondary"
                    className="px-2 py-0 text-xs"
                    style={{
                      backgroundColor: `${theme.accentColor}20`,
                      color: theme.accentColor,
                      borderColor: theme.accentColor,
                    }}
                  >
                    {theme.type}
                  </Badge>
                </div>

                <div className="mt-2 flex gap-1.5">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.backgroundColor }} />
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.slideBackgroundColor || theme.backgroundColor }} />
                </div>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
