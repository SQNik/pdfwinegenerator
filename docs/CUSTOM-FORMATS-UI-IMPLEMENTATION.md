# Custom PDF Formats UI - Implementacja

## 📋 Data implementacji
23 października 2025

## 🎯 Cel
Dodanie kompletnego interfejsu użytkownika dla zarządzania niestandardowymi formatami PDF w template-editor-modern.html.

## ✅ Zaimplementowane funkcjonalności

### 1. **UI w lewym sidebarze**
Dodano nową kartę "Formaty PDF" w lewym panelu edytora szablonów:

**Lokalizacja:** `template-editor-modern.html` (po sekcji "Pola kolekcji")

**Elementy:**
- Nagłówek z tytułem "Formaty PDF"
- Przycisk "Dodaj format" (modern-admin style)
- Kontener na alerty (`customFormatsAlerts`)
- Kontener na listę formatów (`customFormatsSection`)

### 2. **Modal tworzenia/edycji formatu**
Dodano kompleksowy modal `customFormatModal` z formularzem:

**Sekcje formularza:**
- **Podstawowe informacje:**
  - Nazwa formatu (wymagane)
  - Opis (opcjonalne)

- **Wymiary strony:**
  - Szerokość (wymagane, number input)
  - Wysokość (wymagane, number input)
  - Jednostka (select: mm/pt/px/in)
  - Orientacja (select: pionowa/pozioma)

- **Marginesy:**
  - Góra, Prawo, Dół, Lewo (number inputs)
  - W jednostkach formatu

- **Status:**
  - Checkbox "Format aktywny"
  - Info text o widoczności w selektorach

- **Podgląd:**
  - Kolumna z podglądem w czasie rzeczywistym
  - Wizualizacja wymiarów i orientacji

### 3. **Style CSS (modern-admin.css compatible)**

Dodano dedykowane klasy:

**Karty formatów:**
- `.format-card` - główny kontener karty
- `.format-card-header` - nagłówek z tytułem i akcjami
- `.format-card-title` - tytuł formatu
- `.format-card-actions` - przyciski akcji (edytuj/usuń)
- `.format-card-btn` - przycisk akcji z hover effects
- `.format-card-body` - treść karty

**Specyfikacje:**
- `.format-card-specs` - kontener na specyfikacje
- `.format-card-spec` - pojedyncza specyfikacja (wymiary, orientacja, marginesy)
- `.format-card-description` - opis formatu

**Statusy:**
- `.format-card-badge.active` - zielona odznaka dla aktywnych
- `.format-card-badge.inactive` - szara odznaka dla nieaktywnych

**Efekty:**
- Hover effect z zieloną ramką i cieniem
- Transform translateY(-2px) przy hover
- Smooth transitions (var(--transition-fast))

### 4. **Aktualizacja CustomFormatsManager.js**

**Zmieniony kontener:**
- Ze `customFormatsList` na `customFormatsSection`

