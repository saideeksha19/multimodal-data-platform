'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MainWorkspace } from '@/components/layout/MainWorkspace'
import { HomeDashboard } from '@/components/dashboard/HomeDashboard'
import { DataUploadCenter } from '@/components/upload/DataUploadCenter'
import { ProcessingWorkspace } from '@/components/processing/ProcessingWorkspace'
import { AIDebugConsole } from '@/components/debug/AIDebugConsole'
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard'
import { DatasetExplorer } from '@/components/dataset/DatasetExplorer'

type ActiveView = 'dashboard' | 'upload' | 'processing' | 'debug' | 'analytics' | 'dataset'

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleViewChange = (view: string) => {
    setActiveView(view as ActiveView)
  }

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <HomeDashboard />
      case 'upload':
        return <DataUploadCenter />
      case 'processing':
        return <ProcessingWorkspace />
      case 'debug':
        return <AIDebugConsole />
      case 'analytics':
        return <AnalyticsDashboard />
      case 'dataset':
        return <DatasetExplorer />
      default:
        return <HomeDashboard />
    }
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        activeView={activeView}
        onViewChange={handleViewChange}
      />
      <div className="flex-1 flex flex-col">
        <Header 
          sidebarCollapsed={sidebarCollapsed}
          activeView={activeView}
        />
        <MainWorkspace>
          {renderActiveView()}
        </MainWorkspace>
      </div>
    </div>
  )
}
