# 🚀 Multimodal Data Platform Backend

A production-grade, scalable backend API for processing and analyzing multimodal data with AI-powered insights.

## 🎯 Overview

This backend provides comprehensive APIs for:
- **Multimodal Data Processing** - PDFs, images, videos, audio, text, and code
- **AI Pipeline Management** - Data cleaning, OCR, image analysis, sentiment analysis
- **RAG System** - Retrieval-Augmented Generation with hallucination detection
- **Real-time Updates** - WebSocket connections for live progress tracking
- **Analytics & Monitoring** - Comprehensive metrics and performance tracking

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with Knex.js ORM
- **Queue**: Bull Queue with Redis
- **WebSocket**: Socket.io
- **Authentication**: JWT with bcrypt
- **File Processing**: Multer, Sharp, PDF-parse, Tesseract.js
- **AI Integration**: OpenAI API, LangChain
- **Logging**: Winston
- **Validation**: Joi

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # Database configuration
│   │   └── knexfile.js          # Knex migrations config
│   ├── middleware/
│   │   ├── auth.js              # Authentication middleware
│   │   ├── errorHandler.js      # Error handling middleware
│   │   └── rateLimiter.js       # Rate limiting
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── datasets.js          # Dataset management
│   │   ├── upload.js            # File upload endpoints
│   │   ├── pipelines.js         # Pipeline management
│   │   ├── debug.js             # RAG debugging endpoints
│   │   └── analytics.js         # Analytics endpoints
│   ├── services/
│   │   ├── database.js          # Database service
│   │   ├── queue.js             # Job queue service
│   │   ├── websocket.js         # WebSocket service
│   │   └── ai.js                # AI processing service
│   ├── utils/
│   │   └── logger.js            # Logging utility
│   ├── migrations/              # Database migrations
│   └── server.js                # Main server file
├── uploads/                     # File upload directory
├── logs/                        # Log files
├── package.json
├── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- Redis 6+
- OpenAI API key

### Installation

1. **Clone and setup**:
```bash
cd backend
npm install
```

2. **Environment configuration**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Database setup**:
```bash
# Create database
createdb multimodal_platform

# Run migrations
npm run migrate

# Seed database (optional)
npm run seed
```

4. **Start Redis**:
```bash
redis-server
```

5. **Start development server**:
```bash
npm run dev
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/me` - Update user info
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### Datasets
- `GET /api/datasets` - List datasets (paginated)
- `GET /api/datasets/:id` - Get dataset details
- `POST /api/datasets` - Create new dataset
- `PUT /api/datasets/:id` - Update dataset
- `DELETE /api/datasets/:id` - Delete dataset
- `GET /api/datasets/:id/preview` - Get dataset preview
- `POST /api/datasets/:id/export` - Export dataset

### File Upload
- `POST /api/upload` - Upload files (multipart)
- `POST /api/upload/url` - Upload from URL
- `GET /api/upload/progress/:id` - Get upload progress
- `DELETE /api/upload/:id` - Cancel upload

### Pipelines
- `GET /api/pipelines` - List pipelines
- `GET /api/pipelines/:id` - Get pipeline details
- `POST /api/pipelines` - Create pipeline
- `POST /api/pipelines/:id/start` - Start pipeline
- `POST /api/pipelines/:id/pause` - Pause pipeline
- `POST /api/pipelines/:id/resume` - Resume pipeline
- `POST /api/pipelines/:id/cancel` - Cancel pipeline
- `GET /api/pipelines/:id/progress` - Get pipeline progress
- `GET /api/pipelines/types` - Get pipeline types

### RAG Debug Console
- `GET /api/debug/traces` - List RAG traces
- `GET /api/debug/traces/:id` - Get RAG trace details
- `POST /api/debug/traces` - Create RAG trace
- `GET /api/debug/traces/:id/similarity` - Find similar traces
- `GET /api/debug/errors` - Get error statistics
- `POST /api/debug/analyze` - Analyze query
- `GET /api/debug/metrics` - Get debug metrics

### Analytics
- `GET /api/analytics/overview` - Analytics overview
- `GET /api/analytics/data-volume` - Data volume trends
- `GET /api/analytics/pipeline-performance` - Pipeline performance
- `GET /api/analytics/rag-metrics` - RAG system metrics
- `GET /api/analytics/system-performance` - System performance
- `GET /api/analytics/export` - Export analytics data
- `POST /api/analytics/track` - Track custom event

## 🔌 WebSocket Events

### Client to Server
- `join-room` - Join a room
- `leave-room` - Leave a room
- `pipeline-subscribe` - Subscribe to pipeline updates
- `pipeline-unsubscribe` - Unsubscribe from pipeline
- `dataset-subscribe` - Subscribe to dataset updates
- `dataset-unsubscribe` - Unsubscribe from dataset

