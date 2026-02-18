# 🎨 Design System - Szybki Start

## Podstawowe użycie

### 1. Przyciski

```html
<!-- Podstawowe warianty -->
<button class="ds-btn ds-btn-primary">Primary</button>
<button class="ds-btn ds-btn-secondary">Secondary</button>
<button class="ds-btn ds-btn-ghost">Ghost</button>
<button class="ds-btn ds-btn-danger">Danger</button>

<!-- Rozmiary -->
<button class="ds-btn ds-btn-sm">Small</button>
<button class="ds-btn">Default</button>
<button class="ds-btn ds-btn-lg">Large</button>

<!-- Ikony -->
<button class="ds-btn ds-btn-icon">
    <i class="bi bi-star"></i>
</button>

<!-- Pełna szerokość -->
<button class="ds-btn ds-btn-block">Full Width</button>
```

### 2. Karty

```html
<!-- Podstawowa karta -->
<div class="ds-card">
    <div class="ds-card-header">
        <h3 class="ds-card-title">Tytuł</h3>
        <p class="ds-card-subtitle">Podtytuł</p>
    </div>
    <div class="ds-card-body">
        Zawartość karty
    </div>
    <div class="ds-card-footer">
        <button class="ds-btn ds-btn-primary">Akcja</button>
    </div>
</div>

<!-- Warianty -->
<div class="ds-card ds-card-hoverable">Hover effect</div>
<div class="ds-card ds-card-clickable">Klikalna</div>
<div class="ds-card ds-card-flat">Bez cienia</div>
```

### 3. Statystyki

```html
<div class="ds-stats-grid">
    <div class="ds-stat-card">
        <div class="ds-stat-icon ds-stat-icon-primary">
            <i class="bi bi-bottle"></i>
        </div>
        <div class="ds-stat-value">123</div>
        <div class="ds-stat-label">Łącznie win</div>
    </div>
    
    <div class="ds-stat-card">
        <div class="ds-stat-icon ds-stat-icon-success">
            <i class="bi bi-check-circle"></i>
        </div>
        <div class="ds-stat-value">45</div>
        <div class="ds-stat-label">Aktywnych</div>
    </div>
</div>
```

### 4. Gridy

```html
<!-- Auto-fit (responsywny) -->
<div class="ds-grid ds-grid-auto-fit" style="--min-column-width: 250px;">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
</div>

<!-- Fixed columns -->
<div class="ds-grid ds-grid-cols-3">
    <div>Col 1</div>
    <div>Col 2</div>
    <div>Col 3</div>
</div>

<!-- Stats grid (specjalny dla statystyk) -->
<div class="ds-stats-grid">
    <div class="ds-stat-card">...</div>
    <div class="ds-stat-card">...</div>
</div>
```

### 5. Formularze

```html
<div class="ds-form-group">
    <label class="ds-label">Nazwa wina</label>
    <input type="text" class="ds-input" placeholder="Np. Cabernet Sauvignon">
    <small class="ds-help-text">Wprowadź nazwę wina</small>
</div>

<div class="ds-form-group">
    <label class="ds-label">Kategoria</label>
    <select class="ds-select">
        <option>Czerwone</option>
        <option>Białe</option>
        <option>Różowe</option>
    </select>
</div>

<div class="ds-form-group">
    <label class="ds-label">Opis</label>
    <textarea class="ds-textarea" rows="4"></textarea>
</div>
```

### 6. Tabele

```html
<table class="ds-table">
    <thead>
        <tr>
            <th>Nazwa</th>
            <th>Cena</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Wino 1</td>
            <td>50 zł</td>
            <td><span class="ds-badge ds-badge-success">Dostępne</span></td>
        </tr>
    </tbody>
</table>

<!-- Warianty -->
<table class="ds-table ds-table-striped">...</table>
<table class="ds-table ds-table-bordered">...</table>
```

### 7. Badges

```html
<span class="ds-badge ds-badge-success">Sukces</span>
<span class="ds-badge ds-badge-warning">Uwaga</span>
<span class="ds-badge ds-badge-error">Błąd</span>
<span class="ds-badge ds-badge-info">Info</span>
```

### 8. Empty State

```html
<div class="ds-empty-state">
    <div class="ds-empty-state-icon">
        <i class="bi bi-inbox"></i>
    </div>
    <h3 class="ds-empty-state-title">Brak danych</h3>
    <p class="ds-empty-state-description">
        Nie znaleziono żadnych elementów. Dodaj pierwszy element aby rozpocząć.
    </p>
    <button class="ds-btn ds-btn-primary">
        <i class="bi bi-plus-circle"></i>
        Dodaj element
    </button>
</div>
```

