// Application Configuration
// 🔥 FLAGSHIP FEATURE: Dynamic Category Management System 🔥
// 
// CRITICAL: This system's main differentiator is ZERO-CODE category management
// - Users can add/remove wine categories directly from wines.html UI
// - Real-time synchronization across ALL forms and filters
// - NO developer needed, NO code changes, NO system restart
// - Production-grade with validation, backup, and error handling
//
// Categories are managed dynamically through wines.html UI
// Configuration loaded from /api/fields/config endpoint
const CONFIG = {
    // API Configuration
    API: {
        BASE_URL: window.location.origin + '/api',
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000
    },

    // Pagination Configuration
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 50,
        PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
        MAX_PAGE_BUTTONS: 5
    },

    // Image Configuration
    IMAGES: {
        BASE_URL: '/images',
        DEFAULT_WINE: '/images/default-wine.jpg',
        FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
        MAX_SIZE: 5 * 1024 * 1024, // 5MB
        THUMBNAIL_SIZE: { width: 200, height: 240 }
    },

    // 🔒 UWAGA: Validation rules są teraz dynamiczne - ładowane z konfiguracji pól
    VALIDATION: {
        // Validation jest teraz obsługiwana przez dynamic fields system
        // Zobacz WineFieldsConfig.validateField() i WineFieldsConfig.validateWineData()
    },

    // UI Configuration
    UI: {
        DEBOUNCE_DELAY: 300,
        TOAST_DURATION: 5000,
        MODAL_ANIMATION_DURATION: 300,
        TABLE_ROW_HEIGHT: 60,
        CARD_ASPECT_RATIO: 1.5
    },

    // Search Configuration
    SEARCH: {
        MIN_QUERY_LENGTH: 2,
        MAX_RESULTS: 1000,
        // 🔒 UWAGA: Search fields są teraz dynamiczne - ładowane z konfiguracji pól
        // Zobacz WineFieldsConfig.getFormFields() dla dostępnych pól
        FUZZY_THRESHOLD: 0.6
    },

    // Import Configuration
    IMPORT: {
        SUPPORTED_FORMATS: ['.json', '.csv', '.xlsx', '.xls'],
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        BATCH_SIZE: 100,
        PREVIEW_ROWS: 10
    },

    // Export Configuration
    EXPORT: {
        FORMATS: ['json', 'csv', 'xlsx'],
        DEFAULT_FORMAT: 'json',
        FILENAME_TEMPLATE: 'wines_export_{timestamp}',
        DATE_FORMAT: 'YYYY-MM-DD_HH-mm-ss'
    },

    // Local Storage Keys
    STORAGE_KEYS: {
        USER_PREFERENCES: 'wine_app_preferences',
        SEARCH_HISTORY: 'wine_app_search_history',
        RECENT_WINES: 'wine_app_recent_wines',
        VIEW_MODE: 'wine_app_view_mode',
        FILTERS: 'wine_app_filters'
    },

    // Categories Configuration
    CATEGORIES: {
        DEFAULT: [
            'Czerwone wina',
            'Białe wina',
            'Różowe wina',
            'Wina musujące',
            'Wina deserowe',
            'Wina wzmacniane',
            'Wina owocowe'
        ],
        COLORS: {
            'Czerwone wina': '#8B1538',
            'Białe wina': '#F5F5DC',
            'Różowe wina': '#E8B4CB',
            'Wina musujące': '#FFD700',
            'Wina deserowe': '#DDA0DD',
            'Wina wzmacniane': '#8B4513',
            'Wina owocowe': '#FF6347'
        }
    },

    // Status Messages
    MESSAGES: {
        SUCCESS: {
            WINE_CREATED: 'Wino zostało pomyślnie dodane',
            WINE_UPDATED: 'Wino zostało pomyślnie zaktualizowane',
            WINE_DELETED: 'Wino zostało pomyślnie usunięte',
            LIST_CREATED: 'Lista win została pomyślnie utworzona',
            LIST_UPDATED: 'Lista win została pomyślnie zaktualizowana',
            LIST_DELETED: 'Lista win została pomyślnie usunięta',
            IMPORT_COMPLETED: 'Import został pomyślnie zakończony',
            EXPORT_COMPLETED: 'Eksport został pomyślnie zakończony'
        },
        ERROR: {
            GENERIC: 'Wystąpił nieoczekiwany błąd',
            NETWORK: 'Błąd połączenia z serwerem',
            VALIDATION: 'Dane formularza zawierają błędy',
            NOT_FOUND: 'Zasób nie został znaleziony',
            PERMISSION_DENIED: 'Brak uprawnień do wykonania tej operacji',
            FILE_TOO_LARGE: 'Plik jest zbyt duży',
            INVALID_FORMAT: 'Nieprawidłowy format pliku',
            IMPORT_FAILED: 'Import zakończony niepowodzeniem',
            EXPORT_FAILED: 'Eksport zakończony niepowodzeniem'
        },
        INFO: {
            LOADING: 'Ładowanie danych...',
            SAVING: 'Zapisywanie...',
            DELETING: 'Usuwanie...',
            IMPORTING: 'Importowanie...',
            EXPORTING: 'Eksportowanie...',
            NO_DATA: 'Brak danych do wyświetlenia',
            EMPTY_SEARCH: 'Brak wyników wyszukiwania'
        }
    },

    // Feature Flags
    FEATURES: {
        ENABLE_SEARCH: true,
        ENABLE_FILTERS: true,
        ENABLE_EXPORT: true,
        ENABLE_IMPORT: true,
        ENABLE_IMAGE_UPLOAD: false, // For future implementation
        ENABLE_BARCODE_SCAN: false, // For future implementation
        ENABLE_PRICE_TRACKING: false, // For future implementation
        ENABLE_REVIEWS: false // For future implementation
    },

    // Performance Configuration
    PERFORMANCE: {
        VIRTUAL_SCROLLING_THRESHOLD: 1000,
        IMAGE_LAZY_LOADING: true,
        CACHE_ENABLED: true,
        CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
        PRELOAD_IMAGES: true
    },

    // Development Configuration
    DEVELOPMENT: {
        LOG_LEVEL: 'info', // 'debug', 'info', 'warn', 'error'
        MOCK_API: false,
        SHOW_PERFORMANCE_METRICS: false,
        ENABLE_DEBUG_TOOLS: false
    }
};

// Freeze configuration to prevent accidental modifications
Object.freeze(CONFIG);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}