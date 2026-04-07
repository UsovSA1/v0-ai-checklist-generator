'use client'

import { FileText, CheckSquare, ListTodo } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { TabType } from '@/lib/types'

export function AppHeader() {
  const { activeTab, setActiveTab } = useAppStore()

  const tabs: { value: TabType; label: string; icon: React.ReactNode }[] = [
    { value: 'notes', label: 'Заметки', icon: <FileText className="h-4 w-4" /> },
    { value: 'checklists', label: 'Чеклисты', icon: <CheckSquare className="h-4 w-4" /> },
    { value: 'tasks', label: 'Задачи', icon: <ListTodo className="h-4 w-4" /> },
  ]

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">D</span>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-foreground leading-none">DO IT</span>
          <span className="text-[10px] text-muted-foreground tracking-widest uppercase">Notes & Checklists</span>
        </div>
      </div>

      {/* Tabs */}
      <nav className="flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.value
                ? 'border border-border bg-card text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Spacer for balance */}
      <div className="w-32" />
    </header>
  )
}
