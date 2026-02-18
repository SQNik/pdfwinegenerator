# Design System 2.0 - Propozycja Wdrożenia

## 🎯 CEL
Ujednolicenie wyglądu wszystkich podstron z możliwością łatwego zarządzania kolorami, komponentami i spójnością całego systemu.

---

## 📊 ARCHITEKTURA ROZWIĄZANIA

### 1. **Component Library** (Biblioteka Komponentów)
Utworzenie katalogu `public/components/` z gotowymi, reusable komponentami HTML.

### 2. **Design Tokens** (Tokeny Designu)
Centralne zarządzanie kolorami, spacingiem, typografią przez CSS Custom Properties.

### 3. **Page Templates** (Szablony Stron)
Standardowe layouty dla różnych typów stron (lista, szczegóły, formularze).

### 4. **Build System Integration** (Integracja Systemu Budowania)
Wykorzystanie istniejącego `build-html.js` do automatycznego składania stron z komponentów.

---

## 🏗️ STRUKTURA KATALOGÓW (NOWA)

```
public/
├── components/              # ← NOWE: Biblioteka komponentów
│   ├── layout/
│   │   ├── page-header.html          # Standardowy nagłówek strony
│   │   ├── page-section.html         # Standardowa sekcja
│   │   ├── stats-grid.html           # Siatka statystyk
│   │   └── empty-state.html          # Stan pusty
│   ├── cards/
│   │   ├── stat-card.html            # Karta statystyki
│   │   ├── action-card.html          # Karta akcji
│   │   ├── wine-card.html            # Karta wina
│   │   └── collection-card.html      # Karta kolekcji
│   ├── forms/
│   │   ├── form-field.html           # Pojedyncze pole
│   │   ├── form-actions.html         # Przyciski formularza
│   │   └── search-bar.html           # Pasek wyszukiwania
│   ├── tables/
│   │   ├── data-table.html           # Standardowa tabela
│   │   └── table-actions.html        # Akcje w tabeli
│   └── navigation/
│       ├── tabs.html                 # Zakładki
│       ├── breadcrumbs.html          # Breadcrumbs
│       └── pagination.html           # Paginacja
├── css/
│   ├── modern-admin.css              # Base (istniejący)
│   ├── utilities.css                 # Utilities (istniejący)
│   ├── dark-mode.css                 # Dark mode (istniejący)
│   ├── notifications.css             # Notifications (istniejący)
│   ├── design-tokens.css             # ← NOWY: Centralne tokeny
│   └── components.css                # ← NOWY: Style komponentów
└── pages/                            # ← Źródłowe strony (do buildu)
    ├── dashboard.html
    ├── wines.html
    ├── collections.html
    └── template-editor.html
```

---

## 🎨 DESIGN TOKENS (CSS Custom Properties)

### Plik: `public/css/design-tokens.css`

**Wszystkie wartości designu w jednym miejscu:**

