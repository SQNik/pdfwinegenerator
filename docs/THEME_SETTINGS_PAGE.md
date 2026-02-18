# Ustawienia Wyglądu - Dokumentacja

## Przegląd

Nowa strona **Ustawienia Wyglądu** (`theme-settings.html`) umożliwia łatwe dostosowanie wyglądu całej aplikacji poprzez graficzny interfejs użytkownika.

## Dostęp

Strona jest dostępna poprzez ikonę koła zębatego (⚙️) w nagłówku każdej podstrony:
- Dashboard (`index.html`)
- Wina (`wines.html`)
- Kolekcje (`collections.html`)

## Funkcjonalności

### 1. Gotowe Motywy
6 predefiniowanych motywów gotowych do natychmiastowego użycia:
- **Zielony (Domyślny)** - obecny wygląd aplikacji
- **Niebieski Minimalista** - czysty, płaski design
- **Fioletowy Elegancki** - wyraźne cienie i głębia
- **Pomarańczowy Energiczny** - ciepłe, żywe kolory
- **Turkusowy Świeży** - nowoczesny, chłodny wygląd
- **Różowy Nowoczesny** - odważny, modny styl

### 2. Personalizacja Kolorów
- **Kolor główny**: Zmiana koloru primary (przyciski, linki, akcenty)
- **Gradient Hero**: Dostosowanie gradientu w sekcji hero
- **Paleta szybkiego wyboru**: 12 popularnych kolorów do natychmiastowego użycia
- **Pełna paleta kolorów**: Dowolny kolor poprzez color picker

### 3. Zaokrąglenia
5 poziomów zaokrągleń elementów:
- Brak (kwadratowe - 0px)
- Małe (4px)
- Średnie (8px) - domyślne
- Duże (12px)
- Bardzo duże (16px)

### 4. Cienie i Głębia
5 poziomów intensywności cieni:
- Brak (płaski design)
- Bardzo delikatne
- Średnie - domyślne
- Wyraźne
- Bardzo wyraźne

### 5. Odstępy
3 poziomy gęstości layoutu:
- Kompaktowy (małe odstępy)
- Normalny - domyślne
- Przestronny (duże odstępy)

### 6. Typografia
3 rozmiary tekstu:
- Mały (14px)
- Normalny (16px) - domyślne
- Duży (18px)

### 7. Podgląd na Żywo
Panel po prawej stronie pokazuje natychmiastowy podgląd zmian:
- Przyciski (Primary, Secondary, Ghost)
- Karty
- Znaczniki (Success, Warning, Error)
- Pola formularzy
- Hero Section z gradientem

## Zapisywanie Ustawień

### Przycisk "Zapisz zmiany"
- Zapisuje wszystkie ustawienia w `localStorage` przeglądarki
- Ustawienia są zachowane nawet po zamknięciu przeglądarki
- Stosowane automatycznie na wszystkich stronach aplikacji

### Przycisk "Przywróć domyślne"
- Przywraca oryginalne ustawienia aplikacji
- Czyści zapisane preferencje z `localStorage`
- Wymaga potwierdzenia

## Architektura Techniczna

### theme-loader.js
Skrypt automatycznie ładowany na każdej stronie:
```javascript
// Ładuje zapisane ustawienia z localStorage
// Aplikuje zmienne CSS do dokumentu
// Synchronizuje zmiany między kartami przeglądarki
```

Dodany do:
- `index.html`
- `wines.html`
- `collections.html`

### Mapowanie Ustawień → CSS
```javascript
{
    primaryColor → --theme-primary-color
    heroGradientStart → --theme-hero-bg-start
    heroGradientEnd → --theme-hero-bg-end
    borderRadius → --theme-radius-md
    shadowIntensity → --theme-shadow-card
    spacing → --theme-space-md
    fontSize → --theme-font-size-base
}
```

### Przepływ Danych
1. Użytkownik zmienia ustawienia na `theme-settings.html`
2. JavaScript aktualizuje CSS custom properties (`--theme-*`)
3. Podgląd na żywo natychmiast pokazuje zmiany
4. Przycisk "Zapisz" → `localStorage.setItem('themeSettings', JSON.stringify(...))`
5. `theme-loader.js` na innych stronach → `localStorage.getItem('themeSettings')`
6. Automatyczna aplikacja ustawień przy każdym załadowaniu strony

### Synchronizacja Między Kartami
```javascript
window.addEventListener('storage', function(e) {
    if (e.key === 'themeSettings') {
        loadThemeSettings();
    }
});
```
Gdy użytkownik zmieni ustawienia w jednej karcie, wszystkie inne karty automatycznie się zaktualizują.

