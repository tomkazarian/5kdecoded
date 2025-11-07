# Technology Stack Decisions - Quick Reference

## Summary for Development Team

### Frontend Stack
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **Charts**: Recharts (primary) + D3.js (custom)
- **State**: React Context + TanStack Query
- **Forms**: React Hook Form + Zod
- **Language**: TypeScript 5+

### Backend Stack
- **Runtime**: Node.js 20 LTS
- **API**: Next.js API Routes
- **File Parsers**:
  - FIT: `fit-file-parser`
  - TCX/GPX: `fast-xml-parser`
- **Database**: PostgreSQL (production), SQLite (dev)
- **Auth**: NextAuth.js v5
- **Validation**: Zod

### Key Libraries
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "recharts": "^2.10.0",
    "d3": "^7.8.0",
    "fit-file-parser": "^2.0.0",
    "fast-xml-parser": "^4.3.0",
    "next-auth": "^5.0.0",
    "zod": "^3.22.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.48.0",
    "react-dropzone": "^14.2.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "playwright": "^1.40.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0"
  }
}
```

### Development Tools
- **Testing**: Vitest (unit) + Playwright (E2E)
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel (recommended) or AWS ECS
- **Monitoring**: Vercel Analytics + Sentry
- **Logging**: Winston + Pino

## Quick Start Commands
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build production
npm run build

# Run tests
npm run test

# Type check
npm run typecheck

# Lint
npm run lint
```

## Architecture Highlights

### 1. File Processing Pipeline
```
Upload → Validate → Parse (FIT/TCX/GPX) → Unified Model → Analyze → Store
```

### 2. Core Modules
- **Parsers**: `/src/lib/parsers/` - Handle FIT/TCX/GPX files
- **Analysis**: `/src/lib/analysis/` - Calculate metrics
- **Recommendations**: `/src/lib/recommendations/` - Generate insights
- **Forecasting**: `/src/lib/forecasting/` - Predict performance

### 3. API Endpoints
- `POST /api/upload` - Upload activity file
- `GET /api/activities/:id` - Get activity details
- `GET /api/activities/:id/metrics` - Get calculated metrics
- `GET /api/activities/:id/recommendations` - Get recommendations
- `GET /api/activities/:id/forecast` - Get performance forecast

### 4. Data Flow
1. User uploads file (FIT/TCX/GPX)
2. File validated and stored
3. Parser extracts raw data
4. Data normalized to unified model
5. Metrics calculated (pace, HR zones, splits)
6. Recommendations generated with confidence scores
7. Forecast computed (5K time prediction)
8. Results visualized in dashboard

### 5. Key Algorithms
- **Pace Calculation**: Smoothed averaging
- **HR Zones**: 5-zone model based on max HR
- **VO2 Max**: Jack Daniels formula
- **5K Prediction**: Riegel formula + VDOT
- **Confidence Scoring**: Multi-factor weighted model

## File Organization
```
app/
  ├── (auth)/          # Authentication routes
  ├── (dashboard)/     # Protected dashboard
  ├── api/             # API routes
  └── layout.tsx       # Root layout

src/
  ├── components/      # React components
  ├── lib/             # Core business logic
  ├── types/           # TypeScript types
  ├── hooks/           # Custom hooks
  └── config/          # Configuration

tests/
  ├── unit/            # Unit tests
  ├── integration/     # Integration tests
  └── e2e/             # End-to-end tests
```

## Security Checklist
- [ ] File validation (MIME type, magic numbers)
- [ ] Size limits (50MB max)
- [ ] Rate limiting (10 uploads/hour)
- [ ] Authentication (NextAuth.js)
- [ ] Input validation (Zod schemas)
- [ ] HTTPS everywhere (TLS 1.3)
- [ ] CSRF protection (built-in)
- [ ] SQL injection prevention (prepared statements)
- [ ] XSS prevention (CSP headers)

## Performance Targets
- Page Load (FCP): < 1.5s
- File Upload: < 3s
- File Parsing: < 2s
- Metrics Calculation: < 3s
- API Response (p95): < 500ms
- Dashboard Load: < 2s

## Next Steps for Developers
1. Set up Next.js project with TypeScript
2. Install core dependencies (see package.json above)
3. Implement file parsers (start with FIT format)
4. Create unified data model
5. Build metrics calculator
6. Develop API routes
7. Create frontend components
8. Write tests (aim for 80% coverage)
9. Set up CI/CD pipeline
10. Deploy to staging environment

## References
- Full architecture: `/app/docs/architecture.md`
- API reference: `/app/docs/api-reference.md` (TBD)
- User guide: `/app/docs/user-guide.md` (TBD)
