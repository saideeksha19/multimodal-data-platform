const express = require('express');
const Joi = require('joi');
const router = express.Router();

const DatabaseService = require('../services/database');
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

const db = new DatabaseService();

// GET /api/analytics/overview - Get analytics overview
router.get('/overview', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '7d' } = req.query;
    
    // Calculate date range
    const dateRange = getDateRange(period);
    
    // Get dataset statistics
    const datasetStats = await db.query(`
      SELECT 
        COUNT(*) as total_datasets,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_datasets,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_datasets,
        COUNT(CASE WHEN status = 'error' THEN 1 END) as error_datasets,
        SUM(file_size) as total_size,
        SUM(record_count) as total_records
      FROM datasets 
      WHERE user_id = ? AND created_at BETWEEN ? AND ?
    `, [userId, dateRange.start, dateRange.end]);
    
    // Get pipeline statistics
    const pipelineStats = await db.query(`
      SELECT 
        COUNT(*) as total_pipelines,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_pipelines,
        COUNT(CASE WHEN status = 'running' THEN 1 END) as running_pipelines,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_pipelines,
        AVG(progress) as avg_progress
      FROM pipelines 
      WHERE user_id = ? AND created_at BETWEEN ? AND ?
    `, [userId, dateRange.start, dateRange.end]);
    
    // Get RAG trace statistics
    const ragStats = await db.query(`
      SELECT 
        COUNT(*) as total_queries,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_queries,
        COUNT(CASE WHEN hallucination THEN 1 END) as hallucinations,
        AVG(confidence) as avg_confidence,
        AVG(factuality) as avg_factuality,
        AVG(retrieval_time) as avg_retrieval_time,
        AVG(generation_time) as avg_generation_time
      FROM rag_traces 
      WHERE user_id = ? AND created_at BETWEEN ? AND ?
    `, [userId, dateRange.start, dateRange.end]);
    
    // Get error statistics
    const errorStats = await db.query(`
      SELECT 
        status as error_type,
        COUNT(*) as count,
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
      FROM rag_traces 
      WHERE user_id = ? AND created_at BETWEEN ? AND ? AND status != 'success'
      GROUP BY status
      ORDER BY count DESC
    `, [userId, dateRange.start, dateRange.end]);
    
    res.json({
      success: true,
      data: {
        period,
        datasets: datasetStats.rows[0] || {},
        pipelines: pipelineStats.rows[0] || {},
        rag: ragStats.rows[0] || {},
        errors: errorStats.rows
      }
    });
    
  } catch (error) {
    logger.error('Error fetching analytics overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics overview',
      error: error.message
    });
  }
});

// GET /api/analytics/data-volume - Get data volume trends
router.get('/data-volume', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '7d', granularity = 'day' } = req.query;
    
    const dateRange = getDateRange(period);
    const dateFormat = getDateFormat(granularity);
    
    const volumeData = await db.query(`
      SELECT 
        DATE_TRUNC('${dateFormat}', created_at) as date,
        COUNT(*) as datasets_count,
        SUM(file_size) as total_size,
        SUM(record_count) as total_records
      FROM datasets 
      WHERE user_id = ? AND created_at BETWEEN ? AND ?
      GROUP BY DATE_TRUNC('${dateFormat}', created_at)
      ORDER BY date ASC
    `, [userId, dateRange.start, dateRange.end]);
    
    res.json({
      success: true,
      data: {
        period,
        granularity,
        data: volumeData.rows
      }
    });
    
  } catch (error) {
    logger.error('Error fetching data volume analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch data volume analytics',
      error: error.message
    });
  }
});

