/**
 * ContentSectionManager - Odizolowana klasa do zarządzania sekcją zawartości PDF
 * 
 * Ta klasa jest w pełni odizolowana od reszty aplikacji i zarządza:
 * - Ustawieniami sekcji zawartości
 * - Renderowaniem canvas z produktami
 * - Event listenerami dla formularza
 * - Logiczką układu produktów
 */
class ContentSectionManager {
    constructor(pdfEditor) {
        console.log('ContentSectionManager: Initializing...');
        
        // Referencja do głównego edytora (tylko do canvas i template)
        this.pdfEditor = pdfEditor;
        
        // Własny stan sekcji content
        this.settings = {
            collectionId: '',
            productsCount: 12,
            columns: 3,
            spacing: 15
        };
        
        // Cache dla kolekcji i win
        this.collections = [];
        this.wines = [];
        
        // Flaga inicjalizacji
        this.initialized = false;
        this.eventsBound = false;
        
        // Throttling dla real-time preview
        this.renderTimeout = null;
        this.renderTimeoutQuick = null;
        this.renderDelay = 500; // 500ms delay dla smooth UX
        this.renderDelayQuick = 200; // 200ms delay dla range sliders
        
        console.log('ContentSectionManager: Constructor completed');
    }
    
    /**
     * Inicjalizacja menedżera sekcji zawartości
     */
    async init() {
        console.log('ContentSectionManager: Starting initialization...');
        
        try {
            await this.loadCollections();
            this.bindEvents();
            this.updateUI();
            this.initialized = true;
            console.log('ContentSectionManager: Initialization completed successfully');
        } catch (error) {
            console.error('ContentSectionManager: Initialization failed:', error);
        }
    }
    
    /**
     * Ładowanie kolekcji z API
     */
    async loadCollections() {
        try {
            console.log('ContentSectionManager: Loading collections...');
            
            // Sprawdź czy api jest dostępne
            if (typeof api === 'undefined') {
                console.error('ContentSectionManager: API not available');
                return;
            }
            
            const response = await api.get('/collections');
            if (response.success && response.data) {
                this.collections = response.data;
                console.log(`ContentSectionManager: Loaded ${this.collections.length} collections`);
                this.populateCollectionSelect();
            } else {
                console.warn('ContentSectionManager: No collections loaded');
                this.collections = [];
            }
        } catch (error) {
            console.error('ContentSectionManager: Error loading collections:', error);
            this.collections = [];
        }
    }
    
    /**
     * Wypełnienie selecta kolekcji
     */
    populateCollectionSelect() {
        const select = document.getElementById('content-collection');
        if (!select) {
            console.warn('ContentSectionManager: Collection select not found');
            return;
        }
        
        // Wyczyść opcje (zachowaj pierwszą - placeholder)
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Dodaj kolekcje
        this.collections.forEach(collection => {
            const option = document.createElement('option');
            option.value = collection.id;
            option.textContent = collection.name;
            select.appendChild(option);
        });
        
        console.log('ContentSectionManager: Collection select populated');
    }
    
