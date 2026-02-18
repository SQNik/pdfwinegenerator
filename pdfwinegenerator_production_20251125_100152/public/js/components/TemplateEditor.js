/**
 * HTML Template Editor Component
 * Główny komponent zarządzający edytorem szablonów HTML
 */
class TemplateEditor {
    constructor() {
        this.currentTemplate = null;
        this.templates = [];
        this.categories = [];
        this.wineFields = [];
        this.collectionFields = [];
        this.wines = [];
        this.collections = [];
        this.customFormats = [];
        this.unsavedChanges = false;
        this.dragDropInitialized = false; // Flag to prevent double initialization
        
        // CodeMirror editors
        this.htmlEditor = null;
        this.cssEditor = null;
        this.jsEditor = null;
        
        // Preview settings
        this.previewSettings = {
            format: 'A5',
            sampleWine: null,
            sampleCollection: null,
            previewType: 'wine',
            printBackground: true,
            backgroundColor: '#f5f5f5',
            linkColor: '#0d6efd'
        };
        
        // Zoom settings
        this.zoomLevel = 1.0; // 100%
        this.zoomMin = 0.1; // 10%
        this.zoomMax = 3.0; // 300%
        this.zoomStep = 0.1; // 10% per click
        
        this.init();
    }

    // Helper method to safely get element value
    getElementValue(id, defaultValue = '') {
        const element = document.getElementById(id);
        return element ? element.value : defaultValue;
    }