// GET /api/analytics/pipeline-performance - Get pipeline performance metrics
router.get('/pipeline-performance', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '7d' } = req.query;
    
    const dateRange = getDateRange(period);
    
    // Get pipeline performance by type
    const performanceByType = await db.query(`
      SELECT 
        type,
        COUNT(*) as total_pipelines,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_pipelines,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_pipelines,
        AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds,
        AVG(progress) as avg_progress
      FROM pipelines 
      WHERE user_id = ? AND created_at BETWEEN ? AND ?
      GROUP BY type
      ORDER BY total_pipelines DESC
    `, [userId, dateRange.start, dateRange.end]);
    
    // Get daily pipeline activity
    const dailyActivity = await db.query(`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as pipelines_created,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as pipelines_completed
      FROM pipelines 
      WHERE user_id = ? AND created_at BETWEEN ? AND ?
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date ASC
    `, [userId, dateRange.start, dateRange.end]);
    
    res.json({
      success: true,
      data: {
        period,
        performance_by_type: performanceByType.rows,
        daily_activity: dailyActivity.rows
      }
    });
    
  } catch (error) {
    logger.error('Error fetching pipeline performance analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pipeline performance analytics',
      error: error.message
    });
  }
});

// GET /api/analytics/rag-metrics - Get RAG system metrics
router.get('/rag-metrics', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '7d' } = req.query;
    
    const dateRange = getDateRange(period);
    
    // Get RAG performance metrics
    const ragMetrics = await db.query(`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as queries_count,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_queries,
        COUNT(CASE WHEN hallucination THEN 1 END) as hallucinations,
        AVG(confidence) as avg_confidence,
        AVG(factuality) as avg_factuality,
        AVG(retrieval_time) as avg_retrieval_time,
        AVG(generation_time) as avg_generation_time
      FROM rag_traces 
      WHERE user_id = ? AND created_at BETWEEN ? AND ?
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date ASC
    `, [userId, dateRange.start, dateRange.end]);
    
    // Get error breakdown
    const errorBreakdown = await db.query(`
      SELECT 
        status,
        COUNT(*) as count,
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
      FROM rag_traces 
      WHERE user_id = ? AND created_at BETWEEN ? AND ? AND status != 'success'
      GROUP BY status
      ORDER BY count DESC
    `, [userId, dateRange.start, dateRange.end]);
    
    // Get confidence distribution
    const confidenceDistribution = await db.query(`
      SELECT 
        CASE 
          WHEN confidence >= 0.9 THEN 'high'
          WHEN confidence >= 0.7 THEN 'medium'
          ELSE 'low'
        END as confidence_level,
        COUNT(*) as count,
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
      FROM rag_traces 
      WHERE user_id = ? AND created_at BETWEEN ? AND ?
      GROUP BY confidence_level
      ORDER BY 
        CASE confidence_level
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          ELSE 3
        END
    `, [userId, dateRange.start, dateRange.end]);
    
    res.json({
      success: true,
      data: {
        period,
        metrics: ragMetrics.rows,
        error_breakdown: errorBreakdown.rows,
        confidence_distribution: confidenceDistribution.rows
      }
    });
    
  } catch (error) {
    logger.error('Error fetching RAG metrics analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RAG metrics analytics',
      error: error.message
    });
  }
});

// GET /api/analytics/system-performance - Get system performance metrics
router.get('/system-performance', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current system metrics
    const systemMetrics = {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      cpu: process.cpuUsage(),
      timestamp: new Date().toISOString()
    };
    
    // Get database performance
    const dbPerformance = await db.query(`
      SELECT 
        COUNT(*) as active_connections,
        AVG(EXTRACT(EPOCH FROM (NOW() - state_change))) as avg_connection_age
      FROM pg_stat_activity 
      WHERE state = 'active'
    `);
    
    // Get queue statistics
    const QueueService = require('../services/queue');
    const queue = new QueueService();
    const queueStats = await queue.getAllStats();
    
    res.json({
      success: true,
      data: {
        system: systemMetrics,
        database: dbPerformance.rows[0] || {},
        queues: queueStats
      }
    });
    
  } catch (error) {
    logger.error('Error fetching system performance analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system performance analytics',
      error: error.message
    });
  }
});

