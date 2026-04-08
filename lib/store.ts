'use client'

import { create } from 'zustand'
import type { Note, Checklist, ChecklistItem, TabType, ChecklistItemCategory, ChecklistItemStatus } from './types'

// Helper to generate hash
function generateHash(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(36)
}

// Generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

type SortOrder = 'asc' | 'desc'
type TagFilter = string | null
type TaskSort = 'status' | 'deadline'

interface AppState {
  // Data
  notes: Note[]
  checklists: Checklist[]
  
  // UI state
  activeTab: TabType
  selectedNoteId: string | null
  selectedChecklistId: string | null
  selectedTaskId: string | null
  isTaskDetailOpen: boolean
  searchQuery: string
  sortOrder: SortOrder
  tagFilter: TagFilter
  taskSortBy: TaskSort
  
  // Track if note content changed since last AI generation
  noteContentChanged: Map<string, boolean>
  
  // Actions - Notes
  createNote: () => Note
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'content' | 'tags'>>) => void
  deleteNote: (id: string) => void
  selectNote: (id: string | null) => void
  
  // Actions - Checklists
  getChecklistByNoteId: (noteId: string) => Checklist | undefined
  createChecklistForNote: (noteId: string) => Checklist
  updateChecklistItem: (checklistId: string, itemId: string, updates: Partial<Pick<ChecklistItem, 'text' | 'status' | 'category' | 'deadline'>>) => void
  addChecklistItem: (checklistId: string, text: string) => ChecklistItem
  selectChecklist: (id: string | null) => void
  
  // Actions - Tasks
  selectTask: (id: string | null) => void
  setTaskDetailOpen: (open: boolean) => void
  setTaskSortBy: (sortBy: TaskSort) => void
  getAllTasks: () => (ChecklistItem & { noteTitle: string })[]
  
  // Actions - UI
  setActiveTab: (tab: TabType) => void
  setSearchQuery: (query: string) => void
  setSortOrder: (order: SortOrder) => void
  setTagFilter: (tag: TagFilter) => void
  getAllTags: () => string[]
  
  // Actions - AI
  canGenerateChecklist: (noteId: string) => boolean
  markChecklistGenerated: (noteId: string) => void
  generateChecklistItems: (noteId: string, items: Omit<ChecklistItem, 'id' | 'checklistId' | 'createdAt' | 'updatedAt'>[]) => void
}

// Mock data for initial state
const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Запуск нового продукта',
    content: 'Нужно подготовить презентацию для инвесторов до пятницы.\n\nСвязаться с дизайнером по поводу слайдов. Попросить Диму написать тексты для лендинга.\n\nДоговориться с юристом о NDA до встречи. Обновить roadmap на следующий квартал.\n\nЗабронировать переговорку на 15:00 в четверг. Отправить приглашения команде.',
    tags: ['работа', 'идеи'],
    createdAt: new Date('2026-04-07T14:32:00'),
    updatedAt: new Date('2026-04-07T14:32:00'),
    contentHash: 'abc123',
  },
  {
    id: 'note-2',
    title: 'Книги на лето',
    content: 'Atomic Habits, Deep Work, The Pragmatic Programmer.\n\nПосмотреть рекомендации от Павла. Составить список для Kindle.',
    tags: ['личное'],
    createdAt: new Date('2026-04-06T09:15:00'),
    updatedAt: new Date('2026-04-06T09:15:00'),
    contentHash: 'def456',
  },
  {
    id: 'note-3',
    title: 'Ретроспектива Q1',
    content: 'Что сделали хорошо: запустили новый модуль аналитики, улучшили время ответа API на 40%.\n\nЧто улучшить: коммуникация между командами, документация.',
    tags: ['работа'],
    createdAt: new Date('2026-04-05T00:00:00'),
    updatedAt: new Date('2026-04-05T00:00:00'),
    contentHash: 'ghi789',
  },
  {
    id: 'note-4',
    title: 'Идеи для side project',
    content: '1. Сервис заметок с AI чеклистами\n2. Трекер привычек с геймификацией\n3. Приложение для учета расходов',
    tags: ['идеи'],
    createdAt: new Date('2026-04-03T00:00:00'),
    updatedAt: new Date('2026-04-03T00:00:00'),
    contentHash: 'jkl012',
  },
  {
    id: 'note-5',
    title: 'Встреча с командой',
    content: 'Обсудить спринт, распределить задачи на неделю. Проверить статус по багам.',
    tags: ['работа'],
    createdAt: new Date('2026-04-01T00:00:00'),
    updatedAt: new Date('2026-04-01T00:00:00'),
    contentHash: 'mno345',
  },
]

