/**
 * Metrics Analyzer
 * Analyzes running metrics and provides insights based on sports science research
 */

export class MetricsAnalyzer {
  constructor() {
    // Ideal ranges based on sports science research
    this.idealRanges = {
      cadence: { min: 170, max: 180, optimal: 175 },
      heartRateZones: {
        zone1: { min: 0.5, max: 0.6, name: 'Easy', purpose: 'Recovery' },
        zone2: { min: 0.6, max: 0.7, name: 'Aerobic', purpose: 'Base building' },
        zone3: { min: 0.7, max: 0.8, name: 'Tempo', purpose: 'Lactate threshold' },
        zone4: { min: 0.8, max: 0.9, name: 'Threshold', purpose: 'VO2 max development' },
        zone5: { min: 0.9, max: 1.0, name: 'Maximum', purpose: 'Anaerobic capacity' }
      },
      verticalOscillation: { max: 10.0, optimal: 8.0 }, // cm
      groundContactTime: { max: 250, optimal: 220 }, // ms
      strideLength: { min: 1.2, max: 1.4, optimal: 1.3 } // meters
    };
  }

  /**
   * Analyze all metrics and generate insights
   * @param {Object} metrics - Parsed metrics from parser
   * @param {Object} userProfile - User profile (age, gender, fitness level)
   * @returns {Object} Analysis results with insights and scores
   */
  analyze(metrics, userProfile = {}) {
    console.log('[Analyzer] Starting analysis...');
    console.log(`[Analyzer] Input metrics - Distance: ${metrics.totalDistance?.toFixed(2)} km, Time: ${Math.floor((metrics.totalTime || 0) / 60)}:${String(Math.floor((metrics.totalTime || 0) % 60)).padStart(2, '0')}`);
    console.log(`[Analyzer] HR: ${metrics.avgHeartRate || 0}, Cadence: ${metrics.avgCadence || 0}, Laps: ${metrics.laps?.length || 0}`);

    const maxHR = userProfile.maxHeartRate || this.estimateMaxHeartRate(userProfile.age || 35);

    const analysis = {
      overallScore: 0,
      paceAnalysis: this.analyzePace(metrics),
      cadenceAnalysis: this.analyzeCadence(metrics),
      heartRateAnalysis: this.analyzeHeartRate(metrics, maxHR),
      formAnalysis: this.analyzeRunningForm(metrics),
      consistencyAnalysis: this.analyzeConsistency(metrics),
      strengthsAndWeaknesses: [],
      insights: [], // Changed from keyInsights to insights for consistency
      riskFactors: []
    };

    // Calculate overall score (0-100)
    analysis.overallScore = this.calculateOverallScore(analysis);

    // Generate strengths and weaknesses
    analysis.strengthsAndWeaknesses = this.identifyStrengthsAndWeaknesses(analysis);

    // Generate key insights - always generate at least 3 insights
    analysis.insights = this.generateKeyInsights(analysis, metrics);

    // Identify risk factors
    analysis.riskFactors = this.identifyRiskFactors(analysis, metrics);

    // Generate race commentary
    analysis.raceCommentary = this.generateRaceCommentary(metrics, analysis);

    console.log(`[Analyzer] Analysis complete - Score: ${analysis.overallScore}, Insights: ${analysis.insights.length}, Strengths/Weaknesses: ${analysis.strengthsAndWeaknesses.length}`);

    return analysis;
  }

