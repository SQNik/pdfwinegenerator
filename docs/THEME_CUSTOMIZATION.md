# 🎨 Przewodnik Dostosowywania Wyglądu

## 📍 Gdzie zmieniać wygląd?

**Główny plik konfiguracji:** `public/css/theme-config.css`

W tym pliku możesz łatwo zmienić wszystkie aspekty wyglądu aplikacji bez dotykania kodu HTML lub innych plików CSS.

---

## 🎯 Najczęstsze zmiany

### 1. Zmiana koloru głównego

```css
/* public/css/theme-config.css - linia ~15 */

--theme-primary-color: #009634;           /* Zmień na swój kolor */
--theme-primary-hover: #007a2a;           /* Ciemniejszy odcień */
```

**Przykłady kolorów:**
- Niebieski: `#3b82f6`
- Fioletowy: `#8b5cf6`
- Czerwony: `#ef4444`
- Pomarańczowy: `#f97316`
- Różowy: `#ec4899`

### 2. Zmiana kolorów tła Hero (gradient)

```css
/* public/css/theme-config.css - linia ~32 */

--theme-hero-bg-start: #009634;           /* Lewo-góra */
--theme-hero-bg-end: #667eea;             /* Prawo-dół */
```

### 3. Zmiana zaokrągleń

```css
/* public/css/theme-config.css - linia ~69 */

/* Dla bardziej kwadratowego wyglądu */
--theme-radius-md: 0.25rem;               /* 4px zamiast 8px */

/* Dla bardziej zaokrąglonego wyglądu */
--theme-radius-md: 1rem;                  /* 16px zamiast 8px */
```

### 4. Zmiana odstępów

```css
/* public/css/theme-config.css - linia ~89 */

/* Bardziej kompaktowy wygląd */
--theme-space-md: 0.75rem;                /* Mniej miejsca */

/* Bardziej przestronny wygląd */
--theme-space-md: 1.5rem;                 /* Więcej miejsca */
```

### 5. Zmiana cieni (głębokość kart)

```css
/* public/css/theme-config.css - linia ~82 */

/* Płaski design (bez cieni) */
--theme-shadow-card: none;

/* Głębokie cienie */
--theme-shadow-card: 0 20px 40px rgba(0, 0, 0, 0.2);
```

---

## 🎨 Gotowe Style

### Styl 1: Niebieski Minimalista
```css
--theme-primary-color: #3b82f6;
--theme-hero-bg-start: #3b82f6;
--theme-hero-bg-end: #8b5cf6;
--theme-radius-md: 0.25rem;              /* Małe zaokrąglenia */
--theme-shadow-card: 0 1px 3px rgba(0,0,0,0.05);  /* Delikatne cienie */
```

### Styl 2: Fioletowy Elegancki
```css
--theme-primary-color: #8b5cf6;
--theme-hero-bg-start: #8b5cf6;
--theme-hero-bg-end: #ec4899;
--theme-radius-md: 1rem;                 /* Duże zaokrąglenia */
--theme-shadow-card: 0 10px 25px rgba(0,0,0,0.15);  /* Wyraźne cienie */
```

### Styl 3: Pomarańczowy Energiczny
```css
--theme-primary-color: #f97316;
--theme-hero-bg-start: #f97316;
--theme-hero-bg-end: #eab308;
--theme-radius-md: 0.75rem;
--theme-shadow-card: 0 4px 12px rgba(249,115,22,0.2);
```

### Styl 4: Ciemny Profesjonalny
```css
--theme-primary-color: #10b981;
--theme-hero-bg-start: #1f2937;
--theme-hero-bg-end: #374151;
--theme-bg-primary: #111827;             /* Ciemne tło */
--theme-text-primary: #f9fafb;           /* Jasny tekst */
```

---

## 📋 Kompletna lista zmiennych

### Kolory
| Zmienna | Domyślna wartość | Opis |
|---------|------------------|------|
| `--theme-primary-color` | `#009634` | Główny kolor |
| `--theme-success-color` | `#10b981` | Kolor sukcesu |
| `--theme-warning-color` | `#f59e0b` | Kolor ostrzeżeń |
| `--theme-error-color` | `#ef4444` | Kolor błędów |

