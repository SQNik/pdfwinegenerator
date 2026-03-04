/**
 * NavigationComponent - Wspólny komponent nawigacji dla wszystkich stron
 * 
 * Obsługuje:
 * - Dynamiczną konfigurację kolorów tła
 * - Konfigurowalny brand/logo
 * - Responsywny design
 * - Automatyczne podświetlanie aktywnej strony
 * - Dropdown menu z dodatkowymi opcjami
 * 
 * Użycie:
 * const nav = new NavigationComponent({
 *   backgroundColor: 'bg-dark',
 *   brandText: 'Wine Management System',
 *   brandIcon: 'bi-grape',
 *   logoUrl: null // opcjonalny URL do logo
 * });
 * nav.render('#navigation-container');
 */
class NavigationComponent {
    constructor(props = {}) {
        this.props = {
            backgroundColor: props.backgroundColor || 'bg-dark',
            textColor: props.textColor || 'navbar-dark',
            brandText: props.brandText || 'Wine Management System',
            brandIcon: props.brandIcon || 'bi-grape',
            logoUrl: props.logoUrl || null,
            logoAlt: props.logoAlt || 'Logo',
            containerClass: props.containerClass || 'container',
            showDropdown: props.showDropdown !== false, // domyślnie true
            dropdownItems: props.dropdownItems || this.getDefaultDropdownItems(),
            customButtons: props.customButtons || []
        };
        
        this.currentPage = this.getCurrentPage();
        this.navigationItems = this.getNavigationItems();
    }

    /**
     * Pobiera nazwę aktualnej strony na podstawie URL
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
        return page.replace('.html', '');
    }

    /**
     * Definicja elementów nawigacji
     */
    getNavigationItems() {
        return [
            {
                id: 'index',
                href: 'index.html',
                icon: 'bi-house',
                text: 'Strona Główna',
                isExternal: false
            },
            {
                id: 'wines',
                href: 'wines.html',
                icon: 'bi-bottle',
                text: 'Wina',
                isExternal: false,
                hasSection: true,
                sectionData: 'wines'
            },
            {
                id: 'collections',
                href: 'collections.html',
                icon: 'bi-folder',
                text: 'Kolekcje',
                isExternal: false
            },
            {
                id: 'import',
                href: '#import',
                icon: 'bi-upload',
                text: 'Import',
                isExternal: false,
                isSection: true,
                sectionData: 'import',
                showOnPages: ['index'] // pokazuj tylko na stronie głównej
            },
            {
                id: 'pdf-templates',
                href: 'pdf-templates.html',
                icon: 'bi-file-pdf',
                text: 'Szablony PDF',
                isExternal: false
            },
            {
                id: 'template-editor',
                href: 'template-editor.html',
                icon: 'bi-code-square',
                text: 'HTML Editor',
                isExternal: false
            }
        ];
    }

    /**
     * Domyślne elementy dropdown menu z linkiem do opcji
     */
    getDefaultDropdownItems() {
        return [
            {
                id: 'options',
                href: 'options.html',
                icon: 'bi-palette',
                text: 'Opcje wyglądu',
                isDivider: false
            },
            {
                id: 'divider1',
                isDivider: true
            },
            {
                id: 'backup',
                action: 'backup',
                icon: 'bi-download',
                text: 'Backup danych',
                isDivider: false
            },
            {
                id: 'settings',
                action: 'settings',
                icon: 'bi-sliders',
                text: 'Ustawienia',
                isDivider: false
            },
            {
                id: 'divider2',
                isDivider: true
            },
            {
                id: 'pdf-editor',
                href: 'pdf-editor.html',
                icon: 'bi-file-earmark-text',
                text: 'Edytor PDF',
                isDivider: false
            }
        ];
    }

    /**
     * Renderuje brand/logo nawigacji
     */
    renderBrand() {
        const logoHtml = this.props.logoUrl 
            ? `<img src="${this.props.logoUrl}" alt="${this.props.logoAlt}" class="navbar-logo me-2" style="height: 32px;">` 
            : `<i class="${this.props.brandIcon} me-2"></i>`;
        
        return `
            <a class="navbar-brand" href="index.html">
                ${logoHtml}${this.props.brandText}
            </a>
        `;
    }

    /**
     * Renderuje elementy nawigacji
     */
    renderNavigationItems() {
        return this.navigationItems
            .filter(item => {
                // Filtruj elementy na podstawie aktualnej strony
                if (item.showOnPages) {
                    return item.showOnPages.includes(this.currentPage);
                }
                return true;
            })
            .map(item => {
                const isActive = this.isItemActive(item);
                const activeClass = isActive ? 'active' : '';
                const sectionData = item.sectionData ? `data-section="${item.sectionData}"` : '';
                
                return `
                    <li class="nav-item">
                        <a class="nav-link ${activeClass}" href="${item.href}" ${sectionData}>
                            <i class="${item.icon} me-1"></i>${item.text}
                        </a>
                    </li>
                `;
            }).join('');
    }

    /**
     * Sprawdza czy element nawigacji jest aktywny
     */
    isItemActive(item) {
        if (item.isSection) {
            return false; // sekcje nie są podświetlane jako aktywne
        }
        
        return item.id === this.currentPage || 
               (this.currentPage === 'index' && item.id === 'index');
    }

    /**
     * Renderuje dropdown menu
     */
    renderDropdown() {
        if (!this.props.showDropdown) {
            return '';
        }

        const dropdownItemsHtml = this.props.dropdownItems.map(item => {
            if (item.isDivider) {
                return '<li><hr class="dropdown-divider"></li>';
            }
            
            const actionData = item.action ? `data-action="${item.action}"` : '';
            const href = item.href || '#';
            
            return `
                <li>
                    <a class="dropdown-item" href="${href}" ${actionData}>
                        <i class="${item.icon} me-2"></i>${item.text}
                    </a>
                </li>
            `;
        }).join('');

        return `
            <div class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>Więcej
                </a>
                <ul class="dropdown-menu">
                    ${dropdownItemsHtml}
                </ul>
            </div>
        `;
    }

