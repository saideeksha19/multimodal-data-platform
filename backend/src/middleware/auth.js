const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Generate JWT token
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

// Hash password
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Compare password
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Authentication middleware
function authenticate(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = verifyToken(token);
    req.user = decoded;
    
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Authentication failed.'
      });
    }
  }
}

// Authorization middleware
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication required.'
      });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    
    next();
  };
}

// Optional authentication (doesn't fail if no token)
function optionalAuth(req, res, next) {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = verifyToken(token);
      req.user = decoded;
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user info
    next();
  }
}

// Rate limiting middleware
function rateLimiter(req, res, next) {
  // Simple in-memory rate limiting
  // In production, use Redis or similar
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // limit each IP to 100 requests per windowMs
  
  const clientIp = req.ip || req.connection.remoteAddress;
  
  if (!rateLimiter.clients) {
    rateLimiter.clients = new Map();
  }
  
  const now = Date.now();
  const windowStart = now - windowMs;
  
  // Clean up old entries
  for (const [ip, data] of rateLimiter.clients.entries()) {
    if (data.windowStart < windowStart) {
      rateLimiter.clients.delete(ip);
    }
  }
  
  // Check current IP
  let clientData = rateLimiter.clients.get(clientIp);
  
  if (!clientData || clientData.windowStart < windowStart) {
    clientData = {
      requests: 0,
      windowStart: now
    };
    rateLimiter.clients.set(clientIp, clientData);
  }
  
  clientData.requests++;
  
  if (clientData.requests > maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }
  
  next();
}

// API Key authentication
function authenticateApiKey(req, res, next) {
  try {
    const apiKey = req.header('X-API-Key');
    
    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required.'
      });
    }
    
    // In a real implementation, validate against database
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API key.'
      });
    }
    
    req.apiKey = apiKey;
    next();
  } catch (error) {
    logger.error('API key authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
}

// User ownership check
function checkOwnership(resourceType) {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const userId = req.user.id;
      
      const DatabaseService = require('../services/database');
      const db = new DatabaseService();
      
      let resource;
      
      switch (resourceType) {
        case 'dataset':
          resource = await db.findOne('datasets', { id: resourceId, user_id: userId });
          break;
        case 'pipeline':
          resource = await db.findOne('pipelines', { id: resourceId, user_id: userId });
          break;
        case 'rag_trace':
          resource = await db.findOne('rag_traces', { id: resourceId, user_id: userId });
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid resource type.'
          });
      }
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found or access denied.'
        });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      logger.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to verify ownership.'
      });
    }
  };
}

// Validate user permissions
function hasPermission(permission) {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }
    
    // Admin has all permissions
    if (user.role === 'admin') {
      return next();
    }
    
    // Check specific permissions based on role
    const permissions = {
      'user': ['read:own', 'create:own', 'update:own', 'delete:own'],
      'viewer': ['read:own'],
      'editor': ['read:own', 'create:own', 'update:own'],
      'moderator': ['read:all', 'update:all'],
      'admin': ['*']
    };
    
    const userPermissions = permissions[user.role] || [];
    
    if (userPermissions.includes('*') || userPermissions.includes(permission)) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions.'
    });
  };
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
  authenticate,
  authorize,
  optionalAuth,
  rateLimiter,
  authenticateApiKey,
  checkOwnership,
  hasPermission
};
