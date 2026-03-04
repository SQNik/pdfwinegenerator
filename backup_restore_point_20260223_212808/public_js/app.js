// Main Application Controller
class WineApp {
    constructor() {
        this.currentSection = 'wines';
        this.managers = {};
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            this.bindGlobalEvents();
            this.setupNavigation();
            await this.checkAPIHealth();
            this.initializeManagers();
            this.loadUserPreferences();
            this.showCurrentSection();
            
            this.isInitialized = true;
            console.log('Wine Management Application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            Utils.showAlert('Błąd inicjalizacji aplikacji. Sprawdź połączenie z serwerem.', 'danger');
        }
    }

    /**
     * Bind global event listeners
     */
    bindGlobalEvents() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            Utils.showAlert('Wystąpił nieoczekiwany błąd aplikacji', 'danger');
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            Utils.showAlert('Wystąpił błąd podczas przetwarzania żądania', 'danger');
        });

        // Online/offline detection
        window.addEventListener('online', () => {
            Utils.showAlert('Połączenie z internetem zostało przywrócone', 'success');
        });

        window.addEventListener('offline', () => {
            Utils.showAlert('Brak połączenia z internetem', 'warning');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Settings and backup actions
        document.addEventListener('click', (e) => {
            if (e.target.dataset.action === 'backup') {
                e.preventDefault();
                this.downloadBackup();
            } else if (e.target.dataset.action === 'settings') {
                e.preventDefault();
                this.showSettings();
            }
        });
    }

    /**
     * Setup navigation
     */
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.dataset.section;
                this.showSection(section);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            const section = e.state?.section || 'wines';
            this.showSection(section, false);
        });
    }

    /**
     * Check API health
     */
    async checkAPIHealth() {
        try {
            await api.healthCheck();
            console.log('API connection established');
        } catch (error) {
            console.warn('API health check failed:', error);
            throw new Error('Nie można połączyć się z serwerem API');
        }
    }

    /**
     * Initialize component managers
     */
    initializeManagers() {
        // Managers are initialized automatically when their scripts load
        // We just store references if they exist
        if (typeof wineManager !== 'undefined') {
            this.managers.wines = wineManager;
        }
        
        // fieldsManager został przeniesiony do wines.html
        
        if (typeof window.collectionsManager !== 'undefined') {
            this.managers.collections = window.collectionsManager;
        }
        
        if (typeof importManager !== 'undefined') {
            this.managers.import = importManager;
        }
    }

    /**
     * Load user preferences
     */
    loadUserPreferences() {
        const preferences = Utils.storage.get(CONFIG.STORAGE_KEYS.USER_PREFERENCES, {});
        
        // Apply preferences
        if (preferences.theme) {
            this.setTheme(preferences.theme);
        }
        
        if (preferences.language) {
            this.setLanguage(preferences.language);
        }
        
        if (preferences.defaultSection) {
            this.currentSection = preferences.defaultSection;
        }
    }

    /**
     * Save user preferences
     */
    saveUserPreferences() {
        const preferences = {
            theme: this.getCurrentTheme(),
            language: this.getCurrentLanguage(),
            defaultSection: this.currentSection,
            lastSaved: new Date().toISOString()
        };
        
        Utils.storage.set(CONFIG.STORAGE_KEYS.USER_PREFERENCES, preferences);
    }

    /**
     * Show specific section
     * @param {string} sectionName - Section name
     * @param {boolean} pushState - Whether to update browser history
     */
    showSection(sectionName, pushState = true) {
        if (this.currentSection === sectionName) return;

        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.add('d-none');
        });

        // Show target section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.remove('d-none');
            targetSection.classList.add('fade-in');
            
            // Remove animation class after animation completes
            setTimeout(() => {
                targetSection.classList.remove('fade-in');
            }, 500);
        }

        // Update navigation
        this.updateNavigation(sectionName);
        
        // Update current section
        this.currentSection = sectionName;
        
        // Update browser history
        if (pushState) {
            const url = new URL(window.location);
            url.hash = sectionName;
            history.pushState({ section: sectionName }, '', url);
        }

        // Trigger section-specific actions
        this.onSectionChanged(sectionName);
        
        // Save preference
        this.saveUserPreferences();
    }

    /**
     * Show current section based on URL hash or default
     */
    showCurrentSection() {
        const hash = window.location.hash.substring(1);
        const section = hash || this.currentSection || 'wines';
        this.showSection(section, false);
    }

    /**
     * Update navigation active state
     * @param {string} activeSection - Active section name
     */
    updateNavigation(activeSection) {
        const navLinks = document.querySelectorAll('.nav-link[data-section]');
        
        navLinks.forEach(link => {
            if (link.dataset.section === activeSection) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Handle section change events
     * @param {string} sectionName - Section name
     */
    onSectionChanged(sectionName) {
        // Refresh data when switching to a section
        const manager = this.managers[sectionName];
        if (manager && typeof manager.refresh === 'function') {
            manager.refresh();
        }

        // Section-specific logic
        switch (sectionName) {
            case 'wines':
                this.onWinesSectionActive();
                break;
            case 'fields':
                this.onFieldsSectionActive();
                break;
            case 'import':
                this.onImportSectionActive();
                break;
        }
    }

    /**
     * Wines section activated
     */
    onWinesSectionActive() {
        // Could implement wine-specific logic here
        console.log('Wines section activated');
    }

    /**
     * Fields section activated
     */
    onFieldsSectionActive() {
        console.log('Fields section activated');
    }

    /**
     * Import section activated
     */
    onImportSectionActive() {
        // Could implement import-specific logic here
        console.log('Import section activated');
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '1':
                    e.preventDefault();
                    this.showSection('wines');
                    break;
                case '2':
                    e.preventDefault();
                    this.showSection('collections');
                    break;
                case '3':
                    e.preventDefault();
                    this.showSection('fields');
                    break;
                case '4':
                    e.preventDefault();
                    this.showSection('import');
                    break;
                case 'n':
                    e.preventDefault();
                    this.showAddWineModal();
                    break;
                case 'f':
                    e.preventDefault();
                    this.focusSearch();
                    break;
                case 's':
                    e.preventDefault();
                    this.downloadBackup();
                    break;
            }
        }

        // Escape key - close modals
        if (e.key === 'Escape') {
            this.closeAllModals();
        }
    }

    /**
     * Show add wine modal
     */
    showAddWineModal() {
        if (this.currentSection !== 'wines') {
            this.showSection('wines');
        }
        
        setTimeout(() => {
            const addWineBtn = document.querySelector('button[data-bs-target="#wineModal"]');
            if (addWineBtn) {
                addWineBtn.click();
            }
        }, 100);
    }

    /**
     * Focus search input
     */
    focusSearch() {
        const searchInput = document.getElementById('searchWines');
        if (searchInput && !searchInput.closest('.d-none')) {
            searchInput.focus();
            searchInput.select();
        }
    }

    /**
     * Close all open modals
     */
    closeAllModals() {
        const modals = document.querySelectorAll('.modal.show');
        modals.forEach(modal => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) {
                bsModal.hide();
            }
        });
    }

    /**
     * Download data backup
     */
    async downloadBackup() {
        try {
            Utils.showLoading(true);
            
            // Get all data
            const winesResponse = await handleAPICall(() => api.getWines({ limit: 10000 }));

            const backupData = {
                wines: winesResponse.data || [],
                categories: [], // Could fetch from API if available
                exportDate: new Date().toISOString(),
                version: '1.0',
                source: 'Wine Management System'
            };

            const filename = `wine_backup_${Utils.formatDate(new Date(), 'short').replace(/\./g, '-')}.json`;
            const content = JSON.stringify(backupData, null, 2);
            
            Utils.downloadFile(content, filename, 'application/json');
            Utils.showAlert('Backup został pobrany pomyślnie', 'success');

        } catch (error) {
            console.error('Backup error:', error);
            Utils.showAlert('Błąd podczas tworzenia backupu', 'danger');
        } finally {
            Utils.showLoading(false);
        }
    }

    /**
     * Show settings modal
     */
    showSettings() {
        const settingsHTML = `
            <div class="modal fade" id="settingsModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="bi bi-gear"></i> Ustawienia
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="settingsForm">
                                <div class="mb-3">
                                    <label for="defaultSection" class="form-label">Domyślna sekcja</label>
                                    <select class="form-select" id="defaultSection">
                                        <option value="wines" ${this.currentSection === 'wines' ? 'selected' : ''}>Wina</option>
                                        <option value="import" ${this.currentSection === 'import' ? 'selected' : ''}>Import</option>
                                    </select>
                                </div>
                                
                                <div class="mb-3">
                                    <label for="pageSize" class="form-label">Liczba elementów na stronie</label>
                                    <select class="form-select" id="pageSize">
                                        <option value="10">10</option>
                                        <option value="20" selected>20</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>

                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="autoRefresh" checked>
                                        <label class="form-check-label" for="autoRefresh">
                                            Automatyczne odświeżanie danych
                                        </label>
                                    </div>
                                </div>

                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="showNotifications" checked>
                                        <label class="form-check-label" for="showNotifications">
                                            Pokazuj powiadomienia
                                        </label>
                                    </div>
                                </div>
                            </form>
                            
                            <hr>
                            
                            <div class="mb-3">
                                <h6>Informacje o aplikacji</h6>
                                <ul class="list-unstyled mb-0">
                                    <li><strong>Wersja:</strong> 1.0.0</li>
                                    <li><strong>Przeglądarka:</strong> ${Utils.getBrowserInfo().name}</li>
                                    <li><strong>Urządzenie:</strong> ${Utils.isMobile() ? 'Mobilne' : 'Desktop'}</li>
                                </ul>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
                            <button type="button" class="btn btn-primary" onclick="wineApp.saveSettings()">Zapisz</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal
        const existingModal = document.getElementById('settingsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add new modal
        document.body.insertAdjacentHTML('beforeend', settingsHTML);

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
        modal.show();

        // Clean up when modal is hidden
        modal._element.addEventListener('hidden.bs.modal', () => {
            modal._element.remove();
        });
    }

    /**
     * Save settings
     */
    saveSettings() {
        const form = document.getElementById('settingsForm');
        if (!form) return;

        const settings = {
            defaultSection: form.defaultSection.value,
            pageSize: parseInt(form.pageSize.value),
            autoRefresh: form.autoRefresh.checked,
            showNotifications: form.showNotifications.checked
        };

        // Apply settings
        CONFIG.PAGINATION.DEFAULT_PAGE_SIZE = settings.pageSize;
        
        // Save to storage
        Utils.storage.set(CONFIG.STORAGE_KEYS.USER_PREFERENCES, {
            ...Utils.storage.get(CONFIG.STORAGE_KEYS.USER_PREFERENCES, {}),
            ...settings
        });

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
        if (modal) {
            modal.hide();
        }

        Utils.showAlert('Ustawienia zostały zapisane', 'success');
    }

    /**
     * Get current theme
     * @returns {string} Current theme
     */
    getCurrentTheme() {
        return document.body.dataset.theme || 'light';
    }

    /**
     * Set theme
     * @param {string} theme - Theme name
     */
    setTheme(theme) {
        document.body.dataset.theme = theme;
    }

    /**
     * Get current language
     * @returns {string} Current language
     */
    getCurrentLanguage() {
        return document.documentElement.lang || 'pl';
    }

    /**
     * Set language
     * @param {string} language - Language code
     */
    setLanguage(language) {
        document.documentElement.lang = language;
    }

    /**
     * Show application info
     */
    showInfo() {
        const info = `
            <strong>Wine Management System</strong><br>
            Wersja: 1.0.0<br>
            Autor: System Zarządzania Winami<br>
            Licencja: MIT<br><br>
            
            <strong>Funkcjonalności:</strong><br>
            • Zarządzanie winami<br>
            • Tworzenie list win<br>
            • Import/eksport danych<br>
            • Zaawansowane wyszukiwanie<br>
            • Responsywny design<br><br>
            
            <strong>Skróty klawiszowe:</strong><br>
            Ctrl+1 - Sekcja win<br>
            Ctrl+2 - Listy win<br>
            Ctrl+3 - Import<br>
            Ctrl+N - Dodaj wino<br>
            Ctrl+F - Szukaj<br>
            Ctrl+S - Backup<br>
        `;

        Utils.showAlert(info, 'info', 15000);
    }

    /**
     * Refresh all data
     */
    async refreshAll() {
        Utils.showLoading(true);
        
        try {
            // Refresh all managers
            const refreshPromises = Object.values(this.managers)
                .filter(manager => typeof manager.refresh === 'function')
                .map(manager => manager.refresh());

            await Promise.all(refreshPromises);
            Utils.showAlert('Wszystkie dane zostały odświeżone', 'success');

        } catch (error) {
            console.error('Error refreshing data:', error);
            Utils.showAlert('Błąd podczas odświeżania danych', 'danger');
        } finally {
            Utils.showLoading(false);
        }
    }
}

// Initialize application when DOM is loaded
let wineApp;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        wineApp = new WineApp();
        
        // Make available globally for debugging
        window.wineApp = wineApp;
    });
} else {
    wineApp = new WineApp();
    window.wineApp = wineApp;
}

// Global error handler for unhandled errors
window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error:', { message, source, lineno, colno, error });
    Utils.showAlert('Wystąpił nieoczekiwany błąd aplikacji', 'danger');
    return false;
};

// Service Worker registration (for future PWA support)
if ('serviceWorker' in navigator && CONFIG.FEATURES.ENABLE_PWA) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}