```css
:root {
    /* ===== COLORS - Kolory ===== */
    
    /* Primary Palette */
    --ds-color-primary: #009634;
    --ds-color-primary-light: #10b981;
    --ds-color-primary-dark: #047857;
    --ds-color-primary-bg: #d1fae5;
    
    /* Neutrals */
    --ds-color-neutral-50: #ffffff;
    --ds-color-neutral-100: #f8f9fb;
    --ds-color-neutral-200: #f1f3f6;
    --ds-color-neutral-300: #e2e8f0;
    --ds-color-neutral-400: #cbd5e0;
    --ds-color-neutral-500: #a0aec0;
    --ds-color-neutral-600: #718096;
    --ds-color-neutral-700: #4a5568;
    --ds-color-neutral-800: #2d3748;
    --ds-color-neutral-900: #1a202c;
    
    /* Semantic Colors */
    --ds-color-success: #10b981;
    --ds-color-warning: #f59e0b;
    --ds-color-error: #ef4444;
    --ds-color-info: #3b82f6;
    
    /* ===== SPACING - Odstępy ===== */
    --ds-space-0: 0;
    --ds-space-1: 0.25rem;    /* 4px */
    --ds-space-2: 0.5rem;     /* 8px */
    --ds-space-3: 0.75rem;    /* 12px */
    --ds-space-4: 1rem;       /* 16px */
    --ds-space-5: 1.25rem;    /* 20px */
    --ds-space-6: 1.5rem;     /* 24px */
    --ds-space-8: 2rem;       /* 32px */
    --ds-space-10: 2.5rem;    /* 40px */
    --ds-space-12: 3rem;      /* 48px */
    --ds-space-16: 4rem;      /* 64px */
    
    /* ===== TYPOGRAPHY - Typografia ===== */
    --ds-font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    
    --ds-font-size-xs: 0.75rem;      /* 12px */
    --ds-font-size-sm: 0.875rem;     /* 14px */
    --ds-font-size-base: 0.9375rem;  /* 15px */
    --ds-font-size-md: 1rem;         /* 16px */
    --ds-font-size-lg: 1.125rem;     /* 18px */
    --ds-font-size-xl: 1.25rem;      /* 20px */
    --ds-font-size-2xl: 1.5rem;      /* 24px */
    --ds-font-size-3xl: 1.875rem;    /* 30px */
    --ds-font-size-4xl: 2.25rem;     /* 36px */
    
    --ds-font-weight-light: 300;
    --ds-font-weight-normal: 400;
    --ds-font-weight-medium: 500;
    --ds-font-weight-semibold: 600;
    --ds-font-weight-bold: 700;
    
    --ds-line-height-tight: 1.25;
    --ds-line-height-normal: 1.5;
    --ds-line-height-relaxed: 1.75;
    
    /* ===== BORDERS - Obramowania ===== */
    --ds-border-width-thin: 1px;
    --ds-border-width-medium: 2px;
    --ds-border-width-thick: 4px;
    
    --ds-radius-none: 0;
    --ds-radius-sm: 0.375rem;   /* 6px */
    --ds-radius-md: 0.5rem;     /* 8px */
    --ds-radius-lg: 0.75rem;    /* 12px */
    --ds-radius-xl: 1rem;       /* 16px */
    --ds-radius-2xl: 1.5rem;    /* 24px */
    --ds-radius-full: 9999px;
    
    /* ===== SHADOWS - Cienie ===== */
    --ds-shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --ds-shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    --ds-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --ds-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --ds-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    
    /* ===== TRANSITIONS - Animacje ===== */
    --ds-transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
    --ds-transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
    --ds-transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
    
    /* ===== BREAKPOINTS (for reference) ===== */
    /* sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px */
}

/* Dark Mode Overrides */
[data-theme="dark"] {
    --ds-color-neutral-50: #1a202c;
    --ds-color-neutral-100: #2d3748;
    --ds-color-neutral-200: #4a5568;
    --ds-color-neutral-900: #f7fafc;
    --ds-color-neutral-800: #e2e8f0;
    --ds-color-neutral-700: #cbd5e0;
}
```

---

## 🧩 STANDARDOWE KOMPONENTY

### 1. **Page Header Component**
Plik: `public/components/layout/page-header.html`

```html
<!-- 
  Page Header Component
  Usage:
    <!-- INCLUDE: components/layout/page-header.html -->
    Zastąp: {{TITLE}}, {{SUBTITLE}}, {{ICON}}
-->
<div class="ds-page-header">
    <div class="ds-page-header-content">
        <div class="ds-page-header-icon">
            <i class="bi bi-{{ICON}}"></i>
        </div>
        <div>
            <h1 class="ds-page-title">{{TITLE}}</h1>
            <p class="ds-page-subtitle">{{SUBTITLE}}</p>
        </div>
    </div>
    <div class="ds-page-header-actions">
        <!-- Slot for action buttons -->
        {{ACTIONS}}
    </div>
</div>
```

