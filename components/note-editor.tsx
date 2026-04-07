'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Trash2, 
  Sparkles, 
  Check, 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Heading2,
  Quote,
  X,
  Plus
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [newTag, setNewTag] = useState('')
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [isSaved, setIsSaved] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Sync state with selected note
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title)
      setContent(selectedNote.content)
      setIsSaved(true)
      setIsAddingTag(false)
      setNewTag('')
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
    setIsAddingTag(false)
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
  
  // Rich text formatting helpers
  const insertFormatting = useCallback((prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    
    const newContent = 
      content.substring(0, start) + 
      prefix + selectedText + suffix + 
      content.substring(end)
    
    if (newContent.length <= MAX_CONTENT_LENGTH) {
      setContent(newContent)
      
      // Restore cursor position
      setTimeout(() => {
        textarea.focus()
        const newCursorPos = start + prefix.length + selectedText.length + suffix.length
        textarea.setSelectionRange(newCursorPos, newCursorPos)
      }, 0)
    }
  }, [content])
  
  const insertLinePrefix = useCallback((prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const lineStart = content.lastIndexOf('\n', start - 1) + 1
    
    const newContent = 
      content.substring(0, lineStart) + 
      prefix + 
      content.substring(lineStart)
    
    if (newContent.length <= MAX_CONTENT_LENGTH) {
      setContent(newContent)
      
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + prefix.length, start + prefix.length)
      }, 0)
    }
  }, [content])
  
  const handleBold = () => insertFormatting('**')
  const handleItalic = () => insertFormatting('*')
  const handleHeading = () => insertLinePrefix('## ')
  const handleQuote = () => insertLinePrefix('> ')
  const handleBulletList = () => insertLinePrefix('- ')
  const handleNumberedList = () => insertLinePrefix('1. ')
  
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
      
      {/* Rich Text Toolbar */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-border bg-muted/30">
        <Button variant="ghost" size="sm" onClick={handleBold} className="h-8 w-8 p-0">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleItalic} className="h-8 w-8 p-0">
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button variant="ghost" size="sm" onClick={handleHeading} className="h-8 w-8 p-0">
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleQuote} className="h-8 w-8 p-0">
          <Quote className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button variant="ghost" size="sm" onClick={handleBulletList} className="h-8 w-8 p-0">
          <List className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleNumberedList} className="h-8 w-8 p-0">
          <ListOrdered className="h-4 w-4" />
        </Button>
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
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <span>{formatFullDate(selectedNote.updatedAt)}</span>
          </div>
          
          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap mb-6">
            {selectedNote.tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            
            {isAddingTag ? (
              <Input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddTag()
                  }
                  if (e.key === 'Escape') {
                    setIsAddingTag(false)
                    setNewTag('')
                  }
                }}
                onBlur={() => {
                  if (newTag.trim()) {
                    handleAddTag()
                  } else {
                    setIsAddingTag(false)
                  }
                }}
                placeholder="новый тег"
                className="w-24 h-6 text-xs px-2"
                autoFocus
              />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingTag(true)}
                className="h-6 text-xs gap-1"
              >
                <Plus className="h-3 w-3" />
                тег
              </Button>
            )}
          </div>
          
          {/* Content */}
          <textarea
            ref={textareaRef}
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
        {content.length} / {MAX_CONTENT_LENGTH}
      </div>
    </div>
  )
}
