# Analiza Plików - Wine Management System
**Data analizy**: 4 marca 2026

---

## 📊 PODSUMOWANIE WYKONAWCZE

### Statystyki Projektu:
- **Wersja**: 2.0.0
- **Technologie**: TypeScript 5, Node.js 18+, Express, pdf-lib, Bootstrap 5
- **Rozmiar backupów**: ~422 MB (możliwe do usunięcia: ~421 MB)
- **Pliki testowe**: 24 pliki HTML + katalog `_deprecated/`
- **Całkowity potencjał optymalizacji**: ~500 MB

---

## ✅ PLIKI NIEZBĘDNE DO DZIAŁANIA APLIKACJI

### 🎯 1. BACKEND (src/) - WSZYSTKIE NIEZBĘDNE

#### 1.1 Pliki Główne
```
src/
├── server.ts              # Punkt wejścia serwera
├── app.ts                 # Konfiguracja aplikacji Express
└── config/
    └── app.ts             # Konfiguracja środowiska
```

#### 1.2 Kontrolery (src/controllers/)
**WSZYSTKIE NIEZBĘDNE** - obsługa API endpoints:
```
controllers/
├── wineController.ts              # CRUD win
├── collectionController.ts        # CRUD kolekcji
├── collectionFieldsController.ts  # Dynamiczne pola kolekcji
├── fieldsController.ts            # Dynamiczne pola win
├── pdfController.ts               # Generowanie PDF
├── templateEditorController.ts    # Edytor szablonów
├── customFormatsController.ts     # Niestandardowe formaty PDF
├── importController.ts            # Import CSV/JSON
├── themeSettingsController.ts     # Ustawienia motywu
├── assetsController.ts            # Zarządzanie zasobami
├── uploadController.ts            # Upload plików
└── settings/                      # Kontrolery ustawień
```

#### 1.3 Serwisy (src/services/)
**NIEZBĘDNE**:
```
services/
├── dataStore.ts                   # Trwałość danych JSON
├── pdfService.ts                  # Renderowanie PDF (pdf-lib + Puppeteer)
├── collectionDataBuilder.ts       # Budowanie danych kolekcji
├── settingsService.ts             # Serwis ustawień
└── backupMonitoringService.ts     # Monitorowanie i backupy
```

**ZBĘDNY**:
```
❌ pdfService — kopia.ts          # DUPLIKAT - można usunąć
```

#### 1.4 Trasy (src/routes/)
**WSZYSTKIE NIEZBĘDNE**:
```
routes/
├── wines.ts               # /api/wines
├── collections.ts         # /api/collections
├── collectionFields.ts    # /api/collection-fields
├── fields.ts              # /api/fields
├── pdf.ts                 # /api/pdf
├── templateEditor.ts      # /api/template-editor
├── customFormats.ts       # /api/custom-formats
├── import.ts              # /api/import
├── themeSettings.ts       # /api/theme-settings
├── upload.ts              # /api/upload
└── settings/              # /api/settings/*
```

#### 1.5 Typy i Walidatory (src/)
**WSZYSTKIE NIEZBĘDNE**:
```
types/
└── index.ts               # Interfejsy TypeScript

validators/
└── schemas.ts             # Schematy walidacji JOI

middleware/
└── errorHandler.ts        # Middleware obsługi błędów

utils/
└── logger.ts              # System logowania Winston
```

---

### 🎨 2. FRONTEND (public/)

#### 2.1 Strony Główne - ŹRÓDŁA (public/pages/) ✅ NIEZBĘDNE
**TYLKO TE PLIKI NALEŻY EDYTOWAĆ**:
```
pages/
├── index.html             # Strona główna - EDYTUJ
├── wines.html             # Zarządzanie winami - EDYTUJ
├── collections.html       # Zarządzanie kolekcjami - EDYTUJ
├── template-editor.html   # Edytor szablonów - EDYTUJ
└── kreator.html           # Kreator kolekcji - EDYTUJ
```

**ZBĘDNY**:
```
❌ wines copy.html         # DUPLIKAT - można usunąć
```

