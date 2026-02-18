# Edytowalne Pola w PDF - Dokumentacja

## Przegląd

System umożliwia tworzenie PDF z **edytowalnymi polami formularza**, które można wypełnić bezpośrednio w Adobe Acrobat Reader lub innych przeglądarkach PDF.

Najczęstsze zastosowanie: **edytowalne pola cen**, które można dostosować dla różnych klientów bez regenerowania całego PDF.

## Jak To Działa

### 1. Backend (pdf-lib)

System używa biblioteki `pdf-lib` do dodawania interaktywnych pól formularza (AcroForms) do wygenerowanego PDF.

**Przepływ:**
1. Puppeteer generuje statyczny PDF z HTML
2. System wykrywa specjalne atrybuty `data-editable-*` w HTML
3. `pdf-lib` dodaje pola tekstowe w określonych pozycjach
4. Zapisuje PDF z edytowalnymi polami

### 2. Frontend (HTML Template)

Szablon HTML zawiera specjalne atrybuty data-* określające pozycje pól:

```html
<!-- Pole ceny z edytowalnością -->
<div class="price-field" 
     data-editable-price="wine_price_630103"
     data-price-x="100"
     data-price-y="200"
     data-price-width="80"
     data-price-height="20">
    <span class="price-placeholder">_____ zł</span>
</div>
```

## Implementacja w Szablonie

### Metoda 1: Ręczne Pozycjonowanie (Precyzyjne)

```html
<!DOCTYPE html>
<html>
<head>
    <meta name="editable-fields" content="enabled">
    <style>
        .wine-card {
            position: relative;
            width: 200mm;
            height: 80mm;
            page-break-inside: avoid;
        }
        .price-field {
            position: absolute;
            right: 10mm;
            bottom: 10mm;
            width: 30mm;
            height: 8mm;
            border: 1px dashed #ccc;
            background: #fffef0;
        }
    </style>
</head>
<body>
    {{#each wines}}
    <div class="wine-card">
        <h3>{{this.name}}</h3>
        <p>Kod: {{this.catalogNumber}}</p>
        
        <!-- EDYTOWALNE POLE CENY -->
        <div class="price-field" 
             data-editable-price="wine_price_{{this.catalogNumber}}"
             data-price-x="150"
             data-price-y="{{@index * 85 + 60}}"
             data-price-width="85"
             data-price-height="25">
            <span style="color: #999;">Cena: ___________</span>
        </div>
    </div>
    {{/each}}
</body>
</html>
```

### Metoda 2: Automatyczne Pozycjonowanie (Prostsze)

Użyj CSS do pozycjonowania, a system automatycznie wykryje pola:

```html
<style>
    .editable-price {
        display: inline-block;
        min-width: 80px;
        height: 20px;
        border-bottom: 1px solid #000;
        background: rgba(255, 255, 200, 0.3);
    }
</style>

{{#each wines}}
<div class="wine-info">
    <span>{{this.name}}</span>
    <span class="editable-price" 
          data-editable-price="price_{{this.catalogNumber}}">
        <!-- Puste pole do wypełnienia -->
    </span>
</div>
{{/each}}
```

### Metoda 3: Zastąpienie Istniejącej Ceny

```html
{{#each wines}}
<div class="wine-row">
    <span class="wine-name">{{this.name}}</span>
    
    <!-- Jeśli chcesz edytowalną cenę -->
    <div class="price-container"
         data-editable-price="wine_{{this.catalogNumber}}_price1"
         data-price-x="180"
         data-price-y="{{@index * 25 + 100}}"
         data-price-width="60"
         data-price-height="18">
        <span class="price-label">Cena:</span>
        <span class="price-value">{{this.price1}}</span>
    </div>
</div>
{{/each}}
```

## Atrybuty Data-*

| Atrybut | Wymagany | Opis | Przykład |
|---------|----------|------|----------|
| `data-editable-price` | ✅ Tak | Unikalna nazwa pola (ID) | `"wine_price_630103"` |
| `data-price-x` | ✅ Tak | Pozycja X (piksele od lewej) | `"100"` |
| `data-price-y` | ✅ Tak | Pozycja Y (piksele od góry) | `"200"` |
| `data-price-width` | ✅ Tak | Szerokość pola (piksele) | `"80"` |
| `data-price-height` | ✅ Tak | Wysokość pola (piksele) | `"25"` |
| `data-price-default` | ❌ Nie | Domyślna wartość | `"29.99 zł"` |

## Wyznaczanie Pozycji

### Narzędzie Helper w Konsoli

Dodaj do szablonu skrypt do pomocy w wyznaczaniu pozycji:

