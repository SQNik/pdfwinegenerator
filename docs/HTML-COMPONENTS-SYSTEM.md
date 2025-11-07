# 🎨 System Komponentów HTML dla Template Editor

## 📋 Przegląd

Rozszerzalny system komponentów HTML umożliwiający wstawianie gotowych elementów do szablonów PDF. Komponenty są definiowane jako **shortcodes**, które mogą być później przetwarzane podczas generowania PDF.

---

## 🏗️ Architektura

### Pliki systemu:

```
public/
├── template-editor.html                 # Główny plik HTML z toolbarem
├── js/
│   ├── config/
│   │   └── html-components.js          # ⭐ KONFIGURACJA KOMPONENTÓW
│   └── components/
│       └── ComponentsManager.js        # ⭐ MENEDŻER KOMPONENTÓW
```

### Jak to działa:

1. **html-components.js**: Definicje wszystkich komponentów (text, image, container, table, SVG icon)
2. **ComponentsManager.js**: Zarządza UI, modalami i wstawianiem shortcode do CodeMirror
3. **template-editor.html**: Toolbar i modal do konfiguracji komponentów

---

## 🎯 Dostępne Komponenty

### 1. 📝 Text (Tekst)
Wstaw blok tekstowy z możliwością formatowania.

**Właściwości:**
- `content` (textarea, wymagane) - Treść tekstu
- `tag` (select) - Znacznik HTML (p, h1-h4, span, div)
- `cssClass` (text) - Klasy CSS
- `style` (text) - Style inline

**Przykład shortcode:**
```html
[component type="text" id="text_1234567890" tag="h2" class="wine-title" style="color: #333;"]
Cabernet Sauvignon 2018
[/component]
```

---

### 2. 🖼️ Image (Obrazek)
Wstaw obrazek z konfiguracją wymiarów.

**Właściwości:**
- `src` (text, wymagane) - URL lub placeholder (np. `{{wine.images[0]}}`)
- `alt` (text) - Tekst alternatywny
- `width` (text) - Szerokość (px, %, auto)
- `height` (text) - Wysokość (px, auto)
- `objectFit` (select) - Dopasowanie (cover, contain, fill, none)
- `cssClass` (text) - Klasy CSS

**Przykład shortcode:**
```html
[component type="image" id="img_1234567890" src="{{wine.images[0]}}" alt="Wine bottle" width="200px" height="300px" objectFit="cover" class="wine-image"]
```

---

### 3. 📦 Container (Kontener)
Wstaw kontener HTML z możliwością layoutu.

**Właściwości:**
- `layout` (select, wymagane) - Układ (div, flex, grid, section, article)
- `width` (text) - Szerokość
- `padding` (text) - Wewnętrzne odstępy
- `background` (text) - Kolor tła
- `border` (text) - Ramka CSS
- `cssClass` (text) - Klasy CSS

**Przykład shortcode:**
```html
[component type="container" id="container_1234567890" layout="flex" width="100%" padding="20px" background="#f5f5f5" border="1px solid #ddd" class="wine-card"]
  <!-- Treść kontenera -->
[/component]
```

---

### 4. 📊 Table (Tabela)
Wstaw tabelę z konfigurowalnymi kolumnami.

**Właściwości:**
- `columns` (number, wymagane) - Liczba kolumn (1-10)
- `rows` (number, wymagane) - Liczba wierszy (1-20)
- `headers` (text) - Nagłówki kolumn oddzielone `|` (np. "Nazwa|Cena|Rocznik")
- `bordered` (checkbox) - Wyświetl ramki
- `striped` (checkbox) - Przemienne kolory wierszy
- `cssClass` (text) - Klasy CSS

**Przykład shortcode:**
```html
[component type="table" id="table_1234567890" columns="3" rows="5" headers="Nazwa|Cena|Rocznik" bordered="true" striped="true" class="wine-table"]
```

---

### 5. ⭐ SVG Icon (Ikona SVG)
Wstaw ikonę SVG (Bootstrap Icons).

**Właściwości:**
- `icon` (text, wymagane) - Nazwa ikony (bez "bi-", np. "star-fill", "heart", "wine-glass")
- `size` (text) - Rozmiar (px, rem)
- `color` (text) - Kolor ikony
- `cssClass` (text) - Klasy CSS

**Przykład shortcode:**
```html
[component type="svgIcon" id="icon_1234567890" icon="star-fill" size="24px" color="gold" class="rating-star"]
```

---

## 🚀 Jak używać systemu

