const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const router = express.Router();

const DatabaseService = require('../services/database');
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

const db = new DatabaseService();

// Validation schemas
const createDatasetSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().optional().max(1000),
  type: Joi.string().required().valid('pdf', 'image', 'video', 'audio', 'text', 'code', 'mixed'),
  tags: Joi.array().items(Joi.string()).optional(),
  metadata: Joi.object().optional()
});

const updateDatasetSchema = Joi.object({
  name: Joi.string().optional().min(1).max(255),
  description: Joi.string().optional().max(1000),
  tags: Joi.array().items(Joi.string()).optional(),
  starred: Joi.boolean().optional(),
  metadata: Joi.object().optional()
});

// GET /api/datasets - Get all datasets for a user
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      type,
      status,
      starred,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.user.id;
    
    // Build where clause
    let where = { user_id: userId };
    
    if (type) {
      where.type = type;
    }
    
    if (status) {
      where.status = status;
    }
    
    if (starred === 'true') {
      where.starred = true;
    }
    
    if (search) {
      // Add search condition
      where = db.db.raw(`user_id = ? AND (name ILIKE ? OR description ILIKE ?)`, 
        [userId, `%${search}%`, `%${search}%`]);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      orderBy: sortBy,
      order: sortOrder
    };

    const result = await db.paginate('datasets', where, options);
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
    
  } catch (error) {
    logger.error('Error fetching datasets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch datasets',
      error: error.message
    });
  }
});

// GET /api/datasets/:id - Get a specific dataset
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const dataset = await db.findOne('datasets', { id, user_id: userId });
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }
    
    res.json({
      success: true,
      data: dataset
    });
    
  } catch (error) {
    logger.error('Error fetching dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dataset',
      error: error.message
    });
  }
});

// POST /api/datasets - Create a new dataset
router.post('/', authenticate, async (req, res) => {
  try {
    const { error, value } = createDatasetSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    const datasetData = {
      ...value,
      id: uuidv4(),
      user_id: req.user.id,
      status: 'uploading',
      record_count: 0,
      starred: false,
      tags: value.tags || [],
      metadata: value.metadata || {}
    };
    
    const dataset = await db.create('datasets', datasetData);
    
    logger.info(`Dataset created: ${dataset.id} by user ${req.user.id}`);
    
    res.status(201).json({
      success: true,
      data: dataset,
      message: 'Dataset created successfully'
    });
    
  } catch (error) {
    logger.error('Error creating dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create dataset',
      error: error.message
    });
  }
});

// PUT /api/datasets/:id - Update a dataset
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const { error, value } = updateDatasetSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    // Check if dataset exists and belongs to user
    const existingDataset = await db.findOne('datasets', { id, user_id: userId });
    
    if (!existingDataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }
    
    const updatedDataset = await db.update('datasets', { id, user_id: userId }, {
      ...value,
      last_modified: new Date()
    });
    
    logger.info(`Dataset updated: ${id} by user ${userId}`);
    
    res.json({
      success: true,
      data: updatedDataset,
      message: 'Dataset updated successfully'
    });
    
  } catch (error) {
    logger.error('Error updating dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update dataset',
      error: error.message
    });
  }
});

// DELETE /api/datasets/:id - Delete a dataset
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if dataset exists and belongs to user
    const existingDataset = await db.findOne('datasets', { id, user_id: userId });
    
    if (!existingDataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }
    
    // TODO: Delete associated files from storage
    // TODO: Delete associated pipelines and analytics
    
    await db.delete('datasets', { id, user_id: userId });
    
    logger.info(`Dataset deleted: ${id} by user ${userId}`);
    
    res.json({
      success: true,
      message: 'Dataset deleted successfully'
    });
    
  } catch (error) {
    logger.error('Error deleting dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete dataset',
      error: error.message
    });
  }
});

// GET /api/datasets/:id/preview - Get dataset preview/sample
router.get('/:id/preview', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { limit = 10 } = req.query;
    
    const dataset = await db.findOne('datasets', { id, user_id: userId });
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }
    
    // TODO: Implement actual preview logic based on dataset type
    // For now, return sample data structure
    const preview = {
      id: dataset.id,
      name: dataset.name,
      type: dataset.type,
      sample_data: [],
      schema: {},
      total_records: dataset.record_count,
      sample_size: Math.min(parseInt(limit), dataset.record_count)
    };
    
    res.json({
      success: true,
      data: preview
    });
    
  } catch (error) {
    logger.error('Error fetching dataset preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dataset preview',
      error: error.message
    });
  }
});

// POST /api/datasets/:id/export - Export dataset
router.post('/:id/export', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { format = 'json', options = {} } = req.body;
    
    const dataset = await db.findOne('datasets', { id, user_id: userId });
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }
    
    // TODO: Implement actual export logic
    // For now, return export job info
    const exportJob = {
      id: uuidv4(),
      dataset_id: id,
      format,
      status: 'pending',
      created_at: new Date(),
      estimated_completion: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    };
    
    logger.info(`Export job created: ${exportJob.id} for dataset ${id}`);
    
    res.status(202).json({
      success: true,
      data: exportJob,
      message: 'Export job created successfully'
    });
    
  } catch (error) {
    logger.error('Error creating export job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create export job',
      error: error.message
    });
  }
});

module.exports = router;