  /**
   * Generate 3-4 paragraph race commentary analyzing performance mile by mile
   */
  generateRaceCommentary(metrics, analysis) {
    const laps = metrics.laps || [];
    if (laps.length === 0) {
      return null;
    }

    const commentary = [];
    const totalTime = metrics.totalTime || 0;
    const totalDistance = metrics.totalDistance || 0;
    const avgPace = metrics.avgPace || 0;

    // Opening paragraph - race overview
    const timeMin = Math.floor(totalTime / 60);
    const timeSec = Math.round(totalTime % 60);
    const paceMin = Math.floor(avgPace);
    const paceSec = Math.round((avgPace % 1) * 60);

    let opening = `You completed this ${totalDistance.toFixed(2)}km race in ${timeMin}:${String(timeSec).padStart(2, '0')} at an average pace of ${paceMin}:${String(paceSec).padStart(2, '0')}/km. `;

    if (analysis.overallScore >= 85) {
      opening += `This was a strong performance with excellent execution across all metrics. `;
    } else if (analysis.overallScore >= 70) {
      opening += `Overall, this was a solid performance with some areas showing particular strength. `;
    } else {
      opening += `This race provides clear insights into areas for improvement. `;
    }

    // Add pacing strategy observation
    const firstLap = laps[0];
    const lastLap = laps[laps.length - 1];
    if (firstLap && lastLap && firstLap.pace && lastLap.pace) {
      if (lastLap.pace < firstLap.pace - 0.15) {
        opening += `You demonstrated smart pacing with a negative split, finishing stronger than you started.`;
      } else if (lastLap.pace > firstLap.pace + 0.2) {
        opening += `The positive split indicates you may have started too aggressively, which led to slowing in later kilometers.`;
      } else {
        opening += `Your pacing was notably consistent throughout the race.`;
      }
    }

    commentary.push(opening);

    // Analyze first third of race (early kilometers)
    const earlyLaps = laps.slice(0, Math.ceil(laps.length / 3));
    if (earlyLaps.length > 0) {
      const earlyAvgPace = earlyLaps.reduce((sum, lap) => sum + (lap.pace || 0), 0) / earlyLaps.length;
      const earlyAvgHR = earlyLaps.reduce((sum, lap) => sum + (lap.avgHeartRate || lap.heartRate || 0), 0) / earlyLaps.length;
      const earlyPaceMin = Math.floor(earlyAvgPace);
      const earlyPaceSec = Math.round((earlyAvgPace % 1) * 60);

      let earlyPara = `In the opening kilometers, you averaged ${earlyPaceMin}:${String(earlyPaceSec).padStart(2, '0')}/km`;

      if (earlyAvgHR > 0) {
        earlyPara += ` with an average heart rate of ${Math.round(earlyAvgHR)} bpm`;
      }
      earlyPara += `. `;

      // Compare to overall pace
      if (earlyAvgPace < avgPace - 0.15) {
        earlyPara += `This was notably faster than your overall average, suggesting an aggressive start. While this can work for experienced runners, it may have contributed to fatigue later. `;
      } else if (earlyAvgPace > avgPace + 0.1) {
        earlyPara += `This conservative start allowed you to build into the race, which is a solid strategy for maintaining energy. `;
      } else {
        earlyPara += `This matched your overall pace well, indicating good race awareness from the start. `;
      }

      // Add cadence observation if available
      const earlyAvgCadence = earlyLaps.reduce((sum, lap) => sum + (lap.avgCadence || lap.cadence || 0), 0) / earlyLaps.length;
      if (earlyAvgCadence > 0) {
        if (earlyAvgCadence >= 170 && earlyAvgCadence <= 180) {
          earlyPara += `Your cadence in this section averaged ${Math.round(earlyAvgCadence)} spm, which is in the optimal range.`;
        } else if (earlyAvgCadence < 165) {
          earlyPara += `Your cadence averaged ${Math.round(earlyAvgCadence)} spm in this section, which is below the optimal 170-180 spm range. Increasing cadence could improve efficiency and reduce injury risk.`;
        }
      }

      commentary.push(earlyPara);
    }

    // Analyze middle section
    const midStart = Math.ceil(laps.length / 3);
    const midEnd = Math.ceil((laps.length * 2) / 3);
    const midLaps = laps.slice(midStart, midEnd);

    if (midLaps.length > 0) {
      const midAvgPace = midLaps.reduce((sum, lap) => sum + (lap.pace || 0), 0) / midLaps.length;
      const midAvgHR = midLaps.reduce((sum, lap) => sum + (lap.avgHeartRate || lap.heartRate || 0), 0) / midLaps.length;
      const midPaceMin = Math.floor(midAvgPace);
      const midPaceSec = Math.round((midAvgPace % 1) * 60);

      let midPara = `Through the middle kilometers, your pace shifted to ${midPaceMin}:${String(midPaceSec).padStart(2, '0')}/km`;

      if (midAvgHR > 0 && earlyLaps.length > 0) {
        const earlyAvgHR = earlyLaps.reduce((sum, lap) => sum + (lap.avgHeartRate || lap.heartRate || 0), 0) / earlyLaps.length;
        const hrChange = midAvgHR - earlyAvgHR;

        if (Math.abs(hrChange) < 5) {
          midPara += `. Heart rate remained stable at ${Math.round(midAvgHR)} bpm, showing good cardiovascular control. `;
        } else if (hrChange > 5) {
          midPara += `. Heart rate climbed to ${Math.round(midAvgHR)} bpm (+${Math.round(hrChange)}), which is expected as the race progressed and effort accumulated. `;
        }
      } else {
        midPara += `. `;
      }

      // Compare mid to early pace
      if (earlyLaps.length > 0) {
        const earlyAvgPace = earlyLaps.reduce((sum, lap) => sum + (lap.pace || 0), 0) / earlyLaps.length;
        if (midAvgPace > earlyAvgPace + 0.15) {
          midPara += `This represents significant slowing from the early pace, indicating fatigue began setting in. Building aerobic capacity through base training would help maintain pace longer. `;
        } else if (midAvgPace < earlyAvgPace) {
          midPara += `Remarkably, you actually maintained or improved your pace, demonstrating excellent endurance and race execution. `;
        } else {
          midPara += `The pace remained relatively consistent with the early kilometers, showing solid conditioning. `;
        }
      }

      commentary.push(midPara);
    }

    // Analyze finish (last third)
    const finishLaps = laps.slice(midEnd);
    if (finishLaps.length > 0) {
      const finishAvgPace = finishLaps.reduce((sum, lap) => sum + (lap.pace || 0), 0) / finishLaps.length;
      const finishAvgHR = finishLaps.reduce((sum, lap) => sum + (lap.avgHeartRate || lap.heartRate || 0), 0) / finishLaps.length;
      const finishPaceMin = Math.floor(finishAvgPace);
      const finishPaceSec = Math.round((finishAvgPace % 1) * 60);

      let finishPara = `In the closing kilometers, you`;

      if (midLaps.length > 0) {
        const midAvgPace = midLaps.reduce((sum, lap) => sum + (lap.pace || 0), 0) / midLaps.length;
        if (finishAvgPace < midAvgPace - 0.1) {
          finishPara += ` found another gear, accelerating to ${finishPaceMin}:${String(finishPaceSec).padStart(2, '0')}/km. This strong finish demonstrates both physical capability and mental toughness. `;
        } else if (finishAvgPace > midAvgPace + 0.2) {
          finishPara += ` slowed to ${finishPaceMin}:${String(finishPaceSec).padStart(2, '0')}/km, likely due to accumulated fatigue. Incorporating tempo runs and lactate threshold work would help maintain pace when tired. `;
        } else {
          finishPara += ` maintained ${finishPaceMin}:${String(finishPaceSec).padStart(2, '0')}/km to the finish. `;
        }
      } else {
        finishPara += ` finished at ${finishPaceMin}:${String(finishPaceSec).padStart(2, '0')}/km pace. `;
      }

      // Add final heart rate observation
      if (finishAvgHR > 0 && metrics.maxHeartRate > 0) {
        const hrPercentOfMax = (finishAvgHR / metrics.maxHeartRate) * 100;
        if (hrPercentOfMax >= 95) {
          finishPara += `Your heart rate averaged ${Math.round(finishAvgHR)} bpm in this section (${hrPercentOfMax.toFixed(0)}% of max), showing maximum effort was given. `;
        } else if (hrPercentOfMax < 85) {
          finishPara += `With heart rate at ${Math.round(finishAvgHR)} bpm (${hrPercentOfMax.toFixed(0)}% of max), there may have been room to push harder in future races. `;
        }
      }

      // Add forward-looking statement
      if (analysis.overallScore >= 80) {
        finishPara += `Your consistent execution suggests focusing on speedwork and VO2 max intervals could unlock faster times.`;
      } else if (analysis.overallScore >= 65) {
        finishPara += `Building your aerobic base with more easy-paced runs would provide a foundation for more aggressive racing.`;
      } else {
        finishPara += `Focus on establishing consistent training volume and proper pacing in workouts before adding intensity.`;
      }

      commentary.push(finishPara);
    }

    return commentary;
  }