## Pliki

### Utworzone
- `public/theme-settings.html` - strona GUI ustawień (~550 linii)
- `public/js/theme-loader.js` - skrypt automatycznego ładowania (~50 linii)

### Zmodyfikowane
- `public/index.html` - dodano ikonę ⚙️ w nagłówku + theme-loader.js
- `public/wines.html` - dodano theme-loader.js (ikona już była)
- `public/collections.html` - dodano theme-loader.js (ikona już była)

## Użycie

### Zmiana Koloru Głównego
1. Kliknij ikonę ⚙️ w nagłówku
2. W sekcji "Kolory" kliknij color picker lub wybierz z palety
3. Zobacz podgląd na żywo po prawej stronie
4. Kliknij "Zapisz zmiany"
5. Odśwież dowolną stronę - nowy kolor wszędzie!

### Zastosowanie Gotowego Motywu
1. Kliknij ikonę ⚙️ w nagłówku
2. W sekcji "Gotowe motywy" kliknij wybrany motyw
3. Zobacz podgląd zmian
4. Kliknij "Zapisz zmiany"

### Tworzenie Własnego Stylu
1. Zacznij od gotowego motywu (opcjonalnie)
2. Dostosuj kolory, zaokrąglenia, cienie
3. Zmień odstępy i rozmiar tekstu
4. Obserwuj podgląd na żywo
5. Zapisz gdy jesteś zadowolony

## Zgodność

### Przeglądarki
- Chrome/Edge: ✅ Pełne wsparcie
- Firefox: ✅ Pełne wsparcie
- Safari: ✅ Pełne wsparcie
- Opera: ✅ Pełne wsparcie

### localStorage
- Wymaga włączonego localStorage
- Brak ciasteczek - wszystko lokalne
- Dane nie są wysyłane na serwer

### CSS Custom Properties
- Wykorzystuje natywne zmienne CSS (`--theme-*`)
- Automatyczne mapowanie do `--ds-*` design tokens
- Pełna kompatybilność z istniejącym Design System 2.0

## Troubleshooting

### Zmiany nie są zapisywane
- Sprawdź czy localStorage jest włączony
- Sprawdź konsolę przeglądarki (F12) pod kątem błędów
- Upewnij się że kliknąłeś "Zapisz zmiany"

### Zmiany nie pojawiają się na innych stronach
- Upewnij się że zapisałeś zmiany
- Odśwież stronę (F5)
- Sprawdź czy theme-loader.js się załadował (Console → sieć)

### Przywracanie ustawień
1. Kliknij "Przywróć domyślne" na stronie ustawień
2. LUB usuń ręcznie: `localStorage.removeItem('themeSettings')` w konsoli

## Przykłady Użycia

### Ciemny Profesjonalny Motyw
```javascript
{
    primaryColor: '#3b82f6',
    heroGradientStart: '#1e293b',
    heroGradientEnd: '#334155',
    borderRadius: '0.25rem',
    shadowIntensity: 'none',
    spacing: '1rem',
    fontSize: '0.875rem'
}
```

### Jasny Przestronny Motyw
```javascript
{
    primaryColor: '#14b8a6',
    heroGradientStart: '#14b8a6',
    heroGradientEnd: '#06b6d4',
    borderRadius: '1rem',
    shadowIntensity: '0 20px 40px rgba(0,0,0,0.15)',
    spacing: '1.5rem',
    fontSize: '1.125rem'
}
```

## Przyszłe Rozszerzenia

Potencjalne funkcje do dodania:
- Export/Import motywów (JSON)
- Galeria motywów społeczności
- Zaawansowane ustawienia typografii (fonty)
- Dostosowanie dark mode
- Ustawienia animacji i przejść
- Predefiniowane palety kolorów (Material, Tailwind, itp.)

## Podsumowanie

✅ **Stworzono**: Dedykowana strona GUI do zarządzania wyglądem  
✅ **Ikona**: Koło zębate (⚙️) w nagłówku wszystkich stron  
✅ **Automatyzacja**: theme-loader.js ładuje ustawienia na każdej stronie  
✅ **Podgląd**: Na żywo przy każdej zmianie  
✅ **Persist**: localStorage zapisuje preferencje  
✅ **Synchronizacja**: Między kartami przeglądarki  
✅ **6 gotowych motywów**: Gotowe do użycia  
✅ **Pełna personalizacja**: Kolory, zaokrąglenia, cienie, odstępy, tekst  

System jest w pełni funkcjonalny i gotowy do użycia! 🎨
