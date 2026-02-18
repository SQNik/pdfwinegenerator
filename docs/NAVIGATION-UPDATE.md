# 🧭 Aktualizacja: Komponent Nawigacji

**Data:** 22.11.2025  
**Wersja:** 2.1.0  
**Status:** ✅ Gotowe do wdrożenia

## 📦 Co zostało dodane?

### 1. Nowy komponent nawigacji
**Lokalizacja:** `public/components/navigation.html`

**Funkcje:**
- ✅ Responsywny design (desktop + mobile)
- ✅ Hamburger menu dla urządzeń mobilnych
- ✅ Dynamiczne ładowanie logo z API
- ✅ Konfigurowalne kolory z ustawień wyglądu
- ✅ Automatyczne podświetlanie aktywnej strony
- ✅ Płynne animacje CSS
- ✅ Auto-close menu po kliknięciu

### 2. Skrypt ładujący
**Lokalizacja:** `public/js/navigation-loader.js`

**Zadanie:** Automatyczne ładowanie komponentu nawigacji na każdej stronie

### 3. Przykładowa strona
**Lokalizacja:** `public/example-page.html`

**Demonstracja:** Pokazuje jak używać nowego komponentu

### 4. Dokumentacja
**Lokalizacja:** `docs/NAVIGATION-COMPONENT.md`

**Zawartość:** Pełna instrukcja użycia i konfiguracji

---

## 🚀 Jak używać?

### Metoda 1: Automatyczne ładowanie (zalecane)

W każdym pliku HTML dodaj:

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Twoja Strona</title>
</head>
<body>
    <!-- Placeholder dla nawigacji -->
    <div id="navigation-placeholder"></div>

    <!-- Treść strony -->
    <main>
        <h1>Witaj!</h1>
    </main>

    <!-- Załaduj nawigację -->
    <script src="/js/navigation-loader.js"></script>
</body>
</html>
```

### Metoda 2: Bezpośrednie załączenie

```html
<script>
    fetch('/components/navigation.html')
        .then(res => res.text())
        .then(html => {
            const div = document.createElement('div');
            div.innerHTML = html;
            document.body.insertBefore(div.firstElementChild, document.body.firstChild);
        });
</script>
```

---

## ⚙️ Konfiguracja w ustawieniach

Nawigacja automatycznie ładuje ustawienia z endpointu `/api/settings/appearance`.

### Wymagana struktura JSON:

```json
{
  "logo": {
    "type": "text",          // "text" lub "image"
    "text": "Wine Management",
    "imageUrl": "/uploads/logo.png"
  },
  "navigation": {
    "backgroundColor": "#2c3e50",
    "textColor": "#ffffff",
    "hoverBackgroundColor": "#34495e",
    "hoverTextColor": "#ecf0f1",
    "activeBackgroundColor": "#1abc9c",
    "activeTextColor": "#ffffff"
  }
}
```

### Pola konfiguracyjne:

#### Logo
- `logo.type` - typ: `"text"` (tekst) lub `"image"` (obraz)
- `logo.text` - tekst logo (gdy type = "text")
- `logo.imageUrl` - URL obrazu (gdy type = "image")

#### Kolory nawigacji
- `navigation.backgroundColor` - tło nawigacji
- `navigation.textColor` - kolor tekstu linków
- `navigation.hoverBackgroundColor` - tło przy najechaniu
- `navigation.hoverTextColor` - tekst przy najechaniu
- `navigation.activeBackgroundColor` - tło aktywnej strony
- `navigation.activeTextColor` - tekst aktywnej strony

---

## 📱 Responsywność

### Desktop (> 768px)
```
┌─────────────────────────────────────────────┐
│ [Logo]          [Link1] [Link2] [Link3]    │
└─────────────────────────────────────────────┘
```

**Cechy:**
- Menu poziome
- Linki po prawej
- Logo po lewej
- Hover effects

### Mobile (≤ 768px)
```
┌─────────────────────────────────────────────┐
│ [Logo]                            [☰]       │
└─────────────────────────────────────────────┘

Gdy otwarte:
┌─────────────────────────────────────────────┐
│ [Logo]                            [✕]       │
├─────────────────────────────────────────────┤
│ Link 1                                      │
│ Link 2                                      │
│ Link 3                                      │
└─────────────────────────────────────────────┘
```

**Cechy:**
- Hamburger icon (☰)
- Menu rozwijane z animacją
- Linki pionowo
- Auto-close po kliknięciu
- Touch-friendly

---

## 🎨 Dostosowywanie linków

Edytuj plik `public/components/navigation.html`:

```html
<ul class="nav-menu" id="nav-menu">
    <li class="nav-item">
        <a href="/" class="nav-link">Dashboard</a>
    </li>
    <li class="nav-item">
        <a href="/wines.html" class="nav-link">Wina</a>
    </li>
    <!-- Dodaj nowe linki tutaj -->
    <li class="nav-item">
        <a href="/new-page.html" class="nav-link">Nowa Strona</a>
    </li>
