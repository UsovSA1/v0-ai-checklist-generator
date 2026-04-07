'use client'

import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from '@/lib/date-utils'
import type { Note } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

interface NoteCardProps {
  note: Note
  hasChecklist: boolean
  isSelected: boolean
  onClick: () => void
}

export function NoteCard({ note, hasChecklist, isSelected, onClick }: NoteCardProps) {
  const preview = note.content.slice(0, 50).trim() || 'Пустая заметка'
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-lg transition-colors',
        'hover:bg-accent',
        isSelected && 'bg-accent'
      )}
    >
      {/* Date */}
      <div className="text-xs text-muted-foreground mb-1">
        {formatRelativeDate(note.updatedAt)}
      </div>
      
      {/* Title */}
      <div className="font-medium text-sm mb-1 truncate text-foreground">
        {note.title || 'Без названия'}
      </div>
      
      {/* Preview */}
      <div className="text-xs text-muted-foreground mb-2 truncate">
        {preview}
      </div>
      
      {/* Tags and checklist indicator */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {note.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0">
            {tag}
          </Badge>
        ))}
        {hasChecklist && (
          <span className="flex items-center gap-0.5 text-xs text-success">
            <CheckCircle2 className="h-3 w-3" />
            чеклист
          </span>
        )}
      </div>
    </button>
  )
}
