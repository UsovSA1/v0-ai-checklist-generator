'use client'

import { useState } from 'react'
import { ChevronRight, Calendar, Plus } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatDeadline, formatShortDate } from '@/lib/date-utils'
import { CATEGORY_LABELS } from '@/lib/types'
import type { ChecklistItem, ChecklistItemCategory } from '@/lib/types'

export function ChecklistPanel() {
  const { 
    notes,
    selectedNoteId, 
    getChecklistByNoteId,
    updateChecklistItem,
    addChecklistItem,
    setActiveTab,
    selectChecklist,
  } = useAppStore()
  
  const selectedNote = notes.find((n) => n.id === selectedNoteId)
  const checklist = selectedNoteId ? getChecklistByNoteId(selectedNoteId) : null
  
  const [newItemText, setNewItemText] = useState('')
  
  if (!selectedNote) {
    return null
  }
  
  const items = checklist?.items || []
  const totalItems = items.length
  const doneItems = items.filter((item) => item.status === 'done').length
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0
  
  const handleStatusChange = (item: ChecklistItem) => {
    if (!checklist) return
    updateChecklistItem(checklist.id, item.id, {
      status: item.status === 'done' ? 'pending' : 'done',
    })
  }
  
  const handleAddItem = () => {
    if (!checklist || !newItemText.trim()) return
    addChecklistItem(checklist.id, newItemText.trim())
    setNewItemText('')
  }
  
  const handleOpenChecklist = () => {
    if (!checklist) return
    selectChecklist(checklist.id)
    setActiveTab('checklists')
  }
  
  if (!checklist || items.length === 0) {
    return (
      <aside className="w-80 h-full border-l border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">Чеклист</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-center text-muted-foreground">
          <p>Нажмите &quot;Создать чеклист&quot;, чтобы AI извлек задачи из заметки</p>
        </div>
      </aside>
    )
  }
  
  return (
    <aside className="w-80 h-full border-l border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="font-medium">Чеклист</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {doneItems} из {totalItems} готово
          </span>
        </div>
        
        {/* Progress */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">0%</span>
          <Progress value={progress} className="flex-1 h-2" />
          <span className="text-xs text-muted-foreground">{progress}%</span>
        </div>
      </div>
      
      {/* Items */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {items.map((item) => (
            <ChecklistItemRow
              key={item.id}
              item={item}
              onStatusChange={() => handleStatusChange(item)}
            />
          ))}
        </div>
        
        {/* Add new item */}
        <div className="mt-2 px-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAddItem()
              }
            }}
            placeholder="Добавить задачу..."
            className="w-full text-sm bg-transparent border-0 outline-none placeholder:text-muted-foreground/50 py-2"
          />
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={handleOpenChecklist}
        >
          <span>Открыть чеклист</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  )
}

// Import Sparkles here to avoid circular dependency
import { Sparkles } from 'lucide-react'

interface ChecklistItemRowProps {
  item: ChecklistItem
  onStatusChange: () => void
}

function ChecklistItemRow({ item, onStatusChange }: ChecklistItemRowProps) {
  const isDone = item.status === 'done'
  
  return (
    <div className={cn(
      'flex items-start gap-3 p-2 rounded-lg transition-colors',
      'hover:bg-accent',
      isDone && 'opacity-60'
    )}>
      <Checkbox
        checked={isDone}
        onCheckedChange={onStatusChange}
        className={cn(
          'mt-0.5',
          isDone && 'bg-success border-success text-success-foreground'
        )}
      />
      
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm',
          isDone && 'line-through text-muted-foreground'
        )}>
          {item.text}
        </p>
        
        {/* Metadata */}
        <div className="flex items-center gap-2 mt-1">
          {item.category && (
            <span className="text-xs text-muted-foreground">
              {CATEGORY_LABELS[item.category] || item.category}
            </span>
          )}
          {item.deadline && (
            <span className={cn(
              'flex items-center gap-1 text-xs',
              new Date(item.deadline) < new Date() && item.status !== 'done'
                ? 'text-destructive'
                : 'text-muted-foreground'
            )}>
              <Calendar className="h-3 w-3" />
              {formatDeadline(item.deadline)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
