/**
 * PDF Layout Templates
 * Reusable templates for consistent PDF generation
 */

export const PDFTemplates = {
  /**
   * Standard page dimensions (A4 in mm)
   */
  page: {
    width: 210,
    height: 297,
    margins: {
      top: 30,
      right: 20,
      bottom: 20,
      left: 20
    }
  },

  /**
   * Typography scales
   */
  typography: {
    title: 24,
    heading1: 18,
    heading2: 14,
    heading3: 12,
    body: 10,
    small: 9,
    tiny: 8
  },

  /**
   * Color palette (Dynastride.com branding)
   */
  colors: {
    primary: '#667eea',
    secondary: '#764ba2',
    accent: '#00c9ff',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      light: '#9ca3af'
    },
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      accent: '#f3f4f6'
    }
  },

  /**
   * Spacing system
   */
  spacing: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24
  },

  /**
   * Chart templates
   */
  charts: {
    /**
     * Standard chart dimensions
     */
    dimensions: {
      width: 170,
      height: 50
    },

    /**
     * Chart color schemes
     */
    colors: {
      pace: {
        line: '#667eea',
        fill: 'rgba(102, 126, 234, 0.1)'
      },
      heartRate: {
        line: '#ef4444',
        fill: 'rgba(239, 68, 68, 0.1)'
      },
      cadence: {
        line: '#10b981',
        fill: 'rgba(16, 185, 129, 0.1)'
      }
    }
  },

  /**
   * Card/Box templates
   */
  components: {
    /**
     * Info card with rounded corners
     */
    card: {
      borderRadius: 3,
      padding: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5
      },
      backgroundColor: '#f9fafb'
    },

    /**
     * Highlight box
     */
    highlight: {
      borderRadius: 5,
      padding: {
        top: 8,
        right: 10,
        bottom: 8,
        left: 10
      },
      backgroundColor: 'rgba(102, 126, 234, 0.1)'
    },

    /**
     * Table row
     */
    tableRow: {
      height: 8,
      alternateBackground: '#f9fafb'
    }
  },

  /**
   * Icon/Badge templates
   */
  badges: {
    confidence: {
      high: { color: '#10b981', label: 'High Confidence' },
      medium: { color: '#f59e0b', label: 'Medium Confidence' },
      low: { color: '#ef4444', label: 'Low Confidence' }
    },
    status: {
      strength: { icon: '✓', color: '#10b981' },
      weakness: { icon: '!', color: '#ef4444' },
      neutral: { icon: '•', color: '#6b7280' },
      info: { icon: 'ℹ', color: '#667eea' }
    }
  },

  /**
   * Layout helpers
   */
  layout: {
    /**
     * Two-column layout
     */
    twoColumn: {
      column1: { x: 20, width: 80 },
      column2: { x: 105, width: 85 },
      gutter: 5
    },

    /**
     * Three-column layout
     */
    threeColumn: {
      column1: { x: 20, width: 53 },
      column2: { x: 76, width: 53 },
      column3: { x: 132, width: 53 },
      gutter: 3
    }
  },

  /**
   * Data visualization templates
   */
  visualization: {
    /**
     * Progress bar
     */
    progressBar: {
      height: 6,
      borderRadius: 3,
      backgroundColor: '#e5e7eb',
      fillColor: '#667eea'
    },

    /**
     * Score gauge
     */
    gauge: {
      radius: 20,
      strokeWidth: 4,
      backgroundColor: '#e5e7eb',
      getColor: (score) => {
        if (score >= 85) return '#10b981';
        if (score >= 70) return '#667eea';
        if (score >= 60) return '#f59e0b';
        return '#ef4444';
      }
    }
  }
};

/**
 * Helper functions for template usage
 */
export const TemplateHelpers = {
  /**
   * Convert hex color to RGB array for jsPDF
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  },

  /**
   * Apply rgba color with alpha
   */
  applyRgbaColor(pdf, hex, alpha = 1) {
    const [r, g, b] = this.hexToRgb(hex);
    pdf.setFillColor(r, g, b);
    if (alpha < 1) {
      pdf.setGState(new pdf.GState({ opacity: alpha }));
    }
  },

  /**
   * Draw rounded rectangle (helper wrapper)
   */
  drawCard(pdf, x, y, width, height, template = PDFTemplates.components.card) {
    const rgb = this.hexToRgb(template.backgroundColor);
    pdf.setFillColor(...rgb);
    pdf.roundedRect(x, y, width, height, template.borderRadius, template.borderRadius, 'F');
  },

  /**
   * Draw confidence badge
   */
  drawConfidenceBadge(pdf, x, y, confidence) {
    const template = confidence >= 85 ? PDFTemplates.badges.confidence.high :
                     confidence >= 70 ? PDFTemplates.badges.confidence.medium :
                     PDFTemplates.badges.confidence.low;

    const rgb = this.hexToRgb(template.color);
    pdf.setFillColor(...rgb);
    pdf.roundedRect(x, y, 20, 4, 2, 2, 'F');

    pdf.setFontSize(7);
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`${confidence}%`, x + 10, y + 3, { align: 'center' });
  },

  /**
   * Draw status icon
   */
  drawStatusIcon(pdf, x, y, type) {
    const badge = PDFTemplates.badges.status[type] || PDFTemplates.badges.status.neutral;
    const rgb = this.hexToRgb(badge.color);

    pdf.setFillColor(...rgb);
    pdf.circle(x, y, 2, 'F');

    return badge.icon;
  },

  /**
   * Calculate text width
   */
  getTextWidth(pdf, text, fontSize = 10) {
    pdf.setFontSize(fontSize);
    return pdf.getTextWidth(text);
  },

  /**
   * Draw table row
   */
  drawTableRow(pdf, x, y, columns, isAlternate = false) {
    const template = PDFTemplates.components.tableRow;

    if (isAlternate) {
      const rgb = this.hexToRgb(template.alternateBackground);
      pdf.setFillColor(...rgb);
      const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);
      pdf.rect(x, y - 3, totalWidth, template.height, 'F');
    }

    let currentX = x;
    columns.forEach(col => {
      pdf.setFontSize(col.fontSize || 10);
      pdf.setFont('helvetica', col.bold ? 'bold' : 'normal');
      pdf.setTextColor(...this.hexToRgb(col.color || PDFTemplates.colors.text.primary));

      const align = col.align || 'left';
      const textX = align === 'right' ? currentX + col.width :
                   align === 'center' ? currentX + col.width / 2 :
                   currentX;

      pdf.text(col.text, textX, y, { align });
      currentX += col.width;
    });
  },

  /**
   * Format metric value with units
   */
  formatMetric(value, unit, decimals = 0) {
    return `${typeof value === 'number' ? value.toFixed(decimals) : value} ${unit}`;
  },

  /**
   * Split long text into lines
   */
  wrapText(pdf, text, maxWidth, fontSize = 10) {
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(text, maxWidth);
  },

  /**
   * Draw divider line
   */
  drawDivider(pdf, x1, y, x2, color = '#e5e7eb', thickness = 0.5) {
    const rgb = this.hexToRgb(color);
    pdf.setDrawColor(...rgb);
    pdf.setLineWidth(thickness);
    pdf.line(x1, y, x2, y);
  }
};

export default PDFTemplates;