### 1. Otwórz Template Editor
```
http://localhost:3001/template-editor.html
```

### 2. Wybierz szablon do edycji
Kliknij szablon z listy po lewej stronie.

### 3. Toolbar komponentów
Pod głównym toolbarem (Undo/Redo/Format) znajduje się **fioletowy pasek z komponentami HTML**.

### 4. Kliknij komponent
Wybierz komponent (np. "Tekst", "Obrazek").

### 5. Skonfiguruj komponent
Wypełnij formularz w modalnym oknie:
- Pola wymagane oznaczone `*`
- Podgląd shortcode aktualizuje się na żywo

### 6. Wstaw do edytora
Kliknij **"Wstaw do edytora"** - shortcode zostanie wstawiony w miejscu kursora w edytorze HTML.

### 7. Zapisz szablon
Kliknij **"Zapisz szablon"** w prawym górnym rogu.

---

## 🔧 Jak dodać nowy komponent

### Krok 1: Otwórz `html-components.js`

```javascript
// public/js/config/html-components.js
```

### Krok 2: Skopiuj istniejący komponent jako szablon

```javascript
{
    id: 'mojKomponent',                    // Unikalny ID
    label: 'Mój Komponent',                 // Nazwa w UI
    icon: 'bi-puzzle',                      // Ikona Bootstrap Icons
    description: 'Opis komponentu',         // Opis
    
    properties: [
        {
            name: 'mojePolje',              // Nazwa właściwości
            label: 'Moje Pole',             // Label w formularzu
            type: 'text',                   // Typ: text, textarea, select, number, checkbox
            required: true,                 // Czy wymagane
            placeholder: 'Placeholder...',  // Placeholder
            description: 'Opis pola'        // Opis pod polem
        }
        // ... więcej pól
    ],
    
    generateShortcode: function(config) {
        const { mojePolje } = config;
        const componentId = 'moj_' + Date.now();
        
        let shortcode = `[component type="mojKomponent" id="${componentId}"`;
        if (mojePolje) shortcode += ` mojePolje="${mojePolje}"`;
        shortcode += `]`;
        
        return shortcode;
    }
}
```

### Krok 3: Dodaj do `HTML_COMPONENTS` array

```javascript
const HTML_COMPONENTS = [
    // ... istniejące komponenty
    
    // ═══════════════════════════════════════════════════════════
    // 🎨 MÓJ NOWY KOMPONENT
    // ═══════════════════════════════════════════════════════════
    {
        id: 'mojKomponent',
        label: 'Mój Komponent',
        // ... reszta konfiguracji
    }
];
```

### Krok 4: Gotowe! 🎉

Komponent automatycznie pojawi się w toolbarze. Nie trzeba modyfikować nic więcej!

---

## 📦 Typy pól w properties

### `text` - Pole tekstowe
```javascript
{
    name: 'title',
    label: 'Tytuł',
    type: 'text',
    required: true,
    placeholder: 'Wprowadź tytuł...'
}
```

### `textarea` - Pole tekstowe wieloliniowe
```javascript
{
    name: 'content',
    label: 'Treść',
    type: 'textarea',
    rows: 4,
    placeholder: 'Wprowadź treść...'
}
```

### `select` - Lista rozwijana
```javascript
{
    name: 'size',
    label: 'Rozmiar',
    type: 'select',
    default: 'medium',
    options: [
        { value: 'small', label: 'Mały' },
        { value: 'medium', label: 'Średni' },
        { value: 'large', label: 'Duży' }
    ]
}
```

### `number` - Pole numeryczne
```javascript
{
    name: 'count',
    label: 'Liczba',
    type: 'number',
    min: 1,
    max: 10,
    default: 3
}
```

### `checkbox` - Pole checkboxa
```javascript
{
    name: 'enabled',
    label: 'Włącz',
    type: 'checkbox',
    default: true,
    description: 'Włącz tę opcję'
}
```

---

## 🎨 Struktura Shortcode

### Format podstawowy:
```html
[component type="TYP" id="UNIKALNY_ID" PARAMETRY]
```

### Z zawartością (closing tag):
```html
[component type="TYP" id="UNIKALNY_ID" PARAMETRY]
    Treść komponentu
[/component]
```

### Przykłady:

**Self-closing (obrazek):**
```html
[component type="image" id="img_1234" src="wine.jpg" width="200px"]
```

**Z zawartością (tekst):**
```html
[component type="text" id="text_1234" tag="h2" class="title"]
Cabernet Sauvignon 2018
[/component]
```

