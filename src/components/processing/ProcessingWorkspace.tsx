'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Cpu, 
  Zap, 
  Settings, 
  Play, 
  Pause, 
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  Eye,
  Download,
  Filter,
  Search
} from 'lucide-react'

interface ProcessingStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  duration: string
  progress: number
  description: string
}

interface DataTransformation {
  id: string
  inputType: string
  outputType: string
  status: 'processing' | 'completed' | 'failed'
  recordsProcessed: number
  totalRecords: number
}

export function ProcessingWorkspace() {
  const [activePipeline, setActivePipeline] = useState('data-cleaning')
  const [isPaused, setIsPaused] = useState(false)

  // Simulate dynamic processing progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProcessingSteps(prev => {
        const updatedSteps = [...prev]
        
        // Check if OCR Processing is completed and start Entity Recognition
        const ocrStep = updatedSteps.find(s => s.name === 'OCR Processing')
        const entityStep = updatedSteps.find(s => s.name === 'Entity Recognition')
        const structuringStep = updatedSteps.find(s => s.name === 'Data Structuring')
        
        // Start Entity Recognition when OCR Processing completes
        if (ocrStep?.status === 'completed' && entityStep?.status === 'pending') {
          const entityIndex = updatedSteps.findIndex(s => s.name === 'Entity Recognition')
          updatedSteps[entityIndex] = { ...entityStep, status: 'running', progress: 0 }
        }
        
        // Start Data Structuring when Entity Recognition completes
        if (entityStep?.status === 'completed' && structuringStep?.status === 'pending') {
          const structuringIndex = updatedSteps.findIndex(s => s.name === 'Data Structuring')
          updatedSteps[structuringIndex] = { ...structuringStep, status: 'running', progress: 0 }
        }
        
        // Update running steps
        return updatedSteps.map((step) => {
          if (step.status === 'running') {
            const newProgress = Math.min(step.progress + Math.random() * 15, 100)
            if (newProgress >= 100) {
              return { ...step, status: 'completed' as const, progress: 100, duration: `${(Math.random() * 5 + 2).toFixed(1)}s` }
            }
            return { ...step, progress: newProgress }
          }
          return step
        })
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])
  
  const pipelines = [
    { id: 'data-cleaning', name: 'Data Cleaning Pipeline', status: 'running' },
    { id: 'ocr-extraction', name: 'OCR Text Extraction', status: 'completed' },
    { id: 'image-analysis', name: 'Image Analysis', status: 'queued' },
    { id: 'sentiment-analysis', name: 'Sentiment Analysis', status: 'processing' }
  ]

  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([
    {
      id: '1',
      name: 'Data Validation',
      status: 'completed',
      duration: '2.3s',
      progress: 100,
      description: 'Validating data formats and structure'
    },
    {
      id: '2',
      name: 'Noise Removal',
      status: 'completed',
      duration: '5.1s',
      progress: 100,
      description: 'Removing corrupted and duplicate entries'
    },
    {
      id: '3',
      name: 'OCR Processing',
      status: 'running',
      duration: '12.4s',
      progress: 67,
      description: 'Extracting text from scanned documents'
    },
    {
      id: '4',
      name: 'Entity Recognition',
      status: 'pending',
      duration: '0s',
      progress: 0,
      description: 'Identifying named entities and relationships'
    },
    {
      id: '5',
      name: 'Data Structuring',
      status: 'pending',
      duration: '0s',
      progress: 0,
      description: 'Converting to structured JSON format'
    }
  ])

  const transformations: DataTransformation[] = [
    {
      id: '1',
      inputType: 'PDF Documents',
      outputType: 'Structured Text',
      status: 'completed',
      recordsProcessed: 1234,
      totalRecords: 1234
    },
    {
      id: '2',
      inputType: 'Scanned Images',
      outputType: 'Extracted Text',
      status: 'processing',
      recordsProcessed: 567,
      totalRecords: 890
    },
    {
      id: '3',
      inputType: 'Video Files',
      outputType: 'Frame Analysis',
      status: 'processing',
      recordsProcessed: 234,
      totalRecords: 456
    },
    {
      id: '4',
      inputType: 'Audio Recordings',
      outputType: 'Transcripts',
      status: 'completed',
      recordsProcessed: 123,
      totalRecords: 123
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'running': return 'text-cyan-400'
      case 'processing': return 'text-yellow-400'
      case 'pending': return 'text-gray-400'
      case 'queued': return 'text-purple-400'
      case 'failed': return 'text-red-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'failed': return AlertTriangle
      case 'error': return AlertTriangle
      default: return Clock
    }
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism-dark border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Pipeline Control</h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isPaused 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                  : 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
            <button 
              onClick={() => {
                console.log('Restarting pipeline')
                setProcessingSteps(prev => prev.map(step => ({
                  ...step,
                  status: 'pending' as const,
                  progress: 0,
                  duration: '0s'
                })))
                alert('Pipeline restarted! All steps reset to pending.')
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>
            <button 
              onClick={() => {
                console.log('Opening pipeline configuration')
                alert(`Pipeline Configuration:\n\nActive Pipeline: ${activePipeline}\n\nSettings:\n- Batch Size: 32\n- Max Workers: 4\n- Timeout: 300s\n- Retry Attempts: 3`)
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Configure</span>
            </button>
          </div>
        </div>

        {/* Pipeline Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {pipelines.map((pipeline, index) => (
            <motion.button
              key={pipeline.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActivePipeline(pipeline.id)}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                activePipeline === pipeline.id
                  ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-cyan-500/30 neon-glow'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{pipeline.name}</span>
                <div className={`w-2 h-2 rounded-full ${
                  pipeline.status === 'running' ? 'bg-cyan-400 animate-pulse' :
                  pipeline.status === 'completed' ? 'bg-green-400' :
                  pipeline.status === 'queued' ? 'bg-purple-400' :
                  'bg-red-400'
                }`} />
              </div>
              <span className={`text-sm ${getStatusColor(pipeline.status)}`}>
                {pipeline.status}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Processing Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-morphism-dark border border-white/10 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Processing Steps</h2>
        
        <div className="space-y-4">
          {processingSteps.map((step, index) => {
            const StatusIcon = getStatusIcon(step.status)
            
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center space-x-4"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  step.status === 'completed' ? 'bg-green-500/20' :
                  step.status === 'running' ? 'bg-cyan-500/20' :
                  step.status === 'error' ? 'bg-red-500/20' :
                  'bg-gray-500/20'
                }`}>
                  <StatusIcon className={`w-5 h-5 ${getStatusColor(step.status)}`} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium">{step.name}</h4>
                      <p className="text-sm text-gray-400">{step.description}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm ${getStatusColor(step.status)}`}>
                        {step.status}
                      </span>
                      <p className="text-xs text-gray-500">{step.duration}</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${step.progress}%` }}
                      transition={{ delay: 0.3 + index * 0.1, duration: 1 }}
                      className={`h-2 rounded-full ${
                        step.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                        step.status === 'running' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                        step.status === 'error' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                        'bg-gray-600'
                      }`}
                    />
                  </div>
                </div>
                
                {index < processingSteps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-gray-500" />
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Data Transformations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-morphism-dark border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Data Transformations</h2>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => {
                console.log('Filtering transformations')
                alert('Filter Options:\n\n- Status: All | Processing | Completed | Failed\n- Type: PDF | Images | Video | Text | Code\n- Date Range: Last 24h | 7d | 30d | All\n\n(Select filter criteria to apply)')
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
            <button 
              onClick={() => {
                console.log('Searching transformations')
                const searchTerm = prompt('Search transformations:', '')
                if (searchTerm) {
                  alert(`Searching for: "${searchTerm}"\n\nFound 3 matching transformations:\n1. PDF to Text (Completed)\n2. Image Analysis (Processing)\n3. Code Extraction (Queued)`)
                }
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {transformations.map((transform, index) => (
            <motion.div
              key={transform.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-4 bg-white/5 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{transform.inputType}</h4>
                    <p className="text-sm text-gray-400">→ {transform.outputType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center space-x-1 ${getStatusColor(transform.status)}`}>
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">{transform.status}</span>
                  </div>
                  <button 
                    onClick={() => {
                      console.log('Viewing transformation details:', transform)
                      alert(`Transformation Details:\n\nInput Type: ${transform.inputType}\nOutput Type: ${transform.outputType}\nStatus: ${transform.status}\nRecords: ${transform.recordsProcessed.toLocaleString()} / ${transform.totalRecords.toLocaleString()}\nProgress: ${Math.round((transform.recordsProcessed / transform.totalRecords) * 100)}%\n\n(Click to see detailed processing logs)`)
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => {
                      console.log('Downloading transformation results:', transform)
                      const exportData = {
                        transformation: `${transform.inputType} to ${transform.outputType}`,
                        status: transform.status,
                        records_processed: transform.recordsProcessed,
                        total_records: transform.totalRecords,
                        progress_percentage: Math.round((transform.recordsProcessed / transform.totalRecords) * 100),
                        exported_at: new Date().toISOString(),
                        sample_data: Array.from({ length: 3 }, (_, i) => ({
                          id: i + 1,
                          input: `Sample input ${i + 1}`,
                          output: `Processed output ${i + 1}`,
                          confidence: 0.95 - (i * 0.05)
                        }))
                      }
                      
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `transformation_${transform.inputType}_to_${transform.outputType}.json`
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      URL.revokeObjectURL(url)
                      
                      alert(`Transformation results exported successfully!`)
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {transform.recordsProcessed.toLocaleString()} / {transform.totalRecords.toLocaleString()} records
                </span>
                <span className="text-cyan-400">
                  {Math.round((transform.recordsProcessed / transform.totalRecords) * 100)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(transform.recordsProcessed / transform.totalRecords) * 100}%` }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 1 }}
                  className={`h-2 rounded-full ${
                    transform.status === 'completed' ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    transform.status === 'processing' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                    'bg-gradient-to-r from-red-500 to-orange-500'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { title: 'Processing Speed', value: '1,234', unit: 'records/min', change: '+12%', icon: Zap },
          { title: 'Accuracy Rate', value: '94.7', unit: '%', change: '+2.3%', icon: CheckCircle },
          { title: 'Error Rate', value: '0.3', unit: '%', change: '-0.1%', icon: AlertTriangle }
        ].map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="glass-morphism-dark border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className={`text-sm ${
                  metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {metric.value}<span className="text-lg text-gray-400 ml-1">{metric.unit}</span>
              </h3>
              <p className="text-gray-400 text-sm">{metric.title}</p>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
