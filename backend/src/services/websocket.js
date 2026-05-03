const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

class WebSocketService {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map(); // userId -> socket.id
    this.userSockets = new Map(); // socket.id -> userId
    this.rooms = new Map(); // roomName -> Set of socketIds
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        
        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Invalid authentication token'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`WebSocket client connected: ${socket.id} (User: ${socket.userId})`);
      
      // Track user connection
      this.connectedUsers.set(socket.userId, socket.id);
      this.userSockets.set(socket.id, socket.userId);
      
      // Join user to their personal room
      socket.join(`user:${socket.userId}`);
      
      // Handle room subscriptions
      socket.on('join-room', (roomName) => {
        this.handleJoinRoom(socket, roomName);
      });
      
      socket.on('leave-room', (roomName) => {
        this.handleLeaveRoom(socket, roomName);
      });
      
      // Handle pipeline updates
      socket.on('pipeline-subscribe', (pipelineId) => {
        this.handlePipelineSubscribe(socket, pipelineId);
      });
      
      socket.on('pipeline-unsubscribe', (pipelineId) => {
        this.handlePipelineUnsubscribe(socket, pipelineId);
      });
      
      // Handle dataset updates
      socket.on('dataset-subscribe', (datasetId) => {
        this.handleDatasetSubscribe(socket, datasetId);
      });
      
