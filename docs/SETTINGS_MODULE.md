# Settings Module - Moduł Ustawień

## 📋 Przegląd

Moduł Settings to kompleksowy system zarządzania ustawieniami aplikacji Wine Management System. Umożliwia konfigurację wyglądu, bezpieczeństwa, użytkowników oraz parametrów systemowych przez intuicyjny interfejs webowy.

**Data wdrożenia:** 19 listopada 2025  
**URL:** `http://localhost:3001/settings/`

---

## 🏗️ Architektura

### Backend (TypeScript)

```
src/
├── types/
│   └── settings.ts              # Interfejsy TypeScript dla wszystkich ustawień
├── services/
│   └── settingsService.ts       # Logika biznesowa (CRUD, defaults)
├── controllers/settings/
│   ├── appearanceController.ts  # Obsługa wyglądu + upload logo
│   ├── securityController.ts    # Polityka bezpieczeństwa
│   ├── usersController.ts       # Zarządzanie użytkownikami (CRUD)
│   └── systemController.ts      # Ustawienia systemowe
└── routes/settings/
    ├── index.ts                 # Agregator routów + health check
    ├── appearance.ts            # Routes dla wyglądu
    ├── security.ts              # Routes dla bezpieczeństwa
    ├── users.ts                 # Routes dla użytkowników
    └── system.ts                # Routes dla systemu
```

### Frontend (Vanilla JavaScript)

```
public/settings/
├── index.html                   # Główna strona Settings
├── css/
│   └── settings.css             # Style dla całego modułu
└── js/
    ├── utils/
    │   └── settings-api.js      # Klient API (SettingsAPI, UsersAPI)
    ├── components/
    │   ├── appearance-settings.js   # Komponent wyglądu
    │   ├── security-settings.js     # Komponent bezpieczeństwa
    │   ├── users-settings.js        # Komponent użytkowników
    │   └── system-settings.js       # Komponent systemu
    └── settings-app.js          # Główny kontroler (nawigacja, lifecycle)
```

### Persistence (JSON)

```
data/settings/
├── appearance.json              # Ustawienia wyglądu
├── security.json                # Ustawienia bezpieczeństwa
├── users.json                   # Lista użytkowników
└── system.json                  # Ustawienia systemowe
```

---

## 🔌 API Endpoints

### Health Check
```http
GET /api/settings/health
```
**Response:** `{ success: true, message: "Settings API is healthy" }`

---

### Appearance (Wygląd)

#### Get Appearance Settings
```http
GET /api/settings/appearance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "theme": "wine",
    "primaryColor": "#10b981",
    "accentColor": "#3b82f6",
    "heroGradientStart": "#10b981",
    "heroGradientEnd": "#059669",
    "fontSize": "medium",
    "spacing": "normal",
    "borderRadius": "8px",
    "appName": "Katalog Win",
    "appIcon": "bi-wine",
    "appLogoUrl": "/uploads/branding/logo-123456.png",
    "customCSS": ""
  }
}
```

#### Update Appearance Settings
```http
PUT /api/settings/appearance
Content-Type: application/json

{
  "theme": "dark",
  "primaryColor": "#6366f1",
  "appName": "Wine Catalog"
}
```

#### Upload Logo
```http
POST /api/settings/appearance/upload-logo
Content-Type: multipart/form-data

logo: [binary file]
```
**Accepted formats:** PNG, JPG, SVG  
**Max size:** 2MB

#### Delete Logo
```http
DELETE /api/settings/appearance/logo
```

#### Reset to Defaults
```http
POST /api/settings/appearance/reset
```

---

### Security (Bezpieczeństwo)

#### Get Security Settings
```http
GET /api/settings/security
```

**Response:**
```json
{
  "success": true,
  "data": {
    "minPasswordLength": 8,
    "requireSpecialChars": true,
    "requireNumbers": true,
    "requireUppercase": true,
    "sessionTimeout": 60,
    "maxLoginAttempts": 5,
    "enable2FA": false,
    "allowedIPs": []
  }
}
```

#### Update Security Settings
```http
PUT /api/settings/security
Content-Type: application/json
```

