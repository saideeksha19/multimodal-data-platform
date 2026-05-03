'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Upload, 
  Cpu, 
  Bug, 
  BarChart3, 
  Database,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
  activeView: string
  onViewChange: (view: string) => void
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'upload', label: 'Data Upload', icon: Upload, path: '/upload' },
  { id: 'processing', label: 'Processing', icon: Cpu, path: '/processing' },
  { id: 'debug', label: 'AI Debug', icon: Bug, path: '/debug' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { id: 'dataset', label: 'Datasets', icon: Database, path: '/dataset' },
]

export function Sidebar({ collapsed, onToggleCollapse, activeView, onViewChange }: SidebarProps) {
  const pathname = usePathname()
  return (
    <motion.div
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="glass-morphism-dark border-r border-white/10 flex flex-col transition-all duration-300"
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <motion.div
            animate={{ opacity: collapsed ? 0 : 1 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold gradient-text">DataFlow AI</h1>
                <p className="text-xs text-gray-400">Multimodal Platform</p>
              </div>
            )}
          </motion.div>
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  pathname === item.path
                    ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 neon-glow'
                    : 'hover:bg-white/10'
                }`}
              >
                <div className={`relative ${collapsed ? 'mx-auto' : ''}`}>
                  <Icon className={`w-5 h-5 ${
                    pathname === item.path ? 'text-cyan-400' : 'text-gray-400 group-hover:text-white'
                  }`} />
                  {pathname === item.path && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-cyan-400/20 rounded-full blur-md"
                    />
                  )}
                </div>
                {!collapsed && (
                  <span className={`${
                    pathname === item.path ? 'text-cyan-400 font-medium' : 'text-gray-300 group-hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Status Section */}
      <div className="p-4 border-t border-white/10">
        {!collapsed && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">System Status</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">CPU Usage</span>
                <span className="text-cyan-400">42%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div className="bg-gradient-to-r from-purple-500 to-cyan-500 h-1 rounded-full" style={{ width: '42%' }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
