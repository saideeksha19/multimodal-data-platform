'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Database, 
  Cpu, 
  AlertTriangle, 
  TrendingUp, 
  Clock,
  Zap,
  Shield,
  FileText,
  Image,
  Video,
  Code,
  CheckCircle,
  Upload,
  Play,
  BarChart3
} from 'lucide-react'

export function HomeDashboard() {
  const [pipelines, setPipelines] = useState([
    { name: 'Data Ingestion', status: 'running', progress: 75 },
    { name: 'Image Processing', status: 'completed', progress: 100 },
    { name: 'Text Analysis', status: 'running', progress: 45 },
    { name: 'Model Training', status: 'queued', progress: 0 }
  ])

  // Simulate dynamic pipeline updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPipelines(prev => prev.map(pipeline => {
        if (pipeline.status === 'queued' && Math.random() > 0.7) {
          return { ...pipeline, status: 'running', progress: 0 }
        }
        if (pipeline.status === 'running') {
          const newProgress = Math.min(pipeline.progress + Math.random() * 15, 100)
          if (newProgress >= 100) {
            return { ...pipeline, status: 'completed', progress: 100 }
          }
          return { ...pipeline, progress: newProgress }
        }
        return pipeline
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const stats = [
    {
      title: 'System Health',
      value: '98.5%',
      change: '+2.3%',
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      trend: 'up'
    },
    {
      title: 'Data Processed',
      value: '2.4TB',
      change: '+15%',
      icon: Database,
      color: 'from-blue-500 to-cyan-500',
      trend: 'up'
    },
    {
      title: 'Active Pipelines',
      value: '12',
      change: '+3',
      icon: Cpu,
      color: 'from-purple-500 to-pink-500',
      trend: 'up'
    },
    {
      title: 'Error Rate',
      value: '0.2%',
      change: '-0.1%',
      icon: AlertTriangle,
      color: 'from-red-500 to-orange-500',
      trend: 'down'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'success',
      message: 'Completed processing of dataset "Customer Analytics"',
      timestamp: '2 minutes ago',
      icon: CheckCircle
    },
    {
      id: 2,
      type: 'warning',
      message: 'High memory usage in pipeline "Image Recognition"',
      timestamp: '15 minutes ago',
      icon: AlertTriangle
    },
    {
      id: 3,
      type: 'info',
      message: 'New dataset uploaded: "Training Images v2"',
      timestamp: '1 hour ago',
      icon: Database
    },
    {
      id: 4,
      type: 'success',
      message: 'AI model training completed with 94% accuracy',
      timestamp: '2 hours ago',
      icon: TrendingUp
    }
  ]

  const dataTypeDistribution = [
    { type: 'PDF', count: 1234, icon: FileText, color: 'text-blue-400' },
    { type: 'Images', count: 5678, icon: Image, color: 'text-green-400' },
    { type: 'Videos', count: 890, icon: Video, color: 'text-purple-400' },
    { type: 'Code', count: 456, icon: Code, color: 'text-yellow-400' }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass-morphism-dark border border-white/10 rounded-xl p-6 hover-glow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingUp className="w-4 h-4 transform rotate-180" />
                  )}
                  <span>{stat.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.title}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass-morphism-dark border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Pipeline Status</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-400">All Systems Operational</span>
            </div>
          </div>

          <div className="space-y-4">
            {pipelines.map((pipeline, index) => (
              <motion.div
                key={pipeline.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center space-x-4"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{pipeline.name}</span>
                    <span className={`text-sm ${
                      pipeline.status === 'running' ? 'text-cyan-400' :
                      pipeline.status === 'completed' ? 'text-green-400' :
                      'text-gray-400'
                    }`}>
                      {pipeline.status}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pipeline.progress}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                      className={`h-2 rounded-full ${
                        pipeline.status === 'running' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                        pipeline.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        'bg-gray-600'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-morphism-dark border border-white/10 rounded-xl p-6"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => {
              const Icon = activity.icon
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start space-x-3"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activity.type === 'success' ? 'bg-green-500/20' :
                    activity.type === 'warning' ? 'bg-yellow-500/20' :
                    'bg-blue-500/20'
                  }`}>
                    <Icon className={`w-4 h-4 ${
                      activity.type === 'success' ? 'text-green-400' :
                      activity.type === 'warning' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-300">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Data Type Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-morphism-dark border border-white/10 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Data Type Distribution</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {dataTypeDistribution.map((dataType, index) => {
            const Icon = dataType.icon
            return (
              <motion.div
                key={dataType.type}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-white/5 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Icon className={`w-8 h-8 ${dataType.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{dataType.count.toLocaleString()}</h3>
                <p className="text-gray-400 text-sm">{dataType.type}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          { title: 'Upload Data', description: 'Add new multimodal datasets', icon: Upload, color: 'from-blue-500 to-cyan-500' },
          { title: 'Start Pipeline', description: 'Process existing data', icon: Play, color: 'from-purple-500 to-pink-500' },
          { title: 'View Analytics', description: 'Detailed insights and metrics', icon: BarChart3, color: 'from-green-500 to-emerald-500' }
        ].map((action, index) => {
          const Icon = action.icon
          return (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                console.log(`Action clicked: ${action.title}`)
                if (action.title === 'Upload Data') {
                  alert('Upload Data: This would open the file upload modal where you can:\n- Drag and drop files\n- Browse and select files\n- Set upload preferences\n- Start upload process\n\n(Navigate to Upload section for full functionality)')
                } else if (action.title === 'Start Pipeline') {
                  alert('Start Pipeline: This would:\n- Show available pipelines\n- Allow configuration\n- Start processing\n- Monitor progress\n\n(Navigate to Processing section for full functionality)')
                } else if (action.title === 'View Analytics') {
                  alert('View Analytics: This would open:\n- Performance metrics\n- Data visualizations\n- Usage statistics\n- Export options\n\n(Navigate to Analytics section for full functionality)')
                }
              }}
              className="glass-morphism-dark border border-white/10 rounded-xl p-6 text-left hover-glow group"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
              <p className="text-gray-400 text-sm">{action.description}</p>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
