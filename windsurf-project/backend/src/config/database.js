const knex = require('knex');
const config = require('./knexfile');
const logger = require('../utils/logger');

class DatabaseService {
  constructor() {
    this.connection = null;
    this.environment = process.env.NODE_ENV || 'development';
  }

  async connect() {
    try {
      this.connection = knex(config[this.environment]);
      
      // Test connection
      await this.connection.raw('SELECT 1');
      logger.info('Database connected successfully');
      
      return this.connection;
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.destroy();
      logger.info('Database disconnected');
    }
  }

  async close() {
    await this.disconnect();
  }

  // Get the knex instance
  get db() {
    if (!this.connection) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.connection;
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.connection.raw('SELECT version()');
      return {
        status: 'healthy',
        version: result.rows[0].version,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Transaction helper
  async transaction(callback) {
    const trx = await this.connection.transaction();
    try {
      const result = await callback(trx);
      await trx.commit();
      return result;
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // Query helpers
  async query(sql, params = []) {
    return await this.connection.raw(sql, params);
  }

  async find(table, where = {}, options = {}) {
    let query = this.connection(table).where(where);
    
    if (options.select) {
      query = query.select(options.select);
    }
    
    if (options.orderBy) {
      query = query.orderBy(options.orderBy);
    }
    
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    if (options.offset) {
      query = query.offset(options.offset);
    }
    
    return await query;
  }

  async findOne(table, where = {}, options = {}) {
    const result = await this.find(table, where, { ...options, limit: 1 });
    return result[0] || null;
  }

  async create(table, data) {
    const [result] = await this.connection(table).insert(data).returning('*');
    return result;
  }

  async update(table, where, data) {
    const [result] = await this.connection(table).where(where).update(data).returning('*');
    return result;
  }

  async delete(table, where) {
    return await this.connection(table).where(where).del();
  }

  async count(table, where = {}) {
    const [result] = await this.connection(table).where(where).count('* as count');
    return parseInt(result.count);
  }

  // Pagination helper
  async paginate(table, where = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      order = 'desc',
      select = '*'
    } = options;

    const offset = (page - 1) * limit;

    // Get total count
    const total = await this.count(table, where);

    // Get data
    const data = await this.find(table, where, {
      select,
      orderBy: { [orderBy]: order },
      limit,
      offset
    });

    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }
}

module.exports = DatabaseService;
