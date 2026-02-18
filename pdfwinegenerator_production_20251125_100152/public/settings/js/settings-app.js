/**
 * Settings App - Main Controller
 * Zarządza nawigacją i lifecycle'em komponentów Settings
 */

class SettingsApp {
    constructor() {
        this.currentSection = 'appearance';
        this.components = {};
        this.container = document.getElementById('settings-section-container');
    }

    async init() {
        // Initialize components
        this.components = {
            appearance: new AppearanceSettings(),
            security: new SecuritySettings(),
            users: new UsersSettings(),
            system: new SystemSettings()
        };

        // Attach event listeners
        this.attachEventListeners();

        // Load initial section from URL hash or default
        const hash = window.location.hash.substring(1);
        const initialSection = hash || 'appearance';
        
        await this.loadSection(initialSection);
    }

    attachEventListeners() {
        // Navigation clicks
        document.querySelectorAll('.settings-nav-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.loadSection(section);
            });
        });

        // Handle browser back/forward
        window.addEventListener('hashchange', () => {
            const section = window.location.hash.substring(1) || 'appearance';
            this.loadSection(section, false);
        });
    }

    async loadSection(sectionName, updateHash = true) {
        const component = this.components[sectionName];

        if (!component) {
            console.error(`Section ${sectionName} not found`);
            this.showError(`Sekcja "${sectionName}" nie została znaleziona`);
            return;
        }

        try {
            // Update URL hash
            if (updateHash) {
                window.location.hash = sectionName;
            }

            // Update active state in navigation
            this.updateNavigation(sectionName);

            // Show loading state
            this.showLoading();

            // Load section data
            await component.load();
            
            // Render section
            this.container.innerHTML = component.render();
            
            // Initialize section (attach events, etc.)
            await component.init();
            
            // Update current section
            this.currentSection = sectionName;

            console.log(`✅ Loaded section: ${sectionName}`);
        } catch (error) {
            console.error(`Error loading section ${sectionName}:`, error);
            this.showError(`Błąd ładowania sekcji: ${error.message}`);
        }
    }

    updateNavigation(sectionName) {
        document.querySelectorAll('.settings-nav-item').forEach(btn => {
            const isActive = btn.dataset.section === sectionName;
            btn.classList.toggle('active', isActive);
        });
    }

    showLoading() {
        this.container.innerHTML = `
            <div class="loading">
                <i class="bi bi-hourglass-split"></i>
                <p>Ładowanie ustawień...</p>
            </div>
        `;
    }

    showError(message) {
        this.container.innerHTML = `
            <div class="error">
                <i class="bi bi-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    showNotification(message, type = 'success') {
        // Simple notification - można rozbudować
        const alertClass = type === 'success' ? 'text-success' : 'text-danger';
        const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill';
        
        // Można użyć istniejącego systemu notyfikacji z aplikacji
        alert(message);
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.settingsApp = new SettingsApp();
    window.settingsApp.init();
});
