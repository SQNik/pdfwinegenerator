/**
 * CollectionFieldsManager - Manager do zarządzania polami dynamicznymi kolekcji
 * 
 * Funkcjonalności:
 * - Zarządzanie polami kolekcji (CRUD)
 * - Interface do tworzenia/edycji pól
 * - Drag & drop kolejność pól
 * - Podgląd na żywo
 * - Synchronizacja z CollectionsManager
 */
class CollectionFieldsManager {
    constructor() {
        this.currentField = null;
        this.isEditMode = false;
        this.draggedElement = null;
        
        // Container selectors
        this.containerSelector = null;
        this.modalSelector = null;
        this.editModalSelector = null;
        
        // Field types configuration
        this.fieldTypes = [
            { value: 'text', label: 'Tekst', icon: 'bi-fonts' },
            { value: 'textarea', label: 'Tekst wieloliniowy', icon: 'bi-textarea' },
            { value: 'number', label: 'Liczba', icon: 'bi-123' },
            { value: 'select', label: 'Lista wyboru', icon: 'bi-list-ul' },
            { value: 'boolean', label: 'Tak/Nie', icon: 'bi-check-square' },
            { value: 'date', label: 'Data', icon: 'bi-calendar' },
            { value: 'email', label: 'Email', icon: 'bi-envelope' },
            { value: 'url', label: 'URL', icon: 'bi-link-45deg' }
        ];
    }

    /**
     * Inicjalizuje manager z określonymi kontenerami
     * @param {string} containerSelector - Selektor kontenera głównego
     * @param {string} modalSelector - Selektor modalu głównego
     * @param {string} editModalSelector - Selektor modalu edycji
     */
    init(containerSelector, modalSelector, editModalSelector) {
        this.containerSelector = containerSelector;
        this.modalSelector = modalSelector;
        this.editModalSelector = editModalSelector;
        
        this.setupEventListeners();
        this.loadFields();
        console.log('CollectionFieldsManager: Zainicjalizowano z kontenerami', {
            container: containerSelector,
            modal: modalSelector,
            editModal: editModalSelector
        });
    }

