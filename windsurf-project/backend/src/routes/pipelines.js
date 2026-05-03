const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Joi = require('joi');
const router = express.Router();

const DatabaseService = require('../services/database');
const QueueService = require('../services/queue');
const AIService = require('../services/ai');
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

const db = new DatabaseService();
const queue = new QueueService();
const ai = new AIService();

// Validation schemas
const createPipelineSchema = Joi.object({
  name: Joi.string().required().min(1).max(255),
  description: Joi.string().optional().max(1000),
  type: Joi.string().required().valid('data_cleaning', 'ocr_extraction', 'image_analysis', 'sentiment_analysis', 'rag_processing', 'custom'),
  dataset_id: Joi.string().uuid().required(),
  config: Joi.object().optional(),
  steps: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    type: Joi.string().required(),
    config: Joi.object().optional()
  })).optional()
});

// GET /api/pipelines - Get all pipelines for a user
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      dataset_id,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.user.id;
    
    // Build where clause
    let where = { user_id: userId };
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    if (dataset_id) {
      where.dataset_id = dataset_id;
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      orderBy: sortBy,
      order: sortOrder
    };

    const result = await db.paginate('pipelines', where, options);
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
    
  } catch (error) {
    logger.error('Error fetching pipelines:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pipelines',
      error: error.message
    });
  }
});

// GET /api/pipelines/:id - Get a specific pipeline
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const pipeline = await db.findOne('pipelines', { id, user_id: userId });
    
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }
    
    res.json({
      success: true,
      data: pipeline
    });
    
  } catch (error) {
    logger.error('Error fetching pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pipeline',
      error: error.message
    });
  }
});

// POST /api/pipelines - Create a new pipeline
router.post('/', authenticate, async (req, res) => {
  try {
    const { error, value } = createPipelineSchema.validate(req.body);
    
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
    
    // Verify dataset exists and belongs to user
    const dataset = await db.findOne('datasets', { 
      id: value.dataset_id, 
      user_id: req.user.id 
    });
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Dataset not found'
      });
    }
    
    // Generate default steps if not provided
    const defaultSteps = ai.getDefaultSteps(value.type);
    
    const pipelineData = {
      ...value,
      id: uuidv4(),
      user_id: req.user.id,
      status: 'pending',
      steps: value.steps || defaultSteps,
      current_step: 0,
      total_steps: (value.steps || defaultSteps).length,
      progress: 0,
      input_data: { dataset_id: value.dataset_id },
      config: value.config || {}
    };
    
    const pipeline = await db.create('pipelines', pipelineData);
    
    logger.info(`Pipeline created: ${pipeline.id} by user ${req.user.id}`);
    
    res.status(201).json({
      success: true,
      data: pipeline,
      message: 'Pipeline created successfully'
    });
    
  } catch (error) {
    logger.error('Error creating pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pipeline',
      error: error.message
    });
  }
});

// POST /api/pipelines/:id/start - Start a pipeline
router.post('/:id/start', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const pipeline = await db.findOne('pipelines', { id, user_id: userId });
    
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }
    
    if (pipeline.status !== 'pending' && pipeline.status !== 'failed') {
      return res.status(400).json({
        success: false,
        message: 'Pipeline cannot be started in current status'
      });
    }
    
    // Update pipeline status
    await db.update('pipelines', { id, user_id: userId }, {
      status: 'running',
      started_at: new Date(),
      progress: 0,
      current_step: 0
    });
    
    // Add pipeline to queue
    await queue.add('process-pipeline', {
      pipelineId: id,
      userId,
      steps: pipeline.steps
    });
    
    logger.info(`Pipeline started: ${id} by user ${userId}`);
    
    res.json({
      success: true,
      message: 'Pipeline started successfully'
    });
    
  } catch (error) {
    logger.error('Error starting pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start pipeline',
      error: error.message
    });
  }
});

// POST /api/pipelines/:id/pause - Pause a pipeline
router.post('/:id/pause', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const pipeline = await db.findOne('pipelines', { id, user_id: userId });
    
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }
    
    if (pipeline.status !== 'running') {
      return res.status(400).json({
        success: false,
        message: 'Pipeline is not running'
      });
    }
    
    // Pause pipeline job
    await queue.pauseJob(`process-pipeline-${id}`);
    
    // Update pipeline status
    await db.update('pipelines', { id, user_id: userId }, {
      status: 'paused'
    });
    
    logger.info(`Pipeline paused: ${id} by user ${userId}`);
    
    res.json({
      success: true,
      message: 'Pipeline paused successfully'
    });
    
  } catch (error) {
    logger.error('Error pausing pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pause pipeline',
      error: error.message
    });
  }
});