**Odpowiadający CSS:**
```css
.ds-page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--ds-space-8);
    gap: var(--ds-space-6);
}

.ds-page-header-content {
    display: flex;
    align-items: center;
    gap: var(--ds-space-4);
}

.ds-page-header-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--ds-radius-lg);
    background: var(--ds-color-primary-bg);
    color: var(--ds-color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--ds-font-size-2xl);
}

.ds-page-title {
    font-size: var(--ds-font-size-3xl);
    font-weight: var(--ds-font-weight-bold);
    color: var(--ds-color-neutral-900);
    margin: 0;
    line-height: var(--ds-line-height-tight);
}

.ds-page-subtitle {
    font-size: var(--ds-font-size-base);
    color: var(--ds-color-neutral-600);
    margin: var(--ds-space-1) 0 0 0;
}

.ds-page-header-actions {
    display: flex;
    gap: var(--ds-space-3);
}
```

### 2. **Stat Card Component**
Plik: `public/components/cards/stat-card.html`

```html
<!-- 
  Stat Card Component
  Variables: {{VALUE}}, {{LABEL}}, {{ICON}}, {{COLOR}}
-->
<div class="ds-stat-card">
    <div class="ds-stat-icon ds-stat-icon-{{COLOR}}">
        <i class="bi bi-{{ICON}}"></i>
    </div>
    <div class="ds-stat-value">{{VALUE}}</div>
    <div class="ds-stat-label">{{LABEL}}</div>
</div>
```

**CSS:**
```css
.ds-stat-card {
    background: var(--ds-color-neutral-50);
    border: var(--ds-border-width-thin) solid var(--ds-color-neutral-300);
    border-radius: var(--ds-radius-lg);
    padding: var(--ds-space-6);
    transition: all var(--ds-transition-base);
    cursor: pointer;
}

.ds-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--ds-shadow-lg);
    border-color: var(--ds-color-primary);
}

.ds-stat-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--ds-radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--ds-font-size-2xl);
    margin-bottom: var(--ds-space-4);
}

.ds-stat-icon-primary {
    background: var(--ds-color-primary-bg);
    color: var(--ds-color-primary);
}

.ds-stat-icon-success {
    background: rgba(16, 185, 129, 0.1);
    color: var(--ds-color-success);
}

.ds-stat-icon-warning {
    background: rgba(245, 158, 11, 0.1);
    color: var(--ds-color-warning);
}

.ds-stat-icon-info {
    background: rgba(59, 130, 246, 0.1);
    color: var(--ds-color-info);
}

.ds-stat-value {
    font-size: var(--ds-font-size-4xl);
    font-weight: var(--ds-font-weight-bold);
    color: var(--ds-color-neutral-900);
    line-height: var(--ds-line-height-tight);
    margin-bottom: var(--ds-space-2);
}

.ds-stat-label {
    font-size: var(--ds-font-size-sm);
    color: var(--ds-color-neutral-600);
    font-weight: var(--ds-font-weight-medium);
}
```

### 3. **Stats Grid Component**
Plik: `public/components/layout/stats-grid.html`

```html
<!-- 
  Stats Grid Layout
  Responsive grid for stat cards
-->
<div class="ds-stats-grid">
    {{CONTENT}}
</div>
```

**CSS:**
```css
.ds-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--ds-space-6);
    margin-bottom: var(--ds-space-8);
}

@media (max-width: 768px) {
    .ds-stats-grid {
        grid-template-columns: 1fr;
    }
}
```

### 4. **Button Component** (ujednolicenie)
Plik: `public/css/components.css`

