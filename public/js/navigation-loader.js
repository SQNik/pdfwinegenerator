/**
 * Navigation Loader
 * Ładuje komponent nawigacji na wszystkich stronach
 */

(function() {
    'use strict';

    // Funkcja do załadowania nawigacji
    async function loadNavigation() {
        console.log('🔧 Navigation Loader: Starting...');
        try {
            console.log('🔧 Navigation Loader: Fetching /components/navigation.html');
            const response = await fetch('/components/navigation.html');
            console.log('🔧 Navigation Loader: Response status:', response.status);
            
            if (!response.ok) {
                throw new Error('Failed to load navigation component');
            }

            const html = await response.text();
            console.log('🔧 Navigation Loader: Received HTML, length:', html.length);
            
            // Wstaw nawigację na początku body
            const placeholder = document.getElementById('navigation-placeholder');
            console.log('🔧 Navigation Loader: Placeholder found:', !!placeholder);
            
            if (placeholder) {
                placeholder.innerHTML = html;
                console.log('✅ Navigation Loader: Navigation inserted into placeholder');
            } else {
                // Jeśli nie ma placeholdera, wstaw na początku body
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const navElement = tempDiv.firstElementChild;
                document.body.insertBefore(navElement, document.body.firstChild);
                console.log('✅ Navigation Loader: Navigation inserted at body start');
            }
            
            // Załaduj zewnętrzny skrypt nawigacji (CSP-safe)
            const navScript = document.createElement('script');
            navScript.src = '/js/components/navigation.js';
            navScript.async = false;
            navScript.onload = function() {
                console.log('✅ Navigation Loader: Navigation script loaded');
                // Inicjalizuj nawigację jeśli funkcja jest dostępna
                if (window.initNavigationComponent) {
                    window.initNavigationComponent();
                }
            };
            navScript.onerror = function() {
                console.error('❌ Navigation Loader: Failed to load navigation script');
            };
            document.head.appendChild(navScript);
            console.log('🔧 Navigation Loader: Loading navigation script from /js/components/navigation.js');

        } catch (error) {
            console.error('❌ Navigation Loader: Error loading navigation:', error);
        }
    }

    // Załaduj nawigację po załadowaniu DOM
    console.log('🔧 Navigation Loader: Script loaded, readyState:', document.readyState);
    if (document.readyState === 'loading') {
        console.log('🔧 Navigation Loader: Waiting for DOMContentLoaded...');
        document.addEventListener('DOMContentLoaded', loadNavigation);
    } else {
        console.log('🔧 Navigation Loader: DOM already loaded, loading immediately');
        loadNavigation();
    }

})();
