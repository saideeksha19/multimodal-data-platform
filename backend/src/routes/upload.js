const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const router = express.Router();

const DatabaseService = require('../services/database');
const QueueService = require('../services/queue');
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

const db = new DatabaseService();
const queue = new QueueService();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', req.user.id);
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/tiff',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'audio/mp3',
    'audio/wav',
    'audio/m4a',
    'text/plain',
    'text/csv',
    'application/json',
    'application/xml',
    'text/html',
    'text/css',
    'text/javascript',
    'application/javascript',
    'text/x-python',
    'application/x-python-code',
    'text/x-java-source',
    'text/x-c',
    'text/x-c++'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 10 // Max 10 files at once
  }
});

// POST /api/upload - Upload files
router.post('/', authenticate, upload.array('files', 10), async (req, res) => {
  try {
    const uploadedFiles = [];
    const userId = req.user.id;
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    
    // Process each uploaded file
    for (const file of req.files) {
      try {
        // Create dataset record
        const datasetData = {
          id: uuidv4(),
          user_id: userId,
          name: file.originalname,
          type: getFileType(file.mimetype),
          status: 'processing',
          file_size: file.size,
          file_path: file.path,
          metadata: {
            original_name: file.originalname,
            mime_type: file.mimetype,
            upload_date: new Date().toISOString()
          },
          tags: []
        };
        
        const dataset = await db.create('datasets', datasetData);
        
        // Generate thumbnail for images
        if (file.mimetype.startsWith('image/')) {
          const thumbnailPath = await generateThumbnail(file.path);
          if (thumbnailPath) {
            await db.update('datasets', { id: dataset.id }, { thumbnail_path: thumbnailPath });
          }
        }
        
        // Add processing job to queue
        await queue.add('process-file', {
          datasetId: dataset.id,
          filePath: file.path,
          mimeType: file.mimetype,
          userId
        });
        
        uploadedFiles.push({
          id: dataset.id,
          name: dataset.name,
          type: dataset.type,
          size: dataset.file_size,
          status: dataset.status,
          upload_time: dataset.created_at
        });
        
        logger.info(`File uploaded: ${file.originalname} -> dataset ${dataset.id}`);
        
      } catch (error) {
        logger.error(`Error processing uploaded file ${file.originalname}:`, error);
        
        // Clean up uploaded file on error
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          logger.error('Error cleaning up file:', cleanupError);
        }
      }
    }
    
    res.status(201).json({
      success: true,
      data: uploadedFiles,
      message: `${uploadedFiles.length} files uploaded successfully`
    });
    
  } catch (error) {
    logger.error('Error in file upload:', error);
    
    // Clean up uploaded files on error
    if (req.files) {
      for (const file of req.files) {
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          logger.error('Error cleaning up file:', cleanupError);
        }
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
});

// POST /api/upload/url - Upload from URL
router.post('/url', authenticate, async (req, res) => {
  try {
    const { url, name, type } = req.body;
    const userId = req.user.id;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }
    
    // TODO: Implement file download from URL
    // For now, create a placeholder dataset
    
    const datasetData = {
      id: uuidv4(),
      user_id: userId,
      name: name || url.split('/').pop(),
      type: type || 'mixed',
      status: 'processing',
      file_size: 0,
      metadata: {
        source_url: url,
        upload_date: new Date().toISOString()
      },
      tags: ['url-upload']
    };
    
    const dataset = await db.create('datasets', datasetData);
    
    // Add URL processing job to queue
    await queue.add('process-url', {
      datasetId: dataset.id,
      url,
      userId
    });
    
    res.status(201).json({
      success: true,
      data: dataset,
      message: 'URL upload initiated'
    });
    
  } catch (error) {
    logger.error('Error in URL upload:', error);
    res.status(500).json({
      success: false,
      message: 'URL upload failed',
      error: error.message
    });
  }
});

// GET /api/upload/progress/:id - Get upload progress
router.get('/progress/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const dataset = await db.findOne('datasets', { id, user_id: userId });
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }
    
    // Get job progress from queue
    const jobProgress = await queue.getJobProgress(`process-file-${id}`);
    
    res.json({
      success: true,
      data: {
        id: dataset.id,
        status: dataset.status,
        progress: jobProgress?.progress || 0,
        current_step: jobProgress?.currentStep || 'Processing...',
        error_message: dataset.metadata?.error_message
      }
    });
    
  } catch (error) {
    logger.error('Error fetching upload progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upload progress',
      error: error.message
    });
  }
});

// DELETE /api/upload/:id - Cancel upload
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const dataset = await db.findOne('datasets', { id, user_id: userId });
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }
    
    // Cancel processing job
    await queue.cancelJob(`process-file-${id}`);
    
    // Delete uploaded file
    if (dataset.file_path) {
      try {
        await fs.unlink(dataset.file_path);
      } catch (error) {
        logger.error('Error deleting uploaded file:', error);
      }
    }
    
    // Delete thumbnail
    if (dataset.thumbnail_path) {
      try {
        await fs.unlink(dataset.thumbnail_path);
      } catch (error) {
        logger.error('Error deleting thumbnail:', error);
      }
    }
    
    // Delete dataset record
    await db.delete('datasets', { id, user_id: userId });
    
    logger.info(`Upload cancelled: ${id} by user ${userId}`);
    
    res.json({
      success: true,
      message: 'Upload cancelled successfully'
    });
    
  } catch (error) {
    logger.error('Error cancelling upload:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel upload',
      error: error.message
    });
  }
});

// Helper functions
function getFileType(mimeType) {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('html')) return 'text';
  if (mimeType.includes('javascript') || mimeType.includes('python') || mimeType.includes('java') || mimeType.includes('c') || mimeType.includes('c++')) return 'code';
  return 'mixed';
}

async function generateThumbnail(filePath) {
  try {
    const thumbnailPath = filePath.replace(/\.[^/.]+$/, '_thumbnail.jpg');
    
    await sharp(filePath)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(thumbnailPath);
    
    return thumbnailPath;
  } catch (error) {
    logger.error('Error generating thumbnail:', error);
    return null;
  }
}

module.exports = router;
