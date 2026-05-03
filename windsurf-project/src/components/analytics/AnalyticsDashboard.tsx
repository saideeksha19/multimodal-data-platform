'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Clock,
  Download,
  Filter,
  Calendar,
  Zap,
  Database,
  Cpu,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings
} from 'lucide-react'

interface MetricCard {
  title: string
  value: string
  change: string
  icon: any
  color: string
  trend: 'up' | 'down'
}

interface ChartData {
  name: string
  value: number
  change?: number
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d')
  const [selectedMetric, setSelectedMetric] = useState('volume')
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true)
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ format })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `logs.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        console.log(`Exported logs as ${format}`)
      } else {
        console.error('Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const metrics: MetricCard[] = [
    {
      title: 'Data Volume',
      value: '2.4TB',
      change: '+15%',
      icon: Database,
      color: 'from-blue-500 to-cyan-500',
      trend: 'up'
    },
    {
      title: 'Processing Speed',
      value: '1,234/min',
      change: '+8%',
      icon: Zap,
      color: 'from-green-500 to-emerald-500',
      trend: 'up'
    },
    {
      title: 'Error Rate',
      value: '0.2%',
      change: '-0.1%',
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-500',
      trend: 'down'
    },
    {
      title: 'Model Accuracy',
      value: '94.7%',
      change: '+2.3%',
      icon: CheckCircle,
      color: 'from-purple-500 to-pink-500',
      trend: 'up'
    }
  ]

  const volumeData: ChartData[] = [
    { name: 'Mon', value: 2400, change: 12 },
    { name: 'Tue', value: 1398, change: -8 },
    { name: 'Wed', value: 9800, change: 45 },
    { name: 'Thu', value: 3908, change: 15 },
    { name: 'Fri', value: 4800, change: 22 },
    { name: 'Sat', value: 3800, change: -5 },
    { name: 'Sun', value: 4300, change: 8 }
  ]

  const performanceData: ChartData[] = [
    { name: 'OCR Processing', value: 89 },
    { name: 'Text Analysis', value: 76 },
    { name: 'Image Recognition', value: 92 },
    { name: 'Video Processing', value: 68 },
    { name: 'Audio Transcription', value: 81 }
  ]

  const errorData = [
    { type: 'Retrieval Failure', count: 23, percentage: 45 },
    { type: 'Embedding Mismatch', count: 15, percentage: 29 },
    { type: 'Context Overflow', count: 8, percentage: 16 },
    { type: 'Hallucination', count: 5, percentage: 10 }
  ]

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold gradient-text">Analytics Dashboard</h2>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button 
            onClick={() => handleExport('json')}
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
          <button 
            onClick={() => {
              console.log('Opening analytics settings')
              alert(`Analytics Settings:\n\nTime Range: ${timeRange}\nSelected Metric: ${selectedMetric}\n\nAvailable Settings:\n- Auto-refresh: Enabled\n- Data Resolution: High\n- Chart Type: Interactive\n- Export Format: JSON/CSV\n\n(Configure dashboard preferences here)`)
            }}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {metrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="glass-morphism-dark border border-white/10 rounded-xl p-6 hover-glow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${
                  metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                  <span>{metric.change}</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
              <p className="text-gray-400 text-sm">{metric.title}</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Volume Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-morphism-dark border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Data Volume Trends</h3>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Eye className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {volumeData.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="flex items-center space-x-4"
              >
                <div className="w-12 text-sm text-gray-400">{item.name}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{(item.value / 1000).toFixed(1)}K</span>
                    <span className={`text-xs ${
                      item.change && item.change > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {item.change && item.change > 0 ? '+' : ''}{item.change}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(item.value / 10000) * 100}%` }}
                      transition={{ delay: 0.5 + index * 0.05, duration: 0.8 }}
                      className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-morphism-dark border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Model Performance</h3>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Eye className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {performanceData.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="flex items-center space-x-4"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-white">{item.name}</span>
                    <span className="text-sm text-cyan-400">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ delay: 0.5 + index * 0.05, duration: 0.8 }}
                      className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Error Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-morphism-dark border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Error Analysis</h3>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-4">Error Distribution</h4>
            <div className="space-y-3">
              {errorData.map((error, index) => (
                <motion.div
                  key={error.type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      error.type === 'Retrieval Failure' ? 'bg-red-400' :
                      error.type === 'Embedding Mismatch' ? 'bg-orange-400' :
                      error.type === 'Context Overflow' ? 'bg-yellow-400' :
                      'bg-purple-400'
                    }`} />
                    <span className="text-sm text-white">{error.type}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-400">{error.count} occurrences</span>
                    <span className="text-sm text-cyan-400">{error.percentage}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-4">Recent Error Trends</h4>
            <div className="space-y-3">
              {[
                { time: '2 hours ago', type: 'Retrieval Failure', severity: 'high' },
                { time: '5 hours ago', type: 'Context Overflow', severity: 'medium' },
                { time: '8 hours ago', type: 'Embedding Mismatch', severity: 'low' },
                { time: '12 hours ago', type: 'Hallucination', severity: 'critical' }
              ].map((error, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className={`w-4 h-4 ${
                      error.severity === 'critical' ? 'text-red-400' :
                      error.severity === 'high' ? 'text-orange-400' :
                      error.severity === 'medium' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`} />
                    <div>
                      <p className="text-sm text-white">{error.type}</p>
                      <p className="text-xs text-gray-400">{error.time}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    error.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    error.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    error.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {error.severity}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* System Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          {
            title: 'CPU Usage',
            current: 42,
            average: 38,
            peak: 67,
            icon: Cpu,
            color: 'from-blue-500 to-cyan-500'
          },
          {
            title: 'Memory Usage',
            current: 68,
            average: 62,
            peak: 85,
            icon: Database,
            color: 'from-purple-500 to-pink-500'
          },
          {
            title: 'GPU Usage',
            current: 23,
            average: 19,
            peak: 45,
            icon: Zap,
            color: 'from-green-500 to-emerald-500'
          }
        ].map((resource, index) => {
          const Icon = resource.icon
          return (
            <motion.div
              key={resource.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="glass-morphism-dark border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 bg-gradient-to-br ${resource.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">{resource.current}%</span>
              </div>
              
              <h4 className="text-white font-medium mb-3">{resource.title}</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Average</span>
                  <span className="text-cyan-400">{resource.average}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Peak</span>
                  <span className="text-orange-400">{resource.peak}%</span>
                </div>
              </div>
              
              <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${resource.current}%` }}
                  transition={{ delay: 0.7 + index * 0.1, duration: 1 }}
                  className={`h-2 rounded-full bg-gradient-to-r ${resource.color.replace('from-', 'from-').replace(' to-', ' to-')}`}
                />
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
