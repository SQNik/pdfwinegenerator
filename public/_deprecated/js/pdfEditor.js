// PDF Template Editor Component with Drag & Drop functionality
class PDFTemplateEditor {
    constructor() {
        console.log('PDFTemplateEditor: Constructor called');
        this.template = null;
        this.selectedElement = null;
        this.currentSection = 'front';
        this.draggedElement = null;
        this.isEditing = false;
        this.zoom = 1;
        this.grid = { x: 10, y: 10 };
        this.showGrid = true;
        this.showPrintGuides = true; // Initialize print guides visibility
        this.dynamicFields = []; // Initialize dynamic fields array
        
        // Initialize Content Section Manager (odizolowana sekcja zawartoĹ›ci)
        this.contentManager = null;
        
        // History management for Undo/Redo functionality
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        this.init();
    }

    /**
     * Initialize PDF template editor
     */
    async init() {
        console.log('PDFTemplateEditor: Init called');
        this.bindEvents();
        await this.loadCollections();  // Ĺadujemy kolekcje
        await this.loadTemplate();     // Najpierw Ĺ‚adujemy szablon
        await this.loadDynamicFields(); // Ĺadujemy pola dynamiczne
        this.initializeCanvas();       // Potem inicjalizujemy kanwÄ™
        this.renderCanvas();
        
        // Product template system removed
        
        // Initialize Content Section Manager (nowa czysta sekcja zawartoĹ›ci)
        await this.initContentManager();
        
        console.log('PDFTemplateEditor: Init completed');
    }

