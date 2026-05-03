const express = require('express');
const Joi = require('joi');
const router = express.Router();

const DatabaseService = require('../services/database');
const AIService = require('../services/ai');
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

const db = new DatabaseService();
const ai = new AIService();

// Validation schemas
const createTraceSchema = Joi.object({
  query: Joi.string().required().min(1).max(2000),
  pipeline_id: Joi.string().uuid().optional(),
  context: Joi.object().optional()
});

// GET /api/debug/traces - Get RAG traces for a user
router.get('/traces', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      hallucination,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      date_from,
      date_to
    } = req.query;

    const userId = req.user.id;
    
    // Build where clause
    let where = { user_id: userId };
    
    if (status) {
      where.status = status;
    }
    
    if (hallucination === 'true') {
      where.hallucination = true;
    } else if (hallucination === 'false') {
      where.hallucination = false;
    }
    
    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) {
        where.created_at['>='] = new Date(date_from);
      }
      if (date_to) {
        where.created_at['<='] = new Date(date_to);
      }
    }
    
    if (search) {
      // Add full-text search
      where = db.db.raw(`
        user_id = ? AND 
        (query ILIKE ? OR response ILIKE ?) AND
        created_at BETWEEN COALESCE(?, '1970-01-01') AND COALESCE(?, NOW())
      `, [
        userId, 
        `%${search}%`, 
        `%${search}%`,
        date_from || '1970-01-01',
        date_to || '9999-12-31'
      ]);
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      orderBy: sortBy,
      order: sortOrder
    };

    const result = await db.paginate('rag_traces', where, options);
    
    // Add computed fields
    const enrichedData = result.data.map(trace => ({
      ...trace,
      retrieval_summary: {
        chunks_count: trace.retrieval?.chunks || 0,
        relevance_score: trace.retrieval?.relevance || 0,
        sources_count: trace.retrieval?.sources?.length || 0
      },
      performance_metrics: {
        retrieval_time_ms: trace.retrieval_time || 0,
        generation_time_ms: trace.generation_time || 0,
        total_time_ms: (trace.retrieval_time || 0) + (trace.generation_time || 0)
      }
    }));
    
    res.json({
      success: true,
      data: enrichedData,
      pagination: result.pagination
    });
    
  } catch (error) {
    logger.error('Error fetching RAG traces:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RAG traces',
      error: error.message
    });
  }
});

// GET /api/debug/traces/:id - Get a specific RAG trace
router.get('/traces/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const trace = await db.findOne('rag_traces', { id, user_id: userId });
    
    if (!trace) {
      return res.status(404).json({
        success: false,
        message: 'RAG trace not found'
      });
    }
    
    // Enrich with additional data
    const enrichedTrace = {
      ...trace,
      retrieval_summary: {
        chunks_count: trace.retrieval?.chunks || 0,
        relevance_score: trace.retrieval?.relevance || 0,
        sources_count: trace.retrieval?.sources?.length || 0
      },
      performance_metrics: {
        retrieval_time_ms: trace.retrieval_time || 0,
        generation_time_ms: trace.generation_time || 0,
        total_time_ms: (trace.retrieval_time || 0) + (trace.generation_time || 0)
      },
      analysis: {
        confidence_level: getConfidenceLevel(trace.confidence),
        factuality_level: getFactualityLevel(trace.factuality),
        risk_level: getRiskLevel(trace.status, trace.hallucination)
      }
    };
    
    res.json({
      success: true,
      data: enrichedTrace
    });
    
  } catch (error) {
    logger.error('Error fetching RAG trace:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch RAG trace',
      error: error.message
    });
  }
});

// POST /api/debug/traces - Create a new RAG trace (for testing/debugging)
router.post('/traces', authenticate, async (req, res) => {
  try {
    const { error, value } = createTraceSchema.validate(req.body);
    
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
    
    // Process the query through RAG pipeline
    const ragResult = await ai.processRAGQuery(value.query, {
      userId: req.user.id,
      pipelineId: value.pipeline_id,
      context: value.context
    });
    
    // Create trace record
    const traceData = {
      id: ragResult.id,
      user_id: req.user.id,
      pipeline_id: value.pipeline_id,
      query: value.query,
      retrieval: ragResult.retrieval,
      response: ragResult.response,
      confidence: ragResult.confidence,
      hallucination: ragResult.hallucination,
      factuality: ragResult.factuality,
      status: ragResult.status,
      embedding: ragResult.embedding,
      retrieved_chunks: ragResult.retrieved_chunks,
      sources: ragResult.sources,
      retrieval_time: ragResult.retrieval_time,
      generation_time: ragResult.generation_time,
      error_details: ragResult.error_details
    };
    
    const trace = await db.create('rag_traces', traceData);
    
    logger.info(`RAG trace created: ${trace.id} for user ${req.user.id}`);
    
    res.status(201).json({
      success: true,
      data: trace,
      message: 'RAG trace created successfully'
    });
    
  } catch (error) {
    logger.error('Error creating RAG trace:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create RAG trace',
      error: error.message
    });
  }
});

