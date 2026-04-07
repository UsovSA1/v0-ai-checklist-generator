'use client'

import { useState } from 'react'
import { Calendar, ChevronRight, X, FileText, ListChecks } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatDeadline } from '@/lib/date-utils'
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

export function TasksView() {
  const {
    notes,
    checklists,
    getAllTasks,
    selectedTaskId,
    selectTask,
    isTaskDetailOpen,
    setTaskDetailOpen,
    updateChecklistItem,
  } = useAppStore()
  
  const tasks = getAllTasks()
  const selectedTask = tasks.find((t) => t.id === selectedTaskId)
  
  // Get checklist and note for selected task
  const selectedChecklist = selectedTask 
    ? checklists.find((cl) => cl.id === selectedTask.checklistId)
    : null
  const selectedNote = selectedChecklist?.noteId
    ? notes.find((n) => n.id === selectedChecklist.noteId)
    : null
  
  const handleTaskClick = (taskId: string) => {
    selectTask(taskId)
  }
  
  const handleOpenDetail = (taskId: string) => {
    selectTask(taskId)
    setTaskDetailOpen(true)
  }
  
  const handleCloseDetail = () => {
    setTaskDetailOpen(false)
  }
  
  const handleStatusChange = (task: ChecklistItem & { noteTitle: string }) => {
    updateChecklistItem(task.checklistId, task.id, {
      status: task.status === 'done' ? 'pending' : 'done',
    })
  }
  
  const handleCategoryChange = (task: ChecklistItem & { noteTitle: string }, category: ChecklistItemCategory) => {
    if (task.status === 'done') return
    updateChecklistItem(task.checklistId, task.id, { category })
  }
  
  const handleDeadlineChange = (task: ChecklistItem & { noteTitle: string }, deadline: Date | null) => {
    if (task.status === 'done') return
    updateChecklistItem(task.checklistId, task.id, { deadline })
  }
  
  // Detail view - three columns
  if (isTaskDetailOpen && selectedChecklist) {
    return (
      <div className="h-full flex">
        {/* Left: Task list */}
        <div className="w-80 h-full border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="font-medium">Задачи</span>
            <Button variant="ghost" size="icon" onClick={handleCloseDetail}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {tasks.map((task) => (
              <TaskCardCompact
                key={task.id}
                task={task}
                isSelected={selectedTaskId === task.id}
                onClick={() => handleTaskClick(task.id)}
                onStatusChange={() => handleStatusChange(task)}
              />
            ))}
          </div>
        </div>
        
        {/* Center: Checklist */}
        <div className="flex-1 h-full border-r border-border flex flex-col min-w-0">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ListChecks className="h-4 w-4" />
              <span className="text-sm">Чеклист</span>
            </div>
            <h2 className="font-semibold mt-1 truncate">
              {selectedNote?.title || 'Удаленная заметка'}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {selectedChecklist.items.map((item) => {
                const isCurrentTask = item.id === selectedTaskId
                return (
                  <div 
                    key={item.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg transition-colors',
                      isCurrentTask && 'bg-primary/10 ring-1 ring-primary/30'
                    )}
                  >
                    <Checkbox
                      checked={item.status === 'done'}
                      onCheckedChange={() => {
                        updateChecklistItem(selectedChecklist.id, item.id, {
                          status: item.status === 'done' ? 'pending' : 'done',
                        })
                      }}
                      className={cn(
                        'mt-0.5',
                        item.status === 'done' && 'bg-success border-success'
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm',
                        item.status === 'done' && 'line-through text-muted-foreground'
                      )}>
                        {item.text}
                      </p>
                      {(item.category || item.deadline) && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          {item.category && (
                            <span>{CATEGORY_LABELS[item.category]}</span>
                          )}
                          {item.deadline && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDeadline(item.deadline)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        
        {/* Right: Note */}
        <div className="w-96 h-full flex flex-col bg-card">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Заметка</span>
            </div>
            <h2 className="font-semibold mt-1 truncate">
              {selectedNote?.title || 'Удаленная заметка'}
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {selectedNote ? (
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {selectedNote.content || 'Пустая заметка'}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Связанная заметка была удалена
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  // List view - single column
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Все задачи</h1>
        
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Пока нет задач</p>
            <p className="text-sm mt-1">
              Создайте заметку и сгенерируйте чеклист с помощью AI
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCardFull
                key={task.id}
                task={task}
                onStatusChange={() => handleStatusChange(task)}
                onCategoryChange={(cat) => handleCategoryChange(task, cat)}
                onDeadlineChange={(date) => handleDeadlineChange(task, date)}
                onOpenDetail={() => handleOpenDetail(task.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface TaskCardCompactProps {
  task: ChecklistItem & { noteTitle: string }
  isSelected: boolean
  onClick: () => void
  onStatusChange: () => void
}

function TaskCardCompact({ task, isSelected, onClick, onStatusChange }: TaskCardCompactProps) {
  const isDone = task.status === 'done'
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors',
        'hover:bg-accent',
        isSelected && 'bg-accent',
        isDone && 'opacity-60'
      )}
    >
      <Checkbox
        checked={isDone}
        onCheckedChange={(e) => {
          e.stopPropagation?.()
          onStatusChange()
        }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'mt-0.5',
          isDone && 'bg-success border-success'
        )}
      />
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm truncate',
          isDone && 'line-through text-muted-foreground'
        )}>
          {task.text}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {task.noteTitle}
        </p>
      </div>
    </div>
  )
}

interface TaskCardFullProps {
  task: ChecklistItem & { noteTitle: string }
  onStatusChange: () => void
  onCategoryChange: (category: ChecklistItemCategory) => void
  onDeadlineChange: (date: Date | null) => void
  onOpenDetail: () => void
}

function TaskCardFull({ 
  task, 
  onStatusChange, 
  onCategoryChange,
  onDeadlineChange,
  onOpenDetail,
}: TaskCardFullProps) {
  const isDone = task.status === 'done'
  const [editingText, setEditingText] = useState(false)
  const [text, setText] = useState(task.text)
  const { updateChecklistItem } = useAppStore()
  
  const handleTextSave = () => {
    if (text.trim() && text !== task.text) {
      updateChecklistItem(task.checklistId, task.id, { text: text.trim() })
    }
    setEditingText(false)
  }
  
  return (
    <div className={cn(
      'flex items-start gap-4 p-4 rounded-lg border border-border bg-card transition-colors',
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
                setText(task.text)
                setEditingText(false)
              }
            }}
            autoFocus
            className="w-full bg-transparent border-0 outline-none font-medium"
          />
        ) : (
          <p 
            className={cn(
              'font-medium cursor-pointer',
              isDone && 'line-through text-muted-foreground'
            )}
            onClick={() => !isDone && setEditingText(true)}
          >
            {task.text}
          </p>
        )}
        
        {/* Note title */}
        <p className="text-sm text-muted-foreground mt-1">
          {task.noteTitle}
        </p>
        
        {/* Controls */}
        <div className="flex items-center gap-3 mt-3">
          {/* Category */}
          <Select
            value={task.category || 'none'}
            onValueChange={(value) => onCategoryChange(value === 'none' ? null : value as ChecklistItemCategory)}
            disabled={isDone}
          >
            <SelectTrigger className="h-7 w-auto text-xs border-0 bg-muted/50 px-2 gap-1">
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
          
          {/* Deadline */}
          <Popover>
            <PopoverTrigger asChild disabled={isDone}>
              <Button 
                variant="ghost" 
                size="sm" 
                className={cn(
                  'h-7 px-2 text-xs gap-1 bg-muted/50',
                  task.deadline && new Date(task.deadline) < new Date() && !isDone && 'text-destructive'
                )}
              >
                <Calendar className="h-3 w-3" />
                {task.deadline ? formatDeadline(task.deadline) : 'Срок'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={task.deadline || undefined}
                onSelect={(date) => onDeadlineChange(date || null)}
              />
              {task.deadline && (
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
      
      {/* Open detail button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenDetail}
        className="shrink-0"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