const mockChecklists: Checklist[] = [
  {
    id: 'checklist-1',
    noteId: 'note-1',
    items: [
      {
        id: 'item-1',
        checklistId: 'checklist-1',
        text: 'Подготовить презентацию для инвесторов',
        status: 'done',
        category: 'work',
        deadline: new Date('2026-04-11'),
        createdAt: new Date('2026-04-07T14:32:00'),
        updatedAt: new Date('2026-04-07T14:32:00'),
      },
      {
        id: 'item-2',
        checklistId: 'checklist-1',
        text: 'Связаться с дизайнером по слайдам',
        status: 'done',
        category: null,
        deadline: null,
        createdAt: new Date('2026-04-07T14:32:00'),
        updatedAt: new Date('2026-04-07T14:32:00'),
      },
      {
        id: 'item-3',
        checklistId: 'checklist-1',
        text: 'Попросить Диму написать тексты для лендинга',
        status: 'pending',
        category: 'work',
        deadline: new Date('2026-04-05'),
        createdAt: new Date('2026-04-07T14:32:00'),
        updatedAt: new Date('2026-04-07T14:32:00'),
      },
      {
        id: 'item-4',
        checklistId: 'checklist-1',
        text: 'Договориться с юристом о NDA',
        status: 'pending',
        category: null,
        deadline: new Date('2026-04-09'),
        createdAt: new Date('2026-04-07T14:32:00'),
        updatedAt: new Date('2026-04-07T14:32:00'),
      },
      {
        id: 'item-5',
        checklistId: 'checklist-1',
        text: 'Обновить roadmap на следующий квартал',
        status: 'pending',
        category: 'work',
        deadline: null,
        createdAt: new Date('2026-04-07T14:32:00'),
        updatedAt: new Date('2026-04-07T14:32:00'),
      },
      {
        id: 'item-6',
        checklistId: 'checklist-1',
        text: 'Забронировать переговорку и отправить приглашения',
        status: 'pending',
        category: null,
        deadline: new Date('2026-04-08T15:00:00'),
        createdAt: new Date('2026-04-07T14:32:00'),
        updatedAt: new Date('2026-04-07T14:32:00'),
      },
    ],
    createdAt: new Date('2026-04-07T14:32:00'),
    updatedAt: new Date('2026-04-07T14:32:00'),
  },
  {
    id: 'checklist-3',
    noteId: 'note-3',
    items: [
      {
        id: 'item-7',
        checklistId: 'checklist-3',
        text: 'Написать документацию по новому модулю',
        status: 'pending',
        category: 'work',
        deadline: null,
        createdAt: new Date('2026-04-05T00:00:00'),
        updatedAt: new Date('2026-04-05T00:00:00'),
      },
      {
        id: 'item-8',
        checklistId: 'checklist-3',
        text: 'Настроить регулярные синки ме��ду командами',
        status: 'done',
        category: 'work',
        deadline: null,
        createdAt: new Date('2026-04-05T00:00:00'),
        updatedAt: new Date('2026-04-05T00:00:00'),
      },
    ],
    createdAt: new Date('2026-04-05T00:00:00'),
    updatedAt: new Date('2026-04-05T00:00:00'),
  },
]

