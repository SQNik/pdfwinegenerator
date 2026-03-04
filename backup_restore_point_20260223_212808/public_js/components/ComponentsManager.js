/**
 * 🎨 HTML Components Manager
 * 
 * Menedżer komponentów HTML dla Template Editor.
 * Zarządza:
 * - Wyświetlaniem komponentów w toolbarze
 * - Konfiguracją komponentów (modals)
 * - Wstawianiem shortcode do edytora CodeMirror
 * - Generowaniem dynamicznych formularzy
 * 
 * Wymaga:
 * - html-components.js (konfiguracja komponentów)
 * - CodeMirror (editor)
 * - Bootstrap 5 (modals)
 */

class ComponentsManager {
    constructor() {
        this.components = window.HTML_COMPONENTS || [];
        this.currentComponent = null;
        this.currentConfig = {};
        this.modal = null;
        
        this.init();
    }

    /**
     * Inicjalizacja menedżera
     */
    init() {
        console.log('🎨 ComponentsManager initializing...');
        
        // Renderuj komponenty w toolbarze
        this.renderComponentsToolbar();
        
        // Inicjalizuj modal
        this.initModal();
        
        // Event listeners
        this.attachEventListeners();
        
        console.log('✅ ComponentsManager initialized with', this.components.length, 'components');
    }

    /**
     * Renderuj toolbar z komponentami
     */
    renderComponentsToolbar() {
        const grid = document.getElementById('componentsGrid');
        if (!grid) {
            console.error('❌ ComponentsGrid not found');
            return;
        }

        // Wyczyść loading
        grid.innerHTML = '';

        // Brak komponentów
        if (this.components.length === 0) {
            grid.innerHTML = `
                <div class="component-loading">
                    <p class="text-white-50 mb-0">Brak dostępnych komponentów</p>
                </div>
            `;
            return;
        }

        // Renderuj każdy komponent
        this.components.forEach(component => {
            const btn = this.createComponentButton(component);
            grid.appendChild(btn);
        });
    }

    /**
     * Stwórz przycisk komponentu
     */
    createComponentButton(component) {
        const btn = document.createElement('button');
        btn.className = 'component-btn';
        btn.dataset.componentId = component.id;
        btn.title = component.description;
        
        btn.innerHTML = `
            <div class="component-btn-icon">
                <i class="bi ${component.icon}"></i>
            </div>
            <div class="component-btn-label">${component.label}</div>
        `;
        
        // Click handler - otwórz modal konfiguracji
        btn.addEventListener('click', () => {
            this.openComponentConfig(component);
        });
        
        return btn;
    }

    /**
     * Inicjalizuj modal Bootstrap
     */
    initModal() {
        const modalEl = document.getElementById('componentConfigModal');
        if (!modalEl) {
            console.error('❌ Component modal not found');
            return;
        }

        this.modal = new bootstrap.Modal(modalEl);

        // Event listener dla przycisku "Wstaw do edytora"
        const insertBtn = document.getElementById('insertComponentBtn');
        if (insertBtn) {
            insertBtn.addEventListener('click', () => this.insertComponentToEditor());
        }

        // Reset przy zamknięciu
        modalEl.addEventListener('hidden.bs.modal', () => {
            this.currentComponent = null;
            this.currentConfig = {};
        });
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Event listener dla zmian w formularzu (live preview)
        document.addEventListener('input', (e) => {
            if (e.target.closest('#componentConfigForm')) {
                this.updatePreview();
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.closest('#componentConfigForm')) {
                this.updatePreview();
            }
        });
    }

    /**
     * Otwórz modal konfiguracji komponentu
     */
    openComponentConfig(component) {
        console.log('🎨 Opening config for:', component.label);
        
        this.currentComponent = component;
        this.currentConfig = {};

        // Ustaw tytuł modalu
        const titleEl = document.getElementById('componentModalTitle');
        if (titleEl) {
            titleEl.textContent = component.label;
        }

        // Generuj formularz
        this.generateConfigForm(component);

        // Ukryj preview na starcie
        const preview = document.getElementById('componentPreview');
        if (preview) {
            preview.style.display = 'none';
        }

        // Pokaż modal
        this.modal.show();
    }

    /**
     * Generuj dynamiczny formularz konfiguracji
     */
    generateConfigForm(component) {
        const formContainer = document.getElementById('componentConfigForm');
        if (!formContainer) return;

        // Wyczyść poprzedni formularz
        formContainer.innerHTML = '';

        // Opis komponentu
        const descEl = document.createElement('div');
        descEl.className = 'alert alert-info mb-4';
        descEl.innerHTML = `
            <i class="bi ${component.icon} me-2"></i>
            ${component.description}
        `;
        formContainer.appendChild(descEl);

        // Generuj pola na podstawie properties
        component.properties.forEach(property => {
            const fieldEl = this.createFormField(property);
            formContainer.appendChild(fieldEl);
        });
    }

