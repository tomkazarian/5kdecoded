/**
 * FIT File Parser
 * Parses Garmin FIT files and extracts running metrics
 */
import FitParserLib from 'fit-file-parser';

export class FitFileParser {
  constructor() {
    const FitParser = FitParserLib.default || FitParserLib;
    this.parser = new FitParser({ force: true, speedUnit: 'km/h', lengthUnit: 'km' });
  }

  /**
   * Parse FIT file and extract 5K metrics
   * @param {Buffer} fileBuffer - FIT file buffer
   * @returns {Promise<Object>} Parsed metrics
   */
  async parse(fileBuffer) {
    return new Promise((resolve, reject) => {
      try {
        this.parser.parse(fileBuffer, (error, data) => {
          if (error) {
            reject(new Error(`FIT parsing error: ${error.message}`));
            return;
          }

          const metrics = this.extractMetrics(data);
          resolve(metrics);
        });
      } catch (error) {
        reject(new Error(`FIT file processing failed: ${error.message}`));
      }
    });
  }

  /**
   * Extract relevant metrics from parsed FIT data
   */
  extractMetrics(data) {
    const records = data.records || [];
    const session = data.sessions?.[0] || {};
    const laps = data.laps || [];

    // Calculate metrics
    const metrics = {
      totalTime: session.total_elapsed_time || 0,
      totalDistance: (session.total_distance || 0) / 1000, // Convert to km
      avgPace: this.calculatePace(session.avg_speed),
      avgHeartRate: session.avg_heart_rate || 0,
      maxHeartRate: session.max_heart_rate || 0,
      avgCadence: (session.avg_cadence || 0) * 2, // FIT stores as half cadence
      maxCadence: (session.max_cadence || 0) * 2,
      totalCalories: session.total_calories || 0,
      avgStrideLength: session.avg_stride_length || 0,
      verticalOscillation: session.avg_vertical_oscillation || 0,
      groundContactTime: session.avg_stance_time || 0,
      trainingEffect: session.total_training_effect || 0,
      laps: laps.map(lap => ({
        lapNumber: lap.message_index + 1,
        distance: (lap.total_distance || 0) / 1000,
        time: lap.total_elapsed_time || 0,
        pace: this.calculatePace(lap.avg_speed),
        heartRate: lap.avg_heart_rate || 0,
        cadence: (lap.avg_cadence || 0) * 2
      })),
      records: records.map(record => ({
        timestamp: record.timestamp,
        distance: (record.distance || 0) / 1000,
        speed: record.speed || 0,
        heartRate: record.heart_rate || 0,
        cadence: (record.cadence || 0) * 2,
        altitude: record.altitude || 0,
        verticalOscillation: record.vertical_oscillation || 0,
        groundContactTime: record.stance_time || 0
      }))
    };

    return metrics;
  }

  /**
   * Calculate pace in min/km from speed in m/s
   */
  calculatePace(speedMS) {
    if (!speedMS || speedMS === 0) return 0;
    const paceMinPerKm = 1000 / (speedMS * 60);
    return paceMinPerKm;
  }

  /**
   * Validate if file is a valid FIT file
   */
  static isValidFitFile(buffer) {
    if (!buffer || buffer.length < 12) return false;

    // Check FIT header signature
    const headerSize = buffer.readUInt8(0);
    const protocolVersion = buffer.readUInt8(1);
    const signature = buffer.toString('ascii', 8, 12);

    return headerSize >= 12 && protocolVersion <= 20 && signature === '.FIT';
  }
}

export default FitFileParser;