export const useAppStore = create<AppState>((set, get) => ({
  // Initial data
  notes: mockNotes,
  checklists: mockChecklists,
  
  // Initial UI state
  activeTab: 'notes',
  selectedNoteId: 'note-1',
  selectedChecklistId: null,
  selectedTaskId: null,
  isTaskDetailOpen: false,
  searchQuery: '',
  sortOrder: 'desc',
  tagFilter: null,
  taskSortBy: 'status',
  noteContentChanged: new Map(),
  
  // Notes actions
  createNote: () => {
    const now = new Date()
    const defaultTitle = now.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', '')
    
    const newNote: Note = {
      id: generateId(),
      title: defaultTitle,
      content: '',
      tags: [],
      createdAt: now,
      updatedAt: now,
      contentHash: generateHash(''),
    }
    set((state) => ({
      notes: [newNote, ...state.notes],
      selectedNoteId: newNote.id,
    }))
    return newNote
  },
  
  updateNote: (id, updates) => {
    set((state) => {
      const newNotes = state.notes.map((note) => {
        if (note.id !== id) return note
        
        const updatedNote = {
          ...note,
          ...updates,
          updatedAt: new Date(),
        }
        
        // Check if content changed
        if (updates.content !== undefined) {
          const newHash = generateHash(updates.content)
          if (newHash !== note.contentHash) {
            updatedNote.contentHash = newHash
            state.noteContentChanged.set(id, true)
          }
        }
        
        return updatedNote
      })
      
      return { notes: newNotes }
    })
  },
  
  deleteNote: (id) => {
    set((state) => {
      // Mark checklist as orphan instead of deleting
      const newChecklists = state.checklists.map((cl) => 
        cl.noteId === id ? { ...cl, noteId: null } : cl
      )
      
      return {
        notes: state.notes.filter((n) => n.id !== id),
        checklists: newChecklists,
        selectedNoteId: state.selectedNoteId === id ? null : state.selectedNoteId,
      }
    })
  },
  
  selectNote: (id) => set({ selectedNoteId: id }),
  
  // Checklists actions
  getChecklistByNoteId: (noteId) => {
    return get().checklists.find((cl) => cl.noteId === noteId)
  },
  
  createChecklistForNote: (noteId) => {
    const existing = get().getChecklistByNoteId(noteId)
    if (existing) return existing
    
    const newChecklist: Checklist = {
      id: generateId(),
      noteId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    set((state) => ({
      checklists: [...state.checklists, newChecklist],
    }))
    
    return newChecklist
  },
  
  updateChecklistItem: (checklistId, itemId, updates) => {
    set((state) => ({
      checklists: state.checklists.map((cl) => {
        if (cl.id !== checklistId) return cl
        
        return {
          ...cl,
          updatedAt: new Date(),
          items: cl.items.map((item) => {
            if (item.id !== itemId) return item
            
            // Don't allow modifying done items (except status toggle back to pending)
            if (item.status === 'done' && updates.status !== 'pending') {
              return item
            }
            
            return {
              ...item,
              ...updates,
              updatedAt: new Date(),
            }
          }),
        }
      }),
    }))
  },
  
  addChecklistItem: (checklistId, text) => {
    const newItem: ChecklistItem = {
      id: generateId(),
      checklistId,
      text,
      status: 'pending',
      category: null,
      deadline: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    set((state) => ({
      checklists: state.checklists.map((cl) => {
        if (cl.id !== checklistId) return cl
        return {
          ...cl,
          items: [...cl.items, newItem],
          updatedAt: new Date(),
        }
      }),
    }))
    
    return newItem
  },
  
  selectChecklist: (id) => set({ selectedChecklistId: id }),
  
  // Tasks actions
  selectTask: (id) => set({ selectedTaskId: id }),
  
  setTaskDetailOpen: (open) => set({ isTaskDetailOpen: open }),
  
  setTaskSortBy: (sortBy) => set({ taskSortBy: sortBy }),
  
  getAllTasks: () => {
    const { checklists, notes, taskSortBy } = get()
    const tasks: (ChecklistItem & { noteTitle: string })[] = []
    
    checklists.forEach((cl) => {
      const note = notes.find((n) => n.id === cl.noteId)
      const noteTitle = note?.title || 'Удаленная заметка'
      
      cl.items.forEach((item) => {
        tasks.push({
          ...item,
          noteTitle,
        })
      })
    })
    
    // Sort based on taskSortBy
    return tasks.sort((a, b) => {
      if (taskSortBy === 'status') {
        // Sort by status: pending first, then done
        if (a.status !== b.status) {
          return a.status === 'pending' ? -1 : 1
        }
        // Within same status, sort by deadline
        if (a.deadline && b.deadline) {
          return a.deadline.getTime() - b.deadline.getTime()
        }
        if (a.deadline) return -1
        if (b.deadline) return 1
        return 0
      } else {
        // Sort by deadline: closest first, no deadline last
        if (a.deadline && b.deadline) {
          return a.deadline.getTime() - b.deadline.getTime()
        }
        if (a.deadline) return -1
        if (b.deadline) return 1
        
        // If both no deadline, sort by status
        if (a.status !== b.status) {
          return a.status === 'pending' ? -1 : 1
        }
        return 0
      }
    })
  },
  
  // UI actions
  setActiveTab: (tab) => set({ activeTab: tab, isTaskDetailOpen: false }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSortOrder: (order) => set({ sortOrder: order }),
  
  setTagFilter: (tag) => set({ tagFilter: tag }),
  
  getAllTags: () => {
    const { notes } = get()
    const tagsSet = new Set<string>()
    notes.forEach((note) => {
      note.tags.forEach((tag) => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  },
  
  // AI actions
  canGenerateChecklist: (noteId) => {
    const changed = get().noteContentChanged.get(noteId)
    const checklist = get().getChecklistByNoteId(noteId)
    
    // Can generate if note changed or no checklist exists
    return changed === true || !checklist
  },
  
  markChecklistGenerated: (noteId) => {
    set((state) => {
      state.noteContentChanged.set(noteId, false)
      return { noteContentChanged: new Map(state.noteContentChanged) }
    })
  },
  
  generateChecklistItems: (noteId, items) => {
    const state = get()
    let checklist = state.getChecklistByNoteId(noteId)
    
    if (!checklist) {
      checklist = state.createChecklistForNote(noteId)
    }
    
    const checklistId = checklist.id
    
    set((state) => ({
      checklists: state.checklists.map((cl) => {
        if (cl.id !== checklistId) return cl
        
        // Keep existing items, add new ones
        // AI cannot delete or modify done items
        const newItems: ChecklistItem[] = items.map((item) => ({
          ...item,
          id: generateId(),
          checklistId,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
        
        return {
          ...cl,
          items: [...cl.items, ...newItems],
          updatedAt: new Date(),
        }
      }),
    }))
    
    state.markChecklistGenerated(noteId)
  },
}))
