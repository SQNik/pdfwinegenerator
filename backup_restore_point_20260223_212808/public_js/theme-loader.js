/**
 * Theme Loader - Automatyczne wczytywanie zapisanych ustawień wyglądu
 * Ten skrypt automatycznie aplikuje zapisane ustawienia na wszystkich stronach
 */

(function() {
    'use strict';

    // Załaduj zapisane ustawienia z API
    async function loadThemeSettings() {
        try {
            // Próbuj różnych ścieżek API (nowy system settings + stary theme-settings dla kompatybilności)
            const apiPaths = ['/api/settings/appearance', '/api/theme-settings', '/theme-settings'];
            let response = null;
            let lastError = null;
            
            for (const path of apiPaths) {
                try {
                    response = await fetch(path);
                    if (response.ok) {
                        break; // Znaleziono działający endpoint
                    }
                    lastError = `HTTP ${response.status}`;
                } catch (err) {
                    lastError = err.message;
                    continue;
                }
            }
            
            if (!response || !response.ok) {
                // Brak działającego endpointu - używaj domyślnych ustawień (bez ostrzeżenia w konsoli)
                return;
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                const settings = result.data;
                const root = document.documentElement;
                
                // Mapowanie nazw ustawień na zmienne CSS
                const cssVariableMap = {
                    primaryColor: '--theme-primary-color',
                    heroGradientStart: '--theme-hero-bg-start',
                    heroGradientEnd: '--theme-hero-bg-end',
                    borderRadius: '--theme-radius-md',
                    shadowIntensity: '--theme-shadow-card',
                    spacing: '--theme-space-md',
                    fontSize: '--theme-font-size-base'
                };
                
                // Zastosuj każde ustawienie
                Object.keys(settings).forEach(key => {
                    if (key === 'customCSS') {
                        // Aplikuj custom CSS
                        applyCustomCSS(settings[key]);
                    } else if (key === 'appName' || key === 'appLogoUrl' || key === 'appIcon') {
                        // Aplikuj branding (zostanie wywołane raz poniżej)
                    } else {
                        const cssVar = cssVariableMap[key];
                        if (cssVar && settings[key]) {
                            root.style.setProperty(cssVar, settings[key]);
                        }
                    }
                });
                
                // Aplikuj branding
                applyBranding(settings);
            }
        } catch (e) {
            // Cicha obsługa błędów - używaj domyślnych ustawień
            // console.error('❌ Błąd wczytywania ustawień wyglądu:', e);
        }
    }
    
    // Aplikuj custom CSS
    function applyCustomCSS(css) {
        // Usuń istniejący tag custom CSS
        const existingStyle = document.getElementById('custom-user-css');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Dodaj nowy custom CSS jeśli istnieje
        if (css && css.trim()) {
            const styleTag = document.createElement('style');
            styleTag.id = 'custom-user-css';
            styleTag.textContent = css;
            document.head.appendChild(styleTag);
        }
    }
    
    // Aplikuj branding (logo i nazwa)
    function applyBranding(settings) {
        // Aktualizuj nazwę aplikacji
        if (settings.appName) {
            const brandElements = document.querySelectorAll('.modern-brand span');
            brandElements.forEach(el => {
                el.textContent = settings.appName;
            });
        }
        
        // Aktualizuj logo/ikonę
        const brandIcons = document.querySelectorAll('.modern-brand-icon');
        brandIcons.forEach(parent => {
            if (settings.appLogoUrl) {
                // Pokaż logo jako obrazek
                parent.innerHTML = `<img src="${settings.appLogoUrl}" alt="Logo" style="max-height: 32px; max-width: 100px; object-fit: contain;">`;
            } else if (settings.appIcon) {
                // Pokaż ikonę
                parent.innerHTML = `<i class="bi ${settings.appIcon}"></i>`;
            }
        });
    }

    // Załaduj ustawienia jak najszybciej
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadThemeSettings);
    } else {
        loadThemeSettings();
    }
    
    // Odśwież ustawienia co 5 minut (dla synchronizacji między kartami, rzadziej = mniej requestów)
    setInterval(loadThemeSettings, 300000);
})();