    /**
     * Load dynamic fields configuration for data binding
     */
    async loadDynamicFields() {
        try {
            console.log('PDFTemplateEditor: Loading dynamic fields for data binding');
            const response = await fetch('/api/fields/config');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.success && data.data) {
                this.dynamicFields = data.data;
                this.populateDataBindingOptions();
                console.log('PDFTemplateEditor: Dynamic fields loaded:', this.dynamicFields.length, 'fields');
            } else {
                console.error('PDFTemplateEditor: Failed to load dynamic fields:', data.error);
                this.dynamicFields = [];
            }
        } catch (error) {
            console.error('PDFTemplateEditor: Error loading dynamic fields:', error);
            this.dynamicFields = [];
        }
    }

    /**
     * Populate data binding select options with dynamic fields
     */
    async populateDataBindingOptions() {
        console.log('PDFTemplateEditor: Populating data binding options');
        
        // If dynamic fields not loaded, load them first
        if (!this.dynamicFields || this.dynamicFields.length === 0) {
            console.log('PDFTemplateEditor: Dynamic fields not loaded yet, loading...');
            await this.loadDynamicFields();
            return; // loadDynamicFields will call populateDataBindingOptions again
        }
        
        // Populate text data binding options
        const textDataBindingSelect = document.getElementById('text-data-binding');
        if (textDataBindingSelect) {
            // Clear existing options except "Brak"
            textDataBindingSelect.innerHTML = '<option value="">Brak</option>';
            
            // Add dynamic fields as options (exclude image field)
            this.dynamicFields.forEach(field => {
                // Skip image field for text binding (check by key, not type)
                if (field.key !== 'image') {
                    const option = document.createElement('option');
                    option.value = field.key;
                    option.textContent = field.label;
                    textDataBindingSelect.appendChild(option);
                }
            });
            
            console.log('PDFTemplateEditor: Text data binding options populated with', this.dynamicFields.filter(f => f.key !== 'image').length, 'fields');
        }
        
        // Populate image data binding options
        const imageDataBindingSelect = document.getElementById('image-data-binding');
        if (imageDataBindingSelect) {
            // Clear existing options except "Brak"
            imageDataBindingSelect.innerHTML = '<option value="">Brak</option>';
            
            // Add image field as option (check by key)
            this.dynamicFields.forEach(field => {
                if (field.key === 'image') {
                    const option = document.createElement('option');
                    option.value = field.key;
                    option.textContent = field.label;
                    imageDataBindingSelect.appendChild(option);
                }
            });
            
            console.log('PDFTemplateEditor: Image data binding options populated with', this.dynamicFields.filter(f => f.key === 'image').length, 'fields');
        }
    }

    /**
     * Initialize Content Section Manager (nowa odizolowana sekcja zawartoĹ›ci)
     */
    async initContentManager() {
        try {
            console.log('PDFTemplateEditor: Initializing Content Section Manager...');
            
            // SprawdĹş czy klasa ContentSectionManager jest dostÄ™pna
            if (typeof ContentSectionManager === 'undefined') {
                console.error('PDFTemplateEditor: ContentSectionManager class not found');
                return;
            }
            
            // UtwĂłrz instancjÄ™ menedĹĽera sekcji zawartoĹ›ci
            this.contentManager = new ContentSectionManager(this);
            
            // Inicjalizuj menedĹĽer
            await this.contentManager.init();
            
            console.log('PDFTemplateEditor: Content Section Manager initialized successfully');
        } catch (error) {
            console.error('PDFTemplateEditor: Error initializing Content Section Manager:', error);
            this.contentManager = null;
        }
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        console.log('=== BINDING EVENTS ===');
        console.log('Checking content settings elements...');
        console.log('content-display-mode:', document.getElementById('content-display-mode'));
        console.log('content-columns-count:', document.getElementById('content-columns-count'));
        console.log('content-products-per-page:', document.getElementById('content-products-per-page'));
        
        // Section tabs
        document.querySelectorAll('.section-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Find the closest section-tab element to handle clicks on child elements
                const sectionTab = e.target.closest('.section-tab');
                if (sectionTab && sectionTab.dataset.section) {
                    this.switchSection(sectionTab.dataset.section);
                }
            });
        });

        // Element library
        document.querySelectorAll('.element-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                this.handleElementDragStart(e);
            });
        });

        // Canvas events
        const canvas = document.getElementById('design-canvas');
        if (canvas) {
            canvas.addEventListener('dragover', (e) => e.preventDefault());
            canvas.addEventListener('drop', (e) => this.handleCanvasDrop(e));
            canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
            canvas.addEventListener('contextmenu', (e) => this.handleCanvasRightClick(e));
        }

        // Toolbar events
        document.getElementById('save-template')?.addEventListener('click', () => {
            this.saveTemplate();
        });

        document.getElementById('preview-pdf')?.addEventListener('click', () => {
            this.previewPDF();
        });

        document.getElementById('zoom-in')?.addEventListener('click', () => {
            this.changeZoom(1.2);
        });

        document.getElementById('zoom-out')?.addEventListener('click', () => {
            this.changeZoom(0.8);
        });

        document.getElementById('zoom-fit')?.addEventListener('click', () => {
            this.fitToScreen();
        });

        document.getElementById('toggle-grid')?.addEventListener('click', () => {
            this.toggleGrid();
        });

        // Toggle print guides
        document.getElementById('toggle-guides')?.addEventListener('click', () => {
            this.togglePrintGuides();
        });

        // Undo/Redo buttons
        document.getElementById('undo-btn')?.addEventListener('click', () => {
            this.undo();
        });

        document.getElementById('redo-btn')?.addEventListener('click', () => {
            this.redo();
        });

        // Section settings events
        this.bindSectionSettingsEvents();



        // Product template designer buttons removed

        // All Product template event listeners removed

        // Properties panel events
        this.bindPropertyEvents();

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * Initialize canvas for design
     */
    initializeCanvas() {
        const canvas = document.getElementById('design-canvas');
        if (!canvas) return;

        // Set canvas size based on template format
        this.updateCanvasSize();
        
        // Make canvas container scrollable
        const container = canvas.parentElement;
        container.style.overflow = 'auto';
        container.style.position = 'relative';
    }

    /**
     * Load collections for product list element
     */
    async loadCollections() {
        try {
            const response = await api.get('/collections');
            if (response.success) {
                this.collections = response.data || [];
                this.collectionOptions = this.collections.map(collection => 
                    `<option value="${collection.id}">${collection.name}</option>`
                ).join('');
                console.log('PDFEditor: Collections loaded:', this.collections.length);
            } else {
                console.error('Error loading collections:', response.error);
                this.collections = [];
                this.collectionOptions = '';
            }
        } catch (error) {
            console.error('Error loading collections:', error);
            this.collections = [];
            this.collectionOptions = '';
        }
    }

    /**
     * Convert pixels to percentage based on canvas size
     */
    pixelsToPercent(pixels, dimension) {
        const canvas = document.getElementById('design-canvas');
        if (!canvas) return 0;
        
        const canvasSize = dimension === 'width' 
            ? parseFloat(canvas.getAttribute('data-width')) || canvas.offsetWidth
            : parseFloat(canvas.getAttribute('data-height')) || canvas.offsetHeight;
            
        return Math.round((pixels / canvasSize) * 1000) / 10; // Round to 1 decimal
    }

    /**
     * Convert percentage to pixels based on canvas size
     */
    percentToPixels(percent, dimension) {
        const canvas = document.getElementById('design-canvas');
        if (!canvas) return 0;
        
        const canvasSize = dimension === 'width' 
            ? parseFloat(canvas.getAttribute('data-width')) || canvas.offsetWidth
            : parseFloat(canvas.getAttribute('data-height')) || canvas.offsetHeight;
            
        return Math.round((percent / 100) * canvasSize);
    }

    /**
     * Convert pixels to millimeters based on DPI
     */
    pixelsToMm(pixels) {
        const dpi = this.template?.printSettings?.dpi || 300;
        const mmPerInch = 25.4;
        return Math.round((pixels / dpi * mmPerInch) * 10) / 10; // Round to 1 decimal
    }

    /**
     * Convert millimeters to pixels based on DPI
     */
    mmToPixels(mm) {
        const dpi = this.template?.printSettings?.dpi || 300;
        const mmPerInch = 25.4;
        return Math.round((mm / mmPerInch) * dpi);
    }

    /**
     * Get effective width/height based on current unit
     */
    getEffectiveSize(element, dimension) {
        if (element.sizeUnit === '%') {
            const percentProp = dimension === 'width' ? 'widthPercent' : 'heightPercent';
            return this.percentToPixels(element[percentProp] || 0, dimension);
        } else if (element.sizeUnit === 'mm') {
            const mmProp = dimension === 'width' ? 'widthMm' : 'heightMm';
            return this.mmToPixels(element[mmProp] || 0);
        } else {
            return element[dimension] || 0;
        }
    }

    /**
     * Update element size values when switching units
     */
    updateElementSizeValues(element, newUnit) {
        if (element.sizeUnit === newUnit) return;
        
        const currentUnit = element.sizeUnit || 'px';
        
        if (newUnit === 'mm') {
            // Converting from px or % to mm
            if (currentUnit === '%') {
                // First convert % to px, then px to mm
                const widthPx = this.percentToPixels(element.widthPercent || 0, 'width');
                const heightPx = this.percentToPixels(element.heightPercent || 0, 'height');
                element.widthMm = this.pixelsToMm(widthPx);
                element.heightMm = this.pixelsToMm(heightPx);
            } else {
                // Converting from px to mm
                element.widthMm = this.pixelsToMm(element.width);
                element.heightMm = this.pixelsToMm(element.height);
            }
        } else if (newUnit === '%') {
            // Converting from px or mm to %
            if (currentUnit === 'mm') {
                // First convert mm to px, then px to %
                const widthPx = this.mmToPixels(element.widthMm || 0);
                const heightPx = this.mmToPixels(element.heightMm || 0);
                element.widthPercent = this.pixelsToPercent(widthPx, 'width');
                element.heightPercent = this.pixelsToPercent(heightPx, 'height');
            } else {
                // Converting from px to %
                element.widthPercent = this.pixelsToPercent(element.width, 'width');
                element.heightPercent = this.pixelsToPercent(element.height, 'height');
            }
        } else {
            // Converting to px
            if (currentUnit === '%') {
                // Converting from % to px
                element.width = this.percentToPixels(element.widthPercent || 0, 'width');
                element.height = this.percentToPixels(element.heightPercent || 0, 'height');
            } else if (currentUnit === 'mm') {
                // Converting from mm to px
                element.width = this.mmToPixels(element.widthMm || 0);
                element.height = this.mmToPixels(element.heightMm || 0);
            }
        }
        
        element.sizeUnit = newUnit;
    }

    /**
     * Normalize element properties - add missing default values
     */
    normalizeElement(element) {
        // Add size unit if missing
        if (!element.sizeUnit) {
            element.sizeUnit = 'px';
        }
        
        // Add percentage values if missing
        if (element.widthPercent === undefined) {
            element.widthPercent = this.pixelsToPercent(element.width || 100, 'width');
        }
        if (element.heightPercent === undefined) {
            element.heightPercent = this.pixelsToPercent(element.height || 50, 'height');
        }
        
        return element;
    }

    /**
     * Load template from URL parameter or create new
     */
    async loadTemplate() {
        console.log('PDFEditor: loadTemplate called');
        const urlParams = new URLSearchParams(window.location.search);
        const templateId = urlParams.get('id');
        console.log('PDFEditor: templateId from URL:', templateId);

        if (templateId) {
            try {
                console.log('PDFEditor: Attempting to load template:', templateId);
                const response = await api.get(`/pdf/templates/${templateId}`);
                console.log('PDFEditor: API response:', response);
                if (response.success) {
                    this.template = response.data;
                    this.isEditing = true; // Mark as editing existing template
                    
                    // Normalize all elements to ensure they have percentage properties
                    Object.keys(this.template.sections).forEach(sectionName => {
                        if (this.template.sections[sectionName].elements) {
                            this.template.sections[sectionName].elements = 
                                this.template.sections[sectionName].elements.map(element => 
                                    this.normalizeElement(element)
                                );
                        }
                    });
                    
                    console.log('PDFEditor: Template loaded:', this.template);
                    console.log('PDFEditor: isEditing set to:', this.isEditing);
                    this.updateUIFromTemplate();
                    this.updateSectionSettingsPanel();
                    
                    // Initialize history with current state
                    this.clearHistory();
                    this.saveToHistory('wczytanie szablonu');
                } else {
                    throw new Error(response.error);
                }
            } catch (error) {
                console.error('Error loading template:', error);
                this.showAlert('BĹ‚Ä…d podczas Ĺ‚adowania szablonu: ' + error.message, 'danger');
                this.createNewTemplate();
            }
        } else {
            console.log('PDFEditor: No templateId provided, creating new template');
            this.createNewTemplate();
        }
    }

    /**
     * Create new template with defaults
     */
    createNewTemplate() {
        console.log('PDFEditor: Creating new template');
        console.trace('PDFEditor: createNewTemplate() call stack'); // Show call stack
        this.template = {
            id: this.generateId(),
            name: 'Nowy szablon',
            description: '',
            printSettings: {
                format: { name: 'A4', width: 210, height: 297, unit: 'mm' },
                dpi: 300,
                colorMode: 'cmyk',
                margins: { top: 20, right: 20, bottom: 20, left: 20, unit: 'mm' },
                bleed: 3
            },
            sections: {
                front: {
                    enabled: true,
                    backgroundColor: '#8B0000',
                    elements: []
                },
                content: {
                    enabled: true,
                    backgroundColor: '#FFFFFF',
                    elements: [],
                    // ✅ USUNIĘTO: productsPerPage przeniesiona do elementów product-list
                    groupByCategory: false,
                    categoryHeaderEnabled: false,
                    productLayout: {
                        id: this.generateId(),
                        name: 'Default Layout',
                        width: 555,
                        height: 700,
                        elements: []
                    }
                },
                back: {
                    enabled: true,
                    backgroundColor: '#F5F5F5',
                    elements: []
                }
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.updateUIFromTemplate();
        this.updateSectionSettingsPanel();
        
        // Initialize history with current state
        this.clearHistory();
        this.saveToHistory('nowy szablon');
    }

    /**
     * Update UI from loaded template
     */
    updateUIFromTemplate() {
        // Update page title
        document.getElementById('template-name').textContent = this.template.name;
        
        // Update format info
        const format = this.template.printSettings.format;
        document.getElementById('format-info').textContent = 
            `${format.name} (${format.width}Ă—${format.height} ${format.unit})`;

        // Update section tabs
        this.updateSectionTabs();
        
        // Update canvas
        this.updateCanvasSize();
        this.renderCanvas();
        
        // Product template preview removed
    }

    /**
     * Update section tabs visibility
     */
    updateSectionTabs() {
        const sections = this.template.sections;
        
        document.getElementById('front-tab').style.display = sections.front.enabled ? 'block' : 'none';
        document.getElementById('content-tab').style.display = sections.content.enabled ? 'block' : 'none';
        document.getElementById('back-tab').style.display = sections.back.enabled ? 'block' : 'none';

        // Switch to first enabled section
        if (sections.front.enabled) {
            this.switchSection('front');
        } else if (sections.content.enabled) {
            this.switchSection('content');
        } else if (sections.back.enabled) {
            this.switchSection('back');
        }
    }

    /**
     * Switch active section
     */
    switchSection(sectionName) {
        console.log('switchSection called with:', sectionName);
        this.currentSection = sectionName;
        
        // Update tab active state
        console.log('Looking for tab ID:', `${sectionName}-tab`);
        document.querySelectorAll('.section-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const targetTab = document.getElementById(`${sectionName}-tab`);
        console.log('Found tab element:', targetTab);
        
        if (targetTab) {
            targetTab.classList.add('active');
        } else {
            console.error('Tab element not found for section:', sectionName);
        }

        // Clear selection
        this.selectedElement = null;
        this.updatePropertiesPanel();
        
        // Update section settings panel (zawiera logikÄ™ pokazania/ukrycia ContentManager)
        this.updateSectionSettingsPanel();
        
        // JeĹ›li przeĹ‚Ä…czamy na sekcjÄ™ content, poinformuj ContentManager o renderowaniu
        if (sectionName === 'content' && this.contentManager) {
            // Renderuj zawartoĹ›Ä‡ tylko jeĹ›li ContentManager jest dostÄ™pny
            setTimeout(() => {
                this.contentManager.renderContent();
            }, 100); // MaĹ‚e opĂłĹşnienie aby panel zdÄ…ĹĽyĹ‚ siÄ™ pokazaÄ‡
        } else {
            // W innych sekcjach renderuj standardowo canvas
            this.renderCanvas();
        }
    }

    /**
     * Bind section settings events
     */
    bindSectionSettingsEvents() {
        // Background type radio buttons
        const bgTypeColor = document.getElementById('bg-type-color');
        const bgTypeImage = document.getElementById('bg-type-image');
        const bgTypeNone = document.getElementById('bg-type-none');
        const bgColorSection = document.getElementById('bg-color-section');
        const bgImageSection = document.getElementById('bg-image-section');
        
        // Event listeners for background type changes
        [bgTypeColor, bgTypeImage, bgTypeNone].forEach(radio => {
            if (radio) {
                radio.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        const selectedType = e.target.value;
                        
                        // Show/hide sections based on selected type
                        if (bgColorSection) {
                            bgColorSection.style.display = selectedType === 'color' ? 'block' : 'none';
                        }
                        if (bgImageSection) {
                            bgImageSection.style.display = selectedType === 'image' ? 'block' : 'none';
                        }
                        
                        // Auto-apply settings when changing type
                        this.applySectionSettings();
                    }
                });
            }
        });
        
        // Background color picker
        const bgColorPicker = document.getElementById('section-bg-color');
        const bgColorText = document.getElementById('section-bg-color-text');
        
        if (bgColorPicker && bgColorText) {
            bgColorPicker.addEventListener('change', (e) => {
                bgColorText.value = e.target.value;
            });
            
            bgColorText.addEventListener('change', (e) => {
                if (this.isValidHexColor(e.target.value)) {
                    bgColorPicker.value = e.target.value;
                }
            });
        }
        
        // Background image input
        const bgImageInput = document.getElementById('section-bg-image');
        const bgImageOptions = document.getElementById('bg-image-options');
        
        if (bgImageInput && bgImageOptions) {
            bgImageInput.addEventListener('input', (e) => {
                if (e.target.value.trim()) {
                    bgImageOptions.style.display = 'block';
                } else {
                    bgImageOptions.style.display = 'none';
                }
            });
        }
        
        // Apply settings button
        const applyButton = document.getElementById('apply-section-settings');
        if (applyButton) {
            applyButton.addEventListener('click', () => {
                this.applySectionSettings();
            });
        }
    }

    /**
     * Update section settings panel
     */
    updateSectionSettingsPanel() {
        const currentSection = this.template.sections[this.currentSection];
        const sectionNameElement = document.getElementById('current-section-name');
        const bgTypeColor = document.getElementById('bg-type-color');
        const bgTypeImage = document.getElementById('bg-type-image');
        const bgTypeNone = document.getElementById('bg-type-none');
        const bgColorPicker = document.getElementById('section-bg-color');
        const bgColorText = document.getElementById('section-bg-color-text');
        const bgImageInput = document.getElementById('section-bg-image');
        const bgSizeSelect = document.getElementById('section-bg-size');
        const bgImageOptions = document.getElementById('bg-image-options');
        const bgColorSection = document.getElementById('bg-color-section');
        const bgImageSection = document.getElementById('bg-image-section');
        
        // Update section name
        const sectionNames = {
            'front': 'OkĹ‚adka',
            'content': 'ZawartoĹ›Ä‡',
            'back': 'Rewers'
        };
        
        if (sectionNameElement) {
            sectionNameElement.textContent = `(${sectionNames[this.currentSection]})`;
        }
        
        // Determine background type
        const bgType = currentSection.backgroundType || 'color'; // Default to color
        
        // Update radio buttons
        if (bgTypeColor) bgTypeColor.checked = (bgType === 'color');
        if (bgTypeImage) bgTypeImage.checked = (bgType === 'image');
        if (bgTypeNone) bgTypeNone.checked = (bgType === 'none');
        
        // Show/hide sections based on background type
        if (bgColorSection) {
            bgColorSection.style.display = (bgType === 'color') ? 'block' : 'none';
        }
        if (bgImageSection) {
            bgImageSection.style.display = (bgType === 'image') ? 'block' : 'none';
        }
        
        // Update background color
        const bgColor = currentSection.backgroundColor || '#ffffff';
        if (bgColorPicker) bgColorPicker.value = bgColor;
        if (bgColorText) bgColorText.value = bgColor;
        
        // Update background image
        const bgImage = currentSection.backgroundImage || '';
        if (bgImageInput) bgImageInput.value = bgImage;
        
        // Update background size
        const bgSize = currentSection.backgroundSize || 'cover';
        if (bgSizeSelect) bgSizeSelect.value = bgSize;
        
        // Show/hide image options based on whether image is provided
        if (bgImageOptions) {
            bgImageOptions.style.display = (bgType === 'image' && bgImage) ? 'block' : 'none';
        }
        
        // Show/hide content settings panel and notify ContentManager
        if (this.currentSection === 'content') {
            // Pokazujemy panel content i powiadamiamy ContentManager
            if (this.contentManager) {
                this.contentManager.show();
            }
        } else {
            // Ukrywamy panel content
            if (this.contentManager) {
                this.contentManager.hide();
            }
        }
    }









    /**




    /**
     * Apply section settings
     */
    applySectionSettings() {
        const currentSection = this.template.sections[this.currentSection];
        const bgTypeColor = document.getElementById('bg-type-color');
        const bgTypeImage = document.getElementById('bg-type-image');
        const bgTypeNone = document.getElementById('bg-type-none');
        const bgColorText = document.getElementById('section-bg-color-text');
        const bgImageInput = document.getElementById('section-bg-image');
        const bgSizeSelect = document.getElementById('section-bg-size');
        
        // Determine selected background type
        let backgroundType = 'color'; // default
        if (bgTypeImage && bgTypeImage.checked) {
            backgroundType = 'image';
        } else if (bgTypeNone && bgTypeNone.checked) {
            backgroundType = 'none';
        }
        
        // Apply background type
        currentSection.backgroundType = backgroundType;
        
        // Apply background color (when color type is selected)
        if (backgroundType === 'color' && bgColorText && this.isValidHexColor(bgColorText.value)) {
            currentSection.backgroundColor = bgColorText.value;
        }
        
        // Apply background image (when image type is selected)
        if (backgroundType === 'image' && bgImageInput) {
            currentSection.backgroundImage = bgImageInput.value.trim();
        }
        
        // Apply background size
        if (bgSizeSelect) {
            currentSection.backgroundSize = bgSizeSelect.value;
        }
        
        // Mark as modified and save
        this.markAsModified();
        this.saveTemplate();
        
        // Show success feedback
        const applyButton = document.getElementById('apply-section-settings');
        if (applyButton) {
            const originalText = applyButton.innerHTML;
            applyButton.innerHTML = '<i class="fas fa-check me-1"></i>Zapisano!';
            applyButton.classList.add('btn-success');
            applyButton.classList.remove('btn-primary');
            
            setTimeout(() => {
                applyButton.innerHTML = originalText;
                applyButton.classList.remove('btn-success');
                applyButton.classList.add('btn-primary');
            }, 2000);
        }
        
        console.log('PDFEditor: Section settings applied for section:', this.currentSection);
    }

    /**
     * Validate hex color
     */
    isValidHexColor(color) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
    }

    /**
     * Update canvas size based on template format
     */
    updateCanvasSize() {
        const canvas = document.getElementById('design-canvas');
        if (!canvas || !this.template || !this.template.printSettings) {
            console.log('PDFEditor: Cannot update canvas size - missing canvas or template');
            return;
        }

        const format = this.template.printSettings.format;
        const dpi = this.template.printSettings.dpi;
        
        // Convert mm to pixels
        const mmToPx = dpi / 25.4;
        const width = format.width * mmToPx * this.zoom;
        const height = format.height * mmToPx * this.zoom;

        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        canvas.setAttribute('data-width', width);
        canvas.setAttribute('data-height', height);

        // Update print guides
        this.updatePrintGuides(width, height, mmToPx);
    }

    /**
     * Update print guides (margins and safe areas)
     */
    updatePrintGuides(canvasWidth, canvasHeight, mmToPx) {
        const canvas = document.getElementById('design-canvas');
        if (!canvas) return;

        // Remove existing guides
        const existingGuides = canvas.querySelectorAll('.print-margins, .safe-area');
        existingGuides.forEach(guide => guide.remove());

        const margins = this.template.printSettings.margins;
        
        // Create print margins indicator
        const marginsDiv = document.createElement('div');
        marginsDiv.className = 'print-margins';
        
        const marginsPx = {
            top: margins.top * mmToPx * this.zoom,
            right: margins.right * mmToPx * this.zoom,
            bottom: margins.bottom * mmToPx * this.zoom,
            left: margins.left * mmToPx * this.zoom
        };

        marginsDiv.style.top = marginsPx.top + 'px';
        marginsDiv.style.right = marginsPx.right + 'px';
        marginsDiv.style.bottom = marginsPx.bottom + 'px';
        marginsDiv.style.left = marginsPx.left + 'px';
        
        canvas.appendChild(marginsDiv);

        // Create safe area (additional 5mm inside margins)
        const safeMargin = 5 * mmToPx * this.zoom; // 5mm safe zone
        const safeDiv = document.createElement('div');
        safeDiv.className = 'safe-area';
        
        safeDiv.style.top = (marginsPx.top + safeMargin) + 'px';
        safeDiv.style.right = (marginsPx.right + safeMargin) + 'px';
        safeDiv.style.bottom = (marginsPx.bottom + safeMargin) + 'px';
        safeDiv.style.left = (marginsPx.left + safeMargin) + 'px';
        
        canvas.appendChild(safeDiv);
    }

    /**
     * Toggle print guides visibility
     */
    togglePrintGuides() {
        const canvas = document.getElementById('design-canvas');
        if (!canvas) return;

        this.showPrintGuides = !this.showPrintGuides;
        
        if (this.showPrintGuides) {
            // Show guides
            this.updatePrintGuides(
                parseFloat(canvas.style.width), 
                parseFloat(canvas.style.height), 
                this.template.printSettings.dpi / 25.4
            );
            // Update canvas border style
            canvas.style.borderStyle = 'dashed';
            canvas.style.borderColor = '#007bff';
        } else {
            // Hide guides
            const guides = canvas.querySelectorAll('.print-margins, .safe-area');
            guides.forEach(guide => guide.remove());
            // Restore original canvas border
            canvas.style.borderStyle = 'solid';
            canvas.style.borderColor = '#ccc';
        }

        // Update button state
        const button = document.getElementById('toggle-guides');
        if (button) {
            button.classList.toggle('active', this.showPrintGuides);
        }
    }

    /**
     * Render canvas with current section elements
     */
    renderCanvas() {
        const canvas = document.getElementById('design-canvas');
        if (!canvas) return;

        const section = this.template.sections[this.currentSection];
        console.log(`PDFEditor: renderCanvas() - section: ${this.currentSection}, elements count: ${section.elements.length}`);
        console.log('PDFEditor: Section elements:', JSON.stringify(section.elements, null, 2));
        
        // Set background color
        canvas.style.backgroundColor = section.backgroundColor;

        // Clear existing elements
        canvas.innerHTML = '';

        // Render grid if enabled
        if (this.showGrid) {
            this.renderGrid(canvas);
        }

        // Render elements
        section.elements.forEach((element, index) => {
            console.log(`PDFEditor: Rendering element ${index}:`, element);
            this.renderElement(canvas, element, index);
        });

        // Update elements list
        this.updateElementsList();
        
        // Update undo/redo buttons state
        this.updateUndoRedoButtons();
    }

    /**
     * Render grid on canvas
     */
    renderGrid(canvas) {
        const width = parseInt(canvas.getAttribute('data-width'));
        const height = parseInt(canvas.getAttribute('data-height'));
        
        const gridSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        gridSvg.style.position = 'absolute';
        gridSvg.style.top = '0';
        gridSvg.style.left = '0';
        gridSvg.style.width = '100%';
        gridSvg.style.height = '100%';
        gridSvg.style.pointerEvents = 'none';
        gridSvg.style.opacity = '0.2';

        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
        pattern.setAttribute('id', 'grid');
        pattern.setAttribute('width', this.grid.x * this.zoom);
        pattern.setAttribute('height', this.grid.y * this.zoom);
        pattern.setAttribute('patternUnits', 'userSpaceOnUse');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${this.grid.x * this.zoom} 0 L 0 0 0 ${this.grid.y * this.zoom}`);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#ccc');
        path.setAttribute('stroke-width', '1');

        pattern.appendChild(path);
        defs.appendChild(pattern);
        gridSvg.appendChild(defs);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', 'url(#grid)');
        gridSvg.appendChild(rect);

        canvas.appendChild(gridSvg);
    }

    /**
     * Render single element on canvas
     */
    renderElement(canvas, element, index) {
        const elementDiv = document.createElement('div');
        elementDiv.className = 'canvas-element';
        elementDiv.dataset.elementIndex = index;
        elementDiv.style.position = 'absolute';
        elementDiv.style.left = (element.x * this.zoom) + 'px';
        elementDiv.style.top = (element.y * this.zoom) + 'px';
        elementDiv.style.width = (element.width * this.zoom) + 'px';
        elementDiv.style.height = (element.height * this.zoom) + 'px';
        elementDiv.style.border = this.selectedElement === element ? '2px solid #007bff' : (element.isPreview ? '1px solid #28a745' : '1px dashed #ccc');
        elementDiv.style.cursor = 'move';
        elementDiv.style.zIndex = element.zIndex || 1;
        
        // Debug logging for preview elements
        if (element.isPreview) {
            console.log(`renderElement: Preview element ${element.id} - position: ${element.x},${element.y}, size: ${element.width}x${element.height}, zoom: ${this.zoom}`);
        }

        // Add element content based on type
        this.renderElementContent(elementDiv, element);

        // Make draggable
        elementDiv.draggable = true;
        elementDiv.addEventListener('dragstart', (e) => {
            this.draggedElement = element;
            e.dataTransfer.effectAllowed = 'move';
        });

        elementDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectElement(element);
        });

        canvas.appendChild(elementDiv);
    }

    /**
     * Render element content based on type
     */
    renderElementContent(container, element) {
        container.innerHTML = '';
        
        switch (element.type) {
            case 'text':
                container.innerHTML = `<div style="
                    font-family: ${element.fontFamily || 'Arial'};
                    font-size: ${(element.fontSize || 12) * this.zoom}px;
                    font-weight: ${element.fontWeight || 'normal'};
                    color: ${element.color || '#000000'};
                    text-align: ${element.textAlign || 'left'};
                    line-height: ${element.lineHeight || 1.2};
                    padding: 4px;
                    word-wrap: break-word;
                    overflow: hidden;
                ">${element.content || 'Tekst'}</div>`;
                break;

            case 'image':
                const imageUrl = element.src || element.imageUrl;
                if (imageUrl) {
                    container.innerHTML = `<img src="${imageUrl}" style="
                        width: 100%;
                        height: 100%;
                        object-fit: ${element.objectFit || 'cover'};
                    " alt="Obraz" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#666;\\'>Brak obrazu</div>';">`;
                } else {
                    container.innerHTML = `<div style="
                        width: 100%;
                        height: 100%;
                        background: #f0f0f0;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #666;
                        font-size: ${12 * this.zoom}px;
                        border: 2px dashed #ccc;
                    ">đź“· Obraz</div>`;
                }
                break;

            case 'rectangle':
                container.style.backgroundColor = element.backgroundColor || '#cccccc';
                container.style.border = element.borderWidth ? 
                    `${element.borderWidth * this.zoom}px solid ${element.borderColor || '#000000'}` : 'none';
                break;

            case 'line':
                container.innerHTML = `<div style="
                    width: 100%;
                    height: ${(element.strokeWidth || 1) * this.zoom}px;
                    background-color: ${element.strokeColor || '#000000'};
                    margin-top: ${((element.height || 10) * this.zoom - (element.strokeWidth || 1) * this.zoom) / 2}px;
                "></div>`;
                break;

            case 'qr-code':
                container.innerHTML = `<div style="
                    width: 100%;
                    height: 100%;
                    background: #f0f0f0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #666;
                    font-size: ${12 * this.zoom}px;
                "><i class="fas fa-qrcode"></i></div>`;
                break;

            case 'product-list':
                // Asynchronous rendering for product list
                this.renderProductListContent(container, element).catch(error => {
                    console.error('Error rendering product list:', error);
                    container.innerHTML = `<div style="
                        width: 100%;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #dc3545;
                        font-size: ${10 * this.zoom}px;
                        text-align: center;
                        padding: 10px;
                    ">BĹ‚Ä…d Ĺ‚adowania<br>listy produktĂłw</div>`;
                });
                break;

            default:
                container.innerHTML = `<div style="padding: 4px; font-size: ${10 * this.zoom}px;">${element.type}</div>`;
        }
    }

    /**
     * Render product list content
     */
    async renderProductListContent(container, element) {
        const headerHeight = element.showHeader ? (element.headerFontSize || 14) * this.zoom + 10 : 0;
        let html = '';
        
        // Header
        if (element.showHeader) {
            html += `<div style="
                font-family: ${element.fontFamily || 'Arial'};
                font-size: ${(element.headerFontSize || 14) * this.zoom}px;
                font-weight: bold;
                color: ${element.headerColor || '#000000'};
                text-align: center;
                padding: 5px;
                border-bottom: 1px solid #ddd;
                margin-bottom: 5px;
            ">${element.headerText || 'Produkty'}</div>`;
        }
        
        // Content area
        const contentHeight = (element.height * this.zoom) - headerHeight;
        const itemHeight = Math.floor(contentHeight / (element.rowsPerPage || 15));
        
        // For full-page lists, use adaptive column count based on width
        const isFullPage = element.width > 450 && element.height > 650;
        let columns = element.columns || 2;
        if (isFullPage && element.width > 600) {
            columns = Math.max(2, Math.min(4, Math.floor(element.width / 180))); // Auto-calculate columns
        }
        
        html += `<div style="
            height: ${contentHeight}px;
            overflow: hidden;
            display: grid;
            grid-template-columns: repeat(${columns}, 1fr);
            gap: ${(element.itemSpacing || 10) * this.zoom}px;
            padding: ${isFullPage ? '10px' : '5px'};
            box-sizing: border-box;
        ">`;
        
        // Load and display real products if collection selected
        if (element.collectionId) {
            try {
                const wines = await this.loadCollectionWines(element.collectionId);
                const displayCount = Math.min(wines.length, element.rowsPerPage || 10);
                
                if (wines.length > 0) {
                    for (let i = 0; i < displayCount; i++) {
                        const wine = wines[i];
                        html += this.renderProductItem(wine, element, itemHeight);
                    }
                } else {
                    html += `<div style="
                        grid-column: 1 / -1;
                        text-align: center;
                        color: #6c757d;
                        font-size: ${10 * this.zoom}px;
                        padding: 20px;
                        border: 2px dashed #dee2e6;
                        border-radius: 4px;
                    ">Kolekcja jest pusta</div>`;
                }
            } catch (error) {
                console.error('Error loading collection wines:', error);
                html += `<div style="
                    grid-column: 1 / -1;
                    text-align: center;
                    color: #dc3545;
                    font-size: ${10 * this.zoom}px;
                    padding: 20px;
                    border: 2px dashed #dee2e6;
                    border-radius: 4px;
                ">BĹ‚Ä…d Ĺ‚adowania produktĂłw</div>`;
            }
        } else {
            // Show collection selection prompt
            html += `<div style="
                grid-column: 1 / -1;
                text-align: center;
                color: #6c757d;
                font-size: ${10 * this.zoom}px;
                padding: 20px;
                border: 2px dashed #dee2e6;
                border-radius: 4px;
            ">Wybierz kolekcjÄ™ w wĹ‚aĹ›ciwoĹ›ciach</div>`;
        }
        
        html += `</div>`;
        container.innerHTML = html;
    }

    /**
     * Render individual product item with dynamic fields support
     */
    renderProductItem(wine, element, itemHeight) {
        console.log('🎨 renderProductItem - wine:', wine);
        console.log('🎨 renderProductItem - element.displayFields:', element.displayFields);
        
        // For full-page product lists, use more optimized layout
        const isFullPage = element.width > 450 && element.height > 650;
        const baseSize = isFullPage ? 11 : (element.fontSize || 10);
        
        let html = `<div class="product-item" style="
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: ${isFullPage ? '8px' : '4px'};
            font-size: ${baseSize * this.zoom}px;
            color: ${element.textColor || '#000000'};
            font-family: ${element.fontFamily || 'Arial'};
            display: flex;
            flex-direction: column;
            height: ${itemHeight - 10}px;
            box-sizing: border-box;
        ">`;
        
        // Use dynamic fields if configured, otherwise fallback to legacy fields
        const displayFields = element.displayFields || [];
        console.log('🎨 renderProductItem - using displayFields:', displayFields);
        
        if (displayFields.length > 0 && this.dynamicFields) {
            // Dynamic field rendering
            for (const fieldId of displayFields) {
                const field = this.dynamicFields.find(f => f.id === fieldId);
                if (!field) {
                    console.warn('🎨 Field not found:', fieldId);
                    continue;
                }
                
                console.log('🎨 Rendering field:', field.id, field.label);
                
                // Special handling for image field
                if (field.id === 'image') {
                    const imageHeight = isFullPage ? '35%' : '40%';
                    html += `<div style="
                        width: 100%;
                        height: ${imageHeight};
                        background: #e9ecef;
                        margin-bottom: ${isFullPage ? '6px' : '2px'};
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: ${(baseSize - 1) * this.zoom}px;
                        color: #6c757d;
                        border-radius: 3px;
                    "><i class="fas fa-wine-bottle"></i></div>`;
                    continue;
                }
                
                // Get field value
                let value = this.getFieldValue(wine, field);
                if (!value || value.toString().trim() === '') continue;
                
                // Style based on field type and importance
                let fieldStyle = '';
                let fieldClass = 'product-field';
                
                if (field.id === 'name' || field.id === 'nazwa') {
                    // Title styling for name field
                    fieldStyle = `
                        font-weight: bold; 
                        margin-bottom: ${isFullPage ? '6px' : '1px'}; 
                        line-height: 1.2; 
                        overflow: hidden;
                        text-overflow: ellipsis;
                        ${isFullPage ? 'display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;' : ''}
                    `;
                    fieldClass = 'product-title';
                } else if (field.id === 'price1' || field.id === 'price2' || field.id === 'cena') {
                    // Price styling
                    fieldStyle = `
                        font-weight: bold; 
                        color: #2c5530;
                        font-size: ${(baseSize + 1) * this.zoom}px;
                        margin-top: auto;
                    `;
                    fieldClass = 'product-price';
                    if (field.id !== 'cena') value += ' zł'; // Add currency for price fields
                } else if (field.group === 'basic') {
                    // Basic field styling
                    fieldStyle = `
                        font-size: ${(baseSize - 1) * this.zoom}px; 
                        color: #666; 
                        margin-bottom: ${isFullPage ? '4px' : '1px'}; 
                        line-height: 1.1; 
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    `;
                    fieldClass = 'product-details';
                } else {
                    // Details/other field styling
                    fieldStyle = `
                        font-size: ${(baseSize - 2) * this.zoom}px; 
                        color: #888; 
                        margin-bottom: 2px; 
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    `;
                    fieldClass = 'product-details';
                }
                
                html += `<div class="${fieldClass}" style="${fieldStyle}">${value}</div>`;
            }
        } else {
            // Legacy fallback rendering
            console.log('🎨 Using legacy rendering - no displayFields configured');
            
            // Show image if enabled
            if (element.showImages) {
                const imageHeight = isFullPage ? '35%' : '40%';
                html += `<div style="
                    width: 100%;
                    height: ${imageHeight};
                    background: #e9ecef;
                    margin-bottom: ${isFullPage ? '6px' : '2px'};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: ${(baseSize - 1) * this.zoom}px;
                    color: #6c757d;
                    border-radius: 3px;
                "><i class="fas fa-wine-bottle"></i></div>`;
            }
            
            html += `<div style="flex: 1; padding: ${isFullPage ? '4px' : '2px'}; display: flex; flex-direction: column; justify-content: space-between;">`;
            
            // Wine name
            const wineName = wine.nazwa || wine.name || 'Bez nazwy';
            html += `<div class="product-title" style="
                font-weight: bold; 
                margin-bottom: ${isFullPage ? '6px' : '1px'}; 
                line-height: 1.2; 
                overflow: hidden;
                text-overflow: ellipsis;
                ${isFullPage ? 'display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;' : ''}
            ">${wineName}</div>`;
            
            // Description/variety
            if (element.showDescriptions && (wine.szczepy || wine.variety)) {
                const variety = wine.szczepy || wine.variety;
                html += `<div class="product-details" style="
                    font-size: ${(baseSize - 1) * this.zoom}px; 
                    color: #666; 
                    margin-bottom: ${isFullPage ? '4px' : '1px'}; 
                    line-height: 1.1; 
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                ">${variety}</div>`;
            }
            
            // Additional details for full-page view
            if (isFullPage) {
                if (wine.region) {
                    html += `<div class="product-details" style="
                        font-size: ${(baseSize - 2) * this.zoom}px; 
                        color: #888; 
                        margin-bottom: 2px; 
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    ">${wine.region}</div>`;
                }
                
                if (wine.poj) {
                    html += `<div class="product-details" style="
                        font-size: ${(baseSize - 2) * this.zoom}px; 
                        color: #888; 
                        margin-bottom: 2px;
                    ">${wine.poj}</div>`;
                }
            }
            
            // Price
            if (element.showPrices && wine.cena) {
                html += `<div class="product-price" style="
                    font-weight: bold; 
                    color: #2c5530;
                    font-size: ${(baseSize + 1) * this.zoom}px;
                    margin-top: auto;
                ">${wine.cena} zł</div>`;
            }
            
            html += `</div>`;
        }
        return html;
    }

    /**
     * Get field value from wine object with flexible field mapping
     */
    getFieldValue(wine, field) {
        // Direct field access
        if (wine[field.id] !== undefined && wine[field.id] !== null) {
            return wine[field.id];
        }
        
        // Alternative field mappings
        const alternatives = {
            'name': ['nazwa', 'wine_name'],
            'nazwa': ['name', 'wine_name'],
            'description': ['opis', 'desc'],
            'variety': ['szczepy', 'grape'],
            'szczepy': ['variety', 'grape'],
            'volume': ['poj', 'pojemnosc'],
            'poj': ['volume', 'pojemnosc'],
            'catalogNumber': ['catalog', 'nr_katalogowy'],
            'price1': ['cena', 'price'],
            'cena': ['price1', 'price']
        };
        
        if (alternatives[field.id]) {
            for (const alt of alternatives[field.id]) {
                if (wine[alt] !== undefined && wine[alt] !== null) {
                    return wine[alt];
                }
            }
        }
        
        return '';
    }

    /**
     * Load wines from collection
     */
    async loadCollectionWines(collectionId) {
        if (!collectionId) return [];
        
        try {
            const response = await api.getCollection(collectionId, true);
            if (response.success && response.data && response.data.wines) {
                return response.data.wines;
            }
            return [];
        } catch (error) {
            console.error('Error loading collection wines:', error);
            return [];
        }
    }

    /**
     * Handle element drag start from library
     */
    handleElementDragStart(e) {
        console.log('PDFEditor: handleElementDragStart called', e.target);
        const elementType = e.target.dataset.elementType;
        console.log('PDFEditor: Dragging element type:', elementType);
        e.dataTransfer.setData('text/plain', elementType);
        e.dataTransfer.effectAllowed = 'copy';
    }

    /**
     * Handle drop on canvas
     */
    handleCanvasDrop(e) {
        console.log('PDFEditor: handleCanvasDrop called', e);
        e.preventDefault();
        
        const rect = e.target.getBoundingClientRect();
        const x = (e.clientX - rect.left) / this.zoom;
        const y = (e.clientY - rect.top) / this.zoom;
        console.log('PDFEditor: Drop position:', x, y);

        if (this.draggedElement) {
            console.log('PDFEditor: Moving existing element');
            // Save state before moving element
            this.saveToHistory('przemieszczenie elementu');
            
            // Moving existing element
            this.draggedElement.x = Math.round(x - (this.draggedElement.width / 2));
            this.draggedElement.y = Math.round(y - (this.draggedElement.height / 2));
            this.snapToGrid(this.draggedElement);
            this.draggedElement = null;
            this.markAsModified(); // Mark template as modified when element is moved
        } else {
            // Adding new element
            const elementType = e.dataTransfer.getData('text/plain');
            console.log('PDFEditor: Adding new element of type:', elementType);
            if (elementType) {
                this.addNewElement(elementType, x, y);
            }
        }

        this.renderCanvas();
    }

    /**
     * Add new element to current section
     */
    addNewElement(type, x, y) {
        console.log(`PDFEditor: Adding new element of type ${type} to section ${this.currentSection}`);
        console.log('PDFEditor: Template ID before adding element:', this.template.id);
        console.log('PDFEditor: isEditing before adding element:', this.isEditing);
        
        // Save state before adding new element
        this.saveToHistory(`dodanie elementu ${type}`);
        
        const newElement = this.createElementByType(type, x, y);
        this.template.sections[this.currentSection].elements.push(newElement);
        this.selectElement(newElement);
        this.markAsModified();
        
        console.log('PDFEditor: Elements count after adding:', this.template.sections[this.currentSection].elements.length);
    }

    /**
     * Create element by type with defaults
     */
    createElementByType(type, x, y) {
        const baseElement = {
            id: this.generateId(),
            type: type,
            x: Math.round(x - 50),
            y: Math.round(y - 25),
            zIndex: 1,
            sizeUnit: 'px' // Default to pixels, can be 'px' or '%'
        };

        this.snapToGrid(baseElement);

        switch (type) {
            case 'text':
                return {
                    ...baseElement,
                    width: 100,
                    height: 50,
                    widthMm: 35,  // Default millimeter values (~100px at 72dpi)
                    heightMm: 18,
                    content: 'Nowy tekst',
                    fontSize: 12,
                    fontFamily: 'Arial',
                    fontWeight: 'normal',
                    color: '#000000',
                    textAlign: 'left',
                    lineHeight: 1.2
                };

            case 'image':
                return {
                    ...baseElement,
                    width: 100,
                    height: 100,
                    widthMm: 35,
                    heightMm: 35,
                    src: '',
                    objectFit: 'cover'
                };

            case 'rectangle':
                return {
                    ...baseElement,
                    width: 100,
                    height: 50,
                    widthMm: 35,
                    heightMm: 18,
                    backgroundColor: '#cccccc',
                    borderWidth: 0,
                    borderColor: '#000000'
                };

            case 'line':
                return {
                    ...baseElement,
                    width: 100,
                    height: 2,
                    widthMm: 35,
                    heightMm: 0.7,
                    strokeWidth: 1,
                    strokeColor: '#000000'
                };

            case 'qr-code':
                return {
                    ...baseElement,
                    width: 80,
                    height: 80,
                    widthMm: 28,
                    heightMm: 28,
                    data: 'https://example.com'
                };

            case 'product-list':
                // Calculate full page dimensions minus margins (A4 = 210x297mm, margins = 20mm each side)
                const pageWidth = 210; // A4 width in mm
                const pageHeight = 297; // A4 height in mm
                const marginTop = 20;
                const marginRight = 20;
                const marginBottom = 20;
                const marginLeft = 20;
                
                const fullWidthMm = pageWidth - marginLeft - marginRight; // 170mm
                const fullHeightMm = pageHeight - marginTop - marginBottom; // 257mm
                
                // Convert to pixels (approximately 2.83 px per mm at 72 DPI)
                const mmToPx = 2.83465; 
                const fullWidthPx = Math.round(fullWidthMm * mmToPx); // ~481px
                const fullHeightPx = Math.round(fullHeightMm * mmToPx); // ~727px
                
                return {
                    ...baseElement,
                    x: Math.round(marginLeft * mmToPx), // Position at left margin
                    y: Math.round(marginTop * mmToPx),  // Position at top margin
                    width: fullWidthPx,
                    height: fullHeightPx,
                    widthMm: fullWidthMm,
                    heightMm: fullHeightMm,
                    collectionId: '',
                    columns: 2,
                    rowsPerPage: 15, // More rows since we have more height
                    showImages: true,
                    showPrices: true,
                    showDescriptions: false,
                    displayFields: ['name', 'catalogNumber', 'type', 'category'], // Default dynamic fields
                    itemSpacing: 10,
                    fontSize: 10,
                    fontFamily: 'Arial',
                    textColor: '#000000',
                    headerText: 'Produkty',
                    showHeader: true,
                    headerFontSize: 14,
                    headerColor: '#000000'
                };

            default:
                return {
                    ...baseElement,
                    width: 100,
                    height: 50,
                    widthPercent: 10,
                    heightPercent: 5
                };
        }
    }

    /**
     * Snap element to grid
     */
    snapToGrid(element) {
        if (this.showGrid) {
            element.x = Math.round(element.x / this.grid.x) * this.grid.x;
            element.y = Math.round(element.y / this.grid.y) * this.grid.y;
        }
    }

    /**
     * Select element and update properties panel
     */
    selectElement(element) {
        this.selectedElement = element;
        this.updatePropertiesPanel();
        this.renderCanvas();
    }

    /**
     * Handle canvas click (deselect)
     */
    handleCanvasClick(e) {
        if (e.target.id === 'design-canvas') {
            this.selectedElement = null;
            this.updatePropertiesPanel();
            this.renderCanvas();
        }
    }

    /**
     * Handle canvas right click (context menu)
     */
    handleCanvasRightClick(e) {
        e.preventDefault();
        // TODO: Implement context menu
    }

    /**
     * Update properties panel based on selected element
     */
    updatePropertiesPanel() {
        const panel = document.getElementById('properties-panel');
        if (!panel) return;

        if (!this.selectedElement) {
            panel.innerHTML = `
                <div class="text-center text-muted p-4">
                    <i class="fas fa-mouse-pointer fa-2x mb-2"></i>
                    <p>Wybierz element aby edytowaÄ‡ wĹ‚aĹ›ciwoĹ›ci</p>
                </div>
            `;
            return;
        }

        panel.innerHTML = this.generatePropertiesHTML(this.selectedElement);
        this.bindPropertyEvents();
    }

    /**
     * Generate properties HTML for element
     */
    generatePropertiesHTML(element) {
        let html = `
            <div class="properties-header">
                <h6>${this.getElementTypeLabel(element.type)}</h6>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="pdfEditor.deleteSelectedElement()">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            
            <!-- Position & Size -->
            <div class="property-group">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <label class="form-label mb-0">Pozycja i rozmiar</label>
                    <div class="btn-group btn-group-sm" role="group">
                        <input type="radio" class="btn-check" name="size-unit" id="size-unit-px" ${element.sizeUnit === 'px' ? 'checked' : ''} value="px">
                        <label class="btn btn-outline-secondary" for="size-unit-px">px</label>
                        <input type="radio" class="btn-check" name="size-unit" id="size-unit-mm" ${element.sizeUnit === 'mm' ? 'checked' : ''} value="mm">
                        <label class="btn btn-outline-secondary" for="size-unit-mm">mm</label>
                    </div>
                </div>
                <div class="row g-2">
                    <div class="col-6">
                        <label class="form-label small">X</label>
                        <input type="number" class="form-control form-control-sm" id="prop-x" value="${element.x}">
                    </div>
                    <div class="col-6">
                        <label class="form-label small">Y</label>
                        <input type="number" class="form-control form-control-sm" id="prop-y" value="${element.y}">
                    </div>
                    <div class="col-6">
                        <label class="form-label small">SzerokoĹ›Ä‡</label>
                        <div class="input-group input-group-sm">
                            <input type="number" class="form-control" id="prop-width" value="${element.sizeUnit === 'mm' ? (element.widthMm || 0) : element.width}" step="${element.sizeUnit === 'mm' ? '0.1' : '1'}">
                            <span class="input-group-text">${element.sizeUnit}</span>
                        </div>
                    </div>
                    <div class="col-6">
                        <label class="form-label small">WysokoĹ›Ä‡</label>
                        <div class="input-group input-group-sm">
                            <input type="number" class="form-control" id="prop-height" value="${element.sizeUnit === 'mm' ? (element.heightMm || 0) : element.height}" step="${element.sizeUnit === 'mm' ? '0.1' : '1'}">
                            <span class="input-group-text">${element.sizeUnit}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Alignment -->
            <div class="property-group">
                <label class="form-label">WyrĂłwnanie</label>
                <div class="d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary flex-fill" onclick="pdfEditor.centerElementHorizontally()">
                        <i class="fas fa-arrows-alt-h"></i> Poziomo
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-primary flex-fill" onclick="pdfEditor.centerElementVertically()">
                        <i class="fas fa-arrows-alt-v"></i> Pionowo
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-primary flex-fill" onclick="pdfEditor.centerElementBoth()">
                        <i class="fas fa-crosshairs"></i> Oba
                    </button>
                </div>
            </div>
        `;

        // Type-specific properties
        switch (element.type) {
            case 'text':
                html += this.generateTextProperties(element);
                break;
            case 'image':
                html += this.generateImageProperties(element);
                break;
            case 'rectangle':
                html += this.generateRectangleProperties(element);
                break;
            case 'line':
                html += this.generateLineProperties(element);
                break;
            case 'qr-code':
                html += this.generateQRCodeProperties(element);
                break;
            case 'product-list':
                html += this.generateProductListProperties(element);
                break;
        }

        // Z-Index
        html += `
            <div class="property-group">
                <label for="prop-z-index" class="form-label">Z-Index</label>
                <input type="number" class="form-control form-control-sm" id="prop-z-index" value="${element.zIndex || 1}" min="1">
            </div>
        `;

        return html;
    }

    /**
     * Generate text-specific properties
     */
    generateTextProperties(element) {
        return `
            <div class="property-group">
                <label for="prop-content" class="form-label">TreĹ›Ä‡</label>
                <textarea class="form-control form-control-sm" id="prop-content" rows="3">${element.content || ''}</textarea>
            </div>
            
            <div class="property-group">
                <label for="prop-font-family" class="form-label">Czcionka</label>
                <select class="form-select form-select-sm" id="prop-font-family">
                    <option value="Arial" ${element.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                    <option value="Helvetica" ${element.fontFamily === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
                    <option value="Times" ${element.fontFamily === 'Times' ? 'selected' : ''}>Times</option>
                    <option value="Courier" ${element.fontFamily === 'Courier' ? 'selected' : ''}>Courier</option>
                </select>
            </div>
            
            <div class="row g-2">
                <div class="col-6">
                    <label for="prop-font-size" class="form-label small">Rozmiar</label>
                    <input type="number" class="form-control form-control-sm" id="prop-font-size" value="${element.fontSize || 12}" min="6" max="72">
                </div>
                <div class="col-6">
                    <label for="prop-color" class="form-label small">Kolor</label>
                    <input type="color" class="form-control form-control-sm" id="prop-color" value="${element.color || '#000000'}">
                </div>
            </div>
            
            <div class="row g-2">
                <div class="col-6">
                    <label for="prop-font-weight" class="form-label small">GruboĹ›Ä‡</label>
                    <select class="form-select form-select-sm" id="prop-font-weight">
                        <option value="normal" ${element.fontWeight === 'normal' ? 'selected' : ''}>Normal</option>
                        <option value="bold" ${element.fontWeight === 'bold' ? 'selected' : ''}>Bold</option>
                    </select>
                </div>
                <div class="col-6">
                    <label for="prop-text-align" class="form-label small">WyrĂłwnanie</label>
                    <select class="form-select form-select-sm" id="prop-text-align">
                        <option value="left" ${element.textAlign === 'left' ? 'selected' : ''}>Lewo</option>
                        <option value="center" ${element.textAlign === 'center' ? 'selected' : ''}>Ĺšrodek</option>
                        <option value="right" ${element.textAlign === 'right' ? 'selected' : ''}>Prawo</option>
                    </select>
                </div>
            </div>
        `;
    }

    /**
     * Generate image-specific properties
     */
    generateImageProperties(element) {
        return `
            <div class="property-group">
                <label for="prop-src" class="form-label">URL obrazu</label>
                <input type="url" class="form-control form-control-sm" id="prop-src" value="${element.src || ''}" placeholder="https://...">
            </div>
            
            <div class="property-group">
                <label for="prop-object-fit" class="form-label">Dopasowanie</label>
                <select class="form-select form-select-sm" id="prop-object-fit">
                    <option value="cover" ${element.objectFit === 'cover' ? 'selected' : ''}>Pokryj</option>
                    <option value="contain" ${element.objectFit === 'contain' ? 'selected' : ''}>Zawrzyj</option>
                    <option value="fill" ${element.objectFit === 'fill' ? 'selected' : ''}>WypeĹ‚nij</option>
                </select>
            </div>
        `;
    }

    /**
     * Generate rectangle-specific properties
     */
    generateRectangleProperties(element) {
        return `
            <div class="property-group">
                <label for="prop-bg-color" class="form-label">Kolor tĹ‚a</label>
                <input type="color" class="form-control form-control-sm" id="prop-bg-color" value="${element.backgroundColor || '#cccccc'}">
            </div>
            
            <div class="row g-2">
                <div class="col-6">
                    <label for="prop-border-width" class="form-label small">GruboĹ›Ä‡ ramki</label>
                    <input type="number" class="form-control form-control-sm" id="prop-border-width" value="${element.borderWidth || 0}" min="0">
                </div>
                <div class="col-6">
                    <label for="prop-border-color" class="form-label small">Kolor ramki</label>
                    <input type="color" class="form-control form-control-sm" id="prop-border-color" value="${element.borderColor || '#000000'}">
                </div>
            </div>
        `;
    }

    /**
     * Generate line-specific properties
     */
    generateLineProperties(element) {
        return `
            <div class="row g-2">
                <div class="col-6">
                    <label for="prop-stroke-width" class="form-label small">GruboĹ›Ä‡</label>
                    <input type="number" class="form-control form-control-sm" id="prop-stroke-width" value="${element.strokeWidth || 1}" min="1">
                </div>
                <div class="col-6">
                    <label for="prop-stroke-color" class="form-label small">Kolor</label>
                    <input type="color" class="form-control form-control-sm" id="prop-stroke-color" value="${element.strokeColor || '#000000'}">
                </div>
            </div>
        `;
    }

    /**
     * Generate QR code-specific properties
     */
    generateQRCodeProperties(element) {
        return `
            <div class="property-group">
                <label for="prop-qr-data" class="form-label">Dane QR</label>
                <input type="text" class="form-control form-control-sm" id="prop-qr-data" value="${element.data || ''}" placeholder="URL lub tekst">
            </div>
        `;
    }

    /**
     * Generate dynamic fields checkboxes for product list
     */
    generateDynamicFieldsCheckboxes(element) {
        console.log('🔍 generateDynamicFieldsCheckboxes called with element:', element);
        
        // Initialize displayFields if not exists
        if (!element.displayFields) {
            element.displayFields = ['name']; // Always show name by default
        }

        // Get available fields from the dynamic fields configuration
        const fieldsConfig = this.dynamicFields || [];
        console.log('🔍 fieldsConfig (from this.dynamicFields):', fieldsConfig);
        
        // Fallback if fieldsConfig is not available
        if (fieldsConfig.length === 0) {
            console.warn('⚠️ No fields config found, showing fallback message');
            return `
                <div class="alert alert-warning">
                    <small>Ładowanie konfiguracji pól...</small>
                </div>
            `;
        }
        
        let html = '';
        
        // Group fields by category for better UX
        const fieldGroups = {
            'basic': 'Podstawowe',
            'details': 'Szczegóły',
            'other': 'Inne'
        };

        Object.entries(fieldGroups).forEach(([groupKey, groupLabel]) => {
            const groupFields = fieldsConfig.filter(field => 
                field.group === groupKey && 
                field.key !== 'image' && // Images handled separately
                field.key !== 'description' && // Description handled separately
                field.displayInCards !== false
            );

            if (groupFields.length > 0) {
                html += `<div class="mb-2"><small class="text-muted fw-bold">${groupLabel}</small></div>`;
                
                groupFields.forEach(field => {
                    const isChecked = element.displayFields && element.displayFields.includes(field.key);
                    const isRequired = field.key === 'name'; // Name is always required
                    
                    html += `
                        <div class="form-check form-check-sm">
                            <input class="form-check-input" type="checkbox" 
                                   id="prop-display-field-${field.key}" 
                                   value="${field.key}"
                                   ${isChecked ? 'checked' : ''}
                                   ${isRequired ? 'disabled' : ''}>
                            <label class="form-check-label small" for="prop-display-field-${field.key}">
                                ${field.label}${isRequired ? ' (wymagane)' : ''}
                            </label>
                        </div>
                    `;
                });
            }
        });

        console.log('🔍 Generated HTML:', html);
        return html;
    }

    /**
     * Generate product list properties
     */
    generateProductListProperties(element) {
        return `
            <div class="property-group">
                <label for="prop-collection-id" class="form-label">Kolekcja</label>
                <select class="form-select form-select-sm" id="prop-collection-id">
                    <option value="">Wybierz kolekcję...</option>
                    ${this.collections ? this.collections.map(collection => 
                        `<option value="${collection.id}" ${element.collectionId === collection.id ? 'selected' : ''}>${collection.name}</option>`
                    ).join('') : ''}
                </select>
            </div>
            

            
            <div class="property-group">
                <label for="prop-header-text" class="form-label">NagĹ‚Ăłwek</label>
                <input type="text" class="form-control form-control-sm" id="prop-header-text" value="${element.headerText || 'Produkty'}" placeholder="Tekst nagĹ‚Ăłwka">
            </div>
            
            <div class="row g-2">
                <div class="col-6">
                    <label for="prop-columns" class="form-label small">Kolumny</label>
                    <input type="number" class="form-control form-control-sm" id="prop-columns" value="${element.columns || 2}" min="1" max="4">
                </div>
                <div class="col-6">
                    <label for="prop-rows-per-page" class="form-label small">Wiersze na stronÄ™</label>
                    <input type="number" class="form-control form-control-sm" id="prop-rows-per-page" value="${element.rowsPerPage || 15}" min="1" max="50">
                </div>
            </div>
            
            <div class="property-group">
                <label class="form-label">WyĹ›wietlane elementy</label>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="prop-show-header" ${element.showHeader ? 'checked' : ''}>
                    <label class="form-check-label" for="prop-show-header">Pokaż nagłówek</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="prop-show-images" ${element.showImages ? 'checked' : ''}>
                    <label class="form-check-label" for="prop-show-images">Pokaż obrazy</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="prop-show-prices" ${element.showPrices ? 'checked' : ''}>
                    <label class="form-check-label" for="prop-show-prices">Pokaż ceny</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="prop-show-descriptions" ${element.showDescriptions ? 'checked' : ''}>
                    <label class="form-check-label" for="prop-show-descriptions">Pokaż opisy</label>
                </div>
            </div>
            
            <div class="property-group">
                <label class="form-label">Wybierz pola do wyświetlenia</label>
                <div id="prop-display-fields" class="mt-2">
                    ${this.generateDynamicFieldsCheckboxes(element)}
                </div>
            </div>
            
            <div class="property-group">
                <label for="prop-list-font-family" class="form-label">Czcionka</label>
                <select class="form-select form-select-sm" id="prop-list-font-family">
                    <option value="Arial" ${element.fontFamily === 'Arial' ? 'selected' : ''}>Arial</option>
                    <option value="Helvetica" ${element.fontFamily === 'Helvetica' ? 'selected' : ''}>Helvetica</option>
                    <option value="Times" ${element.fontFamily === 'Times' ? 'selected' : ''}>Times</option>
                    <option value="Courier" ${element.fontFamily === 'Courier' ? 'selected' : ''}>Courier</option>
                </select>
            </div>
            
            <div class="row g-2">
                <div class="col-6">
                    <label for="prop-list-font-size" class="form-label small">Rozmiar tekstu</label>
                    <input type="number" class="form-control form-control-sm" id="prop-list-font-size" value="${element.fontSize || 10}" min="6" max="24">
                </div>
                <div class="col-6">
                    <label for="prop-header-font-size" class="form-label small">Rozmiar nagĹ‚Ăłwka</label>
                    <input type="number" class="form-control form-control-sm" id="prop-header-font-size" value="${element.headerFontSize || 14}" min="8" max="32">
                </div>
            </div>
            
            <div class="row g-2">
                <div class="col-6">
                    <label for="prop-list-text-color" class="form-label small">Kolor tekstu</label>
                    <input type="color" class="form-control form-control-sm" id="prop-list-text-color" value="${element.textColor || '#000000'}">
                </div>
                <div class="col-6">
                    <label for="prop-header-color" class="form-label small">Kolor nagĹ‚Ăłwka</label>
                    <input type="color" class="form-control form-control-sm" id="prop-header-color" value="${element.headerColor || '#000000'}">
                </div>
            </div>
            
            <div class="property-group">
                <label for="prop-item-spacing" class="form-label">OdstÄ™py miÄ™dzy elementami</label>
                <input type="number" class="form-control form-control-sm" id="prop-item-spacing" value="${element.itemSpacing || 10}" min="0" max="50">
            </div>
        `;
    }

    /**
     * Get element type label
     */
    getElementTypeLabel(type) {
        const labels = {
            'text': 'Tekst',
            'image': 'Obraz',
            'rectangle': 'ProstokÄ…t',
            'line': 'Linia',
            'qr-code': 'Kod QR',
            'product-list': 'Lista produktĂłw'
        };
        return labels[type] || type;
    }

    /**
     * Bind property change events
     */
    bindPropertyEvents() {
        // Size unit radio buttons
        const sizeUnitRadios = document.querySelectorAll('input[name="size-unit"]');
        sizeUnitRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (this.selectedElement) {
                    this.saveToHistory('zmiana jednostki rozmiaru');
                    this.updateElementSizeValues(this.selectedElement, e.target.value);
                    this.renderCanvas();
                    this.updatePropertiesPanel(); // Refresh the panel to show new values
                    this.markAsModified();
                }
            });
        });

        // Position and size
        ['prop-x', 'prop-y', 'prop-width', 'prop-height', 'prop-z-index'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => this.updateElementProperty());
            }
        });

        // Text properties
        ['prop-content', 'prop-font-family', 'prop-font-size', 'prop-color', 'prop-font-weight', 'prop-text-align'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => this.updateElementProperty());
            }
        });

        // Image properties
        ['prop-src', 'prop-object-fit'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => this.updateElementProperty());
            }
        });

        // Rectangle properties
        ['prop-bg-color', 'prop-border-width', 'prop-border-color'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => this.updateElementProperty());
            }
        });

        // Line properties
        ['prop-stroke-width', 'prop-stroke-color'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => this.updateElementProperty());
            }
        });

        // QR code properties
        const qrDataInput = document.getElementById('prop-qr-data');
        if (qrDataInput) {
            qrDataInput.addEventListener('change', () => this.updateElementProperty());
        }

        // Product list properties
        const productListProperties = [
            'prop-collection-id', 'prop-header-text', 'prop-columns', 'prop-rows-per-page',
            'prop-show-header', 'prop-show-images', 'prop-show-prices', 'prop-show-descriptions',
            'prop-list-font-family', 'prop-list-font-size', 'prop-header-font-size', 
            'prop-list-text-color', 'prop-header-color', 'prop-item-spacing'
        ];
        
        productListProperties.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('change', () => this.updateElementProperty());
            }
        });

        // Dynamic fields checkboxes for product list
        const dynamicFieldsContainer = document.getElementById('prop-display-fields');
        if (dynamicFieldsContainer) {
            const checkboxes = dynamicFieldsContainer.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => this.updateProductListProperties());
            });
        }
    }

    /**
     * Update element property from form
     */
    updateElementProperty() {
        if (!this.selectedElement) return;

        // Save state before modification
        this.saveToHistory('modyfikacja elementu');

        // Basic properties
        const x = document.getElementById('prop-x');
        const y = document.getElementById('prop-y');
        const width = document.getElementById('prop-width');
        const height = document.getElementById('prop-height');
        const zIndex = document.getElementById('prop-z-index');

        if (x) this.selectedElement.x = parseInt(x.value) || 0;
        if (y) this.selectedElement.y = parseInt(y.value) || 0;
        if (zIndex) this.selectedElement.zIndex = parseInt(zIndex.value) || 1;

        // Handle width and height based on current unit
        if (width && height) {
            const widthValue = parseFloat(width.value) || 0;
            const heightValue = parseFloat(height.value) || 0;
            
            if (this.selectedElement.sizeUnit === '%') {
                // Store percentage values and convert to pixels for internal use
                this.selectedElement.widthPercent = widthValue;
                this.selectedElement.heightPercent = heightValue;
                this.selectedElement.width = this.percentToPixels(widthValue, 'width');
                this.selectedElement.height = this.percentToPixels(heightValue, 'height');
            } else {
                // Store pixel values directly
                this.selectedElement.width = Math.round(widthValue);
                this.selectedElement.height = Math.round(heightValue);
                // Update percentage equivalents
                this.selectedElement.widthPercent = this.pixelsToPercent(this.selectedElement.width, 'width');
                this.selectedElement.heightPercent = this.pixelsToPercent(this.selectedElement.height, 'height');
            }
        }

        // Type-specific properties
        switch (this.selectedElement.type) {
            case 'text':
                this.updateTextProperties();
                break;
            case 'image':
                this.updateImageProperties();
                break;
            case 'rectangle':
                this.updateRectangleProperties();
                break;
            case 'line':
                this.updateLineProperties();
                break;
            case 'qr-code':
                this.updateQRCodeProperties();
                break;
            case 'product-list':
                this.updateProductListProperties();
                break;
        }

        this.snapToGrid(this.selectedElement);
        this.renderCanvas();
        this.markAsModified();
    }

    /**
     * Update text properties
     */
    updateTextProperties() {
        const content = document.getElementById('prop-content');
        const fontFamily = document.getElementById('prop-font-family');
        const fontSize = document.getElementById('prop-font-size');
        const color = document.getElementById('prop-color');
        const fontWeight = document.getElementById('prop-font-weight');
        const textAlign = document.getElementById('prop-text-align');

        if (content) this.selectedElement.content = content.value;
        if (fontFamily) this.selectedElement.fontFamily = fontFamily.value;
        if (fontSize) this.selectedElement.fontSize = parseInt(fontSize.value) || 12;
        if (color) this.selectedElement.color = color.value;
        if (fontWeight) this.selectedElement.fontWeight = fontWeight.value;
        if (textAlign) this.selectedElement.textAlign = textAlign.value;
    }

    /**
     * Update image properties
     */
    updateImageProperties() {
        const src = document.getElementById('prop-src');
        const objectFit = document.getElementById('prop-object-fit');

        if (src) this.selectedElement.src = src.value;
        if (objectFit) this.selectedElement.objectFit = objectFit.value;
    }

    /**
     * Update rectangle properties
     */
    updateRectangleProperties() {
        const bgColor = document.getElementById('prop-bg-color');
        const borderWidth = document.getElementById('prop-border-width');
        const borderColor = document.getElementById('prop-border-color');

        if (bgColor) this.selectedElement.backgroundColor = bgColor.value;
        if (borderWidth) this.selectedElement.borderWidth = parseInt(borderWidth.value) || 0;
        if (borderColor) this.selectedElement.borderColor = borderColor.value;
    }

    /**
     * Update line properties
     */
    updateLineProperties() {
        const strokeWidth = document.getElementById('prop-stroke-width');
        const strokeColor = document.getElementById('prop-stroke-color');

        if (strokeWidth) this.selectedElement.strokeWidth = parseInt(strokeWidth.value) || 1;
        if (strokeColor) this.selectedElement.strokeColor = strokeColor.value;
    }

    /**
     * Update QR code properties
     */
    updateQRCodeProperties() {
        const qrData = document.getElementById('prop-qr-data');
        if (qrData) this.selectedElement.data = qrData.value;
    }

    /**
     * Update product list properties
     */
    updateProductListProperties() {
        console.log('🔧 updateProductListProperties called');
        
        const collectionId = document.getElementById('prop-collection-id');
        const headerText = document.getElementById('prop-header-text');
        const columns = document.getElementById('prop-columns');
        const rowsPerPage = document.getElementById('prop-rows-per-page');
        const showHeader = document.getElementById('prop-show-header');
        const showImages = document.getElementById('prop-show-images');
        const showPrices = document.getElementById('prop-show-prices');
        const showDescriptions = document.getElementById('prop-show-descriptions');
        const fontFamily = document.getElementById('prop-list-font-family');
        const fontSize = document.getElementById('prop-list-font-size');
        const headerFontSize = document.getElementById('prop-header-font-size');
        const textColor = document.getElementById('prop-list-text-color');
        const headerColor = document.getElementById('prop-header-color');
        const itemSpacing = document.getElementById('prop-item-spacing');

        // Zapisz poprzednie wartości dla porównania
        const previousValues = {
            collectionId: this.selectedElement.collectionId,
            columns: this.selectedElement.columns,
            rowsPerPage: this.selectedElement.rowsPerPage,
            showHeader: this.selectedElement.showHeader,
            showImages: this.selectedElement.showImages,
            showPrices: this.selectedElement.showPrices,
            showDescriptions: this.selectedElement.showDescriptions,
            itemSpacing: this.selectedElement.itemSpacing,
            headerText: this.selectedElement.headerText,
            displayFields: JSON.stringify(this.selectedElement.displayFields || [])
        };

        if (collectionId) this.selectedElement.collectionId = collectionId.value;
        if (headerText) this.selectedElement.headerText = headerText.value;
        if (columns) this.selectedElement.columns = parseInt(columns.value) || 2;
        if (rowsPerPage) this.selectedElement.rowsPerPage = parseInt(rowsPerPage.value) || 15;
        if (showHeader) this.selectedElement.showHeader = showHeader.checked;
        if (showImages) this.selectedElement.showImages = showImages.checked;
        if (showPrices) this.selectedElement.showPrices = showPrices.checked;
        if (showDescriptions) this.selectedElement.showDescriptions = showDescriptions.checked;
        if (fontFamily) this.selectedElement.fontFamily = fontFamily.value;
        if (fontSize) this.selectedElement.fontSize = parseInt(fontSize.value) || 10;
        if (headerFontSize) this.selectedElement.headerFontSize = parseInt(headerFontSize.value) || 14;
        if (textColor) this.selectedElement.textColor = textColor.value;
        if (headerColor) this.selectedElement.headerColor = headerColor.value;
        if (itemSpacing) this.selectedElement.itemSpacing = parseInt(itemSpacing.value) || 10;

        // Update dynamic fields selection
        const fieldCheckboxes = document.querySelectorAll('#prop-display-fields input[type="checkbox"]:checked');
        this.selectedElement.displayFields = Array.from(fieldCheckboxes).map(cb => cb.value);
        
        console.log('🔧 Selected displayFields:', this.selectedElement.displayFields);
        
        // Ensure 'name' is always included
        if (!this.selectedElement.displayFields.includes('name')) {
            this.selectedElement.displayFields.unshift('name');
        }

        console.log('🔧 Final displayFields:', this.selectedElement.displayFields);

        // 🔧 NAPRAWIŁEM: Sprawdź wszystkie zmiany które wpływają na wygląd
        const hasVisualChanges = (
            previousValues.collectionId !== this.selectedElement.collectionId ||
            previousValues.columns !== this.selectedElement.columns ||
            previousValues.rowsPerPage !== this.selectedElement.rowsPerPage ||
            previousValues.showHeader !== this.selectedElement.showHeader ||
            previousValues.showImages !== this.selectedElement.showImages ||
            previousValues.showPrices !== this.selectedElement.showPrices ||
            previousValues.showDescriptions !== this.selectedElement.showDescriptions ||
            previousValues.itemSpacing !== this.selectedElement.itemSpacing ||
            previousValues.headerText !== this.selectedElement.headerText ||
            previousValues.displayFields !== JSON.stringify(this.selectedElement.displayFields || [])
        );

        console.log('🔧 hasVisualChanges:', hasVisualChanges);
        console.log('🔧 previousValues.displayFields:', previousValues.displayFields);
        console.log('🔧 currentValues.displayFields:', JSON.stringify(this.selectedElement.displayFields || []));

        // Odświeżaj podgląd przy KAŻDEJ zmianie wizualnej
        if (hasVisualChanges) {
            console.log('🔧 Refreshing product list element due to visual changes');
            this.refreshProductListElement();
        }
    }

    /**
     * Refresh product list element after collection change
     */
    refreshProductListElement() {
        if (this.selectedElement && this.selectedElement.type === 'product-list') {
            const elementContainer = document.querySelector(`[data-element-index="${this.selectedElementIndex}"] .element-content`);
            if (elementContainer) {
                this.renderProductListContent(elementContainer, this.selectedElement).catch(error => {
                    console.error('Error refreshing product list:', error);
                });
            }
            // Also refresh the entire canvas to ensure consistency
            this.renderCanvas();
        }
    }

    /**
     * Update elements list in sidebar
     */
    updateElementsList() {
        const list = document.getElementById('elements-list');
        if (!list) return;

        const elements = this.template.sections[this.currentSection].elements;
        
        if (elements.length === 0) {
            list.innerHTML = '<div class="text-muted text-center p-3">Brak elementĂłw</div>';
            return;
        }

        list.innerHTML = elements.map((element, index) => `
            <div class="element-item-list ${this.selectedElement === element ? 'selected' : ''}" 
                 onclick="pdfEditor.selectElementByIndex(${index})">
                <i class="fas fa-${this.getElementIcon(element.type)} me-2"></i>
                ${this.getElementTypeLabel(element.type)}
                <button type="button" class="btn btn-sm btn-outline-danger ms-auto" 
                        onclick="event.stopPropagation(); pdfEditor.deleteElementByIndex(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    /**
     * Get element icon
     */
    getElementIcon(type) {
        const icons = {
            'text': 'font',
            'image': 'image',
            'rectangle': 'square',
            'line': 'minus',
            'qr-code': 'qrcode'
        };
        return icons[type] || 'cube';
    }

    /**
     * Select element by index
     */
    selectElementByIndex(index) {
        const elements = this.template.sections[this.currentSection].elements;
        if (elements[index]) {
            this.selectElement(elements[index]);
        }
    }

    /**
     * Delete selected element
     */
    deleteSelectedElement() {
        if (!this.selectedElement) return;

        const elements = this.template.sections[this.currentSection].elements;
        const index = elements.indexOf(this.selectedElement);
        
        if (index !== -1) {
            // Save state before deletion
            this.saveToHistory('usuniÄ™cie elementu');
            
            elements.splice(index, 1);
            this.selectedElement = null;
            this.updatePropertiesPanel();
            this.renderCanvas();
            this.markAsModified();
        }
    }

    /**
     * Delete element by index
     */
    deleteElementByIndex(index) {
        const elements = this.template.sections[this.currentSection].elements;
        if (elements[index]) {
            // Save state before deletion
            this.saveToHistory('usuniÄ™cie elementu');
            
            if (this.selectedElement === elements[index]) {
                this.selectedElement = null;
                this.updatePropertiesPanel();
            }
            elements.splice(index, 1);
            this.renderCanvas();
            this.markAsModified();
        }
    }

    /**
     * Center selected element horizontally
     */
    centerElementHorizontally() {
        if (!this.selectedElement) return;

        const canvas = document.getElementById('design-canvas');
        if (!canvas) return;

        const format = this.template.printSettings.format;
        const dpi = this.template.printSettings.dpi;
        const mmToPx = dpi / 25.4;
        const canvasWidth = format.width * mmToPx;
        const elementWidth = this.selectedElement.width || 100;
        
        this.selectedElement.x = (canvasWidth - elementWidth) / 2;
        
        this.updatePropertiesPanel();
        this.renderCanvas();
        this.markAsModified();
        
        console.log('PDFEditor: Element centered horizontally at x:', this.selectedElement.x);
    }

    /**
     * Center selected element vertically  
     */
    centerElementVertically() {
        if (!this.selectedElement) return;

        const canvas = document.getElementById('design-canvas');
        if (!canvas) return;

        const format = this.template.printSettings.format;
        const dpi = this.template.printSettings.dpi;
        const mmToPx = dpi / 25.4;
        const canvasHeight = format.height * mmToPx;
        const elementHeight = this.selectedElement.height || 20;
        
        this.selectedElement.y = (canvasHeight - elementHeight) / 2;
        
        this.updatePropertiesPanel();
        this.renderCanvas();
        this.markAsModified();
        
        console.log('PDFEditor: Element centered vertically at y:', this.selectedElement.y);
    }

    /**
     * Center selected element both horizontally and vertically
     */
    centerElementBoth() {
        if (!this.selectedElement) return;

        const canvas = document.getElementById('design-canvas');
        if (!canvas) return;

        const format = this.template.printSettings.format;
        const dpi = this.template.printSettings.dpi;
        const mmToPx = dpi / 25.4;
        const canvasWidth = format.width * mmToPx;
        const canvasHeight = format.height * mmToPx;
        const elementWidth = this.selectedElement.width || 100;
        const elementHeight = this.selectedElement.height || 20;
        
        this.selectedElement.x = (canvasWidth - elementWidth) / 2;
        this.selectedElement.y = (canvasHeight - elementHeight) / 2;
        
        this.updatePropertiesPanel();
        this.renderCanvas();
        this.markAsModified();
        
        console.log('PDFEditor: Element centered both ways at:', this.selectedElement.x, this.selectedElement.y);
    }

    /**
     * Change zoom level
     */
    changeZoom(factor) {
        this.zoom *= factor;
        this.zoom = Math.max(0.1, Math.min(3, this.zoom)); // Limit zoom range
        
        document.getElementById('zoom-level').textContent = Math.round(this.zoom * 100) + '%';
        
        this.updateCanvasSize();
        this.renderCanvas();
    }

    /**
     * Fit canvas to screen
     */
    fitToScreen() {
        const container = document.querySelector('.canvas-container');
        const canvas = document.getElementById('design-canvas');
        
        if (!container || !canvas) return;

        const containerWidth = container.clientWidth - 40; // Account for padding
        const containerHeight = container.clientHeight - 40;
        
        const format = this.template.printSettings.format;
        const aspectRatio = format.width / format.height;
        
        let newZoom;
        if (containerWidth / containerHeight > aspectRatio) {
            // Height is the limiting factor
            newZoom = containerHeight / (format.height * this.template.printSettings.dpi / 25.4);
        } else {
            // Width is the limiting factor
            newZoom = containerWidth / (format.width * this.template.printSettings.dpi / 25.4);
        }
        
        this.zoom = Math.max(0.1, Math.min(2, newZoom));
        document.getElementById('zoom-level').textContent = Math.round(this.zoom * 100) + '%';
        
        this.updateCanvasSize();
        this.renderCanvas();
    }

    /**
     * Toggle grid visibility
     */
    toggleGrid() {
        this.showGrid = !this.showGrid;
        const button = document.getElementById('toggle-grid');
        if (button) {
            button.classList.toggle('active', this.showGrid);
        }
        this.renderCanvas();
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.saveTemplate();
                    break;
                case 'z':
                    e.preventDefault();
                    if (e.shiftKey) {
                        this.redo(); // Ctrl+Shift+Z for redo
                    } else {
                        this.undo(); // Ctrl+Z for undo
                    }
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo(); // Ctrl+Y for redo (alternative)
                    break;
            }
        }

        if (this.selectedElement) {
            switch (e.key) {
                case 'Delete':
                case 'Backspace':
                    e.preventDefault();
                    this.deleteSelectedElement();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (!this.isMovingWithKeys) {
                        this.saveToHistory('przemieszczenie strzaĹ‚kami');
                        this.isMovingWithKeys = true;
                        setTimeout(() => { this.isMovingWithKeys = false; }, 1000);
                    }
                    this.selectedElement.y = Math.max(0, this.selectedElement.y - (e.shiftKey ? 10 : 1));
                    this.snapToGrid(this.selectedElement);
                    this.updatePropertiesPanel();
                    this.renderCanvas();
                    this.markAsModified();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (!this.isMovingWithKeys) {
                        this.saveToHistory('przemieszczenie strzaĹ‚kami');
                        this.isMovingWithKeys = true;
                        setTimeout(() => { this.isMovingWithKeys = false; }, 1000);
                    }
                    this.selectedElement.y += (e.shiftKey ? 10 : 1);
                    this.snapToGrid(this.selectedElement);
                    this.updatePropertiesPanel();
                    this.renderCanvas();
                    this.markAsModified();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    if (!this.isMovingWithKeys) {
                        this.saveToHistory('przemieszczenie strzaĹ‚kami');
                        this.isMovingWithKeys = true;
                        setTimeout(() => { this.isMovingWithKeys = false; }, 1000);
                    }
                    this.selectedElement.x = Math.max(0, this.selectedElement.x - (e.shiftKey ? 10 : 1));
                    this.snapToGrid(this.selectedElement);
                    this.updatePropertiesPanel();
                    this.renderCanvas();
                    this.markAsModified();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    if (!this.isMovingWithKeys) {
                        this.saveToHistory('przemieszczenie strzaĹ‚kami');
                        this.isMovingWithKeys = true;
                        setTimeout(() => { this.isMovingWithKeys = false; }, 1000);
                    }
                    this.selectedElement.x += (e.shiftKey ? 10 : 1);
                    this.snapToGrid(this.selectedElement);
                    this.updatePropertiesPanel();
                    this.renderCanvas();
                    this.markAsModified();
                    break;
            }
        }
    }

    /**
     * Save template
     */
    async saveTemplate() {
        try {
            this.template.updatedAt = new Date().toISOString();
            
            // Debug: Log template structure before saving
            console.log('PDFEditor: Saving template:', JSON.stringify(this.template, null, 2));
            console.log('PDFEditor: Current section elements count:', this.template.sections[this.currentSection].elements.length);
            console.log('PDFEditor: template.id:', this.template.id);
            console.log('PDFEditor: isEditing:', this.isEditing);
            console.log('PDFEditor: Will use UPDATE?', !!(this.template.id && this.isEditing));
            
            let response;
            if (this.template.id && this.isEditing) {
                // Update existing template
                console.log('PDFEditor: Using PUT to update existing template');
                response = await api.put(`/pdf/templates/${this.template.id}`, this.template);
            } else {
                // Create new template
                console.log('PDFEditor: Using POST to create new template');
                response = await api.post('/pdf/templates', this.template);
                if (response.success) {
                    this.template.id = response.data.id;
                    this.isEditing = true;
                    // Update URL with template ID
                    window.history.replaceState({}, '', `?id=${this.template.id}`);
                }
            }

            if (response.success) {
                this.showAlert('Szablon zostaĹ‚ zapisany pomyĹ›lnie!', 'success');
                this.markAsSaved();
            } else {
                throw new Error(response.error || 'BĹ‚Ä…d podczas zapisywania szablonu');
            }
        } catch (error) {
            console.error('Error saving template:', error);
            this.showAlert('BĹ‚Ä…d podczas zapisywania szablonu: ' + error.message, 'danger');
        }
    }

    /**
     * Preview PDF
     */
    async previewPDF() {
        try {
            if (!this.template.id) {
                this.showAlert('Zapisz szablon przed generowaniem podglÄ…du', 'warning');
                return;
            }

            // Automatically save template before preview to ensure latest changes are included
            this.showAlert('Zapisywanie zmian przed podglÄ…dem...', 'info');
            console.log('PDFEditor: Saving template before preview...');
            await this.saveTemplate();
            console.log('PDFEditor: Template saved, generating preview...');

            this.showAlert('Generowanie podglÄ…du PDF...', 'info');
            
            // Add timestamp to prevent caching issues
            const timestamp = new Date().getTime();
            const response = await api.get(`/pdf/templates/${this.template.id}/preview?t=${timestamp}`);
            
            if (response.success) {
                // Open PDF in new window
                const pdfUrl = response.data.downloadUrl;
                window.open(pdfUrl, '_blank');
                this.showAlert('PodglÄ…d PDF zostaĹ‚ wygenerowany!', 'success');
            } else {
                throw new Error(response.error || 'BĹ‚Ä…d podczas generowania podglÄ…du');
            }
        } catch (error) {
            console.error('Error previewing PDF:', error);
            this.showAlert('BĹ‚Ä…d podczas generowania podglÄ…du: ' + error.message, 'danger');
        }
    }

    /**
     * Mark template as modified
     */
    markAsModified() {
        document.title = '* ' + document.title.replace(/^\* /, '');
        const saveBtn = document.getElementById('save-template');
        if (saveBtn) {
            saveBtn.classList.add('btn-warning');
            saveBtn.classList.remove('btn-primary');
        }
    }

    /**
     * Mark template as saved
     */
    markAsSaved() {
        document.title = document.title.replace(/^\* /, '');
        const saveBtn = document.getElementById('save-template');
        if (saveBtn) {
            saveBtn.classList.add('btn-primary');
            saveBtn.classList.remove('btn-warning');
        }
    }

    /**
     * Show alert message
     */
    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alert-container');
        if (!alertContainer) {
            console.log(message);
            return;
        }

        const alertId = 'alert-' + Date.now();
        const alertHtml = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        alertContainer.insertAdjacentHTML('beforeend', alertHtml);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                alertElement.classList.remove('show');
                setTimeout(() => alertElement.remove(), 150);
            }
        }, 5000);
    }

    /**
     * Save current state to history for Undo/Redo
     */
    saveToHistory(action = 'change') {
        if (!this.template) return;
        
        // Deep clone the template to avoid reference issues
        const templateState = JSON.parse(JSON.stringify(this.template));
        
        // Remove any items after current index (when we do new action after undo)
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // Add new state to history
        this.history.push({
            template: templateState,
            selectedElementId: this.selectedElement ? this.selectedElement.id : null,
            currentSection: this.currentSection,
            action: action,
            timestamp: Date.now()
        });
        
        // Limit history size
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
        
        // Update UI buttons state
        this.updateUndoRedoButtons();
        
        console.log(`History saved: ${action}, total states: ${this.history.length}, current index: ${this.historyIndex}`);
    }

    /**
     * Undo last action
     */
    undo() {
        if (this.historyIndex <= 0) {
            console.log('Nothing to undo');
            return;
        }
        
        this.historyIndex--;
        this.restoreFromHistory();
        this.showAlert('CofniÄ™to ostatniÄ… zmianÄ™', 'info');
        console.log(`Undo performed, current index: ${this.historyIndex}`);
    }

    /**
     * Redo last undone action
     */
    redo() {
        if (this.historyIndex >= this.history.length - 1) {
            console.log('Nothing to redo');
            return;
        }
        
        this.historyIndex++;
        this.restoreFromHistory();
        this.showAlert('PrzywrĂłcono zmianÄ™', 'info');
        console.log(`Redo performed, current index: ${this.historyIndex}`);
    }

    /**
     * Restore template state from history
     */
    restoreFromHistory() {
        if (this.historyIndex < 0 || this.historyIndex >= this.history.length) return;
        
        const historyState = this.history[this.historyIndex];
        
        // Restore template state
        this.template = JSON.parse(JSON.stringify(historyState.template));
        
        // Restore current section
        if (historyState.currentSection !== this.currentSection) {
            this.switchSection(historyState.currentSection);
        }
        
        // Restore selected element
        this.selectedElement = null;
        if (historyState.selectedElementId) {
            const elements = this.template.sections[this.currentSection].elements;
            this.selectedElement = elements.find(el => el.id === historyState.selectedElementId) || null;
        }
        
        // Update UI
        this.renderCanvas();
        this.updatePropertiesPanel();
        this.updateElementsList();
        this.updateUndoRedoButtons();
        this.markAsModified();
    }

    /**
     * Update Undo/Redo buttons state
     */
    updateUndoRedoButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) {
            undoBtn.disabled = this.historyIndex <= 0;
            undoBtn.title = this.historyIndex > 0 ? 
                `Cofnij: ${this.history[this.historyIndex]?.action || 'zmianÄ™'}` : 
                'Brak akcji do cofniÄ™cia';
        }
        
        if (redoBtn) {
            redoBtn.disabled = this.historyIndex >= this.history.length - 1;
            redoBtn.title = this.historyIndex < this.history.length - 1 ? 
                `PrzywrĂłÄ‡: ${this.history[this.historyIndex + 1]?.action || 'zmianÄ™'}` : 
                'Brak akcji do przywrĂłcenia';
        }
    }

    /**
     * Clear history (useful when loading new template)
     */
    clearHistory() {
        this.history = [];
        this.historyIndex = -1;
        this.updateUndoRedoButtons();
        console.log('History cleared');
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // ========================================
    async loadCollectionsForProductList() {
        try {
            const response = await fetch('/api/collections');
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    const select = document.getElementById('prop-collection-id');
                    // Clear existing options except the first one
                    select.innerHTML = '<option value="">Wybierz kolekcjÄ™</option>';
                    
                    data.data.forEach(collection => {
                        const option = document.createElement('option');
                        option.value = collection._id;
                        option.textContent = collection.name;
                        select.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading collections for product list:', error);
        }
    }

    /**
     * Download JSON data as file
     */
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
}

// Global instance
let pdfEditor;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('design-canvas')) {
        pdfEditor = new PDFTemplateEditor();
    }
});