#### Reset to Defaults
```http
POST /api/settings/security/reset
```

---

### Users (Użytkownicy)

#### Get All Users
```http
GET /api/settings/users
```

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-uuid",
        "username": "admin",
        "email": "admin@example.com",
        "role": "admin",
        "permissions": {
          "view": true,
          "edit": true,
          "delete": true,
          "manageUsers": true
        },
        "active": true,
        "createdAt": "2025-11-19T10:00:00.000Z"
      }
    ]
  }
}
```

#### Add User
```http
POST /api/settings/users
Content-Type: application/json

{
  "username": "newuser",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "editor",
  "permissions": {
    "view": true,
    "edit": true,
    "delete": false,
    "manageUsers": false
  },
  "active": true
}
```

#### Update User
```http
PUT /api/settings/users/:userId
Content-Type: application/json

{
  "email": "newemail@example.com",
  "role": "admin"
}
```

#### Delete User
```http
DELETE /api/settings/users/:userId
```

---

### System (Ustawienia Systemowe)

#### Get System Settings
```http
GET /api/settings/system
```

**Response:**
```json
{
  "success": true,
  "data": {
    "autoBackup": true,
    "backupFrequency": "daily",
    "backupRetentionDays": 30,
    "enableCache": true,
    "cacheDuration": 3600,
    "maxCacheSize": 100,
    "maintenanceMode": false,
    "maintenanceMessage": "",
    "logLevel": "info",
    "debugMode": false,
    "apiRateLimit": 100,
    "maxUploadSize": 10
  }
}
```

#### Update System Settings
```http
PUT /api/settings/system
Content-Type: application/json
```

#### Reset to Defaults
```http
POST /api/settings/system/reset
```

---

## 🎨 Frontend Components

### 1. Appearance Settings (`appearance-settings.js`)

**Funkcje:**
- Wybór motywu (Light, Dark, Wine, Custom)
- Dostosowanie kolorów (Primary, Accent, Gradient)
- Typografia (rozmiar czcionki, odstępy, zaokrąglenia)
- Upload/usuwanie logo
- Nazwa aplikacji + ikona
- Własny CSS

**Kluczowe metody:**
```javascript
class AppearanceSettings {
  async load()          // Pobierz ustawienia z API
  render()              // Zwróć HTML
  async init()          // Podepnij event listeners
  async save()          // Zapisz zmiany
  async reset()         // Reset do defaults
  async uploadLogo()    // Upload pliku logo
  async removeLogo()    // Usuń logo
}
```

---

### 2. Security Settings (`security-settings.js`)

**Funkcje:**
- Polityka haseł (długość, wymagane znaki)
- Timeout sesji
- Maksymalna liczba prób logowania
- 2FA (włącz/wyłącz)
- Lista dozwolonych IP

**Kluczowe metody:**
```javascript
class SecuritySettings {
  async load()
  render()
  async init()
  async save()
  async reset()
}
```

---

### 3. Users Settings (`users-settings.js`)

**Funkcje:**
- Tabela użytkowników
- Dodawanie nowych użytkowników (modal)
- Edycja użytkowników
- Usuwanie użytkowników
- Zarządzanie uprawnieniami (view, edit, delete, manageUsers)
- Role (viewer, editor, admin)
- Aktywacja/deaktywacja kont

**Kluczowe metody:**
```javascript
class UsersSettings {
  async load()
  render()
  async init()
  showModal(user)      // Pokaż modal dodawania/edycji
  hideModal()
  editUser(userId)
  async saveUser(e)
  async deleteUser(userId)
}
```

---

### 4. System Settings (`system-settings.js`)

**Funkcje:**
- Automatyczne backupy (częstotliwość, retencja)
- Cache (włącz, czas życia, max rozmiar)
- Tryb konserwacji (wiadomość)
- Logowanie (poziom, debug mode)
- API rate limiting
- Maksymalny rozmiar uploadu

**Kluczowe metody:**
```javascript
class SystemSettings {
  async load()
  render()
  async init()
  async save()
  async reset()
}
```

---

## 🔄 Settings App Controller (`settings-app.js`)

**Odpowiedzialność:**
- Nawigacja między sekcjami
- Lifecycle komponentów (load → render → init)
- Zarządzanie stanem (loading, error)
- URL hash routing (`#appearance`, `#security`, etc.)

