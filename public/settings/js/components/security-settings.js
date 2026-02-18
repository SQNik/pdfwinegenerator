/**
 * Security Settings Component
 * Zarządza ustawieniami bezpieczeństwa aplikacji
 */

class SecuritySettings {
    constructor() {
        this.api = new SettingsAPI('security');
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
                    <h1><i class="bi bi-shield-lock"></i> Ustawienia Bezpieczeństwa</h1>
                    <p class="text-muted">Zarządzaj bezpieczeństwem aplikacji</p>
                </div>

                <div class="settings-body">
                    <!-- Password Policy -->
                    <div class="ds-card">
                        <h3>Polityka haseł</h3>
                        <div class="form-group">
                            <label for="minPasswordLength">Minimalna długość hasła</label>
                            <input type="number" id="minPasswordLength" class="ds-input" 
                                   value="${this.settings.minPasswordLength || 8}" min="6" max="32">
                        </div>
                        <div class="toggle-group">
                            <label class="toggle-label">
                                <input type="checkbox" id="requireSpecialChars" 
                                       ${this.settings.requireSpecialChars ? 'checked' : ''}>
                                <span>Wymagaj znaków specjalnych</span>
                            </label>
                        </div>
                        <div class="toggle-group">
                            <label class="toggle-label">
                                <input type="checkbox" id="requireNumbers" 
                                       ${this.settings.requireNumbers ? 'checked' : ''}>
                                <span>Wymagaj cyfr</span>
                            </label>
                        </div>
                        <div class="toggle-group">
                            <label class="toggle-label">
                                <input type="checkbox" id="requireUppercase" 
                                       ${this.settings.requireUppercase ? 'checked' : ''}>
                                <span>Wymagaj wielkich liter</span>
                            </label>
                        </div>
                    </div>

                    <!-- Session Settings -->
                    <div class="ds-card">
                        <h3>Sesje użytkowników</h3>
                        <div class="form-group">
                            <label for="sessionTimeout">Timeout sesji (minuty)</label>
                            <input type="number" id="sessionTimeout" class="ds-input" 
                                   value="${this.settings.sessionTimeout || 60}" min="5" max="1440">
                        </div>
                        <div class="form-group">
                            <label for="maxLoginAttempts">Maksymalna liczba prób logowania</label>
                            <input type="number" id="maxLoginAttempts" class="ds-input" 
                                   value="${this.settings.maxLoginAttempts || 5}" min="3" max="10">
                        </div>
                    </div>

                    <!-- Two-Factor Authentication -->
                    <div class="ds-card">
                        <h3>Uwierzytelnianie dwuetapowe</h3>
                        <div class="toggle-group">
                            <label class="toggle-label">
                                <input type="checkbox" id="enable2FA" 
                                       ${this.settings.enable2FA ? 'checked' : ''}>
                                <span>Włącz 2FA dla wszystkich użytkowników</span>
                            </label>
                        </div>
                    </div>

                    <!-- IP Restrictions -->
                    <div class="ds-card">
                        <h3>Ograniczenia IP</h3>
                        <div class="form-group">
                            <label for="allowedIPs">Dozwolone adresy IP (jeden na linię)</label>
                            <textarea id="allowedIPs" class="ds-input" rows="6" 
                                      placeholder="192.168.1.1&#10;10.0.0.0/24">${(this.settings.allowedIPs || []).join('\n')}</textarea>
                            <small>Pozostaw puste, aby zezwolić na wszystkie</small>
                        </div>
                    </div>
                </div>

                <div class="settings-footer">
                    <button class="ds-btn ds-btn-primary" id="saveSecurity">
                        <i class="bi bi-save"></i> Zapisz zmiany
                    </button>
                    <button class="ds-btn ds-btn-ghost" id="resetSecurity">
                        <i class="bi bi-arrow-clockwise"></i> Przywróć domyślne
                    </button>
                </div>
            </div>
        `;
    }

    async init() {
        document.getElementById('saveSecurity')?.addEventListener('click', () => this.save());
        document.getElementById('resetSecurity')?.addEventListener('click', () => this.reset());
    }

    async save() {
        const settings = {
            minPasswordLength: parseInt(document.getElementById('minPasswordLength').value),
            requireSpecialChars: document.getElementById('requireSpecialChars').checked,
            requireNumbers: document.getElementById('requireNumbers').checked,
            requireUppercase: document.getElementById('requireUppercase').checked,
            sessionTimeout: parseInt(document.getElementById('sessionTimeout').value),
            maxLoginAttempts: parseInt(document.getElementById('maxLoginAttempts').value),
            enable2FA: document.getElementById('enable2FA').checked,
            allowedIPs: document.getElementById('allowedIPs').value.split('\n').filter(ip => ip.trim())
        };

        try {
            await this.api.updateSettings(settings);
            alert('✅ Ustawienia bezpieczeństwa zapisane');
            await window.settingsApp.loadSection('security');
        } catch (error) {
            alert('❌ Błąd zapisywania: ' + error.message);
        }
    }

    async reset() {
        if (confirm('Czy na pewno chcesz przywrócić domyślne ustawienia bezpieczeństwa?')) {
            try {
                await this.api.reset();
                alert('✅ Przywrócono domyślne ustawienia');
                await window.settingsApp.loadSection('security');
            } catch (error) {
                alert('❌ Błąd resetowania: ' + error.message);
            }
        }
    }
}
