// Import Management Component
class ImportManager {
    constructor() {
        this.supportedFormats = CONFIG.IMPORT.SUPPORTED_FORMATS;
        this.maxFileSize = CONFIG.IMPORT.MAX_FILE_SIZE;
        this.currentFile = null;
        this.importData = null;
        this.importProgress = 0;
        
        this.init();
    }

    /**
     * Initialize import manager
     */
    init() {
        this.bindEvents();
        this.setupDropZone();
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // File input
        const fileInput = document.getElementById('importFile');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files[0]);
            });
        }

        // Import button
        const importBtn = document.getElementById('startImport');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                this.startImport();
            });
        }

        // Import type change
        const importType = document.getElementById('importType');
        if (importType) {
            importType.addEventListener('change', () => {
                this.updateImportInstructions();
            });
        }
    }

    /**
     * Setup drag and drop functionality
     */
    setupDropZone() {
        const importSection = document.getElementById('import-section');
        if (!importSection) return;

        const dropZone = importSection.querySelector('.card');
        if (!dropZone) return;

        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });

        // Highlight drop zone when dragging
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('dragover');
            });
        });

        // Handle dropped files
        dropZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
    }

    /**
     * Prevent default drag behaviors
     * @param {Event} e - Event object
     */
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    /**
     * Handle file selection
     * @param {File} file - Selected file
     */
    handleFileSelect(file) {
        if (!file) {
            this.currentFile = null;
            this.updateImportButton();
            return;
        }

        // Validate file
        const validation = this.validateFile(file);
        if (!validation.isValid) {
            Utils.showAlert(`Błąd pliku: ${validation.errors.join(', ')}`, 'danger');
            this.currentFile = null;
            this.updateImportButton();
            return;
        }

        this.currentFile = file;
        this.showFileInfo();
        this.updateImportButton();

        // Try to parse file for preview
        this.parseFilePreview(file);
    }

    /**
     * Validate selected file
     * @param {File} file - File to validate
     * @returns {Object} Validation result
     */
    validateFile(file) {
        const errors = [];

        // Check file size
        if (file.size > this.maxFileSize) {
            errors.push(`Plik jest zbyt duży (max. ${Utils.formatFileSize(this.maxFileSize)})`);
        }

        // Check file extension
        const extension = '.' + file.name.split('.').pop().toLowerCase();
        if (!this.supportedFormats.includes(extension)) {
            errors.push(`Nieobsługiwany format pliku (obsługiwane: ${this.supportedFormats.join(', ')})`);
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Show file information
     */
    showFileInfo() {
        if (!this.currentFile) return;

        const fileInfo = `
            <div class="alert alert-info mt-3">
                <h6><i class="bi bi-file-earmark"></i> Wybrany plik:</h6>
                <ul class="mb-0">
                    <li><strong>Nazwa:</strong> ${Utils.escapeHTML(this.currentFile.name)}</li>
                    <li><strong>Rozmiar:</strong> ${Utils.formatFileSize(this.currentFile.size)}</li>
                    <li><strong>Typ:</strong> ${this.currentFile.type || 'Nieznany'}</li>
                    <li><strong>Ostatnia modyfikacja:</strong> ${Utils.formatDate(this.currentFile.lastModified, 'datetime')}</li>
                </ul>
            </div>
        `;

        // Remove existing file info
        const existingInfo = document.querySelector('#import-section .alert-info');
        if (existingInfo) {
            existingInfo.remove();
        }

        // Add new file info
        const importCard = document.querySelector('#import-section .card');
        if (importCard) {
            importCard.insertAdjacentHTML('afterend', fileInfo);
        }
    }

    /**
     * Parse file for preview
     * @param {File} file - File to parse
     */
    async parseFilePreview(file) {
        try {
            const extension = '.' + file.name.split('.').pop().toLowerCase();
            let data = null;

            switch (extension) {
                case '.json':
                    data = await this.parseJSON(file);
                    break;
                case '.csv':
                    data = await this.parseCSV(file);
                    break;
                case '.xlsx':
                case '.xls':
                    // For Excel files, we'll rely on server-side parsing
                    this.showPreviewMessage('Podgląd plików Excel będzie dostępny po przesłaniu na serwer');
                    return;
                default:
                    throw new Error('Nieobsługiwany format pliku');
            }

            if (data && data.length > 0) {
                this.importData = data;
                this.showDataPreview(data.slice(0, CONFIG.IMPORT.PREVIEW_ROWS));
            } else {
                this.showPreviewMessage('Plik wydaje się być pusty lub ma nieprawidłowy format');
            }

        } catch (error) {
            console.error('Error parsing file preview:', error);
            this.showPreviewMessage('Nie można wyświetlić podglądu pliku. Spróbuj przesłać go na serwer.');
        }
    }

    /**
     * Parse JSON file
     * @param {File} file - JSON file
     * @returns {Promise<Array>} Parsed data
     */
    parseJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(Array.isArray(data) ? data : [data]);
                } catch (error) {
                    reject(new Error('Nieprawidłowy format JSON'));
                }
            };
            reader.onerror = () => reject(new Error('Błąd odczytu pliku'));
            reader.readAsText(file);
        });
    }

    /**
     * Parse CSV file
     * @param {File} file - CSV file
     * @returns {Promise<Array>} Parsed data
     */
    parseCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const csv = e.target.result;
                    const lines = csv.split('\n').filter(line => line.trim());
                    
                    if (lines.length === 0) {
                        resolve([]);
                        return;
                    }

                    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                    const data = [];

                    for (let i = 1; i < lines.length; i++) {
                        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                        if (values.length === headers.length) {
                            const row = {};
                            headers.forEach((header, index) => {
                                row[header] = values[index];
                            });
                            data.push(row);
                        }
                    }

                    resolve(data);
                } catch (error) {
                    reject(new Error('Błąd parsowania pliku CSV'));
                }
            };
            reader.onerror = () => reject(new Error('Błąd odczytu pliku'));
            reader.readAsText(file);
        });
    }

    /**
     * Show preview message
     * @param {string} message - Message to show
     */
    showPreviewMessage(message) {
        const previewHTML = `
            <div class="alert alert-warning mt-3">
                <i class="bi bi-info-circle"></i> ${message}
            </div>
        `;

        this.removeExistingPreview();
        const importCard = document.querySelector('#import-section .card');
        if (importCard) {
            importCard.insertAdjacentHTML('afterend', previewHTML);
        }
    }

    /**
     * Show data preview
     * @param {Array} data - Data to preview
     */
    showDataPreview(data) {
        if (!data || data.length === 0) {
            this.showPreviewMessage('Brak danych do wyświetlenia');
            return;
        }

        const headers = Object.keys(data[0]);
        const previewHTML = `
            <div class="card mt-3" id="data-preview">
                <div class="card-header">
                    <h6 class="mb-0">
                        <i class="bi bi-eye"></i> Podgląd danych 
                        <span class="badge bg-secondary">${data.length} z ${this.importData ? this.importData.length : data.length} rekordów</span>
                    </h6>
                </div>
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-sm table-bordered">
                            <thead class="table-light">
                                <tr>
                                    ${headers.map(header => `<th>${Utils.escapeHTML(header)}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${data.map(row => `
                                    <tr>
                                        ${headers.map(header => `<td>${Utils.escapeHTML(String(row[header] || ''))}</td>`).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    ${this.importData && this.importData.length > data.length ? `
                        <p class="text-muted mb-0">
                            <small>Wyświetlono ${data.length} z ${this.importData.length} rekordów. Wszystkie rekordy zostaną zaimportowane.</small>
                        </p>
                    ` : ''}
                </div>
            </div>
        `;

        this.removeExistingPreview();
        const importCard = document.querySelector('#import-section .card');
        if (importCard) {
            importCard.insertAdjacentHTML('afterend', previewHTML);
        }
    }

    /**
     * Remove existing preview
     */
    removeExistingPreview() {
        const existingPreview = document.getElementById('data-preview');
        if (existingPreview) {
            existingPreview.remove();
        }

        const existingWarning = document.querySelector('#import-section .alert-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
    }

    /**
     * Update import button state
     */
    updateImportButton() {
        const importBtn = document.getElementById('startImport');
        if (!importBtn) return;

        if (this.currentFile) {
            importBtn.disabled = false;
            importBtn.innerHTML = '<i class="bi bi-upload"></i> Rozpocznij Import';
        } else {
            importBtn.disabled = true;
            importBtn.innerHTML = '<i class="bi bi-upload"></i> Wybierz plik';
        }
    }

    /**
     * Update import instructions based on selected type
     */
    updateImportInstructions() {
        const importType = document.getElementById('importType');
        if (!importType) return;

        const instructions = {
            wines: {
                title: 'Import win',
                description: 'Importuj dane win do systemu. Dostępne pola są ładowane dynamicznie z konfiguracji serwera.',
                example: {
                    name: 'Chianti Classico',
                    region: 'Toscana', 
                    szczepy: 'Sangiovese',
                    category: 'czerwone',
                    type: 'czerwone',
                    alcohol: 13.5,
                    price1: 89.99,
                    description: 'Eleganckie czerwone wino z regionu Chianti'
                }
            }
        };

        const selectedType = importType.value;
        const instruction = instructions[selectedType];

        if (instruction) {
            // Update instructions (you could add a dedicated instruction area)
            console.log('Import type changed to:', selectedType, instruction);
        }
    }

    /**
     * Start import process
     */
    async startImport() {
        if (!this.currentFile) {
            Utils.showAlert('Najpierw wybierz plik do importu', 'warning');
            return;
        }

        const importType = document.getElementById('importType').value;
        const replaceExisting = document.getElementById('replaceExisting').checked;

        try {
            // Prepare form data
            const formData = new FormData();
            formData.append('file', this.currentFile);
            formData.append('type', importType);
            formData.append('replaceExisting', replaceExisting);

            // Show progress
            this.showImportProgress();
            this.updateProgress(0, 'Przesyłanie pliku...');

            // Simulate progress for file upload
            const progressInterval = setInterval(() => {
                this.importProgress += 10;
                if (this.importProgress < 90) {
                    this.updateProgress(this.importProgress, 'Przetwarzanie danych...');
                }
            }, 200);

            // Start import
            const response = await handleAPICall(() => api.importData(formData));

            clearInterval(progressInterval);
            this.updateProgress(100, 'Import zakończony pomyślnie!');

            // Show results
            this.showImportResults(response);

            // Clear form after successful import
            setTimeout(() => {
                this.resetImport();
            }, 3000);

        } catch (error) {
            console.error('Import error:', error);
            this.updateProgress(0, 'Import zakończony błędem');
            setTimeout(() => {
                this.hideImportProgress();
            }, 3000);
        }
    }

    /**
     * Show import progress
     */
    showImportProgress() {
        const progressContainer = document.getElementById('import-progress');
        if (progressContainer) {
            progressContainer.classList.remove('d-none');
        }
        this.importProgress = 0;
    }

    /**
     * Hide import progress
     */
    hideImportProgress() {
        const progressContainer = document.getElementById('import-progress');
        if (progressContainer) {
            progressContainer.classList.add('d-none');
        }
    }

    /**
     * Update progress bar
     * @param {number} percent - Progress percentage
     * @param {string} status - Status message
     */
    updateProgress(percent, status) {
        const progressBar = document.querySelector('#import-progress .progress-bar');
        const statusElement = document.getElementById('import-status');

        if (progressBar) {
            progressBar.style.width = `${percent}%`;
            progressBar.setAttribute('aria-valuenow', percent);
        }

        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    /**
     * Show import results
     * @param {Object} results - Import results
     */
    showImportResults(results) {
        const { imported = 0, errors = [], skipped = 0, total = 0 } = results;

        let message = `Import zakończony!\n\n`;
        message += `• Zaimportowano: ${imported}/${total} rekordów\n`;
        
        if (skipped > 0) {
            message += `• Pominięto: ${skipped} rekordów\n`;
        }
        
        if (errors.length > 0) {
            message += `• Błędy: ${errors.length}\n\n`;
            message += `Szczegóły błędów:\n${errors.slice(0, 5).join('\n')}`;
            if (errors.length > 5) {
                message += `\n... i ${errors.length - 5} więcej`;
            }
        }

        const alertType = errors.length > 0 ? 'warning' : 'success';
        Utils.showAlert(message.replace(/\n/g, '<br>'), alertType, 10000);

        // Refresh related components
        if (window.wineManager) {
            window.wineManager.refresh();
        }
    }

    /**
     * Reset import form
     */
    resetImport() {
        // Clear file input
        const fileInput = document.getElementById('importFile');
        if (fileInput) {
            fileInput.value = '';
        }

        // Clear file info and preview
        this.currentFile = null;
        this.importData = null;
        this.removeExistingPreview();

        const fileInfo = document.querySelector('#import-section .alert-info');
        if (fileInfo) {
            fileInfo.remove();
        }

        // Hide progress
        this.hideImportProgress();

        // Update button
        this.updateImportButton();

        // Reset form
        const replaceCheckbox = document.getElementById('replaceExisting');
        if (replaceCheckbox) {
            replaceCheckbox.checked = false;
        }
    }

    /**
     * Download sample file
     * @param {string} type - File type (wines, winelists)
     * @param {string} format - File format (json, csv)
     */
    downloadSample(type, format = 'json') {
        const samples = {
            wines: [
                {
                    name: 'Przykładowe Wino 1',
                    region: 'Przykładowy Region',
                    szczepy: 'Przykładowe szczepy',
                    category: 'stołowe',
                    type: 'czerwone',
                    alcohol: 12.5,
                    price1: 45.99,
                    description: 'Opis przykładowego wina'
                }
            ]
        };

        const data = samples[type] || [];
        const filename = `sample_${type}.${format}`;

        if (format === 'json') {
            const content = JSON.stringify(data, null, 2);
            Utils.downloadFile(content, filename, 'application/json');
        } else if (format === 'csv') {
            // Simple CSV generation for wines
            if (type === 'wines' && data.length > 0) {
                const headers = Object.keys(data[0]);
                const csvContent = [
                    headers.join(','),
                    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
                ].join('\n');
                Utils.downloadFile(csvContent, filename, 'text/csv');
            }
        }
    }
}

// Initialize import manager when DOM is loaded
let importManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        importManager = new ImportManager();
    });
} else {
    importManager = new ImportManager();
}