**Przykład użycia:**
```javascript
const settingsApp = new SettingsApp();
await settingsApp.init(); // Uruchom aplikację

// Zmiana sekcji
settingsApp.loadSection('security');

// Obsługa hash w URL
window.location.hash = '#users';
```

---

## 🌐 API Client (`settings-api.js`)

### SettingsAPI (Base Class)

```javascript
const api = new SettingsAPI('appearance');

await api.getSettings();              // GET /api/settings/appearance
await api.updateSettings({ ... });    // PUT /api/settings/appearance
await api.reset();                    // POST /api/settings/appearance/reset
await api.uploadLogo(formData);       // POST /api/settings/appearance/upload-logo
await api.deleteLogo();               // DELETE /api/settings/appearance/logo
```

### UsersAPI (Extended Class)

```javascript
const usersApi = new UsersAPI();

await usersApi.getSettings();         // GET /api/settings/users
await usersApi.addUser({ ... });      // POST /api/settings/users
await usersApi.updateUser(id, { ... }); // PUT /api/settings/users/:id
await usersApi.deleteUser(id);        // DELETE /api/settings/users/:id
```

---

## 🎯 Domyślne Wartości

### Appearance
```typescript
{
  theme: 'wine',
  primaryColor: '#10b981',
  accentColor: '#3b82f6',
  heroGradientStart: '#10b981',
  heroGradientEnd: '#059669',
  fontSize: 'medium',
  spacing: 'normal',
  borderRadius: '8px',
  appName: 'Katalog Win',
  appIcon: 'bi-wine',
  appLogoUrl: null,
  customCSS: ''
}
```

### Security
```typescript
{
  minPasswordLength: 8,
  requireSpecialChars: true,
  requireNumbers: true,
  requireUppercase: true,
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  enable2FA: false,
  allowedIPs: []
}
```

### System
```typescript
{
  autoBackup: true,
  backupFrequency: 'daily',
  backupRetentionDays: 30,
  enableCache: true,
  cacheDuration: 3600,
  maxCacheSize: 100,
  maintenanceMode: false,
  maintenanceMessage: '',
  logLevel: 'info',
  debugMode: false,
  apiRateLimit: 100,
  maxUploadSize: 10
}
```

---

## 🚀 Instalacja i Uruchomienie

### 1. Kompilacja TypeScript
```bash
npm run build:ts
```

### 2. Uruchomienie serwera
```bash
npm start
```

### 3. Dostęp do Settings
Otwórz w przeglądarce:
```
http://localhost:3001/settings/
```

---

## 🧪 Testowanie

### Manual Testing Checklist

**Appearance:**
- [ ] Zmiana motywu
- [ ] Zmiana kolorów (primary, accent, gradient)
- [ ] Zmiana typografii
- [ ] Upload logo (PNG, JPG, SVG)
- [ ] Usunięcie logo
- [ ] Zmiana nazwy aplikacji
- [ ] Reset do defaults

**Security:**
- [ ] Ustawienie polityki haseł
- [ ] Zmiana timeoutu sesji
- [ ] Dodanie IP do allowlist
- [ ] Włączenie 2FA
- [ ] Reset do defaults

**Users:**
- [ ] Dodanie nowego użytkownika
- [ ] Edycja użytkownika
- [ ] Zmiana uprawnień
- [ ] Deaktywacja użytkownika
- [ ] Usunięcie użytkownika

**System:**
- [ ] Konfiguracja backupów
- [ ] Zmiana ustawień cache
- [ ] Włączenie trybu konserwacji
- [ ] Zmiana poziomu logowania
- [ ] Reset do defaults

### API Testing (curl)

```bash
# Health check
curl http://localhost:3001/api/settings/health

# Get appearance
curl http://localhost:3001/api/settings/appearance

# Update appearance
curl -X PUT http://localhost:3001/api/settings/appearance \
  -H "Content-Type: application/json" \
  -d '{"theme":"dark"}'

# Upload logo
curl -X POST http://localhost:3001/api/settings/appearance/upload-logo \
  -F "logo=@/path/to/logo.png"
```