```css
/* === BUTTONS - Standardowe przyciski === */
.ds-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ds-space-2);
    padding: var(--ds-space-3) var(--ds-space-5);
    border-radius: var(--ds-radius-md);
    font-size: var(--ds-font-size-sm);
    font-weight: var(--ds-font-weight-semibold);
    border: none;
    cursor: pointer;
    transition: all var(--ds-transition-fast);
    text-decoration: none;
    white-space: nowrap;
}

.ds-btn:hover {
    transform: translateY(-2px);
    box-shadow: var(--ds-shadow-md);
}

.ds-btn:active {
    transform: translateY(0);
}

/* Primary Button */
.ds-btn-primary {
    background: var(--ds-color-primary);
    color: white;
}

.ds-btn-primary:hover {
    background: var(--ds-color-primary-dark);
    color: white;
}

/* Secondary Button */
.ds-btn-secondary {
    background: var(--ds-color-neutral-100);
    color: var(--ds-color-neutral-700);
}

.ds-btn-secondary:hover {
    background: var(--ds-color-neutral-200);
    color: var(--ds-color-neutral-900);
}

/* Ghost Button */
.ds-btn-ghost {
    background: transparent;
    color: var(--ds-color-neutral-700);
}

.ds-btn-ghost:hover {
    background: var(--ds-color-neutral-100);
    color: var(--ds-color-neutral-900);
}

/* Danger Button */
.ds-btn-danger {
    background: var(--ds-color-error);
    color: white;
}

.ds-btn-danger:hover {
    background: #dc2626;
}

/* Size Variants */
.ds-btn-sm {
    padding: var(--ds-space-2) var(--ds-space-4);
    font-size: var(--ds-font-size-xs);
}

.ds-btn-lg {
    padding: var(--ds-space-4) var(--ds-space-6);
    font-size: var(--ds-font-size-md);
}

/* Icon Only Button */
.ds-btn-icon {
    width: 40px;
    height: 40px;
    padding: 0;
}

/* Full Width Button */
.ds-btn-block {
    width: 100%;
}
```

### 5. **Card Component**
```css
/* === CARDS - Karty === */
.ds-card {
    background: var(--ds-color-neutral-50);
    border: var(--ds-border-width-thin) solid var(--ds-color-neutral-300);
    border-radius: var(--ds-radius-lg);
    box-shadow: var(--ds-shadow-sm);
    transition: all var(--ds-transition-base);
}

.ds-card:hover {
    box-shadow: var(--ds-shadow-md);
}

.ds-card-header {
    padding: var(--ds-space-6);
    border-bottom: var(--ds-border-width-thin) solid var(--ds-color-neutral-300);
}

.ds-card-body {
    padding: var(--ds-space-6);
}

.ds-card-footer {
    padding: var(--ds-space-6);
    border-top: var(--ds-border-width-thin) solid var(--ds-color-neutral-300);
    background: var(--ds-color-neutral-100);
}

.ds-card-title {
    font-size: var(--ds-font-size-lg);
    font-weight: var(--ds-font-weight-semibold);
    color: var(--ds-color-neutral-900);
    margin: 0;
}

.ds-card-subtitle {
    font-size: var(--ds-font-size-sm);
    color: var(--ds-color-neutral-600);
    margin: var(--ds-space-1) 0 0 0;
}

/* Card Variants */
.ds-card-hoverable:hover {
    transform: translateY(-4px);
    box-shadow: var(--ds-shadow-xl);
}

.ds-card-clickable {
    cursor: pointer;
}
```

### 6. **Grid Component**
```css
/* === GRIDS - Siatki === */
.ds-grid {
    display: grid;
    gap: var(--ds-space-6);
}

/* Auto-fit responsive grid */
.ds-grid-auto {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

/* 2 column grid */
.ds-grid-2 {
    grid-template-columns: repeat(2, 1fr);
}

/* 3 column grid */
.ds-grid-3 {
    grid-template-columns: repeat(3, 1fr);
}

/* 4 column grid */
.ds-grid-4 {
    grid-template-columns: repeat(4, 1fr);
}

/* Responsive breakpoints */
@media (max-width: 1024px) {
    .ds-grid-4 { grid-template-columns: repeat(2, 1fr); }
    .ds-grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
    .ds-grid-4,
    .ds-grid-3,
    .ds-grid-2 {
        grid-template-columns: 1fr;
    }
}

/* Gap variants */
.ds-gap-1 { gap: var(--ds-space-1); }
.ds-gap-2 { gap: var(--ds-space-2); }
.ds-gap-3 { gap: var(--ds-space-3); }
.ds-gap-4 { gap: var(--ds-space-4); }
.ds-gap-5 { gap: var(--ds-space-5); }
.ds-gap-6 { gap: var(--ds-space-6); }
.ds-gap-8 { gap: var(--ds-space-8); }
```

---

## 🔧 PLAN WDROŻENIA (10 KROKÓW)

### KROK 1: Utworzenie Design Tokens
```bash
# Utworzenie nowego pliku
touch public/css/design-tokens.css
```