    /**
     * Pokazuje modal zarządzania polami
     */
    show() {
        if (!this.modalSelector) {
            console.error('CollectionFieldsManager: Modal nie jest skonfigurowany');
            return;
        }
        
        const modal = document.querySelector(this.modalSelector);
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
            this.loadFields(); // Odśwież listę pól przy otwarciu
        } else {
            console.error('CollectionFieldsManager: Nie znaleziono modalu:', this.modalSelector);
        }
    }

    setupEventListeners() {
        // Nasłuchiwanie zmian konfiguracji pól
        document.addEventListener('collectionFieldsConfigChanged', (e) => {
            this.onFieldsConfigChanged(e.detail);
        });

        // Event listeners dla UI
        const addFieldBtn = document.getElementById('addCollectionFieldBtn');
        if (addFieldBtn) {
            addFieldBtn.addEventListener('click', () => this.showFieldModal());
        }

        // Event listeners dla modala
        const modal = document.getElementById('collectionFieldEditModal');
        if (modal) {
            modal.addEventListener('hidden.bs.modal', () => {
                console.log('CollectionFieldsManager: Modal hidden event');
                this.resetFieldModal();
                this.cleanupModalBackdrop();
            });
        }

        // Event listeners dla przycisków zamknięcia modala
        const closeButtons = modal?.querySelectorAll('[data-bs-dismiss="modal"]');
        closeButtons?.forEach(button => {
            button.addEventListener('click', () => {
                console.log('CollectionFieldsManager: Close button clicked');
                setTimeout(() => this.cleanupModalBackdrop(), 300);
            });
        });

        const saveBtn = document.getElementById('saveCollectionFieldEditBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveField());
        }

        // Event listener dla typu pola
        const typeSelect = document.getElementById('collectionFieldType');
        if (typeSelect) {
            typeSelect.addEventListener('change', () => this.onFieldTypeChange());
        }
    }

    cleanupModalBackdrop() {
        console.log('CollectionFieldsManager: Czyszczenie modal backdrop...');
        
        // Sprawdź czy Bootstrap jest dostępny
        if (typeof bootstrap === 'undefined') {
            console.error('Bootstrap nie jest załadowany!');
            return;
        }
        
        // Usuń wszystkie backdrop
        const backdrops = document.querySelectorAll('.modal-backdrop');
        console.log(`Znaleziono ${backdrops.length} backdrop do usunięcia`);
        backdrops.forEach((backdrop, index) => {
            console.log(`Usuwanie backdrop ${index + 1}`);
            backdrop.remove();
        });
        
        // Wyczyść klasy body
        console.log('Czyszczenie klas body...');
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('padding-right');
        
        // Wyczyść aria-hidden z modali
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.removeAttribute('aria-hidden');
            modal.style.display = 'none';
        });
        
        // Sprawdź czy zostały jakieś backdrop po chwili
        setTimeout(() => {
            const remainingBackdrops = document.querySelectorAll('.modal-backdrop');
            if (remainingBackdrops.length > 0) {
                console.log(`CollectionFieldsManager: Pozostało ${remainingBackdrops.length} backdrop - usuwanie...`);
                remainingBackdrops.forEach((b, index) => {
                    console.log(`Usuwanie pozostałego backdrop ${index + 1}`);
                    b.remove();
                });
            } else {
                console.log('CollectionFieldsManager: Wszystkie backdrop zostały usunięte');
            }
            
            // Wyczyść ponownie klasy body
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');
            
            console.log('CollectionFieldsManager: Czyszczenie backdrop zakończone');
        }, 200);
    }

    async loadFields() {
        try {
            await window.collectionFieldsConfig.loadFromServer();
            this.renderFieldsList();
        } catch (error) {
            console.error('CollectionFieldsManager: Błąd ładowania pól:', error);
            this.showAlert('danger', 'Błąd ładowania pól kolekcji');
        }
    }

    onFieldsConfigChanged(detail) {
        console.log('CollectionFieldsManager: Konfiguracja pól się zmieniła', detail);
        this.renderFieldsList();
        
        // Emituj event dla CollectionsManager
        const event = new CustomEvent('collectionFieldsUpdated', {
            detail: { fields: detail.fields }
        });
        document.dispatchEvent(event);
    }

    async renderFieldsList() {
        const container = this.containerSelector ? document.querySelector(this.containerSelector) : document.getElementById('collectionFieldsList');
        if (!container) return;

        try {
            const fields = await window.collectionFieldsConfig.getFields();
            
            if (fields.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-4">
                        <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                        <p class="text-muted mt-2">Brak pól kolekcji</p>
                        <button class="btn btn-primary" onclick="collectionFieldsManager.showFieldModal()">
                            <i class="bi bi-plus-circle"></i> Dodaj pierwsze pole
                        </button>
                    </div>
                `;
                return;
            }

            // Sortuj pola według displayOrder
            const sortedFields = [...fields].sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

            container.innerHTML = `
                <div class="row">
                    <div class="col-12">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5>Pola kolekcji (${fields.length})</h5>
                            <button class="btn btn-primary btn-sm" onclick="collectionFieldsManager.showFieldModal()">
                                <i class="bi bi-plus-circle"></i> Dodaj pole
                            </button>
                        </div>
                        <div id="fieldsContainer" class="sortable-container">
                            ${sortedFields.map(field => this.renderFieldCard(field)).join('')}
                        </div>
                    </div>
                </div>
            `;

            this.setupDragAndDrop();
        } catch (error) {
            console.error('CollectionFieldsManager: Błąd renderowania listy pól:', error);
            container.innerHTML = '<div class="alert alert-danger">Błąd ładowania pól kolekcji</div>';
        }
    }

    renderFieldCard(field) {
        const typeInfo = this.fieldTypes.find(t => t.value === field.type) || 
                        { label: field.type, icon: 'bi-question-circle' };
        
        const isActive = field.isActive !== false;
        const statusBadge = isActive ? 
            '<span class="badge bg-success">Aktywne</span>' : 
            '<span class="badge bg-secondary">Nieaktywne</span>';

        return `
            <div class="card mb-2 field-card" data-field-id="${field.id}" draggable="true">
                <div class="card-body py-2">
                    <div class="row align-items-center">
                        <div class="col-1">
                            <i class="bi bi-grip-vertical text-muted drag-handle" style="cursor: move;"></i>
                        </div>
                        <div class="col-1">
                            <i class="${typeInfo.icon} text-primary"></i>
                        </div>
                        <div class="col-6">
                            <strong>${field.name}</strong>
                            <small class="text-muted d-block">${typeInfo.label}</small>
                            ${field.required ? '<i class="bi bi-asterisk text-danger" title="Pole wymagane"></i>' : ''}
                        </div>
                        <div class="col-2">
                            ${statusBadge}
                        </div>
                        <div class="col-2 text-end">
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="collectionFieldsManager.editField('${field.id}')" title="Edytuj">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-outline-success" onclick="collectionFieldsManager.previewField('${field.id}')" title="Podgląd">
                                    <i class="bi bi-eye"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="collectionFieldsManager.deleteField('${field.id}')" title="Usuń">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupDragAndDrop() {
        const container = document.getElementById('fieldsContainer');
        if (!container) return;

        const cards = container.querySelectorAll('.field-card');
        
        cards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                this.draggedElement = card;
                card.style.opacity = '0.5';
                e.dataTransfer.effectAllowed = 'move';
            });

            card.addEventListener('dragend', () => {
                card.style.opacity = '1';
                this.draggedElement = null;
            });

            card.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
            });

            card.addEventListener('drop', (e) => {
                e.preventDefault();
                if (this.draggedElement && this.draggedElement !== card) {
                    const rect = card.getBoundingClientRect();
                    const midY = rect.top + rect.height / 2;
                    
                    if (e.clientY < midY) {
                        container.insertBefore(this.draggedElement, card);
                    } else {
                        container.insertBefore(this.draggedElement, card.nextSibling);
                    }
                    
                    this.saveFieldsOrder();
                }
            });
        });
    }

    async saveFieldsOrder() {
        const container = document.getElementById('fieldsContainer');
        if (!container) return;

        const cards = container.querySelectorAll('.field-card');
        const fieldIds = Array.from(cards).map(card => card.dataset.fieldId);

        try {
            await window.collectionFieldsConfig.updateFieldsOrder(fieldIds);
            this.showAlert('success', 'Kolejność pól została zaktualizowana');
        } catch (error) {
            console.error('CollectionFieldsManager: Błąd aktualizacji kolejności:', error);
            this.showAlert('danger', 'Błąd aktualizacji kolejności pól');
            this.renderFieldsList(); // Przywróć poprzednią kolejność
        }
    }

    showFieldModal(fieldId = null) {
        this.isEditMode = !!fieldId;
        this.currentField = fieldId;

        const modal = new bootstrap.Modal(document.getElementById('collectionFieldEditModal'));
        const title = document.getElementById('collectionFieldEditModalTitle');
        
        if (this.isEditMode) {
            title.textContent = 'Edytuj pole kolekcji';
            this.loadFieldToModal(fieldId);
        } else {
            title.textContent = 'Nowe pole kolekcji';
            this.resetFieldModal();
        }

        modal.show();
    }

    async loadFieldToModal(fieldId) {
        try {
            const field = await window.collectionFieldsConfig.getFieldById(fieldId);
            if (!field) throw new Error('Nie znaleziono pola');

            // Wypełnij formularz
            document.getElementById('collectionFieldId').value = field.id;
            document.getElementById('collectionFieldName').value = field.name;
            document.getElementById('collectionFieldType').value = field.type;
            document.getElementById('collectionFieldRequired').checked = field.required || false;
            document.getElementById('collectionFieldActive').checked = field.isActive !== false;
            document.getElementById('collectionFieldPlaceholder').value = field.placeholder || '';
            document.getElementById('collectionFieldHelpText').value = field.helpText || '';

            // Walidacja
            if (field.validation) {
                document.getElementById('collectionFieldValidationMin').value = field.validation.min || '';
                document.getElementById('collectionFieldValidationMax').value = field.validation.max || '';
                document.getElementById('collectionFieldValidationPattern').value = field.validation.pattern || '';
                document.getElementById('collectionFieldValidationMessage').value = field.validation.message || '';
            }

            // Opcje dla select
            if (field.type === 'select' && field.options) {
                document.getElementById('collectionFieldOptions').value = field.options.join('\n');
            }

            this.onFieldTypeChange();
        } catch (error) {
            console.error('CollectionFieldsManager: Błąd ładowania pola do modala:', error);
            this.showAlert('danger', 'Błąd ładowania danych pola');
        }
    }

    resetFieldModal() {
        document.getElementById('collectionFieldEditForm').reset();
        document.getElementById('collectionFieldId').value = '';
        document.getElementById('collectionFieldActive').checked = true;
        this.onFieldTypeChange();
    }

    onFieldTypeChange() {
        const type = document.getElementById('collectionFieldType').value;
        const optionsContainer = document.getElementById('collectionFieldOptionsContainer');

        // Pokaż/ukryj opcje dla select
        if (optionsContainer) {
            if (type === 'select') {
                optionsContainer.classList.remove('d-none');
            } else {
                optionsContainer.classList.add('d-none');
            }
        }

        // Dostosuj walidację dla różnych typów
        const minInput = document.getElementById('collectionFieldValidationMin');
        const maxInput = document.getElementById('collectionFieldValidationMax');
        const patternInput = document.getElementById('collectionFieldValidationPattern');
        
        if (minInput && maxInput && patternInput) {
            if (type === 'number') {
                minInput.placeholder = 'Minimalna wartość';
                maxInput.placeholder = 'Maksymalna wartość';
                patternInput.style.display = 'none';
            } else if (type === 'text' || type === 'textarea') {
                minInput.placeholder = 'Minimalna długość';
                maxInput.placeholder = 'Maksymalna długość';
                patternInput.style.display = 'block';
            } else {
                minInput.placeholder = '';
                maxInput.placeholder = '';
                patternInput.style.display = type === 'text' ? 'block' : 'none';
            }
        }
    }

    async saveField() {
        const form = document.getElementById('collectionFieldEditForm');
        if (!this.validateFieldForm(form)) return;

        const formData = new FormData(form);
        const fieldData = {
            id: formData.get('fieldId') || this.generateFieldId(),
            name: formData.get('fieldName'),
            type: formData.get('fieldType'),
            required: formData.has('fieldRequired'),
            isActive: formData.has('fieldActive')
        };

        // Opcjonalne pola - dodaj tylko jeśli mają wartość
        const placeholder = formData.get('fieldPlaceholder');
        const helpText = formData.get('fieldHelpText');
        
        if (placeholder && placeholder.trim()) {
            fieldData.placeholder = placeholder.trim();
        }
        
        if (helpText && helpText.trim()) {
            fieldData.helpText = helpText.trim();
        }

        // Walidacja
        const validation = {};
        const min = formData.get('validationMin');
        const max = formData.get('validationMax');
        const pattern = formData.get('validationPattern');
        const message = formData.get('validationMessage');

        if (min) validation.min = fieldData.type === 'number' ? parseFloat(min) : parseInt(min);
        if (max) validation.max = fieldData.type === 'number' ? parseFloat(max) : parseInt(max);
        if (pattern) validation.pattern = pattern;
        if (message) validation.message = message;

        if (Object.keys(validation).length > 0) {
            fieldData.validation = validation;
        }

        // Opcje dla select
        if (fieldData.type === 'select') {
            const optionsText = formData.get('fieldOptions') || '';
            fieldData.options = optionsText.split('\n')
                .map(opt => opt.trim())
                .filter(opt => opt.length > 0);
        }

        try {
            console.log('CollectionFieldsManager: Zapisywanie pola...', fieldData);
            
            if (this.isEditMode) {
                await window.collectionFieldsConfig.updateField(this.currentField, fieldData);
                this.showAlert('success', 'Pole zostało zaktualizowane');
            } else {
                await window.collectionFieldsConfig.addField(fieldData);
                this.showAlert('success', 'Pole zostało dodane');
            }

            console.log('CollectionFieldsManager: Pole zapisane pomyślnie');

            // Zamknij modal - ulepszona wersja
            const modalElement = document.getElementById('collectionFieldEditModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            
            if (modal) {
                console.log('CollectionFieldsManager: Zamykanie modala...');
                modal.hide();
                
                // Reset formularza natychmiast
                this.resetFieldModal();
                
                // Użyj dedykowanej metody czyszczenia
                setTimeout(() => this.cleanupModalBackdrop(), 300);
                setTimeout(() => this.cleanupModalBackdrop(), 600); // Drugi raz dla pewności
            }

            // Odśwież listę pól
            console.log('CollectionFieldsManager: Odświeżanie listy pól...');
            setTimeout(async () => {
                await this.loadFields();
                console.log('CollectionFieldsManager: Lista pól odświeżona');
            }, 100);
            
        } catch (error) {
            console.error('CollectionFieldsManager: Błąd zapisywania pola:', error);
            this.showAlert('danger', `Błąd zapisywania pola: ${error.message}`);
        }
    }

    validateFieldForm(form) {
        const name = form.querySelector('[name="fieldName"]').value.trim();
        const type = form.querySelector('[name="fieldType"]').value;

        if (!name) {
            this.showAlert('warning', 'Nazwa pola jest wymagana');
            return false;
        }

        if (!type) {
            this.showAlert('warning', 'Typ pola jest wymagany');
            return false;
        }

        // Waliduj opcje dla select
        if (type === 'select') {
            const options = form.querySelector('[name="fieldOptions"]').value.trim();
            if (!options) {
                this.showAlert('warning', 'Opcje są wymagane dla pola typu "Lista wyboru"');
                return false;
            }
        }

        return true;
    }

    generateFieldId() {
        return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async editField(fieldId) {
        this.showFieldModal(fieldId);
    }

    async previewField(fieldId) {
        try {
            const field = await window.collectionFieldsConfig.getFieldById(fieldId);
            if (!field) throw new Error('Nie znaleziono pola');

            const previewHtml = window.CollectionFieldsHelpers.generateFormField(field, '', {
                showLabel: true,
                showHelpText: true,
                additionalClasses: 'preview-field'
            });

            const modal = document.getElementById('collectionFieldPreviewModal');
            if (!modal) {
                // Utwórz modal podglądu jeśli nie istnieje
                this.createPreviewModal();
            }

            document.getElementById('fieldPreviewContent').innerHTML = previewHtml;
            document.getElementById('fieldPreviewTitle').textContent = `Podgląd pola: ${field.name}`;
            
            const previewModal = new bootstrap.Modal(document.getElementById('collectionFieldPreviewModal'));
            previewModal.show();

        } catch (error) {
            console.error('CollectionFieldsManager: Błąd podglądu pola:', error);
            this.showAlert('danger', 'Błąd podglądu pola');
        }
    }

    createPreviewModal() {
        const modalHtml = `
            <div class="modal fade" id="collectionFieldPreviewModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="fieldPreviewTitle">Podgląd pola</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div id="fieldPreviewContent"></div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zamknij</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    async deleteField(fieldId) {
        try {
            const field = await window.collectionFieldsConfig.getFieldById(fieldId);
            if (!field) throw new Error('Nie znaleziono pola');

            const confirmed = confirm(`Czy na pewno chcesz usunąć pole "${field.name}"?\n\nUwaga: Dane w istniejących kolekcjach nie zostaną usunięte, ale pole nie będzie widoczne w interfejsie.`);
            
            if (confirmed) {
                await window.collectionFieldsConfig.deleteField(fieldId);
                this.showAlert('success', 'Pole zostało usunięte');
            }
        } catch (error) {
            console.error('CollectionFieldsManager: Błąd usuwania pola:', error);
            this.showAlert('danger', `Błąd usuwania pola: ${error.message}`);
        }
    }

    showAlert(type, message) {
        const alertContainer = document.getElementById('collectionFieldsAlerts');
        if (!alertContainer) return;

        const alertId = `alert_${Date.now()}`;
        const alertHtml = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        alertContainer.insertAdjacentHTML('beforeend', alertHtml);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            const alert = document.getElementById(alertId);
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
}

// Globalna dostępność
window.CollectionFieldsManager = CollectionFieldsManager;