/**
 * Training Recommender
 * Generates personalized training recommendations with confidence scores
 * Based on sports science research and realistic improvement patterns
 */

export class TrainingRecommender {
  constructor() {
    // Research-backed improvement factors
    this.improvementFactors = {
      beginner: { weekly: 0.02, monthly: 0.08, threeMonth: 0.20 }, // Can improve 20% in 3 months
      intermediate: { weekly: 0.01, monthly: 0.04, threeMonth: 0.10 }, // 10% in 3 months
      advanced: { weekly: 0.005, monthly: 0.02, threeMonth: 0.05 } // 5% in 3 months
    };

    // Training intensities based on current pace
    this.trainingPaces = {
      easy: 1.25, // 25% slower than race pace
      marathon: 1.15, // 15% slower
      tempo: 1.05, // 5% slower
      threshold: 1.02, // 2% slower
      interval: 0.95, // 5% faster
      repetition: 0.90 // 10% faster
    };
  }

  /**
   * Generate comprehensive training recommendations
   * @param {Object} metrics - Parsed metrics
   * @param {Object} analysis - Analysis results
   * @param {Object} userProfile - User profile
   * @returns {Object} Recommendations with confidence scores
   */
  generateRecommendations(metrics, analysis, userProfile = {}) {
    const fitnessLevel = this.determineFitnessLevel(metrics, userProfile);
    const currentPaceMinKm = metrics.avgPace;

    const recommendations = {
      summary: this.generateSummary(analysis, fitnessLevel),
      timeGoals: this.generateTimeGoals(metrics, fitnessLevel),
      trainingPlan: this.generateTrainingPlan(metrics, analysis, fitnessLevel),
      weeklyStructure: this.generateWeeklyStructure(metrics, fitnessLevel),
      specificWorkouts: this.generateSpecificWorkouts(currentPaceMinKm, fitnessLevel),
      formCorrections: this.generateFormCorrections(analysis),
      racingStrategy: this.generateRacingStrategy(analysis, metrics),
      recoveryGuidance: this.generateRecoveryGuidance(metrics, analysis),
      equipmentRecommendations: this.generateEquipmentRecommendations(analysis),
      progressionPlan: this.generateProgressionPlan(metrics, fitnessLevel)
    };

    return recommendations;
  }

  /**
   * Determine fitness level from performance and metrics
   */
  determineFitnessLevel(metrics, userProfile) {
    const timeSeconds = metrics.totalTime;
    const avgCadence = metrics.avgCadence;

    // Time-based classification (rough guideline)
    let level = 'intermediate';

    if (timeSeconds < 1200) { // Sub-20 minutes
      level = 'advanced';
    } else if (timeSeconds < 1500) { // 20-25 minutes
      level = 'intermediate';
    } else if (timeSeconds < 1800) { // 25-30 minutes
      level = 'intermediate';
    } else { // Over 30 minutes
      level = 'beginner';
    }

    // Adjust based on form metrics
    if (avgCadence >= 175 && timeSeconds < 1800) {
      // Good form suggests higher level
    } else if (avgCadence < 160) {
      // Poor form suggests need for basics
      level = 'beginner';
    }

    return level;
  }

  /**
   * Generate realistic time goals
   */
  generateTimeGoals(metrics, fitnessLevel) {
    const currentTime = metrics.totalTime;
    const improvements = this.improvementFactors[fitnessLevel];

    const goals = [];

    // 1-month goal
    const oneMonthImprovement = currentTime * improvements.monthly;
    const oneMonthTime = currentTime - oneMonthImprovement;
    goals.push({
      timeframe: '1 month',
      targetTime: this.formatTime(oneMonthTime),
      targetPace: this.formatPace((oneMonthTime / 60) / 5),
      improvementSeconds: Math.round(oneMonthImprovement),
      confidence: this.calculateConfidence(fitnessLevel, 'short'),
      rationale: 'Achievable through consistent training and technique improvements'
    });

    // 3-month goal
    const threeMonthImprovement = currentTime * improvements.threeMonth;
    const threeMonthTime = currentTime - threeMonthImprovement;
    goals.push({
      timeframe: '3 months',
      targetTime: this.formatTime(threeMonthTime),
      targetPace: this.formatPace((threeMonthTime / 60) / 5),
      improvementSeconds: Math.round(threeMonthImprovement),
      confidence: this.calculateConfidence(fitnessLevel, 'medium'),
      rationale: 'Requires dedicated training with periodization and consistent effort'
    });

    // 6-month goal
    const sixMonthImprovement = currentTime * (improvements.threeMonth * 1.5);
    const sixMonthTime = currentTime - sixMonthImprovement;
    goals.push({
      timeframe: '6 months',
      targetTime: this.formatTime(sixMonthTime),
      targetPace: this.formatPace((sixMonthTime / 60) / 5),
      improvementSeconds: Math.round(sixMonthImprovement),
      confidence: this.calculateConfidence(fitnessLevel, 'long'),
      rationale: 'Long-term goal requiring sustained training and potential coaching'
    });

    return {
      currentTime: this.formatTime(currentTime),
      currentPace: this.formatPace(metrics.avgPace),
      fitnessLevel,
      goals
    };
  }