#### 2.2 Strony Wygenerowane (public/*.html) ⚠️ NIE EDYTOWAĆ
**Generowane automatycznie z public/pages/** przez `npm run build:html`:
```
public/
├── index.html             # ← Nie edytować! (generowany)
├── wines.html             # ← Nie edytować! (generowany)
├── collections.html       # ← Nie edytować! (generowany)
├── template-editor.html   # ← Nie edytować! (generowany)
└── kreator.html           # ← Nie edytować! (generowany)
```

**WYJĄTKI - Edytować bezpośrednio** (nie są budowane):
```
✅ pdf-editor.html         # Edytor PDF - NIE jest budowany
✅ settings/index.html     # Strona ustawień - NIE jest budowany
```

**ZBĘDNE DUPLIKATY**:
```
❌ wines copy.html         # Duplikat
❌ a5-card — kopia.html    # Duplikat
```

#### 2.3 Komponenty (public/components/) ✅ WSZYSTKIE NIEZBĘDNE
```
components/
└── navigation.html        # Nawigacja używana przez INCLUDE
```

#### 2.4 Układy (public/layouts/) ✅ NIEZBĘDNE
```
layouts/
└── (jeśli istnieją)       # Używane przez system budowania HTML
```

#### 2.5 JavaScript - Moduły Główne ✅ WSZYSTKIE NIEZBĘDNE
```
js/
├── api.js                 # Warstwa komunikacji z API
├── app.js                 # Inicjalizacja aplikacji
├── config.js              # Konfiguracja JS
├── utils.js               # Funkcje pomocnicze
├── navigation-loader.js   # Ładowanie nawigacji
├── notification-service.js # System powiadomień
├── branding.js            # Branding
├── theme-*.js             # System motywów (4 pliki)
├── settings.js            # Ustawienia
└── dashboard.js           # Dashboard
```

#### 2.6 JavaScript - Komponenty ✅ WSZYSTKIE NIEZBĘDNE
```
js/components/
├── wines.js               # Zarządzanie winami
├── collections.js         # Zarządzanie kolekcjami
├── collections-init.js    # Inicjalizacja kolekcji
├── CollectionFieldsManager.js  # Pola kolekcji
├── pdfEditor.js           # Edytor PDF
├── pdfTemplates.js        # Szablony PDF
├── TemplateEditor.js      # Edytor szablonów
├── CustomFormatsManager.js # Zarządzanie formatami
├── import.js              # Import danych
├── wizard.js              # Kreator
├── navigation.js          # Nawigacja
├── NavigationComponent.js # Komponent nawigacji
├── ComponentsManager.js   # Zarządca komponentów
├── ContentSectionManager.js # Zarządca sekcji
├── DataTable.js           # Tabele danych
├── Modal.js               # Modale
└── OptionsPage.js         # Strona opcji
```

#### 2.7 JavaScript - Konfiguracja ✅ WSZYSTKIE NIEZBĘDNE
```
js/config/
├── wine-fields.js                    # Konfiguracja pól win
├── collection-fields.js              # Konfiguracja pól kolekcji
├── collection-wizard-config.js       # Główna konfig kreatora
├── collection-wizard-config-part1.js # Część 1 kreatora
├── collection-wizard-config-part2.js # Część 2 kreatora
├── contact-wizard-config.js          # Konfig kontaktów
├── html-components.js                # Komponenty HTML
└── NavigationConfig.js               # Konfiguracja nawigacji
```

#### 2.8 JavaScript - Core ✅ WSZYSTKIE NIEZBĘDNE
```
js/core/
├── Component.js           # Klasa bazowa komponentów
└── Store.js               # Store danych
```

#### 2.9 CSS ✅ WSZYSTKIE NIEZBĘDNE
```
css/
├── style.css              # Style główne
├── components.css         # Style komponentów
├── navigation.css         # Style nawigacji
├── notifications.css      # Style powiadomień
├── modern-admin.css       # Styl admin
├── wizard.css             # Style kreatora
├── theme-*.css            # Motywy (3 pliki)
├── design-tokens.css      # Tokeny designu
├── utilities.css          # Utility classes
├── dark-mode.css          # Tryb ciemny
└── edytorapi.css          # Style edytora API
```

#### 2.10 Zasoby (public/images/) ✅ NIEZBĘDNE
```
images/
├── branding/              # Logo i branding
│   └── Logo-white.png
└── okladki/               # Okładki (7 plików PNG/JPG)
    ├── A4-Karta-win_okladka1.png
    ├── A4-Karta-win_okladka5_210x297.png
    ├── Karta-win_okladka1_270x297.png
    ├── Karta-win_okladka2_270x297.png
    ├── Karta-win_okladka3_265x287.png
    ├── Karta-win_okladka4_270x274.png
    └── Karta-win_okladka6_270x297.png
```

#### 2.11 Katalogi Robocze ✅ NIEZBĘDNE (ale zawartość tymczasowa)
```
uploads/branding/          # Przesłane logo (generowane dynamicznie)
pdf-output/                # Wygenerowane PDF (5 plików - można wyczyścić)
pdfs/                      # Dodatkowe PDF (puste lub tymczasowe)
```

---

### 📊 3. DANE I KONFIGURACJA (data/)

#### 3.1 Dane Główne ✅ NIEZBĘDNE
```
data/
├── wines.json             # Baza win - GŁÓWNY PLIK DANYCH
├── collections.json       # Kolekcje win
├── fields-config.json     # Konfiguracja pól win (dynamiczne)
├── collection-fields-config.json  # Konfiguracja pól kolekcji
├── pdf-templates.json     # Szablony PDF
├── html-templates.json    # Szablony HTML
├── custom-pdf-formats.json # Niestandardowe formaty PDF
├── template-categories.json # Kategorie szablonów
├── theme-settings.json    # Ustawienia motywu
└── pdf-jobs.json          # Kolejka zadań PDF
```

#### 3.2 Backupy Automatyczne ⚠️ MOŻNA USUNĄĆ (zachowaj najnowsze)
```
❌ wines.json.backup                      # ~2 MB
❌ wines.json.backup-auto-fix-*           # 3 pliki, każdy ~2 MB
❌ wines.json.backup-before-poj-addition  # ~2 MB
❌ wines.json.backup-before-variety-cleanup # ~2 MB
❌ html-templates.json.backup             # <1 MB
❌ custom-pdf-formats.json.backup         # <1 MB
```

**REKOMENDACJA**: Zachowaj TYLKO `wines.json.backup` (najnowszy), usuń resztę.

#### 3.3 Stare Kolekcje ❓ DO WERYFIKACJI
```
❓ collection-5_produkt_w-1761035508769.json
❓ collection-6_kolory.json
❓ collection-6_prod6.json
❓ collection-bia_e-1760893931891.json
❓ collection-win.json
❓ collection-winabiale.json
❓ collections — kopia.json               # DUPLIKAT - usunąć
```

**WERYFIKACJA**: Sprawdź czy te kolekcje są nadal używane w `collections.json`. Jeśli nie - można usunąć.

#### 3.4 Eksporty/Cache ⚠️ MOŻNA USUNĄĆ
```
❌ template_export_1547703.json          # Eksport tymczasowy
```

#### 3.5 Zasoby Graficzne w data/ ❓ DO WERYFIKACJI
```
❓ 80422.png               # Nieznany cel - sprawdzić
❓ Pozycja.png             # Nieznany cel
❓ tlo-a4ispad.jpg         # Tło - sprawdzić użycie
```

#### 3.6 Ustawienia (data/settings/) ✅ NIEZBĘDNE
```
settings/
└── appearance.json        # Ustawienia wyglądu
```

#### 3.7 Subfolder data/1x/ ❓ DO WERYFIKACJI
```
1x/                        # Sprawdzić zawartość
```

---

### 🛠️ 4. SKRYPTY I NARZĘDZIA (scripts/)

#### 4.1 Skrypty Produkcyjne ✅ NIEZBĘDNE
```
scripts/
├── build-html.js          # Budowanie HTML z componentów - KLUCZOWY
├── add-html-template.js   # Dodawanie szablonów
└── update-content-layout-defaults.js  # Aktualizacja defaultów
```

#### 4.2 Skrypty Pomocnicze ✅ PRZYDATNE
```
├── cleanup-wines.js       # Czyszczenie danych win
└── migrate-html.js        # Migracja HTML (jednorazowa)
```

#### 4.3 Skrypty Diagnostyczne ⚠️ OPCJONALNE
```
❓ diagnose-server.sh      # Diagnostyka (bash) - może nie działać na Windows
❓ integrate-theme-system.ps1 # Integracja motywu (jednorazowa?)
```

---

### ⚙️ 5. KONFIGURACJA PROJEKTU ✅ WSZYSTKIE NIEZBĘDNE

```
Główny katalog/
├── package.json           # Definitcja projektu, zależności, skrypty
├── tsconfig.json          # Konfiguracja TypeScript
├── jest.config.js         # Konfiguracja testów
├── ecosystem.config.json  # Konfiguracja PM2 (production)
├── .gitignore             # Wykluczenia Git (jeśli istnieje)
└── .env                   # Zmienne środowiskowe (jeśli istnieje)
```

---

### 📚 6. DOKUMENTACJA (docs/) ✅ WIĘKSZOŚĆ NIEZBĘDNA

#### 6.1 Dokumentacja Systemowa - KLUCZOWA
```
docs/
├── DYNAMIC_FIELDS_SYSTEM.md        # System dynamicznych pól - KLUCZOWY
├── COLLECTION_FIELDS_IMPLEMENTATION.md
├── CATEGORY_MANAGEMENT.md
├── AUTOMATED_FIELDS_SYNC.md
├── IMPORT_FIELD_VALIDATION.md
├── EXPORT_FUNCTIONALITY.md
└── field-management.md
```

#### 6.2 Dokumentacja UI/UX
```
├── CUSTOM-FORMATS-UI-IMPLEMENTATION.md
├── NAVIGATION-COMPONENT.md
├── NOTIFICATION_SYSTEM.md
├── THEME-SYSTEM.md
├── DESIGN_SYSTEM_*.md              # 4 pliki systemu designu
└── CONTROLS-BAR-IMPLEMENTATION.md
```

#### 6.3 Dokumentacja Historyczna ⚠️ ARCHIWALNA
```
❓ CASE_INSENSITIVE_CATEGORIES_FIXED.md  # Historyczna - można archiwizować
❓ FIELDS-PERSISTENCE-FIXED.md
❓ FINAL-TEST-DYNAMIC-FIELDS.md
❓ REMOVED_ADMIN_HTML.md
❓ WINE-CARDS-FIXES.md
❓ SYSTEM_UPDATES_OCT_2025.md
❓ V2.0.0-RELEASE-SUMMARY.md
❓ MODERNIZATION_SUMMARY.md
```

**REKOMENDACJA**: Przenieść dokumentację historyczną do `docs/archive/`.

#### 6.4 Przykłady i Statusy
```
├── examples/                       # Przykłady kodu
├── CATEGORY_STATUS.md
└── README-WIZARD.md
```

---

### 📖 7. DOKUMENTACJA GŁÓWNA ✅ WSZYSTKIE NIEZBĘDNE

```
Główny katalog/
├── README.md                      # Główna dokumentacja - KLUCZOWA
├── DEVELOPMENT_RULES.md           # Zasady rozwoju - KLUCZOWA
├── AGENT_INSTRUCTIONS.md          # Instrukcje dla AI agentów
├── .github/copilot-instructions.md # Instrukcje GitHub Copilot
├── DEPLOYMENT-GUIDE.md            # Przewodnik wdrożenia
├── INSTRUKCJA_WDROZENIA.md        # Instrukcja wdrożenia (PL)
├── SERVER_STRUCTURE.md            # Struktura serwera
├── PRODUCTION_README.md           # README produkcyjne
├── DEPLOYMENT_CHECKLIST_*.md      # Checklista wdrożenia
├── HOTFIX_README.md               # Instrukcje hotfixów
├── QUICK_FIX_503.md               # Quick fix błędu 503
└── TEST_USTAWIEN.md               # Testy ustawień
```

---

### 🧪 8. TESTY (__tests__/)

```
__tests__/
├── dataStore.test.ts      # ✅ Testy serwisu DataStore - NIEZBĘDNY
└── test.html              # ❌ Plik testowy HTML - ZBĘDNY
```

---

### 📦 9. BUILD OUTPUT (dist/) ⚠️ GENEROWANY

```
dist/                      # Katalog wygenerowany przez `npm run build:ts`
                          # Zawiera skompilowany JavaScript z TypeScript
                          # NIE NALEŻY EDYTOWAĆ - jest generowany
                          # Można usunąć i przebudować: npm run build
```

---

### 🗂️ 10. NODE_MODULES

```
node_modules/              # Zależności npm
                          # NIE COMMITOWAĆ DO GITA
                          # Instalowane przez: npm install
                          # Można usunąć i zainstalować ponownie
```

---

## ❌ PLIKI ZBĘDNE DO BEZPIECZNEGO USUNIĘCIA

### 🔴 PRIORYTET 1: Wielkie Foldery Backup (~421 MB)

```bash
# MOŻNA BEZPIECZNIE USUNĄĆ:
❌ backup_before_wizard_20260219_104505/      # 0 MB (prawie pusty)
❌ backup_before_wizard_20260219_104511/      # 0.95 MB
❌ backup_restore_point_20260219_122655/      # 4.6 MB
❌ backup_restore_point_20260223_212808/      # 4.95 MB
❌ pdfwinegenerator_production_20251125_100152/ # 411.67 MB ⚠️ NAJWIĘKSZY

# Razem: ~422 MB
```

**UWAGA**: Jeśli chcesz zachować punkt przywrócenia, zachowaj TYLKO najnowszy: `backup_restore_point_20260223_212808/` lub stwórz nowy przed usunięciem.

### 🟡 PRIORYTET 2: Pliki Testowe i Debugowe HTML (public/)

```bash
# 24 pliki testowe/debugowe - WSZYSTKIE MOŻNA USUNĄĆ:
❌ public/test-*.html                         # 14 plików
❌ public/debug-*.html                        # 3 pliki
❌ public/diagnose-api.html
❌ public/example-page.html
❌ public/navigation-demo.html
❌ public/success.html
❌ public/table.html
❌ public/szablon*.html                       # 3 pliki
```

**UWAGA**: Te pliki mogą być przydatne do debugowania. Rozważ przeniesienie do `public/_archived_tests/` zamiast usuwania.

### 🟡 PRIORYTET 3: Katalog Deprecated (public/_deprecated/)

```bash
❌ public/_deprecated/                        # Cały katalog
   ├── tests/                                 # Stare testy
   └── old-tools/                             # Stare narzędzia
```

### 🟠 PRIORYTET 4: Duplikaty i Kopie

```bash
# Backend:
❌ src/services/pdfService — kopia.ts         # Duplikat pdfService.ts

# Frontend HTML:
❌ public/pages/wines copy.html               # Duplikat wines.html
❌ public/wines copy.html                     # Generowany duplikat
❌ public/a5-card — kopia.html                # Duplikat

# Dane:
❌ data/collections — kopia.json              # Duplikat collections.json
```

### 🟠 PRIORYTET 5: Backupy Danych (zachowaj najnowsze)

```bash
# W data/:
❌ wines.json.backup-auto-fix-1760614645843   # Stary backup
❌ wines.json.backup-auto-fix-1760614936666   # Stary backup
❌ wines.json.backup-auto-fix-1760615207268   # Stary backup (najnowszy z auto-fix)
❌ wines.json.backup-before-poj-addition      # Stary backup
❌ wines.json.backup-before-variety-cleanup   # Stary backup

# ZACHOWAJ:
✅ wines.json.backup                          # Najnowszy backup główny
✅ html-templates.json.backup                 # Backup szablonów
✅ custom-pdf-formats.json.backup             # Backup formatów
```

### 🟢 PRIORYTET 6: Pliki Tymczasowe (niski priorytet, małe rozmiary)

```bash
# Root:
❌ debug-categories-output.html               # Debug output
❌ template-fixed.html                        # Tymczasowy plik
❌ new-template-category-list.json            # Tymczasowa lista

# Data:
❌ data/template_export_1547703.json          # Eksport tymczasowy

# Public output (można wyczyścić):
⚠️ public/pdf-output/*.pdf                    # 5 plików PDF (można usunąć stare)
⚠️ public/uploads/branding/*                  # Stare loga (sprawdzić które używane)

# Tests:
❌ __tests__/test.html                        # Testowy HTML
```

### ⚠️ DO WERYFIKACJI PRZED USUNIĘCIEM

```bash
# Kolekcje - sprawdzić czy używane:
❓ data/collection-5_produkt_w-*.json
❓ data/collection-6_kolory.json
❓ data/collection-6_prod6.json
❓ data/collection-bia_e-*.json
❓ data/collection-win.json
❓ data/collection-winabiale.json

# Obrazy w data/ - sprawdzić użycie:
❓ data/80422.png
❓ data/Pozycja.png
❓ data/tlo-a4ispad.jpg
❓ data/1x/                                   # Sprawdzić zawartość

# Skrypty jednorazowe:
❓ scripts/migrate-html.js                    # Jeśli migracja już wykonana
❓ scripts/integrate-theme-system.ps1         # Jeśli już zintegrowane
❓ scripts/diagnose-server.sh                 # Może nie działać na Windows

# Dokumentacja historyczna:
❓ docs/*FIXED.md                             # Historyczne fix notes
❓ docs/*SUMMARY.md                           # Podsumowania wersji
❓ docs/SYSTEM_UPDATES_*.md                   # Stare updaty
```

---

## 📋 PROCEDURA CZYSZCZENIA (Krok po kroku)

### Etap 1: Bezpieczne Backupy (ZAWSZE PRZED USUWANIEM!)

```bash
# 1. Stwórz punkt przywrócenia Git
git add -A
git commit -m "Przed czyszczeniem plików - backup"
git tag backup-before-cleanup-2026-03-04

# 2. Dodatkowo zrób zewnętrzny backup ważnych danych
New-Item -ItemType Directory -Path "../backup_manual_$(Get-Date -Format 'yyyyMMdd')" -Force
Copy-Item "data/wines.json" "../backup_manual_$(Get-Date -Format 'yyyyMMdd')/"
Copy-Item "data/collections.json" "../backup_manual_$(Get-Date -Format 'yyyyMMdd')/"
```

### Etap 2: Usuwanie Wielkich Folderów Backup

```powershell
# Usuń stare backupy (~422 MB):
Remove-Item -Recurse -Force "backup_before_wizard_20260219_104505"
Remove-Item -Recurse -Force "backup_before_wizard_20260219_104511"
Remove-Item -Recurse -Force "backup_restore_point_20260219_122655"
Remove-Item -Recurse -Force "backup_restore_point_20260223_212808"
Remove-Item -Recurse -Force "pdfwinegenerator_production_20251125_100152"
```

### Etap 3: Czyszczenie Plików Testowych

```powershell
# Opcjonalnie: przenieś testy do archiwum
New-Item -ItemType Directory -Path "public/_archived_tests" -Force
Move-Item "public/test-*.html" "public/_archived_tests/" -ErrorAction SilentlyContinue
Move-Item "public/debug-*.html" "public/_archived_tests/" -ErrorAction SilentlyContinue

# LUB usuń bezpośrednio:
Remove-Item "public/test-*.html"
Remove-Item "public/debug-*.html"
Remove-Item "public/diagnose-api.html"
Remove-Item "public/example-page.html"
Remove-Item "public/navigation-demo.html"
Remove-Item "public/szablon*.html"
```

### Etap 4: Usuwanie Deprecated

```powershell
Remove-Item -Recurse -Force "public\_deprecated"
```

### Etap 5: Usuwanie Duplikatów

```powershell
# Backend:
Remove-Item "src\services\pdfService — kopia.ts"

# Frontend:
Remove-Item "public\pages\wines copy.html"
Remove-Item "public\wines copy.html"
Remove-Item "public\a5-card — kopia.html"

# Data:
Remove-Item "data\collections — kopia.json"
```

### Etap 6: Czyszczenie Starych Backupów Danych

```powershell
# Zachowaj główny backup, usuń resztę:
Remove-Item "data\wines.json.backup-auto-fix-*"
Remove-Item "data\wines.json.backup-before-poj-addition"
Remove-Item "data\wines.json.backup-before-variety-cleanup"
```

### Etap 7: Weryfikacja i Test

```bash
# 1. Przebuduj projekt
npm run build

# 2. Uruchom testy
npm test

# 3. Wystartuj serwer
npm run dev

# 4. Sprawdź główne funkcjonalności:
#    - Otwórz http://localhost:3001
#    - Sprawdź strony: wina, kolekcje, PDF editor
#    - Przetestuj generowanie PDF
#    - Przetestuj import danych
```

### Etap 8: Commit Zmian

```bash
git add -A
git commit -m "Czyszczenie projektu - usunięto ~500MB zbędnych plików"
git push
```

---

## 📊 PODSUMOWANIE OSZCZĘDNOŚCI

| Kategoria | Rozmiar | Pliki | Priorytet |
|-----------|---------|-------|-----------|
| **Foldery backup** | ~422 MB | 5 folderów | 🔴 Wysoki |
| **Pliki testowe HTML** | ~2 MB | 24 pliki | 🟡 Średni |
| **Katalog _deprecated** | ~5 MB | ~70 plików | 🟡 Średni |
| **Duplikaty** | ~10 MB | 6 plików | 🟠 Średni |
| **Stare backupy danych** | ~10 MB | 5 plików | 🟠 Średni |
| **Pliki tymczasowe** | ~5 MB | ~10 plików | 🟢 Niski |
| **Dokumentacja archiwalna** | <1 MB | ~10 plików | 🟢 Niski |
| **CAŁOŚĆ** | **~455 MB** | **~130 plików/folderów** | - |

---

## 🎯 REKOMENDACJE KOŃCOWE

### ✅ DO ZROBIENIA:
1. **Backup przed czyszczeniem** - OBOWIĄZKOWO
2. **Usuń wielkie backupy** - Oszczędność 422 MB
3. **Przenieś lub usuń pliki testowe** - Zachowaj clean public/
4. **Usuń duplikaty** - Uniknij zamieszania
5. **Zachowaj TYLKO najnowszy backup wines.json**
6. **Weryfikuj stare kolekcje** - Usuń jeśli nie używane
7. **Archiwizuj dokumentację historyczną** - Przenieś do docs/archive/

### ⚠️ ZACHOWAJ:
- Wszystkie pliki w `src/` (poza "— kopia")
- Wszystkie pliki w `public/js/`, `public/css/`, `public/components/`
- `public/pages/` - pliki źródłowe HTML
- `pdf-editor.html`, `settings/index.html` - nie są budowane
- Główne pliki danych w `data/`
- Jeden najnowszy backup każdego pliku
- Dokumentację systemową w `docs/`

### 🔒 NIE USUWAJ:
- `node_modules/` - ale można usunąć i zainstalować ponownie (`npm install`)
- `dist/` - można usunąć i przebudować (`npm run build`)
- Aktywne dane w `data/*.json` (bez .backup)
- Pliki konfiguracyjne (package.json, tsconfig.json, etc.)

---

## 📞 PYTANIA DO ROZPATRZENIA

### 1. Stare Kolekcje w data/
Sprawdź w `data/collections.json` czy kolekcje o nazwach:
- `collection-5_produkt_w-*`
- `collection-6_*`
- `collection-bia_e-*`
- `collection-win`
- `collection-winabiale`

są nadal referencjonowane. Jeśli nie - usuń te pliki.

### 2. Obrazy w data/
Zweryfikuj użycie:
- `80422.png`
- `Pozycja.png`
- `tlo-a4ispad.jpg`

Sprawdź w kodzie (`grep -r "80422.png"`) czy są używane.

### 3. PDF Output
W `public/pdf-output/` są 5 plików PDF. Sprawdź daty - jeśli stare, usuń.

### 4. Uploads Branding
W `public/uploads/branding/` sprawdź które logo jest aktualnie używane, usuń stare wersje.

---

**KONIEC ANALIZY**
