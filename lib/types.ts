// Note entity
export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  contentHash: string
}

// ChecklistItem entity
export type ChecklistItemStatus = 'pending' | 'done'
export type ChecklistItemCategory = 'work' | 'personal' | 'health' | 'finance' | 'learning' | 'other' | null

export interface ChecklistItem {
  id: string
  checklistId: string
  text: string
  status: ChecklistItemStatus
  category: ChecklistItemCategory
  deadline: Date | null
  createdAt: Date
  updatedAt: Date
}

// Checklist entity
export interface Checklist {
  id: string
  noteId: string | null // null if orphan (note deleted)
  items: ChecklistItem[]
  createdAt: Date
  updatedAt: Date
}

// Tab types
export type TabType = 'notes' | 'checklists' | 'tasks'

// Category labels for display
export const CATEGORY_LABELS: Record<string, string> = {
  work: 'работа',
  personal: 'личное',
  health: 'здоровье',
  finance: 'финансы',
  learning: 'обучение',
  other: 'другое',
}
