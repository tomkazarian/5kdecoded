/**
 * FIT File Parser
 * Parses Garmin FIT files and extracts running metrics
 */
import FitParserLib from 'fit-file-parser';

export class FitFileParser {
  constructor() {
    // Handle nested default exports from fit-file-parser
    const FitParser = FitParserLib.default?.default || FitParserLib.default || FitParserLib;
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

    console.log('[FIT] Processing FIT file...');
    console.log(`[FIT] Session distance: ${session.total_distance?.toFixed(2)} km, time: ${Math.floor((session.total_elapsed_time || 0) / 60)}:${String(Math.floor((session.total_elapsed_time || 0) % 60)).padStart(2, '0')}`);
    console.log(`[FIT] Records: ${records.length}, Laps: ${laps.length}`);

    // FIT files from fit-file-parser return distances already in km, not meters
    const avgSpeed = session.enhanced_avg_speed || session.avg_speed || 0;

    // Calculate metrics
    const metrics = {
      totalTime: session.total_elapsed_time || 0,
      totalDistance: session.total_distance || 0, // Already in km!
      avgPace: this.calculatePaceFromKmh(avgSpeed),
      avgHeartRate: session.avg_heart_rate || 0,
      maxHeartRate: session.max_heart_rate || 0,
      avgCadence: (session.avg_cadence || 0) * 2, // FIT stores as half cadence
      maxCadence: (session.max_cadence || 0) * 2,
      totalCalories: session.total_calories || 0,
      avgStrideLength: session.avg_stride_length || 0,
      verticalOscillation: session.avg_vertical_oscillation || 0,
      groundContactTime: session.avg_stance_time || 0,
      trainingEffect: session.total_training_effect || 0,
      laps: laps.map((lap, index) => {
        const lapSpeed = lap.enhanced_avg_speed || lap.avg_speed || 0;
        // message_index is an object with .value property
        const lapNum = typeof lap.message_index === 'object' ? (lap.message_index.value + 1) : (lap.message_index + 1 || index + 1);

        return {
          lapNumber: lapNum,
          distance: lap.total_distance || 0, // Already in km
          time: lap.total_elapsed_time || 0,
          pace: this.calculatePaceFromKmh(lapSpeed),
          avgHeartRate: lap.avg_heart_rate || 0,
          maxHeartRate: lap.max_heart_rate || 0,
          avgCadence: (lap.avg_cadence || 0) * 2,
          maxCadence: (lap.max_cadence || 0) * 2
        };
      }),
      records: records.map(record => {
        const speed = record.enhanced_speed || record.speed || 0;
        return {
          timestamp: record.timestamp,
          distance: record.distance || 0, // Already in km
          speed: speed,
          heartRate: record.heart_rate || 0,
          cadence: (record.cadence || 0) * 2,
          altitude: record.enhanced_altitude || record.altitude || 0,
          temperature: record.temperature || 0,
          verticalOscillation: record.vertical_oscillation || 0,
          groundContactTime: record.stance_time || 0
        };
      })
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
   * Calculate pace in min/km from speed in km/h
   */
  calculatePaceFromKmh(speedKmh) {
    if (!speedKmh || speedKmh === 0) return 0;
    // Convert km/h to min/km
    const paceMinPerKm = 60 / speedKmh;
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