### Server to Client
- `pipeline-update` - Pipeline status update
- `pipeline-progress` - Pipeline progress update
- `pipeline-completed` - Pipeline completed
- `pipeline-failed` - Pipeline failed
- `dataset-update` - Dataset update
- `dataset-processing-progress` - Processing progress
- `dataset-processing-completed` - Processing completed
- `notification` - User notification
- `system-alert` - System alert

## 🗄️ Database Schema

### Users
- `id` - UUID primary key
- `email` - Unique email
- `username` - Unique username
- `password_hash` - Bcrypt hash
- `role` - User role (admin, user, viewer)
- `is_active` - Account status
- `last_login` - Last login timestamp

### Datasets
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `name` - Dataset name
- `type` - Data type (pdf, image, video, etc.)
- `status` - Processing status
- `file_size` - File size in bytes
- `record_count` - Number of records
- `metadata` - JSON metadata
- `tags` - JSON array of tags
- `starred` - Boolean flag
- `file_path` - File storage path
- `thumbnail_path` - Thumbnail path

### Pipelines
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `dataset_id` - Foreign key to datasets
- `name` - Pipeline name
- `type` - Pipeline type
- `status` - Pipeline status
- `config` - JSON configuration
- `steps` - JSON array of steps
- `current_step` - Current step index
- `total_steps` - Total steps
- `progress` - Progress percentage
- `started_at` - Start timestamp
- `completed_at` - Completion timestamp

### RAG Traces
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `pipeline_id` - Foreign key to pipelines
- `query` - User query
- `retrieval` - JSON retrieval data
- `response` - AI response
- `confidence` - Confidence score
- `hallucination` - Boolean flag
- `factuality` - Factuality score
- `status` - Trace status
- `embedding` - Query embedding
- `retrieved_chunks` - JSON chunks
- `sources` - JSON sources
- `retrieval_time` - Retrieval time in ms
- `generation_time` - Generation time in ms

### Analytics
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `metric_type` - Metric type
- `metric_name` - Metric name
- `value` - Metric value
- `unit` - Value unit
- `dimensions` - JSON dimensions
- `recorded_at` - Timestamp

## 🔧 Configuration

### Environment Variables

#### Server
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Frontend URL for CORS

#### Database
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password

#### Redis
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port
- `REDIS_PASSWORD` - Redis password
- `REDIS_DB` - Redis database

#### Security
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRES_IN` - JWT expiration time
- `API_KEY` - API key for external access

#### AI Services
- `OPENAI_API_KEY` - OpenAI API key
- `EMBEDDING_MODEL` - Embedding model name
- `CHAT_MODEL` - Chat model name

## 🚀 Deployment

### Docker Deployment

1. **Build Docker image**:
```bash
docker build -t multimodal-backend .
```

2. **Run with Docker Compose**:
```bash
docker-compose up -d
```

### Production Deployment

1. **Environment setup**:
```bash
export NODE_ENV=production
export JWT_SECRET=your-production-secret
# Set other production variables
```

2. **Database migrations**:
```bash
npm run migrate:prod
```

3. **Start production server**:
```bash
npm start
```

## 📊 Monitoring & Logging

### Log Levels
- `error` - Error messages
- `warn` - Warning messages
- `info` - Informational messages
- `http` - HTTP requests
- `debug` - Debug messages

### Log Files
- `logs/error.log` - Error logs
- `logs/combined.log` - All logs
- `logs/exceptions.log` - Uncaught exceptions

### Health Checks
- `GET /health` - Basic health check
- Database connectivity
- Redis connectivity
- Queue status

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### API Tests
```bash
npm run test:api
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Joi schema validation
- **CORS Protection** - Cross-origin protection
- **File Upload Security** - Type and size validation
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Input sanitization

## 🚨 Error Handling

### Global Error Handler
- Catches all unhandled errors
- Logs error details
- Returns appropriate HTTP status codes
- Sanitizes error messages in production

### Custom Error Classes
- `AppError` - Custom application errors
- `ValidationError` - Input validation errors
- `AuthenticationError` - Auth-related errors

## 📈 Performance

### Caching
- Redis for session storage
- Database query caching
- File processing results caching

### Queue Processing
- Background job processing
- Priority queues
- Retry mechanisms
- Job monitoring

### Database Optimization
- Connection pooling
- Indexed queries
- Pagination
- Query optimization

## 🔄 Background Jobs

### File Processing
- PDF text extraction
- Image processing
- Video/audio processing
- Code analysis

### Pipeline Processing
- Multi-step processing
- Progress tracking
- Error handling
- Resource management

### AI Processing
- Embedding generation
- RAG processing
- Content analysis
- Batch processing

## 📚 API Documentation

### Authentication
All protected endpoints require a valid JWT token:
```bash
Authorization: Bearer <token>
```

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "pagination": {}
}
```

### Error Format
```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "errors": []
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the logs in `logs/` directory
- Review environment configuration
- Verify database and Redis connectivity
- Check API key configurations

---

**🚀 Built for scalable multimodal data processing!**