  /**
   * Analyze pacing strategy
   */
  analyzePace(metrics) {
    const laps = metrics.laps || [];
    if (laps.length === 0) {
      return { score: 0, strategy: 'unknown', insights: [] };
    }

    const paces = laps.map(lap => lap.pace).filter(p => p > 0);
    const avgPace = paces.reduce((a, b) => a + b, 0) / paces.length;
    const paceVariance = this.calculateVariance(paces);
    const paceSD = Math.sqrt(paceVariance);
    const coefficientOfVariation = (paceSD / avgPace) * 100;

    // Determine pacing strategy
    let strategy = 'even';
    const firstHalf = paces.slice(0, Math.ceil(paces.length / 2));
    const secondHalf = paces.slice(Math.ceil(paces.length / 2));
    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondHalfAvg < firstHalfAvg - 0.2) {
      strategy = 'negative-split'; // Speeding up
    } else if (secondHalfAvg > firstHalfAvg + 0.2) {
      strategy = 'positive-split'; // Slowing down
    }

    // Score based on consistency and strategy
    let score = 100;
    if (coefficientOfVariation > 10) score -= 30; // High variance is bad
    if (coefficientOfVariation > 15) score -= 20;
    if (strategy === 'positive-split') score -= 25; // Fading is bad
    if (strategy === 'negative-split') score += 10; // Negative split is good

