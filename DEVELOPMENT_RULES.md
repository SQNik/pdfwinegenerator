# Zasady Rozwoju Projektu - Wine Management System

## 🚨 KRYTYCZNA ZASADA: Edycja Plików HTML

### ⚠️ System Budowania HTML

Projekt używa **automatycznego systemu budowania HTML**:

```
public/pages/*.html  ← EDYTUJ TUTAJ (pliki źródłowe)
       ↓
   npm run build
       ↓  
public/*.html  ← NIE EDYTUJ! (pliki generowane automatycznie)
```

### ✅ ZAWSZE Edytuj:
- `public/pages/index.html`
- `public/pages/wines.html`
- `public/pages/collections.html`
- `public/pages/template-editor.html`
- `public/pages/wines copy.html`

### ❌ NIGDY NIE Edytuj Bezpośrednio:
- `public/index.html` ← generowany z `public/pages/index.html`
- `public/wines.html` ← generowany z `public/pages/wines.html`
- `public/collections.html` ← generowany z `public/pages/collections.html`
- `public/template-editor.html` ← generowany z `public/pages/template-editor.html`

### 📋 Proces Pracy:

1. **Edytuj pliki w `public/pages/`**
2. **Uruchom build:** `npm run build:html` lub `npm run build`
3. **Zmiany pojawią się w `public/`**

### ⚙️ Komendy Budowania:

```bash
# Build tylko HTML
npm run build:html

# Build całego projektu (TypeScript + HTML)
npm run build

# Watch mode - automatyczne rebuildy
npm run watch:html

# Development z watch (TypeScript + HTML)
npm run dev:all
```

### 🔍 Jak działa system budowania?

Skrypt `scripts/build-html.js`:
- Czyta pliki z `public/pages/`
- Przetwarza include'y: `<!-- INCLUDE: path/to/file.html -->`
- Przetwarza zmienne: `{{VAR_NAME}}`
- Zapisuje do `public/`

### 🎯 Wyjątki:

Następujące pliki **NIE** są budowane i można je edytować bezpośrednio:
- `public/pdf-editor.html` ← edytuj bezpośrednio
- `public/settings/index.html` ← edytuj bezpośrednio
- Wszystkie pliki w `public/_deprecated/` ← edytuj bezpośrednio (jeśli trzeba)

### 💡 Dlaczego to ważne?

**Jeśli edytujesz plik w `public/` zamiast `public/pages/`:**
- Twoje zmiany zostaną **nadpisane** przy następnym `npm run build`
- Stracisz całą pracę
- Będziesz musiał powtórzyć edycję

---

## 📚 Inne Ważne Zasady

### Design System
- Używaj klas z prefiksem `ds-*` dla spójności
- Sprawdź `public/css/design-tokens.css` dla dostępnych zmiennych
- Sprawdź `public/css/components.css` dla gotowych komponentów

### Nawigacja
- Każda strona musi mieć: `<div id="navigation-placeholder"></div>`
- Każda strona musi includować: `<script src="/js/navigation-loader.js" defer></script>`
- Każda strona musi mieć CSS: `<link rel="stylesheet" href="css/navigation.css">`

### Dynamiczne Pola
- **NIGDY** nie hardkoduj definicji pól
- Wszystkie pola ładuj z `/api/fields/config`
- Zobacz: `docs/DYNAMIC_FIELDS_SYSTEM.md`

### Identyfikatory
- Używaj `catalogNumber` dla referencji biznesowych
- `_id` tylko dla operacji wewnętrznych
- Kolekcje używają tablic `catalogNumber`

---

**Data ostatniej aktualizacji:** 18 lutego 2026
