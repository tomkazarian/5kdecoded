# Garmin 5K Analyzer

A comprehensive web application for analyzing Garmin 5K running data with personalized training recommendations based on sports science research.

## Features

### 📊 Data Parsing
- **Multi-format support**: FIT, TCX, and GPX files
- **Comprehensive metric extraction**: Pace, heart rate, cadence, stride length, vertical oscillation, ground contact time
- **Lap-by-lap analysis**: Detailed breakdown of performance across each kilometer

### 🔍 Analysis Engine
- **Performance scoring**: 0-100 scale based on multiple factors
- **Pacing analysis**: Identifies even pacing, negative splits, or positive splits
- **Cadence evaluation**: Compares against optimal 170-180 spm range
- **Heart rate zones**: Determines effort levels and race intensity
- **Running form metrics**: Analyzes efficiency indicators
- **Consistency tracking**: Evaluates pace variability

### 🎯 Intelligent Recommendations
- **Realistic time goals**: 1, 3, and 6-month improvement targets based on fitness level
- **Personalized training plans**: Customized for beginner, intermediate, or advanced runners
- **Weekly training structure**: Complete 7-day workout schedules
- **Specific workout paces**: Easy, tempo, threshold, interval, and repetition paces
- **Form corrections**: Targeted drills for identified weaknesses
- **Racing strategy**: Pre-race, race execution, and post-race guidance
- **Recovery guidelines**: Sleep, nutrition, and rest day recommendations

### 📈 Visualizations
- Pace progression charts
- Heart rate tracking
- Lap-by-lap comparisons
- Interactive data exploration

## Installation

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Or start production server:**
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### Upload Your Data

1. **Export from Garmin Connect:**
   - Go to your activity on Garmin Connect
   - Click the gear icon (Settings)
   - Select "Export Original" to download FIT file
   - Or export as TCX/GPX

2. **Upload to Analyzer:**
   - Visit the web application
   - Drag and drop your file or click to browse
   - Or try the sample data to see how it works

### Understanding Your Results

#### Overall Score (0-100)
- **90-100**: Excellent performance with strong fundamentals
- **80-89**: Very good, minor areas for improvement
- **70-79**: Good base with clear improvement opportunities
- **60-69**: Decent performance, focus on key weaknesses
- **Below 60**: Significant room for improvement

#### Key Insights
Color-coded insights based on analysis:
- **Green (Strength)**: Areas you excel in
- **Red (Weakness)**: Priority areas for improvement
- **Yellow (Neutral)**: Observations requiring attention
- **Blue (Info)**: General information

#### Confidence Scores
Each recommendation includes a confidence percentage based on:
- Research evidence strength
- Individual variability factors
- Achievability based on current fitness

### Training Recommendations

#### Time Goals
Realistic improvement targets with:
- Target time and pace
- Expected improvement in seconds
- Timeframe (1, 3, or 6 months)
- Rationale and confidence score

#### Training Plans
Includes:
- Current training phase identification
- Weekly mileage recommendations
- Priority focus areas with specific actions
- Progressive periodization

#### Weekly Structure
Complete 7-day training schedule with:
- Specific workouts for each day
- Target paces for each workout type
- Duration guidelines
- Purpose and rationale

## Technical Architecture

### Parser Layer (`/src/parser/`)
- **FitParser.js**: Native FIT file parsing using fit-file-parser
- **TcxParser.js**: XML-based TCX parsing with xml2js
- **GpxParser.js**: GPS Exchange format parsing
- **index.js**: Universal parser with automatic format detection

### Analysis Layer (`/src/analyzer/`)
- **MetricsAnalyzer.js**: Comprehensive metrics evaluation
  - Pace analysis with variance and strategy detection
  - Cadence assessment against optimal ranges
  - Heart rate zone determination
  - Running form efficiency metrics
  - Consistency evaluation

