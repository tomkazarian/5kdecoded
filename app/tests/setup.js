/**
 * Jest Test Setup
 * Global configuration and utilities for test suite
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';

// Global test timeout
jest.setTimeout(10000);

// Custom matchers
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  toBeValidPace(received) {
    const paceRegex = /^\d{1,2}:\d{2}$/;
    const pass = paceRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid pace format`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid pace format (MM:SS)`,
        pass: false,
      };
    }
  },
  toBeRealisticHeartRate(received) {
    const pass = received >= 60 && received <= 220;
    if (pass) {
      return {
        message: () => `expected ${received} not to be a realistic heart rate`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a realistic heart rate (60-220 bpm)`,
        pass: false,
      };
    }
  }
});

// Mock console to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Test helpers
global.testHelpers = {
  // Convert pace string to seconds per km
  paceToSeconds: (pace) => {
    const [minutes, seconds] = pace.split(':').map(Number);
    return minutes * 60 + seconds;
  },

  // Convert seconds per km to pace string
  secondsToPace: (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  // Calculate realistic heart rate zones
  calculateHRZones: (maxHR, restingHR) => {
    const hrReserve = maxHR - restingHR;
    return {
      zone1: { min: Math.round(restingHR + hrReserve * 0.5), max: Math.round(restingHR + hrReserve * 0.6) },
      zone2: { min: Math.round(restingHR + hrReserve * 0.6), max: Math.round(restingHR + hrReserve * 0.7) },
      zone3: { min: Math.round(restingHR + hrReserve * 0.7), max: Math.round(restingHR + hrReserve * 0.8) },
      zone4: { min: Math.round(restingHR + hrReserve * 0.8), max: Math.round(restingHR + hrReserve * 0.9) },
      zone5: { min: Math.round(restingHR + hrReserve * 0.9), max: maxHR }
    };
  },

  // Validate recommendation realism
  isRealisticImprovement: (currentPace, recommendedPace) => {
    const currentSeconds = global.testHelpers.paceToSeconds(currentPace);
    const recommendedSeconds = global.testHelpers.paceToSeconds(recommendedPace);
    const improvementPercent = ((currentSeconds - recommendedSeconds) / currentSeconds) * 100;
    // Realistic improvement is 1-10% per training cycle
    return improvementPercent >= 1 && improvementPercent <= 10;
  }
};
