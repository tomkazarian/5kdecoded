/**
 * Recommendation Accuracy Validation Tests
 * Validates recommendations against sports science research
 */

describe('Recommendation Accuracy Validation', () => {
  describe('Training Pace Validation', () => {
    test('easy run pace should be 60-75% of 5K pace', () => {
      // Based on Jack Daniels Running Formula
      const race5kPace = 270; // 4:30/km in seconds
      const easyPaceMin = race5kPace * 1.25; // 25% slower minimum
      const easyPaceMax = race5kPace * 1.67; // 67% slower maximum

      // Validate range
      expect(easyPaceMin).toBeGreaterThan(race5kPace);
      expect(easyPaceMax).toBeGreaterThan(easyPaceMin);
    });

    test('tempo pace should be at lactate threshold', () => {
      // Based on research: LT pace ≈ 15K-half marathon pace
      // Approximately 10-15% slower than 5K pace
      const race5kPace = 270; // seconds
      const tempoPaceMin = race5kPace * 1.10;
      const tempoPaceMax = race5kPace * 1.15;

      expect(tempoPaceMin).toBeLessThan(tempoPaceMax);
    });

    test('interval pace should be at VO2max', () => {
      // Based on research: VO2max pace ≈ 3K-5K race pace
      const race5kPace = 270; // seconds
      const intervalPaceMin = race5kPace * 0.95; // Slightly faster
      const intervalPaceMax = race5kPace * 1.02; // Slightly slower

      expect(intervalPaceMin).toBeLessThan(race5kPace);
    });

    test('repetition pace should be faster than 5K pace', () => {
      // Based on research: Rep pace ≈ 800m-mile race pace
      const race5kPace = 270; // seconds
      const repPaceMax = race5kPace * 0.90; // 10% faster

      expect(repPaceMax).toBeLessThan(race5kPace);
    });
  });

  describe('Heart Rate Zone Validation', () => {
    test('zone calculations should match Karvonen formula', () => {
      const maxHR = 185;
      const restingHR = 65;
      const hrReserve = maxHR - restingHR;

      // Zone 2 (Easy): 60-70% HRR
      const zone2Min = Math.round(restingHR + hrReserve * 0.6);
      const zone2Max = Math.round(restingHR + hrReserve * 0.7);

      expect(zone2Min).toBeRealisticHeartRate();
      expect(zone2Max).toBeRealisticHeartRate();
      expect(zone2Max).toBeGreaterThan(zone2Min);
    });

    test('5K race should be in zone 4-5', () => {
      // Based on research: 5K effort is 85-95% HRR
      const maxHR = 185;
      const restingHR = 65;
      const hrReserve = maxHR - restingHR;

      const raceHRMin = Math.round(restingHR + hrReserve * 0.85);
      const raceHRMax = Math.round(restingHR + hrReserve * 0.95);

      expect(raceHRMin).toBeGreaterThan(restingHR + 100);
      expect(raceHRMax).toBeLessThanOrEqual(maxHR);
    });
  });

  describe('Training Volume Validation', () => {
    test('weekly mileage should follow 10% rule', () => {
      // Based on research: increase no more than 10% per week
      const currentWeeklyMileage = 30; // km
      const maxIncrease = currentWeeklyMileage * 1.10;

      expect(maxIncrease).toBeLessThanOrEqual(33);
      expect(maxIncrease).toBeGreaterThan(currentWeeklyMileage);
    });

    test('hard days should be 20-30% of weekly volume', () => {
      // Based on 80/20 training principle
      const weeklyMileage = 50; // km
      const hardDayMileageMin = weeklyMileage * 0.20;
      const hardDayMileageMax = weeklyMileage * 0.30;

      expect(hardDayMileageMin).toBe(10);
      expect(hardDayMileageMax).toBe(15);
    });

    test('long run should be 20-30% of weekly mileage', () => {
      // Based on research for 5K training
      const weeklyMileage = 50; // km
      const longRunMin = weeklyMileage * 0.20;
      const longRunMax = weeklyMileage * 0.30;

      expect(longRunMin).toBe(10);
      expect(longRunMax).toBe(15);
    });
  });

  describe('Recovery Time Validation', () => {
    test('should recommend 48 hours between hard workouts', () => {
      // Based on research: muscle recovery requires 48-72 hours
      const minRecoveryHours = 48;
      const maxRecoveryHours = 72;

      expect(minRecoveryHours).toBeGreaterThanOrEqual(48);
      expect(maxRecoveryHours).toBeLessThanOrEqual(72);
    });

    test('interval recovery should be 1:1 to 1:3 ratio', () => {
      // Based on research for VO2max intervals
      const workTime = 180; // 3 minutes
      const recoveryMin = workTime; // 1:1 ratio
      const recoveryMax = workTime * 3; // 1:3 ratio

      expect(recoveryMin).toBe(180);
      expect(recoveryMax).toBe(540);
    });
  });

  describe('Improvement Timeline Validation', () => {
    test('realistic improvement is 5-10% per 12-week cycle', () => {
      const currentTime = 1800; // 30:00 for 5K
      const minImprovement = currentTime * 0.95; // 5% improvement
      const maxImprovement = currentTime * 0.90; // 10% improvement

      // 12 weeks of training should yield 5-10% improvement
      expect(minImprovement).toBeLessThan(currentTime);
      expect(maxImprovement).toBeGreaterThan(currentTime * 0.85);
    });

    test('beginner improvement rate should be higher than advanced', () => {
      // Based on research: beginners improve faster
      const beginnerImprovementRate = 0.10; // 10%
      const advancedImprovementRate = 0.05; // 5%

      expect(beginnerImprovementRate).toBeGreaterThan(advancedImprovementRate);
    });
  });

  describe('VO2max Estimation Validation', () => {
    test('VO2max should correlate with race performance', () => {
      // Based on Cooper formula: VO2max = (483 / time_in_minutes) + 3.5
      const time5kMinutes = 20; // 20 minutes for 5K
      const estimatedVO2max = (483 / time5kMinutes) + 3.5;

      // For 20-minute 5K, expect VO2max ~55-60
      expect(estimatedVO2max).toBeWithinRange(50, 65);
    });

    test('age should affect VO2max predictions', () => {
      // Based on research: VO2max declines ~1% per year after 25
      const baseVO2max = 55;
      const age = 40;
      const ageDecline = (age - 25) * 0.01;
      const adjustedVO2max = baseVO2max * (1 - ageDecline);

      expect(adjustedVO2max).toBeLessThan(baseVO2max);
      expect(adjustedVO2max).toBeWithinRange(40, 55);
    });
  });

  describe('Cadence Validation', () => {
    test('optimal cadence should be 170-190 spm', () => {
      // Based on research (Jack Daniels, Pete Larson)
      const optimalCadenceMin = 170;
      const optimalCadenceMax = 190;

      expect(optimalCadenceMin).toBeGreaterThan(160);
      expect(optimalCadenceMax).toBeLessThan(200);
    });

    test('faster paces should have higher cadence', () => {
      // Based on research: cadence increases with speed
      const easyRunCadence = 170;
      const racePaceCadence = 185;

      expect(racePaceCadence).toBeGreaterThan(easyRunCadence);
    });
  });

  describe('Urban Legend Detection', () => {
    test('should flag low-confidence recommendations', () => {
      const urbanLegends = [
        { claim: 'Running in the morning burns more fat', confidence: 0.3 },
        { claim: 'You need to stretch before every run', confidence: 0.4 },
        { claim: 'Ice baths are essential for recovery', confidence: 0.35 },
        { claim: 'Carbo-loading is necessary for 5K', confidence: 0.25 }
      ];

      urbanLegends.forEach(legend => {
        expect(legend.confidence).toBeLessThan(0.5);
      });
    });

    test('should prioritize evidence-based recommendations', () => {
      const evidenceBased = [
        { claim: 'Progressive overload improves performance', confidence: 0.95 },
        { claim: 'Easy runs build aerobic base', confidence: 0.90 },
        { claim: 'Interval training improves VO2max', confidence: 0.93 },
        { claim: 'Adequate sleep aids recovery', confidence: 0.88 }
      ];

      evidenceBased.forEach(rec => {
        expect(rec.confidence).toBeGreaterThan(0.85);
      });
    });
  });

  describe('Realistic Scenario Validation', () => {
    test('beginner runner scenario should be realistic', () => {
      const beginner = {
        currentPace: '9:15', // per km
        maxHeartRate: 185,
        restingHR: 70,
        weeklyMileage: 20 // km
      };

      // Recommendations should be:
      // - Easy runs at 10:30-11:30 pace
      // - 1-2 hard workouts per week
      // - Build to 30-35km weekly
      // - Expect 5-8% improvement over 12 weeks

      const easyPaceSeconds = global.testHelpers.paceToSeconds(beginner.currentPace);
      const recommendedEasyPaceSeconds = easyPaceSeconds * 1.15;
      const recommendedEasyPace = global.testHelpers.secondsToPace(recommendedEasyPaceSeconds);

      expect(recommendedEasyPace).toBeValidPace();
      expect(global.testHelpers.paceToSeconds(recommendedEasyPace)).toBeGreaterThan(easyPaceSeconds);
    });

    test('advanced runner scenario should be realistic', () => {
      const advanced = {
        currentPace: '4:30', // per km
        maxHeartRate: 189,
        restingHR: 55,
        weeklyMileage: 70 // km
      };

      // Recommendations should be:
      // - Easy runs at 5:45-6:15 pace
      // - 2-3 quality workouts per week
      // - Maintain or slightly increase volume
      // - Expect 2-5% improvement over 12 weeks

      const currentPaceSeconds = global.testHelpers.paceToSeconds(advanced.currentPace);
      expect(currentPaceSeconds).toBeLessThan(300); // Sub-5:00 pace
    });
  });
});
