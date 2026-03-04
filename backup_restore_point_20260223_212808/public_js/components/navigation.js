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
        const navOverlay = document.getElementById('nav-overlay');
        const navLinks = document.querySelectorAll('.nav-link');
        const mainNav = document.querySelector('.main-nav');

        console.log('Navigation elements:', { 
            navToggle, 
            navMenu, 
            navOverlay,
            navLinksCount: navLinks.length,
            mainNav 
        });

        // Scroll detection for sticky nav styling
        let lastScrollY = window.scrollY;
        
        function handleScroll() {
            const currentScrollY = window.scrollY;
            
            if (currentScrollY > 10) {
                mainNav?.classList.add('scrolled');
            } else {
                mainNav?.classList.remove('scrolled');
            }
            
            lastScrollY = currentScrollY;
        }

        // Debounce scroll handler for performance
        let scrollTimer;
        window.addEventListener('scroll', function() {
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
            scrollTimer = setTimeout(handleScroll, 10);
        }, { passive: true });

        // Initial scroll check
        handleScroll();

        // Toggle mobile menu
        if (navToggle && navMenu && navOverlay) {
            navToggle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const isActive = navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
                navOverlay.classList.toggle('active');
                
                // Update ARIA attributes
                navToggle.setAttribute('aria-expanded', isActive);
                navOverlay.setAttribute('aria-hidden', !isActive);
                
                // Prevent body scroll when menu is open
                document.body.style.overflow = isActive ? 'hidden' : '';
                
                console.log('Menu toggled:', { 
                    toggleActive: isActive,
                    menuActive: navMenu.classList.contains('active')
                });
            });

            // Close menu when clicking overlay
            navOverlay.addEventListener('click', function() {
                closeMenu();
            });
        } else {
            console.warn('Nav toggle, menu, or overlay not found!');
        }

        // Close mobile menu helper function
        function closeMenu() {
            if (navToggle && navMenu && navOverlay) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                navOverlay.classList.remove('active');
                navToggle.setAttribute('aria-expanded', 'false');
                navOverlay.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
            }
        }

        // Close mobile menu when clicking a link
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                closeMenu();
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isClickInsideNav = event.target.closest('.main-nav');
            if (!isClickInsideNav && navMenu && navMenu.classList.contains('active')) {
                closeMenu();
            }
        });

        // Handle escape key to close menu
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
                closeMenu();
                navToggle?.focus();
            }
        });

        // Close menu on window resize to desktop size
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768 && navMenu?.classList.contains('active')) {
                    closeMenu();
                }
            }, 250);
        });
    }

    // Highlight current page
    function setActivePage() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        console.log('Setting active page for path:', currentPath);
        
        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            
            // Remove any existing active classes
            link.classList.remove('current-page', 'active');
            
            // Check if this is the current page
            const isCurrentPage = 
                linkPath === currentPath || 
                (currentPath === '/' && linkPath === '/') ||
                (currentPath === '/index.html' && linkPath === '/') ||
                (currentPath.includes('index.html') && linkPath === '/');
            
            if (isCurrentPage) {
                link.classList.add('current-page');
                link.setAttribute('aria-current', 'page');
                console.log('Active page set:', linkPath);
            } else {
                link.removeAttribute('aria-current');
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

    // Note: Initialization is now handled by navigation-loader.js
    // to prevent double initialization

})();
