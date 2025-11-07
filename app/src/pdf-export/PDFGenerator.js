/**
 * PDF Generator for Dynastride.com 5K Performance Analysis
 * Generates professional PDF reports with branding, charts, and recommendations
 */

export class PDFGenerator {
  constructor() {
    // Dynastride.com brand colors
    this.colors = {
      primary: '#667eea',      // Purple-blue
      secondary: '#764ba2',    // Deep purple
      accent: '#00c9ff',       // Light blue
      success: '#10b981',      // Green
      warning: '#f59e0b',      // Orange
      danger: '#ef4444',       // Red
      text: '#1f2937',         // Dark gray
      textLight: '#6b7280',    // Medium gray
      background: '#f9fafb'    // Light background
    };

    // Anthony Mallory credentials
    this.coachInfo = {
      name: 'Anthony Mallory',
      credentials: 'USATF Level 1 Certified Coach',
      location: 'Folsom, CA',
      website: 'Dynastride.com'
    };
  }

  /**
   * Generate complete PDF report
   * @param {Object} analysisData - Full analysis data from backend
   * @param {Object} options - PDF generation options
   * @returns {Promise<Blob>} PDF blob
   */
  async generatePDF(analysisData, options = {}) {
    const { jsPDF } = window.jspdf;

    // Create PDF in portrait mode, A4 size
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set PDF metadata
    pdf.setProperties({
      title: '5K Performance Analysis Report - Dynastride.com',
      subject: '5K Running Performance Analysis and Training Recommendations',
      author: `${this.coachInfo.name}, ${this.coachInfo.credentials}`,
      keywords: '5K, running, performance analysis, training, Dynastride',
      creator: 'Dynastride.com Analysis Platform'
    });

    // Generate pages
    let currentPage = 1;

    // Page 1: Cover
    this.addCoverPage(pdf, analysisData);

    // Page 2: Executive Summary
    pdf.addPage();
    currentPage++;
    this.addExecutiveSummary(pdf, analysisData, currentPage);

    // Page 3-4: Detailed Analysis
    pdf.addPage();
    currentPage++;
    await this.addDetailedAnalysis(pdf, analysisData, currentPage);

    pdf.addPage();
    currentPage++;
    await this.addDetailedAnalysisPage2(pdf, analysisData, currentPage);

    // Page 5-6: Training Recommendations
    pdf.addPage();
    currentPage++;
    this.addTrainingRecommendations(pdf, analysisData, currentPage);

    pdf.addPage();
    currentPage++;
    this.addWeeklyTrainingPlan(pdf, analysisData, currentPage);

    // Page 7: Appendix
    pdf.addPage();
    currentPage++;
    this.addAppendix(pdf, currentPage);

    return pdf;
  }

  /**
   * Add cover page
   */
  addCoverPage(pdf, data) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Gradient background effect (simulated with rectangles)
    pdf.setFillColor(102, 126, 234); // Primary blue
    pdf.rect(0, 0, pageWidth, pageHeight / 2, 'F');
    pdf.setFillColor(118, 75, 162); // Deep purple
    pdf.rect(0, pageHeight / 2, pageWidth, pageHeight / 2, 'F');

    // White content box
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(20, 40, pageWidth - 40, pageHeight - 80, 5, 5, 'F');

    // Logo area (text-based)
    pdf.setFontSize(28);
    pdf.setTextColor(102, 126, 234);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DYNASTRIDE.COM', pageWidth / 2, 70, { align: 'center' });

    // Title
    pdf.setFontSize(24);
    pdf.setTextColor(31, 41, 55);
    pdf.text('5K Performance', pageWidth / 2, 95, { align: 'center' });
    pdf.text('Analysis Report', pageWidth / 2, 105, { align: 'center' });

    // Decorative line
    pdf.setDrawColor(102, 126, 234);
    pdf.setLineWidth(1);
    pdf.line(60, 115, pageWidth - 60, 115);

