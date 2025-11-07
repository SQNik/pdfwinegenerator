// Fields Management Component
class FieldsManager {
    constructor() {
        console.log('FieldsManager: Constructor called');
        this.fields = [...window.WineFieldsConfig.WINE_FIELDS_CONFIG];
        this.editingIndex = -1;
        
        console.log('FieldsManager: Initial fields count:', this.fields.length);
        
        this.init();
    }

    /**
     * Initialize fields manager
     */
    async init() {
        console.log('FieldsManager: Init called');
        this.bindEvents();
        await this.loadFieldsFromServer();
        this.renderFieldsTable();
        this.updatePreviews();
        console.log('FieldsManager: Init completed');
    }

    /**
     * Load fields configuration from server
     */
    async loadFieldsFromServer() {
        console.log('FieldsManager: Loading fields from server...');
        try {
            const response = await api.getFieldsConfig();
            console.log('FieldsManager: Server response:', response);
            if (response.success && response.data && response.data.length > 0) {
                this.fields = response.data;
                // Update global config for other components
                window.WineFieldsConfig.WINE_FIELDS_CONFIG = [...this.fields];
                console.log('FieldsManager: Loaded', this.fields.length, 'fields from server');
                
                // Notify other components about the updated configuration
                this.notifyConfigurationChange();
            } else {
                // Use default fields if none saved on server
                this.fields = [...window.WineFieldsConfig.WINE_FIELDS_CONFIG];
                console.log('FieldsManager: Using default fields, count:', this.fields.length);
            }
        } catch (error) {
            console.error('FieldsManager: Error loading fields from server:', error);
            // Fallback to default configuration
            this.fields = [...window.WineFieldsConfig.WINE_FIELDS_CONFIG];
            console.log('FieldsManager: Using fallback fields, count:', this.fields.length);
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Save field button
        const saveFieldBtn = document.getElementById('saveField');
        if (saveFieldBtn) {
            saveFieldBtn.addEventListener('click', () => this.saveField());
        }

        // Field type change to show/hide options
        const fieldType = document.getElementById('fieldType');
        if (fieldType) {
            fieldType.addEventListener('change', (e) => this.toggleFieldOptions(e.target.value));
        }

        // Reset form when modal is hidden
        const fieldModal = document.getElementById('fieldModal');
        if (fieldModal) {
            fieldModal.addEventListener('hidden.bs.modal', () => this.resetFieldForm());
        }
    }

    /**
     * Toggle field options based on type
     * @param {string} type - Field type
     */
    toggleFieldOptions(type) {
        const optionsContainer = document.getElementById('fieldOptionsContainer');
        if (optionsContainer) {
            optionsContainer.style.display = type === 'select' ? 'block' : 'none';
        }
    }

    /**
     * Render fields table
     */
    renderFieldsTable() {
        const tbody = document.getElementById('fields-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.fields.map((field, index) => `
            <tr ${field.group === 'system' ? 'class="table-secondary"' : ''}>
                <td><code>${field.key}</code></td>
                <td>${field.label}</td>
                <td><span class="badge bg-primary">${this.getTypeLabel(field.type)}</span></td>
                <td>
                    ${field.required ? 
                        '<i class="bi bi-check-circle text-success"></i>' : 
                        '<i class="bi bi-x-circle text-muted"></i>'
                    }
                </td>
                <td>
                    ${field.displayInTable ? 
                        '<i class="bi bi-check-circle text-success"></i>' : 
                        '<i class="bi bi-x-circle text-muted"></i>'
                    }
                </td>
                <td>
                    ${field.displayInForm ? 
                        '<i class="bi bi-check-circle text-success"></i>' : 
                        '<i class="bi bi-x-circle text-muted"></i>'
                    }
                </td>
                <td>
                    ${field.displayInCard ? 
                        '<i class="bi bi-check-circle text-success"></i>' : 
                        '<i class="bi bi-x-circle text-muted"></i>'
                    }
                </td>
                <td><span class="badge bg-secondary">${this.getGroupLabel(field.group)}</span></td>
                <td>
                    ${field.group !== 'system' ? `
                        <button class="btn btn-sm btn-outline-primary me-1" 
                                onclick="fieldsManager.editField(${index})" title="Edytuj">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="fieldsManager.deleteField(${index})" title="Usuń">
                            <i class="bi bi-trash"></i>
                        </button>
                    ` : '<span class="text-muted">Systemowe</span>'}
                </td>
            </tr>
        `).join('');
    }

    /**
     * Get type label for display
     * @param {string} type - Field type
     * @returns {string} Display label
     */
    getTypeLabel(type) {
        const labels = {
            'text': 'Tekst',
            'number': 'Liczba',
            'select': 'Lista',
            'textarea': 'Tekst wielolinijowy',
            'url': 'URL',
            'readonly': 'Tylko odczyt'
        };
        return labels[type] || type;
    }

    /**
     * Get group label for display
     * @param {string} group - Field group
     * @returns {string} Display label
     */
    getGroupLabel(group) {
        const labels = {
            'basic': 'Podstawowe',
            'details': 'Szczegóły',
            'technical': 'Techniczne',
            'system': 'Systemowe'
        };
        return labels[group] || group;
    }

    /**
     * Edit field
     * @param {number} index - Field index
     */
    editField(index) {
        const field = this.fields[index];
        if (!field) return;

        this.editingIndex = index;
        this.fillFieldForm(field);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('fieldModal'));
        modal.show();

        // Update modal title
        document.querySelector('#fieldModal .modal-title').textContent = 'Edytuj Pole';
        document.getElementById('saveField').textContent = 'Aktualizuj';
    }

    /**
     * Delete field
     * @param {number} index - Field index
     */
    deleteField(index) {
        const field = this.fields[index];
        if (!field) return;

        if (confirm(`Czy na pewno chcesz usunąć pole "${field.label}"?\n\nUwaga: To może wpłynąć na istniejące dane.`)) {
            this.fields.splice(index, 1);
            this.saveFieldsConfiguration();
            this.renderFieldsTable();
            this.updatePreviews();
            Utils.showAlert(`Pole "${field.label}" zostało usunięte.`, 'success');
        }
    }

    /**
     * Fill field form with data
     * @param {Object} field - Field configuration
     */
    fillFieldForm(field) {
        document.getElementById('fieldKey').value = field.key || '';
        document.getElementById('fieldLabel').value = field.label || '';
        document.getElementById('fieldType').value = field.type || '';
        document.getElementById('fieldGroup').value = field.group || 'details';
        document.getElementById('fieldPlaceholder').value = field.placeholder || '';
        
        // Validation
        document.getElementById('fieldValidationMin').value = field.validation?.min || '';
        document.getElementById('fieldValidationMax').value = field.validation?.max || '';
        
        // Options for select
        if (field.validation?.options) {
            document.getElementById('fieldOptions').value = field.validation.options.join('\n');
        }
        
        // Display options
        document.getElementById('fieldDisplayTable').checked = !!field.displayInTable;
        document.getElementById('fieldDisplayForm').checked = !!field.displayInForm;
        document.getElementById('fieldDisplayCard').checked = !!field.displayInCard;
        document.getElementById('fieldRequired').checked = !!field.required;
        
        // Order
        document.getElementById('fieldFormOrder').value = field.formOrder || '';
        document.getElementById('fieldTableOrder').value = field.tableOrder || '';
        
        // Show/hide options based on type
        this.toggleFieldOptions(field.type);
    }

    /**
     * Reset field form
     */
    resetFieldForm() {
        const form = document.getElementById('fieldForm');
        if (form) {
            form.reset();
        }
        
        this.editingIndex = -1;
        document.querySelector('#fieldModal .modal-title').textContent = 'Dodaj Pole';
        document.getElementById('saveField').textContent = 'Zapisz pole';
        
        // Hide options container
        document.getElementById('fieldOptionsContainer').style.display = 'none';
    }

    /**
     * Get field form data
     * @returns {Object} Field configuration
     */
    getFieldFormData() {
        const formData = {
            key: document.getElementById('fieldKey').value.trim(),
            label: document.getElementById('fieldLabel').value.trim(),
            type: document.getElementById('fieldType').value,
            group: document.getElementById('fieldGroup').value,
            placeholder: document.getElementById('fieldPlaceholder').value.trim(),
            required: document.getElementById('fieldRequired').checked,
            displayInTable: document.getElementById('fieldDisplayTable').checked,
            displayInForm: document.getElementById('fieldDisplayForm').checked,
            displayInCard: document.getElementById('fieldDisplayCard').checked
        };

        // Add validation
        const min = document.getElementById('fieldValidationMin').value;
        const max = document.getElementById('fieldValidationMax').value;
        const optionsText = document.getElementById('fieldOptions').value.trim();

        if (min || max || optionsText) {
            formData.validation = {};
            
            if (min) formData.validation.min = parseFloat(min);
            if (max) formData.validation.max = parseFloat(max);
            
            if (optionsText) {
                formData.validation.options = optionsText.split('\n')
                    .map(opt => opt.trim())
                    .filter(opt => opt.length > 0);
            }
        }

        // Add order
        const formOrder = document.getElementById('fieldFormOrder').value;
        const tableOrder = document.getElementById('fieldTableOrder').value;
        
        if (formOrder) formData.formOrder = parseFloat(formOrder);
        if (tableOrder) formData.tableOrder = parseFloat(tableOrder);

        return formData;
    }

    /**
     * Validate field data
     * @param {Object} fieldData - Field configuration
     * @returns {Object} Validation result
     */
    validateFieldData(fieldData) {
        const errors = [];

        // Required fields
        if (!fieldData.key) errors.push('Klucz pola jest wymagany');
        if (!fieldData.label) errors.push('Etykieta jest wymagana');
        if (!fieldData.type) errors.push('Typ pola jest wymagany');

        // Key validation
        if (fieldData.key) {
            if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(fieldData.key)) {
                errors.push('Klucz pola może zawierać tylko litery, cyfry i podkreślenia, musi zaczynać się od litery');
            }
            
            // Check for duplicates (excluding current editing field)
            const existingIndex = this.fields.findIndex(f => f.key === fieldData.key);
            if (existingIndex !== -1 && existingIndex !== this.editingIndex) {
                errors.push('Pole o tym kluczu już istnieje');
            }
        }

        // Type-specific validation
        if (fieldData.type === 'select' && (!fieldData.validation?.options || fieldData.validation.options.length === 0)) {
            errors.push('Pole typu "select" musi mieć zdefiniowane opcje');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Save field
     */
    saveField() {
        const fieldData = this.getFieldFormData();
        const validation = this.validateFieldData(fieldData);

        if (!validation.valid) {
            Utils.showAlert(`Formularz zawiera błędy:<br>• ${validation.errors.join('<br>• ')}`, 'danger');
            return;
        }

        try {
            if (this.editingIndex >= 0) {
                // Update existing field
                this.fields[this.editingIndex] = fieldData;
                Utils.showAlert(`Pole "${fieldData.label}" zostało zaktualizowane.`, 'success');
            } else {
                // Add new field
                this.fields.push(fieldData);
                Utils.showAlert(`Pole "${fieldData.label}" zostało dodane.`, 'success');
            }

            this.saveFieldsConfiguration();
            this.renderFieldsTable();
            this.updatePreviews();

            // Hide modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('fieldModal'));
            modal.hide();
        } catch (error) {
            console.error('Error saving field:', error);
            Utils.showAlert('Wystąpił błąd podczas zapisywania pola.', 'danger');
        }
    }

    /**
     * Save fields configuration to server
     */
    async saveFieldsConfiguration() {
        try {
            // Save to server
            const response = await api.updateFieldsConfig(this.fields);
            
            if (response.success) {
                // Update the global configuration
                window.WineFieldsConfig.WINE_FIELDS_CONFIG = [...this.fields];
                
                // Notify other components about configuration change
                this.notifyConfigurationChange();
                
                Utils.showAlert('Konfiguracja pól została zapisana pomyślnie.', 'success');
                
                // No need for regeneration instructions since changes are persistent
                console.log('Fields configuration saved to server:', response.data);
            } else {
                throw new Error(response.message || 'Failed to save configuration');
            }
        } catch (error) {
            console.error('Error saving fields configuration:', error);
            Utils.showAlert('Błąd podczas zapisywania konfiguracji pól na serwerze.', 'danger');
        }
    }

    /**
     * Show instructions for regenerating configuration files
     */
    showRegenerationInstructions() {
        const instructions = `
            <div class="alert alert-info" role="alert">
                <h6><i class="bi bi-info-circle"></i> Konfiguracja zapisana</h6>
                <p>Zmiany zostały zapisane lokalnie. Aby zastosować je trwale:</p>
                <ol>
                    <li>Skopiuj nową konfigurację z przeglądarki (F12 → Console → <code>copy(JSON.stringify(window.WineFieldsConfig.WINE_FIELDS_CONFIG, null, 2))</code>)</li>
                    <li>Zaktualizuj pliki konfiguracyjne:
                        <ul>
                            <li><code>src/config/wine-fields.ts</code></li>
                            <li><code>public/js/config/wine-fields.js</code></li>
                        </ul>
                    </li>
                    <li>Uruchom <code>npm run build && npm start</code></li>
                </ol>
                <button class="btn btn-sm btn-primary" onclick="fieldsManager.exportConfiguration()">
                    <i class="bi bi-download"></i> Eksportuj konfigurację
                </button>
            </div>
        `;
        
        // Show as temporary alert
        const alertContainer = document.createElement('div');
        alertContainer.innerHTML = instructions;
        document.body.appendChild(alertContainer);
        
        // Remove after 10 seconds
        setTimeout(() => {
            if (alertContainer.parentNode) {
                alertContainer.parentNode.removeChild(alertContainer);
            }
        }, 10000);
    }

    /**
     * Export configuration to file
     */
    exportConfiguration() {
        const config = {
            timestamp: new Date().toISOString(),
            fields: this.fields
        };
        
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wine-fields-config-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Reset configuration to defaults
     */
    async resetConfiguration() {
        if (confirm('Czy na pewno chcesz zresetować konfigurację pól do wartości domyślnych? Ta operacja nie może być cofnięta.')) {
            try {
                const response = await api.resetFieldsConfig();
                
                if (response.success) {
                    // Reset to default configuration
                    this.fields = [...window.WineFieldsConfig.WINE_FIELDS_CONFIG];
                    this.renderFieldsTable();
                    this.updatePreviews();
                    
                    // Notify other components about configuration change
                    this.notifyConfigurationChange();
                    
                    Utils.showAlert('Konfiguracja została zresetowana do wartości domyślnych.', 'success');
                } else {
                    throw new Error(response.message || 'Failed to reset configuration');
                }
            } catch (error) {
                console.error('Error resetting configuration:', error);
                Utils.showAlert('Błąd podczas resetowania konfiguracji.', 'danger');
            }
        }
    }

    /**
     * Update previews
     */
    updatePreviews() {
        this.updateFormPreview();
        this.updateTablePreview();
    }

    /**
     * Update form preview
     */
    updateFormPreview() {
        const preview = document.getElementById('form-preview');
        if (!preview) return;

        const formFields = this.fields.filter(f => f.displayInForm && f.group !== 'system')
            .sort((a, b) => (a.formOrder || 999) - (b.formOrder || 999));

        preview.innerHTML = formFields.slice(0, 5).map(field => `
            <div class="mb-2">
                <label class="form-label form-label-sm">
                    ${field.label} ${field.required ? '<span class="text-danger">*</span>' : ''}
                </label>
                <div class="form-control form-control-sm" style="background: #f8f9fa;">
                    <small class="text-muted">${this.getTypeLabel(field.type)}</small>
                </div>
            </div>
        `).join('') + (formFields.length > 5 ? '<small class="text-muted">... i więcej</small>' : '');
    }

    /**
     * Update table preview
     */
    updateTablePreview() {
        const preview = document.getElementById('table-preview');
        if (!preview) return;

        const tableFields = this.fields.filter(f => f.displayInTable)
            .sort((a, b) => (a.tableOrder || 999) - (b.tableOrder || 999));

        preview.innerHTML = `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th style="font-size: 0.8rem;">Akcje</th>
                            ${tableFields.slice(0, 4).map(field => 
                                `<th style="font-size: 0.8rem;">${field.label}</th>`
                            ).join('')}
                            ${tableFields.length > 4 ? '<th style="font-size: 0.8rem;">...</th>' : ''}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="font-size: 0.8rem;"><small class="text-muted">🔧</small></td>
                            ${tableFields.slice(0, 4).map(() => 
                                '<td style="font-size: 0.8rem;"><small class="text-muted">Dane</small></td>'
                            ).join('')}
                            ${tableFields.length > 4 ? '<td style="font-size: 0.8rem;"><small class="text-muted">...</small></td>' : ''}
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    /**
     * Notify other components about configuration changes
     */
    notifyConfigurationChange() {
        console.log('FieldsManager: Notifying configuration change with', this.fields.length, 'fields');
        
        // Notify WineManager to refresh its configuration
        if (window.wineManager && typeof window.wineManager.refreshFieldsConfig === 'function') {
            console.log('FieldsManager: Calling window.wineManager.refreshFieldsConfig');
            window.wineManager.refreshFieldsConfig();
        }
        
        // Also try global wineManager variable
        if (typeof wineManager !== 'undefined' && wineManager && typeof wineManager.refreshFieldsConfig === 'function') {
            console.log('FieldsManager: Calling global wineManager.refreshFieldsConfig');
            wineManager.refreshFieldsConfig();
        }
        
        // Dispatch custom event for other components
        console.log('FieldsManager: Dispatching fieldsConfigChanged event');
        window.dispatchEvent(new CustomEvent('fieldsConfigChanged', {
            detail: { fields: this.fields }
        }));
    }
}

// Initialize fields manager when DOM is loaded
let fieldsManager;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        fieldsManager = new FieldsManager();
        window.fieldsManager = fieldsManager; // Make it globally accessible
    });
} else {
    fieldsManager = new FieldsManager();
    window.fieldsManager = fieldsManager; // Make it globally accessible
}