// GET /api/analytics/export - Export analytics data
router.get('/export', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      format = 'json', 
      period = '7d', 
      metrics = ['datasets', 'pipelines', 'rag'] 
    } = req.query;
    
    const dateRange = getDateRange(period);
    const exportData = {
      user_id: userId,
      period,
      exported_at: new Date().toISOString(),
      format
    };
    
    // Export datasets data
    if (metrics.includes('datasets')) {
      exportData.datasets = await db.find('datasets', {
        user_id: userId,
        created_at: { 
          '>=': dateRange.start, 
          '<=': dateRange.end 
        }
      });
    }
    
    // Export pipelines data
    if (metrics.includes('pipelines')) {
      exportData.pipelines = await db.find('pipelines', {
        user_id: userId,
        created_at: { 
          '>=': dateRange.start, 
          '<=': dateRange.end 
        }
      });
    }
    
    // Export RAG traces data
    if (metrics.includes('rag')) {
      exportData.rag_traces = await db.find('rag_traces', {
        user_id: userId,
        created_at: { 
          '>=': dateRange.start, 
          '<=': dateRange.end 
        }
      });
    }
    
    // Format response based on requested format
    if (format === 'csv') {
      // Convert to CSV format (simplified)
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${period}.csv"`);
      return res.send(convertToCSV(exportData));
    }
    
    // Default to JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="analytics-${period}.json"`);
    res.json({
      success: true,
      data: exportData
    });
    
  } catch (error) {
    logger.error('Error exporting analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics data',
      error: error.message
    });
  }
});

// POST /api/analytics/track - Track custom analytics event
router.post('/track', authenticate, async (req, res) => {
  try {
    const { event_name, event_data = {}, value = 1 } = req.body;
    const userId = req.user.id;
    
    if (!event_name) {
      return res.status(400).json({
        success: false,
        message: 'Event name is required'
      });
    }
    
    // Store custom analytics event
    const analyticsData = {
      id: require('uuid').v4(),
      user_id: userId,
      metric_type: 'custom',
      metric_name: event_name,
      value: value,
      unit: 'count',
      dimensions: event_data,
      recorded_at: new Date()
    };
    
    await db.create('analytics', analyticsData);
    
    logger.analytics('Custom event tracked', event_name, {
      userId,
      value,
      data: event_data
    });
    
    res.status(201).json({
      success: true,
      message: 'Analytics event tracked successfully'
    });
    
  } catch (error) {
    logger.error('Error tracking analytics event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track analytics event',
      error: error.message
    });
  }
});

// Helper functions
function getDateRange(period) {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case '1d':
      start.setDate(now.getDate() - 1);
      break;
    case '7d':
      start.setDate(now.getDate() - 7);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      break;
    case '90d':
      start.setDate(now.getDate() - 90);
      break;
    default:
      start.setDate(now.getDate() - 7);
  }
  
  return {
    start: start.toISOString(),
    end: now.toISOString()
  };
}

function getDateFormat(granularity) {
  switch (granularity) {
    case 'hour':
      return 'hour';
    case 'day':
      return 'day';
    case 'week':
      return 'week';
    case 'month':
      return 'month';
    default:
      return 'day';
  }
}

function convertToCSV(data) {
  // Simplified CSV conversion
  const csvRows = [];
  
  // Add header
  csvRows.push('Type,ID,User ID,Created At,Data');
  
  // Add datasets
  if (data.datasets) {
    data.datasets.forEach(dataset => {
      csvRows.push([
        'Dataset',
        dataset.id,
        dataset.user_id,
        dataset.created_at,
        JSON.stringify(dataset)
      ].join(','));
    });
  }
  
  // Add pipelines
  if (data.pipelines) {
    data.pipelines.forEach(pipeline => {
      csvRows.push([
        'Pipeline',
        pipeline.id,
        pipeline.user_id,
        pipeline.created_at,
        JSON.stringify(pipeline)
      ].join(','));
    });
  }
  
  // Add RAG traces
  if (data.rag_traces) {
    data.rag_traces.forEach(trace => {
      csvRows.push([
        'RAG Trace',
        trace.id,
        trace.user_id,
        trace.created_at,
        JSON.stringify(trace)
      ].join(','));
    });
  }
  
  return csvRows.join('\n');
}

module.exports = router;
