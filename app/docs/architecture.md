# Garmin 5K Analysis Platform - System Architecture

## Executive Summary

This document defines the complete system architecture for a web-based platform that analyzes Garmin 5K training data and provides personalized insights, recommendations, and forecasting.

**Version**: 1.0
**Date**: 2025-11-06
**Status**: Draft

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Technology Stack](#technology-stack)
4. [System Components](#system-components)
5. [Data Flow](#data-flow)
6. [API Design](#api-design)
7. [File Structure](#file-structure)
8. [Security Considerations](#security-considerations)
9. [Deployment Strategy](#deployment-strategy)
10. [Performance Requirements](#performance-requirements)
11. [Future Extensibility](#future-extensibility)

---

## 1. System Overview

### 1.1 Purpose
The platform enables runners to upload Garmin activity files (FIT/TCX/GPX formats) and receive:
- Detailed performance metrics analysis
- Personalized training recommendations with confidence scores
- 5K completion time forecasts
- Visual data representations
- Historical trend analysis

### 1.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (React)                            │  │
│  │  - File Upload UI                                     │  │
│  │  - Dashboard & Analytics                             │  │
│  │  - Configuration Management                          │  │
│  │  - Data Visualization (Chart.js/Recharts)           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS/REST API
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js API Routes / Express Backend                │  │
│  │  - File Upload Handler                               │  │
│  │  - Authentication & Authorization                    │  │
│  │  - Request Validation                                │  │
│  │  - Rate Limiting                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                                ↕
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   Parser    │  │  Analyzer   │  │  Recommendation  │   │
│  │   Service   │→ │   Engine    │→ │     Engine       │   │
│  │             │  │             │  │                  │   │
│  │ - FIT/TCX/  │  │ - Metrics   │  │ - AI/ML Model    │   │
│  │   GPX       │  │   Calc      │  │ - Confidence     │   │
│  │ - Validate  │  │ - Trends    │  │ - Personalize    │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │ Forecasting │  │Visualization│  │   Configuration  │   │
│  │   Service   │  │   Service   │  │     Manager      │   │
│  │             │  │             │  │                  │   │
│  │ - Predict   │  │ - Charts    │  │ - User Prefs     │   │
│  │ - Simulate  │  │ - Reports   │  │ - Training Goals │   │
│  └─────────────┘  └─────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                                ↕
┌─────────────────────────────────────────────────────────────┐
│                      DATA LAYER                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Storage Layer                                        │  │
│  │  - File Storage (Local/S3)                           │  │
│  │  - SQLite/PostgreSQL (Activity Records)             │  │
│  │  - Redis Cache (Sessions/Analytics)                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture Principles

### 2.1 Design Principles

1. **Separation of Concerns**: Clear boundaries between presentation, business logic, and data layers
2. **Modularity**: Independent, reusable components with well-defined interfaces
3. **Scalability**: Horizontal scaling capability for compute-intensive analysis
4. **Security First**: Data encryption, secure file handling, input validation
5. **Performance**: Sub-second response times for analysis, efficient file parsing
6. **Maintainability**: Clean code, comprehensive testing, documentation
7. **Extensibility**: Plugin architecture for new file formats and analysis algorithms

### 2.2 Non-Functional Requirements

| Requirement | Target | Priority |
|-------------|--------|----------|
| File Upload Size | Up to 50MB | High |
| Parse Time (5K FIT file) | < 2 seconds | High |
| Analysis Time | < 5 seconds | High |
| API Response Time | < 500ms (p95) | High |
| Concurrent Users | 100+ | Medium |
| Data Retention | 90 days default | Medium |
| Browser Support | Modern evergreen browsers | High |
| Mobile Responsive | Yes | High |

---

## 3. Technology Stack

### 3.1 Frontend Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Framework** | Next.js 14+ (App Router) | SSR, API routes, optimized performance, TypeScript support |
| **UI Library** | React 18+ | Industry standard, rich ecosystem |
| **Styling** | Tailwind CSS | Rapid development, consistent design system |
| **Charting** | Recharts + D3.js | React-native charts (Recharts) for common use, D3 for custom viz |
| **State Management** | React Context + TanStack Query | Simple state + server state caching |
| **Forms** | React Hook Form + Zod | Performance + type-safe validation |
| **File Upload** | React Dropzone | Drag-and-drop, file validation |
| **Type Safety** | TypeScript 5+ | Compile-time error detection |

### 3.2 Backend Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Runtime** | Node.js 20 LTS | Next.js native, JavaScript full-stack |
| **API Framework** | Next.js API Routes | Integrated with frontend, serverless-ready |
| **File Parser** | fit-file-parser (FIT)<br>fast-xml-parser (TCX/GPX) | Proven libraries, active maintenance |
| **Database** | PostgreSQL (primary)<br>SQLite (development) | Relational data, JSON support, scalable |
| **Caching** | Redis (optional) | Session storage, analytics caching |
| **File Storage** | Local (dev)<br>AWS S3 (production) | Scalable object storage |
| **Authentication** | NextAuth.js v5 | OAuth, credentials, session management |
| **Validation** | Zod | Schema validation, TypeScript integration |
| **Testing** | Vitest + Playwright | Fast unit tests + E2E testing |

### 3.3 Analysis & ML Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Metrics Calculation** | Custom TypeScript algorithms | Full control, performance optimization |
| **Statistical Analysis** | simple-statistics.js | Lightweight, no dependencies |
| **ML Recommendations** | TensorFlow.js (future)<br>Rule-based (v1) | Progressive enhancement |
| **Forecasting** | Time series analysis<br>Riegel formula | Running-specific algorithms |

### 3.4 DevOps & Infrastructure

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| **Version Control** | Git + GitHub | Standard, CI/CD integration |
| **CI/CD** | GitHub Actions | Free, integrated workflows |
| **Containerization** | Docker | Consistent environments |
| **Deployment** | Vercel (primary)<br>AWS ECS (alternative) | Next.js optimized, serverless |
| **Monitoring** | Vercel Analytics<br>Sentry (errors) | Performance tracking, error reporting |
| **Logging** | Winston + Pino | Structured logging |

---

## 4. System Components

### 4.1 Frontend Components

#### 4.1.1 File Upload Module
```typescript
// Features:
// - Drag & drop interface
// - File type validation (FIT/TCX/GPX)
// - Progress indication
// - Error handling
// - Multi-file support

Components:
  - FileUploader.tsx
  - UploadProgress.tsx
  - FileValidator.ts
```

#### 4.1.2 Dashboard Module
```typescript
// Features:
// - Activity list/grid view
// - Quick stats cards
// - Recent analysis
// - Training calendar

Components:
  - Dashboard.tsx
  - ActivityCard.tsx
  - StatsOverview.tsx
  - TrainingCalendar.tsx
```

#### 4.1.3 Analysis Visualization Module
```typescript
// Features:
// - Pace graphs (line charts)
// - Heart rate zones (bar/area charts)
// - Split analysis (table + chart)
// - Elevation profile
// - Comparative analysis

Components:
  - PaceChart.tsx
  - HeartRateZones.tsx
  - SplitAnalysis.tsx
  - ElevationProfile.tsx
  - ComparisonView.tsx
```

#### 4.1.4 Recommendations Module
```typescript
// Features:
// - Personalized insights cards
// - Confidence indicators
// - Training plan suggestions
// - Goal tracking

Components:
  - RecommendationCard.tsx
  - ConfidenceScore.tsx
  - TrainingPlanSuggestion.tsx
  - GoalTracker.tsx
```

#### 4.1.5 Forecast Module
```typescript
// Features:
// - 5K time prediction
// - Scenario analysis ("what if")
// - Historical trend projection
// - Confidence intervals

Components:
  - ForecastDisplay.tsx
  - ScenarioSimulator.tsx
  - TrendProjection.tsx
  - ConfidenceInterval.tsx
```

#### 4.1.6 Configuration Module
```typescript
// Features:
// - User profile settings
// - Training goals
// - Preferred units
// - Privacy settings

Components:
  - UserProfile.tsx
  - TrainingGoals.tsx
  - PreferencesForm.tsx
  - PrivacySettings.tsx
```

### 4.2 Backend Components

#### 4.2.1 File Parser Service
```typescript
// Responsibilities:
// - Parse FIT/TCX/GPX files
// - Extract raw activity data
// - Validate data integrity
// - Convert to unified format

Modules:
  - FitParser.ts (using fit-file-parser)
  - TcxParser.ts (using fast-xml-parser)
  - GpxParser.ts (using fast-xml-parser)
  - UnifiedDataModel.ts
  - ParserFactory.ts
```

**Unified Data Model**:
```typescript
interface ActivityData {
  metadata: {
    activityType: 'running' | 'cycling' | 'other';
    startTime: Date;
    totalTime: number; // seconds
    distance: number; // meters
    source: 'fit' | 'tcx' | 'gpx';
  };
  records: Array<{
    timestamp: Date;
    position?: { lat: number; lon: number };
    distance?: number; // meters
    speed?: number; // m/s
    heartRate?: number; // bpm
    cadence?: number; // rpm/spm
    altitude?: number; // meters
    power?: number; // watts
  }>;
  laps?: Array<{
    lapIndex: number;
    startTime: Date;
    totalTime: number;
    distance: number;
    avgSpeed: number;
    avgHeartRate?: number;
  }>;
}
```

#### 4.2.2 Analysis Engine
```typescript
// Responsibilities:
// - Calculate performance metrics
// - Identify trends and patterns
// - Generate statistical summaries
// - Detect anomalies

Modules:
  - MetricsCalculator.ts
  - TrendAnalyzer.ts
  - StatisticalSummary.ts
  - AnomalyDetector.ts

Metrics:
  - Pace (min/km, min/mile)
  - Speed zones distribution
  - Heart rate zones (5-zone model)
  - Cadence analysis
  - Elevation gain/loss
  - Training load (TSS)
  - VO2 max estimation
  - Lactate threshold estimation
```

**Key Algorithms**:
```typescript
// Pace calculation with smoothing
function calculateSmoothedPace(records: Record[], windowSize: number): number[]

// Heart rate zones (based on max HR or lactate threshold)
function calculateHRZones(records: Record[], maxHR: number): ZoneDistribution

// VO2 max estimation (Jack Daniels formula)
function estimateVO2Max(distance: number, time: number): number

// Training Stress Score
function calculateTSS(duration: number, intensity: number, threshold: number): number
```

#### 4.2.3 Recommendation Engine
```typescript
// Responsibilities:
// - Generate personalized recommendations
// - Calculate confidence scores
// - Prioritize suggestions
// - Adapt to user goals

Modules:
  - RecommendationGenerator.ts
  - ConfidenceScorer.ts
  - PersonalizationEngine.ts
  - RuleEngine.ts

Recommendation Types:
  1. Training Volume (increase/decrease/maintain)
  2. Intensity Distribution (easy/tempo/intervals)
  3. Recovery Needs (based on training load)
  4. Pacing Strategy (even/negative/positive split)
  5. Race Day Preparation
  6. Long-term Planning
```

**Confidence Scoring Model**:
```typescript
interface ConfidenceScore {
  score: number; // 0-100
  factors: {
    dataQuality: number; // completeness, accuracy
    historicalConsistency: number; // pattern match
    userEngagement: number; // profile completeness
    algorithmCertainty: number; // model confidence
  };
  reliability: 'low' | 'medium' | 'high';
}

// Confidence calculation
function calculateConfidence(
  dataQuality: number,
  historicalData: ActivityData[],
  userProfile: UserProfile
): ConfidenceScore
```

#### 4.2.4 Forecasting Service
```typescript
// Responsibilities:
// - Predict 5K completion time
// - Project training adaptations
// - Simulate training scenarios
// - Calculate confidence intervals

Modules:
  - TimePredictor.ts
  - RiegelFormula.ts
  - ProgressionModel.ts
  - ScenarioSimulator.ts

Forecasting Algorithms:
  1. Riegel Formula (race time prediction)
  2. VDOT-based prediction (Jack Daniels)
  3. Linear regression (historical improvement)
  4. Monte Carlo simulation (confidence intervals)
```

**Riegel Formula Implementation**:
```typescript
// T2 = T1 * (D2/D1)^1.06
function predictRaceTime(
  knownDistance: number,
  knownTime: number,
  targetDistance: number
): number {
  const fatigueFactor = 1.06;
  return knownTime * Math.pow(targetDistance / knownDistance, fatigueFactor);
}

// VDOT calculation
function calculateVDOT(distance: number, time: number): number {
  // Jack Daniels VDOT formula
  const vo2 = (-4.60 + 0.182258 * (distance / time) +
               0.000104 * Math.pow(distance / time, 2)) /
              (0.8 + 0.1894393 * Math.exp(-0.012778 * time) +
               0.2989558 * Math.exp(-0.1932605 * time));
  return vo2 / 0.95; // Convert to VDOT
}
```

#### 4.2.5 Visualization Service
```typescript
// Responsibilities:
// - Transform data for charts
// - Generate chart configurations
// - Create exportable reports
// - Prepare comparative datasets

Modules:
  - ChartDataTransformer.ts
  - ReportGenerator.ts
  - ExportService.ts
  - ComparisonBuilder.ts
```

#### 4.2.6 Configuration Manager
```typescript
// Responsibilities:
// - Store user preferences
// - Manage training goals
// - Handle privacy settings
// - Track user progress

Modules:
  - UserProfileService.ts
  - GoalsManager.ts
  - PreferencesStore.ts
  - ProgressTracker.ts

Data Models:
  - UserProfile
  - TrainingGoals
  - Preferences
  - ProgressMetrics
```

---

## 5. Data Flow

### 5.1 File Upload & Analysis Flow

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │ 1. Select/Drop File
       ↓
┌─────────────────┐
│  File Uploader  │
└────────┬────────┘
         │ 2. Validate (client-side)
         ↓
┌─────────────────┐
│  Upload API     │
└────────┬────────┘
         │ 3. Save to storage
         │ 4. Queue for processing
         ↓
┌─────────────────┐
│  Parser Service │
└────────┬────────┘
         │ 5. Parse file format
         │ 6. Extract raw data
         ↓
┌─────────────────┐
│ Unified Model   │
└────────┬────────┘
         │ 7. Normalize data
         ↓
┌─────────────────┐
│ Analysis Engine │
└────────┬────────┘
         │ 8. Calculate metrics
         │ 9. Identify trends
         ↓
┌──────────────────┐
│ Recommendation   │
│     Engine       │
└────────┬─────────┘
         │ 10. Generate insights
         │ 11. Score confidence
         ↓
┌──────────────────┐
│  Forecasting     │
│    Service       │
└────────┬─────────┘
         │ 12. Predict times
         │ 13. Simulate scenarios
         ↓
┌──────────────────┐
│   Database       │
└────────┬─────────┘
         │ 14. Store results
         ↓
┌──────────────────┐
│  Visualization   │
│    Service       │
└────────┬─────────┘
         │ 15. Transform for UI
         ↓
┌──────────────────┐
│  Dashboard UI    │
└────────┬─────────┘
         │ 16. Display results
         ↓
┌──────────────────┐
│      User        │
└──────────────────┘
```

### 5.2 Data Flow Details

#### Phase 1: Upload (Client → Server)
```typescript
POST /api/upload
Content-Type: multipart/form-data

Request:
  - file: Binary (FIT/TCX/GPX)
  - userId: string
  - metadata: {
      activityName?: string
      notes?: string
    }

Response:
  - uploadId: string
  - status: 'processing' | 'completed' | 'failed'
  - processingTime?: number
```

#### Phase 2: Processing (Server)
```typescript
// 1. File validation
const isValid = validateFile(file);

// 2. Parse based on format
const parser = ParserFactory.create(fileExtension);
const rawData = await parser.parse(fileBuffer);

// 3. Convert to unified model
const activityData = convertToUnifiedModel(rawData);

// 4. Calculate metrics
const metrics = await MetricsCalculator.analyze(activityData);

// 5. Generate recommendations
const recommendations = await RecommendationEngine.generate(
  metrics,
  userProfile,
  trainingHistory
);

// 6. Forecast performance
const forecast = await ForecastingService.predict(
  metrics,
  userProfile,
  trainingHistory
);

// 7. Store results
await database.activities.create({
  userId,
  activityData,
  metrics,
  recommendations,
  forecast
});
```

#### Phase 3: Visualization (Server → Client)
```typescript
GET /api/activities/:id

Response:
{
  activity: ActivityData,
  metrics: {
    summary: {
      distance: 5000,
      time: 1440, // seconds (24:00)
      avgPace: 288, // seconds/km (4:48/km)
      avgHeartRate: 165,
      avgCadence: 180,
      elevationGain: 45
    },
    zones: {
      heartRate: [
        { zone: 1, time: 120, percentage: 8.3 },
        { zone: 2, time: 300, percentage: 20.8 },
        { zone: 3, time: 480, percentage: 33.3 },
        { zone: 4, time: 420, percentage: 29.2 },
        { zone: 5, time: 120, percentage: 8.3 }
      ],
      pace: [...]
    },
    splits: [
      { km: 1, time: 285, pace: 285, heartRate: 155 },
      { km: 2, time: 288, pace: 288, heartRate: 162 },
      { km: 3, time: 290, pace: 290, heartRate: 168 },
      { km: 4, time: 292, pace: 292, heartRate: 172 },
      { km: 5, time: 285, pace: 285, heartRate: 175 }
    ]
  },
  recommendations: [
    {
      id: '1',
      type: 'pacing',
      title: 'Consider Even Pacing Strategy',
      description: 'Your pace varied by 7 seconds/km. More consistent pacing could improve efficiency.',
      confidence: 85,
      priority: 'high'
    },
    // ... more recommendations
  ],
  forecast: {
    predicted5kTime: 1380, // 23:00
    confidenceInterval: { lower: 1350, upper: 1410 },
    improvementPotential: '4.2%',
    timeline: '8-12 weeks'
  }
}
```

---

## 6. API Design

### 6.1 RESTful Endpoints

#### Authentication
```typescript
POST   /api/auth/register        // Create new user
POST   /api/auth/login           // Authenticate user
POST   /api/auth/logout          // End session
GET    /api/auth/session         // Get current session
POST   /api/auth/refresh         // Refresh token
```

#### File Upload
```typescript
POST   /api/upload               // Upload activity file
GET    /api/upload/:id/status    // Check processing status
DELETE /api/upload/:id           // Cancel upload
```

#### Activities
```typescript
GET    /api/activities           // List user activities
GET    /api/activities/:id       // Get activity details
DELETE /api/activities/:id       // Delete activity
PATCH  /api/activities/:id       // Update activity metadata
GET    /api/activities/:id/export // Export activity data
```

#### Analysis
```typescript
GET    /api/activities/:id/metrics        // Get calculated metrics
GET    /api/activities/:id/recommendations // Get recommendations
GET    /api/activities/:id/forecast        // Get performance forecast
POST   /api/activities/:id/reanalyze       // Trigger re-analysis
```

#### Comparison
```typescript
POST   /api/compare              // Compare multiple activities
GET    /api/compare/:compareId   // Get comparison results
```

#### User Profile
```typescript
GET    /api/user/profile         // Get user profile
PATCH  /api/user/profile         // Update profile
GET    /api/user/goals           // Get training goals
PUT    /api/user/goals           // Set/update goals
GET    /api/user/preferences     // Get preferences
PATCH  /api/user/preferences     // Update preferences
GET    /api/user/progress        // Get progress tracking
```

#### Reports
```typescript
GET    /api/reports/summary      // Activity summary report
GET    /api/reports/trends       // Trend analysis
GET    /api/reports/export       // Export data (CSV/JSON)
```

### 6.2 API Response Standards

#### Success Response
```typescript
{
  success: true,
  data: {
    // Response payload
  },
  meta: {
    timestamp: '2025-11-06T23:00:00Z',
    requestId: 'req_abc123'
  }
}
```

#### Error Response
```typescript
{
  success: false,
  error: {
    code: 'INVALID_FILE_FORMAT',
    message: 'File format not supported',
    details: 'Expected FIT, TCX, or GPX format',
    field: 'file'
  },
  meta: {
    timestamp: '2025-11-06T23:00:00Z',
    requestId: 'req_abc123'
  }
}
```

#### Pagination
```typescript
{
  success: true,
  data: [...],
  pagination: {
    page: 1,
    pageSize: 20,
    totalItems: 150,
    totalPages: 8,
    hasNext: true,
    hasPrevious: false
  }
}
```

---

## 7. File Structure

```
5kdecoded/
├── app/                              # Next.js app directory
│   ├── (auth)/                       # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/                  # Protected dashboard routes
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── activities/
│   │   │   ├── page.tsx             # Activity list
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Activity detail
│   │   ├── upload/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/                          # API routes
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   └── session/route.ts
│   │   ├── upload/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── status/route.ts
│   │   ├── activities/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       ├── metrics/route.ts
│   │   │       ├── recommendations/route.ts
│   │   │       └── forecast/route.ts
│   │   └── user/
│   │       ├── profile/route.ts
│   │       ├── goals/route.ts
│   │       └── preferences/route.ts
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   └── globals.css
│
├── src/                              # Source code
│   ├── components/                   # React components
│   │   ├── ui/                       # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── upload/
│   │   │   ├── FileUploader.tsx
│   │   │   ├── UploadProgress.tsx
│   │   │   └── FileValidator.ts
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ActivityCard.tsx
│   │   │   ├── StatsOverview.tsx
│   │   │   └── TrainingCalendar.tsx
│   │   ├── charts/
│   │   │   ├── PaceChart.tsx
│   │   │   ├── HeartRateZones.tsx
│   │   │   ├── SplitAnalysis.tsx
│   │   │   └── ElevationProfile.tsx
│   │   ├── recommendations/
│   │   │   ├── RecommendationCard.tsx
│   │   │   ├── ConfidenceScore.tsx
│   │   │   └── TrainingPlanSuggestion.tsx
│   │   └── forecast/
│   │       ├── ForecastDisplay.tsx
│   │       ├── ScenarioSimulator.tsx
│   │       └── TrendProjection.tsx
│   │
│   ├── lib/                          # Core library code
│   │   ├── parsers/                  # File parsers
│   │   │   ├── FitParser.ts
│   │   │   ├── TcxParser.ts
│   │   │   ├── GpxParser.ts
│   │   │   ├── UnifiedDataModel.ts
│   │   │   └── ParserFactory.ts
│   │   ├── analysis/                 # Analysis engine
│   │   │   ├── MetricsCalculator.ts
│   │   │   ├── TrendAnalyzer.ts
│   │   │   ├── StatisticalSummary.ts
│   │   │   └── AnomalyDetector.ts
│   │   ├── recommendations/          # Recommendation engine
│   │   │   ├── RecommendationGenerator.ts
│   │   │   ├── ConfidenceScorer.ts
│   │   │   ├── PersonalizationEngine.ts
│   │   │   └── RuleEngine.ts
│   │   ├── forecasting/              # Forecasting service
│   │   │   ├── TimePredictor.ts
│   │   │   ├── RiegelFormula.ts
│   │   │   ├── ProgressionModel.ts
│   │   │   └── ScenarioSimulator.ts
│   │   ├── visualization/            # Visualization helpers
│   │   │   ├── ChartDataTransformer.ts
│   │   │   ├── ReportGenerator.ts
│   │   │   └── ExportService.ts
│   │   ├── database/                 # Database layer
│   │   │   ├── client.ts
│   │   │   ├── schema.ts
│   │   │   └── migrations/
│   │   ├── auth/                     # Authentication
│   │   │   ├── config.ts
│   │   │   └── middleware.ts
│   │   └── utils/                    # Utility functions
│   │       ├── validation.ts
│   │       ├── formatting.ts
│   │       └── constants.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── activity.ts
│   │   ├── metrics.ts
│   │   ├── recommendation.ts
│   │   ├── forecast.ts
│   │   └── user.ts
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useActivities.ts
│   │   ├── useUpload.ts
│   │   ├── useAnalysis.ts
│   │   └── useAuth.ts
│   │
│   └── config/                       # Configuration files
│       ├── site.ts
│       ├── charts.ts
│       └── constants.ts
│
├── tests/                            # Test files
│   ├── unit/
│   │   ├── parsers/
│   │   ├── analysis/
│   │   ├── recommendations/
│   │   └── forecasting/
│   ├── integration/
│   │   ├── api/
│   │   └── workflows/
│   └── e2e/
│       ├── upload.spec.ts
│       ├── analysis.spec.ts
│       └── dashboard.spec.ts
│
├── docs/                             # Documentation
│   ├── architecture.md               # This file
│   ├── api-reference.md
│   ├── user-guide.md
│   ├── deployment.md
│   └── contributing.md
│
├── config/                           # Configuration
│   ├── database.config.ts
│   ├── auth.config.ts
│   └── storage.config.ts
│
├── scripts/                          # Utility scripts
│   ├── seed-database.ts
│   ├── migrate.ts
│   └── test-parsers.ts
│
├── public/                           # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── .github/                          # GitHub configuration
│   └── workflows/
│       ├── ci.yml
│       ├── deploy.yml
│       └── test.yml
│
├── docker/                           # Docker configuration
│   ├── Dockerfile
│   └── docker-compose.yml
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── vitest.config.ts
├── playwright.config.ts
├── .env.example
├── .gitignore
└── README.md
```

---

## 8. Security Considerations

### 8.1 File Upload Security

1. **File Validation**
   - Client-side: MIME type, extension, size checks
   - Server-side: Magic number verification, content inspection
   - Virus scanning (ClamAV integration for production)

2. **File Storage**
   - Isolated storage directory (no code execution)
   - Unique filename generation (UUID-based)
   - Automatic cleanup of old files
   - Access control (user-owned files only)

3. **Size Limits**
   - Maximum file size: 50MB
   - Rate limiting: 10 uploads per hour per user
   - Disk quota per user: 500MB

### 8.2 Authentication & Authorization

1. **Authentication**
   - NextAuth.js with secure session handling
   - Password hashing: bcrypt (cost factor 12)
   - JWT tokens (short-lived: 15 minutes)
   - Refresh tokens (long-lived: 30 days)

2. **Authorization**
   - Role-based access control (RBAC)
   - Resource ownership validation
   - API endpoint protection
   - Row-level security (PostgreSQL RLS)

3. **Session Management**
   - Secure cookie settings (httpOnly, secure, sameSite)
   - Session timeout: 24 hours
   - Concurrent session limit: 3 devices

### 8.3 Data Protection

1. **Data Encryption**
   - In transit: TLS 1.3 (HTTPS everywhere)
   - At rest: Database encryption (PostgreSQL pgcrypto)
   - File encryption for sensitive data

2. **Privacy**
   - GDPR compliance
   - Data anonymization for analytics
   - User data deletion (right to be forgotten)
   - Privacy-by-design architecture

3. **Input Validation**
   - Zod schema validation
   - SQL injection prevention (prepared statements)
   - XSS prevention (Content Security Policy)
   - CSRF protection (NextAuth built-in)

### 8.4 API Security

1. **Rate Limiting**
   - General API: 100 requests/minute
   - Upload endpoint: 10 requests/hour
   - Auth endpoints: 5 requests/minute

2. **CORS Policy**
   - Whitelist approved origins
   - Credentials required for cross-origin

3. **API Keys**
   - Environment variables (never in code)
   - Rotation policy: 90 days
   - Audit logging for key usage

---

## 9. Deployment Strategy

### 9.1 Environments

| Environment | Purpose | URL Pattern | Database |
|-------------|---------|-------------|----------|
| **Development** | Local development | localhost:3000 | SQLite |
| **Staging** | Pre-production testing | staging.5kdecoded.app | PostgreSQL (RDS) |
| **Production** | Live application | 5kdecoded.app | PostgreSQL (RDS) |

### 9.2 Deployment Pipeline

```
┌──────────────┐
│ Git Push to  │
│    main      │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   GitHub     │
│   Actions    │
└──────┬───────┘
       │
       ├── 1. Lint & Type Check
       ├── 2. Unit Tests
       ├── 3. Integration Tests
       ├── 4. Build Application
       └── 5. E2E Tests
       │
       ↓
┌──────────────┐
│   Deploy to  │
│   Staging    │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  Smoke Tests │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Manual     │
│   Approval   │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│   Deploy to  │
│  Production  │
└──────────────┘
```

### 9.3 Infrastructure

#### Vercel Deployment (Recommended)
```javascript
// vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1"], // US East
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_API_URL": "https://5kdecoded.app"
    }
  }
}
```

#### Alternative: AWS Deployment
- **Compute**: ECS with Fargate (containerized Next.js)
- **Database**: RDS PostgreSQL (Multi-AZ)
- **Storage**: S3 for file storage
- **CDN**: CloudFront for static assets
- **DNS**: Route 53
- **Monitoring**: CloudWatch

### 9.4 Database Migrations

```bash
# Development
npm run db:migrate

# Production (zero-downtime)
1. Create new column/table with backward compatibility
2. Deploy application with dual-write logic
3. Backfill data
4. Switch read logic to new schema
5. Remove old schema (next deployment)
```

### 9.5 Monitoring & Observability

1. **Application Monitoring**
   - Vercel Analytics (performance)
   - Sentry (error tracking)
   - Custom metrics dashboard

2. **Logging**
   - Structured JSON logs
   - Log levels: ERROR, WARN, INFO, DEBUG
   - Log retention: 30 days

3. **Alerting**
   - Error rate > 1% → PagerDuty
   - API latency p95 > 1s → Slack
   - Disk usage > 80% → Email

---

## 10. Performance Requirements

### 10.1 Response Time Targets

| Operation | Target | Acceptable | Priority |
|-----------|--------|------------|----------|
| Page Load (FCP) | < 1.5s | < 2.5s | Critical |
| File Upload | < 3s | < 5s | High |
| File Parsing (5K) | < 2s | < 4s | High |
| Metrics Calculation | < 3s | < 5s | High |
| API Response (p95) | < 500ms | < 1s | High |
| Dashboard Load | < 2s | < 3s | Medium |
| Chart Rendering | < 500ms | < 1s | Medium |

### 10.2 Optimization Strategies

1. **Frontend Optimization**
   - Code splitting (Next.js automatic)
   - Image optimization (next/image)
   - Lazy loading for charts
   - Service worker caching (PWA)
   - Bundle size < 200KB (initial)

2. **Backend Optimization**
   - Database indexing (activity queries)
   - Query optimization (N+1 prevention)
   - Caching strategy (Redis)
   - Batch processing for analysis
   - Worker threads for CPU-intensive tasks

3. **Caching Strategy**
   ```typescript
   // Cache layers
   1. Browser cache (static assets): 1 year
   2. CDN cache (API responses): 5 minutes
   3. Application cache (Redis): 1 hour
   4. Database query cache: 5 minutes
   ```

4. **File Processing**
   - Stream processing for large files
   - Web Workers for parsing (future)
   - Progressive results display
   - Background job queue (optional)

---

## 11. Future Extensibility

### 11.1 Phase 2 Features

1. **Social Features**
   - Share activities with friends
   - Leaderboards and challenges
   - Training groups
   - Activity comments

2. **Advanced Analytics**
   - Multi-sport support (cycling, swimming)
   - Training load optimization
   - Injury risk prediction
   - Weather impact analysis

3. **Mobile Apps**
   - React Native apps (iOS/Android)
   - Watch app integration
   - Real-time sync with Garmin

4. **AI/ML Enhancements**
   - TensorFlow.js models
   - Personalized coaching
   - Adaptive training plans
   - Anomaly detection improvements

### 11.2 Integration Points

1. **Third-Party Integrations**
   - Strava API (import/export)
   - Garmin Connect API
   - TrainingPeaks API
   - Apple Health
   - Google Fit

2. **Webhook System**
   - Activity uploaded event
   - Analysis completed event
   - Goal achieved event
   - Recommendation triggered event

### 11.3 Plugin Architecture

```typescript
// Plugin interface for extensibility
interface AnalysisPlugin {
  name: string;
  version: string;
  analyze(data: ActivityData, context: AnalysisContext): PluginResult;
}

// Example: Stride analysis plugin
class StrideAnalysisPlugin implements AnalysisPlugin {
  name = 'stride-analysis';
  version = '1.0.0';

  analyze(data: ActivityData, context: AnalysisContext): PluginResult {
    // Custom stride pattern analysis
    return {
      insights: [...],
      metrics: {...}
    };
  }
}
```

### 11.4 API Versioning

```typescript
// API versioning strategy
/api/v1/activities  // Current
/api/v2/activities  // Future (breaking changes)

// Header-based versioning (alternative)
Accept: application/vnd.5kdecoded.v1+json
```

---

## 12. Architecture Decision Records (ADRs)

### ADR-001: Next.js as Full-Stack Framework

**Status**: Accepted
**Date**: 2025-11-06

**Context**: Need to choose between separate frontend/backend or full-stack framework.

**Decision**: Use Next.js 14+ with App Router as full-stack framework.

**Rationale**:
- Single codebase reduces complexity
- API routes integrate seamlessly
- Built-in optimizations (code splitting, image optimization)
- Vercel deployment is straightforward
- TypeScript full-stack consistency
- Server-side rendering for SEO

**Consequences**:
- Slightly less flexible than microservices
- Vendor lock-in to React ecosystem
- Learning curve for App Router

---

### ADR-002: PostgreSQL as Primary Database

**Status**: Accepted
**Date**: 2025-11-06

**Context**: Need to choose between SQL and NoSQL databases.

**Decision**: Use PostgreSQL with SQLite for development.

**Rationale**:
- Relational data model fits activity/user structure
- JSON support for flexible fields (metrics, recommendations)
- Strong ACID guarantees
- Excellent performance for analytics queries
- Wide hosting support
- Free tier available (Vercel Postgres, Supabase)

**Consequences**:
- Schema migrations required for changes
- Slightly more complex than NoSQL for prototyping
- Need to manage database backups

---

### ADR-003: Rule-Based Recommendations (v1)

**Status**: Accepted
**Date**: 2025-11-06

**Context**: Choose between rule-based and ML-based recommendation engine.

**Decision**: Start with rule-based system, plan for ML enhancement.

**Rationale**:
- Faster to implement and iterate
- Transparent and explainable recommendations
- No training data required initially
- Lower complexity and maintenance
- Can collect data for future ML model

**Consequences**:
- Less personalized than ML approach
- Requires domain expertise to define rules
- Manual updates needed for new patterns
- Plan migration path to hybrid system

---

### ADR-004: Recharts + D3.js for Visualization

**Status**: Accepted
**Date**: 2025-11-06

**Context**: Choose charting library for React.

**Decision**: Use Recharts for standard charts, D3.js for custom visualizations.

**Rationale**:
- Recharts: React-native, declarative, covers 80% of use cases
- D3.js: Maximum flexibility for custom visualizations
- Both well-documented and maintained
- Progressive enhancement strategy

**Consequences**:
- Two libraries increase bundle size slightly
- D3 has steeper learning curve
- Need to maintain consistency between chart styles

---

### ADR-005: Zod for Runtime Validation

**Status**: Accepted
**Date**: 2025-11-06

**Context**: Need runtime validation for API inputs and file parsing.

**Decision**: Use Zod for schema validation across frontend and backend.

**Rationale**:
- TypeScript-first design (type inference)
- Single source of truth for validation
- Excellent error messages
- Works with React Hook Form
- Zero dependencies

**Consequences**:
- Adds library dependency
- All schemas need explicit definition
- Performance overhead for large payloads (acceptable)

---

## 13. Glossary

| Term | Definition |
|------|------------|
| **FIT** | Flexible and Interoperable Data Transfer - Garmin's binary file format |
| **TCX** | Training Center XML - XML-based activity file format |
| **GPX** | GPS Exchange Format - XML format for GPS data |
| **VDOT** | VO2 max-based running performance metric (Jack Daniels) |
| **TSS** | Training Stress Score - quantifies training load |
| **Riegel Formula** | Race time prediction algorithm based on distance ratio |
| **HR Zones** | Heart rate training zones (typically 5 zones) |
| **Pace** | Time per distance unit (e.g., minutes per kilometer) |
| **Cadence** | Steps per minute (running) or revolutions per minute (cycling) |
| **Lactate Threshold** | Exercise intensity where lactate accumulation accelerates |

---

## 14. References

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Recharts API](https://recharts.org/en-US/api)
- [fit-file-parser](https://github.com/jimmykane/fit-parser)
- [Jack Daniels' Running Formula](https://www.amazon.com/Daniels-Running-Formula-Jack/dp/1450431836)

### Standards
- [FIT SDK](https://developer.garmin.com/fit/overview/)
- [TCX Schema](https://www8.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd)
- [GPX 1.1 Schema](http://www.topografix.com/GPX/1/1/)

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **Architect** | Claude (Architect Agent) | 2025-11-06 | ✓ |
| **Tech Lead** | _Pending_ | | |
| **Product Owner** | _Pending_ | | |

---

**Document Version**: 1.0
**Last Updated**: 2025-11-06
**Next Review**: 2025-12-06