**Z zagnieżdżeniem (container):**
```html
[component type="container" id="container_1234" layout="flex" class="wine-card"]
    [component type="image" id="img_1235" src="wine.jpg"]
    [component type="text" id="text_1235" tag="h3"]Nazwa wina[/component]
[/component]
```

---

## 🔌 Przetwarzanie Shortcode (Backend)

Shortcode musi być przetworzony podczas generowania PDF. Przykładowa implementacja:

### Opcja 1: Regex parser (prosty)
```javascript
function parseShortcodes(html) {
    // Parsuj self-closing shortcodes
    html = html.replace(/\[component ([^\]]+)\]/g, (match, attrs) => {
        const config = parseAttributes(attrs);
        return renderComponent(config);
    });
    
    // Parsuj shortcodes z zawartością
    html = html.replace(/\[component ([^\]]+)\](.*?)\[\/component\]/gs, (match, attrs, content) => {
        const config = parseAttributes(attrs);
        return renderComponent(config, content);
    });
    
    return html;
}

function parseAttributes(attrString) {
    const attrs = {};
    const regex = /(\w+)="([^"]*)"/g;
    let match;
    
    while ((match = regex.exec(attrString)) !== null) {
        attrs[match[1]] = match[2];
    }
    
    return attrs;
}

function renderComponent(config, content = '') {
    switch (config.type) {
        case 'text':
            const tag = config.tag || 'p';
            const cssClass = config.class ? ` class="${config.class}"` : '';
            const style = config.style ? ` style="${config.style}"` : '';
            return `<${tag}${cssClass}${style}>${content}</${tag}>`;
            
        case 'image':
            const width = config.width ? ` width="${config.width}"` : '';
            const height = config.height ? ` height="${config.height}"` : '';
            const alt = config.alt || '';
            const imgClass = config.class ? ` class="${config.class}"` : '';
            return `<img src="${config.src}" alt="${alt}"${width}${height}${imgClass}>`;
            
        // ... reszta komponentów
        
        default:
            return `<!-- Unknown component: ${config.type} -->`;
    }
}
```

### Opcja 2: Parser biblioteki (zaawansowany)
Użyj biblioteki jak `shortcode-parser` lub `posthtml-shortcodes`.

---

## 🎯 Best Practices

### 1. Unikalność ID
Każdy komponent ma unikalny ID wygenerowany przez `Date.now()`:
```javascript
const componentId = 'text_' + Date.now();
```

### 2. Walidacja pól
System automatycznie waliduje wymagane pola przed wstawieniem.

### 3. Bezpieczeństwo
⚠️ **UWAGA**: Shortcode zawiera dane użytkownika - pamiętaj o sanityzacji podczas renderowania!

### 4. Placeholdery danych
Użytkownicy mogą używać placeholderów w shortcode:
```html
[component type="text" id="text_1" tag="h2"]
{{wine.name}} {{wine.vintage}}
[/component]
```

### 5. CSS Classes
Dodawaj klasy CSS dla łatwego stylowania:
```html
[component type="container" id="container_1" class="wine-card shadow-lg"]
```

---

## 🐛 Troubleshooting

### Problem: Komponenty się nie pokazują
**Rozwiązanie:** Sprawdź konsolę przeglądarki (F12) - upewnij się że `html-components.js` został załadowany.

### Problem: Modal się nie otwiera
**Rozwiązanie:** Sprawdź czy Bootstrap 5 jest załadowany poprawnie.

### Problem: Shortcode nie wstawia się do edytora
**Rozwiązanie:** Upewnij się że `window.templateEditor` istnieje i ma `htmlEditor` (CodeMirror).

### Problem: Preview shortcode nie pokazuje się
**Rozwiązanie:** Wypełnij wszystkie wymagane pola (oznaczone `*`).

---

## 📚 Dodatkowe zasoby

- **Bootstrap Icons**: https://icons.getbootstrap.com/
- **CodeMirror API**: https://codemirror.net/doc/manual.html
- **Bootstrap 5 Modals**: https://getbootstrap.com/docs/5.3/components/modal/

---

## 🎉 Gotowe!

System jest w pełni funkcjonalny i rozszerzalny. Możesz:
- ✅ Dodawać nowe komponenty bez modyfikacji ComponentsManager
- ✅ Wstawiać shortcode w miejscu kursora
- ✅ Live preview shortcode w modalach
- ✅ Łatwa walidacja i error handling

**Miłego tworzenia szablonów! 🍷**
