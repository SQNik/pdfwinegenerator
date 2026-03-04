/**
 * Collections Management Component
 * Manages wine collections with dynamic fields functionality
 */
class CollectionsManager {
    constructor() {
        this.collections = [];
        this.wines = [];
        this.collectionFields = [];
        this.filteredCollections = [];
        this.currentFilters = {
            search: '',
            status: '',
            tags: []
        };
        this.currentSort = 'updated';
        this.isLoading = false;
        this.initialized = false;
        
        // Pagination settings for wine selection
        this.winePagination = {
            currentPage: 1,
            itemsPerPage: 12,
            totalItems: 0,
            totalPages: 0,
            filteredWines: []
        };
        
        // Stan zaznaczonych win (Set catalogNumbers) - zachowuje zaznaczenia między filtrami/paginacją
        this.selectedWineCatalogNumbers = new Set();
        
        // Flaga dla filtru "tylko zaznaczone wina"
        this.showOnlySelected = false;
        
        // Stan początkowy kolekcji dla wykrywania zmian
        this.originalWineSelection = new Set();
        this.hasUnsavedChanges = false;
        
        // Note: init() is called manually from HTML to control initialization order
    }

    async init() {
        if (this.initialized) {
            console.warn('Collections Manager already initialized, skipping...');
            return;
        }
        
        try {
            this.setupEventListeners();
            await this.loadCollectionFields();
            await this.refresh();
            this.initialized = true;
            console.log('Collections Manager initialized');
        } catch (error) {
            console.error('Failed to initialize Collections Manager:', error);
            this.showNotification('Błąd inicjalizacji menedżera kolekcji', 'error');
        }
    }

