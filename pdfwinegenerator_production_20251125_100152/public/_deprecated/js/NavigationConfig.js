/**
 * NavigationConfig - Centralny system konfiguracji nawigacji
 * 
 * Zarządza ustawieniami wyglądu nawigacji przechowywanymi w localStorage
 * Zapewnia spójną konfigurację na wszystkich stronach aplikacji
 * 
 * Funkcje:
 * - Przechowywanie ustawień w localStorage
 * - Domyślne wartości konfiguracji
 * - Event system dla live updates
 * - Walidacja i sanityzacja danych
 */
class NavigationConfig {
    constructor() {
        this.storageKey = 'wineApp_navigationConfig';
        this.eventName = 'navigationConfigChanged';
        
        // Domyślne ustawienia nawigacji
        this.defaultConfig = {
            // Podstawowe ustawienia
            theme: 'navbar-wine-primary',
            brandText: 'Wine Management System',
            brandIcon: 'bi-grape',
            logoUrl: null,
            logoAlt: 'Logo',
            containerClass: 'container',
            
            // Zaawansowane opcje
            showDropdown: true,
            enableAnimations: true,
            compactMode: false,
            showBreadcrumbs: false,
            
            // Custom styling
            customCSS: '',
            fontFamily: 'default',
            brandFontSize: 'default',
            
            // Funkcjonalność
            quickActions: true,
            searchEnabled: false,
            notificationsEnabled: false,
            
            // Personalizacja
            userPreferences: {
                favoritePages: [],
                recentPages: [],
                customOrder: false
            }
        };
        
        this.availableThemes = [
            { 
                id: 'navbar-wine-primary', 
                name: 'Bordowy Classic', 
                description: 'Elegancki bordowy gradient - motyw główny',
                colors: ['#8B1538', '#2C1810'],
                category: 'wine'
            },
            { 
                id: 'navbar-wine-secondary', 
                name: 'Złoty Premium', 
                description: 'Luksusowy złoty gradient - premium look',
                colors: ['#D4AF37', '#b8941f'],
                category: 'wine'
            },
            { 
                id: 'navbar-wine-dark', 
                name: 'Ciemny Professional', 
                description: 'Głęboki ciemny gradient - profesjonalny wygląd',
                colors: ['#2C1810', '#1a0f08'],
                category: 'wine'
            },
            { 
                id: 'navbar-wine-success', 
                name: 'Zielony Fresh', 
                description: 'Świeży zielony gradient - nowoczesny design',
                colors: ['#28A745', '#1e7e34'],
                category: 'nature'
            },
            { 
                id: 'navbar-wine-info', 
                name: 'Niebieski Ocean', 
                description: 'Spokojny niebieski gradient - czytelny interface',
                colors: ['#17A2B8', '#117a8b'],
                category: 'ocean'
            },
            {
                id: 'bg-gradient-primary',
                name: 'Bootstrap Primary',
                description: 'Standardowy niebieski Bootstrap',
                colors: ['#0d6efd', '#0a58ca'],
                category: 'bootstrap'
            },
            {
                id: 'bg-gradient-danger',
                name: 'Bootstrap Danger',
                description: 'Intensywny czerwony Bootstrap',
                colors: ['#dc3545', '#b02a37'],
                category: 'bootstrap'
            }
        ];
        
        this.availableIcons = [
            { id: 'bi-grape', name: 'Winogrona', category: 'wine' },
            { id: 'bi-bottle', name: 'Butelka', category: 'wine' },
            { id: 'bi-cup', name: 'Kieliszek', category: 'wine' },
            { id: 'bi-house', name: 'Dom', category: 'general' },
            { id: 'bi-building', name: 'Budynek', category: 'general' },
            { id: 'bi-star', name: 'Gwiazda', category: 'general' },
            { id: 'bi-heart', name: 'Serce', category: 'general' },
            { id: 'bi-diamond', name: 'Diament', category: 'premium' },
            { id: 'bi-gem', name: 'Klejnot', category: 'premium' },
            { id: 'bi-crown', name: 'Korona', category: 'premium' }
        ];
        
        // Załaduj obecną konfigurację
        this.currentConfig = this.loadConfig();
    }

