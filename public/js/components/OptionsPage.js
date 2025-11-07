/**
 * OptionsPage - Manager strony opcji nawigacji
 * 
 * Obsługuje interfejs konfiguracji wyglądu nawigacji
 * Zapewnia live preview i automatyczne zapisywanie
 */
class OptionsPage {
    constructor() {
        this.config = window.navigationConfig;
        this.previewNavigation = null;
        this.updateTimeout = null;
        
        // Elementy DOM
        this.elements = {};
        
        this.init();
    }

    /**
     * Inicjalizacja strony opcji
     */
    init() {
        // Zainicjalizuj nawigację w głównym kontenerze
        this.initMainNavigation();
        
        // Pobierz referencje do elementów DOM
        this.bindElements();
        
        // Wygeneruj interfejs
        this.generateThemeGrid();
        this.generateIconGrid();
        
        // Załaduj obecną konfigurację
        this.loadCurrentConfig();
        
        // Podepnij event listenery
        this.attachEventListeners();
        
        // Inicjalizuj live preview
        this.initLivePreview();
        
        // Aktualizuj statystyki
        this.updateStats();
        
        console.log('OptionsPage: Zainicjalizowano stronę opcji');
    }

    /**
     * Inicjalizuj nawigację w głównym kontenerze
     */
    initMainNavigation() {
        const navigation = new NavigationComponent(this.config.getNavigationComponentConfig());
        navigation.render('#navigation-container');
        window.navigationComponent = navigation;
    }

    /**
     * Pobierz referencje do elementów DOM
     */
    bindElements() {
        this.elements = {
            // Główne kontenery
            themeGrid: document.getElementById('theme-grid'),
            iconGrid: document.getElementById('icon-grid'),
            previewContainer: document.getElementById('preview-navigation-container'),
            statsContainer: document.getElementById('stats-container'),
            previewIndicator: document.getElementById('preview-indicator'),
            
            // Kontrolki formularza
            brandText: document.getElementById('brandText'),
            containerClass: document.getElementById('containerClass'),
            logoFile: document.getElementById('logoFile'),
            logoUrl: document.getElementById('logoUrl'),
            logoDisplay: document.getElementById('logo-display'),
            logoPreview: document.getElementById('logo-preview'),
            logoPreviewContainer: document.getElementById('logo-preview-container'),
            
            // Przełączniki funkcji
            showDropdown: document.getElementById('showDropdown'),
            enableAnimations: document.getElementById('enableAnimations'),
            compactMode: document.getElementById('compactMode'),
            quickActions: document.getElementById('quickActions'),
            
            // Zaawansowane
            customCSS: document.getElementById('customCSS'),
            
            // Import/Export
            importJson: document.getElementById('importJson')
        };
    }

    /**
     * Wygeneruj siatkę tematów
     */
    generateThemeGrid() {
        const themes = this.config.getAvailableThemes();
        const currentConfig = this.config.getConfig();
        
        this.elements.themeGrid.innerHTML = themes.map(theme => `
            <div class="theme-card" data-theme="${theme.id}" 
                 style="background: linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})"
                 ${theme.id === currentConfig.theme ? 'data-selected="true"' : ''}>
                <div class="theme-info">
                    <h5 class="mb-2">${theme.name}</h5>
                    <p class="mb-0 small">${theme.description}</p>
                    <span class="badge bg-light text-dark mt-2">${theme.category}</span>
                </div>
            </div>
        `).join('');
        
        // Oznacz wybrany temat
        this.updateSelectedTheme(currentConfig.theme);
    }

    /**
     * Wygeneruj siatkę ikon
     */
    generateIconGrid() {
        const icons = this.config.getAvailableIcons();
        const currentConfig = this.config.getConfig();
        
        this.elements.iconGrid.innerHTML = icons.map(icon => `
            <div class="icon-option" data-icon="${icon.id}"
                 ${icon.id === currentConfig.brandIcon ? 'data-selected="true"' : ''}>
                <i class="${icon.id}"></i>
                <span>${icon.name}</span>
            </div>
        `).join('');
        
        // Oznacz wybraną ikonę
        this.updateSelectedIcon(currentConfig.brandIcon);
    }