    // Helper method to safely set element value
    setElementValue(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
        }
    }

    // Helper method to safely close Bootstrap modals
    closeModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;

        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        }

        // Force cleanup of backdrop and body classes
        setTimeout(() => {
            // Remove all modal backdrops
            document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
                backdrop.remove();
            });
            
            // Remove modal-open class from body
            document.body.classList.remove('modal-open');
            
            // Reset body styles
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }, 300); // Wait for modal hide animation
    }

    async init() {
        try {
            console.log('TemplateEditor: Initializing...');
            
            // Initialize CodeMirror editors
            this.initializeEditors();
            
            // Load initial data
            await this.loadInitialData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI
            this.initializeUI();
            
            console.log('TemplateEditor: Initialized successfully');
            
        } catch (error) {
            console.error('TemplateEditor: Initialization failed:', error);
            this.showError('Błąd inicjalizacji edytora: ' + error.message);
        }
    }

    initializeEditors() {
        // HTML Editor
        this.htmlEditor = CodeMirror.fromTextArea(document.getElementById('htmlEditor'), {
            mode: 'htmlmixed',
            theme: 'default',
            lineNumbers: true,
            autoCloseBrackets: true,
            autoCloseTags: true,
            foldGutter: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            extraKeys: {
                'Ctrl-Space': 'autocomplete',
                'Ctrl-S': () => this.saveTemplate(),
                'F11': () => this.toggleFullScreen(),
                'Esc': () => this.exitFullScreen()
            }
        });

        // CSS Editor
        this.cssEditor = CodeMirror.fromTextArea(document.getElementById('cssEditor'), {
            mode: 'css',
            theme: 'default',
            lineNumbers: true,
            autoCloseBrackets: true,
            foldGutter: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            extraKeys: {
                'Ctrl-Space': 'autocomplete',
                'Ctrl-S': () => this.saveTemplate()
            }
        });

        // JavaScript Editor
        this.jsEditor = CodeMirror.fromTextArea(document.getElementById('jsEditor'), {
            mode: 'javascript',
            theme: 'default',
            lineNumbers: true,
            autoCloseBrackets: true,
            foldGutter: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            extraKeys: {
                'Ctrl-Space': 'autocomplete',
                'Ctrl-S': () => this.saveTemplate()
            }
        });

        // Set up change listeners
        this.htmlEditor.on('change', () => this.onEditorChange());
        this.cssEditor.on('change', () => this.onEditorChange());
        this.jsEditor.on('change', () => this.onEditorChange());

        console.log('TemplateEditor: CodeMirror editors initialized');
    }

    async loadInitialData() {
        const loadingPromises = [
            this.loadTemplates(),
            this.loadCategories(),
            this.loadWineFields(),
            this.loadCollectionFields(),
            this.loadWines(),
            this.loadCollections(),
            this.loadCustomFormats()
        ];

        await Promise.all(loadingPromises);
        console.log('TemplateEditor: Initial data loaded');
    }

    async loadTemplates() {
        try {
            const response = await fetch('/api/template-editor/templates');
            const result = await response.json();
            
            if (result.success) {
                this.templates = result.data;
                this.updateTemplatesList();
            } else {
                throw new Error(result.error || 'Failed to load templates');
            }
        } catch (error) {
            console.error('TemplateEditor: Error loading templates:', error);
            this.showError('Błąd ładowania szablonów: ' + error.message);
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/template-editor/categories');
            const result = await response.json();
            
            if (result.success) {
                this.categories = result.data;
                this.updateCategoriesDropdown();
            } else {
                throw new Error(result.error || 'Failed to load categories');
            }
        } catch (error) {
            console.error('TemplateEditor: Error loading categories:', error);
        }
    }

    async loadWineFields() {
        try {
            const response = await fetch('/api/template-editor/wine-fields');
            const result = await response.json();
            
            if (result.success) {
                this.wineFields = result.data;
                this.updateWineFieldsList();
            } else {
                throw new Error(result.error || 'Failed to load wine fields');
            }
        } catch (error) {
            console.error('TemplateEditor: Error loading wine fields:', error);
        }
    }

    async loadCollectionFields() {
        try {
            const response = await fetch('/api/template-editor/collection-fields');
            const result = await response.json();
            
            if (result.success) {
                this.collectionFields = result.data;
                this.updateCollectionFieldsList();
            } else {
                throw new Error(result.error || 'Failed to load collection fields');
            }
        } catch (error) {
            console.error('TemplateEditor: Error loading collection fields:', error);
        }
    }

    async loadCollections() {
        try {
            const response = await fetch('/api/collections');
            const result = await response.json();
            
            if (result.success) {
                this.collections = result.data;
                this.updateSampleCollectionDropdown();
            } else {
                throw new Error(result.error || 'Failed to load collections');
            }
        } catch (error) {
            console.error('TemplateEditor: Error loading collections:', error);
        }
    }

    async loadCustomFormats() {
        try {
            const response = await api.getCustomFormats();
            if (response.success) {
                this.customFormats = response.data;
                this.updateFormatOptionsDropdown();
            } else {
                throw new Error(response.error || 'Failed to load custom formats');
            }
        } catch (error) {
            console.error('TemplateEditor: Error loading custom formats:', error);
            // Nie blokujemy aplikacji jeśli custom formaty się nie załadują
            this.customFormats = [];
        }
    }

    async loadWines() {
        try {
            const response = await api.getWines();
            if (response.success) {
                this.wines = response.data;
                this.updateSampleWineDropdown();
            } else {
                throw new Error(response.error || 'Failed to load wines');
            }
        } catch (error) {
            console.error('TemplateEditor: Error loading wines:', error);
        }
    }

    setupEventListeners() {
        // Helper function to safely add event listener
        const addListener = (id, event, handler) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, handler);
            } else {
                console.warn(`TemplateEditor: Element with id '${id}' not found`);
            }
        };

        // Template actions
        addListener('newTemplateBtn', 'click', () => this.showNewTemplateModal());
        addListener('saveTemplateMetaBtn', 'click', () => this.saveTemplateMetadata());
        addListener('saveTemplateBtn', 'click', () => this.saveTemplate());
        addListener('previewBtn', 'click', () => this.generatePreview());
        addListener('refreshTemplatesBtn', 'click', () => this.loadTemplates());

        // Template creation
        addListener('createTemplateBtn', 'click', () => this.createTemplate());
        
        // Setup PDF format listener for new template modal
        const newFormatSelect = document.getElementById('newTemplatePdfFormat');
        if (newFormatSelect) {
            newFormatSelect.addEventListener('change', (e) => {
                const customFields = document.getElementById('newCustomFormatFields');
                if (customFields) {
                    customFields.style.display = e.target.value === 'custom' ? 'block' : 'none';
                }
            });
        }

        // Search and filter
        addListener('templateSearch', 'input', (e) => this.filterTemplates(e.target.value));
        addListener('categoryFilter', 'change', (e) => this.filterByCategory(e.target.value));

        // Editor toolbar
        addListener('undoBtn', 'click', () => this.getCurrentEditor().undo());
        addListener('redoBtn', 'click', () => this.getCurrentEditor().redo());
        addListener('formatCodeBtn', 'click', () => this.formatCode());
        addListener('fullScreenBtn', 'click', () => this.toggleFullScreen());

        // Preview controls
        addListener('refreshPreviewBtn', 'click', () => this.refreshPreview());
        addListener('previewOptionsBtn', 'click', () => this.showPreviewOptionsModal());
        addListener('applyPreviewOptionsBtn', 'click', () => this.applyPreviewOptions());
        
        // Zoom controls
        addListener('zoomInBtn', 'click', () => this.zoomIn());
        addListener('zoomOutBtn', 'click', () => this.zoomOut());
        addListener('zoomResetBtn', 'click', () => this.zoomReset());
        addListener('zoomFitBtn', 'click', () => this.zoomFit());
        
        // Keyboard shortcuts for zoom
        document.addEventListener('keydown', (e) => {
            // Check if preview is focused (or always allow zoom shortcuts)
            if (e.ctrlKey || e.metaKey) {
                if (e.key === '+' || e.key === '=') {
                    e.preventDefault();
                    this.zoomIn();
                } else if (e.key === '-' || e.key === '_') {
                    e.preventDefault();
                    this.zoomOut();
                } else if (e.key === '0') {
                    e.preventDefault();
                    this.zoomReset();
                }
            }
        });
        
        // Color pickers sync
        addListener('previewBgColor', 'input', (e) => {
            const hexInput = document.getElementById('previewBgColorHex');
            if (hexInput) hexInput.value = e.target.value;
        });
        addListener('previewBgColorHex', 'input', (e) => {
            const color = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                const colorInput = document.getElementById('previewBgColor');
                if (colorInput) colorInput.value = color;
            }
        });
        
        addListener('previewLinkColor', 'input', (e) => {
            const hexInput = document.getElementById('previewLinkColorHex');
            if (hexInput) hexInput.value = e.target.value;
        });
        addListener('previewLinkColorHex', 'input', (e) => {
            const color = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                const colorInput = document.getElementById('previewLinkColor');
                if (colorInput) colorInput.value = color;
            }
        });
        
        // Reset colors button
        addListener('resetColorsBtn', 'click', () => this.resetPreviewColors());
        
        // Preview type toggle
        addListener('previewType', 'change', (e) => this.togglePreviewType(e.target.value));

        // Drag and drop for wine fields
        this.setupDragAndDrop();
        
        // Mouse wheel zoom for preview
        const previewBody = document.getElementById('previewBody');
        if (previewBody) {
            previewBody.addEventListener('wheel', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    
                    // Determine zoom direction
                    const delta = e.deltaY > 0 ? -this.zoomStep : this.zoomStep;
                    this.updateZoom(this.zoomLevel + delta);
                }
            }, { passive: false });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Bootstrap modal cleanup on close
        const modalIds = ['newTemplateModal', 'editTemplateModal', 'previewOptionsModal'];
        modalIds.forEach(modalId => {
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                modalElement.addEventListener('hidden.bs.modal', () => {
                    // Force cleanup of any leftover backdrops
                    setTimeout(() => {
                        document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
                            backdrop.remove();
                        });
                        document.body.classList.remove('modal-open');
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';
                    }, 100);
                });
            }
        });

        // Prevent accidental page refresh
        window.addEventListener('beforeunload', (e) => {
            if (this.unsavedChanges) {
                e.preventDefault();
                e.returnValue = 'Masz niezapisane zmiany. Czy na pewno chcesz opuścić stronę?';
            }
        });

        console.log('TemplateEditor: Event listeners setup complete');
    }

    initializeUI() {
        // Initialize zoom display
        const zoomLevelDisplay = document.getElementById('zoomLevel');
        if (zoomLevelDisplay) {
            zoomLevelDisplay.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
        
        // Set initial preview
        this.refreshPreview();
        
        // Load default template or show empty state
        if (this.templates.length > 0) {
            this.loadDefaultTemplate();
        } else {
            this.showEmptyState();
        }
    }

    updateTemplatesList() {
        const listContainer = document.getElementById('templatesList');
        
        if (this.templates.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-file-earmark-code" style="font-size: 3rem;"></i>
                    <p class="mt-2 mb-1">Brak szablonów</p>
                    <small class="text-muted">Kliknij "Nowy szablon" aby rozpocząć</small>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = this.templates.map(template => {
            const statusBadge = template.status === 'active' 
                ? '<span class="template-card-badge active"><i class="bi bi-check-circle"></i> Aktywny</span>'
                : template.status === 'archived'
                ? '<span class="template-card-badge archived"><i class="bi bi-archive"></i> Zarchiwizowany</span>'
                : '<span class="template-card-badge draft"><i class="bi bi-pencil-square"></i> Szkic</span>';
            
            return `
                <div class="template-card ${template.id === this.currentTemplate?.id ? 'active' : ''}" 
                     data-template-id="${template.id}">
                    <div class="template-card-header">
                        <div>
                            <h6 class="template-card-title">${this.escapeHtml(template.name)}</h6>
                            ${statusBadge}
                        </div>
                        <div class="template-card-actions">
                            <button type="button" class="template-card-btn edit-template-btn" 
                                    data-template-id="${template.id}"
                                    title="Edytuj informacje"
                                    onclick="event.stopPropagation();">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="template-card-btn delete delete-template-btn" 
                                    data-template-id="${template.id}"
                                    title="Usuń szablon"
                                    onclick="event.stopPropagation();">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="template-card-body">
                        ${template.description ? `
                            <div class="template-card-description">${this.escapeHtml(template.description)}</div>
                        ` : ''}
                        <div class="template-card-specs">
                            ${template.category ? `
                                <span class="template-card-spec">
                                    <i class="bi bi-tag"></i>
                                    ${this.escapeHtml(template.category)}
                                </span>
                            ` : ''}
                            <span class="template-card-spec">
                                <i class="bi bi-clock-history"></i>
                                ${this.formatDate(template.updatedAt)}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Add click listeners to template cards
        listContainer.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't load template if edit or delete button was clicked
                if (e.target.closest('.edit-template-btn') || e.target.closest('.delete-template-btn')) {
                    return;
                }
                const templateId = card.dataset.templateId;
                this.loadTemplate(templateId);
            });
        });

        // Add edit button listeners
        listContainer.querySelectorAll('.edit-template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const templateId = btn.dataset.templateId;
                this.editTemplateMetadata(templateId);
            });
        });

        // Add delete button listeners
        listContainer.querySelectorAll('.delete-template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const templateId = btn.dataset.templateId;
                const template = this.templates.find(t => t.id === templateId);
                this.confirmDeleteTemplate(templateId, template?.name || 'szablon');
            });
        });
    }

    updateCategoriesDropdown() {
        const selects = ['categoryFilter', 'templateCategory', 'editTemplateCategory'];
        
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (!select) return;
            
            const currentValue = select.value;
            
            if (selectId === 'categoryFilter') {
                select.innerHTML = '<option value="">Wszystkie kategorie</option>';
            } else {
                select.innerHTML = '';
            }
            
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                select.appendChild(option);
            });
            
            // Restore previous selection
            if (currentValue) {
                select.value = currentValue;
            }
        });
    }

    updateWineFieldsList() {
        const container = document.getElementById('wineFieldsList');
        
        if (this.wineFields.length === 0) {
            container.innerHTML = '<small class="text-muted">Brak dostępnych pól</small>';
            return;
        }

        // Group fields by group
        const groupedFields = {};
        this.wineFields.forEach(field => {
            const group = field.group || 'general';
            if (!groupedFields[group]) {
                groupedFields[group] = [];
            }
            groupedFields[group].push(field);
        });

        container.innerHTML = Object.entries(groupedFields).map(([group, fields]) => `
            <div class="field-group mb-2">
                ${group !== 'general' ? `<small class="text-muted text-uppercase fw-bold">${group}</small>` : ''}
                ${fields.map(field => `
                    <div class="field-item" 
                         draggable="true" 
                         data-field-key="${field.key}"
                         data-field-placeholder="${field.placeholder}"
                         title="${field.description}">
                        <small class="d-block fw-bold">${field.label}</small>
                        <small class="text-muted">${field.placeholder}</small>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    updateCollectionFieldsList() {
        const container = document.getElementById('collectionFieldsList');
        
        if (this.collectionFields.length === 0) {
            container.innerHTML = '<small class="text-muted">Brak dostępnych pól kolekcji</small>';
            return;
        }

        // Group fields by group
        const groupedFields = {};
        this.collectionFields.forEach(field => {
            const group = field.group || 'general';
            if (!groupedFields[group]) {
                groupedFields[group] = [];
            }
            groupedFields[group].push(field);
        });

        container.innerHTML = Object.entries(groupedFields).map(([group, fields]) => `
            <div class="collection-field-group-section mb-2">
                ${group !== 'general' ? `<small class="text-muted text-uppercase fw-bold mb-1 d-block">${group}</small>` : ''}
                ${fields.map(field => `
                    <div class="collection-field-item" 
                         draggable="true" 
                         data-field-key="${field.key}"
                         data-field-placeholder="${field.placeholder}"
                         data-field-type="collection"
                         title="${field.description}">
                        <i class="collection-field-icon bi bi-collection"></i>
                        <div class="flex-grow-1">
                            <small class="d-block fw-bold">${field.label}</small>
                            <small class="text-muted">${field.placeholder}</small>
                        </div>
                        <span class="collection-field-group ${field.group}">${field.group}</span>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    updateSampleWineDropdown() {
        const select = document.getElementById('sampleWine');
        if (!select) return;
        
        select.innerHTML = '<option value="">Losowe wino</option>';
        
        this.wines.slice(0, 20).forEach(wine => { // Limit to first 20 wines
            const option = document.createElement('option');
            option.value = wine.catalogNumber;
            option.textContent = `${wine.catalogNumber} - ${wine.name}`;
            select.appendChild(option);
        });
    }

    updateSampleCollectionDropdown() {
        const select = document.getElementById('sampleCollection');
        if (!select) return;
        
        select.innerHTML = '<option value="">Przykładowa kolekcja</option>';
        
        this.collections.slice(0, 20).forEach(collection => { // Limit to first 20 collections
            const option = document.createElement('option');
            option.value = collection.id;
            option.textContent = `${collection.name} (${collection.wines.length} win)`;
            select.appendChild(option);
        });
    }

    updateFormatOptionsDropdown() {
        const select = document.getElementById('previewFormat');
        if (!select) return;
        
        // Zapisz aktualnie wybrany format
        const currentValue = select.value;
        
        // Wyczyść opcje i dodaj standardowe formaty
        select.innerHTML = `
            <option value="A4">A4 (210 × 297 mm)</option>
            <option value="A5">A5 (148 × 210 mm)</option>
            <option value="Letter">Letter (216 × 279 mm)</option>
        `;
        
        // Dodaj niestandardowe formaty
        if (this.customFormats && this.customFormats.length > 0) {
            // Dodaj separator
            const separator = document.createElement('optgroup');
            separator.label = 'Niestandardowe formaty';
            select.appendChild(separator);
            
            // Dodaj aktywne custom formaty
            this.customFormats
                .filter(format => format.isActive)
                .forEach(format => {
                    const option = document.createElement('option');
                    option.value = `custom:${format.id}`;
                    option.textContent = `${format.name} (${format.width} × ${format.height} ${format.unit})`;
                    separator.appendChild(option);
                });
        }
        
        // Przywróć poprzednio wybrany format jeśli nadal istnieje
        if (currentValue && Array.from(select.options).some(opt => opt.value === currentValue)) {
            select.value = currentValue;
        }
    }

    setupDragAndDrop() {
        // Prevent multiple initialization
        if (this.dragDropInitialized) {
            console.log('Drag and drop already initialized, skipping...');
            return;
        }
        this.dragDropInitialized = true;

        // Handle drag start from wine fields and collection fields
        const handleDragStart = (e) => {
            if (e.target.classList.contains('field-item') || e.target.classList.contains('collection-field-item')) {
                e.dataTransfer.setData('text/plain', e.target.dataset.fieldPlaceholder);
                e.dataTransfer.effectAllowed = 'copy';
                e.target.style.opacity = '0.5';
            }
        };

        const handleDragEnd = (e) => {
            if (e.target.classList.contains('field-item') || e.target.classList.contains('collection-field-item')) {
                e.target.style.opacity = '1';
            }
        };

        document.addEventListener('dragstart', handleDragStart);
        document.addEventListener('dragend', handleDragEnd);

        // Handle drop on CodeMirror editors
        [this.htmlEditor, this.cssEditor, this.jsEditor].forEach(editor => {
            if (editor) {
                const wrapper = editor.getWrapperElement();
                
                const handleDragOver = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'copy';
                    
                    // Show cursor position indicator during drag
                    const coords = {left: e.clientX, top: e.clientY};
                    const pos = editor.coordsChar(coords, 'page');
                    if (pos) {
                        editor.setCursor(pos);
                    }
                };

                const handleDrop = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const placeholder = e.dataTransfer.getData('text/plain');
                    if (placeholder) {
                        // Calculate position relative to page, not viewport
                        const coords = {
                            left: e.pageX,
                            top: e.pageY
                        };
                        
                        // Get cursor position from coordinates (use 'page' mode for accurate positioning)
                        let cursor = editor.coordsChar(coords, 'page');
                        
                        // Fallback: if coordsChar fails or returns invalid position, use current cursor
                        if (!cursor || (cursor.line === undefined && cursor.ch === undefined)) {
                            cursor = editor.getCursor();
                            console.warn('coordsChar failed, using current cursor position');
                        }
                        
                        // Ensure cursor position is valid
                        const lineCount = editor.lineCount();
                        if (cursor.line >= lineCount) {
                            cursor.line = lineCount - 1;
                        }
                        if (cursor.line < 0) {
                            cursor.line = 0;
                        }
                        
                        const lineLength = editor.getLine(cursor.line).length;
                        if (cursor.ch > lineLength) {
                            cursor.ch = lineLength;
                        }
                        if (cursor.ch < 0) {
                            cursor.ch = 0;
                        }
                        
                        // Insert text at calculated cursor position
                        editor.replaceRange(placeholder, cursor);
                        
                        // Focus editor and set cursor after inserted text
                        editor.focus();
                        const newCursor = {
                            line: cursor.line,
                            ch: cursor.ch + placeholder.length
                        };
                        editor.setCursor(newCursor);
                        
                        // CodeMirror will automatically trigger change event
                    }
                    
                    return false;
                };

                wrapper.addEventListener('dragover', handleDragOver);
                wrapper.addEventListener('drop', handleDrop);
                
                // Also disable default CodeMirror drag and drop to prevent conflicts
                editor.setOption('dragDrop', false);
            }
        });
        
        console.log('Drag and drop initialized successfully');
    }

    togglePreviewType(type) {
        const wineOptions = document.getElementById('winePreviewOptions');
        const collectionOptions = document.getElementById('collectionPreviewOptions');
        
        if (type === 'collection') {
            wineOptions.style.display = 'none';
            collectionOptions.style.display = 'block';
            this.updateSampleCollectionDropdown();
        } else {
            wineOptions.style.display = 'block';
            collectionOptions.style.display = 'none';
            this.updateSampleWineDropdown();
        }
        
        // Update preview settings
        this.previewSettings.previewType = type;
    }

    // Template Management Methods
    
    async loadTemplate(templateId) {
        try {
            if (this.unsavedChanges) {
                if (!confirm('Masz niezapisane zmiany. Czy chcesz kontynuować bez zapisywania?')) {
                    return;
                }
            }

            this.showLoading('Ładowanie szablonu...');

            const response = await fetch(`/api/template-editor/templates/${templateId}`);
            const result = await response.json();

            if (result.success) {
                this.currentTemplate = result.data;
                this.loadTemplateIntoEditors();
                this.updateUIForCurrentTemplate();
                this.unsavedChanges = false;
                this.refreshPreview();
            } else {
                throw new Error(result.error || 'Failed to load template');
            }

        } catch (error) {
            console.error('TemplateEditor: Error loading template:', error);
            this.showError('Błąd ładowania szablonu: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    loadTemplateIntoEditors() {
        if (!this.currentTemplate) return;

        this.htmlEditor.setValue(this.currentTemplate.htmlContent || '');
        this.cssEditor.setValue(this.currentTemplate.cssContent || '');
        this.jsEditor.setValue(this.currentTemplate.jsContent || '');

        // Clear editor history
        this.htmlEditor.clearHistory();
        this.cssEditor.clearHistory();
        this.jsEditor.clearHistory();
    }

    updateUIForCurrentTemplate() {
        // Update template cards selection
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.toggle('active', card.dataset.templateId === this.currentTemplate?.id);
        });

        // Enable/disable buttons
        document.getElementById('saveTemplateBtn').disabled = false;
        document.getElementById('previewBtn').disabled = false;

        // Update status
        this.updateEditorStatus(this.currentTemplate ? 'Szablon załadowany' : 'Gotowy');
    }

    async saveTemplate() {
        if (!this.currentTemplate) {
            this.showError('Brak szablonu do zapisania');
            return;
        }

        try {
            this.showLoading('Zapisywanie szablonu...');

            const templateData = {
                name: this.currentTemplate.name,
                description: this.currentTemplate.description,
                category: this.currentTemplate.category,
                status: this.currentTemplate.status,
                htmlContent: this.htmlEditor.getValue(),
                cssContent: this.cssEditor.getValue(),
                jsContent: this.jsEditor.getValue()
            };

            const response = await api.updateTemplateEditorTemplate(this.currentTemplate.id, templateData);

            if (response.success) {
                this.currentTemplate = response.data;
                this.unsavedChanges = false;
                this.updateEditorStatus('Zapisano');
                this.showSuccess('Szablon zapisany pomyślnie');
                
                // Refresh templates list
                await this.loadTemplates();
            } else {
                throw new Error(result.error || 'Failed to save template');
            }

        } catch (error) {
            console.error('TemplateEditor: Error saving template:', error);
            this.showError('Błąd zapisywania szablonu: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async createTemplate() {
        try {
            const form = document.getElementById('newTemplateForm');

            // Build PDF settings object
            const pdfSettings = {};
            
            // Format
            const format = this.getElementValue('newTemplatePdfFormat');
            if (format && format !== '') {
                if (format === 'custom') {
                    // Custom format - collect width, height, unit
                    const width = this.getElementValue('newTemplateCustomWidth').trim();
                    const height = this.getElementValue('newTemplateCustomHeight').trim();
                    const unit = this.getElementValue('newTemplateCustomUnit') || 'mm';
                    
                    if (width && height) {
                        if (isNaN(parseFloat(width)) || isNaN(parseFloat(height))) {
                            this.showError('Szerokość i wysokość muszą być liczbami');
                            return;
                        }
                        
                        pdfSettings.customFormat = {
                            width: parseFloat(width),
                            height: parseFloat(height),
                            unit: unit
                        };
                    }
                } else {
                    pdfSettings.format = format;
                }
            }
            
            // Orientation
            const orientation = this.getElementValue('newTemplatePdfOrientation');
            if (orientation && orientation !== '') {
                pdfSettings.orientation = orientation;
            }
            
            // Margins
            const marginTop = this.getElementValue('newTemplateMarginTop').trim();
            const marginRight = this.getElementValue('newTemplateMarginRight').trim();
            const marginBottom = this.getElementValue('newTemplateMarginBottom').trim();
            const marginLeft = this.getElementValue('newTemplateMarginLeft').trim();
            
            if (marginTop || marginRight || marginBottom || marginLeft) {
                pdfSettings.margins = {};
                if (marginTop) pdfSettings.margins.top = marginTop;
                if (marginRight) pdfSettings.margins.right = marginRight;
                if (marginBottom) pdfSettings.margins.bottom = marginBottom;
                if (marginLeft) pdfSettings.margins.left = marginLeft;
            }
            
            // Print background
            const printBgCheckbox = document.getElementById('newTemplatePrintBackground');
            if (printBgCheckbox) {
                pdfSettings.printBackground = printBgCheckbox.checked;
            }

            const templateData = {
                name: this.getElementValue('templateName').trim(),
                description: this.getElementValue('templateDescription').trim(),
                category: this.getElementValue('templateCategory'),
                tags: this.getElementValue('templateTags')
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(tag => tag.length > 0),
                isPublic: document.getElementById('templatePublic')?.checked || false,
                htmlContent: this.getDefaultHtmlTemplate(),
                cssContent: this.getDefaultCssTemplate(),
                status: this.getElementValue('templateStatus') || 'draft',
                // Add PDF settings (only if not empty)
                ...(Object.keys(pdfSettings).length > 0 && { pdfSettings })
            };
            
            console.log('=== CREATE TEMPLATE DEBUG ===');
            console.log('Status from form:', this.getElementValue('templateStatus'));
            console.log('PDF Settings:', pdfSettings);
            console.log('Template Data:', templateData);
            console.log('============================');

            const response = await fetch('/api/template-editor/templates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(templateData)
            });

            const result = await response.json();

            if (result.success) {
                // Close modal
                this.closeModal('newTemplateModal');

                // Reset form if it's a form element
                if (form && typeof form.reset === 'function') {
                    form.reset();
                } else {
                    // Manually clear fields
                    ['templateName', 'templateDescription', 'templateCategory', 'templateTags'].forEach(id => {
                        const element = document.getElementById(id);
                        if (element) element.value = '';
                    });
                    const templatePublic = document.getElementById('templatePublic');
                    if (templatePublic) templatePublic.checked = false;
                }

                // Load the new template
                this.currentTemplate = result.data;
                this.loadTemplateIntoEditors();
                
                // Refresh templates list
                await this.loadTemplates();
                
                this.updateUIForCurrentTemplate();
                this.showSuccess('Szablon utworzony pomyślnie');

            } else {
                throw new Error(result.error || 'Failed to create template');
            }

        } catch (error) {
            console.error('TemplateEditor: Error creating template:', error);
            this.showError('Błąd tworzenia szablonu: ' + error.message);
        }
    }

    // Preview Methods

    async generatePreview() {
        if (!this.currentTemplate) {
            this.showError('Brak szablonu do podglądu');
            return;
        }

        try {
            this.showLoading('Generowanie podglądu PDF...');

            // Prepare preview data
            const formatValue = this.previewSettings.format;
            
            console.log('=== PREVIEW DEBUG ===');
            console.log('Selected format:', formatValue);
            console.log('Is custom format?', formatValue && formatValue.startsWith('custom:'));
            
            const previewData = {
                format: formatValue,
                options: {
                    printBackground: this.previewSettings.printBackground
                }
            };

            // Only add margins for standard formats (not custom formats)
            // Custom formats will use their own margins defined in customFormat.margins
            if (!formatValue || !formatValue.startsWith('custom:')) {
                console.log('Using DEFAULT margins (10mm) for standard format');
                previewData.options.margin = {
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm'
                };
            } else {
                const customFormatId = formatValue.replace('custom:', '');
                const customFormat = this.customFormats.find(f => f.id === customFormatId);
                console.log('Using CUSTOM format margins:', customFormat ? customFormat.margins : 'NOT FOUND!');
                console.log('Custom format details:', customFormat);
            }
            
            console.log('Preview data to send:', JSON.stringify(previewData, null, 2));
            console.log('===================');

            let endpoint = `/api/template-editor/templates/${this.currentTemplate.id}/preview`;
            
            // Choose endpoint and data based on preview type
            if (this.previewSettings.previewType === 'collection') {
                endpoint = `/api/template-editor/templates/${this.currentTemplate.id}/preview-collection`;
                
                // Add collection data if selected
                if (this.previewSettings.sampleCollection) {
                    previewData.collectionId = this.previewSettings.sampleCollection;
                }
            } else {
                // Add sample wine data if selected
                if (this.previewSettings.sampleWine) {
                    const wine = this.wines.find(w => w.catalogNumber === this.previewSettings.sampleWine);
                    if (wine) {
                        previewData.wineData = wine;
                    }
                }
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(previewData)
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                
                // Open PDF in new window
                window.open(url, '_blank');
                
                // Clean up URL
                setTimeout(() => URL.revokeObjectURL(url), 1000);
                
                this.showSuccess('Podgląd PDF wygenerowany');
            } else {
                const result = await response.json();
                throw new Error(result.error || 'Failed to generate preview');
            }

        } catch (error) {
            console.error('TemplateEditor: Error generating preview:', error);
            this.showError('Błąd generowania podglądu: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    async refreshPreview() {
        const iframe = document.getElementById('previewIframe');
        const previewLoading = document.getElementById('previewLoading');
        
        // Show loading
        previewLoading.style.display = 'block';
        
        try {
            // Get current template content
            const htmlContent = this.htmlEditor ? this.htmlEditor.getValue() : '';
            const cssContent = this.cssEditor ? this.cssEditor.getValue() : '';
            const jsContent = this.jsEditor ? this.jsEditor.getValue() : '';
            
            let processedHtml = htmlContent;
            
            // Render data based on preview type
            if (this.previewSettings.previewType === 'collection') {
                // Get sample collection data
                if (this.previewSettings.sampleCollection && this.collections.length > 0) {
                    const collection = this.collections.find(c => c.id === this.previewSettings.sampleCollection);
                    if (collection) {
                        // Get detailed collection data
                        const response = await fetch(`/api/template-editor/collections/${collection.id}/data`);
                        if (response.ok) {
                            const apiResponse = await response.json();
                            console.log('🔍 [PREVIEW] Before injectCollectionData, HTML length:', htmlContent.length);
                            processedHtml = this.injectCollectionData(htmlContent, apiResponse.data);
                            console.log('🔍 [PREVIEW] After injectCollectionData, HTML length:', processedHtml.length);
                            console.log('🔍 [PREVIEW] Processed HTML preview:', processedHtml.substring(0, 500));
                        }
                    }
                } else {
                    // Use sample collection data
                    const sampleData = this.getSampleCollectionData();
                    processedHtml = this.injectCollectionData(htmlContent, sampleData);
                }
            } else {
                // Wine preview type
                if (this.previewSettings.sampleWine && this.wines.length > 0) {
                    const wine = this.wines.find(w => w.catalogNumber === this.previewSettings.sampleWine);
                    if (wine) {
                        processedHtml = this.injectWineData(htmlContent, wine);
                    }
                } else if (this.wines.length > 0) {
                    // Use first wine as sample
                    processedHtml = this.injectWineData(htmlContent, this.wines[0]);
                }
            }
            
            // 🎨 Process component shortcodes AFTER data injection
            processedHtml = this.processShortcodes(processedHtml);
            
            // Get format dimensions for preview styling
            let formatCSS = '';
            const formatValue = this.previewSettings.format;
            
            if (formatValue && formatValue.startsWith('custom:')) {
                const customFormatId = formatValue.replace('custom:', '');
                const customFormat = this.customFormats.find(f => f.id === customFormatId);
                
                if (customFormat) {
                    // 🎯 CRITICAL: Set exact page dimensions for accurate preview
                    formatCSS = `
                        /* Exact page dimensions matching PDF output */
                        .page {
                            width: ${customFormat.width}${customFormat.unit} !important;
                            height: ${customFormat.height}${customFormat.unit} !important;
                            margin: 0 auto !important;
                            display: block !important;
                            box-sizing: border-box !important;
                            position: relative !important;
                            overflow: hidden !important;
                        }
                        
                        /* 🔥 CSS Columns Support - dla prawidłowego wyświetlania układów kolumnowych */
                        /* Zachowaj ustawienia columns z szablonu, dodaj tylko height dla prawidłowego działania */
                        .wine-page {
                            overflow: visible !important; /* Allow columns to flow */
                            /* 🔥 CRITICAL: Set concrete height for columns to work */
                            height: ${customFormat.height - 12}${customFormat.unit} !important; /* Page height minus padding */
                            max-height: ${customFormat.height - 12}${customFormat.unit} !important;
                            /* Reset padding - będzie zarządzany przez body */
                            padding-top: 0 !important;
                            padding-bottom: 0 !important;
                        }
                        
                        /* 🔥 CRITICAL: Body padding zapewnia padding na wszystkich stronach (także automatycznych) */
                        body {
                            padding-top: 6mm !important;
                            padding-bottom: 6mm !important;
                            box-sizing: border-box !important;
                        }
                        
                        /* Wspieraj elementy z atrybutem style zawierającym columns */
                        [style*="columns:"], 
                        [style*="column-count:"] {
                            column-fill: auto !important;
                            -webkit-column-fill: auto !important;
                            -moz-column-fill: auto !important;
                        }
                        
                        /* Zapobiegaj łamaniu elementów między kolumnami */
                        .wine-item, 
                        .product-item,
                        .wine-card-inner,
                        [class*="wine"],
                        [class*="product"] {
                            break-inside: avoid !important;
                            -webkit-column-break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }
                        
                        /* Custom link colors */
                        a, a:link, a:visited {
                            color: ${this.previewSettings.linkColor} !important;
                        }
                        
                        a:hover, a:active {
                            color: ${this.adjustColorBrightness(this.previewSettings.linkColor, -20)} !important;
                        }
                    `;
                }
            } else if (formatValue) {
                // Standard format dimensions
                const standardDimensions = this.getStandardFormatDimensions(formatValue);
                if (standardDimensions) {
                    formatCSS = `
                        /* Exact page dimensions matching PDF output */
                        .page {
                            width: ${standardDimensions.width}${standardDimensions.unit} !important;
                            height: ${standardDimensions.height}${standardDimensions.unit} !important;
                            margin: 0 auto !important;
                            display: block !important;
                            box-sizing: border-box !important;
                            position: relative !important;
                            overflow: hidden !important;
                        }
                        
                        /* 🔥 CSS Columns Support - dla prawidłowego wyświetlania układów kolumnowych */
                        /* Zachowaj ustawienia columns z szablonu, dodaj tylko height dla prawidłowego działania */
                        .wine-page {
                            overflow: visible !important; /* Allow columns to flow */
                            /* 🔥 CRITICAL: Set concrete height for columns to work */
                            height: ${standardDimensions.height - 12}${standardDimensions.unit} !important; /* Page height minus padding */
                            max-height: ${standardDimensions.height - 12}${standardDimensions.unit} !important;
                            /* Reset padding - będzie zarządzany przez body */
                            padding-top: 0 !important;
                            padding-bottom: 0 !important;
                        }
                        
                        /* 🔥 CRITICAL: Body padding zapewnia padding na wszystkich stronach (także automatycznych) */
                        body {
                            padding-top: 6mm !important;
                            padding-bottom: 6mm !important;
                            box-sizing: border-box !important;
                        }
                        
                        /* Wspieraj elementy z atrybutem style zawierającym columns */
                        [style*="columns:"], 
                        [style*="column-count:"] {
                            column-fill: auto !important;
                            -webkit-column-fill: auto !important;
                            -moz-column-fill: auto !important;
                        }
                        
                        /* Zapobiegaj łamaniu elementów między kolumnami */
                        .wine-item, 
                        .product-item,
                        .wine-card-inner,
                        [class*="wine"],
                        [class*="product"] {
                            break-inside: avoid !important;
                            -webkit-column-break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }
                        
                        /* Custom link colors */
                        a, a:link, a:visited {
                            color: ${this.previewSettings.linkColor} !important;
                        }
                        
                        a:hover, a:active {
                            color: ${this.adjustColorBrightness(this.previewSettings.linkColor, -20)} !important;
                        }
                    `;
                }
            }

            const previewHtml = `
                <!DOCTYPE html>
                <html lang="pl">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Preview</title>
                    <style>
                        /* Base reset */
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        /* PDF viewer background */
                        html {
                            background: #525252;
                            overflow: auto;
                        }
                        
                        body {
                            background: #525252;
                            padding: 20px;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            gap: 20px;
                            min-height: 100vh;
                            overflow-x: auto;
                            overflow-y: auto;
                        }
                        
                        /* Page container styling - każda strona jako oddzielna karta */
                        .page {
                            background: white;
                            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                            margin: 0 auto;
                            display: block;
                            position: relative;
                        }
                        
                        ${cssContent}
                        ${formatCSS}
                    </style>
                </head>
                <body>
                    ${processedHtml}
                    <script>${jsContent}</script>
                </body>
                </html>
            `;
            
            // Load preview
            iframe.onload = () => {
                previewLoading.style.display = 'none';
                
                // Re-apply zoom after iframe loads
                if (this.zoomLevel !== 1.0) {
                    setTimeout(() => {
                        this.updateZoom(this.zoomLevel);
                    }, 100);
                }
            };
            
            iframe.src = 'data:text/html;charset=utf-8,' + encodeURIComponent(previewHtml);
            
        } catch (error) {
            console.error('Error refreshing preview:', error);
            previewLoading.style.display = 'none';
        }
    }

    // 🔍 Zoom Controls
    
    /**
     * Update zoom level and apply transformation
     */
    updateZoom(newZoom, mode = 'manual') {
        // Clamp zoom level
        this.zoomLevel = Math.max(this.zoomMin, Math.min(this.zoomMax, newZoom));
        
        const wrapper = document.getElementById('previewZoomWrapper');
        const zoomLevelDisplay = document.getElementById('zoomLevel');
        
        if (!wrapper) return;
        
        // Apply zoom transformation
        if (mode === 'fit') {
            // Fit to window mode - center and scale
            wrapper.classList.add('zoom-fit');
            wrapper.style.transform = `scale(${this.zoomLevel})`;
        } else {
            // Manual zoom mode - scale from top
            wrapper.classList.remove('zoom-fit');
            wrapper.style.transform = `scale(${this.zoomLevel})`;
        }
        
        // Update zoom level display
        if (zoomLevelDisplay) {
            zoomLevelDisplay.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
        
        console.log(`🔍 Zoom updated: ${Math.round(this.zoomLevel * 100)}%`);
    }
    
    /**
     * Zoom in (increase zoom level)
     */
    zoomIn() {
        this.updateZoom(this.zoomLevel + this.zoomStep);
    }
    
    /**
     * Zoom out (decrease zoom level)
     */
    zoomOut() {
        this.updateZoom(this.zoomLevel - this.zoomStep);
    }
    
    /**
     * Reset zoom to 100%
     */
    zoomReset() {
        this.updateZoom(1.0);
    }
    
    /**
     * Fit preview to available space
     */
    zoomFit() {
        const previewBody = document.getElementById('previewBody');
        const iframe = document.getElementById('previewIframe');
        
        if (!previewBody || !iframe) return;
        
        try {
            // Get dimensions
            const containerWidth = previewBody.offsetWidth;
            const containerHeight = previewBody.offsetHeight;
            
            // Get iframe content dimensions if possible
            let contentWidth = containerWidth;
            let contentHeight = containerHeight;
            
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                if (iframeDoc && iframeDoc.body) {
                    contentWidth = iframeDoc.body.scrollWidth || containerWidth;
                    contentHeight = iframeDoc.body.scrollHeight || containerHeight;
                }
            } catch (e) {
                // Cross-origin iframe, use format dimensions
                const formatValue = this.previewSettings.format;
                if (formatValue && formatValue.startsWith('custom:')) {
                    const customFormatId = formatValue.replace('custom:', '');
                    const customFormat = this.customFormats.find(f => f.id === customFormatId);
                    if (customFormat) {
                        contentWidth = this.convertToPixels(customFormat.width, customFormat.unit);
                        contentHeight = this.convertToPixels(customFormat.height, customFormat.unit);
                    }
                } else if (formatValue) {
                    const dims = this.getStandardFormatDimensions(formatValue);
                    if (dims) {
                        contentWidth = dims.width;
                        contentHeight = dims.height;
                    }
                }
            }
            
            // Calculate scale to fit
            const scaleX = (containerWidth - 40) / contentWidth; // 40px padding
            const scaleY = (containerHeight - 40) / contentHeight;
            const scale = Math.min(scaleX, scaleY, 1.0); // Don't zoom in beyond 100%
            
            // Apply fit zoom
            this.updateZoom(scale, 'fit');
            
            console.log(`🔍 Zoom fit: ${Math.round(scale * 100)}% (container: ${containerWidth}x${containerHeight}, content: ${contentWidth}x${contentHeight})`);
            
        } catch (error) {
            console.error('Error calculating zoom fit:', error);
            // Fallback to smaller zoom
            this.updateZoom(0.5, 'fit');
        }
    }

    // 🎨 Shortcode Processing
    // Converts component shortcodes to HTML before preview/PDF generation
    processShortcodes(html, depth = 0) {
        // Protection against infinite recursion (max 5 levels for nested templates)
        if (depth > 5) {
            console.warn('🔍 [SHORTCODE DEBUG] Max recursion depth reached!');
            return html;
        }
        
        console.log(`🔍 [SHORTCODE DEBUG] Processing shortcodes (depth: ${depth})...`);
        console.log('🔍 [SHORTCODE DEBUG] Input HTML length:', html.length);
        
        let processed = html;
        let hadDynamicContainers = false;
        
        // Process TEXT components: [component type="text" ...]
        // Flexible regex - attributes can be in any order
        const textMatches = html.match(/\[component[^\]]*type="text"[^\]]*\]/g);
        if (textMatches) {
            console.log('🔍 [SHORTCODE DEBUG] Found TEXT shortcodes:', textMatches.length);
            textMatches.forEach(match => console.log('   -', match));
        }
        
        processed = processed.replace(
            /\[component[^\]]*type="text"[^\]]*\]/g,
            (match) => {
                console.log('🔍 [SHORTCODE DEBUG] Processing TEXT:', match);
                // Parse all attributes from the shortcode
                const attrs = {};
                const attrRegex = /(\w+)="([^"]*)"/g;
                let attrMatch;
                while ((attrMatch = attrRegex.exec(match)) !== null) {
                    attrs[attrMatch[1]] = attrMatch[2];
                }
                
                const id = attrs.id || 'text_' + Date.now();
                const value = attrs.value || '';
                const className = attrs.class || '';
                const tag = attrs.tag || 'span';
                const style = attrs.style || '';
                
                const cssClass = className ? ` class="${className}"` : '';
                const cssStyle = style ? ` style="${style}"` : '';
                const result = `<${tag} id="${id}"${cssClass}${cssStyle}>${value}</${tag}>`;
                console.log('   → Converted to:', result);
                return result;
            }
        );
        
        // Process IMAGE components: [component type="image" ...]
        const imageMatches = html.match(/\[component[^\]]*type="image"[^\]]*\]/g);
        if (imageMatches) {
            console.log('🔍 [SHORTCODE DEBUG] Found IMAGE shortcodes:', imageMatches.length);
        }
        
        processed = processed.replace(
            /\[component[^\]]*type="image"[^\]]*\]/g,
            (match) => {
                console.log('🔍 [SHORTCODE DEBUG] Processing IMAGE:', match);
                const attrs = {};
                const attrRegex = /(\w+)="([^"]*)"/g;
                let attrMatch;
                while ((attrMatch = attrRegex.exec(match)) !== null) {
                    attrs[attrMatch[1]] = attrMatch[2];
                }
                
                const id = attrs.id || 'img_' + Date.now();
                const src = attrs.src || '';
                const alt = attrs.alt || '';
                const width = attrs.width || '';
                const height = attrs.height || '';
                const objectFit = attrs.objectFit || '';
                const className = attrs.class || '';
                
                const cssClass = className ? ` class="${className}"` : '';
                const widthAttr = width ? ` width="${width}"` : '';
                const heightAttr = height ? ` height="${height}"` : '';
                const objectFitStyle = objectFit ? ` style="object-fit: ${objectFit}"` : '';
                
                const result = `<img id="${id}" src="${src}" alt="${alt}"${widthAttr}${heightAttr}${cssClass}${objectFitStyle}>`;
                console.log('   → Converted to:', result);
                return result;
            }
        );
        
        // Process CONTAINER components: [component type="container" ...]
        const containerMatches = html.match(/\[component[^\]]*type="container"[^\]]*\]/g);
        if (containerMatches) {
            console.log('🔍 [SHORTCODE DEBUG] Found CONTAINER shortcodes:', containerMatches.length);
        }
        
        processed = processed.replace(
            /\[component[^\]]*type="container"[^\]]*\]/g,
            (match) => {
                console.log('🔍 [SHORTCODE DEBUG] Processing CONTAINER:', match);
                const attrs = {};
                const attrRegex = /(\w+)="([^"]*)"/g;
                let attrMatch;
                while ((attrMatch = attrRegex.exec(match)) !== null) {
                    attrs[attrMatch[1]] = attrMatch[2];
                }
                
                const id = attrs.id || 'container_' + Date.now();
                const containerType = attrs.containerType || 'div';
                const className = attrs.class || '';
                
                // Build inline styles from attributes
                let inlineStyles = [];
                if (attrs.width) inlineStyles.push(`width: ${attrs.width}`);
                if (attrs.padding) inlineStyles.push(`padding: ${attrs.padding}`);
                if (attrs.background) inlineStyles.push(`background: ${attrs.background}`);
                if (attrs.border) inlineStyles.push(`border: ${attrs.border}`);
                if (attrs.style) inlineStyles.push(attrs.style);
                
                const cssClass = className ? ` class="${className}"` : '';
                const cssStyle = inlineStyles.length > 0 ? ` style="${inlineStyles.join('; ')}"` : '';
                
                const result = `<${containerType} id="${id}"${cssClass}${cssStyle}></${containerType}>`;
                console.log('   → Converted to:', result);
                return result;
            }
        );
        
        // Process TABLE components: [component type="table" ...]
        const tableMatches = html.match(/\[component[^\]]*type="table"[^\]]*\]/g);
        if (tableMatches) {
            console.log('🔍 [SHORTCODE DEBUG] Found TABLE shortcodes:', tableMatches.length);
        }
        
        processed = processed.replace(
            /\[component[^\]]*type="table"[^\]]*\]/g,
            (match) => {
                console.log('🔍 [SHORTCODE DEBUG] Processing TABLE:', match);
                const attrs = {};
                const attrRegex = /(\w+)="([^"]*)"/g;
                let attrMatch;
                while ((attrMatch = attrRegex.exec(match)) !== null) {
                    attrs[attrMatch[1]] = attrMatch[2];
                }
                
                const id = attrs.id || 'table_' + Date.now();
                const rows = parseInt(attrs.rows) || 3;
                const cols = parseInt(attrs.columns || attrs.cols) || 3; // Support both 'columns' and 'cols'
                const hasHeaders = attrs.headers === 'true';
                const className = attrs.class || '';
                
                const cssClass = className ? ` class="${className}"` : '';
                
                let tableHTML = `<table id="${id}"${cssClass}>`;
                
                if (hasHeaders) {
                    tableHTML += '<thead><tr>';
                    for (let c = 0; c < cols; c++) {
                        tableHTML += `<th>Nagłówek ${c + 1}</th>`;
                    }
                    tableHTML += '</tr></thead>';
                }
                
                tableHTML += '<tbody>';
                for (let r = 0; r < rows; r++) {
                    tableHTML += '<tr>';
                    for (let c = 0; c < cols; c++) {
                        tableHTML += `<td>Komórka ${r + 1},${c + 1}</td>`;
                    }
                    tableHTML += '</tr>';
                }
                tableHTML += '</tbody></table>';
                
                console.log('   → Converted to:', tableHTML.substring(0, 100) + '...');
                return tableHTML;
            }
        );
        
        // Process SVG ICON components: [component type="svg" ...]
        const svgMatches = html.match(/\[component[^\]]*type="svg"[^\]]*\]/g);
        if (svgMatches) {
            console.log('🔍 [SHORTCODE DEBUG] Found SVG shortcodes:', svgMatches.length);
        }
        
        processed = processed.replace(
            /\[component[^\]]*type="svg"[^\]]*\]/g,
            (match) => {
                console.log('🔍 [SHORTCODE DEBUG] Processing SVG:', match);
                const attrs = {};
                const attrRegex = /(\w+)="([^"]*)"/g;
                let attrMatch;
                while ((attrMatch = attrRegex.exec(match)) !== null) {
                    attrs[attrMatch[1]] = attrMatch[2];
                }
                
                const id = attrs.id || 'svg_' + Date.now();
                const iconType = attrs.iconType || 'wine';
                const size = attrs.size || '24';
                const color = attrs.color || '#000000';
                
                const svgIcons = {
                    wine: `<svg id="${id}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M6 3v6c0 2.97 2.16 5.43 5 5.91V19H8v2h8v-2h-3v-4.09c2.84-.48 5-2.94 5-5.91V3H6zm10 5H8V5h8v3z"/></svg>`,
                    grape: `<svg id="${id}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><circle cx="12" cy="10" r="3"/><circle cx="9" cy="15" r="2.5"/><circle cx="15" cy="15" r="2.5"/><circle cx="12" cy="19" r="2"/></svg>`,
                    bottle: `<svg id="${id}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M9 3v1H7v2h2v2.5c-1.1.3-2 1.2-2 2.5v9c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-9c0-1.3-.9-2.2-2-2.5V6h2V4h-2V3H9zm2 11v7h2v-7h-2z"/></svg>`,
                    award: `<svg id="${id}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/></svg>`,
                    star: `<svg id="${id}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}"><path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z"/></svg>`
                };
                
                const result = svgIcons[iconType] || svgIcons.wine;
                console.log('   → Converted to:', result.substring(0, 100) + '...');
                return result;
            }
        );
        
        // Process DYNAMIC CONTAINER components: [component type="dynamicContainer" ...]
        const dynamicMatches = html.match(/\[component[^\]]*type="dynamicContainer"[^\]]*\]/g);
        if (dynamicMatches) {
            console.log('🔍 [SHORTCODE DEBUG] Found DYNAMIC CONTAINER shortcodes:', dynamicMatches.length);
            hadDynamicContainers = true; // Mark that we found dynamic containers
        }
        
        processed = processed.replace(
            /\[component[^\]]*type="dynamicContainer"[^\]]*\]/g,
            (match) => {
                console.log('🔍 [SHORTCODE DEBUG] Processing DYNAMIC CONTAINER:', match);
                const attrs = {};
                const attrRegex = /(\w+)="([^"]*)"/g;
                let attrMatch;
                while ((attrMatch = attrRegex.exec(match)) !== null) {
                    attrs[attrMatch[1]] = attrMatch[2];
                }
                
                const id = attrs.id || 'dynamic_' + Date.now();
                const templateId = attrs.templateId || '';
                const wrapperTag = attrs.wrapperTag || 'div';
                const className = attrs.class || '';
                const style = attrs.style || '';
                
                if (!templateId) {
                    console.warn('🔍 [SHORTCODE DEBUG] Dynamic Container without templateId!');
                    return `<${wrapperTag} id="${id}" class="dynamic-container-error" style="color: red; border: 1px dashed red; padding: 10px;">
                        ⚠️ Dynamic Container: Brak templateId
                    </${wrapperTag}>`;
                }
                
                // Find template by ID
                const template = this.templates.find(t => t.id === templateId);
                
                if (!template) {
                    console.warn('🔍 [SHORTCODE DEBUG] Template not found:', templateId);
                    return `<${wrapperTag} id="${id}" class="dynamic-container-warning" style="color: orange; border: 1px dashed orange; padding: 10px;">
                        ⚠️ Dynamic Container: Szablon "${templateId}" nie został znaleziony
                    </${wrapperTag}>`;
                }
                
                console.log('🔍 [SHORTCODE DEBUG] Found template:', template.name);
                
                const cssClass = className ? ` class="${className}"` : '';
                const cssStyle = style ? ` style="${style}"` : '';
                
                // Embed template content inside wrapper
                const result = `<${wrapperTag} id="${id}"${cssClass}${cssStyle} data-dynamic-template="${templateId}">
                    <!-- Dynamic Template: ${template.name} -->
                    ${template.htmlContent || ''}
                </${wrapperTag}>`;
                
                console.log('   → Converted to:', result.substring(0, 150) + '...');
                return result;
            }
        );
        
        console.log('🔍 [SHORTCODE DEBUG] Processing complete. Output length:', processed.length);
        
        // 🔄 RECURSIVE PROCESSING: If we embedded dynamic containers, process again for nested shortcodes
        if (hadDynamicContainers && depth < 5) {
            console.log('🔍 [SHORTCODE DEBUG] Recursively processing embedded template shortcodes...');
            processed = this.processShortcodes(processed, depth + 1);
        }
        
        return processed;
    }

    // Data injection methods
    
    injectWineData(htmlContent, wineData) {
        let processedHTML = htmlContent;
        
        // Basic wine data replacements
        // Map placeholders to actual database field names
        const replacements = {
            '{{wine.name}}': wineData.name || '',
            '{{wine.catalogNumber}}': wineData.catalogNumber || '',
            '{{wine.description}}': wineData.description || '',
            '{{wine.type}}': wineData.type || '',
            '{{wine.category}}': wineData.category || '',
            '{{wine.variety}}': wineData.szczepy || '', 
            '{{wine.region}}': wineData.region || '',
            '{{wine.producer}}': wineData.producer || wineData.producent || '',
            '{{wine.vintage}}': wineData.vintage || wineData.rocznik || '',
            '{{wine.volume}}': wineData.volume || wineData.poj || '',
            '{{wine.price}}': wineData.price || wineData.cena || '',
            '{{wine.price1}}': wineData.price1 || '',
            '{{wine.price2}}': wineData.price2 || '',
            '{{wine.alcohol}}': wineData.alcohol || wineData.alkohol || '',
            '{{wine.image}}': wineData.image || ''
        };
        
        // Apply basic replacements
        for (const [placeholder, value] of Object.entries(replacements)) {
            processedHTML = processedHTML.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), value);
        }
        
        // Handle dynamic fields - catch any remaining {{wine.field}} patterns
        processedHTML = processedHTML.replace(/\{\{wine\.(\w+)\}\}/g, (match, field) => {
            // Try to get the value from wineData using the field name
            const value = wineData[field];
            if (value !== undefined && value !== null) {
                return value;
            }
            // If not found, return empty string
            console.warn(`Wine field not found: ${field}`);
            return '';
        });
        
        return processedHTML;
    }
    
    injectCollectionData(htmlContent, collectionData) {
        let processedHTML = htmlContent;
        
        try {
            console.log('🔍 [INJECT] collectionData keys:', Object.keys(collectionData));
            console.log('🔍 [INJECT] dynamicFields:', collectionData.dynamicFields);
            console.log('🔍 [INJECT] dynamicFieldsByName:', collectionData.dynamicFieldsByName);
            
            // Basic collection data replacements
            processedHTML = processedHTML.replace(/\{\{collection\.(\w+)\}\}/g, (match, field) => {
                const value = collectionData[field] || '';
                console.log(`🔍 [INJECT] {{collection.${field}}} → "${value}"`);
                return value;
            });

            // Handle collection.dynamicFields.xxx replacements (by field ID)
            processedHTML = processedHTML.replace(/\{\{collection\.dynamicFields\.([\w_]+)\}\}/g, (match, fieldId) => {
                const dynamicFields = collectionData.dynamicFields || {};
                const value = dynamicFields[fieldId] || '';
                console.log(`🔍 [INJECT] {{collection.dynamicFields.${fieldId}}} → "${value}"`);
                return value;
            });

            // Handle collection.dynamicFieldsByName.xxx replacements (by field name - RECOMMENDED)
            processedHTML = processedHTML.replace(/\{\{collection\.dynamicFieldsByName\.([\w_]+)\}\}/g, (match, fieldName) => {
                const dynamicFieldsByName = collectionData.dynamicFieldsByName || {};
                const value = dynamicFieldsByName[fieldName.toLowerCase()] || '';
                console.log(`🔍 [INJECT] {{collection.dynamicFieldsByName.${fieldName}}} → "${value}"`);
                return value;
            });

            // Handle wine list grouped by category: {{#each collection.winesByCategory}}
            // Helper function to find matching {{/each}} considering nested loops
            const findMatchingEach = (html, startTag) => {
                const startIndex = html.indexOf(startTag);
                if (startIndex === -1) return null;
                
                let depth = 1;
                let pos = startIndex + startTag.length;
                
                while (pos < html.length && depth > 0) {
                    const nextOpen = html.indexOf('{{#each', pos);
                    const nextClose = html.indexOf('{{/each}}', pos);
                    
                    if (nextClose === -1) break;
                    
                    if (nextOpen !== -1 && nextOpen < nextClose) {
                        depth++;
                        pos = nextOpen + 7; // length of '{{#each'
                    } else {
                        depth--;
                        if (depth === 0) {
                            return {
                                start: startIndex,
                                end: nextClose + 9, // length of '{{/each}}'
                                template: html.substring(startIndex + startTag.length, nextClose)
                            };
                        }
                        pos = nextClose + 9;
                    }
                }
                
                return null;
            };
            
            // Process collection.winesByCategory
            const categoryStartTag = '{{#each collection.winesByCategory}}';
            const categoryMatch = findMatchingEach(processedHTML, categoryStartTag);
            
            if (categoryMatch) {
                const template = categoryMatch.template;
                
                // 🔥 Check if template has .wine-page wrapper (same as backend)
                const hasWinePageDiv = processedHTML.includes('<div class="wine-page');
                console.log('🔍 [INJECT] Template has .wine-page wrapper:', hasWinePageDiv);
                
                const winesToUse = collectionData.winesList || collectionData.wines;
                
                if (!winesToUse || !Array.isArray(winesToUse)) {
                    console.warn('No wines found in collection for category grouping');
                    processedHTML = processedHTML.substring(0, categoryMatch.start) + '' + processedHTML.substring(categoryMatch.end);
                } else {
                    // Group wines by category
                    const winesByCategory = {};
                    winesToUse.forEach(wine => {
                        const category = wine.category || 'Inne';
                        if (!winesByCategory[category]) {
                            winesByCategory[category] = [];
                        }
                        winesByCategory[category].push(wine);
                    });

                // Generate HTML for each category
                const categoryHTML = Object.entries(winesByCategory).map(([category, wines]) => {
                    let catHTML = template;
                    
                    // Replace {{category}} with category name
                    catHTML = catHTML.replace(/\{\{category\}\}/g, category);
                    
                    // Replace {{categoryWineCount}} with wine count in category
                    catHTML = catHTML.replace(/\{\{categoryWineCount\}\}/g, wines.length);
                    
                    // Handle wine iteration inside category: {{#each wines}}
                    const winePattern = /\{\{#each wines\}\}([\s\S]*?)\{\{\/each\}\}/g;
                    catHTML = catHTML.replace(winePattern, (wineMatch, wineTemplate) => {
                        return wines.map(wine => {
                            let wineHTML = wineTemplate;
                            
                            // Replace {{wine.field}} with wine data
                            wineHTML = wineHTML.replace(/\{\{wine\.(\w+)\}\}/g, (fieldMatch, field) => {
                                return wine[field] || '';
                            });
                            
                            // Also support {{this.field}} for compatibility
                            wineHTML = wineHTML.replace(/\{\{this\.(\w+)\}\}/g, (fieldMatch, field) => {
                                return wine[field] || '';
                            });
                            
                            return wineHTML;
                        }).join('');
                    });
                    
                    // 🔥 CRITICAL: Don't wrap categories if template has .wine-page div
                    // The template already has column layout structure (same logic as backend)
                    if (hasWinePageDiv) {
                        // Template has .wine-page wrapper - just return category HTML without wrapping
                        return catHTML;
                    } else {
                        // No .wine-page wrapper - wrap each category in a page div (old behavior)
                        return `<div class="page products-page" style="page-break-after: always;">
        <div class="products-content">
${catHTML}
        </div>
    </div>`;
                    }
                }).join('');
                
                // Replace the entire {{#each collection.winesByCategory}}...{{/each}} block
                processedHTML = processedHTML.substring(0, categoryMatch.start) + categoryHTML + processedHTML.substring(categoryMatch.end);
                }
            }

            // Handle wine list iteration - support multiple patterns:
            // {{#each winesList}} or {{#each collection.wines}}
            const eachPatternsToCheck = [
                { pattern: /\{\{#each collection\.wines\}\}([\s\S]*?)\{\{\/each\}\}/g, name: 'collection.wines' },
                { pattern: /\{\{#each winesList\}\}([\s\S]*?)\{\{\/each\}\}/g, name: 'winesList' }
            ];

            eachPatternsToCheck.forEach(({ pattern, name }) => {
                processedHTML = processedHTML.replace(pattern, (match, template) => {
                    // Check both wines and winesList
                    const winesToUse = collectionData.winesList || collectionData.wines;
                    
                    if (!winesToUse || !Array.isArray(winesToUse)) {
                        console.warn(`No wines found in collection for pattern: ${name}`);
                        return '';
                    }

                    console.log(`Processing ${winesToUse.length} wines for pattern: ${name}`);

                    return winesToUse.map(wine => {
                        let wineHTML = template;
                        
                        // Replace {{this.field}} with wine data
                        wineHTML = wineHTML.replace(/\{\{this\.(\w+)\}\}/g, (wineMatch, field) => {
                            return wine[field] || '';
                        });
                        
                        // Replace {{wine.field}} with wine data (alternative syntax)
                        wineHTML = wineHTML.replace(/\{\{wine\.(\w+)\}\}/g, (wineMatch, field) => {
                            return wine[field] || '';
                        });
                        
                        return wineHTML;
                    }).join('');
                });
            });

            // Handle conditional blocks {{#if condition}}
            const ifPattern = /\{\{#if\s+(\w+(?:\.\w+)*)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g;
            processedHTML = processedHTML.replace(ifPattern, (match, condition, ifContent, elseContent = '') => {
                const value = this.getNestedValue(collectionData, condition);
                return value ? ifContent : elseContent;
            });

            // Add current date
            processedHTML = processedHTML.replace(/\{\{date\}\}/g, new Date().toLocaleDateString('pl-PL'));

            return processedHTML;
        } catch (error) {
            console.error('Error injecting collection data:', error);
            return htmlContent;
        }
    }
    
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    
    getSampleCollectionData() {
        const sampleWines = this.wines.slice(0, 3).map(wine => ({
            catalogNumber: wine.catalogNumber,
            nazwa: wine.nazwa,
            rocznik: wine.rocznik,
            szczepy: wine.szczepy,
            region: wine.region,
            producent: wine.producent,
            poj: wine.poj,
            cena: wine.cena
        }));
        
        return {
            _id: 'sample-collection-id',
            name: 'Przykładowa Kolekcja',
            description: 'To jest przykładowa kolekcja win do podglądu szablonu.',
            wines: sampleWines.length,
            winesList: sampleWines
        };
    }

    // Utility Methods

    onEditorChange() {
        if (!this.unsavedChanges) {
            this.unsavedChanges = true;
            this.updateEditorStatus('Niezapisane zmiany');
        }
        
        // Debounced preview refresh
        clearTimeout(this.previewRefreshTimeout);
        this.previewRefreshTimeout = setTimeout(() => {
            this.refreshPreview();
        }, 1000);
    }

    getCurrentEditor() {
        const activeTab = document.querySelector('.nav-link.active');
        if (activeTab.id === 'html-tab') return this.htmlEditor;
        if (activeTab.id === 'css-tab') return this.cssEditor;
        if (activeTab.id === 'js-tab') return this.jsEditor;
        return this.htmlEditor;
    }

    formatCode() {
        const editor = this.getCurrentEditor();
        // Basic formatting - in a real implementation, you might use a library like Prettier
        const content = editor.getValue();
        // Simple indentation fix
        const formatted = content.replace(/></g, '>\n<').replace(/^\s+/gm, '');
        editor.setValue(formatted);
    }

    toggleFullScreen() {
        const editorMain = document.querySelector('.editor-main');
        editorMain.classList.toggle('position-fixed');
        editorMain.classList.toggle('w-100');
        editorMain.classList.toggle('h-100');
        editorMain.style.zIndex = editorMain.classList.contains('position-fixed') ? '9999' : '';
        editorMain.style.top = editorMain.classList.contains('position-fixed') ? '0' : '';
        editorMain.style.left = editorMain.classList.contains('position-fixed') ? '0' : '';
        
        // Refresh editor
        setTimeout(() => {
            this.getCurrentEditor().refresh();
        }, 100);
    }

    exitFullScreen() {
        const editorMain = document.querySelector('.editor-main');
        editorMain.classList.remove('position-fixed', 'w-100', 'h-100');
        editorMain.style.zIndex = '';
        editorMain.style.top = '';
        editorMain.style.left = '';
        
        setTimeout(() => {
            this.getCurrentEditor().refresh();
        }, 100);
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.saveTemplate();
                    break;
                case 'n':
                    e.preventDefault();
                    this.showNewTemplateModal();
                    break;
            }
        }
        
        if (e.key === 'F11') {
            e.preventDefault();
            this.toggleFullScreen();
        }
    }

    // Modal Methods

    showNewTemplateModal() {
        const modal = new bootstrap.Modal(document.getElementById('newTemplateModal'));
        modal.show();
    }

    showPreviewOptionsModal() {
        // Update current values
        this.setElementValue('previewFormat', this.previewSettings.format);
        this.setElementValue('sampleWine', this.previewSettings.sampleWine || '');
        const bgCheckbox = document.getElementById('previewBackground');
        if (bgCheckbox) bgCheckbox.checked = this.previewSettings.printBackground;
        
        // Update color values
        this.setElementValue('previewBgColor', this.previewSettings.backgroundColor);
        this.setElementValue('previewBgColorHex', this.previewSettings.backgroundColor);
        this.setElementValue('previewLinkColor', this.previewSettings.linkColor);
        this.setElementValue('previewLinkColorHex', this.previewSettings.linkColor);
        
        const modal = new bootstrap.Modal(document.getElementById('previewOptionsModal'));
        modal.show();
    }

    applyPreviewOptions() {
        this.previewSettings.format = this.getElementValue('previewFormat', 'a4');
        this.previewSettings.previewType = this.getElementValue('previewType', 'wine');
        this.previewSettings.sampleWine = this.getElementValue('sampleWine') || null;
        this.previewSettings.sampleCollection = this.getElementValue('sampleCollection') || null;
        const bgCheckbox = document.getElementById('previewBackground');
        if (bgCheckbox) this.previewSettings.printBackground = bgCheckbox.checked;
        
        // Save color settings
        this.previewSettings.backgroundColor = this.getElementValue('previewBgColor', '#f5f5f5');
        this.previewSettings.linkColor = this.getElementValue('previewLinkColor', '#0d6efd');
        
        this.closeModal('previewOptionsModal');
        
        this.refreshPreview();
    }
    
    resetPreviewColors() {
        // Reset to default colors
        this.previewSettings.backgroundColor = '#f5f5f5';
        this.previewSettings.linkColor = '#0d6efd';
        
        this.setElementValue('previewBgColor', '#f5f5f5');
        this.setElementValue('previewBgColorHex', '#f5f5f5');
        this.setElementValue('previewLinkColor', '#0d6efd');
        this.setElementValue('previewLinkColorHex', '#0d6efd');
        
        // Show feedback
        const btn = document.getElementById('resetColorsBtn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="bi bi-check-lg"></i> Zresetowano!';
        btn.classList.add('btn-success');
        btn.classList.remove('btn-outline-secondary');
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('btn-success');
            btn.classList.add('btn-outline-secondary');
        }, 2000);
    }

    // Filter and Search Methods

    filterTemplates(searchTerm) {
        const cards = document.querySelectorAll('.template-card');
        const term = searchTerm.toLowerCase();
        
        cards.forEach(card => {
            const name = card.querySelector('h6').textContent.toLowerCase();
            const description = card.querySelector('small')?.textContent.toLowerCase() || '';
            const matches = name.includes(term) || description.includes(term);
            card.style.display = matches ? 'block' : 'none';
        });
    }

    filterByCategory(categoryId) {
        if (!categoryId) {
            this.loadTemplates();
            return;
        }
        
        const filteredTemplates = this.templates.filter(t => t.category === categoryId);
        this.templates = filteredTemplates;
        this.updateTemplatesList();
    }

    clearSearch() {
        this.setElementValue('templateSearch', '');
        this.setElementValue('categoryFilter', '');
        this.loadTemplates();
    }

    // Default Templates

    getDefaultHtmlTemplate() {
        return `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{wine.name}}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .wine-card {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            max-width: 600px;
            margin: 0 auto;
        }
        .wine-title {
            color: #8B0000;
            font-size: 2rem;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
        }
        .wine-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 20px 0;
        }
        .wine-field {
            padding: 10px;
            background: #f8f9fa;
            border-radius: 5px;
        }
        .field-label {
            font-weight: bold;
            color: #495057;
            margin-bottom: 5px;
        }
        .field-value {
            color: #212529;
            font-size: 1.1rem;
        }
    </style>
</head>
<body>
    <div class="wine-card">
        <h1 class="wine-title">{{wine.name}}</h1>
        
        <div class="wine-info">
            <div class="wine-field">
                <div class="field-label">Nr katalogowy:</div>
                <div class="field-value">{{wine.catalogNumber}}</div>
            </div>
            
            <div class="wine-field">
                <div class="field-label">Typ:</div>
                <div class="field-value">{{wine.type}}</div>
            </div>
            
            <div class="wine-field">
                <div class="field-label">Kategoria:</div>
                <div class="field-value">{{wine.category}}</div>
            </div>
            
            <div class="wine-field">
                <div class="field-label">Region:</div>
                <div class="field-value">{{wine.region}}</div>
            </div>
            
            <div class="wine-field">
                <div class="field-label">Szczep:</div>
                <div class="field-value">{{wine.szczepy}}</div>
            </div>
            
            <div class="wine-field">
                <div class="field-label">Alkohol:</div>
                <div class="field-value">{{wine.alcohol}}</div>
            </div>
        </div>
        
        <div class="wine-field">
            <div class="field-label">Opis:</div>
            <div class="field-value">{{wine.description}}</div>
        </div>
    </div>
</body>
</html>`;
    }

    getDefaultCssTemplate() {
        return `/* Dodatkowe style CSS */
.wine-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0,0,0,0.15);
    transition: all 0.3s ease;
}

@media print {
    body {
        background: white;
    }
    
    .wine-card {
        box-shadow: none;
        border: 1px solid #ddd;
    }
}`;
    }

    loadDefaultTemplate() {
        // Load first template or create empty one
        if (this.templates.length > 0) {
            this.loadTemplate(this.templates[0].id);
        }
    }

    showEmptyState() {
        this.htmlEditor.setValue(this.getDefaultHtmlTemplate());
        this.cssEditor.setValue(this.getDefaultCssTemplate());
        this.jsEditor.setValue('// JavaScript code here');
        this.refreshPreview();
    }

    // UI Helper Methods

    updateEditorStatus(status) {
        const statusElement = document.getElementById('editorStatus');
        if (statusElement) {
            statusElement.textContent = status;
        }
    }

    showLoading(message) {
        this.updateEditorStatus(message);
    }

    hideLoading() {
        this.updateEditorStatus(this.currentTemplate ? 'Szablon załadowany' : 'Gotowy');
    }

    showError(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-danger border-0 position-fixed top-0 end-0 m-3';
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            // Check if toast is still in the DOM before removing
            if (toast.parentNode === document.body) {
                document.body.removeChild(toast);
            }
        });
    }

    showSuccess(message) {
        // Create success toast
        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed top-0 end-0 m-3';
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        toast.addEventListener('hidden.bs.toast', () => {
            // Check if toast is still in the DOM before removing
            if (toast.parentNode === document.body) {
                document.body.removeChild(toast);
            }
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    convertToPixels(value, unit) {
        // Convert various units to pixels for CSS
        // Approximation: 1mm ≈ 3.78px, 1cm ≈ 37.8px, 1in ≈ 96px
        switch (unit.toLowerCase()) {
            case 'mm': return value * 3.78;
            case 'cm': return value * 37.8;
            case 'in': return value * 96;
            case 'px': return value;
            default: return value * 3.78; // Default to mm
        }
    }
    
    getStandardFormatDimensions(format) {
        // Standard paper sizes in pixels (approximate)
        const formats = {
            'A4': { width: 794, height: 1123 }, // 210×297mm
            'A5': { width: 559, height: 794 },  // 148×210mm  
            'Letter': { width: 816, height: 1056 } // 8.5×11in
        };
        return formats[format] || null;
    }
    
    adjustColorBrightness(hexColor, percent) {
        // Adjust brightness of hex color by percentage
        // Negative percent = darker, positive = lighter
        const num = parseInt(hexColor.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, Math.min(255, (num >> 16) + amt));
        const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
        const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
        return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
    }

    getStatusBadgeClass(status) {
        switch (status) {
            case 'active': return 'bg-success';
            case 'draft': return 'bg-warning';
            case 'archived': return 'bg-secondary';
            default: return 'bg-light';
        }
    }

    getStatusLabel(status) {
        switch (status) {
            case 'active': return 'Aktywny';
            case 'draft': return 'Szkic';
            case 'archived': return 'Archiwum';
            default: return status;
        }
    }

    getCategoryName(categoryId) {
        const category = this.categories.find(c => c.id === categoryId);
        return category ? category.name : categoryId;
    }

    async editTemplateMetadata(templateId) {
        // Load template if not already loaded
        if (!this.currentTemplate || this.currentTemplate.id !== templateId) {
            await this.loadTemplate(templateId);
        }
        
        // Show edit modal
        this.showEditTemplateModal();
    }

    showEditTemplateModal() {
        if (!this.currentTemplate) {
            this.showError('Brak wybranego szablonu do edycji');
            return;
        }

        // Populate form with current template data
        this.setElementValue('editTemplateName', this.currentTemplate.name || '');
        this.setElementValue('editTemplateDescription', this.currentTemplate.description || '');
        this.setElementValue('editTemplateCategory', this.currentTemplate.category || 'general');
        this.setElementValue('editTemplateStatus', this.currentTemplate.status || 'draft');

        // Populate PDF settings
        const pdfSettings = this.currentTemplate.pdfSettings || {};
        
        // Check if customFormat exists
        if (pdfSettings.customFormat) {
            this.setElementValue('editTemplatePdfFormat', 'custom');
            this.setElementValue('editTemplateCustomWidth', pdfSettings.customFormat.width || '');
            this.setElementValue('editTemplateCustomHeight', pdfSettings.customFormat.height || '');
            this.setElementValue('editTemplateCustomUnit', pdfSettings.customFormat.unit || 'mm');
            this.toggleCustomFormatFields(true);
        } else {
            this.setElementValue('editTemplatePdfFormat', pdfSettings.format || '');
            this.toggleCustomFormatFields(false);
        }
        
        this.setElementValue('editTemplatePdfOrientation', pdfSettings.orientation || '');
        
        // Populate margins if they exist
        if (pdfSettings.margins) {
            this.setElementValue('editTemplateMarginTop', pdfSettings.margins.top || '');
            this.setElementValue('editTemplateMarginRight', pdfSettings.margins.right || '');
            this.setElementValue('editTemplateMarginBottom', pdfSettings.margins.bottom || '');
            this.setElementValue('editTemplateMarginLeft', pdfSettings.margins.left || '');
        } else {
            this.setElementValue('editTemplateMarginTop', '');
            this.setElementValue('editTemplateMarginRight', '');
            this.setElementValue('editTemplateMarginBottom', '');
            this.setElementValue('editTemplateMarginLeft', '');
        }
        
        // Set printBackground checkbox (default to true if not specified)
        const printBgCheckbox = document.getElementById('editTemplatePrintBackground');
        if (printBgCheckbox) {
            printBgCheckbox.checked = pdfSettings.printBackground !== undefined ? pdfSettings.printBackground : true;
        }
        
        // Setup format change listener
        this.setupPdfFormatListener();

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('editTemplateModal'));
        modal.show();
    }

    async saveTemplateMetadata() {
        if (!this.currentTemplate) {
            this.showError('Brak wybranego szablonu');
            return;
        }

        try {
            const name = this.getElementValue('editTemplateName').trim();
            if (!name) {
                this.showError('Nazwa szablonu jest wymagana');
                return;
            }

            // Build PDF settings object
            const pdfSettings = {};
            
            // Format
            const format = this.getElementValue('editTemplatePdfFormat');
            if (format) {
                if (format === 'custom') {
                    // Custom format - collect width, height, unit
                    const width = this.getElementValue('editTemplateCustomWidth').trim();
                    const height = this.getElementValue('editTemplateCustomHeight').trim();
                    const unit = this.getElementValue('editTemplateCustomUnit') || 'mm';
                    
                    if (!width || !height) {
                        this.showError('Dla niestandardowego formatu wymagana jest szerokość i wysokość');
                        return;
                    }
                    
                    // Validate that width and height are numbers
                    if (isNaN(parseFloat(width)) || isNaN(parseFloat(height))) {
                        this.showError('Szerokość i wysokość muszą być liczbami');
                        return;
                    }
                    
                    pdfSettings.customFormat = {
                        width: parseFloat(width),
                        height: parseFloat(height),
                        unit: unit
                    };
                } else {
                    pdfSettings.format = format;
                }
            }
            
            // Orientation
            const orientation = this.getElementValue('editTemplatePdfOrientation');
            if (orientation) pdfSettings.orientation = orientation;
            
            // Margins - only include if at least one margin is specified
            const marginTop = this.getElementValue('editTemplateMarginTop').trim();
            const marginRight = this.getElementValue('editTemplateMarginRight').trim();
            const marginBottom = this.getElementValue('editTemplateMarginBottom').trim();
            const marginLeft = this.getElementValue('editTemplateMarginLeft').trim();
            
            if (marginTop || marginRight || marginBottom || marginLeft) {
                pdfSettings.margins = {};
                if (marginTop) pdfSettings.margins.top = marginTop;
                if (marginRight) pdfSettings.margins.right = marginRight;
                if (marginBottom) pdfSettings.margins.bottom = marginBottom;
                if (marginLeft) pdfSettings.margins.left = marginLeft;
            }
            
            // Print background
            const printBgCheckbox = document.getElementById('editTemplatePrintBackground');
            if (printBgCheckbox) {
                pdfSettings.printBackground = printBgCheckbox.checked;
            }

            const templateData = {
                name: name,
                description: this.getElementValue('editTemplateDescription').trim(),
                category: this.getElementValue('editTemplateCategory'),
                status: this.getElementValue('editTemplateStatus'),
                // Keep existing content
                htmlContent: this.currentTemplate.htmlContent,
                cssContent: this.currentTemplate.cssContent,
                jsContent: this.currentTemplate.jsContent,
                // Add PDF settings (only if not empty)
                ...(Object.keys(pdfSettings).length > 0 && { pdfSettings })
            };

            const response = await api.updateTemplateEditorTemplate(this.currentTemplate.id, templateData);

            if (response.success) {
                this.currentTemplate = response.data;
                this.updateUIForCurrentTemplate();
                this.closeModal('editTemplateModal');
                this.showSuccess('Metadane szablonu zaktualizowane');
                
                // Refresh templates list
                await this.loadTemplates();
            } else {
                throw new Error(response.error || 'Nie udało się zaktualizować szablonu');
            }
        } catch (error) {
            console.error('Error updating template metadata:', error);
            this.showError('Błąd aktualizacji metadanych: ' + error.message);
        }
    }

    setupPdfFormatListener() {
        const formatSelect = document.getElementById('editTemplatePdfFormat');
        if (formatSelect) {
            formatSelect.addEventListener('change', (e) => {
                this.toggleCustomFormatFields(e.target.value === 'custom');
            });
        }
    }

    toggleCustomFormatFields(show) {
        const customFields = document.getElementById('customFormatFields');
        if (customFields) {
            customFields.style.display = show ? 'block' : 'none';
        }
    }

    confirmDeleteTemplate(templateId, templateName) {
        if (confirm(`Czy na pewno chcesz usunąć szablon "${templateName}"?\n\nTej operacji nie można cofnąć.`)) {
            this.deleteTemplate(templateId);
        }
    }

    async deleteTemplate(templateId) {
        try {
            const response = await api.deleteTemplateEditorTemplate(templateId);
            
            if (response.success) {
                this.showSuccess(`Szablon został usunięty`);
                
                // Clear editor if deleted template was currently loaded
                if (this.currentTemplate && this.currentTemplate.id === templateId) {
                    this.currentTemplate = null;
                    this.clearEditors();
                }
                
                // Reload templates list
                await this.loadTemplates();
            } else {
                throw new Error(response.error || 'Nie udało się usunąć szablonu');
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            this.showError('Błąd podczas usuwania szablonu: ' + error.message);
        }
    }

    clearEditors() {
        // Clear all editor content
        if (this.htmlEditor) this.htmlEditor.setValue('');
        if (this.cssEditor) this.cssEditor.setValue('');
        if (this.jsEditor) this.jsEditor.setValue('');
        
        // Clear template info fields (if they exist in a form)
        const templateNameInput = document.getElementById('templateName');
        const templateDescInput = document.getElementById('templateDescription');
        const categorySelect = document.getElementById('templateCategory');
        const statusSelect = document.getElementById('templateStatus');
        
        if (templateNameInput) templateNameInput.value = '';
        if (templateDescInput) templateDescInput.value = '';
        if (categorySelect) categorySelect.value = '';
        if (statusSelect) statusSelect.value = 'draft';
    }
}

// Initialize Template Editor when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Template Editor...');
    window.templateEditor = new TemplateEditor();
    
    // Initialize Custom Formats Manager
    console.log('CustomFormatsManager type:', typeof CustomFormatsManager);
    if (typeof CustomFormatsManager !== 'undefined') {
        console.log('Creating CustomFormatsManager instance...');
        window.customFormatsManager = new CustomFormatsManager();
        window.customFormatsManager.init();
    } else {
        console.error('CustomFormatsManager class not found!');
    }
});