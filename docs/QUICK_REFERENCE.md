# Results Page Quick Reference

## Key Function Locations

### Main Entry Point
```javascript
// File: /workspaces/5kdecoded/app/src/frontend/app.js
// Line: 399
window.initializeResultsPage = initializeResultsPage;
```

### Chart Rendering Functions
| Function | Line | Purpose | Chart Type |
|----------|------|---------|-----------|
| `renderPerformanceGauge()` | 501 | Overall score display | Doughnut |
| `renderPaceChart()` | 532 | Pace progression | Line |
| `renderHeartRateChart()` | 580 | HR zones | Area |
| `renderCadenceChart()` | 620 | Steps per minute | Line + Annotations |
| `renderElevationChart()` | 682 | Course profile | Area |
| `renderSplitsChart()` | 721 | Km splits | Bar |
| `renderFormGauges()` | 766 | GCT/VO/Stride | Multiple Doughnuts |

### Data Population Functions
| Function | Line | Updates |
|----------|------|---------|
| `updateSummaryMetrics()` | 443 | Time, distance, pace, HR, cadence, elevation, VO2 max |
| `renderInsights()` | 831 | AI insights grid |
| `renderRecommendations()` | 892 | Goals, training focus, weekly plan |

### PDF Export
```javascript
// File: /workspaces/5kdecoded/app/src/frontend/results.html
// Line: 350
async function exportPDF()
```

## HTML Element IDs

### Metric Value Elements
```javascript
'total-time'        // Total race time
'distance'          // Total distance
'avg-pace'          // Average pace
'avg-hr'            // Average heart rate
'max-hr'            // Maximum heart rate
'avg-cadence'       // Average cadence
'elevation-gain'    // Total elevation gain
'elevation-loss'    // Total elevation loss
'vo2max'            // VO2 max value
'vo2max-label'      // VO2 max fitness level
```

### Chart Canvas Elements
```javascript
'gaugeChart'        // Performance gauge
'paceChart'         // Pace line chart
'hrChart'           // Heart rate chart
'cadenceChart'      // Cadence chart
'elevationChart'    // Elevation profile
'splitsChart'       // Split times bar chart
'gctGauge'          // Ground contact time gauge
'voGauge'           // Vertical oscillation gauge
'strideGauge'       // Stride length gauge
```

### Dynamic Content Containers
```javascript
'insights-grid'         // Insights cards container
'goal-time'            // 12-week goal time
'goal-improvement'     // Expected improvement
'focus-list'           // Top 3 training priorities
'recommendations-list' // Detailed recommendations
'week-grid'            // Weekly training plan
```

## Common Tasks

### Adding a New Metric
1. Add HTML element in `results.html`
2. Update `updateSummaryMetrics()` function
3. Add data to analysis response structure

### Adding a New Chart
1. Add canvas element to `results.html`
2. Create render function in `app.js`
3. Call from `initializeResultsPage()`
4. Ensure data exists in `metrics.laps` or `metrics`

### Modifying Chart Appearance
```javascript
// Example: Change pace chart color
borderColor: '#667eea',              // Line color
backgroundColor: 'rgba(102, 126, 234, 0.1)',  // Fill color
```

### Debugging Tips
```javascript
// Check if data loaded
console.log('Analysis data:', globalAnalysisData);

// Check if Chart.js loaded
console.log('Chart.js:', window.Chart);

// Check if element exists
console.log('Element:', document.getElementById('paceChart'));

// Verify lap data
console.log('Laps:', globalAnalysisData?.metrics?.laps);
```

## Data Flow

```
1. Upload File (index.html)
   ↓
2. Server Processes → Returns analysisData
   ↓
3. Store in sessionStorage
   ↓
4. Redirect to results.html
   ↓
5. Load from sessionStorage → globalAnalysisData
   ↓
6. Call initializeResultsPage(globalAnalysisData)
   ↓
7. Render all charts and data
   ↓
8. User clicks "Export PDF"
   ↓
9. Generate PDF from globalAnalysisData
```

## File Structure
```
/workspaces/5kdecoded/app/src/
├── frontend/
│   ├── app.js              # Main logic, chart rendering
│   ├── results.html        # Results page HTML
│   ├── results.css         # Styling
│   └── pdf-integration.js  # PDF helper functions
└── pdf-export/
    └── PDFGenerator.js     # PDF generation class
```

## Testing Commands

### Syntax Check
```bash
cd /workspaces/5kdecoded/app/src/frontend
node -c app.js
```

### Start Dev Server
```bash
cd /workspaces/5kdecoded/app
npm start
```

### Check Dependencies
```bash
cd /workspaces/5kdecoded/app
npm list chart.js jspdf
```

## Common Issues & Fixes

### Charts Not Rendering
```javascript
// Check if Chart.js loaded
if (!window.Chart) {
  console.error('Chart.js not loaded!');
}

// Check if canvas exists
const canvas = document.getElementById('paceChart');
if (!canvas) {
  console.error('Canvas element not found!');
}

// Check if data exists
if (!metrics.laps || metrics.laps.length === 0) {
  console.error('No lap data available!');
}
```

### PDF Export Failing
```javascript
// Check if jsPDF loaded
if (!window.jspdf) {
  console.error('jsPDF not loaded!');
}

// Check if data exists
if (!globalAnalysisData) {
  console.error('No analysis data for PDF export!');
}
```

### Missing Metrics
```javascript
// Add null checks
const totalTime = metrics?.totalTime || 0;
const avgPace = metrics?.avgPace || 0;

// Update element only if it exists
const el = document.getElementById('total-time');
if (el && totalTime) {
  el.textContent = formatTime(totalTime);
}
```

## Performance Tips

### Chart Optimization
- Use `decimation: true` for large datasets
- Limit animation duration
- Disable animations for print
- Use `maintainAspectRatio: true`

### Data Loading
- Store analysis in sessionStorage
- Clear old data after 1 hour
- Compress large datasets
- Lazy load PDF generator

## Browser DevTools

### Useful Console Commands
```javascript
// Check stored data
JSON.parse(sessionStorage.getItem('analysisResults'))

// Get all charts
Chart.instances

// Destroy a chart
Chart.getChart('paceChart').destroy()

// Get element
$0  // Selected element in Elements tab
```

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all CDN scripts loaded
3. Test with sample data files
4. Review implementation documentation
