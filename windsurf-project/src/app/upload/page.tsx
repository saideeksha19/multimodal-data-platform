'use client'

import { useState, useRef } from 'react'
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
import { DataUploadCenter } from '@/components/upload/DataUploadCenter'

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Data Upload</h1>
          <p className="text-gray-300">Upload and manage your multimodal datasets</p>
        </motion.div>
        
        <DataUploadCenter />
      </div>
    </div>
  )
}
