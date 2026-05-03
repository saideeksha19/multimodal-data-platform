const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  ),
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add request logging middleware
logger.requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.http(message);
    }
  });
  
  next();
};

// Add performance logging
logger.performance = (operation, duration, metadata = {}) => {
  logger.debug(`Performance: ${operation} took ${duration}ms`, metadata);
};

// Add security logging
logger.security = (event, details = {}) => {
  logger.warn(`Security Event: ${event}`, details);
};

// Add API logging
logger.api = (method, endpoint, userId, statusCode, duration) => {
  const logData = {
    method,
    endpoint,
    userId,
    statusCode,
    duration
  };
  
  if (statusCode >= 400) {
    logger.warn(`API Error: ${method} ${endpoint}`, logData);
  } else {
    logger.info(`API: ${method} ${endpoint}`, logData);
  }
};

// Add database logging
logger.database = (operation, table, duration, details = {}) => {
  logger.debug(`Database: ${operation} on ${table} took ${duration}ms`, details);
};

// Add queue logging
logger.queue = (queueName, jobId, status, details = {}) => {
  logger.info(`Queue [${queueName}]: Job ${jobId} ${status}`, details);
};

// Add WebSocket logging
logger.websocket = (event, userId, details = {}) => {
  logger.debug(`WebSocket: ${event} for user ${userId}`, details);
};

// Add AI service logging
logger.ai = (operation, model, duration, details = {}) => {
  logger.info(`AI Service: ${operation} with model ${model} took ${duration}ms`, details);
};

// Add file processing logging
logger.fileProcessing = (fileId, operation, status, details = {}) => {
  logger.info(`File Processing [${fileId}]: ${operation} ${status}`, details);
};

// Add pipeline logging
logger.pipeline = (pipelineId, step, status, details = {}) => {
  logger.info(`Pipeline [${pipelineId}]: Step ${step} ${status}`, details);
};

// Add error context helper
logger.errorWithContext = (message, context = {}) => {
  logger.error(message, context);
};

// Add structured logging helper
logger.structured = (level, message, data = {}) => {
  logger.log(level, message, data);
};

// Add audit logging
logger.audit = (action, userId, resource, details = {}) => {
  const auditData = {
    action,
    userId,
    resource,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  logger.info(`Audit: ${action} on ${resource} by user ${userId}`, auditData);
};

// Add metrics logging
logger.metrics = (metricName, value, tags = {}) => {
  const metricData = {
    metric: metricName,
    value,
    tags,
    timestamp: new Date().toISOString()
  };
  
  logger.info(`Metric: ${metricName} = ${value}`, metricData);
};

// Add health check logging
logger.health = (service, status, details = {}) => {
  const healthData = {
    service,
    status,
    timestamp: new Date().toISOString(),
    ...details
  };
  
  if (status === 'healthy') {
    logger.debug(`Health Check: ${service} is healthy`, healthData);
  } else {
    logger.warn(`Health Check: ${service} is ${status}`, healthData);
  }
};

// Add configuration logging (only in development)
if (process.env.NODE_ENV === 'development') {
  logger.config = (configName, value) => {
    logger.debug(`Config: ${configName} = ${JSON.stringify(value)}`);
  };
} else {
  logger.config = () => {}; // No-op in production
}

// Add cleanup function for graceful shutdown
logger.cleanup = () => {
  logger.info('Logger shutting down...');
  // Close file transports
  logger.transports.forEach(transport => {
    if (transport.close) {
      transport.close();
    }
  });
};

// Handle uncaught exceptions
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
);

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

module.exports = logger;
