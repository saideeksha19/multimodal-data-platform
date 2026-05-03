'use client'

import { create } from 'zustand'

export interface UploadedFile {
  id: string
  name: string
  type: 'pdf' | 'image' | 'video' | 'code' | 'text' | 'audio'
  size: string
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  preview?: string
  processingSteps?: ProcessingStep[]
}

export interface ProcessingStep {
  id: string
  name: string
  status: 'pending' | 'running' | 'completed' | 'error'
  duration: string
  progress: number
  description: string
}

interface FileStore {
  files: UploadedFile[]
  addFile: (file: UploadedFile) => void
  updateFile: (id: string, updates: Partial<UploadedFile>) => void
  removeFile: (id: string) => void
  processFile: (id: string) => void
}

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  
  addFile: (file) => set((state) => ({
    files: [...state.files, file]
  })),
  
  updateFile: (id, updates) => set((state) => ({
    files: state.files.map(file => 
      file.id === id ? { ...file, ...updates } : file
    )
  })),
  
  removeFile: (id) => set((state) => ({
    files: state.files.filter(file => file.id !== id)
  })),
  
  processFile: (id) => {
    const { updateFile } = get()
    
    // Define processing steps based on file type
    const getProcessingSteps = (fileType: string): ProcessingStep[] => {
      switch (fileType) {
        case 'pdf':
          return [
            { id: '1', name: 'PDF Validation', status: 'pending', duration: '0s', progress: 0, description: 'Validating PDF structure' },
            { id: '2', name: 'Text Extraction', status: 'pending', duration: '0s', progress: 0, description: 'Extracting text content' },
            { id: '3', name: 'OCR Processing', status: 'pending', duration: '0s', progress: 0, description: 'Processing scanned pages' },
            { id: '4', name: 'Entity Recognition', status: 'pending', duration: '0s', progress: 0, description: 'Identifying named entities' },
            { id: '5', name: 'Data Structuring', status: 'pending', duration: '0s', progress: 0, description: 'Converting to structured format' }
          ]
        case 'image':
          return [
            { id: '1', name: 'Image Validation', status: 'pending', duration: '0s', progress: 0, description: 'Validating image format' },
            { id: '2', name: 'Object Detection', status: 'pending', duration: '0s', progress: 0, description: 'Detecting objects in image' },
            { id: '3', name: 'Text Recognition', status: 'pending', duration: '0s', progress: 0, description: 'Extracting text from image' },
            { id: '4', name: 'Feature Analysis', status: 'pending', duration: '0s', progress: 0, description: 'Analyzing image features' }
          ]
        case 'video':
          return [
            { id: '1', name: 'Video Validation', status: 'pending', duration: '0s', progress: 0, description: 'Validating video format' },
            { id: '2', name: 'Frame Extraction', status: 'pending', duration: '0s', progress: 0, description: 'Extracting video frames' },
            { id: '3', name: 'Audio Extraction', status: 'pending', duration: '0s', progress: 0, description: 'Extracting audio track' },
            { id: '4', name: 'Transcription', status: 'pending', duration: '0s', progress: 0, description: 'Generating transcripts' },
            { id: '5', name: 'Content Analysis', status: 'pending', duration: '0s', progress: 0, description: 'Analyzing video content' }
          ]
        case 'audio':
          return [
            { id: '1', name: 'Audio Validation', status: 'pending', duration: '0s', progress: 0, description: 'Validating audio format' },
            { id: '2', name: 'Speech Recognition', status: 'pending', duration: '0s', progress: 0, description: 'Converting speech to text' },
            { id: '3', name: 'Speaker Identification', status: 'pending', duration: '0s', progress: 0, description: 'Identifying speakers' },
            { id: '4', name: 'Sentiment Analysis', status: 'pending', duration: '0s', progress: 0, description: 'Analyzing sentiment' }
          ]
        default:
          return [
            { id: '1', name: 'File Validation', status: 'pending', duration: '0s', progress: 0, description: 'Validating file format' },
            { id: '2', name: 'Content Analysis', status: 'pending', duration: '0s', progress: 0, description: 'Analyzing content' }
          ]
      }
    }
    
    const file = get().files.find(f => f.id === id)
    if (!file) return
    
    const steps = getProcessingSteps(file.type)
    updateFile(id, { 
      status: 'processing', 
      processingSteps: steps 
    })
    
    // Simulate processing steps
    let currentStep = 0
    const processNextStep = () => {
      if (currentStep >= steps.length) {
        updateFile(id, { status: 'completed' })
        return
      }
      
      const step = steps[currentStep]
      updateFile(id, {
        processingSteps: steps.map((s, index) => 
          index === currentStep 
            ? { ...s, status: 'running' as const }
            : index < currentStep 
              ? { ...s, status: 'completed' as const }
              : s
        )
      })
      
      // Simulate step progress
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 40
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          
          updateFile(id, {
            processingSteps: steps.map((s, index) => 
              index === currentStep 
                ? { ...s, status: 'completed' as const, progress: 100, duration: `${(Math.random() * 5 + 1).toFixed(1)}s` }
                : s
            )
          })
          
          currentStep++
          setTimeout(processNextStep, 500)
        } else {
          updateFile(id, {
            processingSteps: steps.map((s, index) => 
              index === currentStep 
                ? { ...s, progress }
                : s
            )
          })
        }
      }, 200)
    }
    
    setTimeout(processNextStep, 1000)
  }
}))
