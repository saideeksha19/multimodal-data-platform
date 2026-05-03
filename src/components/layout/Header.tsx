'use client'

import { motion } from 'framer-motion'
import { 
  Search, 
  Bell, 
  Settings, 
  Command,
  Activity,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface HeaderProps {
  sidebarCollapsed: boolean
  activeView: string
}

export function Header({ sidebarCollapsed, activeView }: HeaderProps) {
  const viewTitles = {
    dashboard: 'System Dashboard',
    upload: 'Data Upload Center',
    processing: 'Processing Workspace',
    debug: 'AI Debug Console',
    analytics: 'Analytics Dashboard',
    dataset: 'Dataset Explorer'
  }

  const alerts = [
    { type: 'success', message: 'Pipeline processing completed', count: 1 },
    { type: 'warning', message: 'High memory usage detected', count: 2 },
    { type: 'error', message: 'Failed to process dataset', count: 1 }
  ]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-morphism-dark border-b border-white/10 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Left Section - Title and Breadcrumb */}
        <div className="flex items-center space-x-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-2xl font-bold gradient-text">
              {viewTitles[activeView as keyof typeof viewTitles]}
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-400 mt-1">
              <span>Home</span>
              <span>/</span>
              <span className="text-cyan-400 capitalize">{activeView}</span>
            </div>
          </motion.div>
        </div>

        {/* Center Section - Search */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 max-w-xl mx-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search datasets, pipelines, or commands..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all duration-200 text-white placeholder-gray-400"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <kbd className="px-2 py-1 text-xs bg-gray-700 rounded border border-gray-600">Ctrl</kbd>
              <kbd className="px-2 py-1 text-xs bg-gray-700 rounded border border-gray-600">K</kbd>
            </div>
          </div>
        </motion.div>

        {/* Right Section - Status and Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center space-x-4"
        >
          {/* Pipeline Status */}
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Healthy</span>
          </div>

          {/* Alerts */}
          <div className="relative">
            <button 
              onClick={() => {
                console.log('Opening notifications')
                alert(`Notifications (3 unread):\n\n🔔 Pipeline completed successfully\n⚠️ High memory usage detected\n📊 Weekly report ready\n\nView all notifications in the notifications panel.`)
              }}
              className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>
            
            {/* Alerts Dropdown */}
            <div className="absolute right-0 mt-2 w-80 glass-morphism-dark border border-white/20 rounded-lg shadow-xl p-4 hidden">
              <h3 className="text-sm font-medium mb-3">System Alerts</h3>
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                    {alert.type === 'success' && <CheckCircle className="w-4 h-4 text-green-400" />}
                    {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-400" />}
                    {alert.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-400" />}
                    <div className="flex-1">
                      <p className="text-xs text-gray-300">{alert.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">{alert.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Settings */}
          <button 
            onClick={() => {
              console.log('Opening settings')
              alert(`System Settings:\n\nGeneral:\n- Theme: Dark Mode\n- Language: English\n- Timezone: UTC\n\nNotifications:\n- Email alerts: Enabled\n- Push notifications: Enabled\n- System alerts: Enabled\n\nPerformance:\n- Auto-refresh: 30s\n- Cache enabled: Yes\n- Lazy loading: Yes\n\n(Configure system preferences here)`)
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Command Palette Trigger */}
          <button 
            onClick={() => {
              console.log('Opening command palette')
              const command = prompt('Enter command (help, upload, export, debug, clear):', 'help')
              if (command) {
                switch (command.toLowerCase()) {
                  case 'help':
                    alert('Available Commands:\n\n• help - Show this help\n• upload - Open upload dialog\n• export - Export data\n• debug - Open debug console\n• clear - Clear cache\n• status - Show system status')
                    break
                  case 'upload':
                    alert('Upload Command: Opening file upload dialog...')
                    break
                  case 'export':
                    alert('Export Command: Preparing data export...')
                    break
                  case 'debug':
                    alert('Debug Command: Opening debug console...')
                    break
                  case 'clear':
                    alert('Clear Command: Cache cleared successfully!')
                    break
                  case 'status':
                    alert('System Status:\n• CPU: 42%\n• Memory: 68%\n• Disk: 23%\n• Network: Healthy\n• Uptime: 2d 14h 32m')
                    break
                  default:
                    alert(`Unknown command: "${command}"\nType "help" for available commands.`)
                }
              }
            }}
            className="flex items-center space-x-2 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
          >
            <Command className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">Commands</span>
          </button>
        </motion.div>
      </div>

      {/* Pipeline Health Bar */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.5, duration: 1 }}
        className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden"
      >
        <div className="h-full bg-gradient-to-r from-green-500 via-cyan-500 to-purple-500 rounded-full animate-pulse" />
      </motion.div>
    </motion.header>
  )
}
