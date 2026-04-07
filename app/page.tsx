'use client'

import { AppSidebar } from '@/components/app-sidebar'
import { MainContent } from '@/components/main-content'
import { ChecklistPanel } from '@/components/checklist-panel'
import { useAppStore } from '@/lib/store'

export default function Home() {
  const { activeTab, selectedNoteId, isTaskDetailOpen } = useAppStore()
  
  // Determine layout based on active tab
  // Tasks tab has its own internal layout (no sidebar unless in detail mode which is handled internally)
  const showSidebar = activeTab !== 'tasks'
  const showChecklistPanel = activeTab === 'notes' && selectedNoteId
  
  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Sidebar - only for notes/checklists tabs, or tasks detail view */}
      {showSidebar && <AppSidebar />}
      
      {/* Main Content */}
      <MainContent />
      
      {/* Right Panel - Checklist (only in notes tab) */}
      {showChecklistPanel && <ChecklistPanel />}
    </div>
  )
}