    /**
     * Renderuje niestandardowe przyciski
     */
    renderCustomButtons() {
        if (this.props.customButtons.length === 0) {
            return '';
        }

        const buttonsHtml = this.props.customButtons.map(button => {
            const actionData = button.action ? `data-action="${button.action}"` : '';
            return `
                <button class="btn ${button.class || 'btn-outline-light'} btn-sm me-2" ${actionData}>
                    <i class="${button.icon} me-1"></i>${button.text}
                </button>
            `;
        }).join('');

        return `<div class="d-flex">${buttonsHtml}</div>`;
    }

    /**
     * Renderuje kompletną nawigację
     */
    render(containerSelector) {
        const navHtml = `
            <nav class="navbar navbar-expand-lg ${this.props.textColor} ${this.props.backgroundColor}" id="main-navigation">
                <div class="${this.props.containerClass}">
                    ${this.renderBrand()}
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav me-auto">
                            ${this.renderNavigationItems()}
                        </ul>
                        <div class="navbar-nav">
                            ${this.renderCustomButtons()}
                            ${this.renderDropdown()}
                        </div>
                    </div>
                </div>
            </nav>
        `;

        // Wstaw HTML do kontenera
        const container = document.querySelector(containerSelector);
        if (container) {
            container.innerHTML = navHtml;
            this.attachEventListeners();
        } else {
            console.error(`NavigationComponent: Nie znaleziono kontenera: ${containerSelector}`);
        }
    }

    /**
     * Podpina event listenery
     */
    attachEventListeners() {
        // Event listenery dla akcji dropdown
        document.querySelectorAll('[data-action]').forEach(element => {
            element.addEventListener('click', (e) => {
                e.preventDefault();
                const action = e.currentTarget.getAttribute('data-action');
                this.handleAction(action, e);
            });
        });

        // Event listenery dla sekcji (na stronie głównej)
        document.querySelectorAll('[data-section]').forEach(element => {
            element.addEventListener('click', (e) => {
                const section = e.currentTarget.getAttribute('data-section');
                const href = e.currentTarget.getAttribute('href');
                
                // Tylko przechwytuj jeśli to jest sekcja na tej samej stronie (href zaczyna się od #)
                if (section && this.currentPage === 'index' && href && href.startsWith('#')) {
                    e.preventDefault();
                    this.handleSectionNavigation(section, e);
                }
                // Jeśli href prowadzi do zewnętrznej strony (.html), pozwól na normalną nawigację
            });
        });
    }

    /**
     * Obsługuje akcje dropdown
     */
    handleAction(action, event) {
        // Emituj event dla innych komponentów
        const customEvent = new CustomEvent('navigationAction', {
            detail: { action, originalEvent: event }
        });
        document.dispatchEvent(customEvent);

        // Podstawowa obsługa akcji
        switch (action) {
            case 'backup':
                console.log('Navigation: Backup action triggered');
                break;
            case 'settings':
                console.log('Navigation: Settings action triggered');
                break;
            default:
                console.log(`Navigation: Unknown action: ${action}`);
        }
    }

    /**
     * Obsługuje nawigację do sekcji na stronie głównej
     */
    handleSectionNavigation(section, event) {
        // Emituj event dla głównego managera aplikacji
        const customEvent = new CustomEvent('sectionNavigation', {
            detail: { section, originalEvent: event }
        });
        document.dispatchEvent(customEvent);
    }

    /**
     * Aktualizuje aktywny element nawigacji (dla SPA)
     */
    updateActiveItem(pageId) {
        // Usuń aktywne klasy
        document.querySelectorAll('.nav-link.active').forEach(link => {
            link.classList.remove('active');
        });

        // Dodaj aktywną klasę do właściwego elementu
        const activeLink = document.querySelector(`[href="${pageId}.html"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Aktualizuje props komponentu
     */
    updateProps(newProps) {
        this.props = { ...this.props, ...newProps };
    }

    /**
     * Pobiera referencję do elementu nawigacji
     */
    getNavigationElement() {
        return document.getElementById('main-navigation');
    }

    /**
     * Statyczna metoda do tworzenia nawigacji z centralnej konfiguracji
     */
    static createFromGlobalConfig(overrides = {}) {
        if (window.navigationConfig) {
            const config = window.navigationConfig.getNavigationComponentConfig();
            return new NavigationComponent({ ...config, ...overrides });
        } else {
            console.warn('NavigationComponent: Brak globalnej konfiguracji, używam domyślnej');
            return new NavigationComponent(overrides);
        }
    }

    /**
     * Statyczna metoda do inicjalizacji spójnej nawigacji
     */
    static initGlobalNavigation(containerId = '#navigation-container', overrides = {}) {
        const navigation = NavigationComponent.createFromGlobalConfig(overrides);
        navigation.render(containerId);
        
        // Zapisz jako globalna referencja
        window.navigationComponent = navigation;
        
        // Nasłuchuj zmian konfiguracji
        document.addEventListener('navigationConfigChanged', (e) => {
            const newConfig = e.detail.config;
            const navConfig = window.navigationConfig.getNavigationComponentConfig();
            navigation.updateProps({ ...navConfig, ...overrides });
            navigation.render(containerId);
        });
        
        return navigation;
    }
}

// Export dla użycia w innych modułach
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationComponent;
}

// Globalna dostępność
window.NavigationComponent = NavigationComponent;