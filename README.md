# 🚀 Multimodal Data Intelligence Platform

A production-grade, modern, visually stunning frontend for processing and analyzing multimodal data with AI-powered insights.

## 🎯 Overview

This platform cleans, processes, and structures messy multimodal data (PDFs, images, videos, logs, and text) and fixes AI pipeline issues like hallucinations, RAG retrieval errors, and inconsistent data freshness.

## ✨ Features

### 🎨 Design & UX
- **Dark mode default** with futuristic glassmorphism design
- **Smooth animations** using Framer Motion
- **Micro-interactions** and hover effects throughout
- **Real-time updates** with WebSocket simulation
- **Command palette** (Ctrl + K) for quick actions
- **Responsive design** that works on all devices

### 📊 Core Capabilities

#### 1. **Multimodal Data Ingestion**
- Drag & drop file upload with progress tracking
- Support for PDFs, Images, Videos, Code files, and Text
- Batch upload system with file preview
- Real-time processing queue visualization

#### 2. **Data Cleaning Dashboard**
- Auto-detection of data issues (missing fields, corrupted files, duplicates)
- One-click "Clean Dataset" functionality
- Before vs After preview comparisons
- OCR noise detection and removal

#### 3. **Structured Data Extraction Engine**
- Convert unstructured data to structured formats
- Real-time JSON extraction viewer
- Toggle between Raw, Structured, and Semantic graph views
- Entity recognition and relationship mapping

#### 4. **AI Pipeline Debugger** ⭐
- **RAG trace viewer**: Query → Retrieval → Chunks → Response
- **Hallucination detection** with confidence scoring
- **Error classification**: Retrieval failure, embedding mismatch, context overflow
- Real-time debugging tools and suggestions

#### 5. **Data Freshness Monitor**
- Live data freshness scoring
- Timestamp tracking and staleness alerts
- Auto-refresh pipeline controls
- Data quality metrics

#### 6. **Analytics Dashboard**
- Data volume charts and processing speed metrics
- Error rate graphs and model performance tracking
- System resource monitoring (CPU, Memory, GPU)
- Customizable time ranges and export functionality

#### 7. **Dataset Explorer**
- Grid and list view modes
- Advanced search and filtering
- Tag-based organization
- Dataset details and management actions

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism effects
- **Animations**: Framer Motion for smooth transitions
- **State Management**: Zustand for global state
- **Data Fetching**: React Query for server state
- **Charts**: Recharts for analytics visualization
- **Code Editor**: Monaco Editor for JSON viewing
- **Icons**: Lucide React icon library

## 🏗 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main application page
├── components/
│   ├── layout/            # Core layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MainWorkspace.tsx
│   ├── dashboard/         # Home dashboard
│   │   └── HomeDashboard.tsx
│   ├── upload/            # Data upload center
│   │   └── DataUploadCenter.tsx
│   ├── processing/        # Processing workspace
│   │   └── ProcessingWorkspace.tsx
│   ├── debug/             # AI debug console
│   │   └── AIDebugConsole.tsx
│   ├── analytics/         # Analytics dashboard
│   │   └── AnalyticsDashboard.tsx
│   └── dataset/           # Dataset explorer
│       └── DatasetExplorer.tsx
└── lib/
    └── api.ts             # Mock API layer and WebSocket simulation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd multimodal-data-platform
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 🎨 Design System

### Colors
- **Primary**: Blue to Cyan gradient
- **Accent**: Purple to Pink gradient  
- **Success**: Green shades
- **Warning**: Yellow/Orange shades
- **Error**: Red shades
- **Background**: Dark gray to black gradient

### Typography
- **Font**: Inter (system font stack)
- **Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Animations
- **Page transitions**: 0.5s ease-in-out
- **Hover effects**: 0.3s ease-in-out
- **Loading animations**: 1s ease-in-out infinite
- **Micro-interactions**: 0.2s ease-in-out

## 🔧 Key Features Explained

### AI Debug Console
The AI Debug Console is a critical feature that provides:
- **RAG Trace Visualization**: Complete journey of queries through retrieval-augmented generation
- **Hallucination Detection**: AI-powered detection of factually incorrect responses
- **Error Classification**: Automatic categorization of pipeline failures
- **Real-time Monitoring**: Live updates of pipeline performance

### Data Processing Pipeline
- **Multi-step Processing**: Validation → Cleaning → Extraction → Structuring
- **Progress Tracking**: Real-time progress bars and status updates
- **Error Handling**: Comprehensive error detection and recovery suggestions
- **Performance Metrics**: Speed, accuracy, and resource utilization tracking

### Dataset Management
- **Smart Organization**: Auto-tagging and categorization
- **Version Control**: Track dataset changes and iterations
- **Access Control**: Role-based permissions (extensible)
- **Export Options**: Multiple formats and configurations

## 📊 Mock Data

The application includes comprehensive mock data for:
- System metrics and KPIs
- Pipeline statuses and progress
- Dataset information and metadata
- RAG traces and debug information
- Analytics charts and trends
- Error logs and classifications

## 🔮 Future Enhancements

- **Real-time Collaboration**: Multi-user editing and commenting
- **Advanced Analytics**: ML-powered insights and recommendations
- **Custom Pipelines**: Visual pipeline builder
- **Integration Hub**: Connect to external data sources
- **Mobile App**: Native iOS and Android applications
- **API Gateway**: RESTful API for third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Animated with [Framer Motion](https://www.framer.com/motion/)
- Icons from [Lucide](https://lucide.dev/)

---

**🚀 Built for the future of multimodal data processing!**
