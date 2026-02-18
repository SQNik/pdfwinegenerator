// Utility Functions for Wine Management System
class Utils {
    /**
     * Show loading indicator
     * @param {boolean} show - Whether to show or hide loading
     */
    static showLoading(show = true) {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.classList.toggle('d-none', !show);
        }
    }

    /**
     * Show alert message
     * @param {string} message - Alert message
     * @param {string} type - Alert type (success, danger, warning, info)
     * @param {number} duration - Auto-hide duration in milliseconds
     */
    static showAlert(message, type = 'info', duration = CONFIG.UI.TOAST_DURATION) {
        const container = document.getElementById('alert-container');
        if (!container) return;

        const alertId = `alert-${Date.now()}`;
        const alertHTML = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                <i class="bi bi-${this.getAlertIcon(type)}"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;

        container.insertAdjacentHTML('afterbegin', alertHTML);

        // Auto-hide alert
        if (duration > 0) {
            setTimeout(() => {
                const alertElement = document.getElementById(alertId);
                if (alertElement) {
                    const bsAlert = new bootstrap.Alert(alertElement);
                    bsAlert.close();
                }
            }, duration);
        }
    }

    /**
     * Get Bootstrap icon for alert type
     * @param {string} type - Alert type
     * @returns {string} Icon class
     */
    static getAlertIcon(type) {
        const icons = {
            'success': 'check-circle-fill',
            'danger': 'exclamation-triangle-fill',
            'warning': 'exclamation-triangle-fill',
            'info': 'info-circle-fill'
        };
        return icons[type] || 'info-circle-fill';
    }

    /**
     * Format currency value
     * @param {number} value - Numeric value
     * @param {string} currency - Currency code
     * @returns {string} Formatted currency
     */
    static formatCurrency(value, currency = 'PLN') {
        if (value === null || value === undefined || isNaN(value)) {
            return '-';
        }
        return new Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    /**
     * Format date
     * @param {string|Date} date - Date to format
     * @param {string} format - Format type (short, long, datetime)
     * @returns {string} Formatted date
     */
    static formatDate(date, format = 'short') {
        if (!date) return '-';
        
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return '-';

        const options = {
            short: { year: 'numeric', month: '2-digit', day: '2-digit' },
            long: { year: 'numeric', month: 'long', day: 'numeric' },
            datetime: { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            }
        };

        return dateObj.toLocaleDateString('pl-PL', options[format] || options.short);
    }

    /**
     * Debounce function calls
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} Debounced function
     */
    static debounce(func, delay = CONFIG.UI.DEBOUNCE_DELAY) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Throttle function calls
     * @param {Function} func - Function to throttle
     * @param {number} limit - Time limit in milliseconds
     * @returns {Function} Throttled function
     */
    static throttle(func, limit = 100) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Get wine image URL
     * @param {string} imagePath - Image path or code
     * @returns {string} Image URL
     */
    static getWineImageUrl(imagePath) {
        if (!imagePath) {
            return CONFIG.IMAGES.DEFAULT_WINE;
        }
        
        // If imagePath already starts with /images/, return as is
        if (imagePath.startsWith('/images/')) {
            return imagePath;
        }
        
        // If imagePath already has .jpg extension, add only base path
        if (imagePath.endsWith('.jpg')) {
            return `${CONFIG.IMAGES.BASE_URL}/${imagePath}`;
        }
        
        // Otherwise, treat as image code and add both base path and extension
        return `${CONFIG.IMAGES.BASE_URL}/${imagePath}.jpg`;
    }

    /**
     * Validate wine image exists
     * @param {string} imageCode - Image code
     * @returns {Promise<boolean>} Whether image exists
     */
    static async validateWineImage(imageCode) {
        if (!imageCode) return false;
        
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = this.getWineImageUrl(imageCode);
        });
    }

    /**
     * Create image with fallback
     * @param {string} imageCode - Image code
     * @param {string} altText - Alt text
     * @param {string} className - CSS class
     * @returns {HTMLImageElement} Image element
     */
    static createImageWithFallback(imageCode, altText = '', className = '') {
        const img = document.createElement('img');
        img.alt = altText;
        img.className = className;
        
        const primaryUrl = this.getWineImageUrl(imageCode);
        const fallbackUrl = CONFIG.IMAGES.DEFAULT_WINE;
        
        img.onerror = () => {
            if (img.src !== fallbackUrl) {
                img.src = fallbackUrl;
            } else {
                // Prevent infinite loop by hiding failed fallback image
                img.style.display = 'none';
                console.warn('Fallback image also failed to load:', fallbackUrl);
            }
        };
        
        img.src = primaryUrl;
        return img;
    }

    /**
     * Sanitize HTML string
     * @param {string} str - String to sanitize
     * @returns {string} Sanitized string
     */
    static sanitizeHTML(str) {
        if (!str) return '';
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    /**
     * Escape HTML characters
     * @param {string} str - String to escape
     * @returns {string} Escaped string
     */
    static escapeHTML(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Generate unique ID
     * @param {string} prefix - ID prefix
     * @returns {string} Unique ID
     */
    static generateId(prefix = 'id') {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Deep clone object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }

    /**
     * Check if object is empty
     * @param {Object} obj - Object to check
     * @returns {boolean} Whether object is empty
     */
    static isEmpty(obj) {
        if (obj === null || obj === undefined) return true;
        if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        return false;
    }

    /**
     * Get nested object property safely
     * @param {Object} obj - Object
     * @param {string} path - Property path (e.g., 'user.profile.name')
     * @param {*} defaultValue - Default value if property doesn't exist
     * @returns {*} Property value or default
     */
    static getNestedProperty(obj, path, defaultValue = undefined) {
        return path.split('.').reduce((current, key) => 
            current && current[key] !== undefined ? current[key] : defaultValue, obj);
    }

    /**
     * Set nested object property
     * @param {Object} obj - Object
     * @param {string} path - Property path
     * @param {*} value - Value to set
     * @returns {Object} Modified object
     */
    static setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (current[key] === undefined) current[key] = {};
            return current[key];
        }, obj);
        target[lastKey] = value;
        return obj;
    }

    /**
     * Format file size
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted file size
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Download file
     * @param {Blob|string} data - File data or URL
     * @param {string} filename - File name
     * @param {string} mimeType - MIME type
     */
    static downloadFile(data, filename, mimeType = 'application/octet-stream') {
        const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    }

    /**
     * Check if device is mobile
     * @returns {boolean} Whether device is mobile
     */
    static isMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Get browser information
     * @returns {Object} Browser information
     */
    static getBrowserInfo() {
        const ua = navigator.userAgent;
        const browsers = {
            chrome: /chrome/i,
            safari: /safari/i,
            firefox: /firefox/i,
            edge: /edge/i,
            ie: /msie|trident/i
        };

        for (const [name, regex] of Object.entries(browsers)) {
            if (regex.test(ua)) {
                return { name, userAgent: ua };
            }
        }

        return { name: 'unknown', userAgent: ua };
    }

    /**
     * Local storage helpers
     */
    static storage = {
        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn('Error reading from localStorage:', error);
                return defaultValue;
            }
        },

        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn('Error writing to localStorage:', error);
                return false;
            }
        },

        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('Error removing from localStorage:', error);
                return false;
            }
        },

        clear: () => {
            try {
                localStorage.clear();
                return true;
            } catch (error) {
                console.warn('Error clearing localStorage:', error);
                return false;
            }
        }
    };

    /**
     * Form validation helpers
     */
    static validation = {
        /**
         * Validate wine data
         * @param {Object} wine - Wine data
         * @returns {Object} Validation result
         */
        validateWine: (wine) => {
            // 🔒 REGUŁA: TYLKO POLA DYNAMICZNE - używamy systemu dynamicznej walidacji
            if (window.WineFieldsConfig && window.WineFieldsConfig.validateWineData) {
                const result = window.WineFieldsConfig.validateWineData(wine);
                
                // Konwersja formatów - flatten errors array
                const flatErrors = [];
                if (result.errors) {
                    Object.values(result.errors).forEach(fieldErrors => {
                        if (Array.isArray(fieldErrors)) {
                            flatErrors.push(...fieldErrors);
                        }
                    });
                }
                
                return {
                    isValid: result.valid,
                    errors: flatErrors
                };
            }
            
            // Fallback dla przypadku gdy dynamic fields nie są jeszcze załadowane
            console.warn('Dynamic fields validation not available, using minimal validation');
            const errors = [];
            if (!wine.name || wine.name.trim() === '') {
                errors.push('Nazwa jest wymagana');
            }
            
            return {
                isValid: errors.length === 0,
                errors
            };
        }
    };
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}