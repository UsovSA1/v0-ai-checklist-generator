'use client'

import { Search, Plus, Settings, Filter } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { NoteCard } from './note-card'
import { ChecklistCard } from './checklist-card'

export function AppSidebar() {
  const {
    activeTab,
    notes,
    checklists,
    selectedNoteId,
    selectedChecklistId,
    searchQuery,
    setSearchQuery,
    selectNote,
    selectChecklist,
    createNote,
  } = useAppStore()

  // Filter based on active tab and search
  const filteredNotes = notes.filter((note) => {
    if (!searchQuery) return true
    return (
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const filteredChecklists = checklists.filter((checklist) => {
    const note = notes.find((n) => n.id === checklist.noteId)
    const title = note?.title || 'Удаленная заметка'
    if (!searchQuery) return true
    return title.toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Get item count based on active tab
  const getItemCount = () => {
    if (activeTab === 'notes') return filteredNotes.length
    if (activeTab === 'checklists') return filteredChecklists.length
    return 0
  }

  const handleCreateNew = () => {
    if (activeTab === 'notes') {
      createNote()
    }
  }

  // Don't show sidebar for tasks tab
  if (activeTab === 'tasks') {
    return null
  }

  return (
    <aside className="w-72 h-full flex flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold tracking-tight text-foreground">do it</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск заметок..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-muted border-0"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-3">
        {activeTab === 'notes' && (
          <div className="space-y-1">
            {filteredNotes.map((note) => {
              const checklist = checklists.find((cl) => cl.noteId === note.id)
              const hasChecklist = !!checklist && checklist.items.length > 0
              
              return (
                <NoteCard
                  key={note.id}
                  note={note}
                  hasChecklist={hasChecklist}
                  isSelected={selectedNoteId === note.id}
                  onClick={() => selectNote(note.id)}
                />
              )
            })}
          </div>
        )}

        {activeTab === 'checklists' && (
          <div className="space-y-1">
            {filteredChecklists.map((checklist) => {
              const note = notes.find((n) => n.id === checklist.noteId)
              
              return (
                <ChecklistCard
                  key={checklist.id}
                  checklist={checklist}
                  noteTitle={note?.title}
                  isSelected={selectedChecklistId === checklist.id}
                  onClick={() => selectChecklist(checklist.id)}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {getItemCount()} {activeTab === 'notes' ? 'заметок' : 'чеклистов'}
        </span>
        {activeTab === 'notes' && (
          <Button onClick={handleCreateNew} size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Новая
          </Button>
        )}
      </div>
    </aside>
  )
}