**Akcja:** Skopiuj powyższy kod CSS custom properties.

### KROK 2: Utworzenie Components CSS
```bash
touch public/css/components.css
```

**Akcja:** Skopiuj wszystkie style komponentów (buttons, cards, grids).

### KROK 3: Aktualizacja layouts/head.html
Dodaj nowe arkusze stylów do `public/layouts/head.html`:

```html
<link rel="stylesheet" href="css/design-tokens.css">
<link rel="stylesheet" href="css/modern-admin.css">
<link rel="stylesheet" href="css/components.css">
<link rel="stylesheet" href="css/utilities.css">
<link rel="stylesheet" href="css/dark-mode.css">
<link rel="stylesheet" href="css/notifications.css">
```

**Kolejność jest ważna!** Design tokens pierwsze, utilities ostatnie.

### KROK 4: Utworzenie katalogu komponentów
```bash
mkdir -p public/components/layout
mkdir -p public/components/cards
mkdir -p public/components/forms
mkdir -p public/components/tables
mkdir -p public/components/navigation
```

### KROK 5: Utworzenie standardowych komponentów
Stworzenie plików HTML z powtarzalnymi elementami:

- `components/layout/page-header.html`
- `components/layout/stats-grid.html`
- `components/cards/stat-card.html`
- `components/layout/empty-state.html`

### KROK 6: Konwersja index.html na nowy system
**Przed:**
```html
<div class="dashboard-hero">
    <h1 class="hero-title">Dashboard</h1>
</div>
```

**Po:**
```html
<!-- INCLUDE: components/layout/page-header.html -->
<!-- Zastąp w build-html.js:
  {{TITLE}} = Dashboard
  {{SUBTITLE}} = Zarządzanie systemem win
  {{ICON}} = grid-3x3-gap
-->
```

### KROK 7: Konwersja wines.html
Zamiana inline styles na komponenty i utility classes.

**Przed:**
```html
<style>
    .stat-card {
        background: white;
        padding: 24px;
        border-radius: 12px;
    }
</style>
<div class="stat-card">...</div>
```

**Po:**
```html
<div class="ds-card ds-card-hoverable">
    <div class="ds-card-body">...</div>
</div>
```

### KROK 8: Konwersja collections.html
To samo co wines.html - użycie standardowych komponentów.

### KROK 9: Ujednolicenie wszystkich przycisków
Globalne find & replace:

- `.modern-btn` → `.ds-btn`
- `.modern-btn-primary` → `.ds-btn-primary`
- `.modern-btn-secondary` → `.ds-btn-secondary`
- `.btn btn-primary` → `.ds-btn ds-btn-primary`

### KROK 10: Build i Test
```bash
npm run build:html
npm start
```

Sprawdzenie wszystkich podstron pod kątem:
- Spójności kolorów
- Jednakowych odstępów
- Identycznych hover effects
- Responsywności mobile

---

## 📖 DOKUMENTACJA UŻYCIA

### Jak dodać nową podstronę?

1. **Utwórz plik** w `public/pages/new-page.html`

2. **Użyj standardowego szablonu:**

```html
<!-- INCLUDE: layouts/head.html -->
<body data-theme="light">
    <!-- INCLUDE: layouts/header.html -->
    
    <main class="modern-main">
        <div class="modern-container">
            <!-- Page Header -->
            <div class="ds-page-header">
                <div class="ds-page-header-content">
                    <div class="ds-page-header-icon">
                        <i class="bi bi-star"></i>
                    </div>
                    <div>
                        <h1 class="ds-page-title">Nowa Strona</h1>
                        <p class="ds-page-subtitle">Opis strony</p>
                    </div>
                </div>
                <div class="ds-page-header-actions">
                    <button class="ds-btn ds-btn-primary">
                        <i class="bi bi-plus-lg"></i>
                        Dodaj
                    </button>
                </div>
            </div>
            
            <!-- Stats Grid -->
            <div class="ds-stats-grid">
                <div class="ds-stat-card">
                    <div class="ds-stat-icon ds-stat-icon-primary">
                        <i class="bi bi-graph-up"></i>
                    </div>
                    <div class="ds-stat-value">128</div>
                    <div class="ds-stat-label">Statystyka</div>
                </div>
                <!-- Więcej kart... -->
            </div>
            
            <!-- Content -->
            <div class="ds-card">
                <div class="ds-card-header">
                    <h2 class="ds-card-title">Tytuł Sekcji</h2>
                </div>
                <div class="ds-card-body">
                    <p>Zawartość...</p>
                </div>
            </div>
        </div>
    </main>
    
    <!-- INCLUDE: layouts/footer.html -->
</body>
</html>
```

