const express = require('express');
const Joi = require('joi');
const router = express.Router();

const DatabaseService = require('../services/database');
const logger = require('../utils/logger');
const { generateToken, hashPassword, comparePassword, authenticate } = require('../middleware/auth');

const db = new DatabaseService();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().min(8).required(),
  first_name: Joi.string().min(1).max(50).optional(),
  last_name: Joi.string().min(1).max(50).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const changePasswordSchema = Joi.object({
  current_password: Joi.string().required(),
  new_password: Joi.string().min(8).required()
});

// POST /api/auth/register - Register a new user
router.post('/register', async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    
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
    
    const { email, username, password, first_name, last_name } = value;
    
    // Check if user already exists
    const existingUser = await db.findOne('users', { email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    const existingUsername = await db.findOne('users', { username });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username already taken'
      });
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const userData = {
      email,
      username,
      password_hash: passwordHash,
      first_name,
      last_name,
      role: 'user',
      is_active: true
    };
    
    const user = await db.create('users', userData);
    
    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });
    
    // Remove password hash from response
    delete user.password_hash;
    
    logger.info(`User registered: ${user.email}`);
    
    res.status(201).json({
      success: true,
      data: {
        user,
        token
      },
      message: 'User registered successfully'
    });
    
  } catch (error) {
    logger.error('Error in user registration:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { error, value } = loginSchema.validate(req.body);
    
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
    
    const { email, password } = value;
    
    // Find user
    const user = await db.findOne('users', { email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Update last login
    await db.update('users', { id: user.id }, { last_login: new Date() });
    
    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });
    
    // Remove password hash from response
    delete user.password_hash;
    
    logger.info(`User logged in: ${user.email}`);
    
    res.json({
      success: true,
      data: {
        user,
        token
      },
      message: 'Login successful'
    });
    
  } catch (error) {
    logger.error('Error in user login:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// GET /api/auth/me - Get current user info
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await db.findOne('users', { id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove password hash from response
    delete user.password_hash;
    
    res.json({
      success: true,
      data: user
    });
    
  } catch (error) {
    logger.error('Error fetching user info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user info',
      error: error.message
    });
  }
});

// PUT /api/auth/me - Update current user info
router.put('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, username } = req.body;
    
    const updateData = {};
    
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (username !== undefined) {
      // Check if username is available
      const existingUser = await db.findOne('users', { 
        username, 
        id: { '!=': userId } 
      });
      
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Username already taken'
        });
      }
      
      updateData.username = username;
    }
    
    const user = await db.update('users', { id: userId }, updateData);
    
    // Remove password hash from response
    delete user.password_hash;
    
    logger.info(`User updated: ${user.email}`);
    
    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
    
  } catch (error) {
    logger.error('Error updating user info:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user info',
      error: error.message
    });
  }
});

// PUT /api/auth/change-password - Change user password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { error, value } = changePasswordSchema.validate(req.body);
    
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
    
    const { current_password, new_password } = value;
    const userId = req.user.id;
    
    // Get user with password
    const user = await db.findOne('users', { id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await comparePassword(current_password, user.password_hash);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Hash new password
    const newPasswordHash = await hashPassword(new_password);
    
    // Update password
    await db.update('users', { id: userId }, { password_hash: newPasswordHash });
    
    logger.info(`Password changed for user: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    logger.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// POST /api/auth/logout - Logout user (client-side token removal)
router.post('/logout', authenticate, (req, res) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
    
  } catch (error) {
    logger.error('Error in logout:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    });
  }
});

// POST /api/auth/refresh - Refresh token
router.post('/refresh', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get updated user info
    const user = await db.findOne('users', { id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Generate new token
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    });
    
    res.json({
      success: true,
      data: {
        token
      },
      message: 'Token refreshed successfully'
    });
    
  } catch (error) {
    logger.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token',
      error: error.message
    });
  }
});

// POST /api/auth/forgot-password - Initiate password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    const user = await db.findOne('users', { email });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }
    
    // TODO: Implement actual password reset email sending
    // For now, just return success
    
    logger.info(`Password reset requested for: ${email}`);
    
    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });
    
  } catch (error) {
    logger.error('Error in forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request',
      error: error.message
    });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body;
    
    if (!token || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }
    
    // TODO: Implement actual password reset with token validation
    // For now, return error
    
    res.status(400).json({
      success: false,
      message: 'Password reset functionality not yet implemented'
    });
    
  } catch (error) {
    logger.error('Error in password reset:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

// DELETE /api/auth/me - Delete user account
router.delete('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }
    
    // Get user with password
    const user = await db.findOne('users', { id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    // TODO: Delete user's data (datasets, pipelines, etc.)
    // For now, just delete user
    
    await db.delete('users', { id: userId });
    
    logger.info(`User account deleted: ${user.email}`);
    
    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
    
  } catch (error) {
    logger.error('Error deleting user account:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
});

module.exports = router;
