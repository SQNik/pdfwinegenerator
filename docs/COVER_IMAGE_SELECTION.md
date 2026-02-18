# Okładki w Kolekcjach - Dokumentacja

## Przegląd
System umożliwia wybór okładki dla każdej kolekcji podczas jej tworzenia lub edycji. Wybrana okładka może być następnie wykorzystana w szablonach PDF.

## Implementacja Frontend

### Struktura Modala (4 kroki)
Modal tworzenia kolekcji składa się z 4 kroków:

1. **Krok 1: Podstawowe Informacje**
   - Nazwa kolekcji (wymagane)
   - Opis
   - Status (active/archived/draft)

2. **Krok 2: Dodatkowe Pola**
   - Dynamiczne pola kolekcji
   - Grid layout z konfigurowalnymi polami

3. **Krok 3: Okładka** ⭐ NOWE
   - Grid z 7 predefiniowanymi okładkami
   - Opcja "Bez okładki"
   - Interaktywny wybór z wizualną informacją zwrotną

4. **Krok 4: Wybór Win**
   - Kompaktowy grid z kartami win
   - Checkboxy do zaznaczania win
   - Możliwość wyszukiwania i filtrowania

### Dostępne Okładki

Okładki znajdują się w katalogu: `public/images/okladki/`

| Nazwa | Plik | Format |
|-------|------|--------|
| Okładka Premium | `okladka-napol-300dpi.jpg` | JPG 300dpi |
| Okładka Testowa | `okladka-test-300dpi.jpg` | JPG 300dpi |
| Okładka Klasyczna | `okladka-test1.jpg` | JPG |
| Okładka Wilczy | `okladka-wilczy.jpg` | JPG |
| Tło Premium | `tlo-300dpi.jpg` | JPG 300dpi |
| Tło A4 | `tlo-a4ispad.jpg` | JPG |
| **Bez okładki** | - | - |

### UI Komponentu Wyboru Okładki

```html
<!-- public/collections.html linie 434-520 -->
<div class="step-content" data-step="3">
    <div style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 1rem;
        margin-top: 1rem;
    ">
        <!-- 7 opcji okładek + "Bez okładki" -->
        <div class="cover-option" data-cover="images/okladki/okladka-napol-300dpi.jpg">
            <!-- Obrazek, tytuł, badge zaznaczenia -->
        </div>
        <!-- ... inne opcje ... -->
    </div>
    
    <!-- Ukryte pole przechowujące wybraną ścieżkę -->
    <input type="hidden" id="selectedCoverImage" value="">
</div>
```

### CSS dla Okładek

```css
.cover-option {
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    aspect-ratio: 1 / 1.4; /* Format A4 */
}

.cover-option:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    border-color: var(--primary);
}

.cover-option.selected {
    border-color: var(--success);
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.cover-option.selected .selected-badge {
    display: flex; /* Pokaż checkmark */
}
```

### JavaScript - Logika Wyboru

**Plik:** `public/js/components/collections-init.js`

```javascript
// Linie 3: Liczba kroków
const totalSteps = 4;

// Linie 96-116: Reset wyboru przy otwarciu modala
function resetCoverSelection() {
    const coverOptions = document.querySelectorAll('.cover-option');
    coverOptions.forEach(option => {
        option.classList.remove('selected');
    });
    const hiddenInput = document.getElementById('selectedCoverImage');
    if (hiddenInput) {
        hiddenInput.value = '';
    }
}

// Linie 118-133: Obsługa kliknięcia w okładkę
coverOptions.forEach(option => {
    option.addEventListener('click', function() {
        // Usuń zaznaczenie ze wszystkich
        coverOptions.forEach(opt => opt.classList.remove('selected'));
        
        // Zaznacz klikniętą
        this.classList.add('selected');
        
        // Zapisz ścieżkę do ukrytego inputa
        const coverPath = this.getAttribute('data-cover');
        const hiddenInput = document.getElementById('selectedCoverImage');
        if (hiddenInput) {
            hiddenInput.value = coverPath;
            console.log('✅ Selected cover:', coverPath);
        }
    });
});
```