// GET /api/debug/traces/:id/similarity - Find similar traces
router.get('/traces/:id/similarity', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, threshold = 0.7 } = req.query;
    const userId = req.user.id;
    
    const trace = await db.findOne('rag_traces', { id, user_id: userId });
    
    if (!trace) {
      return res.status(404).json({
        success: false,
        message: 'RAG trace not found'
      });
    }
    
    // Find similar traces using vector similarity
    const similarTraces = await ai.findSimilarTraces(trace.embedding, {
      userId,
      limit: parseInt(limit),
      threshold: parseFloat(threshold),
      excludeId: id
    });
    
    res.json({
      success: true,
      data: similarTraces
    });
    
  } catch (error) {
    logger.error('Error finding similar traces:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to find similar traces',
      error: error.message
    });
  }
});

// GET /api/debug/errors - Get error classifications and statistics
router.get('/errors', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date_from, date_to } = req.query;
    
    // Build date filter
    let dateFilter = '';
    let params = [userId];
    
    if (date_from || date_to) {
      dateFilter = 'AND created_at BETWEEN COALESCE(?, \'1970-01-01\') AND COALESCE(?, NOW())';
      params.push(date_from || '1970-01-01', date_to || '9999-12-31');
    }
    
    // Get error statistics
    const errorStats = await db.query(`
      SELECT 
        status,
        COUNT(*) as count,
        AVG(CASE WHEN hallucination THEN 1 ELSE 0 END) * 100 as hallucination_rate,
        AVG(confidence) as avg_confidence,
        AVG(factuality) as avg_factuality
      FROM rag_traces 
      WHERE user_id = ? AND status != 'success' ${dateFilter}
      GROUP BY status
      ORDER BY count DESC
    `, params);
    
    // Get recent errors
    const recentErrors = await db.find('rag_traces', {
      user_id: userId,
      status: db.db.raw("IN ('hallucination', 'retrieval_failure', 'context_overflow')")
    }, {
      orderBy: 'created_at',
      order: 'desc',
      limit: 20
    });
    
    // Get error trends over time
    const errorTrends = await db.query(`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        status,
        COUNT(*) as count
      FROM rag_traces 
      WHERE user_id = ? AND status != 'success' 
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', created_at), status
      ORDER BY date DESC, count DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: {
        statistics: errorStats.rows,
        recent_errors: recentErrors,
        trends: errorTrends.rows
      }
    });
    
  } catch (error) {
    logger.error('Error fetching error statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch error statistics',
      error: error.message
    });
  }
});

// POST /api/debug/analyze - Analyze a query for potential issues
router.post('/analyze', authenticate, async (req, res) => {
  try {
    const { query, options = {} } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query is required'
      });
    }
    
    // Analyze the query
    const analysis = await ai.analyzeQuery(query, {
      userId: req.user.id,
      ...options
    });
    
    res.json({
      success: true,
      data: analysis
    });
    
  } catch (error) {
    logger.error('Error analyzing query:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze query',
      error: error.message
    });
  }
});

// GET /api/debug/metrics - Get debugging metrics and statistics
router.get('/metrics', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '7d' } = req.query;
    
    // Calculate date range
    const dateRange = getDateRange(period);
    
    // Get overall metrics
    const overallMetrics = await db.query(`
      SELECT 
        COUNT(*) as total_queries,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_queries,
        COUNT(CASE WHEN hallucination THEN 1 END) as hallucinations,
        COUNT(CASE WHEN status = 'retrieval_failure' THEN 1 END) as retrieval_failures,
        COUNT(CASE WHEN status = 'context_overflow' THEN 1 END) as context_overflows,
        AVG(confidence) as avg_confidence,
        AVG(factuality) as avg_factuality,
        AVG(retrieval_time) as avg_retrieval_time,
        AVG(generation_time) as avg_generation_time
      FROM rag_traces 
      WHERE user_id = ? AND created_at BETWEEN ? AND ?
    `, [userId, dateRange.start, dateRange.end]);
    
    // Get daily metrics
    const dailyMetrics = await db.query(`
      SELECT 
        DATE_TRUNC('day', created_at) as date,
        COUNT(*) as queries,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
        COUNT(CASE WHEN hallucination THEN 1 END) as hallucinations,
        AVG(confidence) as avg_confidence
      FROM rag_traces 
      WHERE user_id = ? AND created_at BETWEEN ? AND ?
      GROUP BY DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `, [userId, dateRange.start, dateRange.end]);
    
    // Get top error types
    const topErrors = await db.query(`
      SELECT 
        status,
        COUNT(*) as count,
        COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentage
      FROM rag_traces 
      WHERE user_id = ? AND created_at BETWEEN ? AND ? AND status != 'success'
      GROUP BY status
      ORDER BY count DESC
      LIMIT 10
    `, [userId, dateRange.start, dateRange.end]);
    
    res.json({
      success: true,
      data: {
        period,
        overall: overallMetrics.rows[0] || {},
        daily: dailyMetrics.rows,
        top_errors: topErrors.rows
      }
    });
    
  } catch (error) {
    logger.error('Error fetching debug metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch debug metrics',
      error: error.message
    });
  }
});

// Helper functions
function getConfidenceLevel(confidence) {
  if (confidence >= 0.9) return 'high';
  if (confidence >= 0.7) return 'medium';
  return 'low';
}

function getFactualityLevel(factuality) {
  if (factuality >= 0.9) return 'high';
  if (factuality >= 0.7) return 'medium';
  return 'low';
}

function getRiskLevel(status, hallucination) {
  if (hallucination) return 'critical';
  if (status === 'retrieval_failure') return 'high';
  if (status === 'context_overflow') return 'medium';
  return 'low';
}

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

module.exports = router;