  /**
   * Generate comprehensive training plan
   */
  generateTrainingPlan(metrics, analysis, fitnessLevel) {
    const plan = {
      phase: this.determineTrainingPhase(analysis),
      weeklyMileage: this.recommendWeeklyMileage(metrics, fitnessLevel),
      keyFocus: this.determineKeyFocus(analysis),
      priorities: []
    };

    // Determine priorities based on analysis
    if (analysis.cadenceAnalysis.avgCadence < 170) {
      plan.priorities.push({
        priority: 1,
        focus: 'Cadence improvement',
        rationale: 'Low cadence is the most significant injury risk factor',
        confidence: 96,
        actions: [
          'Practice high-cadence drills 2x per week',
          'Use metronome app during easy runs',
          'Focus on quick, light foot strikes'
        ]
      });
    }

    if (analysis.paceAnalysis.strategy === 'positive-split') {
      plan.priorities.push({
        priority: 2,
        focus: 'Pacing strategy',
        rationale: 'Starting too fast limits performance potential',
        confidence: 91,
        actions: [
          'Practice negative splits in training runs',
          'Start races 5-10 seconds slower per km than goal pace',
          'Use heart rate to guide early race effort'
        ]
      });
    }

    if (analysis.heartRateAnalysis.avgHRPercent < 80) {
      plan.priorities.push({
        priority: 3,
        focus: 'Race effort',
        rationale: 'Not reaching full potential in races',
        confidence: 87,
        actions: [
          'Practice race-pace efforts in training',
          'Work on mental toughness and discomfort tolerance',
          'Develop race-day arousal strategies'
        ]
      });
    }

    if (analysis.formAnalysis.verticalOscillation > 10) {
      plan.priorities.push({
        priority: 4,
        focus: 'Running economy',
        rationale: 'Excessive vertical movement wastes energy',
        confidence: 89,
        actions: [
          'Focus on running "quiet" and light',
          'Practice uphill running for better form',
          'Consider gait analysis from a specialist'
        ]
      });
    }

    return plan;
  }

