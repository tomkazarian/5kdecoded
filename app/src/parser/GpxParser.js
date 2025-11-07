/**
 * GPX File Parser
 * Parses GPS Exchange Format files
 */
import { parseStringPromise } from 'xml2js';

export class GpxFileParser {
  /**
   * Parse GPX file and extract 5K metrics
   * @param {Buffer} fileBuffer - GPX file buffer
   * @returns {Promise<Object>} Parsed metrics
   */
  async parse(fileBuffer) {
    try {
      const xmlString = fileBuffer.toString('utf-8');
      const result = await parseStringPromise(xmlString);

      const tracks = result.gpx?.trk || [];
      if (tracks.length === 0) {
        throw new Error('No tracks found in GPX file');
      }

      const track = tracks[0];
      const metrics = this.extractMetrics(track);

      return metrics;
    } catch (error) {
      throw new Error(`GPX parsing error: ${error.message}`);
    }
  }

  /**
   * Extract relevant metrics from parsed GPX data
   */
  extractMetrics(track) {
    const segments = track.trkseg || [];
    const allTrackpoints = [];

    segments.forEach(segment => {
      const trackpoints = segment.trkpt || [];
      allTrackpoints.push(...trackpoints);
    });

    if (allTrackpoints.length === 0) {
      throw new Error('No trackpoints found in GPX file');
    }

    console.log(`[GPX] Processing ${allTrackpoints.length} trackpoints`);

    // Calculate metrics from trackpoints
    const distances = [];
    const times = [];
    const cumulativeTimes = [];
    let totalDistance = 0;
    let totalTime = 0;

    for (let i = 1; i < allTrackpoints.length; i++) {
      const prev = allTrackpoints[i - 1];
      const curr = allTrackpoints[i];

      const distance = this.calculateDistance(
        parseFloat(prev.$.lat),
        parseFloat(prev.$.lon),
        parseFloat(curr.$.lat),
        parseFloat(curr.$.lon)
      );

      totalDistance += distance;
      distances.push(totalDistance);

      if (curr.time?.[0] && prev.time?.[0]) {
        const timeDiff = (new Date(curr.time[0]) - new Date(prev.time[0])) / 1000;
        times.push(timeDiff);
        totalTime += timeDiff;
        cumulativeTimes.push(totalTime);
      }
    }

    console.log(`[GPX] Total distance: ${totalDistance.toFixed(2)} km, Total time: ${Math.floor(totalTime / 60)}:${Math.floor(totalTime % 60)} min`);

    // Extract heart rate data if available (multiple namespace support)
    const heartRates = allTrackpoints
      .map(tp => {
        if (!tp.extensions?.[0]) return 0;

        const ext = tp.extensions[0];
        let hr = null;

        // Try all common namespace variations
        const namespaces = ['ns3:', 'gpxtpx:', 'garmin:', ''];
        for (const ns of namespaces) {
          // Try TrackPointExtension wrapper
          const tpExt = ext[`${ns}TrackPointExtension`];
          if (tpExt?.[0]) {
            hr = tpExt[0][`${ns}hr`]?.[0] || tpExt[0]['hr']?.[0];
            if (hr) break;
          }
        }

        // If still not found, search all extension keys
        if (!hr) {
          for (const key in ext) {
            if (key.includes('TrackPointExtension') && ext[key]?.[0]) {
              const tpData = ext[key][0];
              for (const dataKey in tpData) {
                if (dataKey.includes('hr')) {
                  hr = tpData[dataKey]?.[0];
                  if (hr) break;
                }
              }
            }
          }
        }

        return hr ? parseInt(hr) : 0;
      })
      .filter(hr => hr > 0 && hr < 250); // Filter valid HR range

    const cadences = allTrackpoints
      .map(tp => {
        if (!tp.extensions?.[0]) return 0;

        const ext = tp.extensions[0];
        let cad = null;

        // Try all common namespace variations
        const namespaces = ['ns3:', 'gpxtpx:', 'garmin:', ''];
        for (const ns of namespaces) {
          // Try TrackPointExtension wrapper
          const tpExt = ext[`${ns}TrackPointExtension`];
          if (tpExt?.[0]) {
            cad = tpExt[0][`${ns}cad`]?.[0] || tpExt[0]['cad']?.[0];
            if (cad) break;
          }
        }

        // If still not found, search all extension keys
        if (!cad) {
          for (const key in ext) {
            if (key.includes('TrackPointExtension') && ext[key]?.[0]) {
              const tpData = ext[key][0];
              for (const dataKey in tpData) {
                if (dataKey.includes('cad')) {
                  cad = tpData[dataKey]?.[0];
                  if (cad) break;
                }
              }
            }
          }
        }

        return cad ? parseInt(cad) : 0;
      })
      .filter(cad => cad > 0 && cad < 200); // Filter valid cadence range

    console.log(`[GPX] Found ${heartRates.length} HR readings, ${cadences.length} cadence readings`);

    const avgHeartRate = heartRates.length > 0
      ? heartRates.reduce((a, b) => a + b, 0) / heartRates.length
      : 0;

    const maxHeartRate = heartRates.length > 0
      ? Math.max(...heartRates)
      : 0;

    const avgCadence = cadences.length > 0
      ? (cadences.reduce((a, b) => a + b, 0) / cadences.length) * 2 // Double for spm
      : 0;

    const maxCadence = cadences.length > 0
      ? Math.max(...cadences) * 2
      : 0;

    console.log(`[GPX] Avg HR: ${Math.round(avgHeartRate)}, Max HR: ${maxHeartRate}, Avg Cadence: ${Math.round(avgCadence)} spm`);

    const metrics = {
      totalTime,
      totalDistance,
      avgPace: this.calculatePace(totalDistance, totalTime),
      avgHeartRate: Math.round(avgHeartRate),
      maxHeartRate,
      avgCadence: Math.round(avgCadence),
      maxCadence,
      totalCalories: 0, // Not typically in GPX
      avgStrideLength: 0,
      verticalOscillation: 0,
      groundContactTime: 0,
      trainingEffect: 0,
      laps: this.calculateLaps(allTrackpoints, distances, times),
      records: allTrackpoints.map((tp, index) => {
        let hr = 0, cad = 0, temp = 0;

        if (tp.extensions?.[0]) {
          const ext = tp.extensions[0];
          // Try all namespace variations
          for (const ns of ['ns3:', 'gpxtpx:', 'garmin:', '']) {
            const tpExt = ext[`${ns}TrackPointExtension`];
            if (tpExt?.[0]) {
              if (!hr) hr = parseInt(tpExt[0][`${ns}hr`]?.[0] || tpExt[0]['hr']?.[0] || 0);
              if (!cad) cad = parseInt(tpExt[0][`${ns}cad`]?.[0] || tpExt[0]['cad']?.[0] || 0);
              if (!temp) temp = parseFloat(tpExt[0][`${ns}atemp`]?.[0] || tpExt[0]['atemp']?.[0] || 0);
              if (hr && cad) break;
            }
          }
        }

        return {
          timestamp: tp.time?.[0],
          distance: distances[index - 1] || 0,
          speed: 0,
          heartRate: hr,
          cadence: cad * 2, // Double for steps per minute
          altitude: parseFloat(tp.ele?.[0] || 0),
          temperature: temp,
          verticalOscillation: 0,
          groundContactTime: 0
        };
      })
    };

    return metrics;
  }

