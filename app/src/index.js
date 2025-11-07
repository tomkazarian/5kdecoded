/**
 * Garmin 5K Analyzer - Main Server
 * Express server with file upload and analysis capabilities
 */
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { UniversalParser } from './parser/index.js';
import { MetricsAnalyzer } from './analyzer/MetricsAnalyzer.js';
import { TrainingRecommender } from './recommender/TrainingRecommender.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.fit', '.tcx', '.gpx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Please upload a FIT, TCX, or GPX file.'));
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Initialize services
const parser = new UniversalParser();
const analyzer = new MetricsAnalyzer();
const recommender = new TrainingRecommender();

// Routes

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    supportedFormats: UniversalParser.getSupportedFormats()
  });
});

/**
 * Upload and analyze Garmin file
 */
app.post('/api/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`Processing file: ${req.file.originalname} (${req.file.size} bytes)`);

    // Parse user profile if provided
    const userProfile = req.body.userProfile ? JSON.parse(req.body.userProfile) : {};

    // Parse the file
    const metrics = await parser.parse(req.file.buffer, req.file.originalname);

    // Analyze metrics
    const analysis = analyzer.analyze(metrics, userProfile);

    // Generate recommendations
    const recommendations = recommender.generateRecommendations(metrics, analysis, userProfile);

    // Return complete analysis
    res.json({
      success: true,
      fileName: req.file.originalname,
      uploadedAt: new Date().toISOString(),
      metrics,
      analysis,
      recommendations
    });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Analysis failed'
    });
  }
});

/**
 * Get sample analysis (for demo purposes)
 */
app.get('/api/sample', (req, res) => {
  const sampleMetrics = {
    totalTime: 1800, // 30 minutes
    totalDistance: 5.0,
    avgPace: 6.0, // 6 min/km
    avgHeartRate: 165,
    maxHeartRate: 180,
    avgCadence: 168,
    maxCadence: 178,
    totalCalories: 350,
    avgStrideLength: 1.2,
    verticalOscillation: 9.5,
    groundContactTime: 245,
    trainingEffect: 3.5,
    laps: [
      { lapNumber: 1, distance: 1.0, time: 360, pace: 6.0, heartRate: 155, cadence: 170 },
      { lapNumber: 2, distance: 1.0, time: 360, pace: 6.0, heartRate: 165, cadence: 168 },
      { lapNumber: 3, distance: 1.0, time: 360, pace: 6.0, heartRate: 168, cadence: 167 },
      { lapNumber: 4, distance: 1.0, time: 360, pace: 6.0, heartRate: 170, cadence: 166 },
      { lapNumber: 5, distance: 1.0, time: 360, pace: 6.0, heartRate: 175, cadence: 169 }
    ],
    records: []
  };

  const userProfile = { age: 30, gender: 'male' };

  const analysis = analyzer.analyze(sampleMetrics, userProfile);
  const recommendations = recommender.generateRecommendations(sampleMetrics, analysis, userProfile);

  res.json({
    success: true,
    fileName: 'sample-run.fit',
    uploadedAt: new Date().toISOString(),
    metrics: sampleMetrics,
    analysis,
    recommendations
  });
});

/**
 * Serve frontend
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: `Upload error: ${error.message}`
    });
  }

  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏃 Garmin 5K Analyzer running on http://localhost:${PORT}`);
  console.log(`📊 Upload endpoint: POST http://localhost:${PORT}/api/analyze`);
  console.log(`🔍 Health check: GET http://localhost:${PORT}/api/health`);
  console.log(`📝 Sample data: GET http://localhost:${PORT}/api/sample`);
});

export default app;