### JavaScript - Zbieranie Danych Formularza

**Plik:** `public/js/components/collections.js`

```javascript
// Linia 1968: Pobranie wartości z ukrytego inputa
const coverImageInput = document.getElementById('selectedCoverImage');

// Linia 2021: Dodanie do obiektu wysyłanego do API
return {
    name: collectionName,
    description: collectionDescription,
    status: collectionStatus,
    tags: [],
    wines: selectedWineIds,
    dynamicFields: dynamicFieldsData,
    coverImage: coverImageInput?.value?.trim() || '', // ⭐ NOWE POLE
};
```

## Implementacja Backend

### Model Danych TypeScript

**Plik:** `src/types/index.ts`

```typescript
// Linie 99-115: Interface Collection
export interface Collection {
    id: string;
    name: string;
    description?: string;
    wines: string[];
    tags?: string[];
    status?: 'active' | 'archived' | 'draft';
    dynamicFields?: Record<string, any>;
    metadata?: {
        createdBy?: string;
        lastModifiedBy?: string;
    };
    coverImage?: string; // ⭐ NOWE POLE - linia 106
    createdAt?: Date;
    updatedAt?: Date;
    lastGeneratedPdf?: {
        url: string;
        generatedAt: Date;
    };
}
```

### Przepływ Danych

```
┌─────────────────────────────────────────────────────────────┐
│                    PRZEPŁYW DANYCH                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Użytkownik wybiera okładkę w modale                    │
│     ↓                                                       │
│  2. Click handler zapisuje ścieżkę do #selectedCoverImage  │
│     ↓                                                       │
│  3. getCollectionFormData() odczytuje wartość inputa       │
│     ↓                                                       │
│  4. API endpoint /collections (POST/PUT) otrzymuje:        │
│     {                                                       │
│       name: "Nazwa kolekcji",                              │
│       wines: ["630103", "111102", ...],                    │
│       coverImage: "images/okladki/okladka-napol-300dpi.jpg"│
│     }                                                       │
│     ↓                                                       │
│  5. Backend zapisuje coverImage w Collection model         │
│     ↓                                                       │
│  6. Dane dostępne w szablonach jako placeholder            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Użycie w Szablonach PDF

### System Placeholderów

**Plik:** `src/services/pdfService.ts` (linia 2234)

```typescript
// Regex dla podstawowych pól kolekcji
const collectionFieldPattern = /\{\{collection\.(\w+)\}\}/g;

// Przykład: {{collection.coverImage}} → "images/okladki/okladka-napol-300dpi.jpg"
```

### Przykłady Użycia w HTML

#### 1. Prosta okładka

```html
<div class="cover-page">
    <img src="{{collection.coverImage}}" 
         alt="Okładka kolekcji" 
         style="width: 100%; height: auto;">
</div>
```

#### 2. Okładka jako tło

```html
<div style="
    background-image: url('{{collection.coverImage}}');
    background-size: cover;
    background-position: center;
    width: 100%;
    height: 297mm; /* Wysokość A4 */
">
    <h1 style="padding-top: 50mm; text-align: center; color: white;">
        {{collection.name}}
    </h1>
