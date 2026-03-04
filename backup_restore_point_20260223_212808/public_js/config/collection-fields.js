/**
 * CollectionFieldsConfig - Centralny system konfiguracji pól dynamicznych kolekcji
 * 
 * Podobny do WineFieldsConfig, ale dedykowany dla pól kolekcji
 * Zarządza ustawieniami pól przechowywanymi na serwerze
 * Zapewnia spójną konfigurację na wszystkich stronach aplikacji
 * 
 * Funkcje:
 * - Ładowanie pól z serwera
 * - Event system dla live updates
 * - Walidacja i sanityzacja danych
 * - Helper functions dla generowania UI
 */
class CollectionFieldsConfig {
    constructor() {
        this.fields = []; // Początkowo pusta - ładowana z serwera
        this.eventName = 'collectionFieldsConfigChanged';
        this.isLoaded = false;
        this.isLoading = false;
    }

    /**
     * Inicjalizuje konfigurację pól - ładuje z serwera
     */
    async init() {
        return await this.loadFromServer();
    }

    /**
     * Ładuje konfigurację pól z serwera
     */
    async loadFromServer() {
        if (this.isLoading) {
            return this.fields;
        }

        this.isLoading = true;
        try {
            const response = await api.getCollectionFieldsConfig();
            if (response.success && response.data) {
                this.fields = response.data;
                this.isLoaded = true;
                this.dispatchConfigChanged();
                console.log('CollectionFieldsConfig: Załadowano konfigurację pól kolekcji', this.fields.length);
            } else {
                console.error('CollectionFieldsConfig: Błąd ładowania konfiguracji pól:', response.error);
                this.fields = [];
            }
        } catch (error) {
            console.error('CollectionFieldsConfig: Błąd połączenia z serwerem:', error);
            this.fields = [];
        } finally {
            this.isLoading = false;
        }

        return this.fields;
    }

    /**
     * Pobiera aktualne pola (z cache lub serwera)
     */
    async getFields() {
        if (!this.isLoaded && !this.isLoading) {
            await this.loadFromServer();
        }
        return this.fields;
    }

    /**
     * Pobiera tylko aktywne pola
     */
    async getActiveFields() {
        const fields = await this.getFields();
        return fields.filter(field => field.isActive !== false);
    }

