'use client'

import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/date-utils'
import type { Checklist } from '@/lib/types'

interface ChecklistCardProps {
  checklist: Checklist
  noteTitle?: string
  isSelected: boolean
  onClick: () => void
}

export function ChecklistCard({ checklist, noteTitle, isSelected, onClick }: ChecklistCardProps) {
  const title = noteTitle || 'Удаленная заметка'
  const totalItems = checklist.items.length
  const doneItems = checklist.items.filter((item) => item.status === 'done').length
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg transition-colors',
        'hover:bg-card/80',
        isSelected && 'bg-card shadow-sm'
      )}
    >
      {/* Date */}
      <div className="text-xs text-muted-foreground mb-1">
        {formatRelativeDate(checklist.updatedAt)}
      </div>
      
      {/* Title */}
      <div className="font-medium text-sm mb-2 truncate text-foreground">
        {title}
      </div>
      
      {/* Progress bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-success rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {doneItems}/{totalItems}
        </span>
      </div>
    </button>
  )
}