    /**
     * Stwórz pole formularza na podstawie właściwości
     */
    createFormField(property) {
        const fieldGroup = document.createElement('div');
        fieldGroup.className = 'modern-form-group';

        // Label
        const label = document.createElement('label');
        label.className = 'modern-label';
        label.textContent = property.label + (property.required ? ' *' : '');
        fieldGroup.appendChild(label);

        // Pole input
        let inputEl;

        switch (property.type) {
            case 'textarea':
                inputEl = document.createElement('textarea');
                inputEl.className = 'modern-textarea';
                inputEl.rows = property.rows || 3;
                break;

            case 'select':
                inputEl = document.createElement('select');
                inputEl.className = 'modern-select';
                
                // Dodaj opcje
                if (property.options) {
                    property.options.forEach(option => {
                        const optionEl = document.createElement('option');
                        optionEl.value = option.value;
                        optionEl.textContent = option.label;
                        if (option.value === property.default) {
                            optionEl.selected = true;
                        }
                        inputEl.appendChild(optionEl);
                    });
                }
                break;

            case 'templateSelect':
                // Specjalny select dla szablonów - będzie wypełniony async
                inputEl = document.createElement('select');
                inputEl.className = 'modern-select';
                inputEl.dataset.asyncType = 'templates';
                
                // Dodaj loading option
                const loadingOption = document.createElement('option');
                loadingOption.textContent = 'Ładowanie szablonów...';
                loadingOption.disabled = true;
                loadingOption.selected = true;
                inputEl.appendChild(loadingOption);
                
                // Załaduj szablony asynchronicznie
                this.loadTemplatesForSelect(inputEl);
                break;

            case 'checkbox':
                const checkboxWrapper = document.createElement('div');
                checkboxWrapper.className = 'd-flex align-items-center gap-2';
                
                inputEl = document.createElement('input');
                inputEl.type = 'checkbox';
                inputEl.className = 'form-check-input';
                inputEl.checked = property.default || false;
                
                const checkLabel = document.createElement('label');
                checkLabel.className = 'form-check-label';
                checkLabel.textContent = property.description || '';
                
                checkboxWrapper.appendChild(inputEl);
                checkboxWrapper.appendChild(checkLabel);
                
                fieldGroup.appendChild(checkboxWrapper);
                
                inputEl.dataset.propertyName = property.name;
                return fieldGroup;

            case 'number':
                inputEl = document.createElement('input');
                inputEl.type = 'number';
                inputEl.className = 'modern-input';
                if (property.min !== undefined) inputEl.min = property.min;
                if (property.max !== undefined) inputEl.max = property.max;
                if (property.default !== undefined) inputEl.value = property.default;
                break;

            default: // text
                inputEl = document.createElement('input');
                inputEl.type = 'text';
                inputEl.className = 'modern-input';
                break;
        }

        // Wspólne atrybuty
        if (property.type !== 'checkbox') {
            inputEl.dataset.propertyName = property.name;
            if (property.placeholder) inputEl.placeholder = property.placeholder;
            if (property.required) inputEl.required = true;
            if (property.default && property.type !== 'select') inputEl.value = property.default;
            
            fieldGroup.appendChild(inputEl);
        }

        // Description (jeśli nie checkbox)
        if (property.description && property.type !== 'checkbox') {
            const desc = document.createElement('small');
            desc.className = 'text-muted d-block mt-1';
            desc.textContent = property.description;
            fieldGroup.appendChild(desc);
        }

        return fieldGroup;
    }

    /**
     * Pobierz aktualną konfigurację z formularza
     */
    getFormConfig() {
        const config = {};
        const formInputs = document.querySelectorAll('#componentConfigForm [data-property-name]');
        
        formInputs.forEach(input => {
            const name = input.dataset.propertyName;
            
            if (input.type === 'checkbox') {
                config[name] = input.checked;
            } else {
                config[name] = input.value;
            }
        });
        
        return config;
    }