    /**
     * Pobiera pola do wyświetlenia w formularzu
     */
    async getFormFields() {
        const activeFields = await this.getActiveFields();
        return activeFields.sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));
    }

    /**
     * Znajduje pole po ID
     */
    async getFieldById(fieldId) {
        const fields = await this.getFields();
        return fields.find(field => field.id === fieldId);
    }

    /**
     * Dodaje nowe pole
     */
    async addField(fieldData) {
        try {
            const response = await api.createCollectionField(fieldData);
            if (response.success && response.data) {
                this.fields.push(response.data);
                this.dispatchConfigChanged();
                return response.data;
            } else {
                throw new Error(response.error || 'Błąd tworzenia pola');
            }
        } catch (error) {
            console.error('CollectionFieldsConfig: Błąd dodawania pola:', error);
            throw error;
        }
    }

    /**
     * Aktualizuje istniejące pole
     */
    async updateField(fieldId, fieldData) {
        try {
            const response = await api.updateCollectionField(fieldId, fieldData);
            if (response.success && response.data) {
                const index = this.fields.findIndex(f => f.id === fieldId);
                if (index !== -1) {
                    this.fields[index] = response.data;
                    this.dispatchConfigChanged();
                }
                return response.data;
            } else {
                throw new Error(response.error || 'Błąd aktualizacji pola');
            }
        } catch (error) {
            console.error('CollectionFieldsConfig: Błąd aktualizacji pola:', error);
            throw error;
        }
    }

    /**
     * Usuwa pole
     */
    async deleteField(fieldId) {
        try {
            const response = await api.deleteCollectionField(fieldId);
            if (response.success) {
                this.fields = this.fields.filter(f => f.id !== fieldId);
                this.dispatchConfigChanged();
                return true;
            } else {
                throw new Error(response.error || 'Błąd usuwania pola');
            }
        } catch (error) {
            console.error('CollectionFieldsConfig: Błąd usuwania pola:', error);
            throw error;
        }
    }

    /**
     * Aktualizuje kolejność pól
     */
    async updateFieldsOrder(fieldIds) {
        try {
            const response = await api.updateCollectionFieldsOrder(fieldIds);
            if (response.success) {
                // Zaktualizuj lokalną kolejność
                fieldIds.forEach((fieldId, index) => {
                    const field = this.fields.find(f => f.id === fieldId);
                    if (field) {
                        field.displayOrder = index + 1;
                    }
                });
                this.dispatchConfigChanged();
                return true;
            } else {
                throw new Error(response.error || 'Błąd aktualizacji kolejności pól');
            }
        } catch (error) {
            console.error('CollectionFieldsConfig: Błąd aktualizacji kolejności:', error);
            throw error;
        }
    }

    /**
     * Emituje event o zmianie konfiguracji
     */
    dispatchConfigChanged() {
        const event = new CustomEvent(this.eventName, {
            detail: { 
                fields: this.fields,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * Resetuje konfigurację (wymusza ponowne ładowanie)
     */
    reset() {
        this.fields = [];
        this.isLoaded = false;
        this.isLoading = false;
    }

    /**
     * Pobiera statystyki pól
     */
    async getFieldsStats() {
        try {
            const response = await api.getCollectionFieldsStats();
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error || 'Błąd pobierania statystyk');
            }
        } catch (error) {
            console.error('CollectionFieldsConfig: Błąd pobierania statystyk:', error);
            throw error;
        }
    }
}

/**
 * Helper functions do generowania UI na podstawie pól kolekcji
 */
const CollectionFieldsHelpers = {
    /**
     * Ładuje opcje select z API
     */
    async loadSelectOptions(selectElementId, endpoint, selectedValue = '') {
        try {
            const selectElement = document.getElementById(selectElementId);
            if (!selectElement) {
                console.warn('Select element not found:', selectElementId);
                return;
            }

            const response = await fetch(endpoint);
            const data = await response.json();

            if (data.success && Array.isArray(data.data)) {
                // Clear loading option
                selectElement.innerHTML = '<option value="">-- Wybierz --</option>';
                
                // Add options from API
                data.data.forEach(option => {
                    const optionElement = document.createElement('option');
                    optionElement.value = option;
                    optionElement.textContent = this.getFilenameFromPath(option);
                    
                    if (option === selectedValue) {
                        optionElement.selected = true;
                    }
                    
                    selectElement.appendChild(optionElement);
                });
            } else {
                selectElement.innerHTML = '<option value="">Błąd ładowania opcji</option>';
                console.error('Failed to load select options:', data);
            }
        } catch (error) {
            console.error('Error loading select options:', error);
            const selectElement = document.getElementById(selectElementId);
            if (selectElement) {
                selectElement.innerHTML = '<option value="">Błąd ładowania</option>';
            }
        }
    },

    /**
     * Pobiera nazwę pliku ze ścieżki
     */
    getFilenameFromPath(path) {
        if (!path) return '';
        const parts = path.split('/');
        return parts[parts.length - 1];
    },

    /**
     * Generuje HTML dla pola formularza
     */
    generateFormField(field, value = '', options = {}) {
        const { 
            showLabel = true, 
            showHelpText = true, 
            additionalClasses = '',
            isReadonly = false
        } = options;

        const fieldId = `collection_field_${field.id}`;
        const required = field.required ? 'required' : '';
        const readonly = isReadonly ? 'readonly' : '';
        const placeholder = field.placeholder || '';
        
        let inputHtml = '';
        let labelHtml = showLabel ? `<label for="${fieldId}" class="form-label">
            ${field.name}
            ${field.required ? '<span class="text-danger">*</span>' : ''}
        </label>` : '';
        
        let helpTextHtml = showHelpText && field.helpText ? 
            `<div class="form-text text-muted">${field.helpText}</div>` : '';

        switch (field.type) {
            case 'text':
            case 'email':
            case 'url':
                inputHtml = `<input type="${field.type}" class="form-control ${additionalClasses}" 
                    id="${fieldId}" name="${field.id}" value="${this.escapeHtml(value)}" 
                    placeholder="${placeholder}" ${required} ${readonly}>`;
                break;

            case 'number':
                const min = field.validation?.min ? `min="${field.validation.min}"` : '';
                const max = field.validation?.max ? `max="${field.validation.max}"` : '';
                inputHtml = `<input type="number" class="form-control ${additionalClasses}" 
                    id="${fieldId}" name="${field.id}" value="${value || ''}" 
                    placeholder="${placeholder}" ${min} ${max} ${required} ${readonly}>`;
                break;

            case 'textarea':
                const maxLength = field.validation?.max ? `maxlength="${field.validation.max}"` : '';
                inputHtml = `<textarea class="form-control ${additionalClasses}" 
                    id="${fieldId}" name="${field.id}" rows="3" 
                    placeholder="${placeholder}" ${maxLength} ${required} ${readonly}>${this.escapeHtml(value)}</textarea>`;
                break;

            case 'select':
                // Check if options should be loaded from API
                if (field.optionsSource === 'api' && field.optionsEndpoint) {
                    // Generate select with loading placeholder
                    inputHtml = `<select class="form-select ${additionalClasses}" 
                        id="${fieldId}" name="${field.id}" ${required} ${readonly ? 'disabled' : ''} 
                        data-options-endpoint="${field.optionsEndpoint}">
                        <option value="">⏳ Ładowanie opcji...</option>
                    </select>`;
                    
                    // Load options asynchronously
                    setTimeout(async () => {
                        await this.loadSelectOptions(fieldId, field.optionsEndpoint, value);
                    }, 0);
                } else {
                    // Static options from field config
                    const optionsHtml = field.options?.map(option => 
                        `<option value="${this.escapeHtml(option)}" ${value === option ? 'selected' : ''}>
                            ${this.escapeHtml(option)}
                        </option>`
                    ).join('') || '';
                    
                    inputHtml = `<select class="form-select ${additionalClasses}" 
                        id="${fieldId}" name="${field.id}" ${required} ${readonly ? 'disabled' : ''}>
                        <option value="">-- Wybierz --</option>
                        ${optionsHtml}
                    </select>`;
                }
                break;

            case 'boolean':
                const checked = value === true || value === 'true' ? 'checked' : '';
                inputHtml = `<div class="form-check">
                    <input type="checkbox" class="form-check-input ${additionalClasses}" 
                        id="${fieldId}" name="${field.id}" value="true" ${checked} ${readonly ? 'disabled' : ''}>
                    <label class="form-check-label" for="${fieldId}">
                        ${field.name}
                    </label>
                </div>`;
                labelHtml = ''; // Label jest już w checkboxie
                break;

            case 'date':
                inputHtml = `<input type="date" class="form-control ${additionalClasses}" 
                    id="${fieldId}" name="${field.id}" value="${value || ''}" 
                    ${required} ${readonly}>`;
                break;

            default:
                inputHtml = `<input type="text" class="form-control ${additionalClasses}" 
                    id="${fieldId}" name="${field.id}" value="${this.escapeHtml(value)}" 
                    placeholder="${placeholder}" ${required} ${readonly}>`;
        }

        return `
            <div class="mb-3" data-field-id="${field.id}">
                ${labelHtml}
                ${inputHtml}
                ${helpTextHtml}
            </div>
        `;
    },

    /**
     * Escape HTML characters 
     */
    escapeHtml(text) {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * Pobiera wartości z formularza dla pól kolekcji
     */
    getFormValues(formElement, fields) {
        const values = {};
        
        fields.forEach(field => {
            const fieldElement = formElement.querySelector(`[name="${field.id}"]`);
            if (fieldElement) {
                if (field.type === 'boolean') {
                    values[field.id] = fieldElement.checked;
                } else if (field.type === 'number') {
                    values[field.id] = fieldElement.value ? parseFloat(fieldElement.value) : null;
                } else {
                    values[field.id] = fieldElement.value || null;
                }
            }
        });

        return values;
    },

    /**
     * Waliduje wartości pól
     */
    validateFieldValues(values, fields) {
        const errors = [];

        fields.forEach(field => {
            const value = values[field.id];

            // Sprawdź wymagane pola
            if (field.required && (value === null || value === undefined || value === '')) {
                errors.push({
                    fieldId: field.id,
                    fieldName: field.name,
                    message: `Pole "${field.name}" jest wymagane`
                });
                return;
            }

            // Walidacja na podstawie typu i reguł
            if (value !== null && value !== undefined && value !== '') {
                if (field.validation) {
                    const validation = field.validation;
                    
                    if (validation.min !== undefined) {
                        if (field.type === 'number' && parseFloat(value) < validation.min) {
                            errors.push({
                                fieldId: field.id,
                                fieldName: field.name,
                                message: `Wartość musi być większa lub równa ${validation.min}`
                            });
                        } else if (typeof value === 'string' && value.length < validation.min) {
                            errors.push({
                                fieldId: field.id,
                                fieldName: field.name,
                                message: `Tekst musi mieć co najmniej ${validation.min} znaków`
                            });
                        }
                    }

                    if (validation.max !== undefined) {
                        if (field.type === 'number' && parseFloat(value) > validation.max) {
                            errors.push({
                                fieldId: field.id,
                                fieldName: field.name,
                                message: `Wartość musi być mniejsza lub równa ${validation.max}`
                            });
                        } else if (typeof value === 'string' && value.length > validation.max) {
                            errors.push({
                                fieldId: field.id,
                                fieldName: field.name,
                                message: `Tekst może mieć maksymalnie ${validation.max} znaków`
                            });
                        }
                    }

                    if (validation.pattern && typeof value === 'string') {
                        const regex = new RegExp(validation.pattern);
                        if (!regex.test(value)) {
                            errors.push({
                                fieldId: field.id,
                                fieldName: field.name,
                                message: validation.message || `Wartość nie spełnia wymagań formatu`
                            });
                        }
                    }
                }
            }
        });

        return errors;
    }
};

// Utwórz globalną instancję
window.collectionFieldsConfig = new CollectionFieldsConfig();

// Export dla modułów
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CollectionFieldsConfig, CollectionFieldsHelpers };
}

// Globalna dostępność
window.CollectionFieldsHelpers = CollectionFieldsHelpers;