### Tła
| Zmienna | Domyślna wartość | Opis |
|---------|------------------|------|
| `--theme-bg-primary` | `#ffffff` | Główne tło |
| `--theme-bg-secondary` | `#f9fafb` | Tło kart |
| `--theme-hero-bg-start` | `#009634` | Gradient start |
| `--theme-hero-bg-end` | `#667eea` | Gradient end |

### Tekst
| Zmienna | Domyślna wartość | Opis |
|---------|------------------|------|
| `--theme-text-primary` | `#111827` | Główny tekst |
| `--theme-text-secondary` | `#6b7280` | Tekst drugorzędny |
| `--theme-font-size-base` | `1rem` | Rozmiar tekstu |

### Zaokrąglenia
| Zmienna | Domyślna wartość | Opis |
|---------|------------------|------|
| `--theme-radius-sm` | `0.25rem` | Małe |
| `--theme-radius-md` | `0.5rem` | Średnie |
| `--theme-radius-lg` | `0.75rem` | Duże |

### Cienie
| Zmienna | Domyślna wartość | Opis |
|---------|------------------|------|
| `--theme-shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Mały |
| `--theme-shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Średni |
| `--theme-shadow-lg` | `0 10px 25px rgba(0,0,0,0.1)` | Duży |

### Odstępy
| Zmienna | Domyślna wartość | Opis |
|---------|------------------|------|
| `--theme-space-xs` | `0.5rem` (8px) | Bardzo małe |
| `--theme-space-sm` | `0.75rem` (12px) | Małe |
| `--theme-space-md` | `1rem` (16px) | Średnie |
| `--theme-space-lg` | `1.5rem` (24px) | Duże |
| `--theme-space-xl` | `2rem` (32px) | Bardzo duże |

---

## 🔧 Jak testować zmiany?

1. Otwórz `public/css/theme-config.css`
2. Zmień wybrane zmienne
3. Zapisz plik (Ctrl+S)
4. Odśwież stronę w przeglądarce (F5)
5. Zobacz efekt!

**Nie musisz restartować serwera!** Zmiany CSS są natychmiastowe.

---

## 💡 Wskazówki

### ✅ Dobre praktyki:
- Zmień tylko 1-2 rzeczy naraz, żeby zobaczyć efekt
- Zachowaj kopię oryginalnych wartości (zakomentuj je)
- Użyj narzędzi online do doboru kolorów (np. coolors.co)

### ❌ Czego unikać:
- Nie zmieniaj nazw zmiennych (np. `--theme-primary-color`)
- Nie usuwaj zmiennych (mogą być używane w wielu miejscach)
- Nie zmieniaj plików `design-tokens.css` ani `components.css`

---

## 🎯 Przykład: Zmiana całego motywu

**Krok 1:** Otwórz `public/css/theme-config.css`

**Krok 2:** Znajdź sekcję "KOLORY GŁÓWNE" (około linii 15)

**Krok 3:** Zmień wartości:
```css
/* PRZED */
--theme-primary-color: #009634;
--theme-hero-bg-start: #009634;
--theme-hero-bg-end: #667eea;

/* PO (np. fioletowy motyw) */
--theme-primary-color: #8b5cf6;
--theme-hero-bg-start: #8b5cf6;
--theme-hero-bg-end: #ec4899;
```

**Krok 4:** Zapisz i odśwież przeglądarkę

**Efekt:** Cała aplikacja zmieni się na fioletowy motyw! 🎉

---

## 🌓 Dark Mode

Aby włączyć ciemny motyw globalnie, dodaj do pliku `theme-config.css`:

```css
/* Na końcu pliku */
:root {
    /* Ustaw dark mode jako domyślny */
    --theme-bg-primary: #111827;
    --theme-bg-secondary: #1f2937;
    --theme-text-primary: #f9fafb;
    --theme-text-secondary: #d1d5db;
}
```

Lub w HTML dodaj:
```html
<html data-theme="dark">
```

---

## 📞 Potrzebujesz pomocy?

- Wszystkie zmienne są opisane w `public/css/theme-config.css`
- Każda sekcja ma komentarze wyjaśniające
- Wartości domyślne są zawsze podane

**Eksperymentuj!** Zawsze możesz wrócić do oryginalnych wartości.