// POST /api/pipelines/:id/resume - Resume a pipeline
router.post('/:id/resume', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const pipeline = await db.findOne('pipelines', { id, user_id: userId });
    
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }
    
    if (pipeline.status !== 'paused') {
      return res.status(400).json({
        success: false,
        message: 'Pipeline is not paused'
      });
    }
    
    // Resume pipeline job
    await queue.resumeJob(`process-pipeline-${id}`);
    
    // Update pipeline status
    await db.update('pipelines', { id, user_id: userId }, {
      status: 'running'
    });
    
    logger.info(`Pipeline resumed: ${id} by user ${userId}`);
    
    res.json({
      success: true,
      message: 'Pipeline resumed successfully'
    });
    
  } catch (error) {
    logger.error('Error resuming pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resume pipeline',
      error: error.message
    });
  }
});

// POST /api/pipelines/:id/cancel - Cancel a pipeline
router.post('/:id/cancel', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const pipeline = await db.findOne('pipelines', { id, user_id: userId });
    
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }
    
    if (pipeline.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed pipeline'
      });
    }
    
    // Cancel pipeline job
    await queue.cancelJob(`process-pipeline-${id}`);
    
    // Update pipeline status
    await db.update('pipelines', { id, user_id: userId }, {
      status: 'cancelled',
      completed_at: new Date()
    });
    
    logger.info(`Pipeline cancelled: ${id} by user ${userId}`);
    
    res.json({
      success: true,
      message: 'Pipeline cancelled successfully'
    });
    
  } catch (error) {
    logger.error('Error cancelling pipeline:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel pipeline',
      error: error.message
    });
  }
});

// GET /api/pipelines/:id/progress - Get pipeline progress
router.get('/:id/progress', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const pipeline = await db.findOne('pipelines', { id, user_id: userId });
    
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }
    
    // Get job progress from queue
    const jobProgress = await queue.getJobProgress(`process-pipeline-${id}`);
    
    res.json({
      success: true,
      data: {
        id: pipeline.id,
        status: pipeline.status,
        progress: pipeline.progress,
        current_step: pipeline.current_step,
        total_steps: pipeline.total_steps,
        started_at: pipeline.started_at,
        completed_at: pipeline.completed_at,
        estimated_completion: pipeline.estimated_completion,
        current_step_name: pipeline.steps?.[pipeline.current_step]?.name || 'Unknown',
        job_progress: jobProgress,
        error_message: pipeline.error_message
      }
    });
    
  } catch (error) {
    logger.error('Error fetching pipeline progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pipeline progress',
      error: error.message
    });
  }
});

// GET /api/pipelines/types - Get available pipeline types
router.get('/types', authenticate, async (req, res) => {
  try {
    const pipelineTypes = ai.getPipelineTypes();
    
    res.json({
      success: true,
      data: pipelineTypes
    });
    
  } catch (error) {
    logger.error('Error fetching pipeline types:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pipeline types',
      error: error.message
    });
  }
});

// GET /api/pipelines/:id/logs - Get pipeline logs
router.get('/:id/logs', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { level = 'info', limit = 100 } = req.query;
    
    const pipeline = await db.findOne('pipelines', { id, user_id: userId });
    
    if (!pipeline) {
      return res.status(404).json({
        success: false,
        message: 'Pipeline not found'
      });
    }
    
    // TODO: Implement actual log retrieval from logging system
    // For now, return mock logs
    const logs = [
      {
        timestamp: new Date(),
        level: 'info',
        message: 'Pipeline started',
        step: 0
      },
      {
        timestamp: new Date(),
        level: 'info',
        message: 'Processing step 1: Data validation',
        step: 1
      }
    ];
    
    res.json({
      success: true,
      data: logs
    });
    
  } catch (error) {
    logger.error('Error fetching pipeline logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pipeline logs',
      error: error.message
    });
  }
});

module.exports = router;
