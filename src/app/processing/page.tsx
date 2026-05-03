'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ProcessingWorkspace } from '@/components/processing/ProcessingWorkspace'

export default function ProcessingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">Processing Pipeline</h1>
          <p className="text-gray-300">Monitor and manage data processing workflows</p>
        </motion.div>
        
        <ProcessingWorkspace />
      </div>
    </div>
  )
}