  /**
   * Generate weekly training structure
   */
  generateWeeklyStructure(metrics, fitnessLevel) {
    const currentPace = metrics.avgPace;
    const paces = this.calculateTrainingPaces(currentPace);

    const structures = {
      beginner: [
        {
          day: 'Monday',
          workout: 'Easy run',
          duration: '30-35 minutes',
          pace: paces.easy,
          purpose: 'Recovery and aerobic base',
          confidence: 95
        },
        {
          day: 'Tuesday',
          workout: 'Tempo run',
          duration: '20 minutes at tempo + warmup/cooldown',
          pace: paces.tempo,
          purpose: 'Lactate threshold development',
          confidence: 92
        },
        {
          day: 'Wednesday',
          workout: 'Rest or cross-training',
          duration: '30 minutes',
          pace: null,
          purpose: 'Recovery',
          confidence: 98
        },
        {
          day: 'Thursday',
          workout: 'Easy run + strides',
          duration: '30 minutes + 4x100m',
          pace: paces.easy,
          purpose: 'Aerobic base + neuromuscular',
          confidence: 94
        },
        {
          day: 'Friday',
          workout: 'Rest',
          duration: null,
          pace: null,
          purpose: 'Recovery',
          confidence: 98
        },
        {
          day: 'Saturday',
          workout: 'Long run',
          duration: '45-60 minutes',
          pace: paces.easy,
          purpose: 'Endurance development',
          confidence: 96
        },
        {
          day: 'Sunday',
          workout: 'Recovery run or rest',
          duration: '25-30 minutes',
          pace: paces.easy,
          purpose: 'Active recovery',
          confidence: 93
        }
      ],
      intermediate: [
        {
          day: 'Monday',
          workout: 'Easy run',
          duration: '40-45 minutes',
          pace: paces.easy,
          purpose: 'Recovery',
          confidence: 95
        },
        {
          day: 'Tuesday',
          workout: 'Intervals',
          duration: '6x800m at 5K pace, 2min rest',
          pace: paces.threshold,
          purpose: 'VO2 max development',
          confidence: 94
        },
        {
          day: 'Wednesday',
          workout: 'Easy run',
          duration: '35-40 minutes',
          pace: paces.easy,
          purpose: 'Recovery between hard days',
          confidence: 96
        },
        {
          day: 'Thursday',
          workout: 'Tempo run',
          duration: '25-30 minutes at tempo',
          pace: paces.tempo,
          purpose: 'Lactate threshold',
          confidence: 93
        },
        {
          day: 'Friday',
          workout: 'Rest or easy 30 minutes',
          duration: '30 minutes',
          pace: paces.easy,
          purpose: 'Recovery',
          confidence: 94
        },
        {
          day: 'Saturday',
          workout: 'Long run',
          duration: '60-75 minutes',
          pace: paces.marathon,
          purpose: 'Aerobic endurance',
          confidence: 97
        },
        {
          day: 'Sunday',
          workout: 'Recovery run',
          duration: '30-35 minutes',
          pace: paces.easy,
          purpose: 'Active recovery',
          confidence: 95
        }
      ],
      advanced: [
        {
          day: 'Monday',
          workout: 'Easy run + drills',
          duration: '45-50 minutes',
          pace: paces.easy,
          purpose: 'Recovery and technique',
          confidence: 96
        },
        {
          day: 'Tuesday',
          workout: 'Track intervals',
          duration: '10-12x400m at 5K pace, 200m jog',
          pace: paces.interval,
          purpose: 'Speed endurance and VO2 max',
          confidence: 95
        },
        {
          day: 'Wednesday',
          workout: 'Easy run',
          duration: '40-45 minutes',
          pace: paces.easy,
          purpose: 'Recovery',
          confidence: 97
        },
        {
          day: 'Thursday',
          workout: 'Threshold run',
          duration: '30-35 minutes at threshold',
          pace: paces.threshold,
          purpose: 'Lactate threshold development',
          confidence: 94
        },
        {
          day: 'Friday',
          workout: 'Easy run',
          duration: '35-40 minutes',
          pace: paces.easy,
          purpose: 'Recovery',
          confidence: 96
        },
        {
          day: 'Saturday',
          workout: 'Long run with tempo finish',
          duration: '75-90 minutes (last 15 at tempo)',
          pace: paces.marathon,
          purpose: 'Endurance + race simulation',
          confidence: 93
        },
        {
          day: 'Sunday',
          workout: 'Recovery run',
          duration: '35-40 minutes',
          pace: paces.easy,
          purpose: 'Active recovery',
          confidence: 95
        }
      ]
    };

    return {
      level: fitnessLevel,
      structure: structures[fitnessLevel],
      weeklyMileage: this.recommendWeeklyMileage(metrics, fitnessLevel),
      notes: this.getWeeklyStructureNotes(fitnessLevel)
    };
  }

  /**
   * Generate specific workout examples
   */
  generateSpecificWorkouts(currentPace, fitnessLevel) {
    const paces = this.calculateTrainingPaces(currentPace);

    return {
      intervals: {
        workout: '6x800m with 2-minute jog recovery',
        targetPace: paces.threshold,
        purpose: 'Develops VO2 max and race pace tolerance',
        confidence: 94,
        notes: 'Should feel comfortably hard, not all-out'
      },
      tempo: {
        workout: '20-30 minutes continuous at tempo pace',
        targetPace: paces.tempo,
        purpose: 'Improves lactate threshold and mental toughness',
        confidence: 96,
        notes: 'Conversational but challenging pace'
      },
      long: {
        workout: '60-90 minutes easy pace',
        targetPace: paces.easy,
        purpose: 'Builds aerobic base and endurance',
        confidence: 97,
        notes: 'Should be able to hold conversation throughout'
      },
      recovery: {
        workout: '30-40 minutes very easy',
        targetPace: this.formatPace(currentPace * 1.35),
        purpose: 'Promotes recovery while maintaining aerobic stimulus',
        confidence: 98,
        notes: 'Slower is better - focus on feeling refreshed'
      },
      strides: {
        workout: '6-8x100m at mile pace with full recovery',
        targetPace: paces.repetition,
        purpose: 'Develops running economy and neuromuscular power',
        confidence: 95,
        notes: 'Smooth acceleration to fast pace, not sprinting'
      }
    };
  }

