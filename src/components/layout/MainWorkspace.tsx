'use client'

import { motion } from 'framer-motion'

interface MainWorkspaceProps {
  children: React.ReactNode
}

export function MainWorkspace({ children }: MainWorkspaceProps) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1 p-6 overflow-auto"
    >
      <div className="max-w-full">
        {children}
      </div>
    </motion.main>
  )
}