</div>
```

#### 3. Warunkowe wyświetlanie

```html
<!-- Jeśli używasz Handlebars/Mustache -->
{{#if collection.coverImage}}
<div class="cover-page">
    <img src="{{collection.coverImage}}" alt="Cover">
</div>
{{else}}
<div class="default-cover">
    <h1>{{collection.name}}</h1>
    <p>{{collection.description}}</p>
</div>
{{/if}}
```

#### 4. Okładka na pełną stronę

```html
<div style="page-break-after: always; height: 297mm; width: 210mm; position: relative;">
    {{#if collection.coverImage}}
    <img src="{{collection.coverImage}}" 
         style="
            width: 100%; 
            height: 100%; 
            object-fit: cover;
            position: absolute;
            top: 0;
            left: 0;
         ">
    {{/if}}
    
    <!-- Tekst na okładce -->
    <div style="position: relative; z-index: 1; padding: 50mm 20mm;">
        <h1 style="color: white; font-size: 48pt;">{{collection.name}}</h1>
    </div>
</div>
```

#### 5. Miniatura okładki w nagłówku

```html
<div class="header" style="display: flex; align-items: center; gap: 20px;">
    {{#if collection.coverImage}}
    <img src="{{collection.coverImage}}" 
         style="width: 60px; height: 84px; object-fit: cover; border-radius: 4px;">
    {{/if}}
    <div>
        <h1>{{collection.name}}</h1>
        <p>{{collection.description}}</p>
    </div>
</div>
```

## Testowanie

### Checklist Przed Wdrożeniem

- [x] TypeScript skompilowany (`npx tsc`)
- [ ] Modal pokazuje 4 kroki
- [ ] Krok 3 wyświetla 7 okładek + "Bez okładki"
- [ ] Kliknięcie dodaje klasę `.selected` i checkmark
- [ ] Ukryty input `#selectedCoverImage` zapisuje ścieżkę
- [ ] API otrzymuje pole `coverImage` w payload
- [ ] Kolekcja zapisana z `coverImage` w bazie
- [ ] Szablon PDF używa `{{collection.coverImage}}`
- [ ] Wygenerowany PDF zawiera okładkę
- [ ] Okładka wyświetla się poprawnie (jakość, rozmiar)

### Przykładowy Payload API

```json
POST /collections

{
  "name": "Wina Premium 2024",
  "description": "Kolekcja najlepszych win",
  "status": "active",
  "wines": ["630103", "111102", "630142"],
  "dynamicFields": {
    "field_1761666965990_sifizd511": "Tytuł dla firmy XYZ"
  },
  "coverImage": "images/okladki/okladka-napol-300dpi.jpg"
}
```

### Przykładowa Odpowiedź

```json
{
  "id": "collection_1763726135763_ce9zywto2",
  "name": "Wina Premium 2024",
  "description": "Kolekcja najlepszych win",
  "status": "active",
  "wines": ["630103", "111102", "630142"],
  "dynamicFields": {
    "field_1761666965990_sifizd511": "Tytuł dla firmy XYZ"
  },
  "coverImage": "images/okladki/okladka-napol-300dpi.jpg",
  "createdAt": "2025-11-21T11:55:35.763Z",
  "updatedAt": "2025-11-21T11:55:35.763Z"
}
```

## Rozszerzenia (Opcjonalne)

### 1. Upload Własnych Okładek

```javascript
// Dodać input file w modale
<input type="file" accept="image/*" id="customCoverUpload">

// Handler uploadu
async function uploadCustomCover(file) {
    const formData = new FormData();
    formData.append('cover', file);
    
    const response = await fetch('/api/covers/upload', {
        method: 'POST',
        body: formData
    });
    
    const { coverPath } = await response.json();
    document.getElementById('selectedCoverImage').value = coverPath;
}
```

### 2. Podgląd Okładki w Liście Kolekcji

```javascript
// W renderowaniu kart kolekcji
function renderCollectionCard(collection) {
    return `
        <div class="ds-card">
            ${collection.coverImage ? 
                `<img src="${collection.coverImage}" 
                      style="width: 100%; height: 150px; object-fit: cover;">` 
                : ''}
            <div class="ds-card-body">
                <h3>${collection.name}</h3>
                <!-- ... -->
            </div>
        </div>
    `;
}
```

### 3. Edycja Okładki w Trybie Crop

```html
<!-- Integracja z biblioteką Cropper.js -->
<script src="https://unpkg.com/cropperjs/dist/cropper.min.js"></script>

<div id="cropperModal">
    <img id="cropperImage" src="">
    <button onclick="saveCroppedCover()">Zapisz</button>
</div>
```

## Wdrożenie na Produkcję

### 1. Kompilacja TypeScript

```powershell
npx tsc
```

### 2. Utworzenie Paczki Produkcyjnej

```powershell
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
Compress-Archive -Path dist,public,data,src,scripts,package.json,tsconfig.json `
    -DestinationPath "pdfwinegenerator_production_$timestamp.zip"
```

### 3. Wgranie na Serwer

1. Upload przez FTP/SFTP do: `/home/srv52568/domains/ratunek.it/`
2. Rozpakowanie archiwum
3. Restart aplikacji w panelu CloudLinux (Nginx Unit)

### 4. Weryfikacja

```bash
# Sprawdź czy coverImage jest zapisywane
curl https://ratunek.it/collections/collection_XXX

# Wygeneruj PDF testowy
curl -X POST https://ratunek.it/templates/XXX/generate-collection \
  -H "Content-Type: application/json" \
  -d '{"collectionId":"collection_XXX"}'
```

## Troubleshooting

### Problem: Okładka nie wyświetla się w PDF

**Możliwe przyczyny:**
1. Ścieżka jest bezwzględna (np. `/images/...`) zamiast względnej
2. Plik okładki nie istnieje na serwerze
3. Szablon nie używa `{{collection.coverImage}}`

**Rozwiązanie:**
```javascript
// Sprawdź w konsoli przeglądarki
console.log('Selected cover:', document.getElementById('selectedCoverImage').value);

// Upewnij się że ścieżka jest względna
// ✅ DOBRZE: "images/okladki/okladka-napol-300dpi.jpg"
// ❌ ŹLE: "/images/okladki/okladka-napol-300dpi.jpg"
```

### Problem: Kliknięcie w okładkę nie działa

**Możliwe przyczyny:**
1. JavaScript nie załadował się poprawnie
2. Event listener nie został przypisany
3. Element ma `pointer-events: none`

**Rozwiązanie:**
```javascript
// Sprawdź w konsoli
const coverOptions = document.querySelectorAll('.cover-option');
console.log('Found cover options:', coverOptions.length); // Powinno być 8

// Ręcznie przetestuj
coverOptions[0].click();
console.log('Hidden input value:', document.getElementById('selectedCoverImage').value);
```

### Problem: Pole coverImage nie trafia do API

**Możliwe przyczyny:**
1. `getCollectionFormData()` nie zawiera coverImage
2. TypeScript nie został przekompilowany
3. Błąd walidacji po stronie backendu

**Rozwiązanie:**
```javascript
// Dodaj debug w getCollectionFormData()
const formData = {
    name: collectionName,
    // ...
    coverImage: coverImageInput?.value?.trim() || '',
};
console.log('📤 Sending to API:', formData);
```

## Powiązane Pliki

| Plik | Linie | Opis |
|------|-------|------|
| `public/collections.html` | 370-385 | Wskaźniki kroków |
| `public/collections.html` | 434-520 | UI wyboru okładki (krok 3) |
| `public/js/components/collections-init.js` | 3 | `totalSteps = 4` |
| `public/js/components/collections-init.js` | 96-116 | Reset wyboru okładki |
| `public/js/components/collections-init.js` | 118-133 | Handler kliknięcia |
| `public/js/components/collections.js` | 1968 | Pobranie coverImageInput |
| `public/js/components/collections.js` | 2021 | Dodanie do return object |
| `src/types/index.ts` | 106 | `coverImage?: string;` |
| `src/services/pdfService.ts` | 2234 | Regex placeholderów |

## Historia Zmian

**2025-11-21** - Wersja 1.0
- ✅ Dodano pole `coverImage` do Collection interface
- ✅ Utworzono UI wyboru okładki (krok 3)
- ✅ Zaimplementowano logikę wyboru i zapisywania
- ✅ Zintegrowano z API (create/update collection)
- ✅ Udokumentowano użycie w szablonach PDF
- ⏳ Do przetestowania: PDF generation z okładką

---

**Autor:** GitHub Copilot  
**Data:** 21 listopada 2025  
**Wersja:** 1.0  
