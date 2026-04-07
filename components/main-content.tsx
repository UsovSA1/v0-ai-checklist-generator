'use client'

import { useAppStore } from '@/lib/store'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { NoteEditor } from './note-editor'
import { ChecklistView } from './checklist-view'
import { TasksView } from './tasks-view'
import type { TabType } from '@/lib/types'

export function MainContent() {
  const { activeTab, setActiveTab, notes, checklists, getAllTasks } = useAppStore()
  
  const notesCount = notes.length
  const checklistsCount = checklists.length
  const tasksCount = getAllTasks().length
  
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-background">
      {/* Tabs Header */}
      <div className="border-b border-border px-6 py-3">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)}>
          <TabsList className="bg-transparent gap-1 p-0 h-auto">
            <TabsTrigger 
              value="notes" 
              className="data-[state=active]:bg-muted px-4 py-2 rounded-lg"
            >
              Заметки
              <span className="ml-1.5 text-xs text-muted-foreground">{notesCount}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="checklists"
              className="data-[state=active]:bg-muted px-4 py-2 rounded-lg"
            >
              Чеклисты
              <span className="ml-1.5 text-xs text-muted-foreground">{checklistsCount}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tasks"
              className="data-[state=active]:bg-muted px-4 py-2 rounded-lg"
            >
              Задачи
              <span className="ml-1.5 text-xs text-muted-foreground">{tasksCount}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'notes' && <NoteEditor />}
        {activeTab === 'checklists' && <ChecklistView />}
        {activeTab === 'tasks' && <TasksView />}
      </div>
    </main>
  )
}
