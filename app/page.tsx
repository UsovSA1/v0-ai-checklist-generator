'use client'

import { AppHeader } from '@/components/app-header'
import { AppSidebar } from '@/components/app-sidebar'
import { MainContent } from '@/components/main-content'
import { ChecklistPanel } from '@/components/checklist-panel'
import { useAppStore } from '@/lib/store'

export default function Home() {
  const { activeTab, selectedNoteId } = useAppStore()
  
  // Determine layout based on active tab
  // Tasks tab has its own internal layout (no sidebar)
  const showSidebar = activeTab !== 'tasks'
  const showChecklistPanel = activeTab === 'notes' && selectedNoteId
  
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <AppHeader />
      
      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - only for notes/checklists tabs */}
        {showSidebar && <AppSidebar />}
        
        {/* Main Content */}
        <MainContent />
        
        {/* Right Panel - Checklist (only in notes tab) */}
        {showChecklistPanel && <ChecklistPanel />}
      </div>
    </div>
  )
}
