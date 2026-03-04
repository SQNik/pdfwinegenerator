# Niestandardowe Nazwy Kategorii w Szablonach PDF

## Przegląd

System pozwala na zmianę nazw kategorii win wyświetlanych w generowanym PDF. Użytkownik może w Kreatorze Kolekcji (krok 4 - Podsumowanie) edytować nazwy kategorii, które następnie będą automatycznie używane w szablonie PDF.

## Jak to działa

### 1. Edycja nazw w Kreatorze (Frontend)

W kroku 4 Kreatora Kolekcji, przy każdej kategorii znajduje się edytowalne pole tekstowe:

```
┌──────────────────────────────────────────────┐
│ 🌟 [Wina białe Premium 2024]    2 wina      │  ← Edytowalny input
└──────────────────────────────────────────────┘
```

Użytkownik może:
- Kliknąć w nazwę kategorii (np. "Wina białe")
- Wpisać własną nazwę (np. "Wina białe Premium 2024", "Ekskluzywna Oferta Białych Win")
- Nazwa zostanie automatycznie zapisana w `metadata.categoryNames`

### 2. Przechowywanie danych

Niestandardowe nazwy kategorii są zapisywane w kolekcji jako:

```json
{
  "metadata": {
    "categoryNames": {
      "białe": "Wina białe Premium 2024",
      "czerwone": "Ekskluzywne Czerwone",
      "różowe": "Wina różowe z Prowansji"
    },
    "wizardData": {
      "categoryNames": { ... }  // Backup kopia
    }
  }
}
```

### 3. Użycie w szablonie HTML

W szablonie PDF używasz standardowego placeholdera `{{category}}`, który automatycznie wyświetli:
- **Niestandardową nazwę** - jeśli użytkownik ją zdefiniował
- **Domyślną nazwę** - jeśli nie ma custom nazwy (np. "białe", "czerwone")

## Przykłady użycia w szablonach

### Podstawowy przykład - Lista kategorii

```html
{{#each collection.winesByCategory}}
  <div class="category-section">
    <h2 class="category-title">{{category}}</h2>
    <p class="category-info">Liczba win: {{categoryWineCount}}</p>
    
    {{#each pages}}
      <div class="wine-page">
        {{#each this}}
          <div class="wine-item">
            <h3>{{this.name}}</h3>
            <p>{{this.description}}</p>
          </div>
        {{/each}}
      </div>
    {{/each}}
  </div>
{{/each}}
```

**Wynik:**
- Jeśli użytkownik zmienił nazwę "białe" → "Wina białe Premium 2024", to `{{category}}` wyświetli: **"Wina białe Premium 2024"**
- Jeśli nie było zmian, `{{category}}` wyświetli: **"białe"**

### Przykład z gradientowym nagłówkiem

```html
{{#each collection.winesByCategory}}
  <div class="page category-page">
    <div class="category-header" style="
      background: linear-gradient(135deg, #009634 0%, #006622 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 0.75rem;
      margin-bottom: 2rem;
    ">
      <h1 style="font-size: 2rem; margin: 0;">{{category}}</h1>
      <p style="margin: 0.5rem 0 0 0; opacity: 0.9;">
        {{categoryWineCount}} {{#if (eq categoryWineCount 1)}}wino{{else}}win{{/if}}
      </p>
    </div>
    
    {{#each pages}}
      <div class="products-grid">
        {{#each this}}
          <article class="wine-card">
            <img src="{{this.image}}" alt="{{this.name}}">
            <h3>{{this.name}}</h3>
            <p class="producer">{{this.producer}}</p>
            <p class="price">{{this.price}} zł</p>
          </article>
        {{/each}}
      </div>
    {{/each}}
  </div>
{{/each}}
```

### Przykład z ikonami kategorii

