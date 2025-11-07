# Quick Start Guide

## Get Running in 5 Minutes

### 1. Install Dependencies
```bash
cd app
npm install
```

### 2. Start the Server
```bash
npm start
```

The application will start at `http://localhost:3000`

### 3. Upload Your Garmin Data

#### Option A: Try Sample Data First
1. Click "Try Sample Data" button
2. Explore the analysis features
3. See example recommendations

#### Option B: Upload Your Own File
1. Export your 5K run from Garmin Connect:
   - Go to your activity
   - Click gear icon → "Export Original"
   - Download FIT file
2. Drag and drop into the upload area
3. Wait a few seconds for analysis

### 4. Understand Your Results

#### Overall Score
Your performance rated 0-100 based on:
- Pacing consistency
- Cadence optimization
- Heart rate effort
- Running form efficiency

#### Key Metrics
- **Time & Pace**: Your performance baseline
- **Heart Rate**: Effort distribution
- **Cadence**: Steps per minute (aim for 170-180)
- **Form Metrics**: Efficiency indicators

#### Training Recommendations
- **Time Goals**: Realistic 1, 3, and 6-month targets
- **Weekly Structure**: Day-by-day workout plan
- **Specific Workouts**: Exact paces for each workout type
- **Form Corrections**: Drills to fix weaknesses

### 5. Common First-Time Findings

#### Low Cadence (Most Common)
- **Problem**: Under 170 steps per minute increases injury risk
- **Solution**: Use metronome app at 175 bpm during runs
- **Timeline**: 3-6 weeks to establish new pattern

#### Positive Split
- **Problem**: Starting too fast, slowing in later laps
- **Solution**: Start 5-10 seconds slower per km
- **Timeline**: Immediate improvement in next race

#### Sub-maximal Heart Rate
- **Problem**: Not pushing hard enough in races
- **Solution**: Practice race-pace efforts in training
- **Timeline**: 2-4 weeks of specific workouts

### 6. Take Action

#### Week 1
- Review all recommendations
- Note top 3 priorities
- Adjust current training

#### Week 2-4
- Implement form corrections
- Practice recommended paces
- Track improvements

#### Month 2-3
- Follow weekly structure
- Build consistency
- Prepare for next 5K

### 7. Development Mode

For development with auto-reload:
```bash
npm run dev
```

### 8. API Usage

Test the API directly:
```bash
# Health check
curl http://localhost:3000/api/health

# Sample data
curl http://localhost:3000/api/sample

# Upload file
curl -X POST -F "file=@your-run.fit" http://localhost:3000/api/analyze
```

## Troubleshooting

### File Upload Fails
- Check file size (max 10MB)
- Verify file extension (.fit, .tcx, .gpx)
- Ensure file isn't corrupted

### Missing Metrics
- Some metrics require specific Garmin devices
- Running dynamics pod needed for advanced form metrics
- Basic metrics (pace, HR, cadence) always available

### Port Already in Use
```bash
# Use different port
PORT=3001 npm start
```

## Next Steps

1. **Analyze regularly**: Upload after each 5K effort
2. **Track progress**: Compare scores over time
3. **Follow plan**: Stick to recommended structure
4. **Race smart**: Use pacing strategy recommendations
5. **Be patient**: Real improvements take 4-12 weeks

## Need Help?

- Check README.md for detailed documentation
- Review sports science foundation section
- Consult with a running coach for personalized guidance

---

Happy running! 🏃