```html
<script>
// Helper do wyznaczania pozycji pól
document.addEventListener('DOMContentLoaded', function() {
    const priceFields = document.querySelectorAll('[data-editable-price]');
    
    priceFields.forEach((field, index) => {
        const rect = field.getBoundingClientRect();
        console.log(`Pole ${index + 1}:`, {
            name: field.getAttribute('data-editable-price'),
            x: Math.round(rect.left),
            y: Math.round(rect.top),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
        });
        
        // Dodaj atrybuty automatycznie
        field.setAttribute('data-price-x', Math.round(rect.left));
        field.setAttribute('data-price-y', Math.round(rect.top));
        field.setAttribute('data-price-width', Math.round(rect.width));
        field.setAttribute('data-price-height', Math.round(rect.height));
    });
});
</script>
```

### Dynamiczne Pozycje dla List Win

```html
{{#each wines}}
<div class="wine-item" style="position: relative; height: 50mm; page-break-inside: avoid;">
    <h4>{{this.name}}</h4>
    
    <!-- Pozycja Y obliczana dynamicznie: index * wysokość_karty + offset -->
    <div data-editable-price="wine_{{this.catalogNumber}}_price"
         data-price-x="170"
         data-price-y="{{math @index '*' 189 '+' 140}}"
         data-price-width="70"
         data-price-height="20">
        <span>Cena: _______</span>
    </div>
</div>
{{/each}}
```

## Przykłady Rzeczywiste