---

## 📊 Integracja z Aplikacją

### Nawigacja

Moduł Settings został dodany do nawigacji w następujących plikach:
- `public/index.html` (Dashboard)
- `public/wines.html` (Zarządzanie Winami)
- `public/collections.html` (Zarządzanie Kolekcjami)
- `public/settings/index.html` (Settings - linki relatywne)

**Przykład linku:**
```html
<a href="settings/index.html" class="ds-btn ds-btn-ghost">
    <i class="bi bi-gear-fill"></i>
    <span>Ustawienia</span>
</a>
```

### Theme Integration

Ustawienia wyglądu z modułu Settings są automatycznie stosowane przez `theme-loader.js`:
```javascript
// Pobiera ustawienia z /api/theme-settings
// Aplikuje CSS variables do :root
// Ładuje custom CSS (jeśli ustawiony)
```

---

## 🔐 Bezpieczeństwo

### Planowane Implementacje (TODO)

1. **Autentykacja:**
   - Middleware sprawdzający session/token
   - Role-based access control (RBAC)
   - Ograniczenie dostępu do /api/settings/* tylko dla adminów

2. **Walidacja:**
   - Sanityzacja HTML w customCSS
   - Walidacja email/username
   - Whitelist dla uploadowanych plików

3. **Rate Limiting:**
   - Ograniczenie żądań do API
   - Throttling dla upload endpointów

4. **Audit Log:**
   - Logowanie zmian w ustawieniach
   - Historia modyfikacji przez użytkowników

---

## 📝 Notatki Developerskie

### TypeScript Gotchas

1. **Partial Updates:**
   ```typescript
   // W updateUser() wymagany cast ze względu na exactOptionalPropertyTypes
   const updatedUser = { ...existingUser, ...updates } as UserSettings;
   ```

2. **Route Params:**
   ```typescript
   // userId może być undefined - zawsze waliduj
   const userId = req.params.userId;
   if (!userId) return res.status(400).json({ error: 'Missing userId' });
   ```

### File Upload Cleanup

AppearanceController automatycznie usuwa stare logo przy uploadzienowych:
```typescript
private async deleteOldLogo(logoUrl: string) {
  const filename = path.basename(logoUrl);
  const filepath = path.join(__dirname, '../../public/uploads/branding', filename);
  await fs.unlink(filepath);
}
```

### Component Pattern

Wszystkie komponenty frontendowe używają jednolitego wzorca:
```javascript
class ComponentSettings {
  constructor() { /* Inicjalizacja API */ }
  async load() { /* Fetch data */ }
  render() { /* Return HTML string */ }
  async init() { /* Attach events */ }
  async save() { /* Update via API */ }
  async reset() { /* Reset to defaults */ }
}
```

---

## 🔮 Przyszłe Ulepszenia

1. **Export/Import Settings:**
   - Eksport wszystkich ustawień do JSON
   - Import z pliku backup

2. **Settings History:**
   - Wersjonowanie zmian
   - Rollback do poprzednich stanów

3. **Multi-tenant Support:**
   - Osobne ustawienia per organization
   - Dziedziczenie ustawień globalnych

4. **Advanced Theming:**
   - Live preview zmian
   - Predefiniowane palety kolorów
   - Dark/light mode toggle

5. **User Permissions:**
   - Granular permissions (per-feature)
   - Custom roles creation

---

## 📚 Powiązane Dokumenty

- `DESIGN_SYSTEM_README.md` - System designu
- `THEME_SETTINGS_PAGE.md` - Stara strona theme settings
- `THEME_CUSTOMIZATION.md` - Customizacja motywów
- `API_ENDPOINTS.md` - Dokumentacja API (TODO)

---

## 🐛 Znane Problemy

Brak znanych problemów na dzień 19.11.2025.

---

## 👥 Autorzy

- **Implementacja:** GitHub Copilot + User
- **Data:** 19 listopada 2025
- **Wersja:** 1.0.0
