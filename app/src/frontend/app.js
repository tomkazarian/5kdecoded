/**
 * Dynastride 5K Decoder - Frontend Application
 * Handles file upload, validation, and user interactions
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedExtensions: ['.fit', '.tcx', '.gpx'],
        allowedMimeTypes: [
            'application/octet-stream', // .FIT files
            'application/gpx+xml', // .GPX files
            'application/vnd.garmin.tcx+xml', // .TCX files
            'application/xml',
            'text/xml'
        ],
        uploadEndpoint: '/api/analyze',
        analysisEndpoint: '/api/analyze'
    };

    // DOM Elements
    const elements = {
        dropZone: document.getElementById('dropZone'),
        fileInput: document.getElementById('fileInput'),
        uploadProgress: document.getElementById('uploadProgress'),
        progressFill: document.getElementById('progressFill'),
        progressText: document.getElementById('progressText'),
        uploadError: document.getElementById('uploadError'),
        errorMessage: document.getElementById('errorMessage'),
        retryButton: document.getElementById('retryButton'),
        uploadSuccess: document.getElementById('uploadSuccess')
    };

    // State
    let currentFile = null;
    let uploadAbortController = null;

    /**
     * Initialize the application
     */
    function init() {
        setupEventListeners();
        setupSmoothScrolling();
        console.log('Dynastride 5K Decoder initialized');
    }

    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Drop zone events
        elements.dropZone?.addEventListener('click', () => elements.fileInput.click());
        elements.dropZone?.addEventListener('dragover', handleDragOver);
        elements.dropZone?.addEventListener('dragleave', handleDragLeave);
        elements.dropZone?.addEventListener('drop', handleDrop);

        // File input change
        elements.fileInput?.addEventListener('change', handleFileSelect);

        // Retry button
        elements.retryButton?.addEventListener('click', resetUpload);

        // Prevent default drag and drop behavior on document
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    /**
     * Setup smooth scrolling for anchor links
     */
    function setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    /**
     * Handle drag over event
     */
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        elements.dropZone?.classList.add('drag-over');
    }

    /**
     * Handle drag leave event
     */
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        elements.dropZone?.classList.remove('drag-over');
    }

    /**
     * Handle drop event
     */
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        elements.dropZone?.classList.remove('drag-over');

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    }

    /**
     * Handle file select from input
     */
    function handleFileSelect(e) {
        const files = e.target?.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    }

    /**
     * Validate and process selected file
     */
    function handleFile(file) {
        currentFile = file;

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            showError(validation.error);
            return;
        }

        // Start upload
        uploadFile(file);
    }

    /**
     * Validate file type and size
     */
    function validateFile(file) {
        // Check file size
        if (file.size > CONFIG.maxFileSize) {
            return {
                valid: false,
                error: `File size exceeds maximum limit of ${CONFIG.maxFileSize / 1024 / 1024}MB. Please upload a smaller file.`
            };
        }

        // Check file extension
        const fileName = file.name.toLowerCase();
        const hasValidExtension = CONFIG.allowedExtensions.some(ext => fileName.endsWith(ext));

        if (!hasValidExtension) {
            return {
                valid: false,
                error: `Invalid file type. Please upload a .FIT, .TCX, or .GPX file.`
            };
        }

        // Check file is not empty
        if (file.size === 0) {
            return {
                valid: false,
                error: 'The selected file is empty. Please choose a valid race file.'
            };
        }

        return { valid: true };
    }

    /**
     * Upload file to server
     */
    async function uploadFile(file) {
        // Hide previous states
        hideAllStates();

        // Show progress
        if (elements.uploadProgress) {
            elements.uploadProgress.style.display = 'block';
        }
        updateProgress(0);

        try {
            // Create FormData
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileType', getFileType(file.name));

            // Create abort controller for cancellation
            uploadAbortController = new AbortController();

            // Upload with progress tracking
            const response = await uploadWithProgress(formData, uploadAbortController.signal);

            if (response.ok) {
                const result = await response.json();
                handleUploadSuccess(result);
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Upload failed');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                showError('Upload cancelled');
            } else {
                showError(error.message || 'Failed to upload file. Please try again.');
            }
        } finally {
            uploadAbortController = null;
        }
    }

    /**
     * Upload file with progress tracking
     */
    function uploadWithProgress(formData, signal) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    updateProgress(percentComplete);
                }
            });

            // Handle completion
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve({
                        ok: true,
                        json: () => Promise.resolve(JSON.parse(xhr.responseText))
                    });
                } else {
                    reject(new Error(xhr.statusText));
                }
            });

            // Handle errors
            xhr.addEventListener('error', () => reject(new Error('Network error')));
            xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

            // Handle abort signal
            if (signal) {
                signal.addEventListener('abort', () => xhr.abort());
            }

            // Send request
            xhr.open('POST', CONFIG.uploadEndpoint);
            xhr.send(formData);
        });
    }

    /**
     * Update progress indicator
     */
    function updateProgress(percent) {
        const roundedPercent = Math.round(percent);
        if (elements.progressFill) {
            elements.progressFill.style.width = `${roundedPercent}%`;
        }
        if (elements.progressText) {
            elements.progressText.textContent = `Uploading... ${roundedPercent}%`;
        }
    }

    /**
     * Handle successful upload
     */
    function handleUploadSuccess(result) {
        console.log('Upload successful:', result);

        // Show success state
        hideAllStates();
        if (elements.uploadSuccess) {
            elements.uploadSuccess.style.display = 'block';
        }

        // Start analysis (or redirect to results page)
        setTimeout(() => {
            if (result.analysisUrl) {
                window.location.href = result.analysisUrl;
            } else if (result.fileId) {
                startAnalysis(result.fileId);
            }
        }, 1500);
    }

    /**
     * Start analysis of uploaded file
     */
    async function startAnalysis(fileId) {
        try {
            const response = await fetch(`${CONFIG.analysisEndpoint}/${fileId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                if (result.resultsUrl) {
                    window.location.href = result.resultsUrl;
                }
            } else {
                throw new Error('Analysis failed');
            }
        } catch (error) {
            showError('Failed to analyze file. Please contact support.');
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        hideAllStates();
        if (elements.uploadError) {
            elements.uploadError.style.display = 'block';
        }
        if (elements.errorMessage) {
            elements.errorMessage.textContent = message;
        }
    }

    /**
     * Hide all upload states
     */
    function hideAllStates() {
        if (elements.uploadProgress) {
            elements.uploadProgress.style.display = 'none';
        }
        if (elements.uploadError) {
            elements.uploadError.style.display = 'none';
        }
        if (elements.uploadSuccess) {
            elements.uploadSuccess.style.display = 'none';
        }
    }

    /**
     * Reset upload state
     */
    function resetUpload() {
        currentFile = null;
        if (elements.fileInput) {
            elements.fileInput.value = '';
        }
        hideAllStates();

        // Cancel ongoing upload if any
        if (uploadAbortController) {
            uploadAbortController.abort();
        }
    }

    /**
     * Get file type from filename
     */
    function getFileType(filename) {
        const extension = filename.toLowerCase().split('.').pop();
        return extension;
    }

    /**
     * Format file size for display
     */
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for testing (if needed)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            validateFile,
            formatFileSize,
            getFileType
        };
    }
})();