### Recommendation Engine (`/src/recommender/`)
- **TrainingRecommender.js**: Personalized training generation
  - Fitness level classification
  - Research-backed improvement factors
  - Training pace calculations
  - Workout structure generation
  - Form correction protocols

### Frontend (`/src/frontend/`)
- **index.html**: Responsive single-page application
- **app.js**: Client-side logic and visualization
  - File upload handling
  - Chart.js integration
  - Results rendering

### Server (`/src/index.js`)
- Express.js REST API
- Multer file upload handling
- Error management
- Sample data endpoint

## API Endpoints

### `GET /api/health`
Health check and supported formats

### `POST /api/analyze`
Upload and analyze Garmin file
- **Body**: multipart/form-data with 'file' field
- **Optional**: userProfile JSON (age, gender, fitness level)
- **Returns**: Complete analysis and recommendations

### `GET /api/sample`
Get sample analysis for demo purposes

## Sports Science Foundation

### Cadence Recommendations
- **Optimal range**: 170-180 steps per minute
- **Research basis**: Reduces impact forces and injury risk (Heiderscheit et al., 2011)
- **Individual variation**: ±5 spm acceptable based on height and biomechanics

### Heart Rate Zones
- **Zone 1 (50-60%)**: Recovery and easy aerobic
- **Zone 2 (60-70%)**: Aerobic base building
- **Zone 3 (70-80%)**: Tempo/lactate threshold
- **Zone 4 (80-90%)**: VO2 max development
- **Zone 5 (90-100%)**: Anaerobic capacity

### Improvement Factors
Based on training studies and typical adaptation rates:
- **Beginners**: 20% improvement over 3 months achievable
- **Intermediate**: 10% improvement over 3 months realistic
- **Advanced**: 5% improvement over 3 months with optimal training

### Training Paces
Based on Jack Daniels' Running Formula:
- **Easy**: 25% slower than race pace
- **Marathon**: 15% slower than race pace
- **Tempo**: 5% slower than race pace
- **Threshold**: 2% slower than race pace
- **Interval**: 5% faster than race pace
- **Repetition**: 10% faster than race pace

## Development

### Project Structure
```
app/
├── src/
│   ├── parser/          # File parsing modules
│   ├── analyzer/        # Analysis engine
│   ├── recommender/     # Recommendation system
│   ├── frontend/        # Web interface
│   └── index.js         # Express server
├── tests/               # Test files
├── docs/                # Documentation
├── package.json         # Dependencies
└── README.md           # This file
```

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building
```bash
npm run build
```

## Limitations

1. **File Size**: Maximum 10MB upload size
2. **Format Support**: FIT, TCX, GPX only
3. **5K Focus**: Optimized for 5K distance analysis
4. **Metric Availability**: Some advanced metrics (vertical oscillation, ground contact time) only available with compatible Garmin devices
5. **Recommendations**: Based on general sports science principles; individual needs may vary

## Future Enhancements

- [ ] Multi-distance support (10K, half marathon, marathon)
- [ ] Training plan export to calendar
- [ ] Historical progress tracking
- [ ] Comparison against previous runs
- [ ] Weather and elevation impact analysis
- [ ] Integration with Garmin Connect API
- [ ] Mobile app version
- [ ] Coach dashboard for managing athletes
- [ ] Machine learning for personalized predictions

## Credits

### Research Foundation
- Daniels' Running Formula (Jack Daniels)
- Running mechanics research (Heiderscheit et al.)
- Heart rate zone training (Seiler & Tønnessen)
- Cadence studies (Hobara et al., 2012)

### Technologies
- **Backend**: Node.js, Express.js
- **Parsing**: fit-file-parser, xml2js
- **Frontend**: Vanilla JavaScript, Chart.js
- **File Upload**: Multer

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or contributions, please visit the project repository or contact the development team.

---

**Note**: Always consult with healthcare professionals before starting a new training program. These recommendations are for informational purposes and should not replace personalized coaching or medical advice.
