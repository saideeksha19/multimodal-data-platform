# 🚀 How to Run the Multimodal Data Platform

This guide will help you set up and run the complete full-stack application.

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ (https://nodejs.org/)
- **PostgreSQL** 12+ (https://www.postgresql.org/)
- **Redis** 6+ (https://redis.io/)
- **Git** (https://git-scm.com/)

### Optional (for AI features)
- **OpenAI API Key** (https://platform.openai.com/api-keys)

## 🗂️ Project Structure

```
windsurf-project/
├── frontend/                 # Next.js frontend application
├── backend/                  # Node.js backend API
├── package.json              # Root package file
└── RUN_GUIDE.md             # This file
```

## 🛠️ Setup Instructions

### 1. Clone and Navigate
```bash
cd windsurf-project
```

### 2. Install Dependencies

#### Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

#### Backend Dependencies
```bash
cd backend
npm install
cd ..
```

### 3. Database Setup

#### Install PostgreSQL
- **Windows**: Download from https://www.postgresql.org/download/windows/
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql postgresql-contrib`

#### Create Database
```bash
# Start PostgreSQL service
# Windows: Start PostgreSQL service from Services
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database
createdb multimodal_platform_dev

# Create user (optional)
psql -d postgres
CREATE USER multimodal_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE multimodal_platform_dev TO multimodal_user;
\q
```

### 4. Redis Setup

#### Install Redis
- **Windows**: Download from https://github.com/microsoftarchive/redis/releases
- **macOS**: `brew install redis`
- **Linux**: `sudo apt-get install redis-server`

#### Start Redis
```bash
# Windows: Start Redis service
# macOS: brew services start redis
# Linux: sudo systemctl start redis-server
```

### 5. Environment Configuration

#### Backend Environment
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your configuration:
```env
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=multimodal_platform_dev
DB_USER=multimodal_user
DB_PASSWORD=your_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h

# OpenAI Configuration (Optional)
OPENAI_API_KEY=your-openai-api-key
EMBEDDING_MODEL=text-embedding-ada-002
CHAT_MODEL=gpt-3.5-turbo

# File Upload Configuration
MAX_FILE_SIZE=104857600
UPLOAD_DIR=uploads

# Logging Configuration
LOG_LEVEL=info
LOG_DIR=logs
```

### 6. Database Migrations
```bash
cd backend
npm run migrate
```

### 7. Create Upload Directories
```bash
cd backend
mkdir -p uploads logs
```

## 🚀 Running the Application

### Option 1: Run Both Frontend and Backend (Recommended)

#### Terminal 1 - Start Backend
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5000

#### Terminal 2 - Start Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:3000

### Option 2: Run with Concurrently (Single Terminal)

#### Install Concurrently (if not installed)
```bash
npm install -g concurrently
```

#### Create Root Scripts
Add to root `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev",
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install"
  }
}
```

#### Run Both Services
```bash
npm run dev
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/health
- **Database**: PostgreSQL on localhost:5432
- **Redis**: Redis on localhost:6379

## 🧪 Testing the Setup

### 1. Test Backend Health
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "uptime": 0,
  "memory": {...},
  "version": "1.0.0"
}
```

### 2. Test Frontend
Open http://localhost:3000 in your browser - you should see the Multimodal Data Platform UI.

### 3. Test API Endpoints
```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"password123"}'
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -l | grep multimodal_platform_dev

# Reset database
dropdb multimodal_platform_dev
createdb multimodal_platform_dev
npm run migrate
```

#### 2. Redis Connection Failed
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG

# Restart Redis
# Windows: Restart Redis service
# macOS: brew services restart redis
# Linux: sudo systemctl restart redis-server
```

#### 3. Port Already in Use
```bash
# Find process using port
netstat -tulpn | grep :5000
netstat -tulpn | grep :3000

# Kill process
kill -9 <PID>

# Or change ports in .env files
```

#### 4. Node.js Version Issues
```bash
# Check Node.js version
node --version

# Should be 18+
# If not, install Node.js 18+ from nodejs.org
```

#### 5. Permission Issues
```bash
# Fix file permissions
chmod -R 755 backend/uploads
chmod -R 755 backend/logs
```

### Log Files
Check these files for debugging:
- `backend/logs/error.log` - Backend errors
- `backend/logs/combined.log` - All backend logs
- Frontend logs in browser console

## 📱 Features to Test

### 1. User Registration & Login
- Create a new account
- Login with credentials
- Access protected routes

### 2. File Upload
- Upload PDF, image, or text files
- Check upload progress
- View processed data

### 3. AI Pipelines
- Create data cleaning pipeline
- Start OCR extraction pipeline
- Monitor pipeline progress

### 4. RAG Debug Console
- Submit queries to RAG system
- View trace details
- Check for hallucinations

### 5. Analytics Dashboard
- View system metrics
- Check data volume trends
- Monitor pipeline performance

## 🐳 Docker Setup (Optional)

### Create Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: multimodal_platform_dev
      POSTGRES_USER: multimodal_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/logs:/app/logs

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

### Run with Docker
```bash
docker-compose up -d
```

## 🚀 Production Deployment

### Environment Setup
```bash
# Set production environment
export NODE_ENV=production

# Use production database
export DB_NAME=multimodal_platform_prod

# Use secure secrets
export JWT_SECRET=your-very-secure-production-secret
```

### Build and Deploy
```bash
# Build frontend
cd frontend
npm run build

# Start production backend
cd ../backend
npm start
```

## 📚 Next Steps

1. **Configure OpenAI API** for AI features
2. **Set up monitoring** and alerting
3. **Configure SSL** for production
4. **Set up backup** for database
5. **Deploy to cloud** (AWS, GCP, Azure)

## 🆘 Support

If you encounter issues:

1. **Check logs** in `backend/logs/`
2. **Verify environment** variables
3. **Test database** connection
4. **Check Redis** connection
5. **Review this guide** for missed steps

For additional help:
- Check the README files in `frontend/` and `backend/`
- Review the API documentation at `/health` endpoint
- Test individual components separately

---

**🎉 Your Multimodal Data Platform is now ready to run!**
