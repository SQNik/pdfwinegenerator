/**
 * Multi-Step Wizard Component
 * Reusable wizard/stepper with configuration-based steps
 * 
 * Features:
 * - Configuration-based steps (JSON/array)
 * - Centralized state management
 * - LocalStorage persistence
 * - Validation per step
 * - Conditional step visibility
 * - Navigation with validation
 * - Progress indicator
 * - Event system for extensibility
 * 
 * @example
 * const wizard = new Wizard({
 *   containerId: 'wizard-container',
 *   steps: wizardConfig,
 *   onComplete: (data) => console.log(data),
 *   persistKey: 'my-wizard'
 * });
 */

class Wizard {
    constructor(options = {}) {
        // Configuration
        this.containerId = options.containerId || 'wizard-container';
        this.steps = options.steps || [];
        this.onComplete = options.onComplete || (() => {});
        this.onChange = options.onChange || (() => {});
        this.onSaveDraft = options.onSaveDraft || null;
        this.persistKey = options.persistKey || 'wizard-state';
        this.autoSave = options.autoSave !== false;
        this.saveDraftButtonText = options.saveDraftButtonText || 'Zapisz roboczą';
        
        // State
        this.currentStepIndex = 0;
        this.data = {};
        this.completedSteps = new Set();
        this.validationErrors = {};
        
        // DOM references
        this.container = null;
        this.progressContainer = null;
        this.contentContainer = null;
        this.navigationContainer = null;
        
        // Initialize
        this.init();
    }
    
