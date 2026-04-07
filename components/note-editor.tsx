'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, Sparkles, Check } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { formatFullDate } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

const MAX_CONTENT_LENGTH = 20000

export function NoteEditor() {
  const { 
    notes, 
    selectedNoteId, 
    updateNote, 
    deleteNote,
    canGenerateChecklist,
    getChecklistByNoteId,
    createChecklistForNote,
  } = useAppStore()
  
  const selectedNote = notes.find((n) => n.id === selectedNoteId)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [newTag, setNewTag] = useState('')
  const [isSaved, setIsSaved] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Sync state with selected note
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title)
      setContent(selectedNote.content)
      setIsSaved(true)
    }
  }, [selectedNote?.id])
  
  // Auto-save with debounce
  useEffect(() => {
    if (!selectedNote) return
    
    const hasChanges = title !== selectedNote.title || content !== selectedNote.content
    if (!hasChanges) {
      setIsSaved(true)
      return
    }
    
    setIsSaved(false)
    
    const timeout = setTimeout(() => {
      updateNote(selectedNote.id, { title, content })
      setIsSaved(true)
    }, 500)
    
    return () => clearTimeout(timeout)
  }, [title, content, selectedNote?.id])
  
  const handleAddTag = useCallback(() => {
    if (!selectedNote || !newTag.trim()) return
    
    const tag = newTag.trim().toLowerCase()
    if (!selectedNote.tags.includes(tag)) {
      updateNote(selectedNote.id, { tags: [...selectedNote.tags, tag] })
    }
    setNewTag('')
  }, [selectedNote, newTag, updateNote])
  
  const handleRemoveTag = useCallback((tagToRemove: string) => {
    if (!selectedNote) return
    updateNote(selectedNote.id, { 
      tags: selectedNote.tags.filter((t) => t !== tagToRemove) 
    })
  }, [selectedNote, updateNote])
  
  const handleDelete = useCallback(() => {
    if (!selectedNote) return
    if (confirm('Удалить заметку? Связанный чеклист станет "осиротевшим".')) {
      deleteNote(selectedNote.id)
    }
  }, [selectedNote, deleteNote])
  
  const handleGenerateChecklist = useCallback(async () => {
    if (!selectedNote) return
    
    setIsGenerating(true)
    
    // Simulate AI generation (in real app, this would call AI SDK)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    // For MVP, create checklist if not exists
    let checklist = getChecklistByNoteId(selectedNote.id)
    if (!checklist) {
      checklist = createChecklistForNote(selectedNote.id)
    }
    
    setIsGenerating(false)
  }, [selectedNote, getChecklistByNoteId, createChecklistForNote])
  
  if (!selectedNote) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Выберите заметку или создайте новую
      </div>
    )
  }
  
  const canGenerate = canGenerateChecklist(selectedNote.id)
  const checklist = getChecklistByNoteId(selectedNote.id)
  const hasChecklist = checklist && checklist.items.length > 0
  
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isSaved ? (
            <>
              <Check className="h-4 w-4 text-success" />
              <span>Сохранено</span>
            </>
          ) : (
            <span>Сохранение...</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleGenerateChecklist}
            disabled={!canGenerate || isGenerating}
            className={cn(
              'gap-2',
              hasChecklist ? 'bg-primary text-primary-foreground' : 'bg-primary text-primary-foreground'
            )}
          >
            <Sparkles className="h-4 w-4" />
            {isGenerating ? 'Генерация...' : hasChecklist ? 'Обновить чеклист' : 'Создать чеклист'}
          </Button>
        </div>
      </div>
      
      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок заметки"
            className="w-full text-3xl font-semibold bg-transparent border-0 outline-none placeholder:text-muted-foreground/50 mb-2"
          />
          
          {/* Metadata */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <span>{formatFullDate(selectedNote.updatedAt)}</span>
            
            {/* Tags */}
            <div className="flex items-center gap-1.5">
              {selectedNote.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleRemoveTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
                placeholder="+ тег"
                className="w-16 text-sm bg-transparent border-0 outline-none placeholder:text-muted-foreground/50"
              />
            </div>
          </div>
          
          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CONTENT_LENGTH) {
                setContent(e.target.value)
              }
            }}
            placeholder="Начните писать заметку..."
            className="w-full min-h-[400px] bg-transparent border-0 outline-none resize-none text-foreground leading-relaxed placeholder:text-muted-foreground/50"
          />
        </div>
      </div>
      
      {/* Footer with character count */}
      <div className="px-6 py-2 border-t border-border text-right text-sm text-muted-foreground">
        {content.length} / {MAX_CONTENT_LENGTH.toLocaleString()}
      </div>
    </div>
  )
}