**Nowa metoda `renderFormatsList()`:**
- Używa Bootstrap Icons zamiast Font Awesome
- Modern-admin styling (green accents #009634)
- Kompaktowe karty z ikonami
- Empty state z centered content
- Onclick handlers używają `window.customFormatsManager`

**Empty state:**
```html
<div class="empty-state">
  <i class="bi bi-file-earmark-pdf"></i>
  <p>Brak formatów PDF</p>
  <p class="text-muted">Kliknij "Dodaj format"...</p>
</div>
```

**Karta formatu:**
```html
<div class="format-card">
  <div class="format-card-header">
    <div>
      <h6 class="format-card-title">Nazwa</h6>
      <span class="format-card-badge active">Aktywny</span>
    </div>
    <div class="format-card-actions">
      <button onclick="window.customFormatsManager.editFormat()">
        <i class="bi bi-pencil"></i>
      </button>
      <button onclick="window.customFormatsManager.deleteFormat()">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  </div>
  <div class="format-card-body">
    <div class="format-card-specs">
      <span><i class="bi bi-arrows-angle-expand"></i> 210 × 297 mm</span>
      <span><i class="bi bi-phone-landscape"></i> Pionowa</span>
    </div>
    <div class="format-card-specs">
      <span><i class="bi bi-border-outer"></i> 10/10/10/10 mm</span>
    </div>
  </div>
</div>
```

## 🎨 Design System Compliance

### Modern Admin CSS Variables
- `--color-accent` (#009634) - zielony akcent
- `--color-bg-primary` - tło główne
- `--color-bg-secondary` - tło drugorzędne
- `--color-border-light` - jasne ramki
- `--color-text-primary` - główny tekst
- `--color-text-secondary` - drugorzędny tekst
- `--color-text-tertiary` - trzeciego poziomu
- `--space-xs`, `--space-sm`, `--space-md` - odstępy
- `--radius-sm`, `--radius-md`, `--radius-xl` - zaokrąglenia
- `--transition-fast` - szybkie przejścia

### Bootstrap Icons
Użyte ikony:
- `bi-file-earmark-pdf` - ikona PDF
- `bi-pencil` - edycja
- `bi-trash` - usuwanie
- `bi-check-circle` - status aktywny
- `bi-x-circle` - status nieaktywny
- `bi-arrows-angle-expand` - wymiary
- `bi-phone-landscape` - orientacja
- `bi-border-outer` - marginesy
- `bi-plus-lg` - dodawanie
- `bi-check-lg` - zapisywanie
- `bi-info-circle` - informacje
- `bi-eye` - podgląd

## 🔧 Backend Integration

### Istniejące API endpoints (już działają):
- `GET /api/custom-formats` - lista wszystkich formatów
- `GET /api/custom-formats/:id` - szczegóły formatu
- `POST /api/custom-formats` - utworzenie nowego formatu
- `PUT /api/custom-formats/:id` - aktualizacja formatu
- `DELETE /api/custom-formats/:id` - usunięcie formatu
- `GET /api/custom-formats/validate-name/:name` - walidacja nazwy

### DataStore methods (już zaimplementowane):
- `createCustomFormat(format)`
- `updateCustomFormat(id, updates)`
- `deleteCustomFormat(id)`
- `getCustomFormats()`
- `getCustomFormatById(id)`
- `getActiveCustomFormats()`

### Storage:
- Plik: `data/custom-pdf-formats.json`
- Backup: `data/custom-pdf-formats.json.backup`
- Format: Array<CustomPDFFormat>

## 📁 Zmodyfikowane pliki

1. **public/template-editor-modern.html**
   - Dodano sekcję "Formaty PDF" w lewym sidebarze
   - Dodano modal `customFormatModal`
   - Dodano style CSS dla kart formatów

2. **public/js/components/CustomFormatsManager.js**
   - Zmieniono kontener z `customFormatsList` na `customFormatsSection`
   - Zaktualizowano metodę `renderFormatsList()` do modern-admin styling
   - Zmieniono ikony z Font Awesome na Bootstrap Icons
   - Dodano empty state styling

## 🚀 Jak używać

### 1. Dodawanie nowego formatu:
1. Kliknij "Dodaj format" w sekcji "Formaty PDF"
2. Wypełnij formularz (nazwa, wymiary, marginesy)
3. Obserwuj podgląd w prawej kolumnie
4. Kliknij "Zapisz format"

### 2. Edycja formatu:
1. Kliknij ikonę ołówka na karcie formatu
2. Modyfikuj pola w formularzu
3. Kliknij "Zapisz format"

### 3. Usuwanie formatu:
1. Kliknij ikonę kosza na karcie formatu
2. Potwierdź w dialogu
3. Format zostanie usunięty

### 4. Status formatu:
- **Aktywny** (zielona odznaka) - format widoczny w selektorach
- **Nieaktywny** (szara odznaka) - format ukryty, ale nie usunięty

## ✨ Cechy UI

### Responsywność:
- Karty automatycznie dostosowują się do szerokości kontenera
- Modal ma dwie kolumny: formularz + podgląd
- Mobile-friendly design

### Accessibility:
- Proper ARIA attributes
- Keyboard navigation support
- Focus management w modalu
- Semantic HTML structure

### UX Features:
- Real-time preview podczas edycji wymiarów
- Walidacja formularza z feedbackiem
- Confirm dialog przed usunięciem
- Success/error alerts
- Smooth animations i transitions
- Hover effects na kartach i przyciskach

### Integracja:
- CustomFormatsManager inicjalizowany automatycznie przez TemplateEditor.js
- Global instance: `window.customFormatsManager`
- Event-driven architecture
- Automatic backup on modifications

## 🔍 Testing Checklist

- [x] UI sekcji renderuje się poprawnie
- [x] Przycisk "Dodaj format" otwiera modal
- [x] Formularz ma wszystkie pola
- [x] Podgląd aktualizuje się w czasie rzeczywistym
- [x] Zapisywanie formatu działa (API calls)
- [x] Edycja formatu działa
- [x] Usuwanie formatu z potwierdzeniem działa
- [x] Empty state wyświetla się gdy brak formatów
- [x] Karty formatów mają proper styling
- [x] Hover effects działają
- [x] Bootstrap Icons renderują się
- [x] Modern-admin colors stosowane
- [x] Modal backdrop cleanup po zamknięciu

## 📝 Notatki techniczne

### Container ID changes:
- **Stary:** `customFormatsList`
- **Nowy:** `customFormatsSection`

Dlaczego?
- Lepsza semantyka (section > list)
- Spójność z innymi sekcjami
- Jasne oddzielenie od `customFormatsAlerts`

### Icon migration:
- **Stary:** Font Awesome (`fas fa-*`)
- **Nowy:** Bootstrap Icons (`bi bi-*`)

Dlaczego?
- Spójność z resztą aplikacji
- Lżejsze biblioteki (tylko Bootstrap Icons)
- Modern design language

### Onclick handlers:
- **Stary:** `customFormatsManager.editFormat()`
- **Nowy:** `window.customFormatsManager.editFormat()`

Dlaczego?
- Explicit global reference
- Prevents undefined errors
- Better debugging

## 🎉 Rezultat

**Kompletny, production-ready UI dla zarządzania niestandardowymi formatami PDF:**
- ✅ Modern, spójny design (zielony akcent #009634)
- ✅ Intuicyjna obsługa (dodaj/edytuj/usuń)
- ✅ Real-time preview
- ✅ Pełna walidacja
- ✅ Responsive layout
- ✅ Accessibility compliant
- ✅ Backend integration ready
- ✅ Error handling i alerting
- ✅ Smooth animations
- ✅ Empty states

**Zero błędów w konsoli, zero konfliktów ze stylami, pełna integracja z istniejącym systemem.**
