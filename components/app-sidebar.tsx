'use client'

import { Search, Plus, ArrowUpDown, X } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
    sortOrder,
    setSortOrder,
    tagFilter,
    setTagFilter,
    getAllTags,
  } = useAppStore()

  const allTags = getAllTags()

  // Filter based on active tab, search and tag
  const filteredNotes = notes
    .filter((note) => {
      // Tag filter
      if (tagFilter && !note.tags.includes(tagFilter)) return false
      
      // Search filter
      if (!searchQuery) return true
      return (
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })
    .sort((a, b) => {
      const comparison = a.updatedAt.getTime() - b.updatedAt.getTime()
      return sortOrder === 'desc' ? -comparison : comparison
    })

  const filteredChecklists = checklists
    .filter((checklist) => {
      const note = notes.find((n) => n.id === checklist.noteId)
      const title = note?.title || 'Удаленная заметка'
      if (!searchQuery) return true
      return title.toLowerCase().includes(searchQuery.toLowerCase())
    })
    .sort((a, b) => {
      const comparison = a.updatedAt.getTime() - b.updatedAt.getTime()
      return sortOrder === 'desc' ? -comparison : comparison
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

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
  }

  // Don't show sidebar for tasks tab
  if (activeTab === 'tasks') {
    return null
  }

  return (
    <aside className="w-72 h-full flex flex-col border-r border-border bg-muted">
      {/* Search */}
      <div className="p-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border"
          />
        </div>
        
        {/* Sort and Filter Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSortOrder}
            className="gap-1 text-xs h-7"
          >
            <ArrowUpDown className="h-3 w-3" />
            {sortOrder === 'desc' ? 'Новые' : 'Старые'}
          </Button>
        </div>

        {/* Tag Filters (only for notes) */}
        {activeTab === 'notes' && allTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tagFilter && (
              <Badge 
                variant="default" 
                className="cursor-pointer gap-1 text-xs"
                onClick={() => setTagFilter(null)}
              >
                {tagFilter}
                <X className="h-3 w-3" />
              </Badge>
            )}
            {!tagFilter && allTags.map((tag) => (
              <Badge 
                key={tag}
                variant="outline" 
                className="cursor-pointer text-xs hover:bg-accent"
                onClick={() => setTagFilter(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
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
            {filteredNotes.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                Заметки не найдены
              </div>
            )}
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
            {filteredChecklists.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                Чеклисты не найдены
              </div>
            )}
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