  /**
   * Generate form correction recommendations
   */
  generateFormCorrections(analysis) {
    const corrections = [];

    if (analysis.cadenceAnalysis.avgCadence < 170) {
      corrections.push({
        issue: 'Low cadence',
        correction: 'Increase turnover to 170-180 steps per minute',
        drills: [
          'High knees: 3x30 seconds',
          'Butt kicks: 3x30 seconds',
          'Quick feet: 3x20 seconds',
          'Metronome runs: Set to 175 bpm and match rhythm'
        ],
        confidence: 96,
        expectedTimeframe: '3-6 weeks for habit formation'
      });
    }

    if (analysis.formAnalysis.verticalOscillation > 10) {
      corrections.push({
        issue: 'Excessive vertical movement',
        correction: 'Reduce bounce by focusing on forward propulsion',
        drills: [
          'Wall drive drills',
          'Uphill running (naturally reduces bounce)',
          'Focus cue: "Run quiet and light"',
          'Video analysis of form'
        ],
        confidence: 88,
        expectedTimeframe: '4-8 weeks'
      });
    }

    if (analysis.formAnalysis.groundContactTime > 250) {
      corrections.push({
        issue: 'Long ground contact time',
        correction: 'Practice quick foot strike and push-off',
        drills: [
          'Jump rope: 3x1 minute',
          'Box jumps: 3x8',
          'Pogo jumps: 3x20',
          'Focus on landing midfoot with quick toe-off'
        ],
        confidence: 85,
        expectedTimeframe: '6-10 weeks'
      });
    }

    return corrections;
  }

  /**
   * Generate racing strategy recommendations
   */
  generateRacingStrategy(analysis, metrics) {
    const strategy = {
      preRace: [],
      racePlan: [],
      postRace: []
    };

    // Pre-race recommendations
    strategy.preRace.push({
      timing: '3-5 days before',
      action: 'Reduce training volume by 40-50%',
      rationale: 'Allows full recovery and glycogen replenishment',
      confidence: 97
    });

    strategy.preRace.push({
      timing: 'Race morning',
      action: 'Easy 10-15 minute warmup + 4x100m strides',
      rationale: 'Prepares cardiovascular system without depleting energy',
      confidence: 95
    });

    // Race plan based on analysis
    if (analysis.paceAnalysis.strategy === 'positive-split') {
      strategy.racePlan.push({
        phase: 'First 2km',
        target: 'Start 3-5 seconds per km slower than goal pace',
        rationale: 'Prevents early depletion based on your tendency to start fast',
        confidence: 92
      });
    } else {
      strategy.racePlan.push({
        phase: 'First 2km',
        target: 'Start at goal pace or 1-2 seconds slower',
        rationale: 'Controlled start allows for strong finish',
        confidence: 94
      });
    }

    strategy.racePlan.push({
      phase: 'Middle 2km',
      target: 'Settle into goal pace, focus on rhythm',
      rationale: 'Maintain steady effort while conserving energy',
      confidence: 96
    });

    strategy.racePlan.push({
      phase: 'Final 1km',
      target: 'Progressively increase effort, sprint final 200m',
      rationale: 'Use remaining energy for strong finish',
      confidence: 93
    });

    // Post-race
    strategy.postRace.push({
      timing: 'Immediately after',
      action: 'Easy 10-15 minute cooldown jog',
      rationale: 'Aids recovery by clearing metabolic waste',
      confidence: 95
    });

    return strategy;
  }

  /**
   * Generate recovery guidance
   */
  generateRecoveryGuidance(metrics, analysis) {
    return {
      sleepTarget: '7-9 hours per night',
      sleepRationale: 'Essential for adaptation and performance gains',
      sleepConfidence: 98,

      nutritionGuideline: 'Carbs within 30 minutes post-workout, protein throughout day',
      nutritionRationale: 'Optimizes glycogen replenishment and muscle repair',
      nutritionConfidence: 96,

      hydrationTarget: '2-3 liters daily, more on training days',
      hydrationRationale: 'Maintains performance and aids recovery',
      hydrationConfidence: 97,

      restDays: fitnessLevel => {
        const days = {
          beginner: '2-3 per week',
          intermediate: '1-2 per week',
          advanced: '1 per week'
        };
        return days[fitnessLevel];
      },
      restRationale: 'Allows physiological adaptation to training stress',
      restConfidence: 99
    };
  }

  /**
   * Generate equipment recommendations
   */
  generateEquipmentRecommendations(analysis) {
    const recommendations = [];

    if (analysis.cadenceAnalysis.avgCadence < 170) {
      recommendations.push({
        item: 'Metronome app',
        purpose: 'Help maintain optimal cadence',
        priority: 'high',
        confidence: 94
      });
    }

    if (!analysis.formAnalysis.verticalOscillation) {
      recommendations.push({
        item: 'Running dynamics pod or compatible watch',
        purpose: 'Track form metrics for continuous improvement',
        priority: 'medium',
        confidence: 87
      });
    }

    recommendations.push({
      item: 'Heart rate monitor',
      purpose: 'Train at correct intensities',
      priority: 'medium',
      confidence: 91
    });

    return recommendations;
  }

