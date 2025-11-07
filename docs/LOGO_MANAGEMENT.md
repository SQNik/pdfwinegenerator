# Logo Management System

## 📋 Przegląd

System zarządzania logo pozwala na wgranie własnego logo (PNG, SVG, JPG) które wyświetla się w nagłówku wszystkich stron modern aplikacji.

## ✨ Funkcjonalności

- **Wgrywanie logo**: PNG, SVG, JPG (max 2MB)
- **Automatyczne wyświetlanie**: Logo pojawia się we wszystkich podstronach modern
- **Lokalne przechowywanie**: Logo zapisywane w localStorage przeglądarki
- **Podgląd na żywo**: Natychmiastowy podgląd przed zapisaniem
- **Łatwe usuwanie**: Przycisk do przywrócenia domyślnej ikony

## 🎯 Jak używać

### 1. Otwórz modal zarządzania logo
Kliknij ikonę obrazka (🖼️) w prawym górnym rogu nagłówka na dowolnej stronie modern.

### 2. Wgraj logo
- Kliknij "Wybierz plik" lub przeciągnij plik
- Obsługiwane formaty: PNG, SVG, JPG
- Maksymalny rozmiar: 2MB
- Zalecane proporcje: kwadratowe (512x512px)

### 3. Podgląd
Po wyborze pliku zobaczysz podgląd jak logo będzie wyglądać w nagłówku.

### 4. Logo zapisuje się automatycznie
Nie trzeba klikać "Zapisz" - logo zapisuje się automatycznie po wybraniu pliku.

### 5. Usuwanie logo
Kliknij przycisk "Usuń Logo" aby przywrócić domyślną ikonę.

## 🔧 Szczegóły techniczne

### Pliki

- **`public/js/branding.js`** - Główny skrypt zarządzający logo
- **`public/css/modern-admin.css`** - Style dla ikony logo (.modern-brand-icon)
- **`public/images/branding/`** - Folder na pliki brandingowe (opcjonalny)

### Przechowywanie

Logo jest zapisywane jako Base64 Data URL w `localStorage`:
```javascript
localStorage.setItem('app_custom_logo', dataUrl);
```

### Klasy CSS

- `.modern-brand-icon` - Kontener dla logo/ikony
- `.modern-brand-icon.has-logo` - Ukrywa domyślną ikonę gdy logo jest wgrane
- `.modern-brand-icon img` - Style dla wgranego logo

### Inicjalizacja

Na każdej stronie modern:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    BrandingManager.initModal();
});
```

## 📱 Responsywność

Logo automatycznie skaluje się do rozmiaru 36x36px zachowując proporcje obrazu.

## ⚠️ Uwagi

1. **Rozmiar pliku**: Większe pliki (>500KB) mogą spowalniać ładowanie strony
2. **Przechowywanie**: Logo jest zapisane lokalnie w przeglądarce, nie na serwerze
3. **Formaty SVG**: Najlepsze dla logo - małe pliki, skalowanie bez utraty jakości
4. **Czyszczenie cache**: Czyszczenie localStorage usunie zapisane logo

## 🎨 Zalecenia

- **Format**: SVG dla logo z grafiką wektorową, PNG dla zdjęć/logotypów z gradientami
- **Rozmiar**: 512x512px lub proporcjonalny
- **Tło**: Przezroczyste dla logo z nietypowym kształtem
- **Kontrast**: Logo powinno być widoczne na białym tle

## 🔄 Synchronizacja między stronami

Logo jest automatycznie synchronizowane między wszystkimi stronami modern dzięki localStorage:
- index-modern.html
- wines-modern.html
- collections-modern.html
- template-editor-modern.html

## 🛠️ Rozszerzenia

Aby dodać funkcję logo do nowej strony:

1. Dodaj link do skryptu:
```html
<script src="js/branding.js"></script>
```

2. Dodaj przycisk w nagłówku:
```html
<button class="modern-btn modern-btn-ghost" data-bs-toggle="modal" data-bs-target="#logoUploadModal" title="Zarządzaj logo">
    <i class="bi bi-image"></i>
</button>
```

3. Zainicjalizuj w skrypcie strony:
```javascript
document.addEventListener('DOMContentLoaded', function() {
    BrandingManager.initModal();
});
```
