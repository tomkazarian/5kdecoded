/**
 * PDF Export Integration
 * Handles PDF generation and download from the frontend
 */

/**
 * Export current analysis to PDF
 */
async function exportToPDF() {
  if (!analysisData) {
    alert('No analysis data available. Please upload a file first.');
    return;
  }

  // Show loading indicator
  const button = event.target;
  const originalText = button.innerHTML;
  button.innerHTML = '⏳ Generating PDF...';
  button.disabled = true;

  try {
    // Dynamically import jsPDF and PDFGenerator
    const { jsPDF } = window.jspdf;

    // Import PDFGenerator module
    const PDFGenerator = await import('../pdf-export/PDFGenerator.js').then(m => m.PDFGenerator);

    // Create generator instance
    const generator = new PDFGenerator();

    // Generate PDF
    const pdf = await generator.generatePDF(analysisData);

    // Create filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `Dynastride-5K-Analysis-${date}.pdf`;

    // Download PDF
    pdf.save(filename);

    // Show success message
    showNotification('PDF exported successfully!', 'success');

  } catch (error) {
    console.error('PDF export failed:', error);
    alert('Failed to export PDF: ' + error.message);
  } finally {
    // Restore button
    button.innerHTML = originalText;
    button.disabled = false;
  }
}

/**
 * Show notification message
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#667eea'};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 9999;
    animation: slideIn 0.3s ease-out;
    font-weight: 500;
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
  }

  .btn-primary:active {
    transform: translateY(0);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;
document.head.appendChild(style);

// Make function globally available
window.exportToPDF = exportToPDF;
