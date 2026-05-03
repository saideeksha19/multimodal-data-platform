import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Log file details
    console.log('File uploaded:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    })

    // Create uploads directory in Documents if it doesn't exist
    const documentsDir = join('C:', 'Users', 'ddsai', 'Documents', 'Uploads')
    if (!existsSync(documentsDir)) {
      await mkdir(documentsDir, { recursive: true })
    }

    // Generate unique filename to avoid conflicts
    const timestamp = Date.now()
    const uniqueFilename = `${timestamp}-${file.name}`
    const filePath = join(documentsDir, uniqueFilename)

    // Convert file to buffer and save to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)
    console.log(`File saved to: ${filePath}`)

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Return success response with file details
    return NextResponse.json({
      success: true,
      message: 'File uploaded and saved to Documents',
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        id: timestamp.toString(),
        savedPath: `C:\\Users\\ddsai\\Documents\\Uploads\\${uniqueFilename}`,
        originalName: file.name
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Upload endpoint ready',
    status: 'POST to upload files'
  })
}
