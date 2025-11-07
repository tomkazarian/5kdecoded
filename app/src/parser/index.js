/**
 * Universal Parser
 * Automatically detects file format and uses appropriate parser
 */
import { FitFileParser } from './FitParser.js';
import { TcxFileParser } from './TcxParser.js';
import { GpxFileParser } from './GpxParser.js';

export class UniversalParser {
  constructor() {
    this.fitParser = new FitFileParser();
    this.tcxParser = new TcxFileParser();
    this.gpxParser = new GpxFileParser();
  }

  /**
   * Parse any supported file format
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} filename - Original filename for format hint
   * @returns {Promise<Object>} Parsed metrics
   */
  async parse(fileBuffer, filename = '') {
    try {
      // Detect file format
      const format = this.detectFormat(fileBuffer, filename);

      switch (format) {
        case 'fit':
          return await this.fitParser.parse(fileBuffer);
        case 'tcx':
          return await this.tcxParser.parse(fileBuffer);
        case 'gpx':
          return await this.gpxParser.parse(fileBuffer);
        default:
          throw new Error('Unsupported file format. Please upload a FIT, TCX, or GPX file.');
      }
    } catch (error) {
      throw new Error(`Parsing failed: ${error.message}`);
    }
  }

  /**
   * Detect file format from buffer and filename
   */
  detectFormat(buffer, filename) {
    const lowerFilename = filename.toLowerCase();

    // Try filename extension first
    if (lowerFilename.endsWith('.fit') && FitFileParser.isValidFitFile(buffer)) {
      return 'fit';
    }
    if (lowerFilename.endsWith('.tcx') && TcxFileParser.isValidTcxFile(buffer)) {
      return 'tcx';
    }
    if (lowerFilename.endsWith('.gpx') && GpxFileParser.isValidGpxFile(buffer)) {
      return 'gpx';
    }

    // Try content-based detection
    if (FitFileParser.isValidFitFile(buffer)) {
      return 'fit';
    }
    if (TcxFileParser.isValidTcxFile(buffer)) {
      return 'tcx';
    }
    if (GpxFileParser.isValidGpxFile(buffer)) {
      return 'gpx';
    }

    return 'unknown';
  }

  /**
   * Get list of supported formats
   */
  static getSupportedFormats() {
    return ['FIT', 'TCX', 'GPX'];
  }
}

export { FitFileParser, TcxFileParser, GpxFileParser };
export default UniversalParser;
