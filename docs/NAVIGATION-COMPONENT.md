# 🧭 Komponent Nawigacji

## Przegląd

Responsywny komponent nawigacji, który automatycznie ładuje ustawienia wyglądu z backendu i dostosowuje się do różnych rozmiarów ekranu.

## Struktura plików

```
public/
├── components/
│   └── navigation.html          # Główny komponent nawigacji
└── js/
    └── navigation-loader.js     # Skrypt ładujący nawigację
```

## Funkcjonalności

### ✅ Desktop (>768px)
- Linki wyświetlane poziomo
- Logo po lewej stronie
- Menu po prawej stronie
- Hover effects na linkach

### ✅ Mobile (≤768px)
- Hamburger menu po prawej
- Logo po lewej
- Menu rozwijane z animacją slide
- Linki ułożone pionowo
- Automatyczne zamykanie po kliknięciu linku
- Zamykanie po kliknięciu poza menu

### ✅ Dynamiczne ustawienia
- Logo (obraz lub tekst)
- Kolory tła nawigacji
- Kolory tekstu
- Kolory hover
- Kolory aktywnej strony

## Użycie

### Metoda 1: Placeholder (Zalecana)

W pliku HTML dodaj placeholder i załaduj skrypt:

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Moja Strona</title>
</head>
<body>
    <!-- Placeholder dla nawigacji -->
    <div id="navigation-placeholder"></div>

    <!-- Reszta zawartości strony -->
    <main>
        <h1>Witaj!</h1>
    </main>

    <!-- Załaduj komponent nawigacji -->
    <script src="/js/navigation-loader.js"></script>
</body>
</html>
```

## Konfiguracja w ustawieniach wyglądu

Nawigacja automatycznie ładuje ustawienia z endpointu `/api/settings/appearance`.

### Przykładowa struktura ustawień:

```json
{
  "logo": {
    "type": "text",
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

## Dostosowywanie linków

Aby dodać lub usunąć linki, edytuj sekcję `<ul class="nav-menu">` w pliku `navigation.html`:

```html
<ul class="nav-menu" id="nav-menu">
    <li class="nav-item">
        <a href="/" class="nav-link">Dashboard</a>
    </li>
    <li class="nav-item">
        <a href="/wines.html" class="nav-link">Wina</a>
    </li>
    <!-- Dodaj nowe linki tutaj -->
</ul>
```

## Responsive Breakpoints

- **Desktop**: > 768px - menu poziome
- **Tablet**: 769px - 1024px - zmniejszone padding
- **Mobile**: ≤ 768px - hamburger menu
- **Small Mobile**: ≤ 480px - zmniejszone logo i padding

---

**Data utworzenia:** 22.11.2025  
**Wersja:** 1.0.0
