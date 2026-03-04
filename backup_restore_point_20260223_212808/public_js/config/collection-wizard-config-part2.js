/**
 * Collection Wizard Configuration - Part 2
 * Steps 3-5: Products, Summary, Completion
 */

const collectionWizardConfigPart2 = [
    // ========================================================================
    // KROK 3: Wybór produktów (Choose Products)
    // ========================================================================
    {
        id: 'products',
        title: 'Wybierz produkty',
        label: 'Produkty',
        icon: 'bottle',
        description: 'Wybierz wina, które chcesz dodać do kolekcji',
        
        renderFunction: async (container, data, wizard) => {
            // Initialize selected wines if not exists
            if (!data.selectedWines) {
                data.selectedWines = [];
            }
            
            container.innerHTML = `
                <!-- Filters -->
                <div class="wizard-filters">
                    <div class="wizard-search">
                        <input 
                            type="text" 
                            class="ds-input" 
                            id="wine-search" 
                            placeholder="Szukaj po nazwie lub numerze katalogowym..."
                        >
                    </div>
                    <select class="ds-select wizard-filter-select" id="category-filter">
                        <option value="">Wszystkie kategorie</option>
                    </select>
                    <select class="ds-select wizard-filter-select" id="type-filter">
                        <option value="">Wszystkie typy</option>
                        <option value="czerwone">Czerwone</option>
                        <option value="białe">Białe</option>
                        <option value="różowe">Różowe</option>
                        <option value="musujące">Musujące</option>
                    </select>
                </div>
                
                <!-- Selected count -->
                <div style="margin-bottom: 1rem; padding: 0.75rem; background: #f0fdf4; border-radius: 0.5rem; border-left: 4px solid #10b981;">
                    <strong>Wybrano: <span id="selected-count">0</span> win</strong>
                </div>
                
                <!-- Wines grid -->
                <div class="wizard-wine-grid" id="wines-grid">
                    <div class="text-center" style="grid-column: 1 / -1;">
                        <i class="bi bi-hourglass-split"></i> Ładowanie win...
                    </div>
                </div>
            `;
            
            let allWines = [];
            let filteredWines = [];
            
            // Load wines
            try {
                const response = await fetch('/api/wines');
                const result = await response.json();
                allWines = result.wines || result || [];
                filteredWines = [...allWines];
                
                // Populate category filter
                const categories = [...new Set(allWines.map(w => w.category).filter(Boolean))];
                const categoryFilter = container.querySelector('#category-filter');
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat;
                    option.textContent = cat;
                    categoryFilter.appendChild(option);
                });
                
                renderWines(filteredWines);
                updateSelectedCount();
                
            } catch (error) {
                console.error('Error loading wines:', error);
                container.querySelector('#wines-grid').innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #e53e3e;">
                        <i class="bi bi-exclamation-triangle"></i>
                        <p>Błąd ładowania win</p>
                    </div>
                `;
            }
            
            function renderWines(wines) {
                const winesGrid = container.querySelector('#wines-grid');
                
                if (wines.length === 0) {
                    winesGrid.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                            <i class="bi bi-inbox" style="font-size: 3rem; color: #cbd5e0;"></i>
                            <p style="color: #718096; margin-top: 1rem;">Nie znaleziono win</p>
                        </div>
                    `;
                    return;
                }
                
                winesGrid.innerHTML = wines.map(wine => {
                    const isSelected = data.selectedWines.some(w => w.catalogNumber === wine.catalogNumber);
                    
                    return `
                        <div class="wizard-wine-card ${isSelected ? 'selected' : ''}" 
                             data-catalog-number="${wine.catalogNumber}">
                            <div class="wizard-wine-card-badge">✓ Wybrano</div>
                            <div class="wizard-wine-card-image" style="background-image: url('${wine.imageUrl || '/images/wine-placeholder.png'}'); background-size: cover; background-position: center;"></div>
                            <div class="wizard-wine-card-body">
                                <h4 class="wizard-wine-card-name">${wine.name || 'Bez nazwy'}</h4>
                                <div class="wizard-wine-card-meta">
                                    <div><i class="bi bi-hash"></i> ${wine.catalogNumber || 'Brak numeru'}</div>
                                    <div><i class="bi bi-building"></i> ${wine.producer || 'Brak producenta'}</div>
                                    ${wine.category ? `<div><i class="bi bi-tag"></i> ${wine.category}</div>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
                
                // Add click handlers
                winesGrid.querySelectorAll('.wizard-wine-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const catalogNumber = card.dataset.catalogNumber;
                        const wine = wines.find(w => w.catalogNumber === catalogNumber);
                        
                        if (card.classList.contains('selected')) {
                            // Deselect
                            card.classList.remove('selected');
                            data.selectedWines = data.selectedWines.filter(w => w.catalogNumber !== catalogNumber);
                        } else {
                            // Select
                            card.classList.add('selected');
                            data.selectedWines.push(wine);
                        }
                        
                        updateSelectedCount();
                        wizard.saveState();
                    });
                });
            }
            
            function updateSelectedCount() {
                const countEl = container.querySelector('#selected-count');
                if (countEl) {
                    countEl.textContent = data.selectedWines.length;
                }
            }
            
            function filterWines() {
                const searchTerm = container.querySelector('#wine-search').value.toLowerCase();
                const category = container.querySelector('#category-filter').value;
                const type = container.querySelector('#type-filter').value;
                
                filteredWines = allWines.filter(wine => {
                    const matchesSearch = !searchTerm || 
                        (wine.name && wine.name.toLowerCase().includes(searchTerm)) ||
                        (wine.catalogNumber && wine.catalogNumber.toLowerCase().includes(searchTerm));
                    
                    const matchesCategory = !category || wine.category === category;
                    const matchesType = !type || (wine.type && wine.type.toLowerCase() === type);
                    
                    return matchesSearch && matchesCategory && matchesType;
                });
                
                renderWines(filteredWines);
            }
            
            // Add filter listeners
            container.querySelector('#wine-search').addEventListener('input', filterWines);
            container.querySelector('#category-filter').addEventListener('change', filterWines);
            container.querySelector('#type-filter').addEventListener('change', filterWines);
        },
        
        validate: async (data) => {
            const errors = [];
            if (!data.selectedWines || data.selectedWines.length === 0) {
                errors.push('Wybierz co najmniej jedno wino');
            }
            return errors;
        }
    },
    
    // ========================================================================
    // KROK 4: Podsumowanie (Summary)
    // ========================================================================
    {
        id: 'summary',
        title: 'Podsumowanie',
        label: 'Podsumowanie',
        icon: 'list-check',
        description: 'Określ cenę i pojemność dla każdego wina',
        
        renderFunction: async (container, data, wizard) => {
            if (!data.selectedWines || data.selectedWines.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <i class="bi bi-inbox" style="font-size: 3rem; color: #cbd5e0;"></i>
                        <p style="color: #718096; margin-top: 1rem;">Nie wybrano żadnych win</p>
                    </div>
                `;
                return;
            }
            
            // Initialize wine details if not exists
            if (!data.wineDetails) {
                data.wineDetails = {};
            }
            
            container.innerHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <p style="color: #718096;">
                        <strong>${data.selectedWines.length}</strong> wybranych win
                    </p>
                </div>
                
                <ul class="wizard-summary-list">
                    ${data.selectedWines.map((wine, index) => {
                        const details = data.wineDetails[wine.catalogNumber] || {};
                        
                        return `
                            <li class="wizard-summary-item">
                                <div class="wizard-summary-image" style="background-image: url('${wine.imageUrl || '/images/wine-placeholder.png'}'); background-size: cover; background-position: center;"></div>
                                <div class="wizard-summary-info">
                                    <h4>${wine.name || 'Bez nazwy'}</h4>
                                    <p>
                                        <i class="bi bi-hash"></i> ${wine.catalogNumber || 'Brak numeru'}
                                        ${wine.producer ? ` • ${wine.producer}` : ''}
                                    </p>
                                </div>
                                <div class="wizard-summary-inputs">
                                    <div>
                                        <label for="price-${wine.catalogNumber}" style="font-size: 0.75rem; color: #718096; display: block; margin-bottom: 0.25rem;">
                                            Cena (zł)
                                        </label>
                                        <input 
                                            type="number" 
                                            class="ds-input wizard-summary-input" 
                                            id="price-${wine.catalogNumber}"
                                            data-catalog-number="${wine.catalogNumber}"
                                            data-field="price"
                                            value="${details.price || ''}"
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                        >
                                    </div>
                                    <div>
                                        <label for="volume-${wine.catalogNumber}" style="font-size: 0.75rem; color: #718096; display: block; margin-bottom: 0.25rem;">
                                            Pojemność (ml)
                                        </label>
                                        <input 
                                            type="number" 
                                            class="ds-input wizard-summary-input" 
                                            id="volume-${wine.catalogNumber}"
                                            data-catalog-number="${wine.catalogNumber}"
                                            data-field="volume"
                                            value="${details.volume || 750}"
                                            placeholder="750"
                                            step="1"
                                            min="0"
                                        >
                                    </div>
                                </div>
                            </li>
                        `;
                    }).join('')}
                </ul>
            `;
            
            // Add change listeners
            container.querySelectorAll('.wizard-summary-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const catalogNumber = e.target.dataset.catalogNumber;
                    const field = e.target.dataset.field;
                    
                    if (!data.wineDetails[catalogNumber]) {
                        data.wineDetails[catalogNumber] = {};
                    }
                    
                    data.wineDetails[catalogNumber][field] = e.target.value;
                    wizard.saveState();
                });
            });
        },
        
        validate: async (data) => {
            // Optional validation - prices and volumes are not required
            return [];
        }
    },
    
    // ========================================================================
    // KROK 5: Zakończenie (Completion)
    // ========================================================================
    {
        id: 'completion',
        title: 'Zakończenie',
        label: 'Zakończ',
        icon: 'check-circle',
        description: 'Wygeneruj kolekcję lub zapisz do późniejszego użycia',
        completeLabel: 'Generuj PDF',
        saveLabel: 'Zapisz na później',
        
        renderFunction: async (container, data, wizard) => {
            container.innerHTML = `
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 2rem; border-radius: 1rem; margin-bottom: 2rem; text-align: center;">
                    <i class="bi bi-check-circle" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                    <h3 style="margin-bottom: 0.5rem;">Kolekcja gotowa!</h3>
                    <p style="opacity: 0.9;">Wszystko jest przygotowane do wygenerowania PDF</p>
                </div>
                
                <div class="ds-card">
                    <div class="ds-card-body">
                        <h4 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                            <i class="bi bi-info-circle"></i>
                            Podsumowanie kolekcji
                        </h4>
                        
                        <div style="display: grid; gap: 1rem;">
                            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f7fafc; border-radius: 0.5rem;">
                                <span style="color: #718096;">Nazwa kolekcji:</span>
                                <strong>${data.collectionName || 'Bez nazwy'}</strong>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f7fafc; border-radius: 0.5rem;">
                                <span style="color: #718096;">Szablon:</span>
                                <strong>${data.templateName || 'Nie wybrano'}</strong>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f7fafc; border-radius: 0.5rem;">
                                <span style="color: #718096;">Liczba win:</span>
                                <strong>${data.selectedWines ? data.selectedWines.length : 0}</strong>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f7fafc; border-radius: 0.5rem;">
                                <span style="color: #718096;">Okładka:</span>
                                <strong>${data.uploadedCover ? 'Przesłana' : (data.coverId ? 'Wybrana z biblioteki' : 'Brak')}</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 1rem; border-radius: 0.5rem; margin-top: 2rem;">
                    <div style="display: flex; gap: 0.75rem;">
                        <i class="bi bi-lightbulb" style="color: #3b82f6; font-size: 1.5rem;"></i>
                        <div>
                            <strong style="color: #1e40af;">Wskazówka</strong>
                            <p style="color: #1e3a8a; margin: 0.5rem 0 0 0; font-size: 0.875rem;">
                                Możesz zapisać kolekcję i wrócić do niej później, lub wygenerować PDF od razu.
                                Po kliknięciu "Generuj PDF" zostanie utworzony katalog zgodnie z wybranym szablonem.
                            </p>
                        </div>
                    </div>
                </div>
            `;
        },
        
        validate: async (data) => {
            // Final validation
            const errors = [];
            
            if (!data.collectionName) {
                errors.push('Brak nazwy kolekcji');
            }
            if (!data.templateId) {
                errors.push('Nie wybrano szablonu');
            }
            if (!data.selectedWines || data.selectedWines.length === 0) {
                errors.push('Nie wybrano żadnych win');
            }
            
            return errors;
        }
    }
];

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = collectionWizardConfigPart2;
}