    /**
     * Ładuje konfigurację z localStorage
     */
    loadConfig() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Merge z domyślną konfiguracją aby dodać nowe pola
                return { ...this.defaultConfig, ...parsed };
            }
        } catch (error) {
            console.warn('NavigationConfig: Błąd ładowania konfiguracji:', error);
        }
        
        return { ...this.defaultConfig };
    }

    /**
     * Zapisuje konfigurację do localStorage
     */
    saveConfig(config = null) {
        try {
            const configToSave = config || this.currentConfig;
            localStorage.setItem(this.storageKey, JSON.stringify(configToSave));
            
            // Emituj event o zmianie konfiguracji
            this.notifyConfigChange();
            
            return true;
        } catch (error) {
            console.error('NavigationConfig: Błąd zapisywania konfiguracji:', error);
            return false;
        }
    }

    /**
     * Pobiera aktualną konfigurację
     */
    getConfig() {
        return { ...this.currentConfig };
    }

    /**
     * Aktualizuje konfigurację
     */
    updateConfig(updates) {
        // Waliduj i sanityzuj dane
        const validatedUpdates = this.validateConfig(updates);
        
        // Merge z obecną konfiguracją
        this.currentConfig = { ...this.currentConfig, ...validatedUpdates };
        
        // Zapisz
        return this.saveConfig();
    }

    /**
     * Resetuje konfigurację do domyślnych wartości
     */
    resetToDefaults() {
        this.currentConfig = { ...this.defaultConfig };
        return this.saveConfig();
    }

    /**
     * Waliduje i sanityzuje konfigurację
     */
    validateConfig(config) {
        const validated = {};
        
        // Waliduj theme
        if (config.theme && this.availableThemes.some(t => t.id === config.theme)) {
            validated.theme = config.theme;
        }
        
        // Waliduj brand text
        if (config.brandText && typeof config.brandText === 'string') {
            validated.brandText = config.brandText.trim().substring(0, 50);
        }
        
        // Waliduj brand icon
        if (config.brandIcon && this.availableIcons.some(i => i.id === config.brandIcon)) {
            validated.brandIcon = config.brandIcon;
        }
        
        // Waliduj logo URL
        if (config.logoUrl !== undefined) {
            if (config.logoUrl === null || config.logoUrl === '') {
                validated.logoUrl = null;
            } else if (typeof config.logoUrl === 'string' && this.isValidUrl(config.logoUrl)) {
                validated.logoUrl = config.logoUrl;
            }
        }
        
        // Waliduj boolean values
        ['showDropdown', 'enableAnimations', 'compactMode', 'showBreadcrumbs', 
         'quickActions', 'searchEnabled', 'notificationsEnabled'].forEach(key => {
            if (config[key] !== undefined && typeof config[key] === 'boolean') {
                validated[key] = config[key];
            }
        });
        
        // Waliduj container class
        if (config.containerClass && ['container', 'container-fluid'].includes(config.containerClass)) {
            validated.containerClass = config.containerClass;
        }
        
        // Waliduj custom CSS
        if (config.customCSS !== undefined && typeof config.customCSS === 'string') {
            validated.customCSS = config.customCSS.substring(0, 5000); // Limit długości
        }
        
        return validated;
    }

    /**
     * Sprawdza czy URL jest poprawny
     */
    isValidUrl(string) {
        try {
            // Akceptuj data URLs dla base64 images
            if (string.startsWith('data:image/')) {
                return true;
            }
            
            // Akceptuj relatywne URLs
            if (string.startsWith('/') || string.startsWith('./')) {
                return true;
            }
            
            // Sprawdź absolute URLs
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    /**
     * Notyfikuje o zmianie konfiguracji
     */
    notifyConfigChange() {
        const event = new CustomEvent(this.eventName, {
            detail: { config: this.getConfig() }
        });
        document.dispatchEvent(event);
    }

    /**
     * Pobiera dostępne tematy
     */
    getAvailableThemes() {
        return [...this.availableThemes];
    }

    /**
     * Pobiera dostępne ikony
     */
    getAvailableIcons() {
        return [...this.availableIcons];
    }

    /**
     * Pobiera temat po ID
     */
    getThemeById(themeId) {
        return this.availableThemes.find(theme => theme.id === themeId);
    }

    /**
     * Pobiera ikonę po ID
     */
    getIconById(iconId) {
        return this.availableIcons.find(icon => icon.id === iconId);
    }

    /**
     * Eksportuje konfigurację do JSON
     */
    exportConfig() {
        return JSON.stringify(this.currentConfig, null, 2);
    }

    /**
     * Importuje konfigurację z JSON
     */
    importConfig(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            const validated = this.validateConfig(imported);
            
            if (Object.keys(validated).length > 0) {
                this.currentConfig = { ...this.defaultConfig, ...validated };
                return this.saveConfig();
            }
            
            return false;
        } catch (error) {
            console.error('NavigationConfig: Błąd importu konfiguracji:', error);
            return false;
        }
    }

    /**
     * Pobiera konfigurację dla NavigationComponent
     */
    getNavigationComponentConfig() {
        const config = this.getConfig();
        
        return {
            backgroundColor: config.theme,
            textColor: 'navbar-dark',
            brandText: config.brandText,
            brandIcon: config.logoUrl ? null : config.brandIcon,
            logoUrl: config.logoUrl,
            logoAlt: config.logoAlt,
            containerClass: config.containerClass,
            showDropdown: config.showDropdown,
            dropdownItems: this.getDefaultDropdownItems(),
            customButtons: []
        };
    }

    /**
     * Pobiera domyślne elementy dropdown z linkiem do opcji
     */
    getDefaultDropdownItems() {
        return [
            {
                id: 'options',
                href: 'options.html',
                icon: 'bi-palette',
                text: 'Opcje wyglądu',
                isDivider: false
            },
            {
                id: 'divider1',
                isDivider: true
            },
            {
                id: 'backup',
                action: 'backup',
                icon: 'bi-download',
                text: 'Backup danych',
                isDivider: false
            },
            {
                id: 'settings',
                action: 'settings',
                icon: 'bi-sliders',
                text: 'Ustawienia',
                isDivider: false
            },
            {
                id: 'divider2',
                isDivider: true
            },
            {
                id: 'pdf-editor',
                href: 'pdf-editor.html',
                icon: 'bi-file-earmark-text',
                text: 'Edytor PDF',
                isDivider: false
            }
        ];
    }

    /**
     * Pobiera statystyki użycia
     */
    getUsageStats() {
        const config = this.getConfig();
        return {
            theme: this.getThemeById(config.theme)?.name || 'Nieznany',
            hasLogo: !!config.logoUrl,
            hasCustomCSS: !!config.customCSS,
            enabledFeatures: [
                config.showDropdown && 'Dropdown',
                config.enableAnimations && 'Animacje',
                config.compactMode && 'Tryb kompaktowy',
                config.quickActions && 'Szybkie akcje'
            ].filter(Boolean)
        };
    }
}

// Utwórz globalną instancję
window.navigationConfig = new NavigationConfig();

// Export dla modułów
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationConfig;
}