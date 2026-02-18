# System Persystencji Ustawień Motywu

## Przegląd

System zapisuje wszystkie ustawienia motywu na serwerze w plikach, dzięki czemu **nie znikają po wyczyszczeniu cache przeglądarki**.

## Struktura

### Backend (API)

**Controller**: `src/controllers/themeSettingsController.ts`
- `getSettings()` - Pobierz aktualne ustawienia
- `updateSettings()` - Zaktualizuj ustawienia
- `uploadLogo()` - Prześlij plik logo
- `deleteLogo()` - Usuń logo
- `resetSettings()` - Przywróć domyślne

**Routes**: `src/routes/themeSettings.ts`
- `GET /api/theme-settings` - Pobierz ustawienia
- `PUT /api/theme-settings` - Zaktualizuj ustawienia
- `POST /api/theme-settings/upload-logo` - Prześlij logo (multipart/form-data)
- `DELETE /api/theme-settings/logo` - Usuń logo
- `POST /api/theme-settings/reset` - Reset do domyślnych

**Zarejestrowane w**: `src/app.ts` (linia ~180)

### Frontend

**GUI**: `public/theme-settings.html`
- Formularze edycji ustawień
- Upload logo przez FormData
- Wszystkie funkcje używają `fetch()` do komunikacji z API

**Auto-loader**: `public/js/theme-loader.js`
- Automatyczne ładowanie ustawień z API przy starcie strony
- Odświeżanie co 30 sekund (synchronizacja między kartami)
- Aplikuje CSS variables, custom CSS i branding

### Przechowywanie Danych

**Plik JSON**: `data/theme-settings.json`
```json
{
  "primaryColor": "#10b981",
  "heroGradientStart": "#10b981",
  "heroGradientEnd": "#059669",
  "borderRadius": "8px",
  "shadowIntensity": "medium",
  "spacing": "normal",
  "fontSize": "medium",
  "customCSS": "",
  "appName": "Katalog Win",
  "appLogoUrl": "/uploads/branding/logo-1234567890.png",
  "appIcon": "bi-wine",
  "updatedAt": "2025-11-19T18:54:26.000Z"
}
```

**Pliki logo**: `public/uploads/branding/`
- Automatyczne generowanie nazwy: `logo-{timestamp}.{ext}`
- Dozwolone formaty: PNG, JPG, SVG
- Maksymalny rozmiar: 2MB
- Stare logo jest automatycznie usuwane przy uploading nowego

## Workflow Użytkownika

### 1. Edycja ustawień
```
theme-settings.html
  ↓ (użytkownik zmienia kolory)
  ↓ (klika "Zapisz ustawienia")
  ↓
PUT /api/theme-settings
  ↓
data/theme-settings.json (zapisane)
```

### 2. Upload logo
```
theme-settings.html
  ↓ (użytkownik wybiera plik)
  ↓ (FormData z plikiem)
  ↓
POST /api/theme-settings/upload-logo
  ↓
Multer middleware
  ↓
public/uploads/branding/logo-1732041266000.png
  ↓
data/theme-settings.json (zaktualizowane z logoUrl)
```

### 3. Ładowanie na każdej stronie
```
index.html / wines.html / collections.html
  ↓
<script src="/js/theme-loader.js">
  ↓
GET /api/theme-settings
  ↓
Aplikuje CSS variables + custom CSS + branding
```

## Zalety Systemu

✅ **Trwałość danych**
- Ustawienia nie znikają po wyczyszczeniu cache
- Logo przechowywane jako plik na serwerze

✅ **Synchronizacja**
- Odświeżanie co 30 sekund
- Zmiany widoczne na wszystkich kartach

✅ **Bezpieczeństwo**
- Walidacja typu pliku (PNG/JPG/SVG)
- Limit rozmiaru (2MB)
- Automatyczne usuwanie starych logo

✅ **Backup-friendly**
- Jeden plik JSON do backupu
- Folder uploads/ łatwo kopiować

✅ **RESTful API**
- Standardowe metody HTTP
- JSON response z success/error
- Łatwe do testowania

## Migracja ze starego systemu

Stary system (localStorage) już nie jest używany. Jeśli użytkownik miał zapisane ustawienia w localStorage, muszą je ponownie skonfigurować w GUI.

**Opcjonalnie**: Można dodać jednorazową migrację w `theme-loader.js`:

```javascript
// One-time migration from localStorage to API
const oldSettings = localStorage.getItem('themeSettings');
if (oldSettings) {
    fetch('/api/theme-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: oldSettings
    }).then(() => {
        localStorage.removeItem('themeSettings');
        console.log('✅ Migrated settings from localStorage to server');
    });
}
```

## Testing

### Manualny test workflow:

1. **Otwórz** http://localhost:3001/theme-settings.html
2. **Zmień** Primary Color na czerwony (#ff0000)
3. **Kliknij** "Zapisz ustawienia" → Powinna pojawić się notyfikacja
4. **Sprawdź** `data/theme-settings.json` → primaryColor powinien być "#ff0000"
5. **Odśwież** stronę → Czerwony kolor powinien być zapamiętany
6. **Otwórz** http://localhost:3001/index.html → Hero gradient powinien być czerwony
7. **Upload logo** → Plik powinien pojawić się w `public/uploads/branding/`
8. **Sprawdź** nagłówek → Logo powinno się wyświetlić
9. **Usuń logo** → Plik powinien zniknąć z folderu
10. **Reset** → Przywróć domyślne ustawienia

### Testy API (curl):

```bash
# Pobierz ustawienia
curl http://localhost:3001/api/theme-settings

# Zaktualizuj ustawienia
curl -X PUT http://localhost:3001/api/theme-settings \
  -H "Content-Type: application/json" \
  -d '{"primaryColor":"#ff0000"}'

# Upload logo
curl -X POST http://localhost:3001/api/theme-settings/upload-logo \
  -F "logo=@/path/to/logo.png"

# Usuń logo
curl -X DELETE http://localhost:3001/api/theme-settings/logo

# Reset
curl -X POST http://localhost:3001/api/theme-settings/reset
```

## Rozszerzenia (Future)

- **Versioning**: Historia zmian ustawień
- **Multi-tenant**: Różne motywy dla różnych użytkowników
- **Import/Export**: Eksport ustawień do JSON
- **Presets API**: Endpoint do zarządzania preset themes
- **Validation**: JSON Schema validation dla settings

## Troubleshooting

**Problem**: Logo nie ładuje się po uploading
- **Rozwiązanie**: Sprawdź permissions folderu `public/uploads/branding/`
- **Rozwiązanie**: Sprawdź czy `express.static` serwuje folder `public/`

**Problem**: Ustawienia nie zapisują się
- **Rozwiązanie**: Sprawdź logi serwera (console errors)
- **Rozwiązanie**: Sprawdź permissions pliku `data/theme-settings.json`

**Problem**: Stare ustawienia z localStorage
- **Rozwiązanie**: Wyczyść localStorage: `localStorage.clear()` w konsoli
- **Rozwiązanie**: Dodaj migrację (patrz sekcja "Migracja")

**Problem**: CORS errors
- **Rozwiązanie**: Sprawdź czy frontend i backend są na tym samym porcie
- **Rozwiązanie**: Dodaj CORS headers w `app.ts` jeśli potrzebne