  /**
   * Generate long-term progression plan
   */
  generateProgressionPlan(metrics, fitnessLevel) {
    const currentTime = metrics.totalTime;

    return {
      phase1: {
        weeks: '1-4',
        focus: 'Base building and technique',
        weeklyMileage: this.recommendWeeklyMileage(metrics, fitnessLevel),
        keyWorkouts: ['Easy runs', 'Cadence drills', 'Strides'],
        expectedImprovement: 'Form improvements, less soreness',
        confidence: 96
      },
      phase2: {
        weeks: '5-8',
        focus: 'Threshold development',
        weeklyMileage: this.recommendWeeklyMileage(metrics, fitnessLevel) * 1.1,
        keyWorkouts: ['Tempo runs', 'Long runs', 'Easy runs'],
        expectedImprovement: '2-5% time improvement',
        confidence: 92
      },
      phase3: {
        weeks: '9-12',
        focus: 'Speed and race prep',
        weeklyMileage: this.recommendWeeklyMileage(metrics, fitnessLevel) * 1.15,
        keyWorkouts: ['Intervals', 'Tempo', 'Race simulation'],
        expectedImprovement: '5-10% total improvement from start',
        confidence: 88
      }
    };
  }

  // Helper methods

  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  formatPace(paceMinPerKm) {
    const minutes = Math.floor(paceMinPerKm);
    const seconds = Math.round((paceMinPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  }

  calculateTrainingPaces(currentPace) {
    return {
      easy: this.formatPace(currentPace * this.trainingPaces.easy),
      marathon: this.formatPace(currentPace * this.trainingPaces.marathon),
      tempo: this.formatPace(currentPace * this.trainingPaces.tempo),
      threshold: this.formatPace(currentPace * this.trainingPaces.threshold),
      interval: this.formatPace(currentPace * this.trainingPaces.interval),
      repetition: this.formatPace(currentPace * this.trainingPaces.repetition)
    };
  }

  calculateConfidence(fitnessLevel, timeframe) {
    const baseConfidence = {
      beginner: { short: 92, medium: 88, long: 82 },
      intermediate: { short: 89, medium: 85, long: 78 },
      advanced: { short: 85, medium: 80, long: 72 }
    };

    return baseConfidence[fitnessLevel][timeframe];
  }

  recommendWeeklyMileage(metrics, fitnessLevel) {
    const mileage = {
      beginner: '20-30 km',
      intermediate: '35-50 km',
      advanced: '50-70 km'
    };

    return mileage[fitnessLevel];
  }

  determineTrainingPhase(analysis) {
    if (analysis.cadenceAnalysis.avgCadence < 165) {
      return 'Foundation - Focus on form';
    } else if (analysis.overallScore < 70) {
      return 'Base building - Develop aerobic capacity';
    } else {
      return 'Performance - Sharpen speed';
    }
  }

  determineKeyFocus(analysis) {
    const focuses = [];

    if (analysis.cadenceAnalysis.avgCadence < 170) focuses.push('Cadence');
    if (analysis.paceAnalysis.strategy === 'positive-split') focuses.push('Pacing');
    if (analysis.formAnalysis.verticalOscillation > 10) focuses.push('Form');

    return focuses.length > 0 ? focuses.join(', ') : 'Race-specific fitness';
  }

  getWeeklyStructureNotes(fitnessLevel) {
    const notes = {
      beginner: 'Start conservatively. Focus on consistency over intensity.',
      intermediate: 'Balance hard days with recovery. Listen to your body.',
      advanced: 'Requires high training tolerance. Consider working with a coach.'
    };

    return notes[fitnessLevel];
  }

  generateSummary(analysis, fitnessLevel) {
    const score = analysis.overallScore;
    let summary = '';

    if (score >= 85) {
      summary = `Excellent performance! Your ${fitnessLevel}-level execution shows strong fundamentals. `;
    } else if (score >= 70) {
      summary = `Good performance with room for improvement. As a ${fitnessLevel} runner, focus on consistency. `;
    } else {
      summary = `Significant improvement potential identified. As a ${fitnessLevel} runner, prioritize form and pacing. `;
    }

    return {
      text: summary,
      overallScore: score,
      fitnessLevel,
      confidence: 93
    };
  }
}

export default TrainingRecommender;
