/**
 * 🎨 HTML Components Configuration
 * 
 * Plik konfiguracyjny definiujący wszystkie dostępne komponenty HTML
 * do wstawiania w edytorze szablonów.
 * 
 * Każdy komponent ma:
 * - id: unikalny identyfikator
 * - label: nazwa wyświetlana w UI
 * - icon: ikona Bootstrap Icons
 * - description: opis komponentu
 * - properties: definicje pól konfiguracyjnych
 * - generateShortcode: funkcja generująca shortcode
 * 
 * 📝 JAK DODAĆ NOWY KOMPONENT:
 * 1. Skopiuj istniejący komponent jako szablon
 * 2. Zmień id, label, icon
 * 3. Zdefiniuj properties (pola formularza)
 * 4. Zaimplementuj generateShortcode()
 * 5. Komponent automatycznie pojawi się w toolbarze!
 */

const HTML_COMPONENTS = [
    // ═══════════════════════════════════════════════════════════
    // 📝 TEXT COMPONENT - Komponent tekstu
    // ═══════════════════════════════════════════════════════════
    {
        id: 'text',
        label: 'Tekst',
        icon: 'bi-fonts',
        description: 'Wstaw blok tekstowy z możliwością formatowania',
        
        // Właściwości komponentu (pola w formularzu konfiguracji)
        properties: [
            {
                name: 'content',
                label: 'Treść tekstu',
                type: 'textarea',
                required: true,
                placeholder: 'Wprowadź treść...',
                rows: 4,
                description: 'Główna treść tekstowa'
            },
            {
                name: 'tag',
                label: 'Znacznik HTML',
                type: 'select',
                required: true,
                default: 'p',
                options: [
                    { value: 'p', label: 'Paragraf (p)' },
                    { value: 'h1', label: 'Nagłówek 1 (h1)' },
                    { value: 'h2', label: 'Nagłówek 2 (h2)' },
                    { value: 'h3', label: 'Nagłówek 3 (h3)' },
                    { value: 'h4', label: 'Nagłówek 4 (h4)' },
                    { value: 'span', label: 'Inline (span)' },
                    { value: 'div', label: 'Blok (div)' }
                ],
                description: 'Wybierz typ znacznika HTML'
            },
            {
                name: 'cssClass',
                label: 'Klasa CSS',
                type: 'text',
                placeholder: 'np. wine-title text-center',
                description: 'Opcjonalne klasy CSS oddzielone spacją'
            },
            {
                name: 'style',
                label: 'Styl inline',
                type: 'text',
                placeholder: 'np. font-size: 18px; color: #333;',
                description: 'Opcjonalne style CSS inline'
            }
        ],
        
        // Funkcja generująca shortcode
        generateShortcode: function(config) {
            const { content, tag, cssClass, style } = config;
            
            // Generuj unikalny ID dla komponentu
            const componentId = 'text_' + Date.now();
            
            // Zbuduj shortcode (self-closing format z value attribute)
            let shortcode = `[component type="text" id="${componentId}" value="${content}"`;
            if (tag) shortcode += ` tag="${tag}"`;
            if (cssClass) shortcode += ` class="${cssClass}"`;
            if (style) shortcode += ` style="${style}"`;
            shortcode += `]`;
            
            return shortcode;
        }
    },

    // ═══════════════════════════════════════════════════════════
    // 🖼️ IMAGE COMPONENT - Komponent obrazka
    // ═══════════════════════════════════════════════════════════
    {
        id: 'image',
        label: 'Obrazek',
        icon: 'bi-image',
        description: 'Wstaw obrazek z konfiguracją wymiarów',
        
        properties: [
            {
                name: 'src',
                label: 'Źródło obrazka',
                type: 'text',
                required: true,
                placeholder: 'URL lub {{wine.images[0]}}',
                description: 'URL obrazka lub placeholder z danymi'
            },
            {
                name: 'alt',
                label: 'Tekst alternatywny',
                type: 'text',
                placeholder: 'Opis obrazka',
                description: 'Tekst wyświetlany gdy obrazek się nie załaduje'
            },
            {
                name: 'width',
                label: 'Szerokość',
                type: 'text',
                placeholder: 'np. 200px, 50%, auto',
                description: 'Szerokość obrazka (px, %, auto)'
            },
            {
                name: 'height',
                label: 'Wysokość',
                type: 'text',
                placeholder: 'np. 200px, auto',
                description: 'Wysokość obrazka (px, auto)'
            },
            {
                name: 'objectFit',
                label: 'Dopasowanie',
                type: 'select',
                default: 'cover',
                options: [
                    { value: 'cover', label: 'Wypełnij (cover)' },
                    { value: 'contain', label: 'Zawrzyj (contain)' },
                    { value: 'fill', label: 'Rozciągnij (fill)' },
                    { value: 'none', label: 'Brak (none)' }
                ],
                description: 'Sposób dopasowania obrazka'
            },
            {
                name: 'cssClass',
                label: 'Klasa CSS',
                type: 'text',
                placeholder: 'np. wine-image rounded',
                description: 'Opcjonalne klasy CSS'
            }
        ],
        
        generateShortcode: function(config) {
            const { src, alt, width, height, objectFit, cssClass } = config;
            const componentId = 'img_' + Date.now();
            
            let shortcode = `[component type="image" id="${componentId}" src="${src}"`;
            if (alt) shortcode += ` alt="${alt}"`;
            if (width) shortcode += ` width="${width}"`;
            if (height) shortcode += ` height="${height}"`;
            if (objectFit) shortcode += ` objectFit="${objectFit}"`;
            if (cssClass) shortcode += ` class="${cssClass}"`;
            shortcode += `]`;
            
            return shortcode;
        }
    },

    // ═══════════════════════════════════════════════════════════
    // 📦 CONTAINER COMPONENT - Komponent kontenera
    // ═══════════════════════════════════════════════════════════
    {
        id: 'container',
        label: 'Container',
        icon: 'bi-box',
        description: 'Wstaw kontener HTML z możliwością layoutu',
        
        properties: [
            {
                name: 'layout',
                label: 'Układ kontenera',
                type: 'select',
                required: true,
                default: 'div',
                options: [
                    { value: 'div', label: 'Block (div)' },
                    { value: 'flex', label: 'Flexbox' },
                    { value: 'grid', label: 'CSS Grid' },
                    { value: 'section', label: 'Sekcja (section)' },
                    { value: 'article', label: 'Artykuł (article)' }
                ],
                description: 'Typ layoutu kontenera'
            },
            {
                name: 'width',
                label: 'Szerokość',
                type: 'text',
                placeholder: 'np. 100%, 800px, auto',
                description: 'Szerokość kontenera'
            },
            {
                name: 'height',
                label: 'Wysokość',
                type: 'text',
                placeholder: 'np. 300px, 50vh, auto',
                description: 'Wysokość kontenera'
            },
            {
                name: 'padding',
                label: 'Padding',
                type: 'text',
                placeholder: 'np. 20px, 1rem',
                description: 'Wewnętrzne odstępy'
            },
            {
                name: 'background',
                label: 'Tło',
                type: 'text',
                placeholder: 'np. #f5f5f5, transparent',
                description: 'Kolor tła kontenera'
            },
            {
                name: 'border',
                label: 'Ramka',
                type: 'text',
                placeholder: 'np. 1px solid #ddd',
                description: 'Definicja ramki CSS'
            },
            {
                name: 'cssClass',
                label: 'Klasa CSS',
                type: 'text',
                placeholder: 'np. wine-card shadow',
                description: 'Opcjonalne klasy CSS'
            }
        ],
        
        generateShortcode: function(config) {
            const { layout, width, height, padding, background, border, cssClass } = config;
            const componentId = 'container_' + Date.now();
            
            // Self-closing format
            let shortcode = `[component type="container" id="${componentId}" containerType="${layout}"`;
            if (width) shortcode += ` width="${width}"`;
            if (height) shortcode += ` height="${height}"`;
            if (padding) shortcode += ` padding="${padding}"`;
            if (background) shortcode += ` background="${background}"`;
            if (border) shortcode += ` border="${border}"`;
            if (cssClass) shortcode += ` class="${cssClass}"`;
            shortcode += `]`;
            
            return shortcode;
        }
    },

    // ═══════════════════════════════════════════════════════════
    // 📊 TABLE COMPONENT - Komponent tabeli
    // ═══════════════════════════════════════════════════════════
    {
        id: 'table',
        label: 'Tabela',
        icon: 'bi-table',
        description: 'Wstaw tabelę z konfigurowalnymi kolumnami',
        
        properties: [
            {
                name: 'columns',
                label: 'Liczba kolumn',
                type: 'number',
                required: true,
                default: 3,
                min: 1,
                max: 10,
                description: 'Ilość kolumn w tabeli'
            },
            {
                name: 'rows',
                label: 'Liczba wierszy',
                type: 'number',
                required: true,
                default: 3,
                min: 1,
                max: 20,
                description: 'Ilość wierszy w tabeli'
            },
            {
                name: 'headers',
                label: 'Nagłówki kolumn',
                type: 'text',
                placeholder: 'np. Nazwa|Cena|Rocznik (oddziel |)',
                description: 'Nazwy kolumn oddzielone znakiem |'
            },
            {
                name: 'bordered',
                label: 'Ramki',
                type: 'checkbox',
                default: true,
                description: 'Wyświetl ramki tabeli'
            },
            {
                name: 'striped',
                label: 'Zebra',
                type: 'checkbox',
                default: false,
                description: 'Przemienne kolory wierszy'
            },
            {
                name: 'cssClass',
                label: 'Klasa CSS',
                type: 'text',
                placeholder: 'np. wine-table compact',
                description: 'Opcjonalne klasy CSS'
            }
        ],
        
        generateShortcode: function(config) {
            const { columns, rows, headers, bordered, striped, cssClass } = config;
            const componentId = 'table_' + Date.now();
            
            let shortcode = `[component type="table" id="${componentId}" columns="${columns}" rows="${rows}"`;
            if (headers) shortcode += ` headers="${headers}"`;
            if (bordered) shortcode += ` bordered="true"`;
            if (striped) shortcode += ` striped="true"`;
            if (cssClass) shortcode += ` class="${cssClass}"`;
            shortcode += `]`;
            
            return shortcode;
        }
    },

    // ═══════════════════════════════════════════════════════════
    // ⭐ SVG ICON COMPONENT - Komponent ikony SVG
    // ═══════════════════════════════════════════════════════════
    {
        id: 'svgIcon',
        label: 'SVG Icon',
        icon: 'bi-star',
        description: 'Wstaw ikonę SVG (Bootstrap Icons)',
        
        properties: [
            {
                name: 'icon',
                label: 'Nazwa ikony',
                type: 'text',
                required: true,
                placeholder: 'np. star-fill, heart, wine-glass',
                description: 'Nazwa ikony z Bootstrap Icons (bez "bi-")'
            },
            {
                name: 'size',
                label: 'Rozmiar',
                type: 'text',
                default: '24px',
                placeholder: 'np. 24px, 2rem',
                description: 'Rozmiar ikony'
            },
            {
                name: 'color',
                label: 'Kolor',
                type: 'text',
                placeholder: 'np. #gold, currentColor',
                description: 'Kolor ikony'
            },
            {
                name: 'cssClass',
                label: 'Klasa CSS',
                type: 'text',
                placeholder: 'np. rating-star',
                description: 'Opcjonalne klasy CSS'
            }
        ],
        
        generateShortcode: function(config) {
            const { icon, size, color, cssClass } = config;
            const componentId = 'icon_' + Date.now();
            
            let shortcode = `[component type="svgIcon" id="${componentId}" icon="${icon}"`;
            if (size) shortcode += ` size="${size}"`;
            if (color) shortcode += ` color="${color}"`;
            if (cssClass) shortcode += ` class="${cssClass}"`;
            shortcode += `]`;
            
            return shortcode;
        }
    },

    // ═══════════════════════════════════════════════════════════
    // 🔄 DYNAMIC CONTAINER COMPONENT - Dynamiczny kontener
    // ═══════════════════════════════════════════════════════════
    {
        id: 'dynamicContainer',
        label: 'Dynamic Container',
        icon: 'bi-diagram-3',
        description: 'Wstaw zawartość wybranego szablonu HTML',
        
        properties: [
            {
                name: 'templateId',
                label: 'Wybierz szablon',
                type: 'templateSelect', // Specjalny typ - będzie obsługiwany w ComponentsManager
                required: true,
                description: 'Wybierz szablon HTML do wklejenia'
            },
            {
                name: 'wrapperTag',
                label: 'Tag opakowujący',
                type: 'select',
                required: true,
                default: 'div',
                options: [
                    { value: 'div', label: 'Div (blokowy)' },
                    { value: 'section', label: 'Section (sekcja)' },
                    { value: 'article', label: 'Article (artykuł)' },
                    { value: 'aside', label: 'Aside (panel boczny)' },
                    { value: 'span', label: 'Span (inline)' }
                ],
                description: 'Tag HTML opakowujący zawartość szablonu'
            },
            {
                name: 'cssClass',
                label: 'Klasa CSS',
                type: 'text',
                placeholder: 'np. template-section embedded-content',
                description: 'Opcjonalne klasy CSS dla wrappera'
            },
            {
                name: 'style',
                label: 'Styl inline',
                type: 'text',
                placeholder: 'np. margin: 20px; padding: 10px;',
                description: 'Opcjonalne style CSS inline'
            }
        ],
        
        generateShortcode: function(config) {
            const { templateId, wrapperTag, cssClass, style } = config;
            const componentId = 'dynamic_' + Date.now();
            
            let shortcode = `[component type="dynamicContainer" id="${componentId}" templateId="${templateId}"`;
            if (wrapperTag) shortcode += ` wrapperTag="${wrapperTag}"`;
            if (cssClass) shortcode += ` class="${cssClass}"`;
            if (style) shortcode += ` style="${style}"`;
            shortcode += `]`;
            
            return shortcode;
        }
    }
];

// ═══════════════════════════════════════════════════════════
// 🔧 HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════

/**
 * Pobierz komponent po ID
 */
function getComponentById(componentId) {
    return HTML_COMPONENTS.find(c => c.id === componentId);
}

/**
 * Pobierz wszystkie komponenty
 */
function getAllComponents() {
    return HTML_COMPONENTS;
}

/**
 * Waliduj konfigurację komponentu
 */
function validateComponentConfig(componentId, config) {
    const component = getComponentById(componentId);
    if (!component) {
        return { valid: false, errors: ['Nieznany typ komponentu'] };
    }
    
    const errors = [];
    
    // Sprawdź wymagane pola
    component.properties.forEach(prop => {
        if (prop.required && !config[prop.name]) {
            errors.push(`Pole "${prop.label}" jest wymagane`);
        }
    });
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// Eksportuj do globalnego scope
window.HTML_COMPONENTS = HTML_COMPONENTS;
window.getComponentById = getComponentById;
window.getAllComponents = getAllComponents;
window.validateComponentConfig = validateComponentConfig;

console.log('✅ HTML Components Config loaded:', HTML_COMPONENTS.length, 'components');
