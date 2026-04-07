'use client'

import { useState } from 'react'
import { Calendar, FileText, Plus, X } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatDeadline, formatShortDate } from '@/lib/date-utils'
import { CATEGORY_LABELS } from '@/lib/types'
import type { ChecklistItem, ChecklistItemCategory } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'

export function ChecklistView() {
  const {
    notes,
    checklists,
    selectedChecklistId,
    updateChecklistItem,
    addChecklistItem,
    setActiveTab,
    selectNote,
  } = useAppStore()
  
  const [newItemText, setNewItemText] = useState('')
  
  const checklist = checklists.find((cl) => cl.id === selectedChecklistId)
  const note = checklist?.noteId ? notes.find((n) => n.id === checklist.noteId) : null
  
  if (!checklist) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Выберите чеклист из списка слева
      </div>
    )
  }
  
  const items = checklist.items
  const totalItems = items.length
  const doneItems = items.filter((item) => item.status === 'done').length
  const progress = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0
  
  const handleStatusChange = (item: ChecklistItem) => {
    updateChecklistItem(checklist.id, item.id, {
      status: item.status === 'done' ? 'pending' : 'done',
    })
  }
  
  const handleCategoryChange = (item: ChecklistItem, category: ChecklistItemCategory) => {
    if (item.status === 'done') return
    updateChecklistItem(checklist.id, item.id, { category })
  }
  
  const handleDeadlineChange = (item: ChecklistItem, deadline: Date | null) => {
    if (item.status === 'done') return
    updateChecklistItem(checklist.id, item.id, { deadline })
  }
  
  const handleAddItem = () => {
    if (!newItemText.trim()) return
    addChecklistItem(checklist.id, newItemText.trim())
    setNewItemText('')
  }
  
  const handleGoToNote = () => {
    if (!note) return
    selectNote(note.id)
    setActiveTab('notes')
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">
              {note?.title || 'Удаленная заметка'}
            </h1>
            {!note && (
              <p className="text-sm text-muted-foreground mt-1">
                Связанная заметка была удалена
              </p>
            )}
          </div>
          
          {note && (
            <Button variant="outline" onClick={handleGoToNote} className="gap-2">
              <FileText className="h-4 w-4" />
              Открыть заметку
            </Button>
          )}
        </div>
        
        {/* Progress */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Progress value={progress} className="h-2" />
          </div>
          <span className="text-sm text-muted-foreground">
            {doneItems} из {totalItems} ({progress}%)
          </span>
        </div>
      </div>
      
      {/* Items */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-2">
          {items.map((item) => (
            <ChecklistItemRowFull
              key={item.id}
              item={item}
              onStatusChange={() => handleStatusChange(item)}
              onCategoryChange={(cat) => handleCategoryChange(item, cat)}
              onDeadlineChange={(date) => handleDeadlineChange(item, date)}
            />
          ))}
          
          {/* Add new item */}
          <div className="flex items-center gap-3 p-3 border border-dashed border-border rounded-lg">
            <Plus className="h-4 w-4 text-muted-foreground" />
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
              className="flex-1 bg-transparent border-0 outline-none placeholder:text-muted-foreground/50"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface ChecklistItemRowFullProps {
  item: ChecklistItem
  onStatusChange: () => void
  onCategoryChange: (category: ChecklistItemCategory) => void
  onDeadlineChange: (date: Date | null) => void
}

function ChecklistItemRowFull({ 
  item, 
  onStatusChange, 
  onCategoryChange,
  onDeadlineChange,
}: ChecklistItemRowFullProps) {
  const isDone = item.status === 'done'
  const [editingText, setEditingText] = useState(false)
  const [text, setText] = useState(item.text)
  const { updateChecklistItem } = useAppStore()
  
  const handleTextSave = () => {
    if (text.trim() && text !== item.text) {
      updateChecklistItem(item.checklistId, item.id, { text: text.trim() })
    }
    setEditingText(false)
  }
  
  return (
    <div className={cn(
      'flex items-start gap-3 p-3 rounded-lg border border-border bg-card transition-colors',
      isDone && 'opacity-60'
    )}>
      <Checkbox
        checked={isDone}
        onCheckedChange={onStatusChange}
        className={cn(
          'mt-1',
          isDone && 'bg-success border-success text-success-foreground'
        )}
      />
      
      <div className="flex-1 min-w-0">
        {editingText && !isDone ? (
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleTextSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleTextSave()
              }
              if (e.key === 'Escape') {
                setText(item.text)
                setEditingText(false)
              }
            }}
            autoFocus
            className="w-full bg-transparent border-0 outline-none"
          />
        ) : (
          <p 
            className={cn(
              'cursor-pointer',
              isDone && 'line-through text-muted-foreground'
            )}
            onClick={() => !isDone && setEditingText(true)}
          >
            {item.text}
          </p>
        )}
        
        {/* Metadata */}
        <div className="flex items-center gap-3 mt-2">
          {/* Category select */}
          <Select
            value={item.category || 'none'}
            onValueChange={(value) => onCategoryChange(value === 'none' ? null : value as ChecklistItemCategory)}
            disabled={isDone}
          >
            <SelectTrigger className="h-7 w-auto text-xs border-0 bg-transparent px-0 gap-1">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Без категории</SelectItem>
              <SelectItem value="work">работа</SelectItem>
              <SelectItem value="personal">личное</SelectItem>
              <SelectItem value="health">здоровье</SelectItem>
              <SelectItem value="finance">финансы</SelectItem>
              <SelectItem value="learning">обучение</SelectItem>
              <SelectItem value="other">другое</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Deadline picker */}
          <Popover>
            <PopoverTrigger asChild disabled={isDone}>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  'h-7 px-2 text-xs gap-1',
                  item.deadline && new Date(item.deadline) < new Date() && !isDone && 'text-destructive'
                )}
              >
                <Calendar className="h-3 w-3" />
                {item.deadline ? formatDeadline(item.deadline) : 'Срок'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={item.deadline || undefined}
                onSelect={(date) => onDeadlineChange(date || null)}
              />
              {item.deadline && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-destructive"
                    onClick={() => onDeadlineChange(null)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Убрать срок
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
