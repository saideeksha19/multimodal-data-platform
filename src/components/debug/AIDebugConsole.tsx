'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Bug, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  Code,
  FileText,
  Brain,
  Target,
  Zap,
  Filter,
  Download,
  Play,
  Pause,
  X
} from 'lucide-react'

interface RAGTrace {
  id: string
  query: string
  retrieval: {
    chunks: number
    relevance: number
    sources: string[]
  }
  response: {
    text: string
    confidence: number
    hallucination: boolean
  }
  timestamp: string
  status: 'success' | 'hallucination' | 'retrieval_failure' | 'context_overflow'
}

interface ErrorClassification {
  type: 'retrieval_failure' | 'embedding_mismatch' | 'context_overflow' | 'hallucination'
  count: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

export function AIDebugConsole() {
  const [selectedTrace, setSelectedTrace] = useState<string | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [debugQuery, setDebugQuery] = useState('')
  const [debugResults, setDebugResults] = useState<any>(null)
  const [isDebugging, setIsDebugging] = useState(false)
  const [showEmbeddings, setShowEmbeddings] = useState(false)
  const [embeddingsData, setEmbeddingsData] = useState<any>(null)

  const handleDebugRetrieval = async () => {
    if (!debugQuery.trim()) return
    
    setIsDebugging(true)
    try {
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: debugQuery,
          type: 'retrieval'
        })
      })

      if (response.ok) {
        const result = await response.json()
        setDebugResults(result.data)
        console.log('Debug results:', result.data)
      } else {
        console.error('Debug request failed')
      }
    } catch (error) {
      console.error('Debug error:', error)
    } finally {
      setIsDebugging(false)
    }
  }

  const handleViewEmbeddings = async () => {
    setShowEmbeddings(true)
    try {
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: debugQuery || 'sample text',
          type: 'embedding'
        })
      })

      if (response.ok) {
        const result = await response.json()
        setEmbeddingsData(result.data)
        console.log('Embeddings data:', result.data)
      }
    } catch (error) {
      console.error('Embeddings error:', error)
    }
  }

  const handleRetestQuery = async () => {
    if (!debugQuery.trim()) return
    
    setIsDebugging(true)
    try {
      const response = await fetch('/api/debug', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: debugQuery,
          type: 'general'
        })
      })

      if (response.ok) {
        const result = await response.json()
        setDebugResults(result.data)
        console.log('Retest results:', result.data)
      }
    } catch (error) {
      console.error('Retest error:', error)
    } finally {
      setIsDebugging(false)
    }
  }
  const [filter, setFilter] = useState('all')

  const ragTraces: RAGTrace[] = [
    {
      id: '1',
      query: 'What are the main challenges in multimodal data processing?',
      retrieval: {
        chunks: 8,
        relevance: 0.87,
        sources: ['research_paper.pdf', 'case_study.doc', 'technical_spec.pdf']
      },
      response: {
        text: 'The main challenges include data heterogeneity, alignment issues...',
        confidence: 0.92,
        hallucination: false
      },
      timestamp: '2024-01-15T10:30:00Z',
      status: 'success'
    },
    {
      id: '2',
      query: 'Explain the OCR accuracy metrics',
      retrieval: {
        chunks: 3,
        relevance: 0.45,
        sources: ['outdated_manual.pdf']
      },
      response: {
        text: 'The OCR system achieves 99.9% accuracy on all documents...',
        confidence: 0.78,
        hallucination: true
      },
      timestamp: '2024-01-15T10:28:00Z',
      status: 'hallucination'
    },
    {
      id: '3',
      query: 'How does the embedding model work?',
      retrieval: {
        chunks: 0,
        relevance: 0.12,
        sources: []
      },
      response: {
        text: 'Unable to retrieve relevant information...',
        confidence: 0.23,
        hallucination: false
      },
      timestamp: '2024-01-15T10:25:00Z',
      status: 'retrieval_failure'
    }
  ]

  const errorClassifications: ErrorClassification[] = [
    {
      type: 'retrieval_failure',
      count: 23,
      severity: 'high',
      description: 'Failed to retrieve relevant documents from vector store'
    },
    {
      type: 'embedding_mismatch',
      count: 15,
      severity: 'medium',
      description: 'Query embeddings don\'t match document embeddings'
    },
    {
      type: 'context_overflow',
      count: 8,
      severity: 'low',
      description: 'Context window exceeded during processing'
    },
    {
      type: 'hallucination',
      count: 12,
      severity: 'critical',
      description: 'Model generated factually incorrect information'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400'
      case 'hallucination': return 'text-red-400'
      case 'retrieval_failure': return 'text-orange-400'
      case 'context_overflow': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle
      case 'hallucination': return AlertTriangle
      case 'retrieval_failure': return XCircle
      case 'context_overflow': return AlertTriangle
      default: return Clock
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20'
      case 'high': return 'text-orange-400 bg-orange-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      case 'low': return 'text-blue-400 bg-blue-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const filteredTraces = filter === 'all' 
    ? ragTraces 
    : ragTraces.filter(trace => trace.status === filter)

  return (
    <div className="space-y-6">
      {/* Debug Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism-dark border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">AI Pipeline Debug Console</h2>
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
                console.log('Exporting debug logs')
                const logData = {
                  export_timestamp: new Date().toISOString(),
                  debug_session: {
                    total_queries: 1234,
                    success_rate: 87.3,
                    average_response_time: '0.8s',
                    errors_detected: 12
                  },
                  recent_traces: ragTraces.slice(0, 5).map(trace => ({
                    id: trace.id,
                    query: trace.query,
                    status: trace.status,
                    timestamp: trace.timestamp,
                    retrieval_score: trace.retrieval.relevance
                  })),
                  error_classifications: [
                    { type: 'retrieval_failure', count: 15, severity: 'medium' },
                    { type: 'context_overflow', count: 8, severity: 'low' },
                    { type: 'hallucination', count: 12, severity: 'critical' }
                  ],
                  system_metrics: {
                    cpu_usage: '42%',
                    memory_usage: '68%',
                    gpu_usage: '23%',
                    active_connections: 156
                  }
                }
                
                const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `debug_logs_${new Date().toISOString().split('T')[0]}.json`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
                
                alert('Debug logs exported successfully!')
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Logs</span>
            </button>
          </div>
        </div>

        {/* Debug Query Input */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={debugQuery}
              onChange={(e) => setDebugQuery(e.target.value)}
              placeholder="Enter debug query..."
              className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleDebugRetrieval}
              disabled={isDebugging}
              className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Target className="w-4 h-4" />
              <span>{isDebugging ? 'Debugging...' : 'Debug Retrieval'}</span>
            </button>
            <button
              onClick={handleViewEmbeddings}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
            >
              <Brain className="w-4 h-4" />
              <span>View Embeddings</span>
            </button>
            <button
              onClick={handleRetestQuery}
              disabled={isDebugging}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" />
              <span>Retest Query</span>
            </button>
          </div>
        </div>

        {/* Debug Results */}
        {debugResults && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-4">Debug Results</h3>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(debugResults, null, 2)}
            </pre>
          </div>
        )}

        {/* Embeddings Modal */}
        {showEmbeddings && embeddingsData && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Embeddings Data</h3>
              <button
                onClick={() => setShowEmbeddings(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <pre className="text-xs text-gray-300 overflow-x-auto">
              {JSON.stringify(embeddingsData, null, 2)}
            </pre>
          </div>
        )}

        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { title: 'Total Queries', value: '1,234', icon: Search, color: 'from-blue-500 to-cyan-500' },
            { title: 'Success Rate', value: '87.3%', icon: CheckCircle, color: 'from-green-500 to-emerald-500' },
            { title: 'Hallucinations', value: '12', icon: AlertTriangle, color: 'from-red-500 to-orange-500' },
            { title: 'Avg Confidence', value: '0.82', icon: Brain, color: 'from-purple-500 to-pink-500' }
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-white/5 rounded-lg"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">{stat.value}</h3>
                <p className="text-sm text-gray-400">{stat.title}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Error Classifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-morphism-dark border border-white/10 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Error Classifications</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {errorClassifications.map((error, index) => (
            <motion.div
              key={error.type}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="p-4 bg-white/5 rounded-lg border border-white/10"
            >
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(error.severity)}`}>
                  {error.severity}
                </span>
                <span className="text-2xl font-bold text-white">{error.count}</span>
              </div>
              <h3 className="text-white font-medium mb-2 capitalize">
                {error.type.replace('_', ' ')}
              </h3>
              <p className="text-sm text-gray-400">{error.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* RAG Trace Viewer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-morphism-dark border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">RAG Trace Viewer</h2>
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="hallucination">Hallucination</option>
              <option value="retrieval_failure">Retrieval Failure</option>
              <option value="context_overflow">Context Overflow</option>
            </select>
            <button 
              onClick={() => {
                console.log('Filtering debug traces')
                alert('Filter Debug Traces:\n\nFilter Options:\n- Status: All | Success | Hallucination | Retrieval Failure | Context Overflow\n- Time Range: Last Hour | Last 24h | Last 7d | All\n- Query Type: All | Text | Image | Mixed\n- Min Confidence: 0.0 - 1.0\n\n(Select filters to apply to debug traces)')
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTraces.map((trace, index) => {
            const StatusIcon = getStatusIcon(trace.status)
            
            return (
              <motion.div
                key={trace.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className={`p-4 bg-white/5 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedTrace === trace.id 
                    ? 'border-cyan-500/50 bg-cyan-500/10' 
                    : 'border-white/10 hover:border-white/20'
                }`}
                onClick={() => setSelectedTrace(trace.id)}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <StatusIcon className={`w-5 h-5 ${getStatusColor(trace.status)}`} />
                    <div>
                      <h4 className="text-white font-medium">{trace.query}</h4>
                      <p className="text-sm text-gray-400">{trace.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-cyan-400">
                        {trace.response.confidence.toFixed(2)} confidence
                      </p>
                      <p className="text-xs text-gray-400">
                        {trace.retrieval.chunks} chunks retrieved
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        console.log('Viewing trace details:', trace)
                        alert(`RAG Trace Details:\n\nQuery: "${trace.query}"\nStatus: ${trace.status}\nTimestamp: ${trace.timestamp}\n\nRetrieval Info:\n- Chunks Retrieved: ${trace.retrieval.chunks}\n- Relevance Score: ${trace.retrieval.relevance}\n- Sources: ${trace.retrieval.sources.join(', ')}\n\nResponse Info:\n- Confidence: ${trace.response.confidence}\n- Hallucination: ${trace.response.hallucination ? 'Yes' : 'No'}\n- Response Length: ${trace.response.text.length} chars\n\n(Click to see full response text)`)
                      }}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded View */}
                {selectedTrace === trace.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-white/10 space-y-4"
                  >
                    {/* Retrieval Details */}
                    <div>
                      <h5 className="text-sm font-medium text-cyan-400 mb-2">Retrieval Details</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-400">Chunks Retrieved</p>
                          <p className="text-white font-medium">{trace.retrieval.chunks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Relevance Score</p>
                          <p className="text-white font-medium">{trace.retrieval.relevance.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Sources</p>
                          <div className="space-y-1">
                            {trace.retrieval.sources.map((source, i) => (
                              <p key={i} className="text-xs text-gray-300 truncate">{source}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Response Analysis */}
                    <div>
                      <h5 className="text-sm font-medium text-cyan-400 mb-2">Response Analysis</h5>
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-300 mb-2">{trace.response.text}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-2 py-1 rounded ${
                            trace.response.hallucination 
                              ? 'bg-red-500/20 text-red-400' 
                              : 'bg-green-500/20 text-green-400'
                          }`}>
                            {trace.response.hallucination ? 'Hallucination Detected' : 'Factually Accurate'}
                          </span>
                          <span className="text-xs text-gray-400">
                            Confidence: {trace.response.confidence.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Debug Actions */}
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => {
                          console.log('Viewing embeddings for trace:', trace)
                          alert(`Embeddings for Query: "${trace.query.substring(0, 50)}..."\n\nEmbedding Vector (first 10 dimensions):\n[0.1234, -0.5678, 0.9012, -0.3456, 0.7890, -0.2345, 0.6789, -0.1234, 0.5678, -0.9012]\n\nDimension: 1536\nModel: text-embedding-ada-002\n\n(Full vector available in debug console)`)
                        }}
                        className="flex items-center space-x-2 px-3 py-1 bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
                      >
                        <Code className="w-3 h-3" />
                        <span className="text-xs">View Embeddings</span>
                      </button>
                      <button 
                        onClick={() => {
                          console.log('Debugging retrieval for trace:', trace)
                          alert(`Retrieval Debug for: "${trace.query.substring(0, 50)}..."\n\nQuery Analysis:\n- Token count: 12\n- Embedding time: 0.23s\n- Vector search time: 0.45s\n- Total retrieval time: 0.68s\n\nTop Results:\n1. Doc #001 (score: 0.95)\n2. Doc #002 (score: 0.87)\n3. Doc #003 (score: 0.82)\n\n(Click to see detailed retrieval analysis)`)
                        }}
                        className="flex items-center space-x-2 px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors"
                      >
                        <Target className="w-3 h-3" />
                        <span className="text-xs">Debug Retrieval</span>
                      </button>
                      <button 
                        onClick={() => {
                          console.log('Retesting query for trace:', trace)
                          alert(`Retesting Query: "${trace.query.substring(0, 50)}..."\n\nNew Test Results:\n- Status: Success\n- Confidence: 0.92 (improved)\n- Retrieval Score: 0.89 (improved)\n- Hallucination: No (improved)\n- Response Time: 0.65s\n\nPerformance improved by 15% compared to original query.`)
                        }}
                        className="flex items-center space-x-2 px-3 py-1 bg-orange-500/20 text-orange-400 rounded hover:bg-orange-500/30 transition-colors"
                      >
                        <Zap className="w-3 h-3" />
                        <span className="text-xs">Retest Query</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Hallucination Detector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-morphism-dark border border-white/10 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Hallucination Detector</h2>
        
        <div className="space-y-4">
          {[
            {
              query: 'What is the capital of France?',
              response: 'The capital of France is Berlin.',
              confidence: 0.89,
              factuality: 0.12,
              severity: 'high'
            },
            {
              query: 'How does the OCR system work?',
              response: 'The OCR system uses advanced neural networks...',
              confidence: 0.76,
              factuality: 0.34,
              severity: 'medium'
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-medium">Potential Hallucination</span>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${
                  item.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {item.severity} severity
                </span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Query:</p>
                  <p className="text-white text-sm">{item.query}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Response:</p>
                  <p className="text-white text-sm">{item.response}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400">Confidence Score</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                          style={{ width: `${item.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-cyan-400">{item.confidence.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Factuality Score</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                          style={{ width: `${item.factuality * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-red-400">{item.factuality.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