    /**
     * Initialize the wizard
     */
    init() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`Wizard container #${this.containerId} not found`);
            return;
        }
        
        // Load saved state
        this.loadState();
        
        // Render wizard
        this.render();
        
        // Show first step
        this.showStep(this.currentStepIndex);
    }
    
    /**
     * Render wizard structure
     */
    render() {
        this.container.innerHTML = `
            <div class="wizard-container">
                <div class="wizard-progress" id="wizard-progress"></div>
                <div class="wizard-content" id="wizard-content"></div>
                <div class="wizard-navigation" id="wizard-navigation"></div>
            </div>
        `;
        
        this.progressContainer = document.getElementById('wizard-progress');
        this.contentContainer = document.getElementById('wizard-content');
        this.navigationContainer = document.getElementById('wizard-navigation');
        
        this.renderProgress();
        this.renderSteps();
        this.renderNavigation();
    }
    
    /**
     * Render progress indicator
     */
    renderProgress() {
        const visibleSteps = this.getVisibleSteps();
        const currentVisibleIndex = visibleSteps.findIndex(s => s.id === this.steps[this.currentStepIndex].id);
        const progressPercent = (currentVisibleIndex / Math.max(visibleSteps.length - 1, 1)) * 100;
        
        this.progressContainer.innerHTML = `
            <h2 class="wizard-progress-title">
                <i class="bi bi-magic"></i>
                ${this.steps[this.currentStepIndex].title || 'Kreator'}
            </h2>
            <div class="wizard-progress-steps">
                <div class="wizard-progress-line">
                    <div class="wizard-progress-line-fill" style="width: ${progressPercent}%"></div>
                </div>
                ${visibleSteps.map((step, index) => {
                    const stepIndex = this.steps.findIndex(s => s.id === step.id);
                    const isActive = stepIndex === this.currentStepIndex;
                    const isCompleted = this.completedSteps.has(step.id);
                    const statusClass = isActive ? 'active' : (isCompleted ? 'completed' : '');
                    
                    return `
                        <div class="wizard-step-indicator ${statusClass}" data-step="${stepIndex}">
                            <div class="wizard-step-circle">
                                ${isCompleted ? '<i class="bi bi-check"></i>' : (index + 1)}
                            </div>
                            <span class="wizard-step-label">${step.label || step.title}</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="wizard-current-step-info">
                Krok ${currentVisibleIndex + 1} z ${visibleSteps.length}
            </div>
        `;
        
        // Add click handlers for step indicators
        this.progressContainer.querySelectorAll('.wizard-step-indicator').forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const stepIndex = parseInt(indicator.dataset.step);
                if (stepIndex < this.currentStepIndex || this.completedSteps.has(this.steps[stepIndex].id)) {
                    this.goToStep(stepIndex);
                }
            });
        });
    }
    
    /**
     * Render all steps (hidden)
     */
    renderSteps() {
        this.contentContainer.innerHTML = this.steps.map((step, index) => `
            <div class="wizard-step" id="wizard-step-${step.id}" data-step-index="${index}">
                <div class="wizard-step-header">
                    <h3 class="wizard-step-title">
                        ${step.icon ? `<i class="bi bi-${step.icon}"></i>` : ''}
                        ${step.title}
                    </h3>
                    ${step.description ? `<p class="wizard-step-description">${step.description}</p>` : ''}
                </div>
                <div class="wizard-validation-error" id="wizard-error-${step.id}" style="display: none;"></div>
                <div class="wizard-step-body" id="wizard-body-${step.id}"></div>
            </div>
        `).join('');
    }
    
    /**
     * Render navigation buttons
     */
    renderNavigation() {
        const isFirst = this.currentStepIndex === 0;
        const isLast = this.currentStepIndex === this.steps.length - 1;
        const currentStep = this.steps[this.currentStepIndex];
        
        const backButton = !isFirst ? `
            <button type="button" class="wizard-btn wizard-btn-secondary" id="wizard-btn-back">
                <i class="bi bi-arrow-left"></i>
                Wstecz
            </button>
        ` : '';
        
        const nextButton = !isLast ? `
            <button type="button" class="wizard-btn wizard-btn-primary" id="wizard-btn-next">
                Dalej
                <i class="bi bi-arrow-right"></i>
            </button>
        ` : '';
        
        const completeButton = isLast ? `
            <button type="button" class="wizard-btn wizard-btn-success" id="wizard-btn-complete">
                <i class="bi bi-check-circle"></i>
                ${currentStep.completeLabel || 'Zakończ'}
            </button>
        ` : '';
        
        this.navigationContainer.innerHTML = `
            <div>
                ${this.onSaveDraft ? `
                    <button type="button" class="wizard-btn wizard-btn-outline" id="wizard-btn-save">
                        <i class="bi bi-save"></i>
                        ${this.saveDraftButtonText}
                    </button>
                ` : ''}
            </div>
            <div class="wizard-nav-buttons">
                ${backButton}
                ${nextButton}
                ${completeButton}
            </div>
        `;
        
        // Add event listeners
        const backBtn = document.getElementById('wizard-btn-back');
        const nextBtn = document.getElementById('wizard-btn-next');
        const completeBtn = document.getElementById('wizard-btn-complete');
        const saveBtn = document.getElementById('wizard-btn-save');
        
        if (backBtn) {
            backBtn.addEventListener('click', () => this.previousStep());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }
        
        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.complete());
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveForLater());
        }
    }
    
    /**
     * Show specific step
     */
    showStep(stepIndex) {
        // Hide all steps
        this.contentContainer.querySelectorAll('.wizard-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        const step = this.steps[stepIndex];
        const stepElement = document.getElementById(`wizard-step-${step.id}`);
        
        if (stepElement) {
            stepElement.classList.add('active');
            
            // Render step content
            this.renderStepContent(step);
            
            // Update progress
            this.renderProgress();
            
            // Update navigation
            this.renderNavigation();
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Call onChange callback
            this.onChange(this.currentStepIndex, step, this.data);
        }
    }
    
    /**
     * Render step content (to be overridden or use renderFunction)
     */
    renderStepContent(step) {
        const bodyElement = document.getElementById(`wizard-body-${step.id}`);
        
        if (step.renderFunction && typeof step.renderFunction === 'function') {
            // Use custom render function
            step.renderFunction(bodyElement, this.data, this);
        } else if (step.fields && Array.isArray(step.fields)) {
            // Auto-render fields
            this.renderFields(step, bodyElement);
        }
    }
    
    /**
     * Auto-render fields from configuration
     */
    renderFields(step, container) {
        const fieldsHtml = step.fields.map(field => {
            const value = this.data[field.name] || field.defaultValue || '';
            
            switch (field.type) {
                case 'text':
                case 'email':
                case 'number':
                    return `
                        <div class="ds-form-group">
                            <label class="ds-label" for="field-${field.name}">
                                ${field.icon ? `<i class="bi bi-${field.icon}"></i>` : ''}
                                ${field.label}
                                ${field.required ? '<span class="text-danger">*</span>' : ''}
                            </label>
                            <input 
                                type="${field.type}" 
                                class="ds-input" 
                                id="field-${field.name}" 
                                name="${field.name}"
                                value="${value}"
                                ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                                ${field.required ? 'required' : ''}
                            >
                            ${field.help ? `<small class="ds-help-text">${field.help}</small>` : ''}
                        </div>
                    `;
                
                case 'textarea':
                    return `
                        <div class="ds-form-group">
                            <label class="ds-label" for="field-${field.name}">
                                ${field.label}
                                ${field.required ? '<span class="text-danger">*</span>' : ''}
                            </label>
                            <textarea 
                                class="ds-input" 
                                id="field-${field.name}" 
                                name="${field.name}"
                                rows="${field.rows || 4}"
                                ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
                                ${field.required ? 'required' : ''}
                            >${value}</textarea>
                        </div>
                    `;
                
                case 'select':
                    return `
                        <div class="ds-form-group">
                            <label class="ds-label" for="field-${field.name}">
                                ${field.label}
                                ${field.required ? '<span class="text-danger">*</span>' : ''}
                            </label>
                            <select class="ds-select" id="field-${field.name}" name="${field.name}" ${field.required ? 'required' : ''}>
                                <option value="">Wybierz...</option>
                                ${field.options.map(opt => `
                                    <option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>
                                        ${opt.label}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                    `;
                
                default:
                    return '';
            }
        }).join('');
        
        container.innerHTML = fieldsHtml;
        
        // Add change listeners to auto-save field values
        container.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('change', (e) => {
                this.data[e.target.name] = e.target.value;
                if (this.autoSave) {
                    this.saveState();
                }
            });
        });
    }
    
    /**
     * Validate current step
     */
    async validateStep() {
        const step = this.steps[this.currentStepIndex];
        const errors = [];
        
        // Custom validation function
        if (step.validate && typeof step.validate === 'function') {
            const validationResult = await step.validate(this.data, this);
            
            // Handle both object {valid, errors} and array formats
            if (validationResult) {
                if (Array.isArray(validationResult)) {
                    // Handle array format
                    if (validationResult.length > 0) {
                        errors.push(...validationResult);
                    }
                } else if (typeof validationResult === 'object') {
                    // Handle object format {valid, errors}
                    if (validationResult.errors && validationResult.errors.length > 0) {
                        errors.push(...validationResult.errors);
                    }
                }
            }
        }
        
        // Field validation
        if (step.fields) {
            step.fields.forEach(field => {
                const value = this.data[field.name];
                
                if (field.required && (!value || value.toString().trim() === '')) {
                    errors.push(`${field.label} jest wymagane`);
                }
                
                if (field.minLength && value && value.length < field.minLength) {
                    errors.push(`${field.label} musi mieć co najmniej ${field.minLength} znaków`);
                }
                
                if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
                    errors.push(`${field.label} ma nieprawidłowy format`);
                }
            });
        }
        
        // Show/hide errors
        const errorContainer = document.getElementById(`wizard-error-${step.id}`);
        if (errors.length > 0) {
            errorContainer.style.display = 'block';
            errorContainer.innerHTML = `
                <strong><i class="bi bi-exclamation-triangle"></i> Popraw następujące błędy:</strong>
                <ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>
            `;
            return false;
        } else {
            errorContainer.style.display = 'none';
            return true;
        }
    }
    
    /**
     * Go to next step
     */
    async nextStep() {
        // Collect data from current step
        await this.collectStepData();
        
        // Validate
        const isValid = await this.validateStep();
        if (!isValid) {
            return;
        }
        
        // Mark current step as completed
        this.completedSteps.add(this.steps[this.currentStepIndex].id);
        
        // Move to next visible step
        const nextIndex = this.getNextVisibleStepIndex();
        if (nextIndex !== -1) {
            this.currentStepIndex = nextIndex;
            this.showStep(this.currentStepIndex);
            
            if (this.autoSave) {
                this.saveState();
            }
        }
    }
    
    /**
     * Go to previous step
     */
    previousStep() {
        const prevIndex = this.getPreviousVisibleStepIndex();
        if (prevIndex !== -1) {
            this.currentStepIndex = prevIndex;
            this.showStep(this.currentStepIndex);
        }
    }
    
    /**
     * Go to specific step
     */
    goToStep(stepIndex) {
        if (stepIndex >= 0 && stepIndex < this.steps.length) {
            this.currentStepIndex = stepIndex;
            this.showStep(this.currentStepIndex);
        }
    }
    
    /**
     * Complete wizard
     */
    async complete() {
        // Collect data from current step
        await this.collectStepData();
        
        // Validate
        const isValid = await this.validateStep();
        if (!isValid) {
            return;
        }
        
        // Mark as completed
        this.completedSteps.add(this.steps[this.currentStepIndex].id);
        
        // Call completion callback
        await this.onComplete(this.data, this);
        
        // Clear saved state
        this.clearState();
    }
    
    /**
     * Save for later
     */
    async saveForLater() {
        this.collectStepData();
        this.saveState();
        
        // Call onSaveDraft callback if provided
        if (this.onSaveDraft && typeof this.onSaveDraft === 'function') {
            try {
                await this.onSaveDraft(this.data, this);
            } catch (error) {
                console.error('Error in onSaveDraft callback:', error);
                alert('Błąd podczas zapisywania roboczej: ' + error.message);
            }
        } else {
            // Default behavior - just save to localStorage
            alert('Postęp został zapisany. Możesz wrócić do tego formularza później.');
        }
    }
    
    /**
     * Collect data from current step
     */
    async collectStepData() {
        const step = this.steps[this.currentStepIndex];
        const bodyElement = document.getElementById(`wizard-body-${step.id}`);
        
        // Collect from form fields
        bodyElement.querySelectorAll('input, select, textarea').forEach(input => {
            // Skip collection fields - they are collected by collectCollectionFieldsData()
            if (input.id && input.id.startsWith('collection_field_')) {
                return;
            }
            
            if (input.type === 'checkbox') {
                this.data[input.name] = input.checked;
            } else if (input.type === 'radio') {
                if (input.checked) {
                    this.data[input.name] = input.value;
                }
            } else {
                this.data[input.name] = input.value;
            }
        });
        
        // Custom data collection
        if (step.collectData && typeof step.collectData === 'function') {
            const customData = await step.collectData(bodyElement, this.data, this);
            Object.assign(this.data, customData);
        }
    }
    
    /**
     * Get visible steps (based on conditions)
     */
    getVisibleSteps() {
        return this.steps.filter(step => {
            if (!step.condition) return true;
            if (typeof step.condition === 'function') {
                return step.condition(this.data, this);
            }
            return true;
        });
    }
    
    /**
     * Get next visible step index
     */
    getNextVisibleStepIndex() {
        for (let i = this.currentStepIndex + 1; i < this.steps.length; i++) {
            const step = this.steps[i];
            if (!step.condition || step.condition(this.data, this)) {
                return i;
            }
        }
        return -1;
    }
    
    /**
     * Get previous visible step index
     */
    getPreviousVisibleStepIndex() {
        for (let i = this.currentStepIndex - 1; i >= 0; i--) {
            const step = this.steps[i];
            if (!step.condition || step.condition(this.data, this)) {
                return i;
            }
        }
        return -1;
    }
    
    /**
     * Save state to LocalStorage
     */
    saveState() {
        // Skip saving if no persistKey (e.g., in edit mode)
        if (!this.persistKey) {
            return;
        }
        
        try {
            const state = {
                currentStepIndex: this.currentStepIndex,
                data: this.data,
                completedSteps: Array.from(this.completedSteps),
                timestamp: Date.now()
            };
            localStorage.setItem(this.persistKey, JSON.stringify(state));
        } catch (error) {
            console.error('Error saving wizard state:', error);
        }
    }
    
    /**
     * Load state from LocalStorage
     */
    loadState() {
        // Skip loading if no persistKey (e.g., in edit mode or when localStorage is disabled)
        if (!this.persistKey) {
            return;
        }
        
        try {
            const saved = localStorage.getItem(this.persistKey);
            if (saved) {
                const state = JSON.parse(saved);
                this.currentStepIndex = state.currentStepIndex || 0;
                this.data = state.data || {};
                this.completedSteps = new Set(state.completedSteps || []);
                
                // Check if state is not too old (e.g., 7 days)
                const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
                if (Date.now() - state.timestamp > maxAge) {
                    this.clearState();
                }
            }
        } catch (error) {
            console.error('Error loading wizard state:', error);
        }
    }
    
    /**
     * Clear saved state
     */
    clearState() {
        // Skip clearing if no persistKey
        if (!this.persistKey) {
            return;
        }
        
        try {
            localStorage.removeItem(this.persistKey);
        } catch (error) {
            console.error('Error clearing wizard state:', error);
        }
    }
    
    /**
     * Reset wizard
     */
    reset() {
        this.currentStepIndex = 0;
        this.data = {};
        this.completedSteps.clear();
        this.clearState();
        this.showStep(0);
    }
    
    /**
     * Get current data
     */
    getData() {
        return { ...this.data };
    }
    
    /**
     * Set data programmatically
     */
    setData(data) {
        // Separate collectionFields from other data
        const { collectionFields, ...otherData } = data;
        
        // Shallow merge for other properties first
        this.data = { ...this.data, ...otherData };
        
        // Deep merge for collectionFields to preserve nested structure
        if (collectionFields) {
            this.data.collectionFields = {
                ...this.data.collectionFields,
                ...collectionFields
            };
        }
        
        if (this.autoSave) {
            this.saveState();
        }
    }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Wizard;
}
