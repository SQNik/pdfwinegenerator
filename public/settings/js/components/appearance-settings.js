/**
 * Appearance Settings Component
 * Zarządza ustawieniami wyglądu aplikacji
 */

class AppearanceSettings {
    constructor() {
        this.api = new SettingsAPI('appearance');
        this.settings = null;
    }

    async load() {
        const response = await this.api.getSettings();
        this.settings = response.data;
    }

    render() {
        return `
            <div class="settings-section">
                <div class="settings-header">
                    <h1><i class="bi bi-palette"></i> Ustawienia Wyglądu</h1>
                    <p class="text-muted">Dostosuj wygląd aplikacji do swoich preferencji</p>
                </div>

                <div class="settings-body">
                    <!-- Theme Selection -->
                    <div class="ds-card">
                        <h3>Motyw kolorystyczny</h3>
                        <div class="theme-grid">
                            ${this.renderThemeOptions()}
                        </div>
                    </div>

                    <!-- Color Customization -->
                    <div class="ds-card">
                        <h3>Kolory główne</h3>
                        <div class="color-inputs">
                            <div class="form-group">
                                <label for="primaryColor">Kolor główny</label>
                                <input type="color" id="primaryColor" 
                                       value="${this.settings.primaryColor || '#10b981'}">
                            </div>
                            <div class="form-group">
                                <label for="accentColor">Kolor akcentu</label>
                                <input type="color" id="accentColor" 
                                       value="${this.settings.accentColor || '#3b82f6'}">
                            </div>
                            <div class="form-group">
                                <label for="heroGradientStart">Gradient - Start</label>
                                <input type="color" id="heroGradientStart" 
                                       value="${this.settings.heroGradientStart || '#10b981'}">
                            </div>
                            <div class="form-group">
                                <label for="heroGradientEnd">Gradient - Koniec</label>
                                <input type="color" id="heroGradientEnd" 
                                       value="${this.settings.heroGradientEnd || '#059669'}">
                            </div>
                        </div>
                    </div>

                    <!-- Typography & Spacing -->
                    <div class="ds-card">
                        <h3>Typografia i odstępy</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="fontSize">Rozmiar czcionki</label>
                                <select id="fontSize" class="ds-input">
                                    <option value="small" ${this.settings.fontSize === 'small' ? 'selected' : ''}>Mała</option>
                                    <option value="medium" ${this.settings.fontSize === 'medium' ? 'selected' : ''}>Średnia</option>
                                    <option value="large" ${this.settings.fontSize === 'large' ? 'selected' : ''}>Duża</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="spacing">Odstępy</label>
                                <select id="spacing" class="ds-input">
                                    <option value="compact" ${this.settings.spacing === 'compact' ? 'selected' : ''}>Kompaktowe</option>
                                    <option value="normal" ${this.settings.spacing === 'normal' ? 'selected' : ''}>Normalne</option>
                                    <option value="spacious" ${this.settings.spacing === 'spacious' ? 'selected' : ''}>Przestronne</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="borderRadius">Zaokrąglenie rogów</label>
                                <select id="borderRadius" class="ds-input">
                                    <option value="0px" ${this.settings.borderRadius === '0px' ? 'selected' : ''}>Brak</option>
                                    <option value="4px" ${this.settings.borderRadius === '4px' ? 'selected' : ''}>Małe</option>
                                    <option value="8px" ${this.settings.borderRadius === '8px' ? 'selected' : ''}>Średnie</option>
                                    <option value="12px" ${this.settings.borderRadius === '12px' ? 'selected' : ''}>Duże</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Logo & Branding -->
                    <div class="ds-card">
                        <h3>Logo i Branding</h3>
                        <div class="branding-controls">
                            <div class="form-group">
                                <label for="appName">Nazwa aplikacji</label>
                                <input type="text" id="appName" class="ds-input"
                                       value="${this.settings.appName || 'Katalog Win'}"
                                       placeholder="Katalog Win">
                            </div>
                            <div class="form-group">
                                <label for="appIcon">Ikona (Bootstrap Icons)</label>
                                <input type="text" id="appIcon" class="ds-input"
                                       value="${this.settings.appIcon || 'bi-wine'}"
                                       placeholder="bi-wine">
                                <small>Nazwa klasy ikony z Bootstrap Icons (np. bi-wine, bi-cup-straw)</small>
                            </div>
                            <div class="form-group">
                                <label>Logo</label>
                                <div style="display: flex; gap: var(--ds-space-3); flex-wrap: wrap;">
                                    <button class="ds-btn ds-btn-secondary" id="uploadLogoBtn">
                                        <i class="bi bi-upload"></i> Prześlij logo
                                    </button>
                                    ${this.settings.appLogoUrl ? `
                                        <button class="ds-btn ds-btn-ghost" id="removeLogoBtn">
                                            <i class="bi bi-trash"></i> Usuń logo
                                        </button>
                                    ` : ''}
                                </div>
                                <input type="file" id="logoFileInput" accept="image/png,image/jpeg,image/svg+xml" style="display:none;">
                                ${this.settings.appLogoUrl ? `
                                    <div class="logo-preview">
                                        <img src="${this.settings.appLogoUrl}" alt="Logo">
                                        <span>Aktualne logo</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Custom CSS -->
                    <div class="ds-card">
                        <h3>Własny CSS</h3>
                        <div class="form-group">
                            <label for="customCSS">Kod CSS</label>
                            <textarea id="customCSS" class="ds-input" rows="8" 
                                      placeholder="/* Twój własny CSS */\n.custom-class {\n  color: red;\n}">${this.settings.customCSS || ''}</textarea>
                            <small>Zaawansowane: dodaj własne style CSS</small>
                        </div>
                    </div>
                </div>

                <div class="settings-footer">
                    <button class="ds-btn ds-btn-primary" id="saveAppearance">
                        <i class="bi bi-save"></i> Zapisz zmiany
                    </button>
                    <button class="ds-btn ds-btn-ghost" id="resetAppearance">
                        <i class="bi bi-arrow-clockwise"></i> Przywróć domyślne
                    </button>
                </div>
            </div>
        `;
    }

    renderThemeOptions() {
        const themes = [
            { id: 'light', name: 'Jasny', icon: 'bi-sun' },
            { id: 'dark', name: 'Ciemny', icon: 'bi-moon' },
            { id: 'wine', name: 'Bordowy', icon: 'bi-wine' },
            { id: 'custom', name: 'Własny', icon: 'bi-palette' }
        ];

        return themes.map(theme => `
            <div class="theme-option ${this.settings.theme === theme.id ? 'active' : ''}"
                 data-theme="${theme.id}">
                <i class="bi ${theme.icon}"></i>
                <span>${theme.name}</span>
            </div>
        `).join('');
    }

    async init() {
        // Save button
        document.getElementById('saveAppearance')?.addEventListener('click', () => this.save());
        
        // Reset button
        document.getElementById('resetAppearance')?.addEventListener('click', () => this.reset());
        
        // Upload logo
        document.getElementById('uploadLogoBtn')?.addEventListener('click', () => {
            document.getElementById('logoFileInput').click();
        });
        
        document.getElementById('logoFileInput')?.addEventListener('change', (e) => this.uploadLogo(e));
        
        // Remove logo
        document.getElementById('removeLogoBtn')?.addEventListener('click', () => this.removeLogo());

        // Theme selection
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });
    }

    async save() {
        const settings = {
            theme: document.querySelector('.theme-option.active')?.dataset.theme || 'wine',
            primaryColor: document.getElementById('primaryColor').value,
            accentColor: document.getElementById('accentColor').value,
            heroGradientStart: document.getElementById('heroGradientStart').value,
            heroGradientEnd: document.getElementById('heroGradientEnd').value,
            fontSize: document.getElementById('fontSize').value,
            spacing: document.getElementById('spacing').value,
            borderRadius: document.getElementById('borderRadius').value,
            appName: document.getElementById('appName').value,
            appIcon: document.getElementById('appIcon').value,
            customCSS: document.getElementById('customCSS').value
        };

        try {
            await this.api.updateSettings(settings);
            alert('✅ Ustawienia zapisane pomyślnie!\n\nStrona zostanie przeładowana.');
            window.location.reload();
        } catch (error) {
            alert('❌ Błąd zapisywania ustawień: ' + error.message);
        }
    }

    async reset() {
        if (confirm('Czy na pewno chcesz przywrócić domyślne ustawienia wyglądu?')) {
            try {
                await this.api.reset();
                alert('✅ Przywrócono domyślne ustawienia');
                window.location.reload();
            } catch (error) {
                alert('❌ Błąd resetowania ustawień: ' + error.message);
            }
        }
    }

    async uploadLogo(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            alert('⚠️ Plik jest za duży. Maksymalny rozmiar: 2MB');
            return;
        }

        const formData = new FormData();
        formData.append('logo', file);

        try {
            await this.api.uploadLogo(formData);
            alert('✅ Logo przesłane pomyślnie');
            await window.settingsApp.loadSection('appearance');
        } catch (error) {
            alert('❌ Błąd przesyłania logo: ' + error.message);
        }
    }

    async removeLogo() {
        if (confirm('Czy na pewno chcesz usunąć logo?')) {
            try {
                await this.api.deleteLogo();
                alert('✅ Logo zostało usunięte');
                await window.settingsApp.loadSection('appearance');
            } catch (error) {
                alert('❌ Błąd usuwania logo: ' + error.message);
            }
        }
    }
}
