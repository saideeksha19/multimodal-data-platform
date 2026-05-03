import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, type = 'retrieval' } = body

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800))

    let debugData: any

    if (type === 'retrieval') {
      // Mock retrieval debug data
      debugData = {
        query: query || 'test query',
        retrieval_results: [
          {
            document_id: 'doc_001',
            content: 'This is a sample document about machine learning models and their applications in modern AI systems.',
            score: 0.95,
            metadata: {
              source: 'knowledge_base',
              created_at: '2024-01-15T10:00:00Z',
              tags: ['ml', 'ai', 'models']
            }
          },
          {
            document_id: 'doc_002',
            content: 'Deep learning architectures have revolutionized computer vision and natural language processing tasks.',
            score: 0.87,
            metadata: {
              source: 'research_papers',
              created_at: '2024-01-14T15:30:00Z',
              tags: ['deep-learning', 'cv', 'nlp']
            }
          },
          {
            document_id: 'doc_003',
            content: 'Transformer models have become the foundation for most modern language understanding systems.',
            score: 0.82,
            metadata: {
              source: 'technical_docs',
              created_at: '2024-01-13T09:15:00Z',
              tags: ['transformers', 'language-models']
            }
          }
        ],
        processing_time: '0.8s',
        total_results: 3,
        debug_info: {
          embedding_model: 'text-embedding-ada-002',
          vector_db: 'pinecone',
          similarity_threshold: 0.8,
          max_results: 10
        }
      }
    } else if (type === 'embedding') {
      // Mock embedding debug data
      debugData = {
        text: query || 'sample text',
        embedding: Array.from({ length: 1536 }, () => Math.random().toFixed(6)),
        dimensions: 1536,
        model: 'text-embedding-ada-002',
        processing_time: '0.3s',
        metadata: {
          token_count: 8,
          encoding: 'cl100k_base',
          language: 'en'
        }
      }
    } else {
      // General debug data
      debugData = {
        query: query || 'test query',
        type: type,
        timestamp: new Date().toISOString(),
        system_status: 'healthy',
        debug_info: {
          api_version: 'v1.0.0',
          node_version: '18.17.0',
          memory_usage: '45%',
          cpu_usage: '12%'
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: debugData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ error: 'Debug request failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Debug endpoint ready',
    types: ['retrieval', 'embedding', 'general'],
    usage: 'POST with query and type parameters'
  })
}