</ul>
```

---

## 🔧 Integracja z istniejącymi stronami

### 1. index.html
✅ **Zaktualizowane** - Usunięto starą nawigację, dodano nowy komponent

### 2. Inne strony HTML
Wymagana aktualizacja:

**Przed:**
```html
<header>
    <nav>
        <!-- Stara nawigacja -->
    </nav>
</header>
```

**Po:**
```html
<div id="navigation-placeholder"></div>
<script src="/js/navigation-loader.js"></script>
```

---

## 📋 Checklist wdrożenia

- [ ] Skopiować pliki na serwer:
  - `public/components/navigation.html`
  - `public/js/navigation-loader.js`
  
- [ ] Zaktualizować istniejące strony HTML:
  - Usunąć starą nawigację
  - Dodać `<div id="navigation-placeholder"></div>`
  - Dodać `<script src="/js/navigation-loader.js"></script>`

- [ ] Skonfigurować ustawienia wyglądu:
  - Przejść do `/settings.html`
  - Sekcja "Wygląd"
  - Ustawić logo (tekst lub obraz)
  - Ustawić kolory nawigacji

- [ ] Przetestować:
  - Desktop view (> 768px)
  - Mobile view (< 768px)
  - Hamburger menu działa
  - Linki przekierowują poprawnie
  - Logo ładuje się z API
  - Kolory aplikują się poprawnie

---

## 🧪 Testowanie

### Test 1: Ładowanie komponentu
```javascript
// W konsoli przeglądarki:
const nav = document.getElementById('main-navigation');
console.log(nav ? '✅ Nawigacja załadowana' : '❌ Brak nawigacji');
```

### Test 2: API settings
```bash
curl http://localhost:3001/api/settings/appearance
```

Powinno zwrócić JSON z ustawieniami logo i navigation.

### Test 3: Responsywność
1. Otwórz DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Sprawdź różne rozmiary:
   - iPhone SE (375px) - hamburger
   - iPad (768px) - hamburger
   - Desktop (1024px) - poziome menu

---

## 🐛 Rozwiązywanie problemów

### Problem: Nawigacja się nie ładuje
**Przyczyna:** Brak pliku lub błędna ścieżka

**Rozwiązanie:**
```bash
# Sprawdź czy plik istnieje
ls public/components/navigation.html
ls public/js/navigation-loader.js

# Sprawdź console w przeglądarce (F12)
```

### Problem: Logo nie pojawia się
**Przyczyna:** Brak konfiguracji w API

**Rozwiązanie:**
```bash
# Sprawdź endpoint
curl http://localhost:3001/api/settings/appearance

# Powinien zwrócić obiekt z logo.type, logo.text lub logo.imageUrl
```

### Problem: Menu mobilne nie działa
**Przyczyna:** Konflikt JavaScript

**Rozwiązanie:**
```javascript
// W konsoli sprawdź błędy
console.error

// Sprawdź czy nie ma duplikatów ID
document.querySelectorAll('#nav-toggle').length // Powinno być 1
```

### Problem: Kolory się nie zmieniają
**Przyczyna:** CSS specificity lub brak danych z API

**Rozwiązanie:**
```javascript
// Sprawdź czy CSS variables są ustawione
const nav = document.querySelector('.main-nav');
console.log(getComputedStyle(nav).getPropertyValue('--nav-bg-color'));
```

---

## 📊 Wydajność

### Metryki
- **Rozmiar komponentu:** ~8KB (HTML + CSS + JS inline)
- **Ładowanie:** Asynchroniczne, nie blokuje renderowania
- **Cache:** Przeglądarka cache'uje component
- **API calls:** 1 request do `/api/settings/appearance`

### Optymalizacje
- Inline CSS dla szybszego renderowania
- Event delegation zamiast wielu listenerów
- Throttled API calls
- Lazy loading theme settings

---

## 🔒 Bezpieczeństwo

### Zabezpieczenia
- ✅ Brak `innerHTML` z user input
- ✅ CORS headers dla API
- ✅ CSP friendly (Content Security Policy)
- ✅ Sanityzacja HTML przy ładowaniu
- ✅ Brak `eval()` czy `Function()`

---

## 📚 Dodatkowe zasoby

### Dokumentacja
- `docs/NAVIGATION-COMPONENT.md` - Pełna dokumentacja
- `public/example-page.html` - Przykład użycia

### Pliki źródłowe
- `public/components/navigation.html` - Komponent
- `public/js/navigation-loader.js` - Loader

---

## 🎯 Przyszłe ulepszenia

- [ ] Dropdown submenu (zagnieżdżone linki)
- [ ] Ikony w linkach (Font Awesome/Bootstrap Icons)
- [ ] Wyszukiwarka w nawigacji
- [ ] Dark mode toggle
- [ ] Sticky navigation z hide-on-scroll
- [ ] Breadcrumbs integration
- [ ] Keyboard navigation (Tab, Escape, Enter)
- [ ] ARIA labels dla accessibility

---

**Pytania?** Sprawdź dokumentację w `docs/NAVIGATION-COMPONENT.md`
