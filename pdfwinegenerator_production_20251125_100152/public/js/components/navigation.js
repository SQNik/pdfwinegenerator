/**
 * Navigation Component Script
 * Obsługuje funkcjonalność nawigacji (hamburger menu, active page, theme settings)
 */
(function() {
    'use strict';

    // Navigation functionality
    function initNavigation() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        console.log('Navigation elements:', { navToggle, navMenu, navLinksCount: navLinks.length });

        // Toggle mobile menu
        if (navToggle) {
            navToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Hamburger menu clicked');
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
                console.log('Menu state:', { 
                    toggleActive: navToggle.classList.contains('active'),
                    menuActive: navMenu.classList.contains('active')
                });
            });
        } else {
            console.warn('Nav toggle button not found!');
        }

        // Close mobile menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (navToggle && navMenu) {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = event.target.closest('.main-nav');
            if (!isClickInsideNav && navMenu && navMenu.classList.contains('active')) {
                if (navToggle) {
                    navToggle.classList.remove('active');
                }
                navMenu.classList.remove('active');
            }
        });
    }

    // Highlight current page
    function setActivePage() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            if (linkPath === currentPath || 
                (currentPath === '/' && linkPath === '/') ||
                (currentPath.includes('index.html') && linkPath === '/')) {
                link.classList.add('current-page');
            }
        });
    }

    // Load theme settings from API
    async function loadThemeSettings() {
        const logoImage = document.getElementById('logo-image');
        const logoText = document.getElementById('logo-text');
        const logoContainer = document.querySelector('.nav-logo');
        const nav = document.querySelector('.main-nav');

        if (!logoImage || !logoText || !logoContainer || !nav) {
            console.warn('Navigation elements not found, skipping theme loading');
            return;
        }

        try {
            logoContainer.classList.add('loading');

            // Try multiple API paths for compatibility
            const apiPaths = ['/api/settings/appearance', '/theme-settings', '/api/theme-settings'];
            let response = null;

            for (const path of apiPaths) {
                try {
                    // Add cache busting parameter
                    response = await fetch(path + '?_t=' + Date.now());
                    if (response.ok) {
                        console.log('Loaded theme settings from:', path);
                        break;
                    }
                } catch (err) {
                    console.warn('Failed to load from:', path, err);
                    continue;
                }
            }

            if (!response || !response.ok) {
                console.warn('Could not load theme settings, using defaults');
                return;
            }

            const result = await response.json();
            console.log('Theme settings loaded:', result);
            
            // Extract settings from response (handle both {data: {...}} and direct object)
            const settings = result.data || result;
            console.log('Extracted settings:', settings);

            // Apply logo settings - support both old and new format
            if (settings.logo) {
                console.log('Using new logo format:', settings.logo);
                // New format with logo object
                if (settings.logo.type === 'image' && settings.logo.imageUrl) {
                    logoImage.src = settings.logo.imageUrl;
                    logoImage.style.display = 'block';
                    logoText.style.display = 'none';
                    console.log('Logo image set to:', settings.logo.imageUrl);
                } else if (settings.logo.type === 'text' && settings.logo.text) {
                    logoText.textContent = settings.logo.text;
                    logoImage.style.display = 'none';
                    logoText.style.display = 'block';
                    console.log('Logo text set to:', settings.logo.text);
                }
            } else if (settings.appLogoUrl || settings.appName) {
                console.log('Using old logo format - appLogoUrl:', settings.appLogoUrl, 'appName:', settings.appName);
                // Old format with appLogoUrl and appName
                if (settings.appLogoUrl) {
                    logoImage.src = settings.appLogoUrl;
                    logoImage.style.display = 'block';
                    logoText.style.display = 'none';
                    console.log('Logo image set to:', settings.appLogoUrl);
                } else if (settings.appName) {
                    logoText.textContent = settings.appName;
                    logoImage.style.display = 'none';
                    logoText.style.display = 'block';
                    console.log('Logo text set to:', settings.appName);
                }
            } else {
                console.warn('No logo configuration found in settings');
            }

            // Apply navigation colors
            if (settings.navigation) {
                if (settings.navigation.backgroundColor) {
                    nav.style.setProperty('--nav-bg-color', settings.navigation.backgroundColor);
                }
                if (settings.navigation.textColor) {
                    nav.style.setProperty('--nav-text-color', settings.navigation.textColor);
                }
                if (settings.navigation.hoverBackgroundColor) {
                    nav.style.setProperty('--nav-hover-bg-color', settings.navigation.hoverBackgroundColor);
                }
                if (settings.navigation.hoverTextColor) {
                    nav.style.setProperty('--nav-hover-text-color', settings.navigation.hoverTextColor);
                }
                if (settings.navigation.activeBackgroundColor) {
                    nav.style.setProperty('--nav-active-bg-color', settings.navigation.activeBackgroundColor);
                }
                if (settings.navigation.activeTextColor) {
                    nav.style.setProperty('--nav-active-text-color', settings.navigation.activeTextColor);
                }
            }

        } catch (error) {
            console.error('Error loading theme settings:', error);
        } finally {
            logoContainer.classList.remove('loading');
        }
    }

    // Initialize navigation when called
    function init() {
        console.log('🔧 Navigation Script: Initializing...');
        initNavigation();
        setActivePage();
        loadThemeSettings();
        console.log('✅ Navigation Script: Initialized');
    }

    // Export init function to window for external access
    window.initNavigationComponent = init;

    // Auto-initialize if navigation already loaded
    if (document.getElementById('main-navigation')) {
        init();
    }

})();
