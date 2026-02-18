/**
 * Theme Manager
 * Handles dark/light theme switching with localStorage persistence
 */

class ThemeManager {
  constructor() {
    this.STORAGE_KEY = 'wine-app-theme';
    this.theme = this.getStoredTheme() || this.getSystemTheme();
    this.toggleButton = null;
    
    this.init();
  }

  /**
   * Initialize theme manager
   */
  init() {
    // Apply theme immediately to prevent flash
    this.applyTheme(this.theme);
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupToggleButton());
    } else {
      this.setupToggleButton();
    }
    
    // Listen for system theme changes
    this.watchSystemTheme();
  }

  /**
   * Get theme from localStorage
   */
  getStoredTheme() {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('localStorage not available:', e);
      return null;
    }
  }

  /**
   * Save theme to localStorage
   */
  saveTheme(theme) {
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme:', e);
    }
  }

  /**
   * Get system preferred theme
   */
  getSystemTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  /**
   * Watch for system theme changes
   */
  watchSystemTheme() {
    if (!window.matchMedia) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', (e) => {
        // Only update if user hasn't manually set a theme
        if (!this.getStoredTheme()) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener((e) => {
        if (!this.getStoredTheme()) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  /**
   * Apply theme to DOM
   */
  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', theme === 'dark' ? '#1a202c' : '#ffffff');
    }
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    this.theme = theme;
    this.applyTheme(theme);
    this.saveTheme(theme);
    this.updateToggleButton();
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('themechange', { 
      detail: { theme } 
    }));
  }

  /**
   * Toggle between light and dark theme
   */
  toggle() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Setup toggle button
   */
  setupToggleButton() {
    this.toggleButton = document.getElementById('themeToggle');
    
    if (!this.toggleButton) {
      console.warn('Theme toggle button not found (#themeToggle)');
      return;
    }
    
    // Add click listener
    this.toggleButton.addEventListener('click', () => this.toggle());
    
    // Update button state
    this.updateToggleButton();
    
    // Add keyboard accessibility
    this.toggleButton.setAttribute('aria-label', `Switch to ${this.theme === 'light' ? 'dark' : 'light'} theme`);
  }

  /**
   * Update toggle button state
   */
  updateToggleButton() {
    if (!this.toggleButton) return;
    
    this.toggleButton.setAttribute('aria-label', `Switch to ${this.theme === 'light' ? 'dark' : 'light'} theme`);
    
    // Update button title
    this.toggleButton.setAttribute('title', this.theme === 'light' ? 'Przełącz na ciemny motyw' : 'Przełącz na jasny motyw');
  }

  /**
   * Get current theme
   */
  getTheme() {
    return this.theme;
  }

  /**
   * Check if dark mode is active
   */
  isDark() {
    return this.theme === 'dark';
  }

  /**
   * Force specific theme
   */
  forceLightMode() {
    this.setTheme('light');
  }

  /**
   * Force dark mode
   */
  forceDarkMode() {
    this.setTheme('dark');
  }

  /**
   * Reset to system preference
   */
  resetToSystem() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.setTheme(this.getSystemTheme());
    } catch (e) {
      console.warn('Failed to reset theme:', e);
    }
  }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Export for global access
window.themeManager = themeManager;

// Expose useful methods globally
window.toggleTheme = () => themeManager.toggle();
window.setTheme = (theme) => themeManager.setTheme(theme);
window.getTheme = () => themeManager.getTheme();
