/**
 * Branding Manager - Logo Upload and Display
 */

class BrandingManager {
    constructor() {
        this.logoStorageKey = 'app_custom_logo';
        this.init();
    }

    init() {
        this.loadAndDisplayLogo();
    }

    /**
     * Load and display saved logo
     */
    loadAndDisplayLogo() {
        const savedLogo = localStorage.getItem(this.logoStorageKey);
        if (savedLogo) {
            this.displayLogo(savedLogo);
        }
    }

    /**
     * Display logo in brand icon
     */
    displayLogo(logoDataUrl) {
        const brandIcons = document.querySelectorAll('.modern-brand-icon');
        brandIcons.forEach(icon => {
            // Check if logo already exists
            let img = icon.querySelector('img');
            if (!img) {
                img = document.createElement('img');
                img.alt = 'Logo';
                icon.appendChild(img);
            }
            img.src = logoDataUrl;
            icon.classList.add('has-logo');
        });
    }

    /**
     * Upload and save logo
     */
    uploadLogo(file) {
        return new Promise((resolve, reject) => {
            // Validate file type
            const validTypes = ['image/png', 'image/svg+xml', 'image/jpeg'];
            if (!validTypes.includes(file.type)) {
                reject(new Error('Nieprawidłowy format pliku. Dozwolone: PNG, SVG, JPG'));
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                reject(new Error('Plik jest za duży. Maksymalny rozmiar: 2MB'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const logoDataUrl = e.target.result;
                localStorage.setItem(this.logoStorageKey, logoDataUrl);
                this.displayLogo(logoDataUrl);
                resolve(logoDataUrl);
            };
            reader.onerror = () => {
                reject(new Error('Błąd podczas wczytywania pliku'));
            };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Remove logo and restore default icon
     */
    removeLogo() {
        localStorage.removeItem(this.logoStorageKey);
        const brandIcons = document.querySelectorAll('.modern-brand-icon');
        brandIcons.forEach(icon => {
            const img = icon.querySelector('img');
            if (img) {
                img.remove();
            }
            icon.classList.remove('has-logo');
        });
    }

    /**
     * Create upload modal HTML
     */
    static createUploadModal() {
        return `
            <div class="modal fade" id="logoUploadModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content" style="border-radius: var(--radius-lg); border: none; box-shadow: var(--shadow-xl);">
                        <div class="modal-header" style="border-bottom: 1px solid var(--color-border-light); padding: var(--space-lg);">
                            <h5 class="modal-title" style="font-weight: 600; font-size: 1.25rem;">
                                <i class="bi bi-image"></i>
                                Zarządzanie Logo
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" style="padding: var(--space-lg);">
                            <div class="modern-form-group">
                                <label class="modern-label">Wgraj logo (PNG, SVG, JPG - max 2MB)</label>
                                <input type="file" id="logoFileInput" class="modern-input" accept="image/png,image/svg+xml,image/jpeg">
                                <small class="modern-text-secondary">Zalecany rozmiar: 512x512px lub proporcjonalny</small>
                            </div>
                            
                            <div class="modern-form-group" style="margin-top: var(--space-lg);">
                                <label class="modern-label">Podgląd</label>
                                <div style="display: flex; gap: var(--space-md); align-items: center;">
                                    <div class="modern-brand-icon" id="logoPreview">
                                        <i class="bi bi-grid-3x3-gap"></i>
                                    </div>
                                    <div class="modern-text-secondary">
                                        <small>Tak będzie wyglądać logo w nagłówku</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer" style="border-top: 1px solid var(--color-border-light); padding: var(--space-lg); gap: var(--space-sm);">
                            <button type="button" class="modern-btn modern-btn-ghost" id="removeLogoBtn">
                                <i class="bi bi-trash"></i>
                                Usuń Logo
                            </button>
                            <button type="button" class="modern-btn modern-btn-ghost" data-bs-dismiss="modal">Zamknij</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Initialize modal and event handlers
     */
    static initModal() {
        // Add modal to body if not exists
        if (!document.getElementById('logoUploadModal')) {
            document.body.insertAdjacentHTML('beforeend', BrandingManager.createUploadModal());
        }

        const brandingManager = new BrandingManager();
        const fileInput = document.getElementById('logoFileInput');
        const removeBtn = document.getElementById('removeLogoBtn');
        const preview = document.getElementById('logoPreview');

        // File input handler
        if (fileInput) {
            fileInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        const logoDataUrl = await brandingManager.uploadLogo(file);
                        // Update preview
                        let img = preview.querySelector('img');
                        if (!img) {
                            img = document.createElement('img');
                            img.alt = 'Logo';
                            preview.appendChild(img);
                        }
                        img.src = logoDataUrl;
                        preview.classList.add('has-logo');
                        
                        // Show success message
                        if (window.Utils && window.Utils.showAlert) {
                            window.Utils.showAlert('Logo zostało zapisane', 'success');
                        } else {
                            alert('Logo zostało zapisane!');
                        }
                    } catch (error) {
                        if (window.Utils && window.Utils.showAlert) {
                            window.Utils.showAlert(error.message, 'danger');
                        } else {
                            alert(error.message);
                        }
                    }
                }
            });
        }

        // Remove button handler
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                if (confirm('Czy na pewno chcesz usunąć logo?')) {
                    brandingManager.removeLogo();
                    // Reset preview
                    const img = preview.querySelector('img');
                    if (img) img.remove();
                    preview.classList.remove('has-logo');
                    fileInput.value = '';
                    
                    if (window.Utils && window.Utils.showAlert) {
                        window.Utils.showAlert('Logo zostało usunięte', 'info');
                    } else {
                        alert('Logo zostało usunięte!');
                    }
                }
            });
        }

        return brandingManager;
    }
}

// Initialize branding on page load
document.addEventListener('DOMContentLoaded', function() {
    const brandingManager = new BrandingManager();
    window.brandingManager = brandingManager;
});