    const insights = [];
    if (coefficientOfVariation < 5) {
      insights.push({
        type: 'strength',
        message: 'Excellent pace consistency throughout the run',
        confidence: 95
      });
    } else if (coefficientOfVariation > 12) {
      insights.push({
        type: 'weakness',
        message: 'High pace variability - work on maintaining steady effort',
        confidence: 90
      });
    }

    if (strategy === 'negative-split') {
      insights.push({
        type: 'strength',
        message: 'Negative split strategy shows good race management',
        confidence: 92
      });
    } else if (strategy === 'positive-split') {
      insights.push({
        type: 'weakness',
        message: 'Positive split suggests pacing too fast early - start more conservatively',
        confidence: 88
      });
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      avgPace,
      paceVariance,
      coefficientOfVariation,
      strategy,
      insights
    };
  }

  /**
   * Analyze cadence
   */
  analyzeCadence(metrics) {
    const avgCadence = metrics.avgCadence;
    const { min, max, optimal } = this.idealRanges.cadence;

    let score = 100;
    let deviation = 0;

    if (avgCadence < min) {
      deviation = min - avgCadence;
      score = Math.max(0, 100 - (deviation * 2));
    } else if (avgCadence > max) {
      deviation = avgCadence - max;
      score = Math.max(0, 100 - (deviation * 1.5));
    } else {
      // Within range, score based on proximity to optimal
      deviation = Math.abs(avgCadence - optimal);
      score = Math.max(80, 100 - (deviation * 2));
    }

    const insights = [];
    if (avgCadence < 165) {
      insights.push({
        type: 'weakness',
        message: `Cadence (${Math.round(avgCadence)} spm) is below optimal. Increase to 170-180 to reduce injury risk and improve efficiency`,
        confidence: 95,
        recommendation: 'Practice high-cadence drills and use a metronome during training'
      });
    } else if (avgCadence >= 170 && avgCadence <= 180) {
      insights.push({
        type: 'strength',
        message: `Excellent cadence (${Math.round(avgCadence)} spm) - within optimal range for injury prevention`,
        confidence: 98
      });
    } else if (avgCadence > 185) {
      insights.push({
        type: 'neutral',
        message: `Very high cadence (${Math.round(avgCadence)} spm) - ensure you're not overstriding to compensate`,
        confidence: 85
      });
    }

    return {
      score,
      avgCadence,
      deviation,
      status: this.getCadenceStatus(avgCadence),
      insights
    };
  }

  getCadenceStatus(cadence) {
    if (cadence < 160) return 'too-low';
    if (cadence < 170) return 'below-optimal';
    if (cadence <= 180) return 'optimal';
    if (cadence <= 190) return 'above-optimal';
    return 'too-high';
  }

  /**
   * Analyze heart rate zones and effort distribution
   */
  analyzeHeartRate(metrics, maxHR) {
    const avgHR = metrics.avgHeartRate;
    const maxRecordedHR = metrics.maxHeartRate;

    if (!avgHR || !maxHR) {
      return { score: 0, insights: [], zones: {} };
    }

    const avgHRPercent = avgHR / maxHR;
    const maxHRPercent = maxRecordedHR / maxHR;

    // Determine which zone the run was in
    let primaryZone = null;
    for (const [zoneName, zone] of Object.entries(this.idealRanges.heartRateZones)) {
      if (avgHRPercent >= zone.min && avgHRPercent < zone.max) {
        primaryZone = { ...zone, name: zoneName };
        break;
      }
    }

    // Score based on 5K race effort (should be zone 4-5)
    let score = 100;
    const insights = [];

    if (avgHRPercent < 0.80) {
      score = 70;
      insights.push({
        type: 'weakness',
        message: `Average heart rate (${Math.round(avgHRPercent * 100)}% of max) suggests sub-maximal effort. You have capacity for faster times`,
        confidence: 87,
        recommendation: 'Push harder in your next 5K race - aim for 85-92% of max HR'
      });
    } else if (avgHRPercent >= 0.85 && avgHRPercent <= 0.93) {
      score = 100;
      insights.push({
        type: 'strength',
        message: `Excellent effort level (${Math.round(avgHRPercent * 100)}% of max HR) - appropriate for 5K racing`,
        confidence: 95
      });
    } else if (avgHRPercent > 0.95) {
      score = 85;
      insights.push({
        type: 'neutral',
        message: `Very high heart rate effort (${Math.round(avgHRPercent * 100)}% of max HR) - ensure adequate recovery before next hard effort`,
        confidence: 90
      });
    }

    return {
      score,
      avgHR,
      maxHR: maxRecordedHR,
      avgHRPercent: Math.round(avgHRPercent * 100),
      maxHRPercent: Math.round(maxHRPercent * 100),
      primaryZone,
      insights
    };
  }

  /**
   * Analyze running form metrics
   */
  analyzeRunningForm(metrics) {
    const { verticalOscillation, groundContactTime, avgStrideLength } = metrics;
    const insights = [];
    let score = 100;
    let hasFormData = false;

    // Vertical oscillation analysis
    if (verticalOscillation > 0) {
      hasFormData = true;
      if (verticalOscillation > 10.0) {
        score -= 20;
        insights.push({
          type: 'weakness',
          message: `High vertical oscillation (${verticalOscillation.toFixed(1)}cm) - excessive bouncing wastes energy`,
          confidence: 92,
          recommendation: 'Focus on running "lighter" with quick foot turnover and less vertical movement'
        });
      } else if (verticalOscillation <= 8.0) {
        insights.push({
          type: 'strength',
          message: `Excellent vertical oscillation (${verticalOscillation.toFixed(1)}cm) - efficient running form`,
          confidence: 94
        });
      }
    }

    // Ground contact time analysis
    if (groundContactTime > 0) {
      hasFormData = true;
      if (groundContactTime > 260) {
        score -= 15;
        insights.push({
          type: 'weakness',
          message: `Long ground contact time (${groundContactTime}ms) - work on quicker foot strike`,
          confidence: 88,
          recommendation: 'Practice plyometric drills and focus on landing midfoot with quick lift-off'
        });
      } else if (groundContactTime <= 220) {
        insights.push({
          type: 'strength',
          message: `Excellent ground contact time (${groundContactTime}ms) - efficient force application`,
          confidence: 91
        });
      }
    }

    // Stride length analysis
    if (avgStrideLength > 0) {
      hasFormData = true;
      if (avgStrideLength < 1.0) {
        score -= 10;
        insights.push({
          type: 'weakness',
          message: `Short stride length (${avgStrideLength.toFixed(2)}m) - may limit speed potential`,
          confidence: 80,
          recommendation: 'Incorporate strength training and hill work to build power'
        });
      } else if (avgStrideLength > 1.5) {
        score -= 10;
        insights.push({
          type: 'weakness',
          message: `Very long stride length (${avgStrideLength.toFixed(2)}m) - may indicate overstriding`,
          confidence: 82,
          recommendation: 'Focus on cadence over stride length to reduce injury risk'
        });
      }
    }

    if (!hasFormData) {
      insights.push({
        type: 'info',
        message: 'No advanced form metrics available in this file. Consider using a running dynamics pod or compatible watch',
        confidence: 100
      });
    }

    return {
      score: hasFormData ? score : null,
      verticalOscillation,
      groundContactTime,
      avgStrideLength,
      insights
    };
  }

  /**
   * Analyze consistency across laps
   */
  analyzeConsistency(metrics) {
    const laps = metrics.laps || [];
    if (laps.length < 2) {
      return { score: null, insights: [] };
    }

    const paces = laps.map(lap => lap.pace);
    const heartRates = laps.map(lap => lap.heartRate).filter(hr => hr > 0);

    const paceCV = this.calculateCV(paces);
    const hrCV = heartRates.length > 0 ? this.calculateCV(heartRates) : 0;

    let score = 100;
    const insights = [];

    // Pace consistency
    if (paceCV < 3) {
      score += 0; // Perfect
      insights.push({
        type: 'strength',
        message: 'Exceptional pace consistency - excellent pacing strategy',
        confidence: 96
      });
    } else if (paceCV > 8) {
      score -= 30;
      insights.push({
        type: 'weakness',
        message: 'Inconsistent pacing between laps - practice even effort distribution',
        confidence: 91,
        recommendation: 'Use a pace alert or run with experienced runners to maintain steady pace'
      });
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      paceCV,
      hrCV,
      insights
    };
  }

  /**
   * Calculate overall performance score
   */
  calculateOverallScore(analysis) {
    const weights = {
      pace: 0.35,
      cadence: 0.25,
      heartRate: 0.20,
      form: 0.10,
      consistency: 0.10
    };

    let totalScore = 0;
    let totalWeight = 0;

    if (analysis.paceAnalysis.score) {
      totalScore += analysis.paceAnalysis.score * weights.pace;
      totalWeight += weights.pace;
    }
    if (analysis.cadenceAnalysis.score) {
      totalScore += analysis.cadenceAnalysis.score * weights.cadence;
      totalWeight += weights.cadence;
    }
    if (analysis.heartRateAnalysis.score) {
      totalScore += analysis.heartRateAnalysis.score * weights.heartRate;
      totalWeight += weights.heartRate;
    }
    if (analysis.formAnalysis.score) {
      totalScore += analysis.formAnalysis.score * weights.form;
      totalWeight += weights.form;
    }
    if (analysis.consistencyAnalysis.score) {
      totalScore += analysis.consistencyAnalysis.score * weights.consistency;
      totalWeight += weights.consistency;
    }

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  /**
   * Identify strengths and weaknesses
   */
  identifyStrengthsAndWeaknesses(analysis) {
    const items = [];

    const addInsights = (categoryInsights) => {
      categoryInsights.forEach(insight => {
        items.push(insight);
      });
    };

    addInsights(analysis.paceAnalysis.insights || []);
    addInsights(analysis.cadenceAnalysis.insights || []);
    addInsights(analysis.heartRateAnalysis.insights || []);
    addInsights(analysis.formAnalysis.insights || []);
    addInsights(analysis.consistencyAnalysis.insights || []);

    return items;
  }

  /**
   * Generate comprehensive key insights summary
   */
  generateKeyInsights(analysis, metrics) {
    const insights = [];
    const timeMinutes = Math.floor((metrics.totalTime || 0) / 60);
    const timeSeconds = Math.round((metrics.totalTime || 0) % 60);
    const avgPaceMin = Math.floor(metrics.avgPace || 0);
    const avgPaceSec = Math.round(((metrics.avgPace || 0) % 1) * 60);

    // Always include: Current performance
    insights.push({
      type: 'performance',
      message: `Completed 5K in ${timeMinutes}:${timeSeconds.toString().padStart(2, '0')} at ${avgPaceMin}:${avgPaceSec.toString().padStart(2, '0')}/km average pace`,
      confidence: 100
    });

    // Overall performance assessment
    if (analysis.overallScore >= 85) {
      insights.push({
        type: 'strength',
        message: 'Excellent race execution with strong overall performance metrics (85+ score)',
        confidence: 95
      });
    } else if (analysis.overallScore >= 70) {
      insights.push({
        type: 'summary',
        message: 'Good performance with room for targeted improvements in specific areas',
        confidence: 90
      });
    } else if (analysis.overallScore >= 50) {
      insights.push({
        type: 'summary',
        message: 'Moderate performance - focus on consistency and proper pacing for next race',
        confidence: 88
      });
    } else {
      insights.push({
        type: 'opportunity',
        message: 'Significant improvement potential across multiple areas - structured training will yield results',
        confidence: 92
      });
    }

    // Pace analysis insights
    if (metrics.laps && metrics.laps.length > 0) {
      const paces = metrics.laps.map(l => l.pace).filter(p => p > 0);
      if (paces.length > 0) {
        const firstKm = paces[0];
        const lastKm = paces[paces.length - 1];
        const paceMin = Math.min(...paces);
        const paceMax = Math.max(...paces);
        const fastestMin = Math.floor(paceMin);
        const fastestSec = Math.round((paceMin % 1) * 60);
        const slowestMin = Math.floor(paceMax);
        const slowestSec = Math.round((paceMax % 1) * 60);

        if (lastKm < firstKm - 0.15) {
          insights.push({
            type: 'strength',
            message: `Strong negative split - finished faster than you started (${Math.floor(lastKm)}:${String(Math.floor((lastKm % 1) * 60)).padStart(2, '0')}/km final pace)`,
            confidence: 94,
            recommendation: 'Excellent pacing strategy - maintain this approach in future races'
          });
        } else if (lastKm > firstKm + 0.2) {
          insights.push({
            type: 'weakness',
            message: `Positive split detected - slowed significantly in later kilometers (started ${Math.floor(firstKm)}:${String(Math.floor((firstKm % 1) * 60)).padStart(2, '0')}, finished ${Math.floor(lastKm)}:${String(Math.floor((lastKm % 1) * 60)).padStart(2, '0')})`,
            confidence: 93,
            recommendation: 'Start more conservatively - aim for even splits or slight negative split'
          });
        } else {
          insights.push({
            type: 'strength',
            message: `Even pacing strategy - consistent pace throughout race (${fastestMin}:${fastestSec.toString().padStart(2, '0')} to ${slowestMin}:${slowestSec.toString().padStart(2, '0')}/km range)`,
            confidence: 91
          });
        }
      }
    }

    // Heart rate insights (if available)
    if (metrics.avgHeartRate > 0) {
      const maxHR = metrics.maxHeartRate || metrics.avgHeartRate * 1.1;
      const hrPercentage = ((metrics.avgHeartRate / maxHR) * 100).toFixed(0);

      if (hrPercentage >= 90) {
        insights.push({
          type: 'warning',
          message: `Very high average heart rate (${Math.round(metrics.avgHeartRate)} bpm, ${hrPercentage}% of max) - ensure adequate recovery`,
          confidence: 89,
          recommendation: 'Incorporate more aerobic base training at 60-75% max HR'
        });
      } else if (hrPercentage >= 80) {
        insights.push({
          type: 'performance',
          message: `Race effort heart rate appropriate for 5K (${Math.round(metrics.avgHeartRate)} bpm average, ${hrPercentage}% of max)`,
          confidence: 92
        });
      } else {
        insights.push({
          type: 'opportunity',
          message: `Moderate heart rate (${Math.round(metrics.avgHeartRate)} bpm, ${hrPercentage}% max) suggests room to push harder`,
          confidence: 86,
          recommendation: 'Consider increasing effort in next race - 5K should be 85-95% max HR'
        });
      }
    } else {
      insights.push({
        type: 'info',
        message: 'No heart rate data available - consider using a heart rate monitor for better training guidance',
        confidence: 100,
        recommendation: 'Heart rate training zones help optimize training intensity and prevent overtraining'
      });
    }

    // Cadence insights (if available)
    if (metrics.avgCadence > 0) {
      if (metrics.avgCadence >= 170 && metrics.avgCadence <= 185) {
        insights.push({
          type: 'strength',
          message: `Optimal cadence (${Math.round(metrics.avgCadence)} spm) - within ideal range for efficient running`,
          confidence: 96,
          recommendation: 'Maintain current cadence - research shows 170-180 spm reduces injury risk'
        });
      } else if (metrics.avgCadence < 160) {
        insights.push({
          type: 'weakness',
          message: `Low cadence (${Math.round(metrics.avgCadence)} spm) - increases impact forces and injury risk`,
          confidence: 94,
          recommendation: 'Increase step rate to 170-180 spm with shorter, quicker steps'
        });
      } else if (metrics.avgCadence > 190) {
        insights.push({
          type: 'observation',
          message: `High cadence (${Math.round(metrics.avgCadence)} spm) - ensure stride isn't too short`,
          confidence: 85,
          recommendation: 'Balance cadence with adequate stride length for efficiency'
        });
      } else {
        insights.push({
          type: 'opportunity',
          message: `Cadence (${Math.round(metrics.avgCadence)} spm) close to optimal - minor adjustment to 175 spm could help`,
          confidence: 88
        });
      }
    } else {
      insights.push({
        type: 'info',
        message: 'No cadence data available - optimal running cadence is 170-180 steps per minute',
        confidence: 100,
        recommendation: 'Use a metronome app during training to develop optimal cadence'
      });
    }

    // Improvement potential
    const improvementPotential = this.estimateImprovementPotential(analysis, metrics);
    if (improvementPotential > 0) {
      const potentialTimeReduction = Math.round((metrics.totalTime * improvementPotential) / 100);
      const potentialMinutes = Math.floor(potentialTimeReduction / 60);
      const potentialSeconds = potentialTimeReduction % 60;
      const newTime = metrics.totalTime - potentialTimeReduction;
      const newMinutes = Math.floor(newTime / 60);
      const newSeconds = Math.round(newTime % 60);

      insights.push({
        type: 'opportunity',
        message: `Estimated ${improvementPotential}% improvement potential over 12 weeks (${potentialMinutes}:${potentialSeconds.toString().padStart(2, '0')} faster → ${newMinutes}:${newSeconds.toString().padStart(2, '0')} target time)`,
        confidence: 82,
        recommendation: 'Follow structured training plan focusing on your key weaknesses'
      });
    }

    // Always ensure we have at least 5 insights
    if (insights.length < 5) {
      insights.push({
        type: 'info',
        message: 'Upload more race files to track progress and identify trends over time',
        confidence: 100,
        recommendation: 'Compare multiple races to see improvements in pacing, heart rate efficiency, and overall performance'
      });
    }

    console.log(`[Analyzer] Generated ${insights.length} insights`);
    return insights;
  }

  /**
   * Estimate improvement potential based on analysis
   */
  estimateImprovementPotential(analysis, metrics) {
    let potential = 0;

    // Based on overall score
    if (analysis.overallScore < 60) potential += 20; // Lots of room
    else if (analysis.overallScore < 75) potential += 12;
    else if (analysis.overallScore < 85) potential += 8;
    else potential += 5; // Already performing well

    // Cadence opportunity
    if (metrics.avgCadence > 0 && (metrics.avgCadence < 165 || metrics.avgCadence > 185)) {
      potential += 3;
    }

    // Pacing opportunity
    if (analysis.paceAnalysis?.strategy === 'positive-split') {
      potential += 4;
    }

    // Cap realistic improvement
    return Math.min(potential, 25); // Max 25% improvement over 12 weeks
  }

  /**
   * Identify injury risk factors
   */
  identifyRiskFactors(analysis, metrics) {
    const risks = [];

    if (metrics.avgCadence < 160) {
      risks.push({
        factor: 'Low cadence',
        risk: 'high',
        message: 'Low cadence increases impact forces and injury risk, particularly to knees and shins',
        confidence: 94
      });
    }

    if (metrics.verticalOscillation > 12.0) {
      risks.push({
        factor: 'Excessive vertical movement',
        risk: 'medium',
        message: 'High vertical oscillation can lead to overuse injuries',
        confidence: 87
      });
    }

    if (metrics.groundContactTime > 270) {
      risks.push({
        factor: 'Long ground contact time',
        risk: 'medium',
        message: 'Extended ground contact increases stress on joints',
        confidence: 83
      });
    }

    if (analysis.paceAnalysis.strategy === 'positive-split') {
      const slowdown = analysis.paceAnalysis.coefficientOfVariation;
      if (slowdown > 15) {
        risks.push({
          factor: 'Severe positive split',
          risk: 'low',
          message: 'Starting too fast can lead to training inefficiency and burnout',
          confidence: 75
        });
      }
    }

    return risks;
  }

  // Utility functions
  calculateVariance(values) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  }

  calculateCV(values) {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const sd = Math.sqrt(this.calculateVariance(values));
    return (sd / avg) * 100;
  }

  estimateMaxHeartRate(age) {
    return age ? 220 - age : 190; // Default to 190 if no age
  }
}

export default MetricsAnalyzer;
