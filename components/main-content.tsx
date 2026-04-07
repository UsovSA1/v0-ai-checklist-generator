'use client'

import { useAppStore } from '@/lib/store'
import { NoteEditor } from './note-editor'
import { ChecklistView } from './checklist-view'
import { TasksView } from './tasks-view'

export function MainContent() {
  const { activeTab } = useAppStore()
  
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-card overflow-hidden">
      {activeTab === 'notes' && <NoteEditor />}
      {activeTab === 'checklists' && <ChecklistView />}
      {activeTab === 'tasks' && <TasksView />}
    </main>
  )
}