3. **Build:**
```bash
npm run build:html
```

4. **Gotowe!** Strona automatycznie będzie miała:
   - ✅ Spójne kolory z design tokens
   - ✅ Standardowe komponenty
   - ✅ Responsywność mobile
   - ✅ Dark mode support
   - ✅ Jednakowe animacje

---

## 🎨 JAK ZMIENIĆ KOLORY CAŁEGO SYSTEMU?

**Edytuj JEDEN plik:** `public/css/design-tokens.css`

```css
:root {
    /* Zmień primary color: */
    --ds-color-primary: #7c3aed;  /* Fioletowy zamiast zielonego */
    
    /* Zmień neutrals: */
    --ds-color-neutral-100: #fafafa;
    
    /* Zmień spacing: */
    --ds-space-4: 1.25rem;  /* Większe odstępy */
}
```

**Wszystkie komponenty automatycznie dostosują się!**

---

## ✅ KORZYŚCI Z WDROŻENIA

1. **Spójność** - Wszystkie strony wyglądają identycznie
2. **Szybkość** - Nowa strona w 5 minut
3. **Łatwość zmiany** - Kolory w jednym pliku
4. **Responsywność** - Mobile first approach
5. **Maintainability** - Łatwe w utrzymaniu
6. **Skalowalność** - Łatwe dodawanie nowych komponentów
7. **DRY Principle** - Brak duplikacji kodu
8. **Design System** - Dokumentowany, przewidywalny

---

## 🚀 CO DALEJ?

Po wdrożeniu podstawowego systemu możesz:

1. **Rozbudować bibliotekę komponentów** - Dodać więcej gotowych elementów
2. **Stworzyć Storybook** - Wizualną dokumentację komponentów
3. **Dodać testy wizualne** - Automatyczne sprawdzanie spójności
4. **Utworzyć theme switcher** - Różne motywy kolorystyczne
5. **Zintegrować z Figmą** - Design tokens eksportowane z Figmy

---

## 📊 PORÓWNANIE: PRZED vs PO

### PRZED:
```html
<!-- index.html -->
<style>
    .stat-card {
        background: white;
        padding: 24px;
        border-radius: 12px;
    }
</style>

<!-- wines.html -->
<style>
    .stat-card {
        background: #fff;
        padding: 20px;  /* ← Różne! -->
        border-radius: 8px;  /* ← Różne! -->
    }
</style>

<!-- collections.html -->
<style>
    .card {  /* ← Inna nazwa! -->
        background: white;
        padding: 1.5rem;  /* ← Różne jednostki! -->
        border-radius: 0.75rem;
    }
</style>
```

### PO:
```html
<!-- index.html -->
<div class="ds-stat-card">...</div>

<!-- wines.html -->
<div class="ds-stat-card">...</div>

<!-- collections.html -->
<div class="ds-stat-card">...</div>

<!-- Wszystkie używają TEGO SAMEGO komponentu z components.css! -->
```

---

## 🎯 PODSUMOWANIE

**Ten design system da Ci:**

1. ✅ **Pełną spójność** - Wszystkie elementy wyglądają tak samo
2. ✅ **Łatwe zarządzanie kolorami** - Jeden plik CSS
3. ✅ **Responsywność** - Mobile-first grid system
4. ✅ **Szybkość developmentu** - Nowa strona w minuty
5. ✅ **Zero duplikacji** - DRY principle
6. ✅ **Dark mode ready** - Automatyczna adaptacja
7. ✅ **Skalowelność** - Łatwo dodawać nowe komponenty

**Czy mam wdrożyć ten system?**
