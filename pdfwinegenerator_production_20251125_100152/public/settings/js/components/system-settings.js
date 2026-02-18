/**
 * System Settings Component
 * Zarządza ustawieniami systemowymi aplikacji
 */

class SystemSettings {
    constructor() {
        this.api = new SettingsAPI('system');
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
                    <h1><i class="bi bi-gear"></i> Ustawienia Systemowe</h1>
                    <p class="text-muted">Konfiguracja zaawansowana i narzędzia systemowe</p>
                </div>

                <div class="settings-body">
                    <!-- Backup Settings -->
                    <div class="ds-card">
                        <h3>Kopie zapasowe</h3>
                        <div class="toggle-group">
                            <label class="toggle-label">
                                <input type="checkbox" id="autoBackup" 
                                       ${this.settings.autoBackup ? 'checked' : ''}>
                                <span>Automatyczne kopie zapasowe</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <label for="backupFrequency">Częstotliwość backupu</label>
                            <select id="backupFrequency" class="ds-input">
                                <option value="hourly" ${this.settings.backupFrequency === 'hourly' ? 'selected' : ''}>Co godzinę</option>
                                <option value="daily" ${this.settings.backupFrequency === 'daily' ? 'selected' : ''}>Codziennie</option>
                                <option value="weekly" ${this.settings.backupFrequency === 'weekly' ? 'selected' : ''}>Co tydzień</option>
                                <option value="monthly" ${this.settings.backupFrequency === 'monthly' ? 'selected' : ''}>Co miesiąc</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="backupRetention">Czas przechowywania (dni)</label>
                            <input type="number" id="backupRetention" class="ds-input" 
                                   value="${this.settings.backupRetentionDays || 30}" min="1" max="365">
                        </div>
                    </div>

                    <!-- Performance & Cache -->
                    <div class="ds-card">
                        <h3>Wydajność i cache</h3>
                        <div class="toggle-group">
                            <label class="toggle-label">
                                <input type="checkbox" id="enableCache" 
                                       ${this.settings.enableCache ? 'checked' : ''}>
                                <span>Włącz cache</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <label for="cacheDuration">Czas życia cache (sekundy)</label>
                            <input type="number" id="cacheDuration" class="ds-input" 
                                   value="${this.settings.cacheDuration || 3600}" min="60" max="86400">
                        </div>
                        <div class="form-group">
                            <label for="maxCacheSize">Maksymalny rozmiar cache (MB)</label>
                            <input type="number" id="maxCacheSize" class="ds-input" 
                                   value="${this.settings.maxCacheSize || 100}" min="10" max="1000">
                        </div>
                    </div>

                    <!-- Maintenance Mode -->
                    <div class="ds-card">
                        <h3>Tryb konserwacji</h3>
                        <div class="toggle-group">
                            <label class="toggle-label">
                                <input type="checkbox" id="maintenanceMode" 
                                       ${this.settings.maintenanceMode ? 'checked' : ''}>
                                <span>Włącz tryb konserwacji</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <label for="maintenanceMessage">Wiadomość dla użytkowników</label>
                            <textarea id="maintenanceMessage" class="ds-input" rows="3"
                                      placeholder="Przeprowadzamy prace konserwacyjne. Wrócimy wkrótce.">${this.settings.maintenanceMessage || ''}</textarea>
                        </div>
                    </div>

                    <!-- Logging & Debug -->
                    <div class="ds-card">
                        <h3>Logowanie i debug</h3>
                        <div class="form-group">
                            <label for="logLevel">Poziom logowania</label>
                            <select id="logLevel" class="ds-input">
                                <option value="error" ${this.settings.logLevel === 'error' ? 'selected' : ''}>Tylko błędy</option>
                                <option value="warn" ${this.settings.logLevel === 'warn' ? 'selected' : ''}>Ostrzeżenia</option>
                                <option value="info" ${this.settings.logLevel === 'info' ? 'selected' : ''}>Informacje</option>
                                <option value="debug" ${this.settings.logLevel === 'debug' ? 'selected' : ''}>Debug</option>
                            </select>
                        </div>
                        <div class="toggle-group">
                            <label class="toggle-label">
                                <input type="checkbox" id="debugMode" 
                                       ${this.settings.debugMode ? 'checked' : ''}>
                                <span>Tryb debugowania</span>
                            </label>
                        </div>
                    </div>

                    <!-- API & Rate Limiting -->
                    <div class="ds-card">
                        <h3>API i limity</h3>
                        <div class="form-group">
                            <label for="apiRateLimit">Limit żądań na minutę</label>
                            <input type="number" id="apiRateLimit" class="ds-input" 
                                   value="${this.settings.apiRateLimit || 100}" min="10" max="1000">
                        </div>
                        <div class="form-group">
                            <label for="maxUploadSize">Maksymalny rozmiar uploadu (MB)</label>
                            <input type="number" id="maxUploadSize" class="ds-input" 
                                   value="${this.settings.maxUploadSize || 10}" min="1" max="100">
                        </div>
                    </div>
                </div>

                <div class="settings-footer">
                    <button class="ds-btn ds-btn-primary" id="saveSystem">
                        <i class="bi bi-save"></i> Zapisz zmiany
                    </button>
                    <button class="ds-btn ds-btn-ghost" id="resetSystem">
                        <i class="bi bi-arrow-clockwise"></i> Przywróć domyślne
                    </button>
                </div>
            </div>
        `;
    }

    async init() {
        document.getElementById('saveSystem')?.addEventListener('click', () => this.save());
        document.getElementById('resetSystem')?.addEventListener('click', () => this.reset());
    }

    async save() {
        const settings = {
            autoBackup: document.getElementById('autoBackup').checked,
            backupFrequency: document.getElementById('backupFrequency').value,
            backupRetentionDays: parseInt(document.getElementById('backupRetention').value),
            enableCache: document.getElementById('enableCache').checked,
            cacheDuration: parseInt(document.getElementById('cacheDuration').value),
            maxCacheSize: parseInt(document.getElementById('maxCacheSize').value),
            maintenanceMode: document.getElementById('maintenanceMode').checked,
            maintenanceMessage: document.getElementById('maintenanceMessage').value,
            logLevel: document.getElementById('logLevel').value,
            debugMode: document.getElementById('debugMode').checked,
            apiRateLimit: parseInt(document.getElementById('apiRateLimit').value),
            maxUploadSize: parseInt(document.getElementById('maxUploadSize').value)
        };

        try {
            await this.api.updateSettings(settings);
            alert('✅ Ustawienia systemowe zapisane');
            await window.settingsApp.loadSection('system');
        } catch (error) {
            alert('❌ Błąd zapisywania: ' + error.message);
        }
    }

    async reset() {
        if (confirm('Czy na pewno chcesz przywrócić domyślne ustawienia systemowe?')) {
            try {
                await this.api.reset();
                alert('✅ Przywrócono domyślne ustawienia');
                await window.settingsApp.loadSection('system');
            } catch (error) {
                alert('❌ Błąd resetowania: ' + error.message);
            }
        }
    }
}