---

## Design Tokens

### Kolory

```css
/* Primary */
var(--ds-color-primary)           /* #009634 - Zielony */

/* Neutrals */
var(--ds-color-neutral-50)        /* Bardzo jasny */
var(--ds-color-neutral-100)       /* Tła */
var(--ds-color-neutral-600)       /* Teksty drugorzędne */
var(--ds-color-neutral-900)       /* Teksty główne */

/* Semantic */
var(--ds-color-success)           /* Sukces */
var(--ds-color-warning)           /* Ostrzeżenie */
var(--ds-color-error)             /* Błąd */
var(--ds-color-info)              /* Informacja */
```

### Spacing

```css
var(--ds-space-2)     /* 0.5rem = 8px */
var(--ds-space-3)     /* 0.75rem = 12px */
var(--ds-space-4)     /* 1rem = 16px */
var(--ds-space-6)     /* 1.5rem = 24px */
var(--ds-space-12)    /* 3rem = 48px */
```

### Typography

```css
var(--ds-font-size-xs)      /* 0.75rem */
var(--ds-font-size-sm)      /* 0.875rem */
var(--ds-font-size-base)    /* 1rem */
var(--ds-font-size-lg)      /* 1.125rem */
var(--ds-font-size-3xl)     /* 1.875rem */

var(--ds-font-weight-normal)    /* 400 */
var(--ds-font-weight-semibold)  /* 600 */
var(--ds-font-weight-bold)      /* 700 */
```

### Shadows

```css
var(--ds-shadow-sm)     /* Mały */
var(--ds-shadow-md)     /* Średni */
var(--ds-shadow-lg)     /* Duży */
var(--ds-shadow-xl)     /* Bardzo duży */
```

### Radius

```css
var(--ds-radius-sm)     /* 0.25rem */
var(--ds-radius-md)     /* 0.5rem */
var(--ds-radius-lg)     /* 0.75rem */
var(--ds-radius-full)   /* 9999px */
```

---

## Przykład kompletnej strony

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Moja Strona</title>
    
    <!-- Bootstrap -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css" rel="stylesheet">
    
    <!-- Design System -->
    <link rel="stylesheet" href="css/design-tokens.css">
    <link rel="stylesheet" href="css/modern-admin.css">
    <link rel="stylesheet" href="css/components.css">
</head>
<body class="modern-admin-wrapper">
    <header class="modern-header">
        <div class="modern-header-inner">
            <a href="index.html" class="modern-brand">
                <div class="modern-brand-icon">
                    <i class="bi bi-grid-3x3-gap"></i>
                </div>
                <span>Moja App</span>
            </a>
            
            <div class="modern-header-actions">
                <a href="index.html" class="ds-btn ds-btn-secondary">Dashboard</a>
                <button class="ds-btn ds-btn-primary">Dodaj</button>
            </div>
        </div>
    </header>

    <div class="modern-main">
        <div class="modern-container">
            <!-- Stats -->
            <div class="ds-stats-grid" style="margin-bottom: var(--ds-space-6);">
                <div class="ds-stat-card">
                    <div class="ds-stat-icon ds-stat-icon-primary">
                        <i class="bi bi-bottle"></i>
                    </div>
                    <div class="ds-stat-value">123</div>
                    <div class="ds-stat-label">Łącznie</div>
                </div>
            </div>
            
            <!-- Content -->
            <div class="ds-card">
                <div class="ds-card-header">
                    <h3 class="ds-card-title">Tytuł sekcji</h3>
                </div>
                <div class="ds-card-body">
                    <p>Treść strony...</p>
                    
                    <button class="ds-btn ds-btn-primary">
                        <i class="bi bi-save"></i>
                        Zapisz
                    </button>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
```

---

## Zmiana kolorów (globalnie)

Edytuj `public/css/design-tokens.css`:

```css
/* Zmień kolor główny */
--ds-color-primary: #YOUR_COLOR;

/* Zmień kolory tła */
--ds-color-neutral-50: #f9fafb;
--ds-color-neutral-100: #f3f4f6;

/* Zmień kolory tekstu */
--ds-color-neutral-900: #111827;
--ds-color-neutral-600: #6b7280;
```

**Wszystkie komponenty zaktualizują się automatycznie!** 🎉

---

## Dark Mode

Włącz dodając atrybut do `<html>`:

```html
<html data-theme="dark">
```

Wyłącz usuwając atrybut lub zmieniając na:

```html
<html data-theme="light">
```

---

**Więcej informacji:** Zobacz `DESIGN_SYSTEM_IMPLEMENTATION.md`
