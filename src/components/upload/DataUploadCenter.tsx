'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  Code, 
  X, 
  CheckCircle,
  AlertCircle,
  Clock,
  File,
  Trash2,
  Eye
} from 'lucide-react'

interface UploadedFile {
  id: string
  name: string
  type: string
  size: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  savedPath?: string
  originalName?: string
}

export function DataUploadCenter() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const fileTypes = [
    { type: 'pdf', label: 'PDF Documents', icon: FileText, color: 'from-blue-500 to-cyan-500' },
    { type: 'image', label: 'Images', icon: Image, color: 'from-green-500 to-emerald-500' },
    { type: 'video', label: 'Videos', icon: Video, color: 'from-purple-500 to-pink-500' },
    { type: 'code', label: 'Code Files', icon: Code, color: 'from-orange-500 to-red-500' }
  ]

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      // Log file details to console
      files.forEach(file => {
        console.log('File dropped:', {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        })
      })

      // Upload files to API
      for (const file of files) {
        await uploadFile(file)
      }
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Log file details to console
    files.forEach(file => {
      console.log('File selected:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      })
    })

    // Upload files to API
    for (const file of files) {
      await uploadFile(file)
    }
  }

  const uploadFile = async (file: File) => {
    const fileType = getFileType(file)
    const fileSize = formatFileSize(file.size)
    
    const newFile: UploadedFile = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: fileType,
      size: fileSize,
      status: 'uploading',
      progress: 0
    }
    
    setUploadedFiles(prev => [...prev, newFile])
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === newFile.id 
            ? { ...f, progress: Math.min(f.progress + Math.random() * 20, 95) }
            : f
        )
      )
    }, 300)
    
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('file', file)
      
      // Upload to API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      // Clear progress interval
      clearInterval(progressInterval)
      
      if (response.ok) {
        const result = await response.json()
        console.log('Upload successful:', result)
        alert(`File "${file.name}" uploaded and saved to Documents/Uploads!`)
        
        // Update file status to completed with saved path
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === newFile.id 
              ? { 
                  ...f, 
                  status: 'completed' as const, 
                  progress: 100,
                  savedPath: result.file.savedPath,
                  originalName: result.file.originalName
                }
              : f
          )
        )
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      clearInterval(progressInterval)
      alert(`Error uploading file "${file.name}". Please try again.`)
      
      // Update file status to error
      setUploadedFiles(prev => 
        prev.map(f => 
          f.id === newFile.id 
            ? { ...f, status: 'error' as const }
            : f
        )
      )
    }
  }

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      const fileType = getFileType(file)
      const fileSize = formatFileSize(file.size)
      
      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: fileType,
        size: fileSize,
        status: 'uploading',
        progress: 0
      }
      
      setUploadedFiles(prev => [...prev, newFile])
      
      // Simulate upload progress
      simulateUploadProgress(newFile.id)
    })
  }

  const getFileType = (file: File): 'pdf' | 'image' | 'video' | 'code' | 'text' => {
    const type = file.type.toLowerCase()
    if (type === 'application/pdf') return 'pdf'
    if (type.startsWith('image/')) return 'image'
    if (type.startsWith('video/')) return 'video'
    if (type.includes('javascript') || type.includes('json') || type.includes('xml') || type.includes('html') || type.includes('css')) return 'code'
    return 'text'
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const simulateUploadProgress = (fileId: string) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setUploadedFiles(prev => 
          prev.map(file => 
            file.id === fileId 
              ? { ...file, status: 'processing' as const, progress: 100 }
              : file
          )
        )
        
        // Simulate processing completion
        setTimeout(() => {
          setUploadedFiles(prev => 
            prev.map(file => 
              file.id === fileId 
                ? { ...file, status: 'completed' as const }
                : file
            )
          )
        }, 2000)
      } else {
        setUploadedFiles(prev => 
          prev.map(file => 
            file.id === fileId 
              ? { ...file, progress }
              : file
          )
        )
      }
    }, 500)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return FileText
      case 'image': return Image
      case 'video': return Video
      case 'code': return Code
      default: return File
    }
  }

  const removeFile = (id: string) => {
    setUploadedFiles(files => files.filter(file => file.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'text-blue-400'
      case 'processing': return 'text-yellow-400'
      case 'completed': return 'text-green-400'
      case 'error': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle
      case 'error': return AlertCircle
      default: return Clock
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism-dark border border-white/10 rounded-xl p-8"
      >
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
            isDragging 
              ? 'border-cyan-500 bg-cyan-500/10' 
              : 'border-gray-600 hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <motion.div
            animate={{ scale: isDragging ? 1.1 : 1 }}
            className="w-20 h-20 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Upload className="w-10 h-10 text-white" />
          </motion.div>
          
          <h3 className="text-xl font-semibold text-white mb-2">
            {isDragging ? 'Drop files here' : 'Drag & Drop Files'}
          </h3>
          <p className="text-gray-400 mb-6">
            or click to browse from your computer
          </p>
          
          <label htmlFor="file-input" className="cursor-pointer">
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.zip,.json,.csv,.txt,.js,.jsx,.ts,.tsx,.html,.css,.xml"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="px-6 py-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 inline-block">
              Select Files
            </div>
          </label>
          
          <div className="mt-8 text-sm text-gray-500">
            Supported formats: PDF, JPG, PNG, MP4, ZIP, JSON, CSV, TXT
          </div>
        </div>
      </motion.div>

      {/* File Type Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {fileTypes.map((fileType, index) => {
          const Icon = fileType.icon
          return (
            <motion.div
              key={fileType.type}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="glass-morphism-dark border border-white/10 rounded-lg p-4"
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${fileType.color} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-white font-medium mb-1">{fileType.label}</h4>
              <p className="text-gray-400 text-sm">1,234 files</p>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Uploaded Files */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-morphism-dark border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Uploaded Files</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">{uploadedFiles.length} files</span>
            <button 
              onClick={() => {
                console.log('Clearing all files')
                setUploadedFiles([])
                alert('All files cleared!')
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {uploadedFiles.map((file, index) => {
            const FileIcon = getFileIcon(file.type)
            const StatusIcon = getStatusIcon(file.status)
            
            return (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg"
              >
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                  <FileIcon className="w-6 h-6 text-cyan-400" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium">{file.name}</h4>
                      <p className="text-sm text-gray-400">{file.size}</p>
                      {file.savedPath && (
                        <p className="text-xs text-green-400 mt-1">
                          ✓ Saved to: {file.savedPath}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <StatusIcon className={`w-4 h-4 ${getStatusColor(file.status)}`} />
                      <span className={`text-sm ${getStatusColor(file.status)}`}>
                        {file.status}
                      </span>
                    </div>
                  </div>
                  
                  {file.status === 'uploading' || file.status === 'processing' ? (
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${file.progress}%` }}
                        transition={{ duration: 1 }}
                        className="h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                      />
                    </div>
                  ) : null}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      console.log('Viewing file details:', file)
                      alert(`File Details:\n\nName: ${file.name}\nType: ${file.type}\nSize: ${file.size}\nStatus: ${file.status}\nProgress: ${file.progress}%`)
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => removeFile(file.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Processing Queue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-morphism-dark border border-white/10 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Processing Queue</h2>
        
        <div className="space-y-4">
          {[
            { name: 'OCR Processing', files: 23, time: '~5 min' },
            { name: 'Image Analysis', files: 156, time: '~15 min' },
            { name: 'Text Extraction', files: 89, time: '~8 min' },
            { name: 'Metadata Tagging', files: 234, time: '~12 min' }
          ].map((queue, index) => (
            <motion.div
              key={queue.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                <div>
                  <h4 className="text-white font-medium">{queue.name}</h4>
                  <p className="text-sm text-gray-400">{queue.files} files</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-cyan-400">{queue.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