    /**
     * Bindowanie event listenerów
     */
    bindEvents() {
        if (this.eventsBound) {
            console.log('ContentSectionManager: Events already bound, skipping');
            return;
        }
        
        console.log('ContentSectionManager: Binding events...');
        
        // Collection select
        const collectionSelect = document.getElementById('content-collection');
        if (collectionSelect) {
            collectionSelect.addEventListener('change', (e) => {
                this.settings.collectionId = e.target.value;
                console.log('ContentSectionManager: Collection changed to:', this.settings.collectionId);
                // Natychmiastowe renderowanie dla zmiany kolekcji (większa zmiana)
                this.renderContent();
            });
        }
        
        // Products count
        const productsCount = document.getElementById('content-products-count');
        if (productsCount) {
            productsCount.addEventListener('input', (e) => {
                this.settings.productsCount = parseInt(e.target.value) || 12;
                console.log('ContentSectionManager: Products count changed to:', this.settings.productsCount);
                this.onSettingsChange();
            });
        }
        
        // Columns
        const columns = document.getElementById('content-columns');
        if (columns) {
            columns.addEventListener('input', (e) => {
                this.settings.columns = parseInt(e.target.value) || 3;
                console.log('ContentSectionManager: Columns changed to:', this.settings.columns);
                // Szybki throttling dla często zmienianych wartości
                this.onSettingsChangeQuick();
            });
        }
        
        // Spacing range
        const spacing = document.getElementById('content-spacing');
        const spacingValue = document.getElementById('spacing-value');
        if (spacing) {
            spacing.addEventListener('input', (e) => {
                this.settings.spacing = parseInt(e.target.value) || 15;
                if (spacingValue) {
                    spacingValue.textContent = `${this.settings.spacing}px`;
                }
                console.log('ContentSectionManager: Spacing changed to:', this.settings.spacing);
                // Szybszy throttling dla range slider (200ms)
                this.onSettingsChangeQuick();
            });
        }
        
        // Apply button
        const applyBtn = document.getElementById('content-apply');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                console.log('ContentSectionManager: Apply button clicked');
                this.renderContent();
            });
        }
        
        // Reset button
        const resetBtn = document.getElementById('content-reset');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('ContentSectionManager: Reset button clicked');
                this.resetSettings();
            });
        }
        
        this.eventsBound = true;
        console.log('ContentSectionManager: Events bound successfully');
    }
    
    /**
     * Aktualizacja UI na podstawie aktualnych ustawień
     */
    updateUI() {
        console.log('ContentSectionManager: Updating UI...');
        
        // Collection select
        const collectionSelect = document.getElementById('content-collection');
        if (collectionSelect) {
            collectionSelect.value = this.settings.collectionId;
        }
        
        // Products count
        const productsCount = document.getElementById('content-products-count');
        if (productsCount) {
            productsCount.value = this.settings.productsCount;
        }
        
        // Columns
        const columns = document.getElementById('content-columns');
        if (columns) {
            columns.value = this.settings.columns;
        }
        
        // Spacing
        const spacing = document.getElementById('content-spacing');
        const spacingValue = document.getElementById('spacing-value');
        if (spacing) {
            spacing.value = this.settings.spacing;
            if (spacingValue) {
                spacingValue.textContent = `${this.settings.spacing}px`;
            }
        }
        
        console.log('ContentSectionManager: UI updated');
    }
    
    /**
     * Callback wywoływany przy zmianie ustawień
     */
    onSettingsChange() {
        console.log('ContentSectionManager: Settings changed:', this.settings);
        
        // Throttled real-time preview - anuluj poprzedni timeout
        if (this.renderTimeout) {
            clearTimeout(this.renderTimeout);
        }
        
        // Ustaw nowy timeout dla smooth real-time preview
        this.renderTimeout = setTimeout(() => {
            console.log('ContentSectionManager: Executing throttled render...');
            this.renderContent();
            this.renderTimeout = null;
        }, this.renderDelay);
    }

    /**
     * Szybszy callback dla range sliders
     */
    onSettingsChangeQuick() {
        console.log('ContentSectionManager: Settings changed (quick):', this.settings);
        
        // Szybszy throttled real-time preview - anuluj poprzedni timeout
        if (this.renderTimeoutQuick) {
            clearTimeout(this.renderTimeoutQuick);
        }
        
        // Ustaw nowy timeout dla responsywnego real-time preview
        this.renderTimeoutQuick = setTimeout(() => {
            console.log('ContentSectionManager: Executing quick throttled render...');
            this.renderContent();
            this.renderTimeoutQuick = null;
        }, this.renderDelayQuick);
    }
    
    /**
     * Reset ustawień do domyślnych wartości
     */
    resetSettings() {
        console.log('ContentSectionManager: Resetting settings...');
        
        this.settings = {
            collectionId: '',
            productsCount: 12,
            columns: 3,
            spacing: 15
        };
        
        this.updateUI();
        this.renderContent();
        
        console.log('ContentSectionManager: Settings reset completed');
    }
    
    /**
     * Renderowanie zawartości na canvas
     */
    async renderContent() {
        console.log('ContentSectionManager: Starting content rendering...');
        console.log('ContentSectionManager: Current settings:', this.settings);
        
        // Sprawdź czy jesteśmy w sekcji content
        if (!this.pdfEditor || this.pdfEditor.currentSection !== 'content') {
            console.log('ContentSectionManager: Not in content section, skipping render');
            return;
        }
        
        try {
            // Załaduj wina z wybranej kolekcji
            await this.loadWinesFromCollection();
            
            // Renderuj na canvas
            await this.renderWinesOnCanvas();
            
            console.log('ContentSectionManager: Content rendering completed');
        } catch (error) {
            console.error('ContentSectionManager: Error during content rendering:', error);
        }
    }
    
    /**
     * Ładowanie win z wybranej kolekcji
     */
    async loadWinesFromCollection() {
        if (!this.settings.collectionId) {
            console.log('ContentSectionManager: No collection selected');
            this.wines = [];
            return;
        }
        
        try {
            console.log('ContentSectionManager: Loading wines from collection:', this.settings.collectionId);
            
            // Pobierz kolekcję
            const response = await api.get(`/collections/${this.settings.collectionId}`);
            if (!response.success || !response.data) {
                console.warn('ContentSectionManager: Failed to load collection');
                this.wines = [];
                return;
            }
            
            const collection = response.data;
            
            // Pobierz wina z kolekcji
            if (collection.wines && collection.wines.length > 0) {
                const winesResponse = await api.get('/wines');
                if (winesResponse.success && winesResponse.data) {
                    // Filtruj wina należące do kolekcji
                    this.wines = winesResponse.data.filter(wine => 
                        collection.wines.includes(wine.catalogNumber)
                    );
                    console.log(`ContentSectionManager: Loaded ${this.wines.length} wines from collection`);
                } else {
                    this.wines = [];
                }
            } else {
                console.log('ContentSectionManager: Collection has no wines');
                this.wines = [];
            }
        } catch (error) {
            console.error('ContentSectionManager: Error loading wines:', error);
            this.wines = [];
        }
    }
    
    /**
     * Renderowanie win na canvas jako pojedynczy element listy produktów
     */
    async renderWinesOnCanvas() {
        console.log('ContentSectionManager: Rendering wines on canvas...');
        
        // Sprawdź czy mamy dostęp do template
        if (!this.pdfEditor || !this.pdfEditor.template || !this.pdfEditor.template.sections.content) {
            console.error('ContentSectionManager: Template not available');
            return;
        }
        
        const canvas = document.getElementById('design-canvas');
        if (!canvas) {
            console.error('ContentSectionManager: Canvas not found');
            return;
        }
        
        // Pobierz wymiary canvas z atrybutów (nie z canvas.width/height)
        const canvasWidth = parseInt(canvas.getAttribute('data-width')) || 800;
        const canvasHeight = parseInt(canvas.getAttribute('data-height')) || 600;
        
        console.log('ContentSectionManager: Canvas dimensions:', canvasWidth, 'x', canvasHeight);
        
        // Wyczyść istniejące elementy preview z sekcji content
        this.pdfEditor.template.sections.content.elements = 
            this.pdfEditor.template.sections.content.elements.filter(el => !el.isContentPreview);
        
        // Utwórz pojedynczy element reprezentujący listę produktów
        await this.createProductListElement(canvasWidth, canvasHeight);
        
        // Wywołaj renderowanie canvas przez główną klasę
        this.pdfEditor.renderCanvas();
        
        console.log('ContentSectionManager: Canvas rendering completed');
    }

    /**
     * Tworzenie pojedynczego elementu listy produktów
     */
    async createProductListElement(canvasWidth, canvasHeight) {
        const { productsCount, columns, spacing } = this.settings;
        
        if (!this.wines || this.wines.length === 0) {
            // Empty state - pełna szerokość i wysokość canvas
            const emptyElement = {
                id: 'content-product-list',
                type: 'product-list',
                x: 0,
                y: 0,
                width: canvasWidth,
                height: canvasHeight,
                wines: [],
                layout: {
                    columns: columns,
                    spacing: spacing,
                    productsCount: productsCount
                },
                displayMode: 'cards',
                emptyText: 'Brak produktów do wyświetlenia\nWybierz kolekcję aby zobaczyć produkty',
                isContentPreview: true,
                zIndex: 10
            };
            
            this.pdfEditor.template.sections.content.elements.push(emptyElement);
            console.log('ContentSectionManager: Empty product list element created');
            return;
        }
        
        // Lista produktów z danymi - pełna szerokość i wysokość canvas
        const productListElement = {
            id: 'content-product-list',
            type: 'product-list',
            x: 0,
            y: 0,
            width: canvasWidth,
            height: canvasHeight,
            collectionId: this.settings.collectionId,
            columns: columns,
            itemSpacing: spacing,
            rowsPerPage: productsCount,
            showHeader: true,
            headerText: 'Produkty z wybranej kolekcji',
            headerFontSize: 16,
            headerColor: '#212529',
            showImages: true,
            showDescriptions: true,
            showPrices: true,
            fontSize: 10,
            textColor: '#212529',
            fontFamily: 'Arial',
            isContentPreview: true,
            zIndex: 10
        };
        
        this.pdfEditor.template.sections.content.elements.push(productListElement);
        console.log(`ContentSectionManager: Product list element created with ${winesToRender.length} wines`);
    }
    
    /**
     * Dodanie elementu pustego stanu
     */
    addEmptyStateElement(canvasWidth, canvasHeight) {
        const emptyStateElement = {
            id: 'content-empty-state',
            type: 'text',
            x: canvasWidth / 2 - 200,
            y: canvasHeight / 2 - 20,
            width: 400,
            height: 40,
            content: 'Brak produktów do wyświetlenia\nWybierz kolekcję aby zobaczyć produkty',
            fontSize: 16,
            fontFamily: 'Arial',
            fontWeight: 'normal',
            color: '#6c757d',
            textAlign: 'center',
            lineHeight: 1.4,
            zIndex: 1,
            isContentPreview: true
        };
        
        this.pdfEditor.template.sections.content.elements.push(emptyStateElement);
        console.log('ContentSectionManager: Empty state element added');
    }
    
    /**
     * Dodanie elementów win do template
     */
    async addWineElements(canvasWidth, canvasHeight) {
        console.log('ContentSectionManager: Adding wine elements...');
        
        const { productsCount, columns, spacing } = this.settings;
        
        // Ograniczenie liczby win do wyświetlenia
        const winesToRender = this.wines.slice(0, productsCount);
        const actualProductsCount = winesToRender.length;
        
        if (actualProductsCount === 0) {
            this.addEmptyStateElement(canvasWidth, canvasHeight);
            return;
        }
        
        // Obliczanie układu
        const rows = Math.ceil(actualProductsCount / columns);
        
        // Obliczanie rozmiarów produktu z marginesami
        const margin = 20;
        const totalHorizontalSpacing = (columns - 1) * spacing + (margin * 2);
        const totalVerticalSpacing = (rows - 1) * spacing + (margin * 2);
        
        const availableWidth = canvasWidth - totalHorizontalSpacing;
        const availableHeight = canvasHeight - totalVerticalSpacing;
        
        const productWidth = availableWidth / columns;
        const productHeight = availableHeight / rows;
        
        console.log('ContentSectionManager: Grid layout:', {
            productsCount: actualProductsCount,
            columns,
            rows,
            productWidth,
            productHeight,
            spacing,
            margin
        });
        
        // Dodaj każdy produkt jako element template
        for (let i = 0; i < actualProductsCount; i++) {
            const wine = winesToRender[i];
            const row = Math.floor(i / columns);
            const col = i % columns;
            
            const x = margin + col * (productWidth + spacing);
            const y = margin + row * (productHeight + spacing);
            
            this.addWineProductElements(wine, i, x, y, productWidth, productHeight);
        }
        
        console.log('ContentSectionManager: Wine elements added');
    }
    
    /**
     * Dodanie elementów pojedynczego produktu wina
     */
    addWineProductElements(wine, index, x, y, width, height) {
        const padding = 10;
        const contentX = x + padding;
        const contentY = y + padding;
        const contentWidth = width - (padding * 2);
        const contentHeight = height - (padding * 2);
        
        // Tło produktu (prostokąt)
        const backgroundElement = {
            id: `wine-bg-${index}`,
            type: 'rectangle',
            x: x,
            y: y,
            width: width,
            height: height,
            fillColor: '#f8f9fa',
            strokeColor: '#dee2e6',
            strokeWidth: 1,
            zIndex: 1,
            isContentPreview: true
        };
        this.pdfEditor.template.sections.content.elements.push(backgroundElement);
        
        // Nazwa wina
        const name = wine.name || 'Brak nazwy';
        const nameElement = {
            id: `wine-name-${index}`,
            type: 'text',
            x: contentX,
            y: contentY,
            width: contentWidth,
            height: 20,
            content: this.truncateText(name, 20), // Maksymalnie 20 znaków
            fontSize: 12,
            fontFamily: 'Arial',
            fontWeight: 'bold',
            color: '#212529',
            textAlign: 'left',
            zIndex: 2,
            isContentPreview: true
        };
        this.pdfEditor.template.sections.content.elements.push(nameElement);
        
        // Szczepy
        if (wine.szczepy) {
            const szczepaElement = {
                id: `wine-szczepy-${index}`,
                type: 'text',
                x: contentX,
                y: contentY + 18,
                width: contentWidth,
                height: 15,
                content: wine.szczepy,
                fontSize: 10,
                fontFamily: 'Arial',
                fontWeight: 'normal',
                color: '#6c757d',
                textAlign: 'left',
                zIndex: 2,
                isContentPreview: true
            };
            this.pdfEditor.template.sections.content.elements.push(szczepaElement);
        }
        
        // Cena (jeśli dostępna)
        if (wine.price1) {
            const priceElement = {
                id: `wine-price-${index}`,
                type: 'text',
                x: contentX,
                y: contentY + contentHeight - 20,
                width: contentWidth,
                height: 15,
                content: `${wine.price1} zł`,
                fontSize: 11,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                color: '#dc3545',
                textAlign: 'right',
                zIndex: 2,
                isContentPreview: true
            };
            this.pdfEditor.template.sections.content.elements.push(priceElement);
        }
        
        // Catalog number (w prawym górnym rogu)
        if (wine.catalogNumber) {
            const catalogElement = {
                id: `wine-catalog-${index}`,
                type: 'text',
                x: contentX,
                y: contentY,
                width: contentWidth,
                height: 15,
                content: wine.catalogNumber,
                fontSize: 9,
                fontFamily: 'Arial',
                fontWeight: 'normal',
                color: '#6c757d',
                textAlign: 'right',
                zIndex: 2,
                isContentPreview: true
            };
            this.pdfEditor.template.sections.content.elements.push(catalogElement);
        }
    }
    
    /**
     * Obcinanie tekstu do określonej długości
     */
    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) {
            return text || '';
        }
        
        return text.slice(0, maxLength - 3) + '...';
    }
    
    /**
     * Pokazanie/ukrycie panelu ustawień
     */
    show() {
        const panel = document.getElementById('content-settings');
        if (panel) {
            panel.style.display = 'block';
            console.log('ContentSectionManager: Panel shown');
            
            // Bind events jeśli jeszcze nie zostały
            if (!this.eventsBound) {
                this.bindEvents();
            }
            
            // Automatyczne renderowanie zawartości przy pokazaniu panelu
            setTimeout(() => {
                console.log('ContentSectionManager: Auto-rendering content on panel show');
                this.renderContent();
            }, 100);
        }
    }
    
    hide() {
        const panel = document.getElementById('content-settings');
        if (panel) {
            panel.style.display = 'none';
            console.log('ContentSectionManager: Panel hidden');
        }
    }
    
    /**
     * Sprawdzenie czy jest zainicjalizowany
     */
    isInitialized() {
        return this.initialized;
    }
    
    /**
     * Cleanup - czyszczenie zasobów
     */
    cleanup() {
        console.log('ContentSectionManager: Cleaning up resources...');
        this.wines = [];
        this.collections = [];
        this.eventsBound = false;
        this.initialized = false;
    }
}

// Eksport klasy dla użycia w innych plikach
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentSectionManager;
}