    setupEventListeners() {
        // Search and filters
        const searchInput = document.getElementById('collectionsSearch');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.currentFilters.search = e.target.value;
                this.applyFilters();
            }, 300));
        }

        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentFilters.status = e.target.value;
                this.applyFilters();
            });
        }

        const sortSelect = document.getElementById('collectionsSortBy');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.updateSortIndicators();
                this.applyFilters();
            });
        }

        // Table header sorting
        document.addEventListener('click', (e) => {
            const header = e.target.closest('.sortable-header');
            if (header) {
                const sortKey = header.getAttribute('data-sort');
                if (sortKey) {
                    this.handleHeaderSort(sortKey);
                }
            }
        });

        // Collection actions
        const createBtn = document.getElementById('createCollectionBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                // Redirect to wizard creator page
                window.location.href = 'kreator.html';
            });
        }

        const saveCollectionBtn = document.getElementById('saveCollectionBtn');
        if (saveCollectionBtn) {
            saveCollectionBtn.addEventListener('click', () => this.saveCollection());
        }

        // Field management buttons
        const manageFieldsBtn = document.getElementById('manageCollectionFieldsBtn');
        if (manageFieldsBtn) {
            manageFieldsBtn.addEventListener('click', () => this.showFieldsManagementModal());
        }

        const saveFieldBtn = document.getElementById('saveCollectionFieldBtn');
        if (saveFieldBtn) {
            saveFieldBtn.addEventListener('click', () => this.saveCollectionField());
        }

        const addFieldBtn = document.getElementById('addCollectionFieldBtn');
        if (addFieldBtn) {
            addFieldBtn.addEventListener('click', () => this.showCreateFieldModal());
        }

        // View toggle buttons removed - using table view only

        // Listen for collection fields updates
        document.addEventListener('collectionFieldsConfigChanged', async (e) => {
            console.log('CollectionsManager: Pola kolekcji się zmieniły');
            await this.loadCollectionFields();
        });

        const fieldModal = document.getElementById('collectionFieldModal');
        if (fieldModal) {
            fieldModal.addEventListener('hidden.bs.modal', () => {
                this.resetFieldForm();
                this.cleanupModalBackdrop(); // Dodano czyszczenie backdrop
            });
        }
    }

    /**
     * Wyczyść backdrop modala Bootstrap
     * Usuwa wszelkie pozostałe backdropy i resetuje scroll body
     */
    cleanupModalBackdrop() {
        // Usuń wszystkie backdropy
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        
        // Resetuj klasę modal-open z body
        document.body.classList.remove('modal-open');
        
        // Resetuj overflow na body
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        console.log('Modal backdrop cleaned up');
    }

    async loadCollectionFields() {
        try {
            // Użyj nowego systemu pól dynamicznych
            if (window.collectionFieldsConfig) {
                this.collectionFields = await window.collectionFieldsConfig.getActiveFields();
            } else {
                // Fallback do starego API
                const response = await api.getCollectionFieldsConfig();
                if (response.success) {
                    this.collectionFields = response.data || [];
                }
            }
        } catch (error) {
            console.error('Failed to load collection fields:', error);
            this.collectionFields = [];
        }
    }

    async refresh() {
        try {
            this.setLoading(true);
            
            // Load collections
            const collectionsResponse = await api.getCollections(true);
            if (collectionsResponse.success) {
                this.collections = collectionsResponse.data || [];
                console.log('refresh: Załadowałem', this.collections.length, 'kolekcji');
                
                // Debuguj liczby win w kolekcjach
                this.collections.forEach(collection => {
                    const wineCount = collection.wines ? collection.wines.length : 0;
                    console.log(`refresh: Kolekcja "${collection.name}" ma ${wineCount} win`);
                });
            }

            // Load all wines for selection (używamy dużego limitu żeby pobrać wszystkie wina)
            const winesResponse = await api.getWines({ limit: 1000 });
            if (winesResponse.success) {
                this.wines = winesResponse.data || [];
                console.log('refresh: Załadowałem', this.wines.length, 'win');
                
                // Jeśli modal kolekcji jest otwarty, odśwież wybór win
                const modal = document.getElementById('collectionModal');
                if (modal && modal.classList.contains('show')) {
                    console.log('refresh: Modal jest otwarty, odświeżam wybór win');
                    this.populateWinesSelection(this.currentCollection);
                }
            } else {
                console.error('refresh: Błąd ładowania win:', winesResponse);
            }

            this.applyFilters();
            this.renderCollections();
            this.renderCollectionsTable(); // Renderuj również tabelę przy pierwszym załadowaniu
            this.updateStats();
            
        } catch (error) {
            console.error('Failed to refresh collections:', error);
            this.showNotification('Błąd podczas ładowania kolekcji', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    applyFilters() {
        let filtered = [...this.collections];

        // Search filter
        if (this.currentFilters.search) {
            const search = this.currentFilters.search.toLowerCase();
            filtered = filtered.filter(collection => 
                collection.name.toLowerCase().includes(search) ||
                (collection.description && collection.description.toLowerCase().includes(search)) ||
                (collection.tags && collection.tags.some(tag => tag.toLowerCase().includes(search)))
            );
        }

        // Status filter
        if (this.currentFilters.status) {
            filtered = filtered.filter(collection => collection.status === this.currentFilters.status);
        }

        // Sort
        const isAscending = this.currentSort.startsWith('-');
        const sortKey = this.currentSort.replace('-', '');
        
        filtered.sort((a, b) => {
            let result = 0;
            switch (sortKey) {
                case 'name':
                    result = a.name.localeCompare(b.name);
                    break;
                case 'created':
                    result = new Date(b.createdAt) - new Date(a.createdAt);
                    break;
                case 'updated':
                    result = new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
                    break;
                case 'wines_count':
                    result = (b.wines?.length || 0) - (a.wines?.length || 0);
                    break;
                default:
                    result = 0;
            }
            // Reverse for ascending
            return isAscending ? -result : result;
        });

        this.filteredCollections = filtered;
        
        // Render po filtrowaniu
        this.renderCollections();
        this.renderCollectionsTable();
        this.updateStats();
    }
    
    /**
     * Handle sorting when clicking table headers
     */
    handleHeaderSort(sortKey) {
        // Toggle sort direction if same column, otherwise set to desc
        if (this.currentSort === sortKey) {
            // Toggle direction by adding '-' prefix for ascending
            if (this.currentSort.startsWith('-')) {
                this.currentSort = sortKey; // Remove prefix = descending
            } else {
                this.currentSort = '-' + sortKey; // Add prefix = ascending
            }
        } else {
            this.currentSort = sortKey; // Default to descending
        }
        
        // Update dropdown to match
        const sortSelect = document.getElementById('collectionsSortBy');
        if (sortSelect) {
            // Remove '-' prefix for dropdown value
            const selectValue = this.currentSort.replace('-', '');
            sortSelect.value = selectValue;
        }
        
        this.updateSortIndicators();
        this.applyFilters();
        this.renderCollections();
        this.renderCollectionsTable();
    }
    
    /**
     * Update visual indicators on table headers
     */
    updateSortIndicators() {
        const headers = document.querySelectorAll('.sortable-header');
        const isAscending = this.currentSort.startsWith('-');
        const activeSort = this.currentSort.replace('-', '');
        
        headers.forEach(header => {
            const sortKey = header.getAttribute('data-sort');
            header.classList.remove('sort-active', 'sort-asc', 'sort-desc');
            
            if (sortKey === activeSort) {
                header.classList.add('sort-active');
                header.classList.add(isAscending ? 'sort-asc' : 'sort-desc');
            }
        });
    }
    
    filterCollections() {
        // Get filter value from status dropdown
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            this.currentFilters.status = statusFilter.value;
        }
        
        // Apply filters and re-render
        this.applyFilters();
        this.renderCollections();
        this.renderCollectionsTable();
        
        // Update stats
        if (typeof window.updateCollectionStats === 'function') {
            window.updateCollectionStats();
        }
    }

    // switchView method removed - using table view only

    renderCollectionsTable() {
        const tbody = document.getElementById('collectionsTableBody');
        if (!tbody) return;
        
        if (this.filteredCollections.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: var(--space-xl); color: var(--ds-color-neutral-600);">
                        <i class="bi bi-folder-x" style="font-size: 2.5rem; opacity: 0.3; margin-bottom: var(--space-md); display: block;"></i>
                        <div style="font-weight: 600; margin-bottom: 4px;">Brak kolekcji</div>
                        <div style="font-size: 0.875rem;">Kliknij "Nowa kolekcja" aby utworzyć pierwszą kolekcję</div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.filteredCollections.map(collection => {
            const wineCount = collection.wines ? collection.wines.length : 0;
            const statusBadge = this.getStatusBadge(collection.status);
            const createdDate = new Date(collection.createdAt).toLocaleDateString('pl-PL');
            const updatedDate = collection.updatedAt ? new Date(collection.updatedAt).toLocaleDateString('pl-PL') : createdDate;
            const updatedTime = collection.updatedAt ? new Date(collection.updatedAt).toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'}) : '';
            
            // Check if collection was edited after last PDF generation
            const pdfNeedsRegeneration = collection.lastGeneratedPdf && collection.updatedAt && 
                new Date(collection.updatedAt) > new Date(collection.lastGeneratedPdf.generatedAt);
            
            // Check if collection is active (only active collections can generate PDFs)
            const canGeneratePdf = collection.status === 'active';
            
            return `
                <tr>
                    <td style="font-weight: 600;">${collection.name}</td>
                    <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${collection.description || '<span style="color: var(--ds-color-neutral-500);">—</span>'}
                    </td>
                    <td>${statusBadge}</td>
                    <td>
                        <span style="display: inline-flex; align-items: center; gap: 4px;">
                            <i class="bi bi-bottle" style="color: var(--ds-color-primary);"></i>
                            <strong>${wineCount}</strong>
                        </span>
                    </td>
                    <td style="color: var(--ds-color-neutral-600); font-size: 0.875rem;">${createdDate}</td>
                    <td style="color: var(--ds-color-neutral-600); font-size: 0.875rem;">
                        ${collection.updatedAt ? `
                            <span title="${new Date(collection.updatedAt).toLocaleString('pl-PL')}">
                                ${updatedDate}
                                ${updatedTime ? `<br><small style="color: var(--ds-color-neutral-500);">${updatedTime}</small>` : ''}
                            </span>
                        ` : '<span style="color: var(--ds-color-neutral-500);">—</span>'}
                    </td>
                    <td style="color: var(--ds-color-neutral-600); font-size: 0.875rem;">
                        ${collection.lastGeneratedPdf ? `
                            <span title="${new Date(collection.lastGeneratedPdf.generatedAt).toLocaleString('pl-PL')}">
                                ${new Date(collection.lastGeneratedPdf.generatedAt).toLocaleDateString('pl-PL')}
                                <br>
                                <small style="color: var(--ds-color-neutral-500);">${new Date(collection.lastGeneratedPdf.generatedAt).toLocaleTimeString('pl-PL', {hour: '2-digit', minute: '2-digit'})}</small>
                            </span>
                        ` : '<span style="color: var(--ds-color-neutral-500);">—</span>'}
                    </td>
                    <td style="font-size: 0.875rem;">
                        ${collection.lastGeneratedPdf && collection.lastGeneratedPdf.templateName ? `
                            <span style="display: inline-flex; align-items: center; gap: 6px;">
                                <i class="bi bi-file-earmark-text" style="color: var(--ds-color-primary);"></i>
                                <span title="${collection.lastGeneratedPdf.templateName}">${collection.lastGeneratedPdf.templateName}</span>
                            </span>
                        ` : '<span style="color: var(--ds-color-neutral-500);">—</span>'}
                    </td>
                    <td style="text-align: right;">
                        <div style="display: inline-flex; gap: 4px;">
                            <button type="button" class="ds-btn ds-btn-sm ds-btn-ghost" 
                                    onclick="window.collectionsApp.managers.collections.viewCollection('${collection.id}')" 
                                    title="Zobacz szczegóły">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button type="button" class="ds-btn ds-btn-sm ds-btn-ghost" 
                                    onclick="window.collectionsApp.managers.collections.editCollection('${collection.id}')" 
                                    title="Edytuj">
                                <i class="bi bi-pencil"></i>
                            </button>
                            ${collection.lastGeneratedPdf && !pdfNeedsRegeneration ? `
                                <button type="button" class="ds-btn ds-btn-sm ds-btn-primary" 
                                        onclick="window.open('${collection.lastGeneratedPdf.url}', '_blank')" 
                                        title="Pobierz ostatnie PDF (${new Date(collection.lastGeneratedPdf.generatedAt).toLocaleString('pl-PL')})">
                                    <i class="bi bi-file-earmark-pdf-fill"></i>
                                </button>
                            ` : ''}
                            ${pdfNeedsRegeneration ? `
                                <button type="button" class="ds-btn ds-btn-sm ds-btn-warning" 
                                        onclick="window.collectionsApp.managers.collections.showPDFModal('${collection.id}')" 
                                        title="${canGeneratePdf ? 'Kolekcja zmieniona - wymagane nowe wygenerowanie PDF' : 'Zmień status na Aktywny, aby wygenerować PDF'}"
                                        style="${!canGeneratePdf ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
                                        ${!canGeneratePdf ? 'disabled' : ''}>
                                    <i class="bi bi-exclamation-triangle-fill"></i>
                                    <i class="bi bi-file-pdf"></i>
                                </button>
                            ` : `
                                <button type="button" class="ds-btn ds-btn-sm ${collection.metadata?.templateId ? 'ds-btn-primary' : 'ds-btn-ghost'}" 
                                        onclick="window.collectionsApp.managers.collections.showPDFModal('${collection.id}')" 
                                        title="${!canGeneratePdf ? 'Zmień status na Aktywny, aby wygenerować PDF' : (collection.metadata?.templateId ? 'Generuj PDF (szablon zapisany)' : 'Generuj PDF (wybierz szablon)')}"
                                        style="${!canGeneratePdf ? 'opacity: 0.5; cursor: not-allowed;' : ''}"
                                        ${!canGeneratePdf ? 'disabled' : ''}>
                                    <i class="bi bi-file-pdf"></i>
                                </button>
                            `}
                            <button type="button" class="ds-btn ds-btn-sm ds-btn-ghost" 
                                    onclick="window.collectionsApp.managers.collections.exportCollection('${collection.id}')" 
                                    title="Eksportuj JSON">
                                <i class="bi bi-download"></i>
                            </button>
                            <button type="button" class="ds-btn ds-btn-sm ds-btn-ghost" 
                                    onclick="window.collectionsApp.managers.collections.deleteCollection('${collection.id}')" 
                                    title="Usuń"
                                    style="color: var(--ds-color-danger);">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Update sort indicators after rendering
        this.updateSortIndicators();
    }

    renderCollections() {
        console.log('renderCollections: Renderuję', this.filteredCollections.length, 'kolekcji w widoku tabeli');
        this.renderCollectionsTable();
    }

    renderCollectionCard(collection) {
        const wineCount = collection.wines ? collection.wines.length : 0;
        console.log(`renderCollectionCard: Renderuję kartę "${collection.name}" z ${wineCount} winami`);
        
        const statusBadge = this.getStatusBadge(collection.status);
        const tags = collection.tags ? collection.tags.map(tag => `<span class="modern-badge modern-badge-secondary" style="margin-right: 4px;">${tag}</span>`).join('') : '';
        
        // Check if collection is active (only active collections can generate PDFs)
        const canGeneratePdf = collection.status === 'active';
        
        // Render dynamic fields
        const dynamicFieldsHtml = this.renderDynamicFields(collection.dynamicFields);

        const html = `
            <div class="modern-card" style="height: 100%; display: flex; flex-direction: column;">
                <div class="modern-card-body" style="flex: 1; padding: var(--space-lg);">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-md);">
                        <h3 style="font-size: 1.125rem; font-weight: 600; margin: 0; color: var(--color-text-primary);">${collection.name}</h3>
                        ${statusBadge}
                    </div>
                    
                    ${collection.description ? `<p style="font-size: 0.875rem; color: var(--color-text-tertiary); margin-bottom: var(--space-md); line-height: 1.5;">${collection.description}</p>` : ''}
                    
                    <div style="display: flex; align-items: center; gap: var(--space-xs); margin-bottom: var(--space-md); font-size: 0.875rem; color: var(--color-text-secondary);">
                        <i class="bi bi-bottle" style="color: var(--color-accent);"></i>
                        <span style="font-weight: 500;">${wineCount}</span>
                        <span>${wineCount === 1 ? 'wino' : wineCount < 5 ? 'wina' : 'win'}</span>
                    </div>
                    
                    ${tags ? `<div style="margin-bottom: var(--space-md);">${tags}</div>` : ''}
                    
                    ${dynamicFieldsHtml ? `<div style="margin-bottom: var(--space-md);">${dynamicFieldsHtml}</div>` : ''}
                    
                    <div style="font-size: 0.8125rem; color: var(--color-text-tertiary); padding-top: var(--space-sm); border-top: 1px solid var(--color-border-light);">
                        Utworzone: ${new Date(collection.createdAt).toLocaleDateString('pl-PL')}
                    </div>
                </div>
                
                <div style="padding: var(--space-md) var(--space-lg); border-top: 1px solid var(--color-border-light); background: var(--color-bg-secondary);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-xs); margin-bottom: var(--space-xs);">
                        <button type="button" class="modern-btn modern-btn-sm modern-btn-primary" 
                                onclick="window.collectionsApp.managers.collections.viewCollection('${collection.id}')"
                                style="font-size: 0.8125rem;">
                            <i class="bi bi-eye"></i>
                            Zobacz
                        </button>
                        <button type="button" class="modern-btn modern-btn-sm ${collection.metadata?.templateId ? 'modern-btn-primary' : 'modern-btn-secondary'}" 
                                onclick="window.collectionsApp.managers.collections.showPDFModal('${collection.id}')"
                                title="${!canGeneratePdf ? 'Zmień status na Aktywny, aby wygenerować PDF' : `Generuj PDF ${collection.metadata?.templateId ? '(szablon zapisany)' : '(wybierz szablon)'}`}"
                                style="font-size: 0.8125rem;${!canGeneratePdf ? ' opacity: 0.5; cursor: not-allowed;' : ''}"
                                ${!canGeneratePdf ? 'disabled' : ''}>
                            <i class="bi bi-file-pdf"></i>
                            Generuj PDF
                        </button>
                    </div>
                    ${collection.lastGeneratedPdf ? `
                    <div style="display: grid; grid-template-columns: 1fr; gap: var(--space-xs); margin-bottom: var(--space-xs);">
                        <button type="button" class="modern-btn modern-btn-sm modern-btn-success" 
                                onclick="window.open('${collection.lastGeneratedPdf.url}', '_blank')"
                                title="Ostatnio wygenerowany: ${new Date(collection.lastGeneratedPdf.generatedAt).toLocaleString('pl-PL')}"
                                style="font-size: 0.8125rem;">
                            <i class="bi bi-download"></i>
                            Pobierz ostatni PDF
                        </button>
                    </div>
                    ` : ''}
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-xs);">
                        <button type="button" class="modern-btn modern-btn-sm modern-btn-ghost" 
                                onclick="window.collectionsApp.managers.collections.editCollection('${collection.id}')"
                                style="font-size: 0.8125rem;">
                            <i class="bi bi-pencil"></i>
                            Edytuj
                        </button>
                        <button type="button" class="modern-btn modern-btn-sm modern-btn-ghost" 
                                onclick="window.collectionsApp.managers.collections.exportCollectionJSON('${collection.id}', '${collection.name.replace(/'/g, "\\'")}')"
                                title="Pobierz JSON z pełnymi danymi win"
                                style="font-size: 0.8125rem;">
                            <i class="bi bi-download"></i>
                            JSON
                        </button>
                        <button type="button" class="modern-btn modern-btn-sm modern-btn-ghost" 
                                onclick="window.collectionsApp.managers.collections.deleteCollection('${collection.id}')"
                                style="font-size: 0.8125rem; color: var(--color-danger); border-color: var(--color-danger);">
                            <i class="bi bi-trash"></i>
                            Usuń
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Debug: Log wygenerowanego HTML
        const wineCountText = `${wineCount} ${wineCount === 1 ? 'wino' : wineCount < 5 ? 'wina' : 'win'}`;
        console.log(`renderCollectionCard: "${collection.name}" - wygenerowany HTML zawiera: "${wineCountText}"`);
        
        return html;
    }

    renderDynamicFields(dynamicFields) {
        if (!dynamicFields || Object.keys(dynamicFields).length === 0) {
            return '';
        }

        return Object.entries(dynamicFields).map(([fieldId, value]) => {
            const field = this.collectionFields.find(f => f.id === fieldId);
            if (!field || !value) return '';
            
            const displayValue = this.formatFieldValue(field, value);
            return `<div style="font-size: 0.8125rem; color: var(--color-text-secondary); margin-bottom: 4px;"><strong style="color: var(--color-text-primary);">${field.name}:</strong> ${displayValue}</div>`;
        }).filter(Boolean).join('');
    }

    formatFieldValue(field, value) {
        if (value === null || value === undefined || value === '') return '';
        
        switch (field.type) {
            case 'boolean':
                return value === true || value === 'true' ? 'Tak' : 'Nie';
            case 'date':
                try {
                    return new Date(value).toLocaleDateString('pl-PL');
                } catch {
                    return String(value);
                }
            case 'number':
                return parseFloat(value).toLocaleString('pl-PL');
            case 'email':
                return `<a href="mailto:${value}" class="text-decoration-none">${value}</a>`;
            case 'url':
                return `<a href="${value}" target="_blank" class="text-decoration-none">${value}</a>`;
            case 'textarea':
                // Skróć długi tekst
                return value.length > 50 ? value.substring(0, 50) + '...' : value;
            default:
                return String(value);
        }
    }

    getStatusBadge(status) {
        const statusConfig = {
            active: { class: 'modern-badge-success', text: 'Aktywna' },
            draft: { class: 'modern-badge-warning', text: 'Szkic' },
            archived: { class: 'modern-badge-secondary', text: 'Archiwalna' }
        };
        
        const config = statusConfig[status] || statusConfig.active;
        return `<span class="modern-badge ${config.class}">${config.text}</span>`;
    }

    updateStats() {
        const totalElement = document.getElementById('statsTotal');
        const activeElement = document.getElementById('statsActive');
        const totalWinesElement = document.getElementById('statsTotalWines');

        if (totalElement) {
            totalElement.textContent = this.collections.length;
        }

        if (activeElement) {
            const activeCount = this.collections.filter(c => c.status === 'active').length;
            activeElement.textContent = activeCount;
        }

        if (totalWinesElement) {
            const totalWines = this.collections.reduce((total, collection) => {
                return total + (collection.wines ? collection.wines.length : 0);
            }, 0);
            totalWinesElement.textContent = totalWines;
        }
    }

    async showPDFModal(collectionId) {
        try {
            // Get collection details
            const collectionResponse = await api.getCollection(collectionId, true);
            if (!collectionResponse.success || !collectionResponse.data) {
                this.showNotification('Błąd podczas ładowania kolekcji', 'error');
                return;
            }

            const collection = collectionResponse.data;
            
            // Check if collection is active
            if (collection.status !== 'active') {
                this.showNotification('Tylko aktywne kolekcje mogą generować PDF. Zmień status na "Aktywny" w ustawieniach kolekcji.', 'warning');
                return;
            }
            
            // Check if collection has a template saved in metadata
            const savedTemplateId = collection.metadata?.templateId;
            
            if (savedTemplateId) {
                // Generate PDF directly with saved template
                console.log('Using saved template:', savedTemplateId);
                await this.generatePDFDirectly(collection, savedTemplateId);
            } else {
                // No saved template - show modal to select one
                console.log('No saved template - showing selection modal');
                
                // Get available templates from Template Editor
                const templatesResponse = await api.getTemplateEditorTemplates();
                if (!templatesResponse.success || !templatesResponse.data) {
                    this.showNotification('Błąd podczas ładowania szablonów PDF', 'error');
                    return;
                }

                this.showPDFGenerationModal(collection, templatesResponse.data);
            }
        } catch (error) {
            console.error('Failed to load PDF modal data:', error);
            this.showNotification('Błąd podczas ładowania danych dla PDF', 'error');
        }
    }

    async generatePDFDirectly(collection, templateId) {
        try {
            // Show loading notification
            this.showNotification('Generowanie PDF...', 'info');
            
            // Prepare data for PDF generation
            const pdfData = {
                collectionId: collection.id,
                customTitle: collection.name,
                format: 'A4'
            };
            
            console.log('Generating PDF with template:', templateId, pdfData);
            
            // Generate PDF using api.js method (handles both blob and JSON responses)
            const result = await api.generateCollectionTemplate(templateId, pdfData);
            
            // Check if result is error object (JSON) or blob (PDF)
            if (result instanceof Blob) {
                // Success - got PDF blob
                this.showNotification('PDF wygenerowany pomyślnie!', 'success');
                
                const pdfUrl = URL.createObjectURL(result);
                
                // Open PDF in new window/tab
                const pdfWindow = window.open(pdfUrl, '_blank');
                
                // Clean up the URL after window is opened
                if (pdfWindow) {
                    pdfWindow.onload = () => {
                        URL.revokeObjectURL(pdfUrl);
                    };
                } else {
                    URL.revokeObjectURL(pdfUrl);
                    throw new Error('Nie udało się otworzyć okna PDF');
                }
                
                // Refresh collections to update lastGeneratedPdf
                await this.refresh();
            } else if (result.success === false) {
                // Error response (JSON)
                throw new Error(result.error || 'Nieznany błąd podczas generowania PDF');
            } else {
                throw new Error('Nieprawidłowa odpowiedź z serwera');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            this.showNotification('Błąd podczas generowania PDF: ' + error.message, 'error');
        }
    }

    showPDFGenerationModal(collection, templates) {
        const modal = this.createPDFModal(collection, templates);
        document.body.appendChild(modal);
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            this.cleanupModalBackdrop(); // Dodano czyszczenie backdrop
            document.body.removeChild(modal);
        });
    }

    async viewCollection(id) {
        try {
            const response = await api.getCollection(id, true);
            if (response.success && response.data) {
                this.showCollectionDetailsModal(response.data);
            }
        } catch (error) {
            console.error('Failed to load collection details:', error);
            this.showNotification('Błąd podczas ładowania szczegółów kolekcji', 'error');
        }
    }

    showCollectionDetailsModal(collection) {
        const modal = this.createDetailsModal(collection);
        document.body.appendChild(modal);
        
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
        
        modal.addEventListener('hidden.bs.modal', () => {
            this.cleanupModalBackdrop(); // Dodano czyszczenie backdrop
            document.body.removeChild(modal);
        });
    }

    createDetailsModal(collection) {
        const winesHtml = collection.wines && collection.wines.length > 0
            ? collection.wines.map(wine => `
                <div class="col-md-6 mb-2">
                    <div class="card card-body p-2">
                        <div class="d-flex align-items-center">
                            ${wine.image ? `<img src="${wine.image}" class="rounded me-2" style="width: 40px; height: 40px; object-fit: cover;" alt="${wine.name}">` : '<div class="bg-light rounded me-2 d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;"><i class="fas fa-wine-bottle text-muted"></i></div>'}
                            <div>
                                <small class="fw-bold">${wine.name}</small>
                                <small class="text-muted d-block">${wine.region || ''} ${wine.szczepy ? '- ' + wine.szczepy : ''}</small>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')
            : '<p class="text-muted">Brak win w tej kolekcji.</p>';

        const dynamicFieldsHtml = this.renderDetailedDynamicFields(collection.dynamicFields);

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-folder-open me-2"></i>${collection.name}
                            ${this.getStatusBadge(collection.status)}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${collection.description ? `<p class="text-muted">${collection.description}</p>` : ''}
                        
                        ${collection.tags && collection.tags.length > 0 ? `
                            <div class="mb-3">
                                <strong>Tagi:</strong>
                                ${collection.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                        
                        ${dynamicFieldsHtml}
                        
                        <h6 class="mt-4 mb-3">Wina w kolekcji (${collection.wines ? collection.wines.length : 0})</h6>
                        <div class="row">
                            ${winesHtml}
                        </div>
                        
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <small class="text-muted">
                                    <i class="fas fa-calendar-plus me-1"></i>
                                    Utworzona: ${new Date(collection.createdAt).toLocaleDateString('pl-PL')}
                                </small>
                            </div>
                            <div class="col-md-6">
                                <small class="text-muted">
                                    <i class="fas fa-calendar-edit me-1"></i>
                                    Zaktualizowana: ${new Date(collection.updatedAt).toLocaleDateString('pl-PL')}
                                </small>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Zamknij</button>
                        <button type="button" class="btn btn-primary" onclick="window.collectionsManager.editCollection('${collection.id}')" data-bs-dismiss="modal">
                            <i class="fas fa-edit me-1"></i>Edytuj
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        return modal;
    }

    createPDFModal(collection, templates) {
        // Filter only active templates
        const activeTemplates = templates.filter(template => template.status === 'active');
        
        const templatesOptions = activeTemplates.map(template => 
            `<option value="${template.id}">${template.name}</option>`
        ).join('');

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'pdfModal';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-file-pdf me-2"></i>Generuj PDF - ${collection.name}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <p class="text-muted">
                                <i class="fas fa-info-circle me-1"></i>
                                Kolekcja zawiera ${collection.wines ? collection.wines.length : 0} win.
                            </p>
                        </div>
                        
                        <div class="mb-3">
                            <label for="pdfTemplate" class="form-label">
                                <i class="fas fa-layer-group me-1"></i>Wybierz szablon PDF
                            </label>
                            <select class="form-select" id="pdfTemplate" required>
                                <option value="">-- Wybierz szablon --</option>
                                ${templatesOptions}
                            </select>
                            <div class="form-text">
                                Szablon określa wygląd, układ elementów oraz format strony w generowanym PDF.
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="pdfTitle" class="form-label">
                                <i class="fas fa-heading me-1"></i>Tytuł dokumentu
                            </label>
                            <input type="text" class="form-control" id="pdfTitle" 
                                   value="${collection.name}" placeholder="Wprowadź tytuł dokumentu">
                            <div class="form-text">
                                Ten tytuł pojawi się na pierwszej stronie dokumentu PDF.
                            </div>
                        </div>

                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="flattenPdf" value="1">
                                <label class="form-check-label" for="flattenPdf">
                                    <i class="fas fa-compress-alt me-1"></i>Spłaszcz PDF
                                </label>
                            </div>
                            <div class="form-text">
                                Spłaszczenie PDF konwertuje wszystkie interaktywne elementy na statyczne obrazy, 
                                zwiększa kompatybilność z drukarkami i redukuje rozmiar pliku.
                            </div>
                        </div>

                        <div id="pdfPreview" class="d-none">
                            <div class="alert alert-info">
                                <i class="fas fa-eye me-1"></i>
                                <strong>Podgląd:</strong> Po wybraniu szablonu możesz zobaczyć podgląd przed generowaniem.
                            </div>
                        </div>

                        <div id="pdfProgress" class="d-none">
                            <div class="progress">
                                <div class="progress-bar progress-bar-striped progress-bar-animated" 
                                     role="progressbar" style="width: 100%">
                                    Generowanie PDF...
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
                        <button type="button" class="btn btn-outline-info" id="previewPdfBtn" disabled>
                            <i class="fas fa-eye me-1"></i>Podgląd
                        </button>
                        <button type="button" class="btn btn-success" id="generatePdfBtn" disabled>
                            <i class="fas fa-file-pdf me-1"></i>Generuj PDF
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const templateSelect = modal.querySelector('#pdfTemplate');
        const previewBtn = modal.querySelector('#previewPdfBtn');
        const generateBtn = modal.querySelector('#generatePdfBtn');

        templateSelect.addEventListener('change', (e) => {
            const hasTemplate = e.target.value;
            previewBtn.disabled = !hasTemplate;
            generateBtn.disabled = !hasTemplate;
        });

        previewBtn.addEventListener('click', () => {
            this.previewPDF();
        });

        generateBtn.addEventListener('click', () => {
            this.generatePDF();
        });

        // Ustaw dataset.collectionId na modalu, aby generatePDF mogło go odczytać
        modal.dataset.collectionId = collection.id;
        return modal;
    }

    renderDetailedDynamicFields(dynamicFields) {
        if (!dynamicFields || Object.keys(dynamicFields).length === 0) {
            return '';
        }

        const fieldsHtml = Object.entries(dynamicFields).map(([fieldId, value]) => {
            const field = this.collectionFields.find(f => f.id === fieldId);
            if (!field || !value) return '';
            
            const displayValue = this.formatFieldValue(field, value);
            return `
                <div class="col-md-6 mb-2">
                    <strong>${field.name}:</strong> ${displayValue}
                </div>
            `;
        }).filter(Boolean).join('');

        if (!fieldsHtml) return '';

        return `
            <div class="mb-3">
                <h6>Dodatkowe informacje</h6>
                <div class="row">
                    ${fieldsHtml}
                </div>
            </div>
        `;
    }

    async editCollection(id) {
        // Redirect to wizard/kreator with edit mode
        window.location.href = `kreator.html?edit=${id}`;
    }

    setupModalForCollection(triggerElement) {
        console.log('setupModalForCollection called with triggerElement:', triggerElement);
        console.log('Current currentCollection before setup:', this.currentCollection);
        
        // Check if we're editing an existing collection
        if (triggerElement && triggerElement.hasAttribute('data-collection-id')) {
            const collectionId = triggerElement.getAttribute('data-collection-id');
            console.log('Found collection ID in trigger element:', collectionId);
            this.editCollection(collectionId);
        } else {
            console.log('No trigger element or no collection ID - creating new collection');
            // Creating new collection
            this.currentCollection = null;
            this.populateCollectionForm();
        }
        
        console.log('Current currentCollection after setup:', this.currentCollection);
    }

    populateCollectionForm(collection = null) {
        console.log('Populating form with collection:', collection);
        
        // Wait for modal to be fully rendered
        setTimeout(() => {
            // Basic fields
            const nameInput = document.getElementById('collectionName');
            const descriptionInput = document.getElementById('collectionDescription');
            const statusSelect = document.getElementById('collectionStatus');
            const tagsInput = document.getElementById('collectionTags');

            console.log('Form elements found:', {
                nameInput: !!nameInput,
                descriptionInput: !!descriptionInput,
                statusSelect: !!statusSelect,
                tagsInput: !!tagsInput
            });

            if (nameInput) nameInput.value = collection ? collection.name : '';
            if (descriptionInput) descriptionInput.value = collection ? (collection.description || '') : '';
            if (statusSelect) statusSelect.value = collection ? collection.status : 'active';
            if (tagsInput) tagsInput.value = collection ? (collection.tags || []).join(', ') : '';

            console.log('Form populated with values:', {
                name: nameInput?.value,
                description: descriptionInput?.value,
                status: statusSelect?.value,
                tags: tagsInput?.value
            });

            // Wines selection
            this.populateWinesSelection(collection);

            // Dynamic fields
            this.populateDynamicFields(collection);

            // Cover image gallery
            this.loadCoverImageGallery(collection);

            // Update modal title
            const modalTitle = document.querySelector('#collectionModal .modal-title');
            if (modalTitle) {
                modalTitle.textContent = collection ? 'Edytuj kolekcję' : 'Nowa kolekcja';
            }
        }, 100); // Small delay to ensure modal is rendered
    }

    /**
     * Normalizuje tekst Unicode usuwając diakrytyki i konwertując na lowercase
     */
    normalizeText(text) {
        if (!text) return '';
        return text
            .normalize('NFD')                    // Unicode normalization
            .replace(/[\u0300-\u036f]/g, '')     // Usuń diakrytyki
            .replace(/\s+/g, ' ')                // Zamień wszystkie białe znaki (spacje, \n, \t) na pojedyncze spacje
            .toLowerCase()                       // Na małe litery  
            .trim();                            // Usuń spacje z początku i końca
    }

    /**
     * Pobiera unikalne znormalizowane kategorie z win
     */
    getUniqueCategories() {
        const categoryMap = new Map();
        this.wines.forEach(wine => {
            if (wine.category) {
                const normalizedKey = this.normalizeText(wine.category);
                if (!categoryMap.has(normalizedKey)) {
                    categoryMap.set(normalizedKey, wine.category);
                }
            }
        });
        return Array.from(categoryMap.values()).sort();
    }

    /**
     * Pobiera unikalne znormalizowane typy z win
     */
    getUniqueTypes() {
        const typeMap = new Map();
        this.wines.forEach(wine => {
            if (wine.type) {
                const normalizedKey = this.normalizeText(wine.type);
                if (!typeMap.has(normalizedKey)) {
                    typeMap.set(normalizedKey, wine.type);
                }
            }
        });
        return Array.from(typeMap.values()).sort();
    }

    populateWinesSelection(collection) {
        const container = document.getElementById('collectionWinesSelection');
        if (!container) return;

        // Reset flagi "tylko zaznaczone" przy otwarciu modalu
        this.showOnlySelected = false;

        // Guard - sprawdź czy wina są załadowane
        if (!this.wines || this.wines.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Ładowanie...</span>
                    </div>
                    <p class="mt-3 text-muted">Ładowanie listy win...</p>
                </div>
            `;
            return;
        }

        // 🏷️ Używamy catalogNumber jako biznesowego identyfikatora w kolekcjach
        const selectedWineCatalogNumbers = collection ? (collection.wines || []).map(wine => 
            typeof wine === 'string' ? wine : wine.catalogNumber
        ) : [];
        
        // Załaduj zaznaczone wina do stanu komponentu
        this.selectedWineCatalogNumbers.clear();
        selectedWineCatalogNumbers.forEach(catalogNumber => {
            this.selectedWineCatalogNumbers.add(catalogNumber);
        });
        
        // Zapisz stan początkowy dla wykrywania zmian
        this.originalWineSelection.clear();
        selectedWineCatalogNumbers.forEach(catalogNumber => {
            this.originalWineSelection.add(catalogNumber);
        });
        this.hasUnsavedChanges = false;

        // Zbierz unikalne kategorie i typy z win (używając helper methods)
        const categories = this.getUniqueCategories();
        const types = this.getUniqueTypes();

        container.innerHTML = `
            <!-- Wyszukiwanie i filtrowanie - nad listą win -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h6 class="mb-0">
                                <i class="bi bi-search me-2"></i>Wyszukaj i filtruj wina
                            </h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <!-- Wyszukiwarka i statystyki -->
                                <div class="col-md-6 mb-3">
                                    <label for="wineSearchInput" class="form-label small fw-bold">
                                        <i class="bi bi-search me-1"></i>Wyszukaj po nazwie, regionie lub szczepach
                                    </label>
                                    <input type="text" class="form-control mb-3" id="wineSearchInput" placeholder="Wpisz szukane słowo...">
                                    
                                    <!-- Statystyki inline -->
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <div class="d-flex gap-4">
                                            <div class="text-center">
                                                <div class="text-primary fw-bold fs-6" id="totalWinesCount">${this.wines.length}</div>
                                                <small class="text-muted">Dostępne</small>
                                            </div>
                                            <div class="text-center">
                                                <div class="text-success fw-bold fs-6" id="selectedWinesCount">${this.selectedWineCatalogNumbers.size}</div>
                                                <small class="text-muted">Zaznaczone</small>
                                            </div>
                                        </div>
                                        <div class="d-flex gap-1">
                                            <button type="button" class="btn btn-outline-primary btn-sm" id="selectAllWinesBtn" title="Zaznacz wszystkie widoczne wina">
                                                <i class="bi bi-check-all"></i>
                                            </button>
                                            <button type="button" class="btn btn-outline-secondary btn-sm" id="deselectAllWinesBtn" title="Odznacz wszystkie wina">
                                                <i class="bi bi-x-square"></i>
                                            </button>
                                            <button type="button" class="btn btn-outline-success btn-sm" id="showSelectedWinesBtn" title="Pokaż tylko zaznaczone wina">
                                                <i class="bi bi-funnel"></i> Zaznaczone
                                            </button>
                                            <button type="button" class="btn btn-outline-warning btn-sm" id="showAllWinesBtn" title="Pokaż wszystkie wina" style="display: none;">
                                                <i class="bi bi-arrow-counterclockwise"></i> Wszystkie
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Filtry kategorii -->
                                ${categories.length > 0 ? `
                                <div class="col-md-3 mb-3">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <label class="form-label small fw-bold mb-0">
                                            <i class="bi bi-funnel me-1"></i>Kategoria
                                        </label>
                                        <button type="button" class="btn btn-sm btn-outline-secondary" id="clearCategoryFilters">
                                            <i class="bi bi-x-circle me-1"></i>Wyczyść
                                        </button>
                                    </div>
                                    <div class="wine-categories-scroll" style="max-height: 120px; overflow-y: auto;">
                                        ${categories.map(category => `
                                            <div class="form-check mb-1">
                                                <input class="form-check-input wine-category-checkbox" type="checkbox" value="${category}" id="cat_${category.replace(/\s+/g, '_')}">
                                                <label class="form-check-label d-flex justify-content-between align-items-center" for="cat_${category.replace(/\s+/g, '_')}">
                                                    <span class="small">${category}</span>
                                                    <span class="badge bg-light text-dark small" id="count_cat_${category.replace(/\s+/g, '_')}">${this.wines.filter(wine => wine.category === category).length}</span>
                                                </label>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                ` : ''}
                                
                                <!-- Filtry typów -->
                                ${types.length > 0 ? `
                                <div class="col-md-3 mb-3">
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <label class="form-label small fw-bold mb-0">
                                            <i class="bi bi-tag me-1"></i>Typ wina
                                        </label>
                                        <button type="button" class="btn btn-sm btn-outline-secondary" id="clearTypeFilters">
                                            <i class="bi bi-x-circle me-1"></i>Wyczyść
                                        </button>
                                    </div>
                                    <div class="wine-types-scroll" style="max-height: 120px; overflow-y: auto;">
                                        ${types.map(type => `
                                            <div class="form-check mb-1">
                                                <input class="form-check-input wine-type-checkbox" type="checkbox" value="${type}" id="type_${type.replace(/\s+/g, '_')}">
                                                <label class="form-check-label d-flex justify-content-between align-items-center" for="type_${type.replace(/\s+/g, '_')}">
                                                    <span class="small">${type}</span>
                                                    <span class="badge bg-light text-dark small" id="count_type_${type.replace(/\s+/g, '_')}">${this.wines.filter(wine => wine.type === type).length}</span>
                                                </label>
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Lista win -->
            <div class="row">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="mb-0">
                                    <i class="bi bi-bottle me-2"></i>Lista win
                                </h6>
                                <div id="winesPaginationInfo" class="text-muted small">
                                    <i class="bi bi-list-ol me-1"></i>
                                    Strona <span id="currentPageDisplay">1</span> z <span id="totalPagesDisplay">1</span> 
                                    (<span id="paginationRange">1-12</span> z <span id="filteredWinesCount">${this.wines.length}</span> win)
                                </div>
                            </div>
                        </div>
                        <div class="card-body" style="min-height: 400px;">
                            <!-- Alert z aktywnymi filtrami -->
                            <div id="wineFilterInfo" style="display: none;"></div>
                            
                            <!-- Lista win -->
                            <div id="availableWines" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--ds-space-4);">
                                <!-- Wina będą renderowane przez renderWinesPage() -->
                            </div>
                            
                            <!-- Brak wyników -->
                            <div id="noWinesMessage" class="text-center py-5" style="display: none;">
                                <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
                                <h5 class="text-muted mt-3">Brak wyników</h5>
                                <p class="text-muted">Nie znaleziono win spełniających kryteria wyszukiwania.</p>
                                <button type="button" class="btn btn-outline-primary" onclick="window.collectionsApp.managers.collections.clearAllFilters()">
                                    <i class="bi bi-arrow-clockwise me-1"></i>Wyczyść filtry
                                </button>
                            </div>
                        </div>
                        <div class="card-footer bg-light">
                            <!-- Paginacja -->
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="btn-group btn-group-sm">
                                    <button type="button" class="btn btn-outline-secondary" id="prevPageBtn" disabled>
                                        <i class="bi bi-chevron-left me-1"></i>Poprzednia
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary" id="nextPageBtn">
                                        Następna<i class="bi bi-chevron-right ms-1"></i>
                                    </button>
                                </div>
                                <div id="winesPagination">
                                    <!-- Numerowana paginacja będzie renderowana przez renderPagination() -->
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // NAJPIERW zainicjalizuj paginację
        this.initializeWinePagination();

        // Setup wine search - BEZ automatycznego wywoływania filtrów
        const searchInput = document.getElementById('wineSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                this.filterWinesSelection();
            }, 300));
        }

        // Setup category checkboxes - BEZ automatycznego wywoływania filtrów
        const categoryCheckboxes = document.querySelectorAll('.wine-category-checkbox');
        categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.filterWinesSelection();
            });
        });

        // Setup type checkboxes - BEZ automatycznego wywoływania filtrów
        const typeCheckboxes = document.querySelectorAll('.wine-type-checkbox');
        typeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.filterWinesSelection();
            });
        });

        // Setup clear category filters button
        const clearCategoryFiltersBtn = document.getElementById('clearCategoryFilters');
        if (clearCategoryFiltersBtn) {
            clearCategoryFiltersBtn.addEventListener('click', () => {
                // Odznacz wszystkie checkboxy kategorii
                categoryCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                this.filterWinesSelection();
            });
        }

        // Setup clear type filters button
        const clearTypeFiltersBtn = document.getElementById('clearTypeFilters');
        if (clearTypeFiltersBtn) {
            clearTypeFiltersBtn.addEventListener('click', () => {
                // Odznacz wszystkie checkboxy typów
                typeCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                this.filterWinesSelection();
            });
        }

        // Setup select/deselect all buttons
        const selectAllBtn = document.getElementById('selectAllWinesBtn');
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                this.selectAllVisibleWines();
            });
        }

        const deselectAllBtn = document.getElementById('deselectAllWinesBtn');
        if (deselectAllBtn) {
            deselectAllBtn.addEventListener('click', () => {
                this.deselectAllWines();
            });
        }

        // Setup show selected wines button
        const showSelectedBtn = document.getElementById('showSelectedWinesBtn');
        if (showSelectedBtn) {
            showSelectedBtn.addEventListener('click', () => {
                this.showOnlySelectedWines();
            });
        }

        // Setup show all wines button
        const showAllBtn = document.getElementById('showAllWinesBtn');
        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => {
                this.showAllWines();
            });
        }

        // Setup pagination buttons
        const prevPageBtn = document.getElementById('prevPageBtn');
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (this.winePagination.currentPage > 1) {
                    this.winePagination.currentPage--;
                    this.renderWinesPage();
                }
            });
        }

        const nextPageBtn = document.getElementById('nextPageBtn');
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                if (this.winePagination.currentPage < this.winePagination.totalPages) {
                    this.winePagination.currentPage++;
                    this.renderWinesPage();
                }
            });
        }

        // Renderuj pierwszą stronę (paginacja już zainicjalizowana wcześniej)
        this.renderWinesPage();
        
        // Jeśli edytujemy kolekcję z winami, posortuj tak aby zaznaczone były na początku
        if (collection && this.selectedWineCatalogNumbers.size > 0) {
            setTimeout(() => {
                this.sortWinesSelectedFirst();
            }, 100); // Delay aby UI się załadował
        }
    }

    filterWinesSelection() {
        // Guard - sprawdź czy paginacja jest zainicjalizowana
        if (!this.winePagination || !this.winePagination.filteredWines) {
            return;
        }

        const searchInput = document.getElementById('wineSearchInput');
        const categoryCheckboxes = document.querySelectorAll('.wine-category-checkbox:checked');
        const typeCheckboxes = document.querySelectorAll('.wine-type-checkbox:checked');
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.value);
        const selectedTypes = Array.from(typeCheckboxes).map(cb => cb.value);

        // Filtruj wina na podstawie kryteriów (z normalizacją Unicode)
        this.winePagination.filteredWines = this.wines.filter(wine => {
            const name = wine.name.toLowerCase();
            const region = (wine.region || '').toLowerCase();
            const szczepy = (wine.szczepy || '').toLowerCase();
            const category = wine.category || '';
            const type = wine.type || '';

            // Sprawdź czy wino pasuje do wyszukiwania tekstowego
            const matchesSearch = searchTerm === '' || 
                name.includes(searchTerm) || 
                region.includes(searchTerm) || 
                szczepy.includes(searchTerm);

            // Sprawdź czy wino pasuje do wybranych kategorii (z normalizacją Unicode)
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(selectedCat => {
                return this.normalizeText(category) === this.normalizeText(selectedCat);
            });

            // Sprawdź czy wino pasuje do wybranych typów (z normalizacją Unicode)
            const matchesType = selectedTypes.length === 0 || selectedTypes.some(selectedType => {
                return this.normalizeText(type) === this.normalizeText(selectedType);
            });

            // Sprawdź czy wino pasuje do filtru "tylko zaznaczone"
            const matchesSelectedFilter = !this.showOnlySelected || this.selectedWineCatalogNumbers.has(wine.catalogNumber);

            return matchesSearch && matchesCategory && matchesType && matchesSelectedFilter;
        });

        // Zaktualizuj paginację
        this.winePagination.totalItems = this.winePagination.filteredWines.length;
        this.winePagination.totalPages = Math.ceil(this.winePagination.totalItems / this.winePagination.itemsPerPage);
        this.winePagination.currentPage = 1; // Reset do pierwszej strony po filtrowaniu

        // Zaktualizuj liczniki kategorii i typów
        this.updateCategoryCounts();
        this.updateTypeCounts();

        // Renderuj nową stronę
        this.renderWinesPage();

        // Aktualizuj informacje o filtrach
        this.updateFilterInfo(searchTerm, selectedCategories, selectedTypes);
    }

    updateFilterInfo(searchTerm, selectedCategories, selectedTypes) {
        let filterInfo = document.getElementById('wineFilterInfo');
        if (!filterInfo) {
            // W nowym layoutcie filterInfo jest już w HTML
            filterInfo = document.getElementById('wineFilterInfo');
            if (!filterInfo) return;
        }
        
        const hasActiveFilters = searchTerm || selectedCategories.length > 0 || selectedTypes.length > 0 || this.showOnlySelected;
        if (hasActiveFilters) {
            const searchText = searchTerm ? `<strong>Szukane:</strong> "${searchTerm}"` : '';
            const categoryText = selectedCategories.length > 0 ? `<strong>Kategorie:</strong> ${selectedCategories.join(', ')}` : '';
            const typeText = selectedTypes.length > 0 ? `<strong>Typy:</strong> ${selectedTypes.join(', ')}` : '';
            const selectedText = this.showOnlySelected ? `<strong>Widok:</strong> Tylko zaznaczone wina` : '';
            
            const filters = [searchText, categoryText, typeText, selectedText].filter(Boolean);
            const filtersText = filters.join(' | ');
            
            filterInfo.className = 'alert alert-primary border-0 mb-3';
            filterInfo.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="bi bi-funnel-fill me-2"></i>
                    <div class="flex-grow-1">
                        <div class="fw-bold">Aktywne filtry:</div>
                        <div class="small">${filtersText}</div>
                        <div class="small text-muted mt-1">
                            Znaleziono <strong>${this.winePagination.totalItems}</strong> z <strong>${this.wines.length}</strong> win
                        </div>
                    </div>
                    <button type="button" class="btn btn-sm btn-light" onclick="window.collectionsApp.managers.collections.clearAllFilters()">
                        <i class="bi bi-x-circle me-1"></i>Wyczyść
                    </button>
                </div>
            `;
            filterInfo.style.display = 'block';
        } else {
            filterInfo.style.display = 'none';
        }
    }

    clearAllFilters() {
        // Wyczyść wyszukiwanie
        const searchInput = document.getElementById('wineSearchInput');
        if (searchInput) {
            searchInput.value = '';
        }

        // Odznacz wszystkie kategorie
        const categoryCheckboxes = document.querySelectorAll('.wine-category-checkbox');
        categoryCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Odznacz wszystkie typy
        const typeCheckboxes = document.querySelectorAll('.wine-type-checkbox');
        typeCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        // Zastosuj filtry (czyli pokaż wszystkie wina)
        this.filterWinesSelection();
    }

    updateCategoryCounts() {
        const searchInput = document.getElementById('wineSearchInput');
        const typeCheckboxes = document.querySelectorAll('.wine-type-checkbox:checked');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedTypes = Array.from(typeCheckboxes).map(cb => cb.value);
        
        // Dla każdej kategorii policz ile win jest widocznych po zastosowaniu filtrów
        const categories = this.getUniqueCategories();
        
        categories.forEach(category => {
            const countElement = document.getElementById(`count_cat_${category.replace(/\s+/g, '_')}`);
            if (countElement) {
                const visibleCount = this.wines.filter(wine => {
                    const matchesSearch = searchTerm === '' || 
                                        wine.name.toLowerCase().includes(searchTerm) || 
                                        (wine.region || '').toLowerCase().includes(searchTerm) || 
                                        (wine.szczepy || '').toLowerCase().includes(searchTerm);
                    const matchesType = selectedTypes.length === 0 || selectedTypes.some(selectedType => {
                        return this.normalizeText(wine.type || '') === this.normalizeText(selectedType);
                    });
                    const matchesCategory = this.normalizeText(wine.category || '') === this.normalizeText(category);
                    return matchesCategory && matchesSearch && matchesType;
                }).length;
                
                countElement.textContent = visibleCount;
                countElement.className = visibleCount > 0 ? 'badge bg-primary text-white small' : 'badge bg-light text-muted small';
            }
        });
    }

    updateTypeCounts() {
        const searchInput = document.getElementById('wineSearchInput');
        const categoryCheckboxes = document.querySelectorAll('.wine-category-checkbox:checked');
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const selectedCategories = Array.from(categoryCheckboxes).map(cb => cb.value);
        
        // Dla każdego typu policz ile win jest widocznych po zastosowaniu filtrów
        const types = this.getUniqueTypes();
        
        types.forEach(type => {
            const countElement = document.getElementById(`count_type_${type.replace(/\s+/g, '_')}`);
            if (countElement) {
                const visibleCount = this.wines.filter(wine => {
                    const matchesSearch = searchTerm === '' || 
                                        wine.name.toLowerCase().includes(searchTerm) || 
                                        (wine.region || '').toLowerCase().includes(searchTerm) || 
                                        (wine.szczepy || '').toLowerCase().includes(searchTerm);
                    const matchesCategory = selectedCategories.length === 0 || selectedCategories.some(selectedCat => {
                        return this.normalizeText(wine.category || '') === this.normalizeText(selectedCat);
                    });
                    const matchesType = this.normalizeText(wine.type || '') === this.normalizeText(type);
                    return matchesType && matchesSearch && matchesCategory;
                }).length;
                
                countElement.textContent = visibleCount;
                countElement.className = visibleCount > 0 ? 'badge bg-success text-white small' : 'badge bg-light text-muted small';
            }
        });
    }

    initializeWinePagination() {
        this.winePagination.filteredWines = [...this.wines];
        this.winePagination.totalItems = this.wines.length;
        this.winePagination.totalPages = Math.ceil(this.winePagination.totalItems / this.winePagination.itemsPerPage);
        this.winePagination.currentPage = 1;
    }

    renderWinesPage() {
        const container = document.getElementById('availableWines');
        const noWinesMessage = document.getElementById('noWinesMessage');
        if (!container) return;

        // Oblicz zakres dla aktualnej strony
        const startIndex = (this.winePagination.currentPage - 1) * this.winePagination.itemsPerPage;
        const endIndex = startIndex + this.winePagination.itemsPerPage;
        const currentPageWines = this.winePagination.filteredWines.slice(startIndex, endIndex);

        // Sprawdź czy są jakieś wina do wyświetlenia
        if (currentPageWines.length === 0) {
            container.innerHTML = '';
            if (noWinesMessage) noWinesMessage.style.display = 'block';
        } else {
            if (noWinesMessage) noWinesMessage.style.display = 'none';
            
            // Renderuj wina w gridzie - kompaktowy widok kart
            container.innerHTML = currentPageWines.map(wine => `
                <div class="wine-item" data-category="${wine.category || ''}" data-name="${wine.name.toLowerCase()}" data-region="${(wine.region || '').toLowerCase()}" data-szczepy="${(wine.szczepy || '').toLowerCase()}">
                    <div class="ds-card" data-wine-catalog="${wine.catalogNumber}" style="height: 100%; display: flex; flex-direction: column;">
                        <div class="position-relative">
                            <div class="form-check position-absolute" style="top: var(--ds-space-2); right: var(--ds-space-2); z-index: 10;">
                                <input class="form-check-input wine-checkbox" type="checkbox" value="${wine.catalogNumber}" 
                                       id="wine_${wine.catalogNumber}" ${this.selectedWineCatalogNumbers.has(wine.catalogNumber) ? 'checked' : ''}>
                            </div>
                            <div class="d-flex align-items-center justify-content-center" style="height: 160px; padding: var(--ds-space-4); background: var(--ds-color-neutral-50);">
                                ${wine.image ? 
                                    `<img src="${wine.image}" class="img-fluid" style="max-height: 140px; max-width: 100%; object-fit: contain;" alt="${wine.name}">` : 
                                    `<div class="bg-light rounded d-flex align-items-center justify-content-center" style="width: 80px; height: 140px;">
                                        <i class="bi bi-bottle text-muted" style="font-size: 2.5rem;"></i>
                                    </div>`
                                }
                            </div>
                        </div>
                        
                        <div class="ds-card-body" style="flex: 1; display: flex; flex-direction: column;">
                            <h6 class="fw-bold mb-2" style="font-size: var(--ds-font-size-sm); line-height: 1.3; min-height: 2.6em; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                                ${wine.name}
                            </h6>
                            
                            <div style="font-size: var(--ds-font-size-xs); color: var(--ds-color-neutral-600); flex: 1;">
                                ${wine.category ? `<div class="mb-1"><i class="bi bi-tag-fill me-1" style="color: var(--ds-color-primary);"></i>${wine.category}</div>` : ''}
                                ${wine.region ? `<div class="mb-1"><i class="bi bi-geo-alt-fill me-1" style="color: var(--ds-color-primary);"></i>${wine.region}</div>` : ''}
                                ${wine.szczepy ? `<div class="mb-1"><i class="bi bi-flower1 me-1" style="color: var(--ds-color-primary);"></i>${wine.szczepy}</div>` : ''}
                                ${wine.alcohol ? `<div class="mb-1"><i class="bi bi-percent me-1" style="color: var(--ds-color-primary);"></i>${wine.alcohol}% Vol</div>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        // Dodaj event listenery do checkboxów
        const checkboxes = container.querySelectorAll('.wine-checkbox');
        
        // Usuń istniejące event listenery (jeśli jakieś były)
        checkboxes.forEach(checkbox => {
            // Klonuj element żeby usunąć wszystkie event listenery
            const newCheckbox = checkbox.cloneNode(true);
            checkbox.parentNode.replaceChild(newCheckbox, checkbox);
        });
        
        // Ponownie pobierz checkboxy po klonowaniu
        const freshCheckboxes = container.querySelectorAll('.wine-checkbox');
        
        freshCheckboxes.forEach((checkbox, index) => {
            checkbox.addEventListener('change', (e) => {
                const catalogNumber = checkbox.value;
                
                if (checkbox.checked) {
                    this.selectedWineCatalogNumbers.add(catalogNumber);
                } else {
                    this.selectedWineCatalogNumbers.delete(catalogNumber);
                }
                this.updateSelectedWinesCount();
            });
        });

        // Dodaj event listenery do kart - kliknięcie w kartę zaznacza wino
        const wineCards = container.querySelectorAll('.wine-card');
        wineCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Nie przełączaj checkboxa jeśli kliknięto w przycisk rozwijania opisu
                if (e.target.classList.contains('expand-description') || 
                    e.target.closest('.expand-description')) {
                    return;
                }
                
                // Nie przełączaj jeśli kliknięto bezpośrednio w checkbox
                if (e.target.classList.contains('wine-checkbox')) {
                    return;
                }
                
                const catalogNumber = card.dataset.wineCatalog;
                const checkbox = card.querySelector(`#wine_${catalogNumber}`);
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    
                    // Ręcznie aktualizuj selectedWineCatalogNumbers
                    if (checkbox.checked) {
                        this.selectedWineCatalogNumbers.add(catalogNumber);
                    } else {
                        this.selectedWineCatalogNumbers.delete(catalogNumber);
                    }
                    
                    this.updateSelectedWinesCount();
                }
            });
        });

        // Aktualizuj informacje o paginacji
        this.updatePaginationInfo();
        this.renderPagination();
        this.updateSelectedWinesCount();
    }

    updatePaginationInfo() {
        const currentPageDisplay = document.getElementById('currentPageDisplay');
        const totalPagesDisplay = document.getElementById('totalPagesDisplay');
        const paginationRange = document.getElementById('paginationRange');
        const filteredWinesCount = document.getElementById('filteredWinesCount');
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');

        if (currentPageDisplay) currentPageDisplay.textContent = this.winePagination.currentPage;
        if (totalPagesDisplay) totalPagesDisplay.textContent = this.winePagination.totalPages;
        if (filteredWinesCount) filteredWinesCount.textContent = this.winePagination.totalItems;

        const startIndex = (this.winePagination.currentPage - 1) * this.winePagination.itemsPerPage + 1;
        const endIndex = Math.min(this.winePagination.currentPage * this.winePagination.itemsPerPage, this.winePagination.totalItems);
        if (paginationRange) paginationRange.textContent = `${startIndex}-${endIndex}`;

        if (prevPageBtn) prevPageBtn.disabled = this.winePagination.currentPage <= 1;
        if (nextPageBtn) nextPageBtn.disabled = this.winePagination.currentPage >= this.winePagination.totalPages;
    }

    renderPagination() {
        const container = document.getElementById('winesPagination');
        if (!container) return;

        // Jeśli jest tylko jedna strona, pokaż uproszczoną paginację (wyłączoną)
        if (this.winePagination.totalPages <= 1) {
            container.innerHTML = `
                <nav aria-label="Paginacja win">
                    <ul class="pagination pagination-sm justify-content-center mb-0">
                        <li class="page-item disabled">
                            <span class="page-link">
                                <i class="bi bi-chevron-left"></i> Poprzednia
                            </span>
                        </li>
                        <li class="page-item active">
                            <span class="page-link">1</span>
                        </li>
                        <li class="page-item disabled">
                            <span class="page-link">
                                Następna <i class="bi bi-chevron-right"></i>
                            </span>
                        </li>
                    </ul>
                </nav>
            `;
            return;
        }

        const currentPage = this.winePagination.currentPage;
        const totalPages = this.winePagination.totalPages;
        let pages = [];

        // Logika dla wyświetlania numerów stron
        if (totalPages <= 7) {
            // Pokaż wszystkie strony jeśli jest ich mało
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Pokazuj smart pagination dla wielu stron
            pages.push(1);
            
            if (currentPage > 4) {
                pages.push('...');
            }
            
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) {
                    pages.push(i);
                }
            }
            
            if (currentPage < totalPages - 3) {
                pages.push('...');
            }
            
            if (!pages.includes(totalPages)) {
                pages.push(totalPages);
            }
        }

        container.innerHTML = `
            <nav>
                <ul class="pagination pagination-sm">
                    <li class="page-item ${currentPage <= 1 ? 'disabled' : ''}">
                        <button class="page-link" onclick="window.collectionsApp.managers.collections.goToPage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''}>
                            <i class="bi bi-chevron-left"></i>
                        </button>
                    </li>
                    ${pages.map(page => {
                        if (page === '...') {
                            return '<li class="page-item disabled"><span class="page-link">...</span></li>';
                        }
                        return `
                            <li class="page-item ${page === currentPage ? 'active' : ''}">
                                <button class="page-link" onclick="window.collectionsApp.managers.collections.goToPage(${page})">${page}</button>
                            </li>
                        `;
                    }).join('')}
                    <li class="page-item ${currentPage >= totalPages ? 'disabled' : ''}">
                        <button class="page-link" onclick="window.collectionsApp.managers.collections.goToPage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''}>
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </li>
                </ul>
            </nav>
        `;
    }

    goToPage(pageNumber) {
        if (pageNumber >= 1 && pageNumber <= this.winePagination.totalPages) {
            this.winePagination.currentPage = pageNumber;
            this.renderWinesPage();
        }
    }

    selectAllVisibleWines() {
        const checkboxes = document.querySelectorAll('#availableWines .wine-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            this.selectedWineCatalogNumbers.add(checkbox.value);
        });
        this.updateSelectedWinesCount();
    }

    deselectAllWines() {
        // Odznacz wszystkie wina (nie tylko widoczne)
        this.selectedWineCatalogNumbers.clear();
        // Zaktualizuj checkboxy w DOM
        const checkboxes = document.querySelectorAll('#availableWines .wine-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        this.updateSelectedWinesCount();
    }

    updateSelectedWinesCount() {
        const selectedCount = this.selectedWineCatalogNumbers.size;
        const selectedWinesCountElement = document.getElementById('selectedWinesCount');
        if (selectedWinesCountElement) {
            selectedWinesCountElement.textContent = selectedCount;
        }
        
        // Sprawdź czy są niezapisane zmiany
        this.checkForUnsavedChanges();
        
        // Live update tytułu modalu z aktualną liczbą win
        const modalTitle = document.querySelector('#collectionModal .modal-title');
        if (modalTitle) {
            const isEditing = this.currentCollection !== null;
            const baseTitle = isEditing ? 'Edytuj kolekcję' : 'Nowa kolekcja';
            const changesIndicator = this.hasUnsavedChanges ? ' *' : '';
            modalTitle.textContent = `${baseTitle} (${selectedCount} ${selectedCount === 1 ? 'wino' : selectedCount < 5 ? 'wina' : 'win'})${changesIndicator}`;
        }
    }

    checkForUnsavedChanges() {
        // Porównaj aktualny stan z stanem początkowym
        const currentSelection = this.selectedWineCatalogNumbers;
        const originalSelection = this.originalWineSelection;
        
        // Sprawdź czy liczba win się zmieniła
        if (currentSelection.size !== originalSelection.size) {
            this.hasUnsavedChanges = true;
            return;
        }
        
        // Sprawdź czy zawartość się zmieniła
        for (const catalogNumber of currentSelection) {
            if (!originalSelection.has(catalogNumber)) {
                this.hasUnsavedChanges = true;
                return;
            }
        }
        
        // Nie ma zmian
        this.hasUnsavedChanges = false;
    }

    showOnlySelectedWines() {
        // Filtruj wina tylko do zaznaczonych
        this.showOnlySelected = true;
        
        // Zaktualizuj przyciski
        const showSelectedBtn = document.getElementById('showSelectedWinesBtn');
        const showAllBtn = document.getElementById('showAllWinesBtn');
        if (showSelectedBtn) showSelectedBtn.style.display = 'none';
        if (showAllBtn) showAllBtn.style.display = 'inline-block';
        
        // Zastosuj filtr
        this.filterWinesSelection();
    }

    showAllWines() {
        // Pokaż wszystkie wina
        this.showOnlySelected = false;
        
        // Zaktualizuj przyciski  
        const showSelectedBtn = document.getElementById('showSelectedWinesBtn');
        const showAllBtn = document.getElementById('showAllWinesBtn');
        if (showSelectedBtn) showSelectedBtn.style.display = 'inline-block';
        if (showAllBtn) showAllBtn.style.display = 'none';
        
        // Zastosuj filtr
        this.filterWinesSelection();
    }

    sortWinesSelectedFirst() {
        // Sortuje wina tak aby zaznaczone były na początku listy
        if (!this.winePagination.filteredWines) return;
        
        this.winePagination.filteredWines.sort((a, b) => {
            const aSelected = this.selectedWineCatalogNumbers.has(a.catalogNumber);
            const bSelected = this.selectedWineCatalogNumbers.has(b.catalogNumber);
            
            // Zaznaczone wina na początku
            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            
            // W ramach tej samej grupy (zaznaczone/niezaznaczone) sortuj alfabetycznie po nazwie
            return a.name.localeCompare(b.name);
        });
        
        // Resetuj do pierwszej strony i przerenderuj
        this.winePagination.currentPage = 1;
        this.renderWinesPage();
    }

    toggleDescription(wineId) {
        const descriptionContainer = document.querySelector(`[data-wine-id="${wineId}"]`);
        if (!descriptionContainer) return;

        const descriptionText = descriptionContainer.querySelector('.description-text');
        const expandButton = descriptionContainer.querySelector('.expand-description');
        
        if (!descriptionText || !expandButton) return;

        const isExpanded = descriptionText.style.webkitLineClamp === 'none';
        
        if (isExpanded) {
            // Zwiń opis
            descriptionText.style.webkitLineClamp = '3';
            descriptionText.style.display = '-webkit-box';
            expandButton.innerHTML = '<i class="bi bi-chevron-down me-1"></i>Rozwiń opis';
        } else {
            // Rozwiń opis
            descriptionText.style.webkitLineClamp = 'none';
            descriptionText.style.display = 'block';
            expandButton.innerHTML = '<i class="bi bi-chevron-up me-1"></i>Zwiń opis';
        }
    }

    populateDynamicFields(collection) {
        console.log('🎨 populateDynamicFields called with collection:', collection);
        
        const dynamicFields = collection ? (collection.dynamicFields || {}) : {};
        console.log('📋 Dynamic fields from collection:', dynamicFields);
        console.log('🔧 Available field definitions:', this.collectionFields.map(f => ({ id: f.id, name: f.name, step: f.step })));

        // Pogrupuj pola według kroków
        const fieldsByStep = {
            1: [],
            2: [],
            3: [],
            4: []
        };

        this.collectionFields.forEach(field => {
            const step = field.step || 2; // Domyślnie krok 2
            if (fieldsByStep[step]) {
                fieldsByStep[step].push(field);
            }
        });

        // Renderuj pola dla każdego kroku
        for (let step = 1; step <= 4; step++) {
            const container = document.getElementById(`dynamicCollectionFieldsStep${step}`);
            if (!container) {
                console.warn(`❌ Container #dynamicCollectionFieldsStep${step} not found!`);
                continue;
            }

            const fieldsForStep = fieldsByStep[step];
            
            if (fieldsForStep.length === 0) {
                container.style.display = 'none';
                console.log(`ℹ️ No fields configured for step ${step}`);
                continue;
            }

            container.style.display = 'grid';

            // Użyj nowego systemu helperów jeśli jest dostępny
            if (window.CollectionFieldsHelpers) {
                console.log(`✨ Using CollectionFieldsHelpers for step ${step}`);
                container.innerHTML = fieldsForStep.map(field => {
                    const value = dynamicFields[field.id] || field.defaultValue || '';
                    console.log(`  🔹 Field "${field.name}" (${field.id}) in step ${step}: value = "${value}"`);
                    return window.CollectionFieldsHelpers.generateFormField(field, value, {
                        showLabel: true,
                        showHelpText: true,
                        additionalClasses: 'collection-dynamic-field'
                    });
                }).join('');
            } else {
                // Fallback do starej metody
                console.log(`📝 Using fallback renderFieldInput for step ${step}`);
                container.innerHTML = fieldsForStep.map(field => {
                    const value = dynamicFields[field.id] || field.defaultValue || '';
                    console.log(`  🔹 Field "${field.name}" (${field.id}) in step ${step}: value = "${value}"`);
                    return this.renderFieldInput(field, value);
                }).join('');
            }
        }

        // Obsługa starego kontenera dla kompatybilności wstecznej (krok 2)
        const oldContainer = document.getElementById('dynamicCollectionFields');
        if (oldContainer) {
            oldContainer.style.display = 'none'; // Ukryj stary kontener
        }

        // Pokaż/ukryj komunikat "brak pól" w kroku 2
        const noFieldsMsg = document.getElementById('noCustomFields');
        const totalFields = this.collectionFields.length;
        if (noFieldsMsg) {
            if (totalFields === 0) {
                noFieldsMsg.style.display = 'block';
            } else {
                noFieldsMsg.style.display = 'none';
            }
        }

        console.log('✅ Dynamic fields populated across all steps');
    }

    renderFieldInput(field, value = '') {
        const inputId = `dynamic_${field.id}`;
        let inputHtml = '';

        switch (field.type) {
            case 'text':
                inputHtml = `<input type="text" class="form-control" id="${inputId}" value="${value}" ${field.required ? 'required' : ''}>`;
                break;
            case 'number':
                inputHtml = `<input type="number" class="form-control" id="${inputId}" value="${value}" ${field.required ? 'required' : ''} ${field.validation?.min ? `min="${field.validation.min}"` : ''} ${field.validation?.max ? `max="${field.validation.max}"` : ''}>`;
                break;
            case 'boolean':
                inputHtml = `<select class="form-select" id="${inputId}" ${field.required ? 'required' : ''}>
                    <option value="">Wybierz...</option>
                    <option value="true" ${value === true || value === 'true' ? 'selected' : ''}>Tak</option>
                    <option value="false" ${value === false || value === 'false' ? 'selected' : ''}>Nie</option>
                </select>`;
                break;
            case 'date':
                const dateValue = value ? new Date(value).toISOString().split('T')[0] : '';
                inputHtml = `<input type="date" class="form-control" id="${inputId}" value="${dateValue}" ${field.required ? 'required' : ''}>`;
                break;
            case 'select':
                const options = field.options || [];
                inputHtml = `<select class="form-select" id="${inputId}" ${field.required ? 'required' : ''}>
                    <option value="">Wybierz...</option>
                    ${options.map(option => `<option value="${option}" ${value === option ? 'selected' : ''}>${option}</option>`).join('')}
                </select>`;
                break;
            case 'textarea':
                inputHtml = `<textarea class="form-control" id="${inputId}" rows="3" ${field.required ? 'required' : ''} ${field.validation?.max ? `maxlength="${field.validation.max}"` : ''}>${value}</textarea>`;
                break;
            default:
                inputHtml = `<input type="text" class="form-control" id="${inputId}" value="${value}" ${field.required ? 'required' : ''}>`;
        }

        return `
            <div class="mb-3">
                <label for="${inputId}" class="form-label">
                    ${field.name}
                    ${field.required ? '<span class="text-danger">*</span>' : ''}
                </label>
                ${inputHtml}
            </div>
        `;
    }

    async loadCoverImageGallery(collection = null) {
        console.log('🖼️ Loading cover image gallery');
        const galleryContainer = document.getElementById('coverImageGallery');
        const noImagesMsg = document.getElementById('noCoverImages');
        
        if (!galleryContainer) {
            console.error('❌ Gallery container not found');
            return;
        }

        try {
            // Pobierz listę dostępnych okładek
            const response = await api.getCollectionHelperCoverImages();
            
            if (!response.success || !response.data || response.data.length === 0) {
                galleryContainer.style.display = 'none';
                if (noImagesMsg) noImagesMsg.style.display = 'block';
                console.log('ℹ️ No cover images available');
                return;
            }

            galleryContainer.style.display = 'grid';
            if (noImagesMsg) noImagesMsg.style.display = 'none';

            // Pobierz aktualnie wybraną okładkę z kolekcji
            const currentCover = collection?.dynamicFields?.field_1732468800000_okladka || '';
            console.log('Current cover:', currentCover);

            // Renderuj galerię
            galleryContainer.innerHTML = response.data.map(imagePath => {
                const fileName = imagePath.split('/').pop();
                const isSelected = imagePath === currentCover;
                
                return `
                    <div class="cover-image-item ${isSelected ? 'selected' : ''}" data-cover="${imagePath}">
                        <img src="${imagePath}" alt="${fileName}" loading="lazy">
                        <div class="selection-indicator">
                            <i class="bi bi-check-lg"></i>
                        </div>
                        <div class="image-name">${fileName}</div>
                    </div>
                `;
            }).join('');

            // Dodaj obsługę kliknięć na okładki
            galleryContainer.querySelectorAll('.cover-image-item').forEach(item => {
                item.addEventListener('click', () => {
                    // Usuń zaznaczenie ze wszystkich
                    galleryContainer.querySelectorAll('.cover-image-item').forEach(i => {
                        i.classList.remove('selected');
                    });
                    
                    // Zaznacz klikniętą
                    item.classList.add('selected');
                    
                    // Zapisz wybór (będzie pobrany podczas zapisu kolekcji)
                    console.log('Selected cover:', item.dataset.cover);
                });
            });

            console.log('✅ Cover gallery loaded with', response.data.length, 'images');
        } catch (error) {
            console.error('❌ Failed to load cover images:', error);
            galleryContainer.style.display = 'none';
            if (noImagesMsg) {
                noImagesMsg.style.display = 'block';
                noImagesMsg.querySelector('p').textContent = 'Błąd podczas ładowania okładek';
            }
        }
    }

    async saveCollection() {
        try {
            console.log('Saving collection, currentCollection:', this.currentCollection);
            
            const formData = this.getCollectionFormData();
            console.log('Form data:', formData);
            
            if (!this.validateCollectionForm(formData)) {
                return;
            }

            this.setLoading(true);
            
            let response;
            if (this.currentCollection) {
                console.log('Updating existing collection with ID:', this.currentCollection.id);
                response = await api.updateCollection(this.currentCollection.id, formData);
            } else {
                console.log('Creating new collection');
                response = await api.createCollection(formData);
            }

            console.log('API response:', response);

            if (response.success) {
                // Reset stanu zmian po udanym zapisie
                this.originalWineSelection = new Set(this.selectedWineCatalogNumbers);
                this.hasUnsavedChanges = false;
                
                this.showNotification(
                    this.currentCollection ? 'Kolekcja została zaktualizowana' : 'Kolekcja została utworzona', 
                    'success'
                );
                this.hideModal('collectionModal');
                await this.refresh();
            } else {
                throw new Error(response.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Failed to save collection:', error);
            this.showNotification('Błąd podczas zapisywania kolekcji', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    getCollectionFormData() {
        const nameInput = document.getElementById('collectionName');
        const descriptionInput = document.getElementById('collectionDescription');
        const statusSelect = document.getElementById('collectionStatus');
        const tagsInput = document.getElementById('collectionTags');

        // Get selected wines - używaj stanu zachowanego w pamięci, nie DOM
        const selectedWines = Array.from(this.selectedWineCatalogNumbers);
        
        // Debug: Log aktualnego stanu zaznaczonych win
        console.log('getCollectionFormData: selectedWineCatalogNumbers ma', this.selectedWineCatalogNumbers.size, 'win:', Array.from(this.selectedWineCatalogNumbers));

        // Get selected cover image from gallery
        const selectedCoverItem = document.querySelector('.cover-image-item.selected');
        const selectedCover = selectedCoverItem ? selectedCoverItem.dataset.cover : '';
        console.log('Selected cover from gallery:', selectedCover);

        // Get dynamic fields
        let dynamicFields = {};
        console.log('🔍 Collecting dynamic fields, available fields:', this.collectionFields.map(f => ({ id: f.id, name: f.name })));
        
        // Użyj CollectionFieldsHelpers.getFormValues jeśli dostępny
        if (window.CollectionFieldsHelpers) {
            // Zbierz pola ze wszystkich kroków (1-4)
            for (let step = 1; step <= 4; step++) {
                const container = document.getElementById(`dynamicCollectionFieldsStep${step}`);
                if (container) {
                    const stepFields = window.CollectionFieldsHelpers.getFormValues(container, this.collectionFields);
                    Object.assign(dynamicFields, stepFields);
                    console.log(`✅ Zebrano pola z kroku ${step}:`, stepFields);
                }
            }
            
            // Zbierz także ze starego kontenera dla kompatybilności
            const oldContainer = document.getElementById('dynamicCollectionFields');
            if (oldContainer) {
                const oldFields = window.CollectionFieldsHelpers.getFormValues(oldContainer, this.collectionFields);
                Object.assign(dynamicFields, oldFields);
            }
        } else {
            // Fallback - zbieraj manualnie z ID dynamic_
            this.collectionFields.forEach(field => {
                const input = document.getElementById(`dynamic_${field.id}`);
                console.log(`  📝 Field "${field.name}" (${field.id}):`, {
                    inputFound: !!input,
                    inputValue: input?.value,
                    inputType: input?.type
                });
                if (input && input.value) {
                    let value = input.value;
                    
                    // Convert value based on field type
                    switch (field.type) {
                        case 'number':
                            value = parseFloat(value);
                            break;
                        case 'boolean':
                            value = value === 'true';
                            break;
                    }
                    
                    console.log(`  ✅ Saving field "${field.name}":`, value);
                    dynamicFields[field.id] = value;
                } else {
                    console.log(`  ⚠️ Skipping field "${field.name}" - input not found or empty`);
                }
            });
        }
        
        // Dodaj wybrane okładkę do dynamicFields (pole okladka)
        const okladkaField = this.collectionFields.find(f => f.name.toLowerCase() === 'okladka');
        if (okladkaField && selectedCover) {
            dynamicFields[okladkaField.id] = selectedCover;
            console.log(`  ✅ Added cover to field "${okladkaField.name}":`, selectedCover);
        }
        
        console.log('📦 Final dynamicFields object:', dynamicFields);

        return {
            name: nameInput?.value?.trim() || '',
            description: descriptionInput?.value?.trim() || '',
            status: statusSelect?.value || 'active',
            tags: tagsInput?.value ? tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean) : [],
            wines: selectedWines,
            coverImage: selectedCover || '', // ✅ FIX: Dodaj coverImage jako główne pole kolekcji
            dynamicFields
        };
    }

    validateCollectionForm(formData) {
        if (!formData.name) {
            this.showNotification('Nazwa kolekcji jest wymagana', 'error');
            return false;
        }

        // Validate dynamic fields
        for (const field of this.collectionFields) {
            if (field.required && !formData.dynamicFields[field.id]) {
                this.showNotification(`Pole "${field.name}" jest wymagane`, 'error');
                return false;
            }
        }

        return true;
    }

    async deleteCollection(id) {
        const collection = this.collections.find(c => c.id === id);
        if (!collection) return;

        const confirmed = await this.showConfirmDialog(
            'Usuń kolekcję',
            `Czy na pewno chcesz usunąć kolekcję "${collection.name}"? Ta operacja jest nieodwracalna.`
        );

        if (!confirmed) return;

        try {
            this.setLoading(true);
            const response = await api.deleteCollection(id);

            if (response.success) {
                this.showNotification('Kolekcja została usunięta', 'success');
                await this.refresh();
            } else {
                throw new Error(response.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Failed to delete collection:', error);
            this.showNotification('Błąd podczas usuwania kolekcji', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // Field Management Methods
    showFieldsManagementModal() {
        this.renderFieldsManagement();
        this.showModal('collectionFieldsModal');
    }

    renderFieldsManagement() {
        const container = document.getElementById('collectionFieldsList');
        if (!container) return;

        container.innerHTML = this.collectionFields.map(field => `
            <div class="card mb-2">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">${field.name}</h6>
                            <small class="text-muted">Typ: ${this.getFieldTypeDisplayName(field.type)}</small>
                            ${field.required ? '<span class="badge bg-warning ms-2">Wymagane</span>' : ''}
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button type="button" class="btn btn-outline-primary" 
                                    onclick="window.collectionsManager.editCollectionField('${field.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger" 
                                    onclick="window.collectionsManager.deleteCollectionField('${field.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getFieldTypeDisplayName(type) {
        const types = {
            text: 'Tekst',
            number: 'Liczba',
            boolean: 'Tak/Nie',
            date: 'Data',
            select: 'Lista wyboru',
            textarea: 'Tekst wieloliniowy'
        };
        return types[type] || type;
    }

    showCreateFieldModal() {
        this.currentField = null;
        this.populateFieldForm();
        this.showModal('collectionFieldModal');
    }

    async editCollectionField(fieldId) {
        try {
            const response = await api.getCollectionField(fieldId);
            if (response.success && response.data) {
                this.currentField = response.data;
                this.populateFieldForm(response.data);
                this.showModal('collectionFieldModal');
            }
        } catch (error) {
            console.error('Failed to load field for editing:', error);
            this.showNotification('Błąd podczas ładowania pola do edycji', 'error');
        }
    }

    populateFieldForm(field = null) {
        const nameInput = document.getElementById('fieldName');
        const typeSelect = document.getElementById('fieldType');
        const requiredCheckbox = document.getElementById('fieldRequired');
        const defaultValueInput = document.getElementById('fieldDefaultValue');

        if (nameInput) nameInput.value = field ? field.name : '';
        if (typeSelect) {
            typeSelect.value = field ? field.type : 'text';
            this.updateFieldTypeOptions();
        }
        if (requiredCheckbox) requiredCheckbox.checked = field ? field.required : false;
        if (defaultValueInput) defaultValueInput.value = field ? (field.defaultValue || '') : '';

        // Update modal title
        const modalTitle = document.querySelector('#collectionFieldModal .modal-title');
        if (modalTitle) {
            modalTitle.textContent = field ? 'Edytuj pole' : 'Nowe pole';
        }

        // Handle options for select type
        this.updateFieldOptions(field);
    }

    updateFieldTypeOptions() {
        const typeSelect = document.getElementById('fieldType');
        const optionsContainer = document.getElementById('fieldOptionsContainer');
        
        if (typeSelect && optionsContainer) {
            const isSelect = typeSelect.value === 'select';
            optionsContainer.style.display = isSelect ? 'block' : 'none';
        }
    }

    updateFieldOptions(field = null) {
        const optionsContainer = document.getElementById('fieldOptions');
        if (!optionsContainer) return;

        const options = field && field.options ? field.options : [''];
        
        optionsContainer.innerHTML = options.map((option, index) => `
            <div class="input-group mb-2">
                <input type="text" class="form-control" value="${option}" placeholder="Opcja ${index + 1}">
                <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    addFieldOption() {
        const optionsContainer = document.getElementById('fieldOptions');
        if (!optionsContainer) return;

        const optionCount = optionsContainer.children.length + 1;
        const optionHtml = `
            <div class="input-group mb-2">
                <input type="text" class="form-control" placeholder="Opcja ${optionCount}">
                <button type="button" class="btn btn-outline-danger" onclick="this.parentElement.remove()">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        optionsContainer.insertAdjacentHTML('beforeend', optionHtml);
    }

    async saveCollectionField() {
        try {
            const formData = this.getFieldFormData();
            
            if (!this.validateFieldForm(formData)) {
                return;
            }

            this.setLoading(true);
            
            let response;
            if (this.currentField) {
                response = await api.updateCollectionField(this.currentField.id, formData);
            } else {
                response = await api.createCollectionField(formData);
            }

            if (response.success) {
                this.showNotification(
                    this.currentField ? 'Pole zostało zaktualizowane' : 'Pole zostało utworzone', 
                    'success'
                );
                this.hideModal('collectionFieldModal');
                await this.loadCollectionFields();
                this.renderFieldsManagement();
            } else {
                throw new Error(response.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Failed to save field:', error);
            this.showNotification('Błąd podczas zapisywania pola', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    getFieldFormData() {
        const nameInput = document.getElementById('fieldName');
        const typeSelect = document.getElementById('fieldType');
        const requiredCheckbox = document.getElementById('fieldRequired');
        const defaultValueInput = document.getElementById('fieldDefaultValue');

        const formData = {
            name: nameInput?.value?.trim() || '',
            type: typeSelect?.value || 'text',
            required: requiredCheckbox?.checked || false,
            defaultValue: defaultValueInput?.value?.trim() || undefined
        };

        // Get options for select type
        if (formData.type === 'select') {
            const optionInputs = document.querySelectorAll('#fieldOptions input');
            formData.options = Array.from(optionInputs)
                .map(input => input.value.trim())
                .filter(Boolean);
        }

        return formData;
    }

    validateFieldForm(formData) {
        if (!formData.name) {
            this.showNotification('Nazwa pola jest wymagana', 'error');
            return false;
        }

        if (formData.type === 'select' && (!formData.options || formData.options.length === 0)) {
            this.showNotification('Pole typu "Lista wyboru" musi mieć przynajmniej jedną opcję', 'error');
            return false;
        }

        return true;
    }

    async deleteCollectionField(fieldId) {
        const field = this.collectionFields.find(f => f.id === fieldId);
        if (!field) return;

        const confirmed = await this.showConfirmDialog(
            'Usuń pole',
            `Czy na pewno chcesz usunąć pole "${field.name}"? Wszystkie dane w tym polu zostaną usunięte z istniejących kolekcji.`
        );

        if (!confirmed) return;

        try {
            this.setLoading(true);
            const response = await api.deleteCollectionField(fieldId);

            if (response.success) {
                this.showNotification('Pole zostało usunięte', 'success');
                await this.loadCollectionFields();
                this.renderFieldsManagement();
            } else {
                throw new Error(response.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Failed to delete field:', error);
            this.showNotification('Błąd podczas usuwania pola', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    // PDF Generation methods
    async previewPDF() {
        try {
            const modal = document.getElementById('pdfModal');
            if (!modal) return;

            const templateSelect = modal.querySelector('#pdfTemplate');
            const titleInput = modal.querySelector('#pdfTitle');
            const selectedTemplate = templateSelect.value;
            const customTitle = titleInput.value.trim();

            if (!selectedTemplate) {
                this.showNotification('Wybierz szablon PDF', 'error');
                return;
            }

            // Get collection data
            const collectionId = modal.dataset.collectionId;
            const collection = this.collections.find(c => c.id === collectionId);
            
            if (!collection) {
                this.showNotification('Nie znaleziono kolekcji', 'error');
                return;
            }

            // Prepare data for Template Editor preview
            // Format i marginesy będą pobrane z ustawień szablonu
            const templateData = {
                collectionId: collectionId,
                customTitle: customTitle || collection.name,
                options: {}
            };

            console.log('Template Editor preview data:', templateData);

            // Generate preview using Template Editor API
            const result = await api.previewCollectionTemplate(selectedTemplate, templateData);

            // Check if result is error object (JSON) or blob (PDF)
            if (result instanceof Blob) {
                // Success - got PDF blob
                const previewUrl = URL.createObjectURL(result);
                
                // Open preview in new window/tab
                const previewWindow = window.open(previewUrl, '_blank');
                
                // Clean up the URL after window is opened
                if (previewWindow) {
                    previewWindow.onload = () => {
                        URL.revokeObjectURL(previewUrl);
                    };
                } else {
                    URL.revokeObjectURL(previewUrl);
                    throw new Error('Nie udało się otworzyć okna podglądu');
                }
            } else if (result.success === false) {
                // Error response (JSON)
                throw new Error(result.error || 'Nieznany błąd podczas generowania podglądu');
            } else {
                throw new Error('Nieprawidłowa odpowiedź z serwera');
            }

        } catch (error) {
            console.error('Preview PDF error:', error);
            this.showNotification('Błąd podczas generowania podglądu PDF: ' + error.message, 'error');
        }
    }

    async generatePDF() {
        try {
            const modal = document.getElementById('pdfModal');
            if (!modal) return;

            const templateSelect = modal.querySelector('#pdfTemplate');
            const titleInput = modal.querySelector('#pdfTitle');
            const flattenCheckbox = modal.querySelector('#flattenPdf');
            const selectedTemplate = templateSelect.value;
            const customTitle = titleInput.value.trim();
            const shouldFlatten = flattenCheckbox.checked;

            if (!selectedTemplate) {
                this.showNotification('Wybierz szablon PDF', 'error');
                return;
            }

            // Get collection data
            const collectionId = modal.dataset.collectionId;
            const collection = this.collections.find(c => c.id === collectionId);
            
            if (!collection) {
                this.showNotification('Nie znaleziono kolekcji', 'error');
                return;
            }

            // Show loading state
            const generateBtn = modal.querySelector('#generatePdfBtn');
            const originalBtnText = generateBtn.textContent;
            generateBtn.disabled = true;
            generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generuję...';

            // Prepare data for Template Editor
            // Format i marginesy będą pobrane z ustawień szablonu
            const templateData = {
                collectionId: collectionId,
                customTitle: customTitle || collection.name,
                options: {
                    flatten: shouldFlatten
                }
            };

            // Generate PDF using Template Editor API
            const result = await api.generateCollectionTemplate(selectedTemplate, templateData);

            // Check if result is error object (JSON) or blob (PDF)
            if (result instanceof Blob) {
                // Success - got PDF blob
                console.log('✅ Generate PDF success - received blob:', result.size, 'bytes');
                
                // Close modal first
                this.hideModal('pdfModal');
                
                // Show success message
                this.showNotification('PDF został wygenerowany i zapisany. Możesz go teraz pobrać.', 'success');
                
                // Refresh collections to show the download button
                await this.refresh();
            } else if (result.success === false) {
                // Error response (JSON)
                throw new Error(result.error || 'Nieznany błąd podczas generowania PDF');
            } else {
                throw new Error('Nieprawidłowa odpowiedź z serwera');
            }

        } catch (error) {
            console.error('Generate PDF error:', error);
            this.showNotification('Błąd podczas generowania PDF: ' + error.message, 'error');
        } finally {
            // Reset button state
            const modal = document.getElementById('pdfModal');
            if (modal) {
                const generateBtn = modal.querySelector('#generatePdfBtn');
                if (generateBtn) {
                    generateBtn.disabled = false;
                    generateBtn.textContent = 'Generuj PDF';
                }
            }
        }
    }

    // Utility methods
    setLoading(loading) {
        this.isLoading = loading;
        const loadingIndicator = document.getElementById('collectionsLoading');
        if (loadingIndicator) {
            loadingIndicator.style.display = loading ? 'block' : 'none';
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const bsModal = new bootstrap.Modal(modal);
            bsModal.show();
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        }
    }

    // Metoda do bezpiecznego zamykania modalu kolekcji z ostrzeżeniem o niezapisanych zmianach
    safeHideCollectionModal() {
        if (this.hasUnsavedChanges) {
            const confirmClose = confirm('Masz niezapisane zmiany w wyborze win. Czy na pewno chcesz zamknąć modal bez zapisywania?');
            if (!confirmClose) {
                return false; // Anuluj zamknięcie
            }
        }
        
        this.hideModal('collectionModal');
        return true;
    }

    resetCollectionForm() {
        const form = document.getElementById('collectionForm');
        if (form) {
            form.reset();
        }
        this.currentCollection = null;
        
        // Reset stanu zmian
        this.selectedWineCatalogNumbers.clear();
        this.originalWineSelection.clear();
        this.hasUnsavedChanges = false;
    }

    resetFieldForm() {
        const form = document.getElementById('fieldForm');
        if (form) {
            form.reset();
        }
        this.currentField = null;
    }

    /**
     * Export collection with full wine data as JSON file
     */
    async exportCollectionJSON(collectionId, collectionName) {
        try {
            this.showNotification('Przygotowywanie eksportu JSON...', 'info');
            
            await window.api.downloadCollectionJSON(collectionId, collectionName);
            
            this.showNotification('Plik JSON został pobrany pomyślnie', 'success');
        } catch (error) {
            console.error('Error exporting collection JSON:', error);
            this.showNotification('Błąd podczas eksportu JSON: ' + error.message, 'error');
        }
    }
    
    /**
     * Select all wines in the current view
     */
    selectAllWines() {
        const checkboxes = document.querySelectorAll('#collectionWinesSelection input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            this.selectedWineCatalogNumbers.add(checkbox.value);
        });
        this.updateSelectedWineCount();
    }
    
    /**
     * Deselect all wines
     */
    deselectAllWines() {
        const checkboxes = document.querySelectorAll('#collectionWinesSelection input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            this.selectedWineCatalogNumbers.delete(checkbox.value);
        });
        this.updateSelectedWineCount();
    }
    
    /**
     * Update selected wine count display
     */
    updateSelectedWineCount() {
        const countElement = document.getElementById('selectedWineCount');
        if (countElement) {
            const count = this.selectedWineCatalogNumbers.size;
            countElement.textContent = `(${count} wybranych)`;
        }
        
        // Update stats if function exists
        if (typeof window.updateCollectionStats === 'function') {
            window.updateCollectionStats();
        }
    }

    showNotification(message, type = 'info') {
        // Use existing notification system or create a simple one
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
            alert(message);
        }
    }

    async showConfirmDialog(title, message) {
        // Use existing confirm dialog or create a simple one
        return confirm(`${title}\n\n${message}`);
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof window !== 'undefined') {
            window.collectionsManager = new CollectionsManager();
            // Alias dla kompatybilności z różnymi odwołaniami w kodzie
            window.collectionsApp = {
                managers: {
                    collections: window.collectionsManager
                }
            };
        }
    });
} else {
    if (typeof window !== 'undefined') {
        window.collectionsManager = new CollectionsManager();
        // Alias dla kompatybilności z różnymi odwołaniami w kodzie
        window.collectionsApp = {
            managers: {
                collections: window.collectionsManager
            }
        };
    }
}