  /**
   * Calculate distance between two GPS coordinates (Haversine formula)
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate pace in min/km from distance and time
   */
  calculatePace(distanceKm, timeSeconds) {
    if (!distanceKm || distanceKm === 0) return 0;
    return (timeSeconds / 60) / distanceKm;
  }

  /**
   * Split run into 1km laps
   */
  calculateLaps(trackpoints, distances, times) {
    if (!distances || distances.length === 0) {
      console.log('[GPX] No distance data for lap calculation');
      return [];
    }

    const laps = [];
    let lapStartIndex = 0;
    let lapStartDistance = 0;
    let lapNumber = 1;
    const maxDistance = distances[distances.length - 1];

    console.log(`[GPX] Calculating laps from ${maxDistance.toFixed(2)} km run`);

    for (let i = 0; i < distances.length; i++) {
      const currentDistance = distances[i];

      // Create lap at each 1km mark (or at end of run)
      if (currentDistance >= lapNumber * 1.0 || i === distances.length - 1) {
        const lapDistance = currentDistance - lapStartDistance;
        const lapTimes = times.slice(lapStartIndex, i + 1);
        const lapTime = lapTimes.reduce((a, b) => a + b, 0);

        // Extract heart rate and cadence for this lap if available
        const lapTrackpoints = trackpoints.slice(lapStartIndex + 1, i + 2);
        const lapHeartRates = lapTrackpoints
          .map(tp => {
            if (!tp.extensions?.[0]) return 0;
            const ext = tp.extensions[0];

            // Try all namespace variations
            for (const ns of ['ns3:', 'gpxtpx:', 'garmin:', '']) {
              const tpExt = ext[`${ns}TrackPointExtension`];
              if (tpExt?.[0]) {
                const hr = tpExt[0][`${ns}hr`]?.[0] || tpExt[0]['hr']?.[0];
                if (hr) return parseInt(hr);
              }
            }
            return 0;
          })
          .filter(hr => hr > 0);

        const lapCadences = lapTrackpoints
          .map(tp => {
            if (!tp.extensions?.[0]) return 0;
            const ext = tp.extensions[0];

            // Try all namespace variations
            for (const ns of ['ns3:', 'gpxtpx:', 'garmin:', '']) {
              const tpExt = ext[`${ns}TrackPointExtension`];
              if (tpExt?.[0]) {
                const cad = tpExt[0][`${ns}cad`]?.[0] || tpExt[0]['cad']?.[0];
                if (cad) return parseInt(cad);
              }
            }
            return 0;
          })
          .filter(cad => cad > 0);

        const avgLapHR = lapHeartRates.length > 0
          ? Math.round(lapHeartRates.reduce((a, b) => a + b, 0) / lapHeartRates.length)
          : 0;

        const avgLapCadence = lapCadences.length > 0
          ? Math.round((lapCadences.reduce((a, b) => a + b, 0) / lapCadences.length) * 2)
          : 0;

        laps.push({
          lapNumber,
          distance: lapDistance,
          time: lapTime,
          pace: this.calculatePace(lapDistance, lapTime),
          avgHeartRate: avgLapHR,
          avgCadence: avgLapCadence
        });

        console.log(`[GPX] Lap ${lapNumber}: ${lapDistance.toFixed(2)} km in ${Math.floor(lapTime / 60)}:${String(Math.floor(lapTime % 60)).padStart(2, '0')}`);

        lapStartIndex = i + 1;
        lapStartDistance = currentDistance;
        lapNumber++;

        // Stop if we've covered the race distance
        if (currentDistance >= maxDistance) break;
      }
    }

    console.log(`[GPX] Created ${laps.length} laps`);
    return laps;
  }

  /**
   * Validate if file is a valid GPX file
   */
  static isValidGpxFile(buffer) {
    try {
      const xmlString = buffer.toString('utf-8');
      return xmlString.includes('<gpx') && xmlString.includes('<trk');
    } catch {
      return false;
    }
  }
}

export default GpxFileParser;