### Przykład 1: Karta Win (A4 składane)

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="editable-fields" content="enabled">
    <style>
        @page {
            size: 105mm 301mm;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 10mm;
            font-family: Arial, sans-serif;
        }
        .wine-entry {
            position: relative;
            height: 70mm;
            border-bottom: 1px solid #ddd;
            padding: 5mm 0;
        }
        .wine-name {
            font-size: 12pt;
            font-weight: bold;
        }
        .wine-details {
            font-size: 9pt;
            color: #666;
            margin-top: 2mm;
        }
        .price-box {
            position: absolute;
            right: 5mm;
            bottom: 5mm;
            width: 30mm;
            height: 8mm;
            background: #fffef0;
            border: 1px solid #999;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    </style>
</head>
<body>
    {{#each firstPageWines}}
    <div class="wine-entry">
        <div class="wine-name">{{this.name}}</div>
        <div class="wine-details">
            {{this.region}} • {{this.category}} • {{this.alcohol}}
        </div>
        
        <!-- EDYTOWALNE POLE CENY -->
        <div class="price-box"
             data-editable-price="wine_{{this.catalogNumber}}"
             data-price-x="55"
             data-price-y="{{math @index '*' 265 '+' 225}}"
             data-price-width="85"
             data-price-height="23">
            <span style="font-size: 10pt; color: #999;">_____ zł</span>
        </div>
    </div>
    {{/each}}
</body>
</html>
```

### Przykład 2: Lista Cen Tabelaryczna

```html
<table style="width: 100%; border-collapse: collapse;">
    <thead>
        <tr>
            <th>Nazwa</th>
            <th>Kod</th>
            <th>Cena</th>
        </tr>
    </thead>
    <tbody>
        {{#each wines}}
        <tr style="height: 25px;">
            <td>{{this.name}}</td>
            <td>{{this.catalogNumber}}</td>
            <td>
                <div data-editable-price="wine_{{this.catalogNumber}}_price"
                     data-price-x="450"
                     data-price-y="{{math @index '*' 25 '+' 150}}"
                     data-price-width="80"
                     data-price-height="20"
                     style="border: 1px dashed #ccc; padding: 2px;">
                    _______
                </div>
            </td>
        </tr>
        {{/each}}
    </tbody>
</table>
```

## Użycie w API

### Generowanie PDF z Edytowalnymi Polami

```javascript
// Frontend: collections.js
async function generatePDFWithEditableFields(collectionId, templateId) {
    const response = await api.post(`/templates/${templateId}/generate-collection`, {
        collectionId: collectionId,
        editableFields: true,  // ⭐ WŁĄCZ EDYTOWALNE POLA
        flatten: false          // NIE spłaszczaj PDF
    });
    
    return response.pdfUrl;
}
```

### Backend: Controller

```typescript
// Dodaj opcję editableFields do requestu
const options = {
    format: req.body.format || 'A4',
    flatten: req.body.flatten || false,
    editableFields: req.body.editableFields || false  // ⭐ NOWA OPCJA
};

const pdfBuffer = await this.pdfService.generateCollectionPDF(
    collection,
    template,
    options
);
```

## Testowanie

### 1. Sprawdź w Przeglądarce Przed Generowaniem

Otwórz szablon w przeglądarce i użyj konsoli:

```javascript
// Sprawdź pozycje wszystkich pól
document.querySelectorAll('[data-editable-price]').forEach(el => {
    const rect = el.getBoundingClientRect();
    console.log(el.dataset.editablePrice, {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
    });
});
```

### 2. Wygeneruj PDF

1. Utwórz kolekcję z winami
2. Wybierz szablon z atrybutami `data-editable-price`
3. Wygeneruj PDF
4. Pobierz i otwórz w Adobe Acrobat Reader

### 3. Wypełnij Pola

W Adobe Acrobat Reader:
1. Kliknij w pole (powinno być podświetlone na niebiesko/żółto)
2. Wpisz cenę
3. Zapisz PDF (zachowa wartości)

## Rozwiązywanie Problemów

### Problem 1: Pola Nie Są Edytowalne

**Przyczyny:**
- Szablon nie zawiera atrybutów `data-editable-price`
- Opcja `editableFields: true` nie została przekazana
- PDF został spłaszczony (`flatten: true`)

**Rozwiązanie:**
```javascript
// Upewnij się że:
const options = {
    editableFields: true,  // ✅ WŁĄCZONE
    flatten: false         // ✅ NIE SPŁASZCZAJ
};
```

### Problem 2: Pola w Złych Pozycjach

**Przyczyny:**
- Nieprawidłowe współrzędne X/Y
- Różnica między układem CSS a PDF (PDF liczy od dołu!)
- Brak page-break-inside: avoid

**Rozwiązanie:**
1. Użyj skryptu pomocniczego do logowania pozycji
2. Przetestuj w przeglądarce przed generowaniem
3. Dostosuj wartości data-price-y

### Problem 3: Pola Nakładają Się

**Przyczyny:**
- Za mała wysokość elementów wine-entry
- Brak uwzględnienia marginesów

**Rozwiązanie:**
```css
.wine-entry {
    height: 70mm;  /* Zwiększ wysokość */
    page-break-inside: avoid;  /* Zapobiega podziałom */
}
```

## Zaawansowane: Różne Typy Pól

### Checkbox (Do/Nie Do)

```html
<div data-editable-checkbox="wine_{{this.catalogNumber}}_available"
     data-checkbox-x="20"
     data-checkbox-y="100"
     data-checkbox-size="15">
    □ Dostępne
</div>
```

### Textarea (Notatki)

```html
<div data-editable-textarea="wine_{{this.catalogNumber}}_notes"
     data-textarea-x="50"
     data-textarea-y="300"
     data-textarea-width="200"
     data-textarea-height="80">
    <!-- Notatki -->
</div>
```

### Dropdown (Wybór)

```html
<div data-editable-dropdown="wine_{{this.catalogNumber}}_priceList"
     data-dropdown-options="Lista A|Lista B|Lista C"
     data-dropdown-x="150"
     data-dropdown-y="200"
     data-dropdown-width="100"
     data-dropdown-height="20">
</div>
```

## Limitacje

### Puppeteer vs pdf-lib

- **Puppeteer** generuje statyczny obraz HTML → PDF
- **pdf-lib** dodaje interaktywne warstwy PO wygenerowaniu
- Pola są "nakładką" na statyczny content

### Styling Pól

Pola formularza PDF mają ograniczone możliwości stylowania:
- ✅ Kolor tła, ramki
- ✅ Rozmiar i czcionka
- ❌ Gradienty, cienie
- ❌ Zaawansowane CSS

### Kompatybilność

| Przeglądarka PDF | Edycja | Zapis |
|------------------|--------|-------|
| Adobe Acrobat Reader | ✅ Tak | ✅ Tak |
| Firefox PDF Viewer | ✅ Tak | ✅ Tak |
| Chrome PDF Viewer | ✅ Tak | ❌ Nie* |
| Edge PDF Viewer | ✅ Tak | ✅ Tak |
| Preview (macOS) | ✅ Tak | ✅ Tak |

*Chrome pozwala wypełnić pola ale nie zapisuje ich do pliku przy "Drukuj do PDF"

## Przykładowy Pełny Szablon

Pełny szablon znajdziesz w: `docs/examples/editable-price-template.html`

```html
<!-- Zobacz przykład w osobnym pliku -->
```

## API Reference

### PDFService.addEditableFieldsToPDF()

```typescript
async addEditableFieldsToPDF(
    pdfBuffer: Buffer, 
    fieldPositions?: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
        name: string;
        defaultValue?: string;
    }>
): Promise<Buffer>
```

**Parametry:**
- `pdfBuffer` - Oryginalny bufor PDF
- `fieldPositions` - Tablica pozycji pól (opcjonalne)

**Zwraca:**
- Zmodyfikowany bufor PDF z edytowalnymi polami

## Changelog

**2025-11-21** - Wersja 1.0
- ✅ Dodano obsługę edytowalnych pól tekstowych
- ✅ Automatyczne wykrywanie z atrybutów `data-editable-price`
- ✅ Integracja z generowaniem PDF kolekcji
- ⏳ Planowane: Checkbox, Dropdown, Textarea
- ⏳ Planowane: Automatyczne wykrywanie pozycji bez ręcznych współrzędnych

---

**Autor:** GitHub Copilot  
**Data:** 21 listopada 2025  
**Wersja:** 1.0