    // Runner info
    pdf.setFontSize(14);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'normal');

    const raceDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    pdf.text(`Race Date: ${raceDate}`, pageWidth / 2, 135, { align: 'center' });
    pdf.text(`Finish Time: ${this.formatTime(data.metrics.totalTime)}`, pageWidth / 2, 145, { align: 'center' });
    pdf.text(`Distance: ${data.metrics.totalDistance.toFixed(2)} km`, pageWidth / 2, 155, { align: 'center' });

    // Coach credentials
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(102, 126, 234);
    pdf.text('Certified Coach Analysis', pageWidth / 2, 180, { align: 'center' });

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(31, 41, 55);
    pdf.text(this.coachInfo.name, pageWidth / 2, 190, { align: 'center' });
    pdf.text(this.coachInfo.credentials, pageWidth / 2, 197, { align: 'center' });
    pdf.text(this.coachInfo.location, pageWidth / 2, 204, { align: 'center' });

    // Generated date
    pdf.setFontSize(10);
    pdf.setTextColor(107, 114, 128);
    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    pdf.text(`Report Generated: ${generatedDate}`, pageWidth / 2, 240, { align: 'center' });

    // Footer
    pdf.setFontSize(10);
    pdf.setTextColor(102, 126, 234);
    pdf.text('www.dynastride.com', pageWidth / 2, 270, { align: 'center' });
  }

  /**
   * Add executive summary page
   */
  addExecutiveSummary(pdf, data, pageNum) {
    this.addHeader(pdf, 'Executive Summary', pageNum);

    let yPos = 45;

    // Performance score card
    pdf.setFillColor(249, 250, 251);
    pdf.roundedRect(20, yPos, 170, 35, 3, 3, 'F');

    pdf.setFontSize(14);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Overall Performance Score', 25, yPos + 10);

    pdf.setFontSize(36);
    pdf.setTextColor(102, 126, 234);
    pdf.text(`${data.analysis.overallScore}`, 105, yPos + 25, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text('/100', 120, yPos + 25);

    pdf.setFontSize(12);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'normal');
    pdf.text(this.getPerformanceRating(data.analysis.overallScore), 105, yPos + 32, { align: 'center' });

    yPos += 45;

    // Key metrics table
    pdf.setFontSize(14);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Key Metrics', 20, yPos);
    yPos += 8;

    const metrics = [
      ['Time', this.formatTime(data.metrics.totalTime)],
      ['Average Pace', this.formatPace(data.metrics.avgPace)],
      ['Average Heart Rate', `${Math.round(data.metrics.avgHeartRate)} bpm`],
      ['Cadence', `${Math.round(data.metrics.avgCadence)} steps/min`],
      ['Distance', `${data.metrics.totalDistance.toFixed(2)} km`],
      ['Calories Burned', `${data.metrics.totalCalories} kcal`]
    ];

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');

    metrics.forEach((metric, index) => {
      const isEven = index % 2 === 0;
      if (isEven) {
        pdf.setFillColor(249, 250, 251);
        pdf.rect(20, yPos, 170, 8, 'F');
      }

      pdf.setTextColor(31, 41, 55);
      pdf.text(metric[0], 25, yPos + 6);
      pdf.setFont('helvetica', 'bold');
      pdf.text(metric[1], 185, yPos + 6, { align: 'right' });
      pdf.setFont('helvetica', 'normal');

      yPos += 8;
    });

    yPos += 10;

    // Top 3 insights
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Top Insights', 20, yPos);
    yPos += 8;

    const topInsights = this.getTopInsights(data.analysis);

    topInsights.forEach((insight, index) => {
      const icon = insight.type === 'strength' ? '✓' : insight.type === 'weakness' ? '!' : '•';
      const color = insight.type === 'strength' ? [16, 185, 129] :
                    insight.type === 'weakness' ? [239, 68, 68] : [107, 114, 128];

      pdf.setFillColor(...color);
      pdf.circle(25, yPos + 2, 2, 'F');

      pdf.setFontSize(11);
      pdf.setTextColor(31, 41, 55);
      pdf.setFont('helvetica', 'normal');

      const lines = pdf.splitTextToSize(insight.message, 155);
      pdf.text(lines, 30, yPos + 3);

      yPos += (lines.length * 5) + 8;
    });

    yPos += 5;

    // Goal preview
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Realistic Goal', 20, yPos);
    yPos += 8;

    const primaryGoal = data.recommendations.timeGoals.goals[1]; // 3-month goal

    pdf.setFillColor(102, 126, 234, 20);
    pdf.roundedRect(20, yPos, 170, 25, 3, 3, 'F');

    pdf.setFontSize(12);
    pdf.setTextColor(31, 41, 55);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${primaryGoal.timeframe.toUpperCase()} TARGET:`, 25, yPos + 8);

    pdf.setFontSize(18);
    pdf.setTextColor(102, 126, 234);
    pdf.text(primaryGoal.targetTime, 25, yPos + 18);

    pdf.setFontSize(11);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${primaryGoal.confidence}% achievable with consistent training`, 185, yPos + 21, { align: 'right' });

    this.addFooter(pdf, pageNum);
  }

  /**
   * Add detailed analysis page 1
   */
  async addDetailedAnalysis(pdf, data, pageNum) {
    this.addHeader(pdf, 'Detailed Analysis', pageNum);

    let yPos = 45;

    // Pace Analysis
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Pace Analysis', 20, yPos);
    yPos += 7;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);

    const paceInfo = [
      `Strategy: ${this.formatStrategy(data.analysis.paceAnalysis.strategy)}`,
      `Consistency: ${data.analysis.paceAnalysis.coefficientOfVariation.toFixed(1)}% variation`,
      `Score: ${data.analysis.paceAnalysis.score}/100`
    ];

    paceInfo.forEach(info => {
      pdf.text(info, 20, yPos);
      yPos += 5;
    });

    yPos += 5;

    // Pace chart placeholder
    pdf.setFillColor(249, 250, 251);
    pdf.roundedRect(20, yPos, 170, 50, 3, 3, 'F');
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(10);
    pdf.text('[Pace Chart - Generated from lap data]', 105, yPos + 25, { align: 'center' });

    yPos += 60;

    // Heart Rate Analysis
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Heart Rate Analysis', 20, yPos);
    yPos += 7;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);

    const hrInfo = [
      `Average: ${Math.round(data.metrics.avgHeartRate)} bpm (${data.analysis.heartRateAnalysis.avgHRPercent}% of max)`,
      `Max: ${Math.round(data.metrics.maxHeartRate)} bpm`,
      `Effort Level: ${this.getEffortLevel(data.analysis.heartRateAnalysis.avgHRPercent)}`,
      `Score: ${data.analysis.heartRateAnalysis.score}/100`
    ];

    hrInfo.forEach(info => {
      pdf.text(info, 20, yPos);
      yPos += 5;
    });

    yPos += 5;

    // Heart rate chart placeholder
    pdf.setFillColor(249, 250, 251);
    pdf.roundedRect(20, yPos, 170, 50, 3, 3, 'F');
    pdf.setTextColor(107, 114, 128);
    pdf.setFontSize(10);
    pdf.text('[Heart Rate Chart - Generated from lap data]', 105, yPos + 25, { align: 'center' });

    this.addFooter(pdf, pageNum);
  }

  /**
   * Add detailed analysis page 2
   */
  async addDetailedAnalysisPage2(pdf, data, pageNum) {
    this.addHeader(pdf, 'Detailed Analysis (continued)', pageNum);

    let yPos = 45;

    // Cadence Analysis
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Cadence Analysis', 20, yPos);
    yPos += 7;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);

    const cadenceInfo = [
      `Average: ${Math.round(data.metrics.avgCadence)} steps per minute`,
      `Status: ${this.getCadenceStatus(data.metrics.avgCadence)}`,
      `Optimal Range: 170-180 spm`,
      `Score: ${data.analysis.cadenceAnalysis.score}/100`
    ];

    cadenceInfo.forEach(info => {
      pdf.text(info, 20, yPos);
      yPos += 5;
    });

    yPos += 10;

    // Form Metrics
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Running Form Metrics', 20, yPos);
    yPos += 7;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    if (data.metrics.verticalOscillation > 0) {
      const formMetrics = [
        ['Vertical Oscillation', `${data.metrics.verticalOscillation.toFixed(1)} cm`, data.metrics.verticalOscillation <= 8.0 ? '✓' : '!'],
        ['Ground Contact Time', `${data.metrics.groundContactTime} ms`, data.metrics.groundContactTime <= 220 ? '✓' : '!'],
        ['Stride Length', `${data.metrics.avgStrideLength.toFixed(2)} m`, data.metrics.avgStrideLength >= 1.2 && data.metrics.avgStrideLength <= 1.4 ? '✓' : '!']
      ];

      formMetrics.forEach(metric => {
        const icon = metric[2];
        const color = icon === '✓' ? [16, 185, 129] : [239, 68, 68];

        pdf.setFillColor(...color);
        pdf.circle(23, yPos + 2, 2, 'F');

        pdf.setTextColor(31, 41, 55);
        pdf.text(metric[0], 27, yPos + 3);
        pdf.text(metric[1], 185, yPos + 3, { align: 'right' });

        yPos += 7;
      });
    } else {
      pdf.setTextColor(107, 114, 128);
      pdf.text('No advanced form metrics available in this recording.', 20, yPos);
      yPos += 5;
      pdf.text('Consider using a running dynamics pod for detailed form analysis.', 20, yPos);
      yPos += 7;
    }

    yPos += 10;

    // Split Comparison
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Split Comparison', 20, yPos);
    yPos += 7;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    if (data.metrics.laps && data.metrics.laps.length > 0) {
      const firstKm = data.metrics.laps[0];
      const lastKm = data.metrics.laps[data.metrics.laps.length - 1];

      const splits = [
        ['First Kilometer', this.formatPace(firstKm.pace)],
        ['Final Kilometer', this.formatPace(lastKm.pace)],
        ['Difference', this.formatPaceDifference(lastKm.pace - firstKm.pace)]
      ];

      splits.forEach((split, index) => {
        if (index % 2 === 0) {
          pdf.setFillColor(249, 250, 251);
          pdf.rect(20, yPos - 3, 170, 7, 'F');
        }

        pdf.setTextColor(31, 41, 55);
        pdf.text(split[0], 25, yPos);
        pdf.setFont('helvetica', 'bold');
        pdf.text(split[1], 185, yPos, { align: 'right' });
        pdf.setFont('helvetica', 'normal');

        yPos += 7;
      });
    }

    this.addFooter(pdf, pageNum);
  }

  /**
   * Add training recommendations page
   */
  addTrainingRecommendations(pdf, data, pageNum) {
    this.addHeader(pdf, 'Training Recommendations', pageNum);

    let yPos = 45;

    // Training phase
    pdf.setFillColor(102, 126, 234, 20);
    pdf.roundedRect(20, yPos, 170, 18, 3, 3, 'F');

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Current Phase:', 25, yPos + 7);
    pdf.setTextColor(102, 126, 234);
    pdf.text(data.recommendations.trainingPlan.phase, 25, yPos + 14);

    yPos += 25;

    // Training priorities
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Training Priorities', 20, yPos);
    yPos += 8;

    const priorities = data.recommendations.trainingPlan.priorities.slice(0, 3);

    priorities.forEach((priority, index) => {
      pdf.setFillColor(249, 250, 251);
      pdf.roundedRect(20, yPos, 170, 35, 3, 3, 'F');

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(102, 126, 234);
      pdf.text(`${index + 1}. ${priority.focus}`, 25, yPos + 7);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      const lines = pdf.splitTextToSize(priority.rationale, 160);
      pdf.text(lines, 25, yPos + 13);

      pdf.setFontSize(8);
      pdf.setTextColor(16, 185, 129);
      pdf.text(`${priority.confidence}% confidence`, 185, yPos + 32, { align: 'right' });

      yPos += 40;
    });

    yPos += 5;

    // Specific workouts
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Key Workout Types', 20, yPos);
    yPos += 8;

    const workouts = [
      {
        type: 'Tempo Runs',
        pace: data.recommendations.specificWorkouts.tempo.targetPace,
        purpose: 'Build lactate threshold'
      },
      {
        type: 'Intervals',
        pace: data.recommendations.specificWorkouts.intervals.targetPace,
        purpose: 'Develop VO2 max and speed'
      },
      {
        type: 'Long Runs',
        pace: data.recommendations.specificWorkouts.long.targetPace,
        purpose: 'Build aerobic endurance'
      }
    ];

    workouts.forEach(workout => {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text(workout.type, 25, yPos);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(102, 126, 234);
      pdf.text(workout.pace, 185, yPos, { align: 'right' });

      pdf.setFontSize(9);
      pdf.setTextColor(107, 114, 128);
      pdf.text(workout.purpose, 25, yPos + 5);

      yPos += 12;
    });

    this.addFooter(pdf, pageNum);
  }

  /**
   * Add weekly training plan page
   */
  addWeeklyTrainingPlan(pdf, data, pageNum) {
    this.addHeader(pdf, 'Weekly Training Structure', pageNum);

    let yPos = 45;

    // Weekly mileage
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Recommended Weekly Volume:', 20, yPos);
    pdf.setTextColor(102, 126, 234);
    pdf.text(data.recommendations.weeklyStructure.weeklyMileage, 185, yPos, { align: 'right' });

    yPos += 10;

    // Weekly structure
    const weeklyPlan = data.recommendations.weeklyStructure.structure;

    weeklyPlan.forEach((day, index) => {
      const isWorkoutDay = day.workout !== 'Rest' && day.workout !== 'Rest or cross-training';

      // Day header
      if (isWorkoutDay) {
        pdf.setFillColor(102, 126, 234, 10);
      } else {
        pdf.setFillColor(249, 250, 251);
      }
      pdf.roundedRect(20, yPos, 170, 6, 2, 2, 'F');

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text(day.day, 25, yPos + 4);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(isWorkoutDay ? this.hexToRgb(this.colors.primary) : [107, 114, 128]);
      pdf.text(day.workout, 50, yPos + 4);

      yPos += 8;

      // Workout details
      if (day.duration) {
        pdf.setFontSize(9);
        pdf.setTextColor(107, 114, 128);
        pdf.text(`Duration: ${day.duration}`, 25, yPos);

        if (day.pace) {
          pdf.text(`Pace: ${day.pace}`, 100, yPos);
        }

        yPos += 5;
      }

      yPos += 3;
    });

    yPos += 10;

    // Recovery guidance
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Recovery & Nutrition', 20, yPos);
    yPos += 8;

    const recovery = data.recommendations.recoveryGuidance;

    const recoveryItems = [
      { label: 'Sleep', value: recovery.sleepTarget, icon: '😴' },
      { label: 'Hydration', value: recovery.hydrationTarget, icon: '💧' },
      { label: 'Post-Run Nutrition', value: recovery.nutritionGuideline, icon: '🥗' }
    ];

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');

    recoveryItems.forEach(item => {
      pdf.setTextColor(31, 41, 55);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${item.label}:`, 25, yPos);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(107, 114, 128);
      const lines = pdf.splitTextToSize(item.value, 140);
      pdf.text(lines, 70, yPos);

      yPos += (lines.length * 4.5) + 3;
    });

    this.addFooter(pdf, pageNum);
  }

  /**
   * Add appendix page
   */
  addAppendix(pdf, pageNum) {
    this.addHeader(pdf, 'Appendix', pageNum);

    let yPos = 45;

    // Methodology
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Analysis Methodology', 20, yPos);
    yPos += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);

    const methodology = [
      'This analysis is based on established sports science research and coaching best practices.',
      'Performance scores are calculated using weighted metrics including pace consistency,',
      'heart rate zones, cadence, and running form mechanics.',
      '',
      'Training recommendations are personalized based on your current fitness level and',
      'follow evidence-based periodization principles for optimal adaptation.'
    ];

    methodology.forEach(line => {
      pdf.text(line, 20, yPos);
      yPos += 5;
    });

    yPos += 10;

    // Confidence scoring
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Confidence Scoring', 20, yPos);
    yPos += 8;

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);

    const confidence = [
      '90-100%: High confidence - Strong evidence from multiple metrics',
      '80-89%: Good confidence - Supported by key performance indicators',
      '70-79%: Moderate confidence - Limited data or conflicting signals',
      'Below 70%: Lower confidence - Requires additional data or testing'
    ];

    confidence.forEach(line => {
      pdf.text(line, 20, yPos);
      yPos += 6;
    });

    yPos += 15;

    // Coach information
    pdf.setFillColor(102, 126, 234, 10);
    pdf.roundedRect(20, yPos, 170, 35, 3, 3, 'F');

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('About Your Coach', 25, yPos + 8);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(107, 114, 128);
    pdf.text(`${this.coachInfo.name}, ${this.coachInfo.credentials}`, 25, yPos + 15);
    pdf.text(`Location: ${this.coachInfo.location}`, 25, yPos + 21);
    pdf.text('Specializing in 5K and distance running performance optimization', 25, yPos + 27);

    yPos += 45;

    // Contact information
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(31, 41, 55);
    pdf.text('Questions or Need More Guidance?', 20, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(102, 126, 234);
    pdf.textWithLink('Visit www.dynastride.com', 20, yPos, { url: 'https://www.dynastride.com' });
    yPos += 7;

    pdf.setFontSize(9);
    pdf.setTextColor(107, 114, 128);
    pdf.text('For personalized coaching and additional race analysis', 20, yPos);

    yPos += 20;

    // Disclaimer
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'italic');
    const disclaimer = pdf.splitTextToSize(
      'This analysis is for educational purposes. Consult with a healthcare professional before starting any new training program. Individual results may vary based on consistency, genetics, and training history.',
      170
    );
    pdf.text(disclaimer, 20, yPos);

    this.addFooter(pdf, pageNum);
  }

  /**
   * Add header to page
   */
  addHeader(pdf, title, pageNum) {
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Header background
    pdf.setFillColor(102, 126, 234, 10);
    pdf.rect(0, 0, pageWidth, 30, 'F');

    // Logo/Brand
    pdf.setFontSize(10);
    pdf.setTextColor(102, 126, 234);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DYNASTRIDE.COM', 20, 15);

    // Title
    pdf.setFontSize(14);
    pdf.setTextColor(31, 41, 55);
    pdf.text(title, 20, 25);

    // Page number
    pdf.setFontSize(9);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Page ${pageNum}`, pageWidth - 20, 25, { align: 'right' });
  }

  /**
   * Add footer to page
   */
  addFooter(pdf, pageNum) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);

    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    pdf.setFont('helvetica', 'normal');
    pdf.text('© 2025 Dynastride.com | 5K Performance Analysis', pageWidth / 2, pageHeight - 10, { align: 'center' });
  }

  /**
   * Helper: Format time
   */
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Helper: Format pace
   */
  formatPace(paceMinPerKm) {
    const minutes = Math.floor(paceMinPerKm);
    const seconds = Math.round((paceMinPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  }

  /**
   * Helper: Format pace difference
   */
  formatPaceDifference(diff) {
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)}s/km`;
  }

  /**
   * Helper: Format strategy
   */
  formatStrategy(strategy) {
    const strategies = {
      'even': 'Even Pace',
      'negative-split': 'Negative Split ✓',
      'positive-split': 'Positive Split'
    };
    return strategies[strategy] || strategy;
  }

  /**
   * Helper: Get performance rating
   */
  getPerformanceRating(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  }

  /**
   * Helper: Get effort level
   */
  getEffortLevel(hrPercent) {
    if (hrPercent >= 90) return 'Maximum Effort';
    if (hrPercent >= 85) return 'Hard Effort (5K appropriate)';
    if (hrPercent >= 80) return 'Moderate-Hard Effort';
    if (hrPercent >= 70) return 'Moderate Effort';
    return 'Easy Effort';
  }

  /**
   * Helper: Get cadence status
   */
  getCadenceStatus(cadence) {
    if (cadence < 160) return 'Too Low - Injury Risk';
    if (cadence < 170) return 'Below Optimal';
    if (cadence <= 180) return 'Optimal Range ✓';
    if (cadence <= 190) return 'Above Optimal';
    return 'Very High';
  }

  /**
   * Helper: Get top insights
   */
  getTopInsights(analysis) {
    const allInsights = [
      ...(analysis.paceAnalysis.insights || []),
      ...(analysis.cadenceAnalysis.insights || []),
      ...(analysis.heartRateAnalysis.insights || []),
      ...(analysis.formAnalysis.insights || []),
      ...(analysis.consistencyAnalysis.insights || [])
    ];

    // Sort by confidence and take top 3
    return allInsights
      .filter(i => i.type !== 'info')
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3);
  }

  /**
   * Helper: Convert hex to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  }
}

export default PDFGenerator;
