/**
 * TCX File Parser
 * Parses Garmin TCX (Training Center XML) files
 */
import { parseStringPromise } from 'xml2js';

export class TcxFileParser {
  /**
   * Parse TCX file and extract 5K metrics
   * @param {Buffer} fileBuffer - TCX file buffer
   * @returns {Promise<Object>} Parsed metrics
   */
  async parse(fileBuffer) {
    try {
      const xmlString = fileBuffer.toString('utf-8');
      const result = await parseStringPromise(xmlString);

      const activities = result.TrainingCenterDatabase?.Activities?.[0]?.Activity || [];
      if (activities.length === 0) {
        throw new Error('No activities found in TCX file');
      }

      const activity = activities[0];
      const metrics = this.extractMetrics(activity);

      return metrics;
    } catch (error) {
      throw new Error(`TCX parsing error: ${error.message}`);
    }
  }

  /**
   * Extract relevant metrics from parsed TCX data
   */
  extractMetrics(activity) {
    const laps = activity.Lap || [];
    const allTrackpoints = [];

    // Collect all trackpoints from all laps
    laps.forEach(lap => {
      const tracks = lap.Track || [];
      tracks.forEach(track => {
        const trackpoints = track.Trackpoint || [];
        allTrackpoints.push(...trackpoints);
      });
    });

    // Calculate session-level metrics
    const totalTime = laps.reduce((sum, lap) => sum + parseFloat(lap.TotalTimeSeconds?.[0] || 0), 0);
    const totalDistance = laps.reduce((sum, lap) => sum + parseFloat(lap.DistanceMeters?.[0] || 0), 0) / 1000;

    const heartRates = allTrackpoints
      .map(tp => parseInt(tp.HeartRateBpm?.[0]?.Value?.[0] || 0))
      .filter(hr => hr > 0);

    const cadences = allTrackpoints
      .map(tp => parseInt(tp.Cadence?.[0] || 0))
      .filter(cad => cad > 0);

    const avgHeartRate = heartRates.length > 0
      ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length
      : 0;

    const maxHeartRate = heartRates.length > 0
      ? Math.max(...heartRates)
      : 0;

    const avgCadence = cadences.length > 0
      ? (cadences.reduce((a, b) => a + b, 0) / cadences.length) * 2 // Convert to steps per minute
      : 0;

    const maxCadence = cadences.length > 0
      ? Math.max(...cadences) * 2
      : 0;

    const totalCalories = laps.reduce((sum, lap) => sum + parseInt(lap.Calories?.[0] || 0), 0);

    const metrics = {
      totalTime,
      totalDistance,
      avgPace: this.calculatePace(totalDistance, totalTime),
      avgHeartRate: Math.round(avgHeartRate),
      maxHeartRate,
      avgCadence: Math.round(avgCadence),
      maxCadence,
      totalCalories,
      avgStrideLength: 0, // Not typically available in TCX
      verticalOscillation: 0,
      groundContactTime: 0,
      trainingEffect: 0,
      laps: laps.map((lap, index) => ({
        lapNumber: index + 1,
        distance: parseFloat(lap.DistanceMeters?.[0] || 0) / 1000,
        time: parseFloat(lap.TotalTimeSeconds?.[0] || 0),
        pace: this.calculatePace(
          parseFloat(lap.DistanceMeters?.[0] || 0) / 1000,
          parseFloat(lap.TotalTimeSeconds?.[0] || 0)
        ),
        heartRate: parseInt(lap.AverageHeartRateBpm?.[0]?.Value?.[0] || 0),
        cadence: parseInt(lap.Cadence?.[0] || 0) * 2
      })),
      records: allTrackpoints.map(tp => ({
        timestamp: tp.Time?.[0],
        distance: parseFloat(tp.DistanceMeters?.[0] || 0) / 1000,
        speed: this.calculateSpeed(tp),
        heartRate: parseInt(tp.HeartRateBpm?.[0]?.Value?.[0] || 0),
        cadence: parseInt(tp.Cadence?.[0] || 0) * 2,
        altitude: parseFloat(tp.AltitudeMeters?.[0] || 0),
        verticalOscillation: 0,
        groundContactTime: 0
      }))
    };

    return metrics;
  }

  /**
   * Calculate pace in min/km from distance and time
   */
  calculatePace(distanceKm, timeSeconds) {
    if (!distanceKm || distanceKm === 0) return 0;
    return (timeSeconds / 60) / distanceKm;
  }

  /**
   * Calculate speed from trackpoint data
   */
  calculateSpeed(trackpoint) {
    // TCX doesn't always include speed, would need to calculate from distance changes
    return 0;
  }

  /**
   * Validate if file is a valid TCX file
   */
  static isValidTcxFile(buffer) {
    try {
      const xmlString = buffer.toString('utf-8');
      return xmlString.includes('TrainingCenterDatabase') &&
             xmlString.includes('<Activities>');
    } catch {
      return false;
    }
  }
}

export default TcxFileParser;
