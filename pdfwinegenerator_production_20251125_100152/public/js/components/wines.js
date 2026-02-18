// Wine Management Component
class WineManager {
    constructor() {
        this.wines = [];
        this.categories = [];
        this.currentPage = 1;
        this.pageSize = CONFIG.PAGINATION.DEFAULT_PAGE_SIZE;
        this.totalPages = 1;
        this.totalItems = 0;
        this.filters = {};
        this.searchQuery = '';
        this.viewMode = 'table'; // 'table' or 'card'
        this.gridColumns = 4; // Number of columns in card view
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        this.isEditMode = false;
        this.editingWine = null;
        
        // Field configuration functions - uses dynamic data from WineFieldsManager
        this.fieldsConfig = window.WineFieldsConfig;
        
        console.log('WineManager: Constructor - initial fields config:', this.fieldsConfig);
        console.log('WineManager: Window.wineFieldsManager available:', !!window.wineFieldsManager);
        
        this.init();
    }

    /**
     * Clean up modal backdrop - fixes the black background issue
     */
    cleanupModalBackdrop() {
        // Remove any lingering modal backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
            backdrop.remove();
        });
        
        // Remove modal-open class from body
        document.body.classList.remove('modal-open');
        
        // Reset body overflow
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    /**
     * Initialize wine manager
     */
    async init() {
        // Wait for fields configuration to be loaded
        await this.waitForFieldsConfig();
        
        this.initializeTableHeaders();
        this.initializeDynamicForm();
        this.bindEvents();
        this.loadViewMode();
        this.loadGridColumns();
        this.initializePageSizeSelector();
        await this.loadCategories();
        await this.loadWines();
        
        // Listen for field configuration changes
        document.addEventListener('fieldsConfigChanged', () => {
            this.refreshFieldsConfig();
        });
    }

    /**
     * Wait for fields configuration to be available
     */
    async waitForFieldsConfig() {
        console.log('WineManager: Waiting for fields config...');
        let attempts = 0;
        const maxAttempts = 100; // 10 seconds max wait
        
        while (attempts < maxAttempts) {
            if (window.wineFieldsManager && window.wineFieldsManager.fields && window.wineFieldsManager.fields.length > 0) {
                console.log('WineManager: Fields config found, updating global config');
                // Update the global configuration
                window.WineFieldsConfig.WINE_FIELDS_CONFIG = [...window.wineFieldsManager.fields];
                
                // Update local reference
                this.fieldsConfig = window.WineFieldsConfig;
                console.log('WineManager: Using', window.wineFieldsManager.fields.length, 'fields from wineFieldsManager');
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
            if (attempts % 10 === 0) {
                console.log('WineManager: Still waiting for fields config, attempt', attempts);
            }
        }
        
        console.warn('WineManager: Fields configuration not loaded after', maxAttempts * 100, 'ms, using default');
    }

    /**
     * Refresh fields configuration from current wineFieldsManager
     */
    refreshFieldsConfig() {
        console.log('WineManager: refreshFieldsConfig called');
        if (window.wineFieldsManager && window.wineFieldsManager.fields) {
            console.log('WineManager: Updating fields config with', window.wineFieldsManager.fields.length, 'fields');
            
            // Update the global configuration
            window.WineFieldsConfig.WINE_FIELDS_CONFIG = [...window.wineFieldsManager.fields];
            
            // Update local reference 
            this.fieldsConfig = window.WineFieldsConfig;
            
            // Debug: Check if global config was actually updated
            console.log('WineManager: Global WINE_FIELDS_CONFIG now has', window.WineFieldsConfig.WINE_FIELDS_CONFIG.length, 'fields');
            console.log('WineManager: Local fieldsConfig points to object with WINE_FIELDS_CONFIG length:', this.fieldsConfig.WINE_FIELDS_CONFIG.length);
            
            // Refresh UI components that depend on fields
            this.initializeTableHeaders();
            this.initializeDynamicForm();
            this.populateCategoryFilter(); // Update category filter with dynamic options
            this.populateTypeFilter(); // Update type filter with dynamic options
            this.renderWines();
            
            console.log('WineManager: Fields config updated and UI refreshed');
        } else {
            console.log('WineManager: No fields manager or fields available');
        }
    }

    /**
     * Initialize dynamic table headers
     */
    initializeTableHeaders() {
        const headerRow = document.getElementById('winesTableHead');
        if (headerRow) {
            headerRow.innerHTML = this.fieldsConfig.generateTableHeaders();
        } else {
            console.error('WineManager: winesTableHead element not found');
        }
    }

    /**
     * Initialize dynamic form
     */
    initializeDynamicForm() {
        console.log('WineManager: initializeDynamicForm called');
        const formContainer = document.getElementById('wineFormFields');
        if (formContainer) {
            const formFields = this.fieldsConfig.getFormFields();
            console.log('WineManager: Form fields:', formFields.length, formFields.map(f => f.key));
            
            // Debug: Check if category field is present and has options
            const categoryField = formFields.find(f => f.key === 'category');
            if (categoryField) {
                console.log('WineManager: Category field found:', categoryField);
                console.log('WineManager: Category options:', categoryField.options);
            } else {
                console.log('WineManager: Category field NOT found in form fields');
            }
            
            const groupedFields = {
                basic: formFields.filter(f => f.group === 'basic'),
                details: formFields.filter(f => f.group === 'details'),
                technical: formFields.filter(f => f.group === 'technical')
            };

            let formHTML = '<div class="row">';
            
            // First column - Basic fields
            formHTML += '<div class="col-md-6">';
            groupedFields.basic.forEach(field => {
                formHTML += this.fieldsConfig.generateFormField(field);
            });
            formHTML += '</div>';
            
            // Second column - Details and Technical fields
            formHTML += '<div class="col-md-6">';
            groupedFields.details.forEach(field => {
                formHTML += this.fieldsConfig.generateFormField(field);
            });
            groupedFields.technical.forEach(field => {
                formHTML += this.fieldsConfig.generateFormField(field);
            });
            formHTML += '</div>';
            
            formHTML += '</div>';
            
            formContainer.innerHTML = formHTML;
            console.log('WineManager: Dynamic form updated with', formFields.length, 'fields');
            
            // Add event listener for automatic image URL generation
            this.setupAutomaticImageUrlGeneration();
        } else {
            console.log('WineManager: Dynamic form container not found');
        }
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Search
        const searchInput = document.getElementById('searchWines');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce((e) => {
                this.searchQuery = e.target.value.trim();
                this.currentPage = 1;
                this.loadWines();
            }));
        }

        // Filters
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.currentPage = 1;
                this.loadWines();
            });
        }

        const typeFilter = document.getElementById('typeFilter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => {
                this.filters.type = e.target.value;
                this.currentPage = 1;
                this.loadWines();
            });
        }

        // Clear filters
        const clearFiltersBtn = document.getElementById('clearFilters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Advanced filters
        const priceFromFilter = document.getElementById('priceFromFilter');
        if (priceFromFilter) {
            priceFromFilter.addEventListener('input', Utils.debounce((e) => {
                this.filters.priceFrom = e.target.value ? parseFloat(e.target.value) : undefined;
                this.currentPage = 1;
                this.loadWines();
            }));
        }

        const priceToFilter = document.getElementById('priceToFilter');
        if (priceToFilter) {
            priceToFilter.addEventListener('input', Utils.debounce((e) => {
                this.filters.priceTo = e.target.value ? parseFloat(e.target.value) : undefined;
                this.currentPage = 1;
                this.loadWines();
            }));
        }

        // Sort options
        const sortBySelect = document.getElementById('sortBySelect');
        if (sortBySelect) {
            sortBySelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.currentPage = 1;
                this.loadWines();
            });
        }

        const sortAscBtn = document.getElementById('sortAsc');
        const sortDescBtn = document.getElementById('sortDesc');
        if (sortAscBtn && sortDescBtn) {
            sortAscBtn.addEventListener('click', () => {
                this.sortOrder = 'asc';
                this.currentPage = 1;
                this.loadWines();
                sortAscBtn.classList.add('active');
                sortDescBtn.classList.remove('active');
            });
            sortDescBtn.addEventListener('click', () => {
                this.sortOrder = 'desc';
                this.currentPage = 1;
                this.loadWines();
                sortDescBtn.classList.add('active');
                sortAscBtn.classList.remove('active');
            });
        }

        // View mode toggle buttons (sidebar style)
        const tableViewBtn = document.getElementById('tableView');
        const cardViewBtn = document.getElementById('cardView');
        const gridColumnsControl = document.getElementById('gridColumnsControl');
        
        if (tableViewBtn && cardViewBtn) {
            tableViewBtn.addEventListener('click', () => {
                this.viewMode = 'table';
                this.saveViewMode();
                this.renderWines();
                tableViewBtn.classList.add('active');
                cardViewBtn.classList.remove('active');
                if (gridColumnsControl) gridColumnsControl.style.display = 'none';
            });
            cardViewBtn.addEventListener('click', () => {
                this.viewMode = 'card';
                this.saveViewMode();
                this.renderWines();
                cardViewBtn.classList.add('active');
                tableViewBtn.classList.remove('active');
                if (gridColumnsControl) gridColumnsControl.style.display = 'flex';
            });
        }

        // Grid columns buttons
        for (let i = 2; i <= 6; i++) {
            const colBtn = document.getElementById(`cols${i}`);
            if (colBtn) {
                colBtn.addEventListener('click', () => {
                    this.gridColumns = i;
                    this.updateGridColumns();
                    // Update active state
                    document.querySelectorAll('#gridColumnsControl button').forEach(btn => btn.classList.remove('active'));
                    colBtn.classList.add('active');
                });
            }
        }

        // Page size selector
        const pageSizeSelect = document.getElementById('pageSizeSelect');
        if (pageSizeSelect) {
            pageSizeSelect.addEventListener('change', (e) => {
                this.pageSize = parseInt(e.target.value);
                this.currentPage = 1; // Reset to first page when changing page size
                this.loadWines();
            });
        }

        // Wine form
        const saveWineBtn = document.getElementById('saveWineBtn');
        if (saveWineBtn) {
            saveWineBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveWine();
            });
        }

        // Add wine button
        const addWineBtn = document.getElementById('addWineBtn');
        if (addWineBtn) {
            addWineBtn.addEventListener('click', () => {
                this.showAddWineModal();
            });
        }

        // Export wines button
        const exportWinesBtn = document.getElementById('exportWinesBtn');
        if (exportWinesBtn) {
            exportWinesBtn.addEventListener('click', async () => {
                await this.exportWinesToCSV();
            });
        }

        // Import wines button
        const importWinesBtn = document.getElementById('importWinesBtn');
        if (importWinesBtn) {
            importWinesBtn.addEventListener('click', () => {
                this.showImportModal();
            });
        }

        // Import modal events
        const importModal = document.getElementById('importModal');
        if (importModal) {
            // Import source radio change
            const importSources = importModal.querySelectorAll('input[name="importSource"]');
            importSources.forEach(radio => {
                radio.addEventListener('change', () => {
                    this.toggleImportSection();
                });
            });
            
            // Cleanup backdrop when import modal is closed
            importModal.addEventListener('hidden.bs.modal', () => {
                this.cleanupModalBackdrop();
            });

            // Start import button
            const startImportBtn = document.getElementById('startImportBtn');
            if (startImportBtn) {
                startImportBtn.addEventListener('click', async () => {
                    await this.startImport();
                });
            }

            // File input change for preview
            const csvFileInput = document.getElementById('csvFileInput');
            if (csvFileInput) {
                csvFileInput.addEventListener('change', (e) => {
                    this.previewCSVFile(e.target.files[0]);
                });
            }
        }

        // Wine form modal events
        const wineModal = document.getElementById('wineModal');
        if (wineModal) {
            wineModal.addEventListener('show.bs.modal', (e) => {
                this.prepareWineForm(e.relatedTarget);
            });
            wineModal.addEventListener('hidden.bs.modal', () => {
                this.resetWineForm();
                this.isEditMode = false;
                this.editingWine = null;
                this.cleanupModalBackdrop(); // Clean up backdrop
            });
        }
    }

    /**
     * Setup automatic image URL generation based on catalog number
     */
    setupAutomaticImageUrlGeneration() {
        const catalogNumberField = document.getElementById('wineCatalogNumber');
        const imageField = document.getElementById('wineImage');
        
        if (catalogNumberField && imageField) {
            catalogNumberField.addEventListener('input', (e) => {
                const catalogNumber = e.target.value.trim();
                if (catalogNumber) {
                    // Generate image URL based on catalog number
                    const imageUrl = `/images/${catalogNumber}.jpg`;
                    imageField.value = imageUrl;
                    console.log('WineManager: Auto-generated image URL:', imageUrl);
                } else {
                    // Clear image field if catalog number is empty
                    imageField.value = '';
                }
            });
            
            console.log('WineManager: Automatic image URL generation setup complete');
        } else {
            console.log('WineManager: Could not setup automatic image URL generation - fields not found');
        }
    }

    /**
     * Load categories for filters and forms
     */
    async loadCategories() {
        try {
            // Use default categories from config
            this.categories = CONFIG.CATEGORIES.DEFAULT.map((name, index) => ({
                id: `cat-${index + 1}`,
                name: name
            }));
            this.populateCategoryFilter();
            this.populateTypeFilter();
            this.populateWineForm();
        } catch (error) {
            console.error('Error loading categories:', error);
            // Use default categories if API fails
            this.categories = CONFIG.CATEGORIES.DEFAULT.map((name, index) => ({
                id: index + 1,
                name
            }));
            this.populateCategoryFilter();
            this.populateTypeFilter();
            this.populateWineForm();
        }
    }

    /**
     * Populate category filter dropdown with dynamic categories
     */
    populateCategoryFilter() {
        const categoryFilter = document.getElementById('categoryFilter');
        if (!categoryFilter) return;

        categoryFilter.innerHTML = '<option value="">Wszystkie kategorie</option>';
        
        // Get categories from dynamic field configuration
        const categoryField = this.fieldsConfig.getFormFields().find(f => f.key === 'category');
        if (categoryField && categoryField.options) {
            categoryField.options.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
            console.log('WineManager: Category filter updated with', categoryField.options.length, 'options');
        } else {
            console.log('WineManager: No category field or options found for filter');
        }
    }

    /**
     * Populate type filter dropdown with dynamic types
     */
    populateTypeFilter() {
        const typeFilter = document.getElementById('typeFilter');
        if (!typeFilter) return;

        typeFilter.innerHTML = '<option value="">Wszystkie typy</option>';
        
        // Get types from dynamic field configuration
        const typeField = this.fieldsConfig.getFormFields().find(f => f.key === 'type');
        if (typeField && typeField.options) {
            typeField.options.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                typeFilter.appendChild(option);
            });
            console.log('WineManager: Type filter updated with', typeField.options.length, 'options');
        } else {
            console.log('WineManager: No type field or options found for filter');
        }
    }

    /**
     * Populate wine form category dropdown
     */
    populateWineForm() {
        const categorySelect = document.getElementById('wineCategory');
        if (!categorySelect) return;

        categorySelect.innerHTML = '<option value="">Wybierz kategorię</option>';
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id || category.name;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    /**
     * Load wines with current filters and pagination
     */
    async loadWines() {
        try {
            const params = {
                page: this.currentPage,
                limit: this.pageSize,
                search: this.searchQuery,
                sortBy: this.sortBy,
                sortOrder: this.sortOrder,
                ...this.filters
            };

            console.log('WineManager: Loading wines with params:', params);

            const response = await handleAPICall(() => api.getWines(params));
            
            this.wines = response.data || [];
            this.totalItems = response.pagination?.total || this.wines.length;
            this.totalPages = response.pagination?.totalPages || Math.ceil(this.totalItems / this.pageSize);
            
            // Only update currentPage if it's a valid response and within bounds
            if (response.pagination?.currentPage && 
                response.pagination.currentPage >= 1 && 
                response.pagination.currentPage <= this.totalPages) {
                this.currentPage = response.pagination.currentPage;
            } else {
                // If API returned invalid page, keep our local currentPage but ensure it's within bounds
                this.currentPage = Math.min(Math.max(1, this.currentPage), this.totalPages || 1);
            }

            console.log('WineManager: Loaded wines, currentPage:', this.currentPage, 'totalPages:', this.totalPages);

            this.renderWines();
            this.renderPagination();
            this.renderResultsInfo();
            this.updateStats(); // Update statistics

        } catch (error) {
            console.error('Error loading wines:', error);
            this.wines = [];
            this.renderWines();
            this.updateStats(); // Update stats even on error
        }
    }

    /**
     * Update statistics in header
     */
    async updateStats() {
        try {
            // Get total wines count (without filters)
            const totalResponse = await handleAPICall(() => api.getWines({ page: 1, limit: 1 }));
            const totalWines = totalResponse.pagination?.total || 0;
            
            // Get unique categories
            const categoriesSet = new Set();
            if (this.wines.length > 0) {
                this.wines.forEach(wine => {
                    if (wine.category) categoriesSet.add(wine.category);
                });
            }
            
            // Update UI elements
            const totalWinesElement = document.getElementById('totalWinesCount');
            if (totalWinesElement) totalWinesElement.textContent = totalWines;
            
            const categoriesElement = document.getElementById('categoriesCount');
            if (categoriesElement) categoriesElement.textContent = categoriesSet.size;
            
            const filteredElement = document.getElementById('filteredCount');
            if (filteredElement) filteredElement.textContent = this.totalItems || 0;
            
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }



    /**
     * Render wines in current view mode
     */
    renderWines() {
        // Show/hide grid columns control in controls bar
        const gridColumnsControl = document.getElementById('gridColumnsControl');
        if (gridColumnsControl) {
            gridColumnsControl.style.display = this.viewMode === 'card' ? 'flex' : 'none';
        }

        if (this.viewMode === 'card') {
            this.renderCardView();
            this.updateGridColumns(); // Apply current column count
        } else {
            this.renderTableView();
        }

        // Update view mode display - now using new structure
        const tableView = document.getElementById('table-view');
        const cardView = document.getElementById('card-view');
        
        if (tableView && cardView) {
            if (this.viewMode === 'table') {
                tableView.classList.remove('d-none');
                cardView.classList.add('d-none');
            } else {
                tableView.classList.add('d-none');
                cardView.classList.remove('d-none');
            }
        }
    }

    /**
     * Update grid columns CSS
     */
    updateGridColumns() {
        const container = document.getElementById('wines-cards-container');
        if (container) {
            container.style.gridTemplateColumns = `repeat(${this.gridColumns}, 1fr)`;
            localStorage.setItem('wineGridColumns', this.gridColumns.toString());
        }
    }

    /**
     * Load saved grid columns preference
     */
    loadGridColumns() {
        const saved = localStorage.getItem('wineGridColumns');
        if (saved) {
            this.gridColumns = parseInt(saved) || 4;
            this.updateGridColumns();
            // Update active button
            document.querySelectorAll('#gridColumnsControl button').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById(`cols${this.gridColumns}`);
            if (activeBtn) activeBtn.classList.add('active');
        }
    }

    /**
     * Render wines in table view (dynamic based on field configuration)
     */
    renderTableView() {
        const tbody = document.getElementById('winesTableBody');
        if (!tbody) {
            console.error('WineManager: winesTableBody element not found');
            return;
        }

        if (this.wines.length === 0) {
            const tableFields = this.fieldsConfig.getTableFields();
            const colspan = tableFields.length + 1; // +1 for actions column
            tbody.innerHTML = `
                <tr>
                    <td colspan="${colspan}" class="text-center text-muted py-4">
                        <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                        ${this.searchQuery ? 'Brak wyników wyszukiwania' : 'Brak win w bazie danych'}
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.wines.map(wine => {
            if (typeof this.fieldsConfig.generateTableRow === 'function') {
                return this.fieldsConfig.generateTableRow(wine);
            } else {
                console.error('WineManager: generateTableRow is not a function:', this.fieldsConfig);
                return window.WineFieldsConfig.generateTableRow(wine);
            }
        }).join('');
    }

    /**
     * Render wines in card view
     */
    renderCardView() {
        const container = document.getElementById('wines-cards-container');
        if (!container) return;

        if (this.wines.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center text-muted py-5">
                    <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                    <h5>${this.searchQuery ? 'Brak wyników wyszukiwania' : 'Brak win w bazie danych'}</h5>
                    <p>Dodaj pierwsze wino do swojej kolekcji</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.wines.map(wine => this.fieldsConfig.generateWineCard(wine)).join('');
    }

    /**
     * Render pagination
     */
    renderPagination() {
        const cardsPagination = document.getElementById('wines-pagination');
        const tablePagination = document.getElementById('wines-table-pagination');

        console.log('WineManager: Rendering pagination - currentPage:', this.currentPage, 'totalPages:', this.totalPages);

        if (this.totalPages <= 1) {
            if (cardsPagination) cardsPagination.innerHTML = '';
            if (tablePagination) tablePagination.innerHTML = '';
            return;
        }

        const maxButtons = CONFIG.PAGINATION.MAX_PAGE_BUTTONS;
        const startPage = Math.max(1, this.currentPage - Math.floor(maxButtons / 2));
        const endPage = Math.min(this.totalPages, startPage + maxButtons - 1);

        let html = '';

        // Previous button
        html += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage - 1}">
                    <i class="bi bi-chevron-left"></i>
                </a>
            </li>
        `;

        // First page
        if (startPage > 1) {
            html += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="1">1</a>
                </li>
            `;
            if (startPage > 2) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        }

        // Last page
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                html += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
            html += `
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${this.totalPages}">${this.totalPages}</a>
                </li>
            `;
        }

        // Next button
        html += `
            <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${this.currentPage + 1}">
                    <i class="bi bi-chevron-right"></i>
                </a>
            </li>
        `;

        // Update both pagination containers
        if (cardsPagination) {
            cardsPagination.innerHTML = html;
            this.addPaginationListeners(cardsPagination);
        }
        if (tablePagination) {
            tablePagination.innerHTML = html;
            this.addPaginationListeners(tablePagination);
        }

        console.log('WineManager: Pagination rendered for both views');
    }

    /**
     * Add event listeners to pagination links
     */
    addPaginationListeners(container) {
        const paginationLinks = container.querySelectorAll('a.page-link[data-page]');
        paginationLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(e.currentTarget.getAttribute('data-page'));
                console.log('WineManager: Pagination link clicked, data-page:', e.currentTarget.getAttribute('data-page'), 'parsed page:', page);
                if (page && page !== this.currentPage && !isNaN(page)) {
                    this.goToPage(page);
                }
            });
        });

        console.log('WineManager: Added event listeners to', paginationLinks.length, 'pagination links');
    }

    /**
     * Render results info
     */
    renderResultsInfo() {
        const resultsInfo = document.getElementById('winesResultsInfo');
        if (!resultsInfo) return;

        if (this.totalItems === 0) {
            resultsInfo.innerHTML = 'Brak wyników';
            return;
        }

        const startItem = (this.currentPage - 1) * this.pageSize + 1;
        const endItem = Math.min(this.currentPage * this.pageSize, this.totalItems);
        
        resultsInfo.innerHTML = `Wyświetlane <strong>${startItem}-${endItem}</strong> z <strong>${this.totalItems}</strong> win`;
    }

    /**
     * Go to specific page
     * @param {number} page - Page number
     */
    goToPage(page) {
        console.log('WineManager: goToPage called with page:', page, 'currentPage:', this.currentPage, 'totalPages:', this.totalPages);
        
        if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
            console.log('WineManager: Changing to page', page);
            this.currentPage = page;
            this.loadWines();
        } else {
            console.log('WineManager: Page change rejected - invalid page or same page');
        }
    }

    /**
     * Clear all filters
     */
    clearFilters() {
        this.filters = {};
        this.searchQuery = '';
        this.currentPage = 1;

        // Reset basic form controls
        const searchInput = document.getElementById('searchWines');
        const categoryFilter = document.getElementById('categoryFilter');
        const typeFilter = document.getElementById('typeFilter');

        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = '';
        if (typeFilter) typeFilter.value = '';

        // Reset advanced filters
        const priceFromFilter = document.getElementById('priceFromFilter');
        const priceToFilter = document.getElementById('priceToFilter');

        if (priceFromFilter) priceFromFilter.value = '';
        if (priceToFilter) priceToFilter.value = '';

        // Collapse advanced filters if open
        const advancedFilters = document.getElementById('advancedFilters');
        if (advancedFilters && advancedFilters.classList.contains('show')) {
            const collapse = new bootstrap.Collapse(advancedFilters);
            collapse.hide();
        }

        this.loadWines();
    }

    /**
     * Prepare wine form for editing or creating
     * @param {HTMLElement} trigger - Button that triggered the modal
     */
    showAddWineModal() {
        console.log('WineManager: showAddWineModal called - refreshing form with latest fields');
        
        // CRITICAL: Always refresh form with latest field configuration before showing modal
        this.initializeDynamicForm();
        
        this.isEditMode = false;
        this.editingWine = null;
        const modal = new bootstrap.Modal(document.getElementById('wineModal'));
        modal.show();
        
        // Reset form after a brief delay to ensure form is regenerated
        setTimeout(() => this.resetWineForm(), 50);
    }

    prepareWineForm(trigger) {
        console.log('WineManager: prepareWineForm called - refreshing form with latest fields');
        
        // CRITICAL: Always refresh form with latest field configuration before showing modal
        this.initializeDynamicForm();
        
        const modalTitle = document.querySelector('#wineModal .modal-title');
        const saveButton = document.getElementById('saveWineBtn');

        if (!modalTitle || !saveButton) {
            console.error('WineManager: Modal elements not found');
            return;
        }

        if (this.isEditMode && this.editingWine) {
            // Edit mode set by editWine() function
            modalTitle.textContent = 'Edytuj Wino';
            saveButton.textContent = 'Aktualizuj';
            // Wait a bit for form to be regenerated, then fill it
            setTimeout(() => this.fillWineForm(this.editingWine), 50);
        } else if (trigger && trigger.dataset.wineId) {
            // Edit mode triggered by button with data-wine-id
            const wine = this.wines.find(w => w.id === trigger.dataset.wineId || w._id === trigger.dataset.wineId);
            if (wine) {
                modalTitle.textContent = 'Edytuj Wino';
                saveButton.textContent = 'Aktualizuj';
                // Wait a bit for form to be regenerated, then fill it
                setTimeout(() => this.fillWineForm(wine), 50);
                this.isEditMode = true;
                this.editingWine = wine;
            }
        } else {
            // Create mode
            modalTitle.textContent = 'Dodaj Wino';
            saveButton.textContent = 'Zapisz';
            // Wait a bit for form to be regenerated, then reset it
            setTimeout(() => this.resetWineForm(), 50);
            this.isEditMode = false;
            this.editingWine = null;
        }
    }

    /**
     * Fill wine form with data (dynamic based on field configuration)
     * @param {Object} wine - Wine data
     */
    fillWineForm(wine) {
        // Fill form fields dynamically based on configuration
        const formFields = this.fieldsConfig.getFormFields();
        
        formFields.forEach(fieldConfig => {
            const fieldId = `wine${fieldConfig.key.charAt(0).toUpperCase() + fieldConfig.key.slice(1)}`;
            const element = document.getElementById(fieldId);
            
            if (element) {
                let value = wine[fieldConfig.key] || '';
                
                // For select fields, ensure case-insensitive matching
                if (fieldConfig.type === 'select' && value) {
                    const options = fieldConfig.options || fieldConfig.validation?.options || [];
                    // Find matching option (case-insensitive) and use lowercase value
                    const matchingOption = options.find(option => 
                        option.toLowerCase() === value.toLowerCase()
                    );
                    if (matchingOption) {
                        value = matchingOption.toLowerCase();
                    }
                }
                
                element.value = value;
            }
        });
        
        // Also set ID for hidden field (if exists)
        const idField = document.getElementById('wineId');
        if (idField) {
            idField.value = wine.id || '';
        }
    }

    /**
     * Reset wine form
     */
    resetWineForm() {
        const form = document.getElementById('wineForm');
        if (form) {
            form.reset();
        }
        
        // Clear validation messages
        const inputs = form.querySelectorAll('.form-control, .form-select');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
            const feedback = input.parentNode.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.remove();
            }
        });
    }

    /**
     * Save wine (create or update) with dynamic validation
     */
    async saveWine() {
        console.log('SaveWine called');
        const form = document.getElementById('wineForm');
        if (!form) {
            console.error('Wine form not found');
            return;
        }

        const wineData = this.getWineFormData();
        console.log('Wine form data:', wineData);
        
        // Use dynamic validation
        const validation = this.fieldsConfig.validateWineData(wineData);
        console.log('Validation result:', validation);

        if (!validation.valid) {
            console.log('Validation failed:', validation.errors);
            this.showDynamicFormErrors(validation.errors);
            return;
        }

        try {
            if (this.isEditMode && this.editingWine) {
                // Update existing wine
                const wineId = this.editingWine.id;
                console.log('Updating wine with ID:', wineId, 'Data:', wineData);
                await handleAPICall(() => api.updateWine(wineId, wineData));
                Utils.showAlert(CONFIG.MESSAGES.SUCCESS.WINE_UPDATED, 'success');
            } else {
                // Create new wine
                console.log('Creating new wine with data:', wineData);
                await handleAPICall(() => api.createWine(wineData));
                Utils.showAlert(CONFIG.MESSAGES.SUCCESS.WINE_CREATED, 'success');
            }

            // Close modal and refresh list
            const modal = bootstrap.Modal.getInstance(document.getElementById('wineModal'));
            modal.hide();
            
            await this.loadWines();

        } catch (error) {
            console.error('Error saving wine:', error);
        }
    }

    /**
     * Get wine form data (dynamic based on field configuration)
     * @returns {Object} Wine data
     */
    getWineFormData() {
        const wineData = {};
        const formFields = this.fieldsConfig.getFormFields();
        
        console.log('WineManager: Collecting form data from', formFields.length, 'fields');
        
        formFields.forEach(fieldConfig => {
            const fieldId = `wine${fieldConfig.key.charAt(0).toUpperCase() + fieldConfig.key.slice(1)}`;
            const element = document.getElementById(fieldId);
            
            console.log(`WineManager: Looking for field ${fieldConfig.key} with ID ${fieldId}:`, element !== null);
            
            if (element) {
                let value = element.value;
                
                // Type conversion based on field type
                switch (fieldConfig.type) {
                    case 'number':
                        value = value.trim() ? parseFloat(value) : null;
                        break;
                    case 'text':
                    case 'textarea':
                    case 'url':
                        value = value.trim();
                        break;
                    case 'select':
                        value = value || '';
                        break;
                    default:
                        value = value.trim();
                        break;
                }
                
                wineData[fieldConfig.key] = value;
            } else {
                console.error(`WineManager: Form element not found for field ${fieldConfig.key} (ID: ${fieldId})`);
                wineData[fieldConfig.key] = ''; // Default empty value
            }
        });
        
        console.log('WineManager: Collected wine data:', wineData);
        return wineData;
    }

    /**
     * Show form validation errors
     * @param {Array} errors - Array of error messages
     */
    showFormErrors(errors) {
        // Clear previous errors
        const form = document.getElementById('wineForm');
        const inputs = form.querySelectorAll('.form-control, .form-select');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
            const feedback = input.parentNode.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.remove();
            }
        });

        // Show general error
        Utils.showAlert(`Formularz zawiera błędy:<br>• ${errors.join('<br>• ')}`, 'danger');

        // Highlight first invalid field
        const firstErrorField = form.querySelector('.form-control, .form-select');
        if (firstErrorField) {
            firstErrorField.classList.add('is-invalid');
            firstErrorField.focus();
        }
    }

    /**
     * Show dynamic form validation errors
     * @param {Object} errors - Object with field keys and error arrays
     */
    showDynamicFormErrors(errors) {
        // Clear previous errors
        const form = document.getElementById('wineForm');
        const inputs = form.querySelectorAll('.form-control, .form-select');
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
            const feedback = input.parentNode.querySelector('.invalid-feedback');
            if (feedback) {
                feedback.remove();
            }
        });

        let firstErrorField = null;
        const allErrors = [];

        // Process each field error
        Object.keys(errors).forEach(fieldKey => {
            const fieldErrors = errors[fieldKey];
            if (fieldErrors && fieldErrors.length > 0) {
                allErrors.push(...fieldErrors);
                
                // Find the field element
                const fieldId = `wine${fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)}`;
                const fieldElement = document.getElementById(fieldId);
                
                if (fieldElement) {
                    // Mark field as invalid
                    fieldElement.classList.add('is-invalid');
                    
                    // Add error feedback
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'invalid-feedback';
                    errorDiv.textContent = fieldErrors[0]; // Show first error
                    fieldElement.parentNode.appendChild(errorDiv);
                    
                    // Remember first error field for focus
                    if (!firstErrorField) {
                        firstErrorField = fieldElement;
                    }
                }
            }
        });

        // Show general error alert
        if (allErrors.length > 0) {
            Utils.showAlert(`Formularz zawiera błędy:<br>• ${allErrors.join('<br>• ')}`, 'danger');
        }

        // Focus first error field
        if (firstErrorField) {
            firstErrorField.focus();
        }
    }

    /**
     * Edit wine
     * @param {string} wineId - Wine ID
     */
    editWine(wineId) {
        console.log('EditWine called with ID:', wineId);
        console.log('Available wines:', this.wines);
        const wine = this.wines.find(w => w.id === wineId || w._id === wineId);
        console.log('Found wine:', wine);
        if (!wine) {
            console.error('Wine not found with ID:', wineId);
            return;
        }

        // Set edit mode flag before opening modal
        this.isEditMode = true;
        this.editingWine = wine;

        const modal = new bootstrap.Modal(document.getElementById('wineModal'));
        modal.show();
        console.log('Modal being shown for wine:', wine.name);
    }

    /**
     * Delete wine with confirmation
     * @param {string} wineId - Wine ID
     */
    async deleteWine(wineId) {
        const wine = this.wines.find(w => w.id === wineId || w._id === wineId);
        if (!wine) return;

        const confirmed = confirm(`Czy na pewno chcesz usunąć wino "${wine.name}"?\n\nTej operacji nie można cofnąć.`);
        if (!confirmed) return;

        try {
            await handleAPICall(() => api.deleteWine(wineId));
            Utils.showAlert(CONFIG.MESSAGES.SUCCESS.WINE_DELETED, 'success');
            await this.loadWines();
        } catch (error) {
            console.error('Error deleting wine:', error);
        }
    }

    /**
     * Load and save view mode preference
     */
    loadViewMode() {
        const savedMode = Utils.storage.get(CONFIG.STORAGE_KEYS.VIEW_MODE, 'table');
        this.viewMode = savedMode;
        
        // Update controls bar view buttons
        const tableViewBtn = document.getElementById('tableView');
        const cardViewBtn = document.getElementById('cardView');
        const gridColumnsControl = document.getElementById('gridColumnsControl');
        
        if (tableViewBtn && cardViewBtn) {
            // Reset button states
            tableViewBtn.classList.remove('active');
            cardViewBtn.classList.remove('active');
            
            if (savedMode === 'card') {
                cardViewBtn.classList.add('active');
                if (gridColumnsControl) gridColumnsControl.style.display = 'flex';
            } else {
                tableViewBtn.classList.add('active');
                if (gridColumnsControl) gridColumnsControl.style.display = 'none';
            }
        }
    }

    saveViewMode() {
        Utils.storage.set(CONFIG.STORAGE_KEYS.VIEW_MODE, this.viewMode);
    }

    /**
     * Initialize page size selector
     */
    initializePageSizeSelector() {
        const pageSizeSelect = document.getElementById('pageSizeSelect');
        if (pageSizeSelect) {
            // Set current page size in selector
            pageSizeSelect.value = this.pageSize.toString();
        }
    }

    /**
     * Export wines to CSV with dynamic fields
     */
    async exportWinesToCSV() {
        try {
            // Get current field configuration for CSV headers
            const fields = this.fieldsConfig.getTableFields();
            console.log('Exporting wines with fields:', fields);
            
            if (!fields || fields.length === 0) {
                Utils.showAlert('Brak skonfigurowanych pól do eksportu', 'warning');
                return;
            }

            // Show loading message
            Utils.showAlert('Pobieranie wszystkich win do eksportu...', 'info');

            // Fetch ALL wines (not just current page) for export
            const allWinesParams = {
                limit: 10000, // Very large limit to get all wines
                page: 1,
                search: '', // No search filter to get all wines
                sortBy: this.sortBy,
                sortOrder: this.sortOrder
                // Don't include current filters to export ALL wines
            };

            const response = await handleAPICall(() => api.getWines(allWinesParams));
            const allWines = response.data || [];

            if (!allWines || allWines.length === 0) {
                Utils.showAlert('Brak win do eksportu', 'warning');
                return;
            }

            console.log(`Eksportowanie ${allWines.length} win (zamiast ${this.wines.length} z bieżącej strony)`);

            // Prepare CSV headers
            const headers = fields.map(field => field.label || field.name);
            
            // Prepare CSV rows from ALL wines
            const rows = allWines.map(wine => {
                return fields.map(field => {
                    const value = wine[field.key] || '';
                    // Escape values containing commas or quotes
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                });
            });

            // Create CSV content
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.join(','))
            ].join('\n');

            // Create and download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            const filename = `wina-export-${timestamp}.csv`;
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                Utils.showAlert(`Wyeksportowano ${allWines.length} win do pliku ${filename}`, 'success');
                console.log('CSV export completed:', filename, `(${allWines.length} wines)`);
            }
        } catch (error) {
            console.error('Error exporting wines to CSV:', error);
            Utils.showAlert('Błąd podczas eksportu do CSV: ' + (error.message || 'Nieznany błąd'), 'danger');
        }
    }

    /**
     * Show import modal
     */
    showImportModal() {
        const modal = new bootstrap.Modal(document.getElementById('importModal'));
        this.resetImportModal();
        modal.show();
    }

    /**
     * Reset import modal
     */
    resetImportModal() {
        // Reset form
        document.getElementById('csvFileInput').value = '';
        document.getElementById('googleSheetsUrl').value = '';
        document.getElementById('clearBeforeImport').checked = true;
        document.getElementById('validateFields').checked = true;
        
        // Reset radio selection
        document.getElementById('importFile').checked = true;
        document.getElementById('importGoogleSheets').checked = false;
        
        // Hide sections
        document.getElementById('importPreview').classList.add('d-none');
        document.getElementById('importProgress').classList.add('d-none');
        
        // Toggle sections
        this.toggleImportSection();
    }

    /**
     * Toggle import section based on selected source
     */
    toggleImportSection() {
        const fileSection = document.getElementById('fileImportSection');
        const googleSection = document.getElementById('googleSheetsImportSection');
        const fileRadio = document.getElementById('importFile');
        
        if (fileRadio.checked) {
            fileSection.classList.remove('d-none');
            googleSection.classList.add('d-none');
        } else {
            fileSection.classList.add('d-none');
            googleSection.classList.remove('d-none');
        }
    }

    /**
     * Preview CSV file content
     */
    async previewCSVFile(file) {
        if (!file) return;

        try {
            const text = await file.text();
            this.showCSVPreview(text);
        } catch (error) {
            console.error('Error reading CSV file:', error);
            Utils.showAlert('Błąd podczas odczytu pliku CSV', 'danger');
        }
    }

    /**
     * Show CSV preview
     */
    showCSVPreview(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            Utils.showAlert('Plik CSV musi zawierać co najmniej nagłówek i jeden wiersz danych', 'warning');
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const previewRows = lines.slice(1, 4); // Show first 3 data rows

        // Show headers
        const headerRow = document.getElementById('previewHeaders');
        headerRow.innerHTML = headers.map(h => `<th>${h}</th>`).join('');

        // Show preview data
        const previewData = document.getElementById('previewData');
        previewData.innerHTML = previewRows.map(row => {
            const values = row.split(',').map(v => v.trim().replace(/"/g, ''));
            return `<tr>${values.map(v => `<td>${v}</td>`).join('')}</tr>`;
        }).join('');

        // Show statistics
        const importStats = document.getElementById('importStats');
        importStats.innerHTML = `
            <strong>Podgląd importu:</strong><br>
            Kolumn: ${headers.length}<br>
            Wierszy do zaimportowania: ${lines.length - 1}<br>
            Pokazano pierwsze ${Math.min(3, lines.length - 1)} wierszy
        `;

        // Show preview section
        document.getElementById('importPreview').classList.remove('d-none');
    }

    /**
     * Start import process
     */
    async startImport() {
        try {
            console.log('startImport() called');
            const fileRadio = document.getElementById('importFile');
            const clearBefore = document.getElementById('clearBeforeImport').checked;
            const validateFields = document.getElementById('validateFields').checked;

            console.log('Import settings:', { fileRadio: fileRadio?.checked, clearBefore, validateFields });

            // Show progress
            this.showImportProgress();

            let result;

            if (fileRadio.checked) {
                // File import
                const fileInput = document.getElementById('csvFileInput');
                const file = fileInput.files[0];
                
                if (!file) {
                    Utils.showAlert('Proszę wybrać plik CSV', 'warning');
                    return;
                }

                const csvData = await file.text();
                console.log('CSV data:', csvData);
                console.log('Calling API importFromCSV...');
                result = await api.importFromCSV(csvData, { clearBefore, validateFields });
                console.log('API result:', result);
            } else {
                // Google Sheets import
                const url = document.getElementById('googleSheetsUrl').value.trim();
                
                if (!url) {
                    Utils.showAlert('Proszę podać URL Google Sheets', 'warning');
                    return;
                }

                result = await api.importFromGoogleSheets(url, { clearBefore, validateFields });
            }

            // Handle result
            if (result.success) {
                const { imported, errors } = result.data;
                
                this.updateImportProgress(100);
                this.addImportMessage(`Sukces! Zaimportowano ${imported} win.`, 'success');
                
                if (errors && errors.length > 0) {
                    this.addImportMessage(`Ostrzeżenia: ${errors.length} wierszy zawierało błędy.`, 'warning');
                    errors.forEach((error, index) => {
                        if (index < 5) { // Show max 5 errors
                            this.addImportMessage(`Wiersz ${index + 2}: ${error.error}`, 'error');
                        }
                    });
                    if (errors.length > 5) {
                        this.addImportMessage(`...i ${errors.length - 5} więcej błędów`, 'warning');
                    }
                }

                // Refresh wines list
                await this.loadWines();
                
                // Auto-close modal after success
                setTimeout(() => {
                    bootstrap.Modal.getInstance(document.getElementById('importModal'))?.hide();
                }, 3000);
            } else {
                this.addImportMessage(`Błąd: ${result.error}`, 'error');
            }

        } catch (error) {
            console.error('Import error:', error);
            this.addImportMessage(`Błąd podczas importu: ${error.message}`, 'error');
        }
    }

    /**
     * Show import progress section
     */
    showImportProgress() {
        document.getElementById('importProgress').classList.remove('d-none');
        document.getElementById('importMessages').innerHTML = '';
        this.updateImportProgress(0);
        this.addImportMessage('Rozpoczynanie importu...', 'info');
    }

    /**
     * Update import progress bar
     */
    updateImportProgress(percent) {
        const progressBar = document.querySelector('#importProgress .progress-bar');
        progressBar.style.width = `${percent}%`;
        progressBar.setAttribute('aria-valuenow', percent);
    }

    /**
     * Add import progress message
     */
    addImportMessage(message, type = 'info') {
        const messagesDiv = document.getElementById('importMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `import-message ${type}`;
        messageDiv.textContent = message;
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    /**
     * Refresh wines list
     */
    async refresh() {
        // Refresh fields configuration first
        this.refreshFieldsConfig();
        // Then reload wines
        await this.loadWines();
    }
}

// Wine Fields Management Component
class WineFieldsManager {
    constructor() {
        this.fields = []; // Start with empty fields, will be loaded from server
        this.editingIndex = -1;
        this.currentOptions = []; // Initialize current options array
        // Don't call init() here - it will be called manually from wines.html
    }

    /**
     * Clean up modal backdrop - fixes the black background issue
     */
    cleanupModalBackdrop() {
        // Remove any lingering modal backdrops
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => {
            backdrop.remove();
        });
        
        // Remove modal-open class from body
        document.body.classList.remove('modal-open');
        
        // Reset body overflow
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    async init() {
        this.bindEvents();
        await this.loadFieldsFromServer();
        this.renderFieldsTable();
        this.updatePreviews();
    }

    bindEvents() {
        // Save field button
        document.getElementById('saveWineFieldBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.saveField();
        });

        // Field type change handler
        document.getElementById('wineFieldType')?.addEventListener('change', (e) => {
            this.updateFieldTypeOptions(e.target.value);
        });

        // Wine field modal events - cleanup backdrop on close
        const wineFieldModal = document.getElementById('wineFieldModal');
        if (wineFieldModal) {
            wineFieldModal.addEventListener('hidden.bs.modal', () => {
                this.cleanupModalBackdrop();
            });
        }

        // Event listenery dla przycisków zamykających modalów z data-bs-dismiss="modal"
        // Import modal close buttons
        const importModalCloseButtons = document.querySelectorAll('#importModal [data-bs-dismiss="modal"]');
        importModalCloseButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('WineManager: Close button clicked for importModal');
                setTimeout(() => this.cleanupModalBackdrop(), 300);
            });
        });

        // Wine modal close buttons
        const wineModalCloseButtons = document.querySelectorAll('#wineModal [data-bs-dismiss="modal"]');
        wineModalCloseButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('WineManager: Close button clicked for wineModal');
                setTimeout(() => this.cleanupModalBackdrop(), 300);
            });
        });

        // Wine field modal close buttons
        const wineFieldModalCloseButtons = document.querySelectorAll('#wineFieldModal [data-bs-dismiss="modal"]');
        wineFieldModalCloseButtons.forEach(button => {
            button.addEventListener('click', () => {
                console.log('WineManager: Close button clicked for wineFieldModal');
                setTimeout(() => this.cleanupModalBackdrop(), 300);
            });
        });

        // Add field button - initialize for new field
        document.getElementById('addFieldBtn')?.addEventListener('click', () => {
            this.editingIndex = -1;
            this.currentOptions = [];
            // Reset form
            document.getElementById('wineFieldForm')?.reset();
        });
    }

    async loadFieldsFromServer() {
        try {
            const response = await api.getFieldsConfig();
            if (response.success && response.data) {
                this.fields = response.data;
                window.WineFieldsConfig.WINE_FIELDS_CONFIG = [...this.fields];
                console.log('WineFieldsManager: Loaded', this.fields.length, 'fields from server');
                this.notifyConfigurationChange();
            } else {
                console.warn('WineFieldsManager: No fields data received from server');
                this.fields = [];
                window.WineFieldsConfig.WINE_FIELDS_CONFIG = [];
            }
        } catch (error) {
            console.error('WineFieldsManager: Error loading fields:', error);
            this.fields = [];
            window.WineFieldsConfig.WINE_FIELDS_CONFIG = [];
        }
    }

    renderFieldsTable() {
        const tbody = document.getElementById('wine-fields-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.fields.map((field, index) => `
            <tr ${field.isSystemField ? 'class="table-warning"' : ''}>
                <td>
                    <code>${field.key}</code>
                    ${field.isSystemField ? '<span class="badge bg-danger ms-1" title="Pole systemowe - nie można usunąć">🔒</span>' : ''}
                </td>
                <td>${field.label}</td>
                <td>
                    <span class="badge bg-info">${this.getFieldTypeLabel(field.type)}</span>
                </td>
                <td>
                    <span class="badge ${field.required ? 'bg-warning' : 'bg-secondary'}">
                        ${field.required ? 'Tak' : 'Nie'}
                    </span>
                </td>
                <td>
                    <span class="badge ${field.displayInTable ? 'bg-success' : 'bg-secondary'}">
                        ${field.displayInTable ? 'Tak' : 'Nie'}
                    </span>
                </td>
                <td>
                    <span class="badge ${field.displayInForm ? 'bg-success' : 'bg-secondary'}">
                        ${field.displayInForm ? 'Tak' : 'Nie'}
                    </span>
                </td>
                <td>
                    <span class="badge ${field.displayInCards ? 'bg-success' : 'bg-secondary'}">
                        ${field.displayInCards ? 'Tak' : 'Nie'}
                    </span>
                </td>
                <td>
                    <span class="badge bg-primary">${field.group || 'basic'}</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="wineFieldsManager.editField(${index})" title="Edytuj">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn ${field.isSystemField ? 'btn-outline-secondary disabled' : 'btn-outline-danger'}" 
                                onclick="wineFieldsManager.deleteField(${index})" 
                                title="${field.isSystemField ? 'Pole systemowe - nie można usunąć' : 'Usuń'}"
                                ${field.isSystemField ? 'disabled' : ''}>
                            <i class="bi bi-${field.isSystemField ? 'lock' : 'trash'}"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getFieldTypeLabel(type) {
        const labels = {
            text: 'Tekst',
            number: 'Liczba',
            select: 'Lista',
            textarea: 'Tekst wielolinijowy',
            url: 'URL'
        };
        return labels[type] || type;
    }

    updateFieldTypeOptions(fieldType) {
        const optionsContainer = document.getElementById('wineFieldOptionsContainer');
        if (optionsContainer) {
            optionsContainer.style.display = fieldType === 'select' ? 'block' : 'none';
            if (fieldType === 'select') {
                this.setupOptionsManagement();
            }
        }
    }

    setupOptionsManagement() {
        // Initialize currentOptions if not already initialized
        if (!this.currentOptions) {
            this.currentOptions = [];
        }
        
        // Setup add option button
        const addOptionBtn = document.getElementById('addOptionBtn');
        const newOptionInput = document.getElementById('newOptionInput');
        
        if (addOptionBtn && newOptionInput) {
            // Remove old event listeners
            addOptionBtn.replaceWith(addOptionBtn.cloneNode(true));
            newOptionInput.replaceWith(newOptionInput.cloneNode(true));
            
            // Get new references
            const newAddBtn = document.getElementById('addOptionBtn');
            const newInput = document.getElementById('newOptionInput');
            
            newAddBtn.addEventListener('click', () => this.addOption());
            newInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addOption();
                }
            });
        }
        
        this.renderOptions();
    }

    addOption() {
        const input = document.getElementById('newOptionInput');
        const value = input.value.trim();
        
        if (value && !this.currentOptions.includes(value)) {
            this.currentOptions.push(value);
            this.renderOptions();
            this.updateOptionsTextarea();
            input.value = '';
        }
    }

    removeOption(index) {
        this.currentOptions.splice(index, 1);
        this.renderOptions();
        this.updateOptionsTextarea();
    }

    renderOptions() {
        const optionsList = document.getElementById('optionsList');
        if (!optionsList) return;
        
        if (!this.currentOptions || this.currentOptions.length === 0) {
            optionsList.innerHTML = '<div class="text-muted">Brak opcji</div>';
            return;
        }
        
        optionsList.innerHTML = this.currentOptions.map((option, index) => `
            <div class="d-flex align-items-center mb-1 p-2 border rounded">
                <span class="flex-grow-1">${option}</span>
                <button type="button" class="btn btn-sm btn-outline-danger" onclick="wineFieldsManager.removeOption(${index})">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `).join('');
    }

    updateOptionsTextarea() {
        const textarea = document.getElementById('wineFieldOptions');
        if (textarea) {
            textarea.value = this.currentOptions ? this.currentOptions.join('\n') : '';
        }
    }

    editField(index) {
        this.editingIndex = index;
        const field = this.fields[index];
        
        // Initialize current options for the field
        this.currentOptions = [...(field.options || [])];
        
        // Fill form with field data
        document.getElementById('wineFieldKey').value = field.key;
        document.getElementById('wineFieldLabel').value = field.label;
        document.getElementById('wineFieldType').value = field.type;
        document.getElementById('wineFieldGroup').value = field.group || 'basic';
        document.getElementById('wineFieldPlaceholder').value = field.placeholder || '';
        document.getElementById('wineFieldValidationMin').value = field.validation?.min || '';
        document.getElementById('wineFieldValidationMax').value = field.validation?.max || '';
        document.getElementById('wineFieldOptions').value = field.options?.join('\n') || '';
        document.getElementById('wineFieldFormOrder').value = field.formOrder || '';
        document.getElementById('wineFieldTableOrder').value = field.tableOrder || '';
        document.getElementById('wineFieldDisplayTable').checked = field.displayInTable || false;
        document.getElementById('wineFieldDisplayForm').checked = field.displayInForm || false;
        document.getElementById('wineFieldDisplayCards').checked = field.displayInCards || false;
        document.getElementById('wineFieldRequired').checked = field.required || false;

        this.updateFieldTypeOptions(field.type);
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('wineFieldModal'));
        modal.show();
    }

    async deleteField(index) {
        const field = this.fields[index];
        
        // 🔒 BLOKOWANIE USUWANIA PÓL SYSTEMOWYCH
        if (field && field.isSystemField) {
            Utils.showAlert(`Nie można usunąć pola systemowego "${field.label}" (${field.key}). To pole jest niezbędne dla funkcjonowania systemu.`, 'danger');
            return;
        }
        
        if (confirm('Czy na pewno chcesz usunąć to pole?')) {
            this.fields.splice(index, 1);
            await this.saveConfiguration();
            this.renderFieldsTable();
            this.updatePreviews();
            this.notifyConfigurationChange();
        }
    }

    async saveField() {
        console.log('saveField called');
        const key = document.getElementById('wineFieldKey').value.trim();
        const label = document.getElementById('wineFieldLabel').value.trim();
        const type = document.getElementById('wineFieldType').value;
        
        console.log('Field data:', { key, label, type });
        
        if (!key || !label || !type) {
            Utils.showAlert('Wypełnij wszystkie wymagane pola', 'danger');
            return;
        }

        // Check for duplicate keys (except when editing)
        const existingIndex = this.fields.findIndex(f => f.key === key);
        if (existingIndex !== -1 && existingIndex !== this.editingIndex) {
            Utils.showAlert('Pole o tym kluczu już istnieje', 'danger');
            return;
        }

        const fieldData = {
            key,
            label,
            type,
            group: document.getElementById('wineFieldGroup').value,
            placeholder: document.getElementById('wineFieldPlaceholder').value.trim(),
            validation: {
                min: document.getElementById('wineFieldValidationMin').value,
                max: document.getElementById('wineFieldValidationMax').value
            },
            options: type === 'select' ? 
                (this.currentOptions || []) : 
                undefined,
            formOrder: parseFloat(document.getElementById('wineFieldFormOrder').value) || 0,
            tableOrder: parseFloat(document.getElementById('wineFieldTableOrder').value) || 0,
            displayInTable: document.getElementById('wineFieldDisplayTable').checked,
            displayInForm: document.getElementById('wineFieldDisplayForm').checked,
            displayInCards: document.getElementById('wineFieldDisplayCards').checked,
            required: document.getElementById('wineFieldRequired').checked,
            searchable: true,
            filterable: type === 'select'
        };

        console.log('Created field data:', fieldData);
        console.log('Editing index:', this.editingIndex);

        if (this.editingIndex >= 0) {
            console.log('Updating existing field at index:', this.editingIndex);
            this.fields[this.editingIndex] = fieldData;
        } else {
            console.log('Adding new field');
            this.fields.push(fieldData);
        }

        console.log('Current fields array:', this.fields);

        try {
            await this.saveConfiguration();
            console.log('Configuration saved successfully');
            
            this.renderFieldsTable();
            this.updatePreviews();
            this.notifyConfigurationChange();
            
            // Close modal and clean up backdrop
            const modal = bootstrap.Modal.getInstance(document.getElementById('wineFieldModal'));
            if (modal) {
                modal.hide();
                // Clean up backdrop after modal is hidden
                setTimeout(() => {
                    this.cleanupModalBackdrop();
                }, 300); // Wait for Bootstrap's transition to complete
            }
            
            // Reset form
            document.getElementById('wineFieldForm').reset();
            this.editingIndex = -1;
            
            Utils.showAlert('Pole zostało zapisane', 'success');
        } catch (error) {
            console.error('Failed to save field:', error);
            Utils.showAlert('Błąd podczas zapisywania pola', 'danger');
        }
    }

    async saveConfiguration() {
        try {
            console.log('saveConfiguration: Saving fields to server:', this.fields);
            const response = await api.updateFieldsConfig(this.fields);
            console.log('saveConfiguration: Server response:', response);
            if (!response.success) {
                throw new Error(response.error || 'Błąd zapisywania konfiguracji');
            }
            console.log('saveConfiguration: Successfully saved');
        } catch (error) {
            console.error('Error saving fields configuration:', error);
            Utils.showAlert('Błąd zapisywania konfiguracji: ' + error.message, 'danger');
            throw error; // Re-throw to stop execution
        }
    }

    updatePreviews() {
        this.updateFormPreview();
        this.updateTablePreview();
    }

    updateFormPreview() {
        const preview = document.getElementById('form-preview');
        if (!preview) return;

        const formFields = this.fields
            .filter(field => field.displayInForm)
            .sort((a, b) => (a.formOrder || 0) - (b.formOrder || 0));

        preview.innerHTML = formFields.map(field => {
            switch (field.type) {
                case 'textarea':
                    return `
                        <div class="mb-3">
                            <label class="form-label">${field.label} ${field.required ? '<span class="text-danger">*</span>' : ''}</label>
                            <textarea class="form-control form-control-sm" placeholder="${field.placeholder || ''}" disabled></textarea>
                        </div>
                    `;
                case 'select':
                    return `
                        <div class="mb-3">
                            <label class="form-label">${field.label} ${field.required ? '<span class="text-danger">*</span>' : ''}</label>
                            <select class="form-select form-select-sm" disabled>
                                <option>Wybierz...</option>
                                ${field.options ? field.options.map(opt => `<option>${opt}</option>`).join('') : ''}
                            </select>
                        </div>
                    `;
                default:
                    return `
                        <div class="mb-3">
                            <label class="form-label">${field.label} ${field.required ? '<span class="text-danger">*</span>' : ''}</label>
                            <input type="${field.type}" class="form-control form-control-sm" placeholder="${field.placeholder || ''}" disabled>
                        </div>
                    `;
            }
        }).join('');
    }

    updateTablePreview() {
        const preview = document.getElementById('table-preview');
        if (!preview) return;

        const tableFields = this.fields
            .filter(field => field.displayInTable)
            .sort((a, b) => (a.tableOrder || 0) - (b.tableOrder || 0));

        preview.innerHTML = `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            ${tableFields.map(field => `<th>${field.label}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            ${tableFields.map(() => `<td class="text-muted">Przykład</td>`).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }

    getCurrentFields() {
        return this.fields || [];
    }

    notifyConfigurationChange() {
        // Update global configuration
        window.WineFieldsConfig.WINE_FIELDS_CONFIG = [...this.fields];
        
        // Dispatch event to notify other components
        document.dispatchEvent(new CustomEvent('fieldsConfigChanged', {
            detail: { fields: this.fields }
        }));
    }

    async exportConfiguration() {
        const data = {
            fields: this.fields,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wine-fields-config.json';
        a.click();
        URL.revokeObjectURL(url);
    }

    async resetConfiguration() {
        if (confirm('Czy na pewno chcesz przywrócić domyślną konfigurację pól?')) {
            try {
                const response = await api.resetFieldsConfig();
                if (response.success) {
                    await this.loadFieldsFromServer();
                    this.renderFieldsTable();
                    this.updatePreviews();
                    Utils.showAlert('Konfiguracja została przywrócona', 'success');
                } else {
                    throw new Error(response.error || 'Błąd resetowania');
                }
            } catch (error) {
                console.error('Error resetting configuration:', error);
                Utils.showAlert('Błąd resetowania: ' + error.message, 'danger');
            }
        }
    }
}

// Export classes for external initialization
// Initialization is now handled in wines.html
window.WineManager = WineManager;
window.WineFieldsManager = WineFieldsManager;