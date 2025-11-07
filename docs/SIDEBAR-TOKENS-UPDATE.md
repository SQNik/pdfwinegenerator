# 📋 Aktualizacja Tokenów w Sidebar - Edytor Szablonów

## Data: 24 października 2025

## Zmiany

### ✅ Dodano nowe tokeny do sekcji "Pola Kolekcji"

#### 1. **Lista win - alternatywna składnia**
```handlebars
{{#each winesList}}
  {{this.name}}
{{/each}}
```
- **Grupa**: wines
- **Opis**: Alternatywny token dla listy win
- **Różnica**: Używa `{{this.field}}` zamiast `{{wine.field}}`

#### 2. **Wina pogrupowane po kategorii** ⭐ NOWE
```handlebars
{{#each collection.winesByCategory}}
  {{category}} ({{categoryWineCount}})
  {{#each wines}}
    {{wine.name}}
  {{/each}}
{{/each}}
```
- **Grupa**: wines
- **Opis**: Iteracja przez wina pogrupowane według kategorii
- **Dostępne tokeny wewnętrzne**:
  - `{{category}}` - nazwa kategorii
  - `{{categoryWineCount}}` - liczba win w kategorii
  - `{{#each wines}}` - pętla po winach w kategorii

#### 3. **Nowa grupa: "category-loop"** ⭐ NOWE

Tokeny dostępne TYLKO wewnątrz pętli `{{#each collection.winesByCategory}}`:

**a) Nazwa kategorii**
```handlebars
{{category}}
```
- **Typ**: text
- **Opis**: Nazwa aktualnej kategorii (np. "białe", "czerwone")

**b) Liczba win w kategorii**
```handlebars
{{categoryWineCount}}
```
- **Typ**: number
- **Opis**: Liczba win w aktualnej kategorii

**c) Pętla win w kategorii (zagnieżdżona)**
```handlebars
{{#each wines}}
  {{wine.name}}
{{/each}}
```
- **Typ**: array
- **Opis**: Iteracja przez wina w aktualnej kategorii

## Struktura Grup w Sidebar

### Pola Win
- **general** - Podstawowe pola dynamiczne win

### Pola Kolekcji
- **basic** - Podstawowe pola kolekcji (id, name, description, status, etc.)
- **dynamic** - Dynamiczne pola kolekcji
- **wines** - Tokeny związane z listą win
- **category-loop** ⭐ NOWA - Tokeny dostępne w pętli kategorii

## Przykład Użycia

### Kompletny szablon z grupowaniem kategorii:

```html
<h1>{{collection.name}}</h1>
<p>Liczba win: {{collection.wineCount}}</p>

{{#each collection.winesByCategory}}
  <div class="category-section">
    <h2>Kategoria: {{category}}</h2>
    <p>Liczba win w tej kategorii: {{categoryWineCount}}</p>
    
    <div class="wines-list">
      {{#each wines}}
        <div class="wine-item">
          <h3>{{wine.name}}</h3>
          <p>{{wine.description}}</p>
          <p>Region: {{wine.region}} | Szczepy: {{wine.szczepy}}</p>
        </div>
      {{/each}}
    </div>
  </div>
{{/each}}
```

## Pliki Zmodyfikowane

### Backend
**Plik**: `src/controllers/templateEditorController.ts`
- Metoda: `getCollectionFields()`
- Dodano: `wineListFields` z tokenem `winesList`
- Dodano: `winesByCategory` z pełnym przykładem składni
- Dodano: `categoryFields[]` - nowa tablica z tokenami dla pętli kategorii
- Zaktualizowano: `allFields` zawiera teraz `categoryFields`

### Frontend
**Plik**: `public/template-editor.html`
- Zaktualizowano wersję cache: `v=20251024k`

## Techniczne Szczegóły

### API Endpoint
```
GET /api/template-editor/collection-fields
```

### Struktura Odpowiedzi
```json
{
  "success": true,
  "data": [
    {
      "key": "winesByCategory",
      "label": "Wina pogrupowane po kategorii (foreach)",
      "type": "array",
      "placeholder": "{{#each collection.winesByCategory}}...",
      "description": "Iteracja przez wina pogrupowane według kategorii",
      "group": "wines",
      "required": false
    },
    {
      "key": "category",
      "label": "Nazwa kategorii (w pętli winesByCategory)",
      "type": "text",
      "placeholder": "{{category}}",
      "description": "Nazwa aktualnej kategorii",
      "group": "category-loop",
      "required": false
    }
    // ... więcej pól
  ]
}
```

## Wizualizacja Sidebar

```
┌─────────────────────────────────┐
│ POLA KOLEKCJI                   │
├─────────────────────────────────┤
│ BASIC                           │
│  - ID Kolekcji                  │
│  - Nazwa kolekcji               │
│  - Opis kolekcji                │
│  ...                            │
├─────────────────────────────────┤
│ WINES                           │
│  - Lista win (foreach)          │
│  - Lista win - alias (foreach)  │ ⬅ NOWE
│  - Wina pogrupowane...          │ ⬅ NOWE
│  - Liczba win                   │
├─────────────────────────────────┤
│ CATEGORY-LOOP                   │ ⬅ NOWA GRUPA
│  - Nazwa kategorii...           │ ⬅ NOWE
│  - Liczba win w kategorii...    │ ⬅ NOWE
│  - Pętla win w kategorii...     │ ⬅ NOWE
└─────────────────────────────────┘
```

## Funkcjonalność Drag & Drop

Wszystkie nowe tokeny są w pełni **przeciągalne** (draggable) do edytora kodu:

1. Kliknij i przytrzymaj token w sidebar
2. Przeciągnij do edytora HTML
3. Token zostanie automatycznie wstawiony w odpowiednim miejscu

## Testowanie

### Sprawdź w przeglądarce:
1. Otwórz edytor szablonów: `http://localhost:3001/template-editor.html`
2. W lewym sidebar znajdź sekcję **"Pola kolekcji"**
3. Rozwiń grupę **"WINES"** - powinny być 4 tokeny (w tym 2 nowe)
4. Rozwiń grupę **"CATEGORY-LOOP"** - powinny być 3 nowe tokeny
5. Sprawdź przeciąganie tokenów do edytora

## Status

✅ **Zakończono**: Wszystkie tokeny dodane i przetestowane
✅ **Backend**: Zaktualizowany i skompilowany
✅ **Frontend**: Cache odświeżony
✅ **Dokumentacja**: Kompletna

## Powiązane Dokumenty

- [CATEGORY-GROUPING-EXAMPLE.md](./CATEGORY-GROUPING-EXAMPLE.md) - Przykłady użycia
- [CATEGORY-GROUPING-TECHNICAL.md](./CATEGORY-GROUPING-TECHNICAL.md) - Szczegóły techniczne implementacji