    /**
     * Załaduj obecną konfigurację do formularza
     */
    loadCurrentConfig() {
        const config = this.config.getConfig();
        
        // Podstawowe ustawienia
        this.elements.brandText.value = config.brandText;
        this.elements.containerClass.value = config.containerClass;
        
        // Logo
        if (config.logoUrl) {
            this.elements.logoUrl.value = config.logoUrl;
            this.showLogoPreview(config.logoUrl);
        }
        
        // Przełączniki funkcji
        this.elements.showDropdown.checked = config.showDropdown;
        this.elements.enableAnimations.checked = config.enableAnimations;
        this.elements.compactMode.checked = config.compactMode;
        this.elements.quickActions.checked = config.quickActions;
        
        // Zaawansowane
        this.elements.customCSS.value = config.customCSS || '';
    }

    /**
     * Podepnij event listenery
     */
    attachEventListeners() {
        // Wybór tematu
        this.elements.themeGrid.addEventListener('click', (e) => {
            const themeCard = e.target.closest('.theme-card');
            if (themeCard) {
                const themeId = themeCard.dataset.theme;
                this.selectTheme(themeId);
            }
        });

        // Wybór ikony
        this.elements.iconGrid.addEventListener('click', (e) => {
            const iconOption = e.target.closest('.icon-option');
            if (iconOption) {
                const iconId = iconOption.dataset.icon;
                this.selectIcon(iconId);
            }
        });

        // Kontrolki tekstowe
        this.elements.brandText.addEventListener('input', () => this.updateConfig());
        this.elements.containerClass.addEventListener('change', () => this.updateConfig());
        this.elements.logoUrl.addEventListener('input', () => this.handleLogoUrlChange());
        this.elements.customCSS.addEventListener('input', () => this.updateConfig());

        // Przełączniki
        ['showDropdown', 'enableAnimations', 'compactMode', 'quickActions'].forEach(id => {
            this.elements[id].addEventListener('change', () => this.updateConfig());
        });

        // Upload logo
        this.elements.logoFile.addEventListener('change', (e) => this.handleLogoFileUpload(e));
        
        // Drag & drop dla logo
        this.setupLogoDragAndDrop();

        // Podgląd urządzeń
        document.querySelectorAll('[data-preview]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('[data-preview]').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateDevicePreview(e.target.dataset.preview);
            });
        });

        // Nasłuchuj zmian konfiguracji z innych źródeł
        document.addEventListener('navigationConfigChanged', () => {
            this.loadCurrentConfig();
            this.updateLivePreview();
            this.updateStats();
        });
    }

    /**
     * Setup drag and drop dla logo
     */
    setupLogoDragAndDrop() {
        const display = this.elements.logoDisplay;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventType => {
            display.addEventListener(eventType, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventType => {
            display.addEventListener(eventType, () => {
                display.style.borderColor = 'var(--wine-secondary)';
                display.style.background = 'var(--wine-accent)';
            });
        });

        ['dragleave', 'drop'].forEach(eventType => {
            display.addEventListener(eventType, () => {
                display.style.borderColor = '#dee2e6';
                display.style.background = '#f8f9fa';
            });
        });

        display.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processLogoFile(files[0]);
            }
        });
    }

    /**
     * Wybierz temat
     */
    selectTheme(themeId) {
        this.updateSelectedTheme(themeId);
        this.config.updateConfig({ theme: themeId });
        this.updateLivePreview();
        this.updateStats();
    }

    /**
     * Wybierz ikonę
     */
    selectIcon(iconId) {
        this.updateSelectedIcon(iconId);
        this.config.updateConfig({ brandIcon: iconId, logoUrl: null });
        this.clearLogoPreview();
        this.updateLivePreview();
        this.updateStats();
    }

    /**
     * Aktualizuj wizualny wybór tematu
     */
    updateSelectedTheme(themeId) {
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('selected');
            card.removeAttribute('data-selected');
        });
        
        const selectedCard = document.querySelector(`[data-theme="${themeId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            selectedCard.setAttribute('data-selected', 'true');
        }
    }

    /**
     * Aktualizuj wizualny wybór ikony
     */
    updateSelectedIcon(iconId) {
        document.querySelectorAll('.icon-option').forEach(option => {
            option.classList.remove('selected');
            option.removeAttribute('data-selected');
        });
        
        const selectedOption = document.querySelector(`[data-icon="${iconId}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            selectedOption.setAttribute('data-selected', 'true');
        }
    }

    /**
     * Obsłuż zmianę URL logo
     */
    handleLogoUrlChange() {
        const url = this.elements.logoUrl.value.trim();
        if (url) {
            this.showLogoPreview(url);
            this.config.updateConfig({ logoUrl: url });
        } else {
            this.clearLogoPreview();
            this.config.updateConfig({ logoUrl: null });
        }
        this.updateLivePreview();
    }

    /**
     * Obsłuż upload pliku logo
     */
    handleLogoFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.processLogoFile(file);
        }
    }

    /**
     * Przetwórz plik logo
     */
    processLogoFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showAlert('Błąd', 'Wybrany plik nie jest obrazem.', 'danger');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            this.showAlert('Błąd', 'Rozmiar pliku nie może przekraczać 2MB.', 'danger');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target.result;
            this.showLogoPreview(dataUrl);
            this.elements.logoUrl.value = '';
            this.config.updateConfig({ logoUrl: dataUrl });
            this.updateLivePreview();
        };
        reader.readAsDataURL(file);
    }

    /**
     * Pokaż podgląd logo
     */
    showLogoPreview(url) {
        this.elements.logoPreview.src = url;
        this.elements.logoPreviewContainer.style.display = 'block';
        this.elements.logoDisplay.classList.add('has-file');
        this.elements.logoDisplay.innerHTML = `
            <div class="text-center">
                <i class="bi bi-check-circle-fill fs-3 mb-2 d-block text-success"></i>
                <strong>Logo załadowane</strong>
                <p class="mb-0">Kliknij aby zmienić</p>
            </div>
        `;
    }

    /**
     * Usuń podgląd logo
     */
    clearLogoPreview() {
        this.elements.logoPreviewContainer.style.display = 'none';
        this.elements.logoDisplay.classList.remove('has-file');
        this.elements.logoDisplay.innerHTML = `
            <div class="text-center">
                <i class="bi bi-cloud-upload fs-3 mb-2 d-block"></i>
                <strong>Kliknij aby wybrać logo</strong>
                <p class="mb-0">lub przeciągnij plik tutaj</p>
                <small class="text-muted">PNG, JPG, SVG (max 2MB)</small>
            </div>
        `;
        this.elements.logoUrl.value = '';
        this.elements.logoFile.value = '';
    }

    /**
     * Usuń logo - funkcja globalna
     */
    removeLogo() {
        this.clearLogoPreview();
        this.config.updateConfig({ logoUrl: null });
        this.updateLivePreview();
    }

    /**
     * Aktualizuj konfigurację z formularza
     */
    updateConfig() {
        // Opóźnij aktualizację aby uniknąć zbyt częstych wywołań
        clearTimeout(this.updateTimeout);
        this.updateTimeout = setTimeout(() => {
            const updates = {
                brandText: this.elements.brandText.value,
                containerClass: this.elements.containerClass.value,
                showDropdown: this.elements.showDropdown.checked,
                enableAnimations: this.elements.enableAnimations.checked,
                compactMode: this.elements.compactMode.checked,
                quickActions: this.elements.quickActions.checked,
                customCSS: this.elements.customCSS.value
            };

            this.config.updateConfig(updates);
            this.updateLivePreview();
            this.updateStats();
        }, 300);
    }

    /**
     * Inicjalizuj live preview
     */
    initLivePreview() {
        this.updateLivePreview();
    }

    /**
     * Aktualizuj live preview
     */
    updateLivePreview() {
        // Pokaż indicator aktualizacji
        this.elements.previewIndicator.classList.add('updating');
        this.elements.previewIndicator.innerHTML = '<i class="bi bi-arrow-clockwise me-1"></i>Aktualizowanie...';

        setTimeout(() => {
            // Utwórz nową nawigację z aktualną konfiguracją
            const config = this.config.getNavigationComponentConfig();
            
            // Usuń starą nawigację preview
            this.elements.previewContainer.innerHTML = '';
            
            // Utwórz nową
            this.previewNavigation = new NavigationComponent(config);
            this.previewNavigation.render('#preview-navigation-container');
            
            // Zastosuj custom CSS jeśli istnieje
            const customCSS = this.config.getConfig().customCSS;
            if (customCSS) {
                this.applyCustomCSS(customCSS);
            }

            // Ukryj indicator aktualizacji
            this.elements.previewIndicator.classList.remove('updating');
            this.elements.previewIndicator.innerHTML = '<i class="bi bi-eye me-1"></i>Live Preview';
            
            // Aktualizuj główną nawigację
            this.updateMainNavigation();
        }, 500);
    }

    /**
     * Aktualizuj główną nawigację
     */
    updateMainNavigation() {
        const config = this.config.getNavigationComponentConfig();
        const mainNav = window.navigationComponent;
        
        if (mainNav) {
            // Zaktualizuj główną nawigację
            mainNav.updateProps(config);
            mainNav.render('#navigation-container');
        }
    }

    /**
     * Zastosuj custom CSS
     */
    applyCustomCSS(css) {
        // Usuń poprzedni custom CSS
        const existingStyle = document.getElementById('custom-navigation-css');
        if (existingStyle) {
            existingStyle.remove();
        }

        if (css.trim()) {
            const style = document.createElement('style');
            style.id = 'custom-navigation-css';
            style.textContent = css;
            document.head.appendChild(style);
        }
    }

    /**
     * Aktualizuj statystyki
     */
    updateStats() {
        const stats = this.config.getUsageStats();
        
        this.elements.statsContainer.innerHTML = `
            <li><strong>Temat:</strong> ${stats.theme}</li>
            <li><strong>Logo:</strong> ${stats.hasLogo ? 'Tak' : 'Nie'}</li>
            <li><strong>Custom CSS:</strong> ${stats.hasCustomCSS ? 'Tak' : 'Nie'}</li>
            <li><strong>Funkcje:</strong> ${stats.enabledFeatures.join(', ') || 'Brak'}</li>
        `;
    }

    /**
     * Aktualizuj podgląd urządzenia
     */
    updateDevicePreview(device) {
        const previewElement = document.getElementById('device-preview');
        let width, description;

        switch (device) {
            case 'mobile':
                width = '375px';
                description = 'iPhone/Android (375px)';
                break;
            case 'tablet':
                width = '768px';
                description = 'iPad/Tablet (768px)';
                break;
            default:
                width = '100%';
                description = 'Desktop (1200px+)';
        }

        previewElement.style.width = width;
        previewElement.innerHTML = `
            <div class="text-center p-3">
                <i class="bi bi-${device === 'mobile' ? 'phone' : device === 'tablet' ? 'tablet' : 'laptop'} fs-2 mb-2"></i>
                <p class="mb-0">${description}</p>
                <small class="text-muted">Nawigacja będzie responsywna</small>
            </div>
        `;
    }

    /**
     * Pokaż alert
     */
    showAlert(title, message, type = 'info') {
        const alertHtml = `
            <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                <strong>${title}:</strong> ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // Dodaj do body lub kontenera alertów
        const container = document.querySelector('.container-fluid') || document.body;
        const alertDiv = document.createElement('div');
        alertDiv.innerHTML = alertHtml;
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto-usuń po 5 sekundach
        setTimeout(() => {
            const alert = alertDiv.querySelector('.alert');
            if (alert) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
}

// Globalne funkcje dla HTML
function exportConfig() {
    const config = window.navigationConfig.exportConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'navigation-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    window.optionsPage.showAlert('Sukces', 'Konfiguracja została wyeksportowana', 'success');
}

function showImportModal() {
    const modal = new bootstrap.Modal(document.getElementById('importModal'));
    modal.show();
}

function importConfig() {
    const jsonText = document.getElementById('importJson').value;
    
    if (!jsonText.trim()) {
        window.optionsPage.showAlert('Błąd', 'Podaj JSON z konfiguracją', 'danger');
        return;
    }
    
    if (window.navigationConfig.importConfig(jsonText)) {
        window.optionsPage.showAlert('Sukces', 'Konfiguracja została zaimportowana', 'success');
        window.optionsPage.loadCurrentConfig();
        window.optionsPage.updateLivePreview();
        window.optionsPage.updateStats();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('importModal'));
        modal.hide();
    } else {
        window.optionsPage.showAlert('Błąd', 'Nieprawidłowy format JSON lub dane', 'danger');
    }
}

function resetToDefaults() {
    if (confirm('Czy na pewno chcesz przywrócić domyślne ustawienia? Wszystkie zmiany zostaną utracone.')) {
        window.navigationConfig.resetToDefaults();
        window.optionsPage.loadCurrentConfig();
        window.optionsPage.generateThemeGrid();
        window.optionsPage.generateIconGrid();
        window.optionsPage.updateLivePreview();
        window.optionsPage.updateStats();
        window.optionsPage.clearLogoPreview();
        
        window.optionsPage.showAlert('Sukces', 'Przywrócono domyślne ustawienia', 'success');
    }
}

function applyChanges() {
    window.optionsPage.showAlert('Sukces', 'Zmiany zostały zapisane', 'success');
}

function applyAndRedirect() {
    window.optionsPage.showAlert('Sukces', 'Ustawienia zostały zastosowane', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

function removeLogo() {
    window.optionsPage.removeLogo();
}

// Inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', function() {
    window.optionsPage = new OptionsPage();
});