```html
{{#each collection.winesByCategory}}
  <section class="wine-category">
    <div class="category-banner">
      {{#if (eq category "białe")}}
        <span class="icon">🌟</span>
      {{else if (eq category "czerwone")}}
        <span class="icon">💎</span>
      {{else if (eq category "różowe")}}
        <span class="icon">🌸</span>
      {{/if}}
      
      <h2>{{category}}</h2>
      <span class="count">({{categoryWineCount}})</span>
    </div>
    
    <!-- Wina w kategorii -->
    {{#each wines}}
      <div class="wine">{{this.name}}</div>
    {{/each}}
  </section>
{{/each}}
```

## Dostępne zmienne w kontekście kategorii

Kiedy jesteś w pętli `{{#each collection.winesByCategory}}`, masz dostęp do:

| Zmienna | Opis | Przykład |
|---------|------|----------|
| `{{category}}` | Nazwa kategorii (custom lub domyślna) | "Wina białe Premium 2024" |
| `{{categoryWineCount}}` | Liczba win w kategorii | "5" |
| `{{pages}}` | Paginowane strony win (po 3 wina) | Do iteracji w `{{#each pages}}` |
| `{{wines}}` | Wszystkie wina w kategorii (legacy) | Do iteracji w `{{#each wines}}` |

## Przepływ danych

```
Kreator Kolekcji (Krok 4)
    ↓
Użytkownik edytuje nazwę: "białe" → "Wina białe Premium 2024"
    ↓
Zapis do: data.categoryNames['białe'] = "Wina białe Premium 2024"
    ↓
Zapisane w kolekcji: metadata.categoryNames.białe
    ↓
Generowanie PDF: pdfService.ts
    ↓
injectCollectionDataToHTML() czyta: collectionData.metadata.categoryNames
    ↓
Podmienia {{category}} na custom nazwę
    ↓
Wygenerowany PDF wyświetla: "Wina białe Premium 2024"
```

## Implementacja techniczna

### Backend (pdfService.ts)

```typescript
// Linia ~2517
const customCategoryNames = collectionData?.metadata?.categoryNames || {};
const displayCategoryName = customCategoryNames[category] || category;

catHTML = catHTML.replace(/\{\{category\}\}/g, displayCategoryName);
```

### Frontend (collection-wizard-config.js)

```javascript
// Inicjalizacja
if (!data.categoryNames) {
    data.categoryNames = {};
}

// Renderowanie inputa
<input type="text" 
       class="wizard-category-name-input" 
       data-category="${category}"
       value="${customCategoryName}"
       placeholder="${defaultCategoryName}">

// Obsługa zmian
input.addEventListener('input', (e) => {
    const category = e.target.dataset.category;
    data.categoryNames[category] = e.target.value;
    wizard.saveState();
});
```

### Zapisywanie w kolekcji (kreator.html)

```javascript
const collectionData = {
    metadata: {
        categoryNames: data.categoryNames || {},
        wizardData: {
            categoryNames: data.categoryNames || {}
        }
    }
};
```

## Wskazówki

1. **Zawsze używaj `{{category}}`** - nie hardkoduj nazw kategorii w szablonie
2. **Automatyczna podmiana** - system automatycznie użyje custom nazwy, jeśli istnieje
3. **Fallback do domyślnej** - jeśli brak custom nazwy, użyta zostanie oryginalna wartość z `wine.category`
4. **Edycja w dowolnym momencie** - użytkownik może edytować nazwy zarówno przy tworzeniu, jak i edycji kolekcji

## Przykładowe mapowanie

| Oryginalna kategoria | Custom nazwa (przykład) | Wyświetlane jako |
|---------------------|------------------------|------------------|
| białe | "Wina białe Premium 2024" | Wina białe Premium 2024 |
| czerwone | (bez zmian) | czerwone |
| różowe | "Różowe z Prowansji" | Różowe z Prowansji |
| musujące | "Szampany i Prosecco" | Szampany i Prosecco |

---

**Ostatnia aktualizacja:** 20 lutego 2026