      socket.on('dataset-unsubscribe', (datasetId) => {
        this.handleDatasetUnsubscribe(socket, datasetId);
      });
      
      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.handleDisconnection(socket, reason);
      });
      
      // Send welcome message
      socket.emit('connected', {
        message: 'Connected to Multimodal Data Platform WebSocket',
        userId: socket.userId,
        timestamp: new Date().toISOString()
      });
    });
  }

  handleJoinRoom(socket, roomName) {
    socket.join(roomName);
    
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    this.rooms.get(roomName).add(socket.id);
    
    logger.debug(`User ${socket.userId} joined room: ${roomName}`);
    
    socket.emit('room-joined', {
      room: roomName,
      timestamp: new Date().toISOString()
    });
  }

  handleLeaveRoom(socket, roomName) {
    socket.leave(roomName);
    
    if (this.rooms.has(roomName)) {
      this.rooms.get(roomName).delete(socket.id);
      if (this.rooms.get(roomName).size === 0) {
        this.rooms.delete(roomName);
      }
    }
    
    logger.debug(`User ${socket.userId} left room: ${roomName}`);
    
    socket.emit('room-left', {
      room: roomName,
      timestamp: new Date().toISOString()
    });
  }

  handlePipelineSubscribe(socket, pipelineId) {
    const roomName = `pipeline:${pipelineId}`;
    socket.join(roomName);
    
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    this.rooms.get(roomName).add(socket.id);
    
    logger.debug(`User ${socket.userId} subscribed to pipeline: ${pipelineId}`);
    
    socket.emit('pipeline-subscribed', {
      pipelineId,
      timestamp: new Date().toISOString()
    });
  }

  handlePipelineUnsubscribe(socket, pipelineId) {
    const roomName = `pipeline:${pipelineId}`;
    socket.leave(roomName);
    
    if (this.rooms.has(roomName)) {
      this.rooms.get(roomName).delete(socket.id);
      if (this.rooms.get(roomName).size === 0) {
        this.rooms.delete(roomName);
      }
    }
    
    logger.debug(`User ${socket.userId} unsubscribed from pipeline: ${pipelineId}`);
    
    socket.emit('pipeline-unsubscribed', {
      pipelineId,
      timestamp: new Date().toISOString()
    });
  }

  handleDatasetSubscribe(socket, datasetId) {
    const roomName = `dataset:${datasetId}`;
    socket.join(roomName);
    
    if (!this.rooms.has(roomName)) {
      this.rooms.set(roomName, new Set());
    }
    this.rooms.get(roomName).add(socket.id);
    
    logger.debug(`User ${socket.userId} subscribed to dataset: ${datasetId}`);
    
    socket.emit('dataset-subscribed', {
      datasetId,
      timestamp: new Date().toISOString()
    });
  }

  handleDatasetUnsubscribe(socket, datasetId) {
    const roomName = `dataset:${datasetId}`;
    socket.leave(roomName);
    
    if (this.rooms.has(roomName)) {
      this.rooms.get(roomName).delete(socket.id);
      if (this.rooms.get(roomName).size === 0) {
        this.rooms.delete(roomName);
      }
    }
    
    logger.debug(`User ${socket.userId} unsubscribed from dataset: ${datasetId}`);
    
    socket.emit('dataset-unsubscribed', {
      datasetId,
      timestamp: new Date().toISOString()
    });
  }

  handleDisconnection(socket, reason) {
    logger.info(`WebSocket client disconnected: ${socket.id} (User: ${socket.userId}) - Reason: ${reason}`);
    
    // Remove from tracking maps
    this.connectedUsers.delete(socket.userId);
    this.userSockets.delete(socket.id);
    
    // Remove from all rooms
    for (const [roomName, socketIds] of this.rooms.entries()) {
      socketIds.delete(socket.id);
      if (socketIds.size === 0) {
        this.rooms.delete(roomName);
      }
    }
  }

  // Public methods for broadcasting events
  
  // Broadcast to specific user
  sendToUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
    
    logger.debug(`Sent event to user ${userId}: ${event}`);
  }

  // Broadcast to all users in a room
  sendToRoom(roomName, event, data) {
    this.io.to(roomName).emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
    
    logger.debug(`Sent event to room ${roomName}: ${event}`);
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    this.io.emit(event, {
      ...data,
      timestamp: new Date().toISOString()
    });
    
    logger.debug(`Broadcasted event to all users: ${event}`);
  }

  // Pipeline-specific events
  sendPipelineUpdate(pipelineId, data) {
    this.sendToRoom(`pipeline:${pipelineId}`, 'pipeline-update', {
      pipelineId,
      ...data
    });
  }

  sendPipelineProgress(pipelineId, progress, currentStep, totalSteps) {
    this.sendToRoom(`pipeline:${pipelineId}`, 'pipeline-progress', {
      pipelineId,
      progress,
      currentStep,
      totalSteps,
      percentage: Math.round((progress / totalSteps) * 100)
    });
  }

  sendPipelineCompleted(pipelineId, result) {
    this.sendToRoom(`pipeline:${pipelineId}`, 'pipeline-completed', {
      pipelineId,
      result
    });
  }

  sendPipelineFailed(pipelineId, error) {
    this.sendToRoom(`pipeline:${pipelineId}`, 'pipeline-failed', {
      pipelineId,
      error: error.message || error
    });
  }

  // Dataset-specific events
  sendDatasetUpdate(datasetId, data) {
    this.sendToRoom(`dataset:${datasetId}`, 'dataset-update', {
      datasetId,
      ...data
    });
  }

  sendDatasetProcessingStarted(datasetId) {
    this.sendToRoom(`dataset:${datasetId}`, 'dataset-processing-started', {
      datasetId
    });
  }

  sendDatasetProcessingProgress(datasetId, progress, status) {
    this.sendToRoom(`dataset:${datasetId}`, 'dataset-processing-progress', {
      datasetId,
      progress,
      status
    });
  }

  sendDatasetProcessingCompleted(datasetId, result) {
    this.sendToRoom(`dataset:${datasetId}`, 'dataset-processing-completed', {
      datasetId,
      result
    });
  }

  sendDatasetProcessingFailed(datasetId, error) {
    this.sendToRoom(`dataset:${datasetId}`, 'dataset-processing-failed', {
      datasetId,
      error: error.message || error
    });
  }

  // Upload-specific events
  sendUploadProgress(userId, uploadId, progress, status) {
    this.sendToUser(userId, 'upload-progress', {
      uploadId,
      progress,
      status
    });
  }

  sendUploadCompleted(userId, uploadId, result) {
    this.sendToUser(userId, 'upload-completed', {
      uploadId,
      result
    });
  }

  sendUploadFailed(userId, uploadId, error) {
    this.sendToUser(userId, 'upload-failed', {
      uploadId,
      error: error.message || error
    });
  }

  // System events
  sendSystemAlert(level, message, data = {}) {
    this.broadcast('system-alert', {
      level, // info, warning, error, critical
      message,
      ...data
    });
  }

  sendUserNotification(userId, type, message, data = {}) {
    this.sendToUser(userId, 'notification', {
      type, // info, success, warning, error
      message,
      ...data
    });
  }

  // Analytics events
  sendMetricsUpdate(userId, metrics) {
    this.sendToUser(userId, 'metrics-update', metrics);
  }

  sendRealTimeStats(stats) {
    this.broadcast('real-time-stats', stats);
  }

  // Utility methods
  getConnectedUsers() {
    return Array.from(this.connectedUsers.keys());
  }

  getUserSocketId(userId) {
    return this.connectedUsers.get(userId);
  }

  getRoomMembers(roomName) {
    return this.rooms.get(roomName) || new Set();
  }

  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }

  getRoomCount() {
    return this.rooms.size;
  }

  getConnectionCount() {
    return this.connectedUsers.size;
  }
}

module.exports = WebSocketService;