    /**
     * Aktualizuj podgląd shortcode
     */
    updatePreview() {
        if (!this.currentComponent) return;

        const config = this.getFormConfig();
        this.currentConfig = config;

        // Waliduj konfigurację
        const validation = window.validateComponentConfig(this.currentComponent.id, config);
        
        const preview = document.getElementById('componentPreview');
        const previewCode = document.getElementById('componentPreviewCode');
        
        if (!preview || !previewCode) return;

        if (validation.valid) {
            // Generuj shortcode
            const shortcode = this.currentComponent.generateShortcode(config);
            
            // Pokaż preview
            preview.style.display = 'block';
            previewCode.textContent = shortcode;
        } else {
            // Ukryj preview jeśli walidacja nie przeszła
            preview.style.display = 'none';
        }
    }

    /**
     * Wstaw komponent do edytora CodeMirror
     */
    insertComponentToEditor() {
        if (!this.currentComponent) {
            console.error('❌ No component selected');
            return;
        }

        // Pobierz konfigurację z formularza
        const config = this.getFormConfig();

        // Waliduj
        const validation = window.validateComponentConfig(this.currentComponent.id, config);
        
        if (!validation.valid) {
            alert('❌ Błąd: ' + validation.errors.join('\n'));
            return;
        }

        // Generuj shortcode
        const shortcode = this.currentComponent.generateShortcode(config);

        // Wstaw do edytora HTML
        this.insertToCodeMirror(shortcode);

        // Zamknij modal
        this.modal.hide();

        // Sukces toast
        this.showSuccessToast(`✅ Komponent "${this.currentComponent.label}" wstawiony do edytora`);
    }

    /**
     * Wstaw text do CodeMirror w miejscu kursora
     */
    insertToCodeMirror(text) {
        // Pobierz instancję Template Editor
        const templateEditor = window.templateEditor;
        
        if (!templateEditor || !templateEditor.htmlEditor) {
            console.error('❌ CodeMirror HTML editor not found');
            alert('❌ Błąd: Nie można znaleźć edytora HTML');
            return;
        }

        const editor = templateEditor.htmlEditor;
        
        // Pobierz pozycję kursora
        const cursor = editor.getCursor();
        
        // Wstaw text w miejscu kursora
        editor.replaceRange(text, cursor);
        
        // Przesuń kursor na koniec wstawionego tekstu
        const lines = text.split('\n');
        const lastLine = lines[lines.length - 1];
        const newCursor = {
            line: cursor.line + lines.length - 1,
            ch: lines.length === 1 ? cursor.ch + lastLine.length : lastLine.length
        };
        editor.setCursor(newCursor);
        
        // Focus na edytorze
        editor.focus();
        
        console.log('✅ Shortcode inserted at cursor position:', cursor);
    }

    /**
     * Pokaż toast powiadomienie
     */
    showSuccessToast(message) {
        // Sprawdź czy istnieje toast container
        let toastContainer = document.querySelector('.toast-container');
        
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        // Stwórz toast
        const toastEl = document.createElement('div');
        toastEl.className = 'toast align-items-center text-white bg-success border-0';
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        toastContainer.appendChild(toastEl);
        
        // Pokaż toast
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
        
        // Usuń po zamknięciu
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    }

    /**
     * 📥 Załaduj szablony z API i wypełnij select
     * @param {HTMLSelectElement} selectEl - Element select do wypełnienia
     */
    async loadTemplatesForSelect(selectEl) {
        try {
            // Pobierz szablony HTML z API (te z template-editor.html)
            const response = await window.api.getHTMLTemplates();
            
            if (!response.success || !response.data) {
                throw new Error('Nie udało się pobrać szablonów HTML');
            }
            
            const templates = response.data;
            
            // Wyczyść select
            selectEl.innerHTML = '';
            
            // Dodaj placeholder option
            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.textContent = '-- Wybierz szablon HTML --';
            placeholderOption.disabled = true;
            placeholderOption.selected = true;
            selectEl.appendChild(placeholderOption);
            
            // Dodaj opcje dla każdego szablonu HTML
            templates.forEach(template => {
                const option = document.createElement('option');
                option.value = template.id;
                option.textContent = `${template.name}${template.category ? ' (' + template.category + ')' : ''}`;
                selectEl.appendChild(option);
            });
            
            console.log(`✅ Załadowano ${templates.length} szablonów HTML do selecta`);
            
        } catch (error) {
            console.error('❌ Błąd ładowania szablonów HTML:', error);
            
            // Pokaż błąd w select
            selectEl.innerHTML = '';
            const errorOption = document.createElement('option');
            errorOption.textContent = '⚠️ Błąd ładowania szablonów';
            errorOption.disabled = true;
            errorOption.selected = true;
            selectEl.appendChild(errorOption);
        }
    }
}

// Eksportuj do globalnego scope
window.ComponentsManager = ComponentsManager;

console.log('✅ ComponentsManager class loaded');
