'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AIDebugConsole } from '@/components/debug/AIDebugConsole'

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">AI Debug Console</h1>
          <p className="text-gray-300">Debug and analyze AI model performance and retrieval</p>
        </motion.div>
        
        <AIDebugConsole />
      </div>
    </div>
  )
}
