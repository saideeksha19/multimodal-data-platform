const Queue = require('bull');
const logger = require('../utils/logger');

class QueueService {
  constructor() {
    this.queues = new Map();
    this.processors = new Map();
    this.redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB || 0
    };
  }

  async init() {
    try {
      // Create main queues
      this.createQueue('file-processing', {
        defaultJobOptions: {
          removeOnComplete: 50,
          removeOnFail: 20,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        }
      });

      this.createQueue('pipeline-processing', {
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 5000
          }
        }
      });

      this.createQueue('rag-processing', {
        defaultJobOptions: {
          removeOnComplete: 200,
          removeOnFail: 100,
          attempts: 1
        }
      });

      this.createQueue('analytics', {
        defaultJobOptions: {
          removeOnComplete: 500,
          removeOnFail: 200,
          attempts: 1
        }
      });

      // Setup processors
      this.setupProcessors();

      logger.info('Queue service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize queue service:', error);
      throw error;
    }
  }

  createQueue(name, options = {}) {
    const queue = new Queue(name, {
      redis: this.redisConfig,
      ...options
    });

    this.queues.set(name, queue);

    // Event listeners
    queue.on('completed', (job, result) => {
      logger.info(`Job completed: ${job.id} in queue ${name}`);
    });

    queue.on('failed', (job, err) => {
      logger.error(`Job failed: ${job.id} in queue ${name}`, err);
    });

    queue.on('stalled', (job) => {
      logger.warn(`Job stalled: ${job.id} in queue ${name}`);
    });

    return queue;
  }

  setupProcessors() {
    // File processing
    this.queues.get('file-processing').process('process-file', 5, async (job) => {
      return await this.processFile(job.data);
    });

    this.queues.get('file-processing').process('process-url', 2, async (job) => {
      return await this.processUrl(job.data);
    });

    // Pipeline processing
    this.queues.get('pipeline-processing').process('process-pipeline', 3, async (job) => {
      return await this.processPipeline(job.data);
    });

    // RAG processing
    this.queues.get('rag-processing').process('process-rag-query', 10, async (job) => {
      return await this.processRAGQuery(job.data);
    });

    // Analytics
    this.queues.get('analytics').process('update-metrics', 5, async (job) => {
      return await this.updateMetrics(job.data);
    });
  }

  async add(queueName, jobName, data, options = {}) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return await queue.add(jobName, data, options);
  }

  async getJob(jobId, queueName) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    return await queue.getJob(jobId);
  }

  async getJobProgress(jobId) {
    // Try to find job in any queue
    for (const [queueName, queue] of this.queues.entries()) {
      const job = await queue.getJob(jobId);
      if (job) {
        return {
          progress: job.progress(),
          data: job.data,
          status: await job.getState(),
          processedOn: job.processedOn,
          finishedOn: job.finishedOn
        };
      }
    }
    return null;
  }

  async pauseJob(jobId) {
    // Try to find and pause job in any queue
    for (const [queueName, queue] of this.queues.entries()) {
      const job = await queue.getJob(jobId);
      if (job) {
        await job.pause();
        return true;
      }
    }
    return false;
  }

  async resumeJob(jobId) {
    // Try to find and resume job in any queue
    for (const [queueName, queue] of this.queues.entries()) {
      const job = await queue.getJob(jobId);
      if (job) {
        await job.resume();
        return true;
      }
    }
    return false;
  }

  async cancelJob(jobId) {
    // Try to find and cancel job in any queue
    for (const [queueName, queue] of this.queues.entries()) {
      const job = await queue.getJob(jobId);
      if (job) {
        await job.remove();
        return true;
      }
    }
    return false;
  }

  async getQueueStats(queueName) {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue ${queueName} not found`);
    }

    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();
    const delayed = await queue.getDelayed();

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      total: waiting.length + active.length + completed.length + failed.length + delayed.length
    };
  }

  async getAllStats() {
    const stats = {};
    for (const [queueName] of this.queues.entries()) {
      stats[queueName] = await this.getQueueStats(queueName);
    }
    return stats;
  }

  async close() {
    const closePromises = [];
    for (const [queueName, queue] of this.queues.entries()) {
      closePromises.push(queue.close());
    }
    await Promise.all(closePromises);
    logger.info('All queues closed');
  }

  // Job processors
  async processFile(data) {
    const { datasetId, filePath, mimeType, userId } = data;
    logger.info(`Processing file: ${filePath} for dataset ${datasetId}`);

    try {
      // Update dataset status to processing
      const DatabaseService = require('./database');
      const db = new DatabaseService();
      await db.update('datasets', { id: datasetId }, { 
        status: 'processing',
        processed_at: new Date()
      });

      // Process based on file type
      let result = {};
      
      if (mimeType === 'application/pdf') {
        result = await this.processPDF(filePath);
      } else if (mimeType.startsWith('image/')) {
        result = await this.processImage(filePath);
      } else if (mimeType.startsWith('video/')) {
        result = await this.processVideo(filePath);
      } else if (mimeType.startsWith('audio/')) {
        result = await this.processAudio(filePath);
      } else if (mimeType.startsWith('text/') || mimeType.includes('json') || mimeType.includes('xml')) {
        result = await this.processText(filePath);
      } else if (mimeType.includes('code') || mimeType.includes('script')) {
        result = await this.processCode(filePath);
      }

      // Update dataset with results
      await db.update('datasets', { id: datasetId }, {
        status: 'completed',
        record_count: result.recordCount || 0,
        metadata: {
          ...result,
          processed_at: new Date().toISOString()
        }
      });

      // Send WebSocket notification
      const WebSocketService = require('./websocket');
      const ws = new WebSocketService(null); // Will need to pass io instance
      ws.sendDatasetProcessingCompleted(datasetId, result);

      return result;
    } catch (error) {
      logger.error(`Error processing file ${filePath}:`, error);
      
      // Update dataset status to failed
      const DatabaseService = require('./database');
      const db = new DatabaseService();
      await db.update('datasets', { id: datasetId }, {
        status: 'error',
        metadata: {
          error_message: error.message,
          processed_at: new Date().toISOString()
        }
      });

      throw error;
    }
  }

  async processPDF(filePath) {
    const pdf = require('pdf-parse');
    const fs = require('fs').promises;
    
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    
    return {
      text: data.text,
      pages: data.numpages,
      info: data.info,
      recordCount: 1,
      extractedAt: new Date().toISOString()
    };
  }

  async processImage(filePath) {
    const sharp = require('sharp');
    const fs = require('fs').promises;
    
    const metadata = await sharp(filePath).metadata();
    
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      recordCount: 1,
      extractedAt: new Date().toISOString()
    };
  }

  async processVideo(filePath) {
    // Placeholder for video processing
    return {
      duration: 0,
      format: 'mp4',
      resolution: '1920x1080',
      recordCount: 1,
      extractedAt: new Date().toISOString()
    };
  }

  async processAudio(filePath) {
    // Placeholder for audio processing
    return {
      duration: 0,
      format: 'mp3',
      sampleRate: 44100,
      recordCount: 1,
      extractedAt: new Date().toISOString()
    };
  }

  async processText(filePath) {
    const fs = require('fs').promises;
    const content = await fs.readFile(filePath, 'utf-8');
    
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).length;
    const characters = content.length;
    
    return {
      content: content.substring(0, 1000), // First 1000 chars
      lines,
      words,
      characters,
      recordCount: 1,
      extractedAt: new Date().toISOString()
    };
  }

  async processCode(filePath) {
    const fs = require('fs').promises;
    const content = await fs.readFile(filePath, 'utf-8');
    
    const lines = content.split('\n').length;
    const characters = content.length;
    
    // Simple code analysis
    const functions = (content.match(/function\s+\w+/g) || []).length;
    const classes = (content.match(/class\s+\w+/g) || []).length;
    
    return {
      content: content.substring(0, 1000), // First 1000 chars
      lines,
      characters,
      functions,
      classes,
      recordCount: 1,
      extractedAt: new Date().toISOString()
    };
  }

  async processUrl(data) {
    // Placeholder for URL processing
    const { datasetId, url, userId } = data;
    
    return {
      url,
      downloaded: false,
      recordCount: 0,
      extractedAt: new Date().toISOString()
    };
  }

  async processPipeline(data) {
    const { pipelineId, userId, steps } = data;
    logger.info(`Processing pipeline: ${pipelineId}`);

    try {
      const DatabaseService = require('./database');
      const db = new DatabaseService();
      
      const pipeline = await db.findOne('pipelines', { id: pipelineId, user_id: userId });
      if (!pipeline) {
        throw new Error('Pipeline not found');
      }

      // Update pipeline status
      await db.update('pipelines', { id: pipelineId }, {
        status: 'running',
        started_at: new Date()
      });

      // Process each step
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        // Update current step
        await db.update('pipelines', { id: pipelineId }, {
          current_step: i + 1,
          progress: ((i + 1) / steps.length) * 100
        });

        // Process step (placeholder)
        await this.processStep(step, pipelineId);

        // Send progress update
        const WebSocketService = require('./websocket');
        const ws = new WebSocketService(null);
        ws.sendPipelineProgress(pipelineId, i + 1, steps.length);
      }

      // Mark as completed
      await db.update('pipelines', { id: pipelineId }, {
        status: 'completed',
        completed_at: new Date(),
        progress: 100
      });

      return { status: 'completed', steps_processed: steps.length };
    } catch (error) {
      logger.error(`Error processing pipeline ${pipelineId}:`, error);
      
      const DatabaseService = require('./database');
      const db = new DatabaseService();
      await db.update('pipelines', { id: pipelineId }, {
        status: 'failed',
        error_message: error.message,
        completed_at: new Date()
      });

      throw error;
    }
  }

  async processStep(step, pipelineId) {
    // Placeholder for step processing
    logger.info(`Processing step: ${step.name} for pipeline ${pipelineId}`);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { step: step.name, processed: true };
  }

  async processRAGQuery(data) {
    // Placeholder for RAG processing
    const { query, userId, pipelineId } = data;
    
    return {
      query,
      response: 'Sample response',
      confidence: 0.85,
      hallucination: false,
      factuality: 0.9
    };
  }

  async updateMetrics(data) {
    // Placeholder for metrics update
    const { userId, metrics } = data;
    
    logger.info(`Updating metrics for user ${userId}`);
    
    return { updated: true, timestamp: new Date().toISOString() };
  }
}

module.exports = QueueService;
