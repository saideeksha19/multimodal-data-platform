'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Database, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Edit,
  Trash2,
  Plus,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Calendar,
  FileText,
  Image,
  Video,
  Code,
  Tag,
  MoreVertical,
  ChevronRight,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
  X
} from 'lucide-react'

interface Dataset {
  id: string
  name: string
  type: 'pdf' | 'image' | 'video' | 'code' | 'text' | 'mixed'
  size: string
  records: number
  status: 'processing' | 'completed' | 'error'
  tags: string[]
  lastModified: string
  starred: boolean
  description: string
}

export function DatasetExplorer() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const datasets: Dataset[] = [
    {
      id: '1',
      name: 'Customer Analytics Q4 2023',
      type: 'mixed',
      size: '2.4 GB',
      records: 12543,
      status: 'completed',
      tags: ['analytics', 'customer', 'q4-2023'],
      lastModified: '2024-01-15',
      starred: true,
      description: 'Comprehensive customer analytics dataset with purchasing patterns and demographics'
    },
    {
      id: '2',
      name: 'Training Images v2',
      type: 'image',
      size: '856 MB',
      records: 15678,
      status: 'processing',
      tags: ['training', 'images', 'ml'],
      lastModified: '2024-01-14',
      starred: false,
      description: 'High-quality training images for computer vision models'
    },
    {
      id: '3',
      name: 'Technical Documentation',
      type: 'pdf',
      size: '124 MB',
      records: 892,
      status: 'completed',
      tags: ['documentation', 'technical'],
      lastModified: '2024-01-13',
      starred: true,
      description: 'Technical specifications and API documentation'
    },
    {
      id: '4',
      name: 'Video Transcripts',
      type: 'video',
      size: '1.2 GB',
      records: 234,
      status: 'error',
      tags: ['video', 'transcripts'],
      lastModified: '2024-01-12',
      starred: false,
      description: 'Video recordings with automated transcripts'
    },
    {
      id: '5',
      name: 'Source Code Repository',
      type: 'code',
      size: '456 MB',
      records: 1234,
      status: 'completed',
      tags: ['code', 'repository'],
      lastModified: '2024-01-11',
      starred: false,
      description: 'Complete source code repository with commit history'
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText
      case 'image': return Image
      case 'video': return Video
      case 'code': return Code
      default: return Database
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'from-blue-500 to-cyan-500'
      case 'image': return 'from-green-500 to-emerald-500'
      case 'video': return 'from-purple-500 to-pink-500'
      case 'code': return 'from-orange-500 to-red-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'processing': return 'text-yellow-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'error': return AlertTriangle
      default: return Clock
    }
  }

  const filteredDatasets = datasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dataset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const sortedDatasets = [...filteredDatasets].sort((a, b) => {
    const aValue = a[sortBy as keyof Dataset]
    const bValue = b[sortBy as keyof Dataset]
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <h2 className="text-2xl font-bold gradient-text">Dataset Explorer</h2>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Dataset</span>
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-morphism-dark border border-white/10 rounded-xl p-4"
      >
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search datasets, tags, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all duration-200 text-white placeholder-gray-400"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-sm"
            >
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="records">Records</option>
              <option value="lastModified">Modified</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Dataset Grid/List View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }
      >
        {sortedDatasets.map((dataset, index) => {
          const TypeIcon = getTypeIcon(dataset.type)
          const StatusIcon = getStatusIcon(dataset.status)
          
          return (
            <motion.div
              key={dataset.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`glass-morphism-dark border border-white/10 rounded-xl p-6 hover-glow cursor-pointer ${
                selectedDataset === dataset.id ? 'border-cyan-500/50 bg-cyan-500/10' : ''
              }`}
              onClick={() => setSelectedDataset(dataset.id)}
            >
              {viewMode === 'grid' ? (
                /* Grid View */
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getTypeColor(dataset.type)} rounded-lg flex items-center justify-center`}>
                      <TypeIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          // Toggle star functionality
                        }}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                      >
                        <Star className={`w-4 h-4 ${dataset.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                      </button>
                      <button className="p-1 hover:bg-white/10 rounded transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{dataset.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">{dataset.description}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {dataset.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`w-4 h-4 ${getStatusColor(dataset.status)}`} />
                      <span className={getStatusColor(dataset.status)}>{dataset.status}</span>
                    </div>
                    <span className="text-gray-400">{dataset.size}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{dataset.records.toLocaleString()} records</span>
                    <span>{dataset.lastModified}</span>
                  </div>
                </div>
              ) : (
                /* List View */
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 bg-gradient-to-br ${getTypeColor(dataset.type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <TypeIcon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-white truncate">{dataset.name}</h3>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <Star className={`w-4 h-4 ${dataset.starred ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                        </button>
                        <button className="p-1 hover:bg-white/10 rounded transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-2 truncate">{dataset.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`w-4 h-4 ${getStatusColor(dataset.status)}`} />
                          <span className={`text-sm ${getStatusColor(dataset.status)}`}>{dataset.status}</span>
                        </div>
                        <span className="text-sm text-gray-400">{dataset.size}</span>
                        <span className="text-sm text-gray-400">{dataset.records.toLocaleString()} records</span>
                      </div>
                      <span className="text-xs text-gray-400">{dataset.lastModified}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {dataset.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )
        })}
      </motion.div>

      {/* Dataset Details Panel */}
      {selectedDataset && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-morphism-dark border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Dataset Details</h3>
            <button
              onClick={() => setSelectedDataset(null)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {(() => {
            const dataset = datasets.find(d => d.id === selectedDataset)
            if (!dataset) return null
            
            const TypeIcon = getTypeIcon(dataset.type)
            
            return (
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getTypeColor(dataset.type)} rounded-lg flex items-center justify-center`}>
                    <TypeIcon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-white mb-2">{dataset.name}</h4>
                    <p className="text-gray-400 mb-4">{dataset.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {dataset.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Size</p>
                    <p className="text-lg font-semibold text-white">{dataset.size}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Records</p>
                    <p className="text-lg font-semibold text-white">{dataset.records.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Status</p>
                    <p className={`text-lg font-semibold ${getStatusColor(dataset.status)}`}>{dataset.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Last Modified</p>
                    <p className="text-lg font-semibold text-white">{dataset.lastModified}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => {
                      console.log('Viewing dataset data:', dataset)
                      // Generate mock data for the dataset
                      const mockData = Array.from({ length: 10 }, (_, i) => ({
                        id: i + 1,
                        name: `Record ${i + 1}`,
                        value: Math.random() * 100,
                        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
                        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
                      }))
                      alert(`Dataset: ${dataset.name}\n\nSample Data:\n${JSON.stringify(mockData, null, 2)}`)
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Data</span>
                  </button>
                  <button 
                    onClick={() => {
                      console.log('Exporting dataset:', dataset)
                      // Create mock data for export
                      const exportData = {
                        dataset: dataset.name,
                        type: dataset.type,
                        records: dataset.records,
                        exported_at: new Date().toISOString(),
                        data: Array.from({ length: 5 }, (_, i) => ({
                          id: i + 1,
                          field1: `Sample data ${i + 1}`,
                          field2: Math.random() * 100,
                          field3: ['Category A', 'Category B'][Math.floor(Math.random() * 2)]
                        }))
                      }
                      
                      // Create download link
                      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `${dataset.name.replace(/\s+/g, '_')}_export.json`
                      document.body.appendChild(a)
                      a.click()
                      document.body.removeChild(a)
                      URL.revokeObjectURL(url)
                      
                      alert(`Dataset "${dataset.name}" exported successfully!`)
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button 
                    onClick={() => {
                      console.log('Editing dataset:', dataset)
                      alert(`Edit Dataset: ${dataset.name}\n\nThis would open an edit form where you can:\n- Update dataset name\n- Change description\n- Modify tags\n- Update metadata\n\n(Feature coming soon!)`)
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg hover:bg-orange-500/30 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => {
                      console.log('Deleting dataset:', dataset)
                      if (confirm(`Are you sure you want to delete "${dataset.name}"? This action cannot be undone.`)) {
                        alert(`Dataset "${dataset.name}" has been deleted successfully!`)
                        setSelectedDataset(null)
                      }
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )
          })()}
        </motion.div>
      )}
    </div>
  )
}
