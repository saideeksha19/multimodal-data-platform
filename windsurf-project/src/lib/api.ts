// Mock API layer for the Multimodal Data Platform

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PipelineStatus {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed' | 'queued'
  progress: number
  startTime: string
  endTime?: string
}

export interface DatasetMetrics {
  totalDatasets: number
  totalSize: string
  processingSpeed: string
  errorRate: number
  accuracy: number
}

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock API functions
export const api = {
  // Dashboard APIs
  async getSystemMetrics(): Promise<ApiResponse<DatasetMetrics>> {
    await delay(500)
    return {
      data: {
        totalDatasets: 1234,
        totalSize: '2.4TB',
        processingSpeed: '1,234/min',
        errorRate: 0.2,
        accuracy: 94.7
      },
      success: true
    }
  },

  async getPipelineStatus(): Promise<ApiResponse<PipelineStatus[]>> {
    await delay(300)
    return {
      data: [
        {
          id: '1',
          name: 'Data Cleaning Pipeline',
          status: 'running',
          progress: 75,
          startTime: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          name: 'OCR Text Extraction',
          status: 'completed',
          progress: 100,
          startTime: '2024-01-15T09:00:00Z',
          endTime: '2024-01-15T10:15:00Z'
        },
        {
          id: '3',
          name: 'Image Analysis',
          status: 'queued',
          progress: 0,
          startTime: '2024-01-15T11:00:00Z'
        }
      ],
      success: true
    }
  },

  // Dataset APIs
  async getDatasets() {
    await delay(400)
    return {
      data: [
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
        }
      ],
      success: true
    }
  },

  // Upload APIs
  async uploadFile(file: File) {
    await delay(1000)
    return {
      data: {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        status: 'uploading',
        progress: 0
      },
      success: true,
      message: 'File upload started'
    }
  },

  // AI Debug APIs
  async getRAGTraces() {
    await delay(600)
    return {
      data: [
        {
          id: '1',
          query: 'What are the main challenges in multimodal data processing?',
          retrieval: {
            chunks: 8,
            relevance: 0.87,
            sources: ['research_paper.pdf', 'case_study.doc']
          },
          response: {
            text: 'The main challenges include data heterogeneity, alignment issues...',
            confidence: 0.92,
            hallucination: false
          },
          timestamp: '2024-01-15T10:30:00Z',
          status: 'success'
        }
      ],
      success: true
    }
  },

  // Analytics APIs
  async getAnalyticsData() {
    await delay(800)
    return {
      data: {
        volumeData: [
          { name: 'Mon', value: 2400, change: 12 },
          { name: 'Tue', value: 1398, change: -8 },
          { name: 'Wed', value: 9800, change: 45 }
        ],
        performanceData: [
          { name: 'OCR Processing', value: 89 },
          { name: 'Text Analysis', value: 76 },
          { name: 'Image Recognition', value: 92 }
        ],
        errorData: [
          { type: 'Retrieval Failure', count: 23, percentage: 45 },
          { type: 'Embedding Mismatch', count: 15, percentage: 29 }
        ]
      },
      success: true
    }
  }
}

// WebSocket simulation for real-time updates
export class WebSocketSimulator {
  private callbacks: Map<string, (data: any) => void> = new Map()
  private intervalId: NodeJS.Timeout | null = null

  connect() {
    // Simulate real-time updates
    this.intervalId = setInterval(() => {
      this.broadcast({
        type: 'pipeline_update',
        data: {
          id: Math.random().toString(36).substr(2, 9),
          progress: Math.floor(Math.random() * 100),
          status: ['running', 'completed', 'failed'][Math.floor(Math.random() * 3)]
        }
      })
    }, 3000)

    return this
  }

  disconnect() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  on(event: string, callback: (data: any) => void) {
    this.callbacks.set(event, callback)
  }

  off(event: string) {
    this.callbacks.delete(event)
  }

  private broadcast(message: any) {
    const callback = this.callbacks.get(message.type)
    if (callback) {
      callback(message.data)
    }
  }
}

export const ws = new WebSocketSimulator()
