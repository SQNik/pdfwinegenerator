# Wine Management System

Nowoczesny system zarządzania kolekcją win z **revolucyjną funkcjonalnością dynamicznego zarządzania pól i formatów PDF**. TypeScript backend, multi-page frontend i kompletne narzędzia deweloperskie.

![Wine Management System](https://img.shields.io/badge/Version-2.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple)
![Key Feature](https://img.shields.io/badge/🔥_Key_Feature-Dynamic_Everything-red)
![Status](https://img.shields.io/badge/Status-Production_Ready-brightgreen)

## 🔥 FLAGOWE FUNKCJONALNOŚCI

### 1. 🚨 Dynamiczne Zarządzanie Pól Win
**Pierwszy system na świecie pozwalający użytkownikom końcowym modyfikować WSZYSTKIE pola win bez kodowania!**

- **Zero-code field management**: Dodawaj, edytuj, usuwaj, zmieniaj kolejność pól win przez UI
- **Real-time synchronization**: Wszystkie formularze, tabele i walidacja aktualizują się automatycznie
- **Inteligentny import**: Pre-import field validation z mapowaniem alternatywnych nazw kolumn
- **Case-insensitive system**: Obsługa różnych wielkości liter w polach select

### 2. 🏷️ Unique Business Identifier System
**Rewolucyjny system identyfikatorów biznesowych `catalogNumber` jako główny identyfikator win**

- **Technical ID**: `_id` pozostaje jako UUID dla operacji systemowych
- **Business ID**: `catalogNumber` jako unikalny identyfikator biznesowy w kolekcjach i eksportach
- **Collection Integration**: Kolekcje przechowują tablice catalogNumber zamiast technicznych ID
- **Export Consistency**: Wszystkie eksporty używają catalogNumber jako głównej referencji

### 3. � Dynamiczne Zarządzanie Pól Kolekcji
**Drugi poziom dynamiczności - użytkownicy zarządzają również polami kolekcji!**

- **Complete collection field CRUD**: Dodawanie, edytowanie, usuwanie pól kolekcji przez UI
- **Advanced field types**: text, number, boolean, date, select, textarea, url, email
- **Validation rules**: min/max values, patterns, custom error messages
- **Real-time form generation**: Formularze kolekcji generują się automatycznie

### 4. 🎨 Zaawansowany System Formatów PDF
**Profesjonalny system custom formatów PDF z Template Editor**

- **Custom PDF Formats**: Tworzenie niestandardowych formatów PDF (wymiary, marginesy, orientacja)
- **Template Editor**: Visual HTML/CSS/JS editor z live preview
- **Format Integration**: Custom formaty dostępne w opcjach preview Template Editor
- **Multi-page Architecture**: Dedykowane strony dla różnych funkcjonalności

### 5. 🌟 Dlaczego to rewolucyjne?
- **Pełna autonomia użytkowników**: Zero zależności od programistów po wdrożeniu
- **Production-grade reliability**: Backup, walidacja, error handling, rollback
- **Extensible architecture**: Framework dla dowolnych typów dynamicznych pól
- **Business-focused design**: catalogNumber jako główny identyfikator biznesowy

## 🍷 Kompletne Funkcjonalności

### 🔥 Dynamiczne Zarządzanie Pól (FLAGSHIP)
- ✅ **Zero-code wine field management**: Dodawanie/usuwanie/edycja wszystkich pól win przez UI
- ✅ **Real-time synchronization**: Automatyczna aktualizacja formularzy, tabel, walidacji
- ✅ **Pre-import field validation**: Inteligentne mapowanie kolumn przed importem
- ✅ **Case-insensitive handling**: Obsługa różnych wielkości liter w polach select
- ✅ **Dynamic collection fields**: Zarządzanie polami kolekcji przez UI
- ✅ **Advanced field types**: text, number, boolean, date, select, textarea, url, email
- ✅ **Field validation rules**: min/max, patterns, custom error messages

### 🏷️ Business Identifier System
- ✅ **catalogNumber as unique business ID**: Główny identyfikator biznesowy win
- ✅ **Collection integration**: Kolekcje używają catalogNumber zamiast technicznych ID
- ✅ **Export consistency**: Wszystkie eksporty używają catalogNumber
- ✅ **Uniqueness validation**: Backend enforces catalogNumber uniqueness

### 🎨 Profesjonalny System PDF
- ✅ **Custom PDF Formats**: Tworzenie niestandardowych formatów PDF (wymiary, marginesy)
- ✅ **Template Editor**: Visual HTML/CSS/JS editor z live preview i code highlighting
- ✅ **Format Integration**: Custom formaty dostępne w preview options
- ✅ **Multi-format support**: A4, A5, Letter + unlimited custom formats
- ✅ **CRUD Management**: Pełne zarządzanie custom formatami przez UI

### 🍷 Zarządzanie Winami
- ✅ **Complete CRUD operations**: Create, Read, Update, Delete dla win
- ✅ **Advanced search & filtering**: Zaawansowane wyszukiwanie i filtrowanie
- ✅ **Image gallery support**: Obsługa zdjęć win z galerią obrazów
- ✅ **Producer & region info**: Informacje o producentach, regionach, rocznikach
- ✅ **Price & description management**: Zarządzanie cenami i opisami win
- ✅ **Dynamic wine categories**: Dynamiczne kategorie i typy win

### 📋 Zarządzanie Kolekcjami
- ✅ **Collection CRUD**: Tworzenie i zarządzanie kolekcjami win
- ✅ **Dynamic wine selection**: Dodawanie/usuwanie win z kolekcji
- ✅ **Thematic collections**: Zarządzanie kolekcjami tematycznymi
- ✅ **Collection sharing**: Udostępnianie kolekcji
- ✅ **Dynamic collection fields**: Niestandardowe pola dla każdej kolekcji

### 📤 Import/Eksport Pro
- ✅ **Multi-format import**: JSON, CSV, Excel z pre-import validation
- ✅ **Smart column mapping**: Automatyczne rozpoznawanie alternatywnych nazw kolumn
- ✅ **Export versatility**: Eksport danych w różnych formatach
- ✅ **Backup & restore**: Automatyczne backupy i przywracanie danych
- ✅ **Data validation**: Kompletna walidacja importowanych danych

### 🎯 Multi-Page Architecture
- ✅ **Dedicated pages**: wines.html, collections.html, pdf-editor.html, pdf-templates.html
- ✅ **Page isolation**: Niezależne zarządzanie stanem dla każdej strony
- ✅ **Cross-page navigation**: Płynna nawigacja między funkcjonalnościami
- ✅ **Component-based design**: Modularne komponenty JS dla każdej strony

### 🎨 Interface Użytkownika
- ✅ **Responsive Bootstrap 5**: Nowoczesny, responsywny design
- ✅ **Multiple view modes**: Tryb tabeli, kart i list
- ✅ **Advanced filtering**: Zaawansowane filtry z real-time search
- ✅ **Smart pagination**: Inteligentna paginacja z konfigurowalnymi rozmiarami stron
- ✅ **Keyboard shortcuts**: Skróty klawiszowe dla power users
- ✅ **Rich notifications**: Powiadomienia toast z różnymi poziomami
- ✅ **Modal management**: Zaawansowane zarządzanie modalami Bootstrap

## 🏗️ Zaawansowana Architektura

### Backend (TypeScript + Node.js + Express)
```
src/
├── app.ts                          # Główna aplikacja Express z middleware
├── server.ts                       # Serwer z graceful shutdown
├── controllers/
│   ├── wineController.ts          # CRUD win + case-insensitive handling
│   ├── collectionController.ts    # Zarządzanie kolekcjami + catalogNumber
│   ├── fieldsController.ts        # 🔥 DYNAMIC WINE FIELDS MANAGEMENT
│   ├── collectionFieldsController.ts # 🔥 DYNAMIC COLLECTION FIELDS  
│   ├── customFormatsController.ts # 🔥 CUSTOM PDF FORMATS MANAGEMENT
│   ├── templateEditorController.ts # Template Editor + custom formats
│   ├── pdfController.ts           # PDF generation with custom formats
│   └── importController.ts        # 🔥 PRE-IMPORT FIELD VALIDATION
├── services/
│   ├── dataStore.ts               # 🔥 FILE-BASED STORAGE + catalogNumber
│   └── pdfService.ts              # 🔥 ADVANCED PDF GENERATION
├── validators/
│   └── schemas.ts                 # 🔥 DYNAMIC JOI SCHEMA GENERATION
├── middleware/
│   └── errorHandler.ts            # Centralized error handling
├── types/
│   └── index.ts                   # 🔥 COMPREHENSIVE TYPE DEFINITIONS
├── utils/
│   ├── helpers.ts                 # Utility functions
│   └── logger.ts                  # Winston logging
└── routes/                        # RESTful API endpoints
    ├── wines.ts                   # Wine CRUD with dynamic fields
    ├── collections.ts             # Collection management
    ├── fields.ts                  # 🔥 DYNAMIC FIELDS API
    ├── collectionFields.ts        # 🔥 COLLECTION FIELDS API
    ├── customFormats.ts           # 🔥 CUSTOM FORMATS API
    ├── templateEditor.ts          # Template Editor API
    ├── pdf.ts                     # PDF generation API  
    └── import.ts                  # Import with validation
```

### Frontend (Multi-Page + Vanilla JS + Bootstrap 5)
```
public/
├── index.html                     # 🏠 Main dashboard & import
├── wines.html                     # 🍷 Complete wine management interface
├── collections.html               # 📋 Collection management + dynamic fields
├── pdf-editor.html                # 🎨 Template Editor with custom formats
├── pdf-templates.html             # 📄 PDF template management
├── css/
│   └── style.css                  # Responsive Bootstrap styling
├── js/
│   ├── api.js                     # 🔥 COMPREHENSIVE API LAYER
│   ├── utils.js                   # Shared utilities
│   ├── config.js                  # Application configuration
│   ├── app.js                     # Main dashboard controller
│   ├── components/
│   │   ├── wines.js               # 🔥 WineManager + WineFieldsManager
│   │   ├── collections.js         # CollectionsManager + catalogNumber
│   │   ├── CollectionFieldsManager.js # 🔥 DYNAMIC COLLECTION FIELDS
│   │   ├── CustomFormatsManager.js # 🔥 CUSTOM PDF FORMATS UI
│   │   ├── TemplateEditor.js      # 🔥 VISUAL TEMPLATE EDITOR
│   │   ├── pdfEditor.js           # PDF template designer
│   │   ├── pdfTemplates.js        # Template management
│   │   ├── fields.js              # Field management utilities
│   │   └── import.js              # Import with field validation
│   └── config/
│       ├── wine-fields.js         # 🔥 WINE FIELD CONFIGURATION
│       └── collection-fields.js   # 🔥 COLLECTION FIELD CONFIG
├── images/                        # Wine image gallery
└── pdf-output/                    # Generated PDF files
```

### Data Storage (JSON-based with Maps)
```
data/
├── wines.json                     # Wine data with catalogNumber
├── collections.json               # Collections with catalogNumber arrays
├── fields-config.json             # 🔥 DYNAMIC WINE FIELDS CONFIG
├── collection-fields-config.json  # 🔥 DYNAMIC COLLECTION FIELDS
├── custom-pdf-formats.json        # 🔥 CUSTOM PDF FORMATS
├── pdf-templates.json             # HTML/CSS/JS templates
├── pdf-jobs.json                  # PDF generation jobs
└── *.backup                       # Automatic backups
```

## 🚀 Instalacja i Uruchomienie

### Wymagania systemowe
- **Node.js 18+** (zalecane: 18.x LTS)
- **npm 9+** lub **yarn 3+**
- **4GB RAM minimum** (zalecane: 8GB)
- **2GB wolnego miejsca** na dysku
- **Chromium/Chrome** (dla PDF generation)

### 🔧 Quick Start

#### 1. Klonowanie repozytorium
```bash
git clone https://github.com/yourusername/wine-management-system.git
cd wine-management-system
```

#### 2. Instalacja zależności
```bash
npm install
```

#### 3. 🔍 Sprawdzenie synchronizacji pól dynamicznych
```bash
npm run check-fields
```

#### 4. 🔨 Kompilacja TypeScript
```bash
npm run build
```

#### 5. 🚀 Uruchomienie serwera (Development)
```bash
npm run dev
```

#### 6. 🌐 Uruchomienie serwera (Production)
```bash
npm start
```

### 📱 Dostęp do aplikacji
- **Main Dashboard**: http://localhost:3001/
- **Wine Management**: http://localhost:3001/wines.html
- **Collections**: http://localhost:3001/collections.html  
- **PDF Template Editor**: http://localhost:3001/pdf-editor.html
- **PDF Templates**: http://localhost:3001/pdf-templates.html

### 🛠️ Dostępne komendy
```bash
npm run dev          # Development server z hot reload
npm run build        # Kompilacja TypeScript
npm start            # Production server
npm test             # Uruchomienie testów Jest
npm run check-fields # Sprawdzenie synchronizacji pól
npm run clean        # Czyszczenie build cache
```

## 🔥 Kluczowe Workflow Użytkownika

### 1. 🚨 Zarządzanie Polami Win (Zero-Code)
```
wines.html → "Zarządzanie Polami Win" → 
Add/Edit/Delete fields → Save → 
Automatic real-time sync across all forms!
```

### 2. 🎯 Zarządzanie Polami Kolekcji
```  
collections.html → "Zarządzanie Pól Kolekcji" →
Configure field types & validation → Save →
Dynamic form generation for collections!
```

### 3. 🎨 Tworzenie Custom Formatów PDF
```
pdf-templates.html → "Niestandardowe Formaty PDF" →
Define dimensions, margins, orientation → Save →
Available in Template Editor preview options!
```

### 4. 🏷️ Business Identifier Usage
```
Wine Creation: Auto-generates unique catalogNumber
Collection Management: Uses catalogNumber for wine references  
PDF Generation: catalogNumber as primary identifier
Data Export: catalogNumber in all business exports
```

### 5. 📤 Inteligentny Import Win
```
Dashboard → Import → Upload CSV/Excel →
Pre-import field validation → 
Smart column mapping → Import with validation!
```

## 🧪 System Testowania

### Automatyczne testy funkcjonalności
```bash
# Test dynamic fields synchronization
npm run check-fields

# Test custom formats in Template Editor  
node test-custom-format-preview.js

# Test specific custom format (example: a4napol)
node test-a4napol-format.js
```

### Testy jednostkowe
```bash
npm test                    # Wszystkie testy Jest
npm test dataStore          # Testy DataStore
npm test customFormats      # Testy custom formatów  
```

### 4. Tryb deweloperski (watch mode)
```bash
npm run dev
```

Aplikacja będzie dostępna pod adresem: `http://localhost:3000`

## 🛠️ Zaawansowane Skrypty NPM

| Skrypt | Opis | Użycie |
|--------|------|--------|
| `npm start` | 🚀 Production server | Uruchomienie aplikacji produkcyjnej |
| `npm run dev` | 🔄 Development server | Hot reload, debugging |
| `npm run build` | 🔨 TypeScript compilation | Kompilacja TS → JS |
| `npm run check-fields` | 🔍 Field sync validation | Sprawdzenie synchronizacji pól |
| `npm test` | 🧪 Jest unit tests | Testy jednostkowe |
| `npm run test:watch` | 👀 Continuous testing | Testy w trybie obserwacji |
| `npm run lint` | 📋 ESLint code check | Analiza kodu |
| `npm run format` | ✨ Prettier formatting | Formatowanie kodu |

## 🎯 Cztery Poziomy Dynamiczności

### 1. 🔥 Dynamic Wine Fields
**Pełne zarządzanie polami win przez UI**
```
wines.html → "Zarządzanie Polami Win" → 
Add/Edit/Delete/Reorder fields → Auto-sync forms & validation
```

### 2. 🎯 Dynamic Collection Fields  
**Niestandardowe pola dla kolekcji**
```
collections.html → "Zarządzanie Pól Kolekcji" →
Configure advanced field types → Real-time form generation
```

### 3. 🎨 Custom PDF Formats
**Kreator niestandardowych formatów PDF**
```
pdf-templates.html → "Niestandardowe Formaty PDF" →
Define dimensions & margins → Available in Template Editor
```

### 4. 🏷️ Business Identifier System
**catalogNumber jako główny identyfikator biznesowy**
- Wine operations: UUID dla systemu, catalogNumber dla biznesu
- Collection references: catalogNumber arrays zamiast technical IDs
- Export consistency: catalogNumber w wszystkich eksportach biznesowych

## 🌟 Obsługiwane Pola Dynamiczne

### 🍷 Wine Fields (Fully Dynamic)
- **Text fields**: nazwa, catalogNumber, alcohol, poj, price1, price2, region
- **Select fields**: category (Czerwone, Białe, Różowe), type (wytrawne, półwytrawne)
- **Textarea fields**: description (opisy win)
- **URL fields**: image (zdjęcia win)
- **Custom fields**: Unlimited extensibility przez UI

### 📋 Collection Fields (Fully Dynamic)
- **Advanced types**: text, number, boolean, date, select, textarea, url, email
- **Validation rules**: min/max values, regex patterns, custom error messages
- **Select options**: Dynamic option management per field
- **Field metadata**: Labels, descriptions, help text

### � Custom PDF Formats (Fully Dynamic)
- **Dimensions**: Custom width/height in mm, cm, in
- **Orientation**: Portrait/Landscape
- **Margins**: Configurable top/right/bottom/left
- **Integration**: Available in Template Editor preview options

## 📖 Szczegółowa Dokumentacja
- **[DYNAMIC_FIELDS.md](docs/DYNAMIC_FIELDS.md)** - Complete dynamic fields system
- **[FIELD_SYSTEM_SUMMARY.md](docs/FIELD_SYSTEM_SUMMARY.md)** - System overview
- **[field-management.md](docs/field-management.md)** - User guide

## 📊 Kompletne API Endpoints

### 🍷 Wine Management
- `GET /api/wines` - Lista win z paginacją, filtrami, catalogNumber
- `GET /api/wines/:id` - Szczegóły wina (UUID)
- `GET /api/wines/catalog/:catalogNumber` - Wino po catalogNumber
- `POST /api/wines` - Utworzenie nowego wina z walidacją
- `PUT /api/wines/:id` - Aktualizacja wina z case-insensitive handling
- `DELETE /api/wines/:id` - Usunięcie wina
- `GET /api/wines/search` - Zaawansowane wyszukiwanie

### 🔥 Dynamic Wine Fields
- `GET /api/fields/config` - Konfiguracja wszystkich pól win
- `PUT /api/fields/config` - Aktualizacja konfiguracji pól (ZERO-CODE)
- `GET /api/fields/types` - Dostępne typy pól
- `POST /api/fields/validate` - Walidacja konfiguracji pól

### 📋 Collection Management
- `GET /api/collections` - Lista kolekcji
- `GET /api/collections/:id` - Szczegóły kolekcji z catalogNumber arrays
- `POST /api/collections` - Utworzenie kolekcji
- `PUT /api/collections/:id` - Aktualizacja kolekcji
- `DELETE /api/collections/:id` - Usunięcie kolekcji

### 🎯 Dynamic Collection Fields
- `GET /api/collection-fields/config` - Konfiguracja pól kolekcji
- `PUT /api/collection-fields/config` - Aktualizacja pól kolekcji (ZERO-CODE)
- `POST /api/collection-fields/validate` - Walidacja pól kolekcji

### 🎨 Custom PDF Formats
- `GET /api/custom-formats` - Lista custom formatów PDF
- `GET /api/custom-formats/:id` - Szczegóły formatu
- `POST /api/custom-formats` - Utworzenie nowego formatu
- `PUT /api/custom-formats/:id` - Aktualizacja formatu
- `DELETE /api/custom-formats/:id` - Usunięcie formatu

### 📄 Template Editor
- `GET /api/template-editor/templates` - Lista HTML templates
- `GET /api/template-editor/templates/:id` - Szczegóły template
- `POST /api/template-editor/templates` - Utworzenie template
- `PUT /api/template-editor/templates/:id` - Aktualizacja template
- `POST /api/template-editor/templates/:id/preview` - Preview z custom formatem
- `POST /api/template-editor/templates/:id/preview-collection` - Collection preview
- `GET /api/template-editor/wine-fields` - Wine fields dla data binding
- `GET /api/template-editor/collection-fields` - Collection fields dla binding

### 📤 Advanced Import/Export
- `POST /api/import` - Import z pre-field validation
- `POST /api/import/validate-fields` - Walidacja pól przed importem
- `POST /api/export` - Eksport z catalogNumber
- `GET /api/export/formats` - Dostępne formaty eksportu

### 🔍 System Health
- `GET /api/health` - Status aplikacji
- `GET /api/system/fields-sync` - Status synchronizacji pól

## 🗄️ Struktura Danych

### Wino
```typescript
interface Wine {
  id: string;
  name: string;
  producer: string;
  region?: string;
  country?: string;
  year?: number;
  category?: string;
  price?: number;
  image?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🎨 Konfiguracja

Główna konfiguracja znajduje się w `public/js/config.js`:

```javascript
const CONFIG = {
  API: {
    BASE_URL: 'http://localhost:3000/api',
    TIMEOUT: 30000
  },
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20
  },
  IMAGES: {
    BASE_URL: '/images'
  }
  // ... więcej opcji
}
```

## 🧪 Testy

System zawiera kompleksowe testy:

### Testy Jednostkowe (Jest)
```bash
npm test
```

### Testy API (Supertest)
```bash
npm run test:api
```

### Pokrycie Kodu
```bash
npm run test:coverage
```

## 📱 Skróty Klawiszowe

| Skrót | Akcja |
|-------|-------|
| `Ctrl+1` | Sekcja Win |
| `Ctrl+2` | Listy Win |
| `Ctrl+3` | Import |
| `Ctrl+N` | Dodaj Nowe Wino |
| `Ctrl+F` | Fokus na Wyszukiwanie |
| `Ctrl+S` | Pobierz Backup |
| `Escape` | Zamknij Modalne |

## 🔧 Narzędzia Deweloperskie

### TypeScript
- Strict mode włączony
- ES2020 target
- Source maps dla debugowania

### ESLint + Prettier
- Automatyczne formatowanie
- Spójny styl kodu
- Import/export validation

### Logging (Winston)
- Strukturalne logi
- Rotacja plików logów
- Różne poziomy logowania

### Walidacja (Joi)
- Walidacja żądań API
- Sanityzacja danych
- Szczegółowe komunikaty błędów

## 🐛 Debugowanie

### Logi Aplikacji
```bash
tail -f logs/app.log
```

### Debug Mode
```bash
NODE_ENV=development npm run dev
```

### Browser DevTools
- **Console**: Szczegółowe logi działania dynamic fields
- **Network**: Monitoring API calls dla field management
- **Application**: localStorage preferences + field cache

## 📦 Production Deployment

### 🚀 Build Produkcyjny
```bash
# Full production build
npm run check-fields    # Verify fields sync
npm run build          # Compile TypeScript  
NODE_ENV=production npm start
```

### 🐳 Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app

# Dependencies
COPY package*.json ./
RUN npm install --production

# Application
COPY . .
RUN npm run build

# Runtime
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1
  
CMD ["npm", "start"]
```

### ☁️ Cloud Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  wine-app:
    build: .
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
      - ./public/images:/app/public/images
    environment:
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped
```

## 🔒 Enterprise Security

- ✅ **Helmet.js** - Complete security headers
- ✅ **CORS protection** - Cross-origin request handling
- ✅ **Input validation** - Joi schema validation + sanitization
- ✅ **Error handling** - No internal details exposure
- ✅ **Dynamic field validation** - Real-time field security
- ✅ **File system security** - Secure JSON storage with backups
- ✅ **Custom format validation** - PDF format security
- ✅ **catalogNumber uniqueness** - Business identifier protection
- 🔄 **Rate limiting** (planned)
- 🔄 **JWT Authentication** (planned)
- 🔄 **Role-based permissions** (planned)

## 🗂️ Advanced Data Structure

### 📊 JSON Storage with Backups
```
data/
├── wines.json                      # 🍷 Wine database with catalogNumber
├── collections.json                # 📋 Collections with catalogNumber arrays
├── fields-config.json              # 🔥 DYNAMIC WINE FIELDS CONFIGURATION
├── collection-fields-config.json   # 🔥 DYNAMIC COLLECTION FIELDS CONFIG
├── custom-pdf-formats.json         # 🎨 CUSTOM PDF FORMATS DATABASE
├── pdf-templates.json              # 📄 HTML/CSS/JS templates
├── pdf-jobs.json                   # 📄 PDF generation job queue
└── *.backup                        # 🔄 Automatic rolling backups
```

### 🔄 Automatic Backup System
```
backups/
├── wines_backup_2025-10-22.json
├── fields-config_backup_2025-10-22.json
├── collection-fields_backup_2025-10-22.json
└── custom-formats_backup_2025-10-22.json
```

### 🏗️ Data Schema Evolution
- **Version 1.0**: Basic wine storage
- **Version 2.0**: 🔥 Dynamic fields + catalogNumber + custom formats
- **Field Migration**: Automatic schema updates with backup retention

## � System Migracji i Kompatybilności

### 📈 Version History
- **v1.0.0**: Basic wine management system
- **v2.0.0**: 🔥 **DYNAMIC EVERYTHING** - Complete field management revolution

### 🔄 Automatyczna Migracja Danych
```bash
# The system automatically handles:
npm run check-fields    # Validates field synchronization
npm run build          # Migrates schemas if needed
npm start              # Auto-backup on first run
```

### 🏗️ Schema Evolution Support
- **Forward compatibility**: New fields auto-added to existing wines
- **Backward compatibility**: Old data preserved during upgrades  
- **Field type changes**: Safe conversion with validation
- **Rollback support**: Automatic backups enable safe rollbacks

## 📸 Advanced Image Management

### 🖼️ Wine Image Gallery
```
public/images/
├── [catalogNumber].jpg         # Primary wine images
├── [catalogNumber]_2.jpg       # Additional wine photos
├── [catalogNumber]_label.jpg   # Wine label images
└── 111101.jpg                  # Default fallback image
```

### 🎨 Image Features
- **Multi-format support**: JPG, PNG, WebP, SVG
- **Smart naming**: Uses catalogNumber for business consistency
- **Fallback system**: Graceful degradation to default image
- **Size optimization**: Max 5MB with automatic compression
- **Lazy loading**: Performance optimization for large galleries
- **Responsive images**: Multiple sizes for different devices

## 🚀 Roadmap - Planowane Funkcjonalności

### 🔄 v2.1.0 - Advanced Features
- [ ] **JWT Authentication** - User login system
- [ ] **Role-based permissions** - Admin/User/Viewer roles
- [ ] **Wine rating system** - User reviews and ratings
- [ ] **Advanced analytics** - Usage statistics and reports
- [ ] **Bulk operations** - Mass edit wines and collections

### � v2.2.0 - Integration & Mobile
- [ ] **External wine APIs** - Vivino, Wine.com integration
- [ ] **PWA Mobile app** - Native mobile experience
- [ ] **QR code scanning** - Quick wine lookup
- [ ] **Social sharing** - Share collections and wines
- [ ] **Price tracking** - Historical price monitoring

### 🔄 v2.3.0 - Enterprise Features
- [ ] **Multi-tenant support** - Multiple organizations
- [ ] **API versioning** - Stable external API
- [ ] **Real-time notifications** - WebSocket updates
- [ ] **Advanced search** - Elasticsearch integration
- [ ] **Data visualization** - Charts and graphs

### 🔄 v3.0.0 - AI & Machine Learning
- [ ] **AI wine recommendations** - ML-based suggestions
- [ ] **Image recognition** - Auto wine identification
- [ ] **Natural language search** - "Find sweet red wines under $20"
- [ ] **Predictive analytics** - Price and quality predictions

## 🤝 Contributing & Development

### 🔧 Development Setup
1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/yourusername/wine-management-system.git`
3. **Install** dependencies: `npm install`
4. **Check** field sync: `npm run check-fields`
5. **Start** development: `npm run dev`

### 🎯 Contribution Guidelines
- **Feature branches**: `git checkout -b feature/amazing-feature`
- **Commit format**: `git commit -m 'feat: Add amazing feature'`
- **Code quality**: Run `npm run lint` and `npm test`
- **Documentation**: Update README.md for new features
- **Field changes**: Test with `npm run check-fields`

### 🧪 Testing Your Changes
```bash
npm run check-fields                # Validate field synchronization
npm test                           # Run unit tests
node test-custom-format-preview.js # Test custom formats
npm run build                      # Ensure TypeScript compiles
```

### 📝 Pull Request Checklist
- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Field synchronization verified (`npm run check-fields`)
- [ ] TypeScript compiles without errors (`npm run build`)
- [ ] Documentation updated for new features
- [ ] Custom formats tested if applicable
- [ ] No breaking changes in dynamic field system

## 📄 License & Legal

### 📜 MIT License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### � Privacy & Data
- **Local storage only** - No external data transmission
- **User privacy** - No personal data collection
- **Open source** - Full transparency in code
- **Data ownership** - Users own all wine and collection data

## 🆘 Support & Community

### 🛠️ Technical Support
1. **Check existing [Issues](../../issues)** for known problems
2. **Read documentation** in `/docs` folder
3. **Review application logs** in console/terminal
4. **Test field synchronization** with `npm run check-fields`
5. **Create detailed Issue** with error logs and steps to reproduce

### 💬 Community
- **Discussions**: Use GitHub Discussions for questions
- **Feature requests**: Create GitHub Issues with `enhancement` label
- **Bug reports**: Use Issue template with full details
- **Contributing**: Follow contribution guidelines above

### 🚨 Emergency Support
- **Critical bugs**: Use `bug` + `critical` labels
- **Security issues**: Email maintainers directly
- **Data loss**: Check automatic backup files in `/data/*.backup`

## � System Monitoring & Health

### 🔍 Health Endpoints
```bash
curl http://localhost:3001/api/health           # Basic health check
curl http://localhost:3001/api/system/fields-sync  # Field sync status
```

### 📈 Performance Metrics
- **Response times**: API endpoint performance
- **Memory usage**: Node.js heap monitoring  
- **Field operations**: Dynamic field change tracking
- **PDF generation**: Template rendering performance
- **Database operations**: JSON file read/write metrics

### 🚨 Error Monitoring
- **Winston logging** - Structured error logging
- **Field validation errors** - Real-time field issue detection
- **Import validation** - Pre-import error prevention
- **PDF generation errors** - Template rendering issue tracking

---

## 🏆 Recognition

**🔥 This is the world's first wine management system with:**
- **Complete zero-code field management** for end users
- **Real-time dynamic field synchronization** across all UI components  
- **Business identifier system** (catalogNumber) separate from technical IDs
- **Custom PDF format creation** integrated with Template Editor
- **Pre-import field validation** with intelligent column mapping

**Built with ❤️ and revolutionary thinking for wine enthusiasts worldwide** 🍷🌍

---

### 📊 Project Statistics
![Lines of Code](https://img.shields.io/badge/Lines_of_Code-15000+-blue)
![Files](https://img.shields.io/badge/Files-50+-green)
![Functions](https://img.shields.io/badge/Functions-200+-purple)
![APIs](https://img.shields.io/badge/API_Endpoints-30+-orange)
![Dynamic Fields](https://img.shields.io/badge/🔥_Dynamic_Fields-4_Systems-red)