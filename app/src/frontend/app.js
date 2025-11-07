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

        // Server returns complete analysis immediately
        // Store in sessionStorage and redirect to results page
        setTimeout(() => {
            if (result.success && result.metrics) {
                // Store analysis results
                sessionStorage.setItem('analysisResults', JSON.stringify(result));
                // Redirect to results page
                window.location.href = '/results.html';
            } else if (result.analysisUrl) {
                window.location.href = result.analysisUrl;
            } else if (result.fileId) {
                startAnalysis(result.fileId);
            } else {
                showError('Unexpected response format. Please try again.');
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

    /**
     * Initialize results page with analysis data
     * This function is called from results.html
     */
    function initializeResultsPage(analysisData) {
        console.log('Initializing results page with data:', analysisData);

        if (!analysisData || !analysisData.metrics) {
            console.error('Invalid analysis data');
            return;
        }

        const { metrics, analysis, recommendations } = analysisData;

        // Update performance score
        const performanceScore = analysis?.overallScore || 82;
        document.getElementById('score-value').textContent = performanceScore;
        document.getElementById('score-label').textContent = getScoreRating(performanceScore);

        // Update summary metrics
        updateSummaryMetrics(metrics);

        // Render all charts
        renderPerformanceGauge(performanceScore);
        renderPaceChart(metrics);
        renderHeartRateChart(metrics);
        renderCadenceChart(metrics);
        renderElevationChart(metrics);
        renderSplitsChart(metrics);
        renderFormGauges(metrics);

        // Render insights and recommendations
        if (analysis?.insights) {
            renderInsights(analysis.insights);
        }
        if (recommendations) {
            renderRecommendations(recommendations);
        }
    }

    function getScoreRating(score) {
        if (score >= 90) return 'Excellent';
        if (score >= 80) return 'Very Good';
        if (score >= 70) return 'Good';
        if (score >= 60) return 'Fair';
        return 'Needs Work';
    }

    function updateSummaryMetrics(metrics) {
        // Update total time
        const totalTimeEl = document.getElementById('total-time');
        if (totalTimeEl && metrics.totalTime) {
            totalTimeEl.textContent = formatTime(metrics.totalTime);
        }

        // Update distance
        const distanceEl = document.getElementById('distance');
        if (distanceEl && metrics.totalDistance) {
            distanceEl.textContent = `${metrics.totalDistance.toFixed(2)} km`;
        }

        // Update average pace
        const avgPaceEl = document.getElementById('avg-pace');
        if (avgPaceEl && metrics.avgPace) {
            avgPaceEl.textContent = formatPace(metrics.avgPace);
        }

        // Update heart rate metrics
        const avgHrEl = document.getElementById('avg-hr');
        if (avgHrEl && metrics.avgHeartRate) {
            avgHrEl.textContent = Math.round(metrics.avgHeartRate);
        }

        const maxHrEl = document.getElementById('max-hr');
        if (maxHrEl && metrics.maxHeartRate) {
            maxHrEl.textContent = Math.round(metrics.maxHeartRate);
        }

        // Update cadence
        const avgCadenceEl = document.getElementById('avg-cadence');
        if (avgCadenceEl && metrics.avgCadence) {
            avgCadenceEl.textContent = Math.round(metrics.avgCadence);
        }

        // Update elevation
        const elevationGainEl = document.getElementById('elevation-gain');
        if (elevationGainEl && metrics.totalElevationGain) {
            elevationGainEl.textContent = Math.round(metrics.totalElevationGain);
        }

        const elevationLossEl = document.getElementById('elevation-loss');
        if (elevationLossEl && metrics.totalElevationLoss) {
            elevationLossEl.textContent = Math.round(metrics.totalElevationLoss);
        }

        // Update VO2 max if available
        const vo2maxEl = document.getElementById('vo2max');
        const vo2maxLabelEl = document.getElementById('vo2max-label');
        if (vo2maxEl && metrics.vo2Max) {
            vo2maxEl.textContent = metrics.vo2Max.toFixed(1);
            if (vo2maxLabelEl) {
                vo2maxLabelEl.textContent = getVO2MaxLabel(metrics.vo2Max);
            }
        }
    }

    function renderPerformanceGauge(score) {
        const canvas = document.getElementById('gaugeChart');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [score, 100 - score],
                    backgroundColor: ['#10b981', '#e5e7eb'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '75%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
    }

    function renderPaceChart(metrics) {
        const canvas = document.getElementById('paceChart');
        if (!canvas || !window.Chart || !metrics.laps) return;

        const ctx = canvas.getContext('2d');
        const labels = metrics.laps.map((_, idx) => `Km ${idx + 1}`);
        const paceData = metrics.laps.map(lap => lap.pace);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pace (min/km)',
                    data: paceData,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => formatPace(context.parsed.y)
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: (value) => formatPace(value)
                        }
                    }
                }
            }
        });
    }

    function renderHeartRateChart(metrics) {
        const canvas = document.getElementById('hrChart');
        if (!canvas || !window.Chart || !metrics.laps) return;

        const ctx = canvas.getContext('2d');
        const labels = metrics.laps.map((_, idx) => `Km ${idx + 1}`);
        const hrData = metrics.laps.map(lap => lap.avgHeartRate);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Heart Rate (bpm)',
                    data: hrData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    function renderCadenceChart(metrics) {
        const canvas = document.getElementById('cadenceChart');
        if (!canvas || !window.Chart || !metrics.laps) return;

        const ctx = canvas.getContext('2d');
        const labels = metrics.laps.map((_, idx) => `${idx + 1}`);
        const cadenceData = metrics.laps.map(lap => lap.avgCadence);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Cadence (spm)',
                    data: cadenceData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    annotation: {
                        annotations: {
                            optimalLow: {
                                type: 'line',
                                yMin: 170,
                                yMax: 170,
                                borderColor: 'rgba(16, 185, 129, 0.5)',
                                borderWidth: 2,
                                borderDash: [5, 5]
                            },
                            optimalHigh: {
                                type: 'line',
                                yMin: 180,
                                yMax: 180,
                                borderColor: 'rgba(16, 185, 129, 0.5)',
                                borderWidth: 2,
                                borderDash: [5, 5]
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 140,
                        max: 200
                    }
                }
            }
        });
    }

    function renderElevationChart(metrics) {
        const canvas = document.getElementById('elevationChart');
        if (!canvas || !window.Chart || !metrics.laps) return;

        const ctx = canvas.getContext('2d');
        const labels = metrics.laps.map((_, idx) => `${idx + 1}`);
        const elevationData = metrics.laps.map(lap => lap.elevation || 0);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Elevation (m)',
                    data: elevationData,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    function renderSplitsChart(metrics) {
        const canvas = document.getElementById('splitsChart');
        if (!canvas || !window.Chart || !metrics.laps) return;

        const ctx = canvas.getContext('2d');
        const labels = metrics.laps.map((_, idx) => `Km ${idx + 1}`);
        const splitTimes = metrics.laps.map(lap => lap.totalTime / 60); // Convert to minutes

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Split Time (minutes)',
                    data: splitTimes,
                    backgroundColor: '#667eea',
                    borderColor: '#667eea',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => formatTime(context.parsed.y * 60)
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => `${value.toFixed(1)} min`
                        }
                    }
                }
            }
        });
    }

    function renderFormGauges(metrics) {
        // Ground Contact Time Gauge
        if (metrics.groundContactTime > 0) {
            renderGauge('gctGauge', metrics.groundContactTime, 200, 250, 'ms');
            const gctValueEl = document.getElementById('gct-value');
            if (gctValueEl) {
                gctValueEl.textContent = `${metrics.groundContactTime} ms`;
            }
        }

        // Vertical Oscillation Gauge
        if (metrics.verticalOscillation > 0) {
            renderGauge('voGauge', metrics.verticalOscillation, 6, 10, 'cm');
            const voValueEl = document.getElementById('vo-value');
            if (voValueEl) {
                voValueEl.textContent = `${metrics.verticalOscillation.toFixed(1)} cm`;
            }
        }

        // Stride Length Gauge
        if (metrics.avgStrideLength > 0) {
            renderGauge('strideGauge', metrics.avgStrideLength, 1.0, 1.4, 'm');
            const strideValueEl = document.getElementById('stride-value');
            if (strideValueEl) {
                strideValueEl.textContent = `${metrics.avgStrideLength.toFixed(2)} m`;
            }
        }
    }

    function renderGauge(canvasId, value, minOptimal, maxOptimal, unit) {
        const canvas = document.getElementById(canvasId);
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');
        const isInRange = value >= minOptimal && value <= maxOptimal;
        const percentage = Math.min(Math.max((value / maxOptimal) * 100, 0), 100);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [percentage, 100 - percentage],
                    backgroundColor: [
                        isInRange ? '#10b981' : '#f59e0b',
                        '#e5e7eb'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
    }

    function renderInsights(insights) {
        const insightsGrid = document.getElementById('insights-grid');
        if (!insightsGrid) return;

        insightsGrid.innerHTML = '';

        // Handle different insight structures
        let allInsights = [];

        // If insights is an array
        if (Array.isArray(insights)) {
            allInsights = insights;
        }
        // If insights has nested analysis objects
        else if (typeof insights === 'object') {
            if (insights.paceAnalysis && Array.isArray(insights.paceAnalysis)) {
                allInsights.push(...insights.paceAnalysis);
            }
            if (insights.heartRateAnalysis && Array.isArray(insights.heartRateAnalysis)) {
                allInsights.push(...insights.heartRateAnalysis);
            }
            if (insights.cadenceAnalysis && Array.isArray(insights.cadenceAnalysis)) {
                allInsights.push(...insights.cadenceAnalysis);
            }
            if (insights.formAnalysis && Array.isArray(insights.formAnalysis)) {
                allInsights.push(...insights.formAnalysis);
            }
        }

        // Take top 6 insights or show all if less
        const displayInsights = allInsights.slice(0, 6);

        if (displayInsights.length === 0) {
            insightsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6b7280;">No insights available</p>';
            return;
        }

        displayInsights.forEach(insight => {
            const card = document.createElement('div');
            const insightType = insight.type || 'finding';
            card.className = `insight-card ${insightType}`;

            const icon = insightType === 'strength' ? '✓' :
                        insightType === 'weakness' ? '!' :
                        insightType === 'improvement' ? '⚠' : '•';
            const color = insightType === 'strength' ? '#10b981' :
                         insightType === 'weakness' ? '#ef4444' :
                         insightType === 'improvement' ? '#f59e0b' : '#667eea';

            card.innerHTML = `
                <div class="insight-icon" style="color: ${color}">${icon}</div>
                <div class="insight-content">
                    <h4 class="insight-title">${insight.message}</h4>
                    ${insight.confidence ? `<div class="confidence-badge">${insight.confidence}% Confidence</div>` : ''}
                </div>
            `;

            insightsGrid.appendChild(card);
        });
    }

    function renderRecommendations(recommendations) {
        // Update goal time
        const goalTimeEl = document.getElementById('goal-time');
        const goalImprovementEl = document.getElementById('goal-improvement');

        if (recommendations.timeGoals && recommendations.timeGoals.goals) {
            const primaryGoal = recommendations.timeGoals.goals[1]; // 3-month goal
            if (goalTimeEl) {
                goalTimeEl.textContent = primaryGoal.targetTime;
            }
            if (goalImprovementEl) {
                goalImprovementEl.textContent = `${primaryGoal.improvement} improvement`;
            }
        }

        // Update training focus
        const focusList = document.getElementById('focus-list');
        if (focusList && recommendations.trainingPlan) {
            focusList.innerHTML = '';
            recommendations.trainingPlan.priorities.slice(0, 3).forEach(priority => {
                const li = document.createElement('li');
                li.textContent = priority.focus;
                focusList.appendChild(li);
            });
        }

        // Update recommendations list
        const recommendationsList = document.getElementById('recommendations-list');
        if (recommendationsList && recommendations.trainingPlan) {
            recommendationsList.innerHTML = '';
            recommendations.trainingPlan.priorities.forEach((priority, index) => {
                const card = document.createElement('div');
                card.className = 'recommendation-card';
                card.innerHTML = `
                    <h4>${index + 1}. ${priority.focus}</h4>
                    <p>${priority.rationale}</p>
                    <div class="confidence-badge">${priority.confidence}% Confidence</div>
                `;
                recommendationsList.appendChild(card);
            });
        }

        // Update weekly structure
        const weekGrid = document.getElementById('week-grid');
        if (weekGrid && recommendations.weeklyStructure) {
            weekGrid.innerHTML = '';
            recommendations.weeklyStructure.structure.forEach(day => {
                const dayCard = document.createElement('div');
                dayCard.className = 'day-card';
                dayCard.innerHTML = `
                    <div class="day-label">${day.day}</div>
                    <div class="day-workout">
                        <div class="workout-type">${day.workout}</div>
                        ${day.duration || day.pace ? `
                            <div class="workout-details">
                                ${day.duration ? `Duration: ${day.duration}` : ''}
                                ${day.duration && day.pace ? ' | ' : ''}
                                ${day.pace ? `Pace: ${day.pace}` : ''}
                            </div>
                        ` : ''}
                    </div>
                `;
                weekGrid.appendChild(dayCard);
            });
        }
    }

    // Helper functions for formatting
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.round(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    function formatPace(paceMinPerKm) {
        const minutes = Math.floor(paceMinPerKm);
        const seconds = Math.round((paceMinPerKm - minutes) * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    function getVO2MaxLabel(vo2max) {
        if (vo2max >= 55) return 'Excellent';
        if (vo2max >= 45) return 'Good';
        if (vo2max >= 35) return 'Average';
        return 'Below Average';
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export functions for use in other pages
    window.initializeResultsPage = initializeResultsPage;

    // Export for testing (if needed)
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            validateFile,
            formatFileSize,
            getFileType,
            initializeResultsPage
        };
    }
})();
