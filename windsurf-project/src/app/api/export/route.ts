import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { format = 'json' } = body

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500))

    if (format === 'csv') {
      // Return CSV data
      const csvData = `timestamp,level,message,source
2024-01-15T10:30:00Z,INFO,Processing completed successfully,pipeline-1
2024-01-15T10:31:00Z,WARNING,High memory usage detected,system
2024-01-15T10:32:00Z,ERROR,Failed to process dataset,pipeline-2
2024-01-15T10:33:00Z,INFO,Model training started,ai-service
2024-01-15T10:34:00Z,INFO,Export completed successfully,export-service`

      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="logs.csv"'
        }
      })
    } else {
      // Return JSON data
      const jsonData = {
        logs: [
          { timestamp: '2024-01-15T10:30:00Z', level: 'INFO', message: 'Processing completed successfully', source: 'pipeline-1' },
          { timestamp: '2024-01-15T10:31:00Z', level: 'WARNING', message: 'High memory usage detected', source: 'system' },
          { timestamp: '2024-01-15T10:32:00Z', level: 'ERROR', message: 'Failed to process dataset', source: 'pipeline-2' },
          { timestamp: '2024-01-15T10:33:00Z', level: 'INFO', message: 'Model training started', source: 'ai-service' },
          { timestamp: '2024-01-15T10:34:00Z', level: 'INFO', message: 'Export completed successfully', source: 'export-service' }
        ],
        exported_at: new Date().toISOString(),
        total_records: 5
      }

      return new NextResponse(JSON.stringify(jsonData, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="logs.json"'
        }
      })
    }
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Export endpoint ready',
    formats: ['json', 'csv'],
    usage: 'POST with format parameter'
  })
}
