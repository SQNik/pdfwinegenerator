# 🧹 Plan Czyszczenia Projektu

## 📊 Analiza Użycia Plików

### ✅ **AKTYWNE PLIKI** (NIE USUWAĆ)

#### HTML - Strony Produkcyjne:
- ✅ `index.html` - Dashboard (główna strona)
- ✅ `wines.html` - Zarządzanie winami
- ✅ `collections.html` - Zarządzanie kolekcjami
- ✅ `template-editor.html` - Edytor szablonów PDF

#### JavaScript - Komponenty Produkcyjne:
- ✅ `api.js` - API client (używany wszędzie)
- ✅ `app.js` - Główna aplikacja dashboard
- ✅ `branding.js` - Logo i branding
- ✅ `config.js` - Konfiguracja globalna
- ✅ `utils.js` - Funkcje pomocnicze
- ✅ `components/wines.js` - Zarządzanie winami
- ✅ `components/collections.js` - Zarządzanie kolekcjami
- ✅ `components/CollectionFieldsManager.js` - Dynamiczne pola kolekcji
- ✅ `components/TemplateEditor.js` - Edytor szablonów
- ✅ `components/CustomFormatsManager.js` - Zarządzanie formatami PDF
- ✅ `components/import.js` - Import CSV/Google Sheets
- ✅ `config/wine-fields.js` - Konfiguracja pól win
- ✅ `config/collection-fields.js` - Konfiguracja pól kolekcji

### ⚠️ **DUPLIKATY** (Źródła Modern UI - można usunąć po testach)

Te pliki to źródła modern UI, które zostały już skopiowane do głównych plików:

- ⚠️ `index-modern.html` → skopiowano do `index.html`
- ⚠️ `wines-modern.html` → skopiowano do `wines.html`
- ⚠️ `collections-modern.html` → skopiowano do `collections.html`
- ⚠️ `template-editor-modern.html` → skopiowano do `template-editor.html`

**Rekomendacja:** Zachować przez 1-2 tygodnie jako backup, potem usunąć.

### 🗑️ **DO USUNIĘCIA** - Pliki Testowe

#### Pliki HTML Testowe (nigdzie nie linkowane):
- 🗑️ `test-fields-manager.html` - Test managera pól
- 🗑️ `test-fields.html` - Test pól dynamicznych
- 🗑️ `test-export.html` - Test exportu
- 🗑️ `test-custom-formats.html` - Test formatów PDF
- 🗑️ `test-csv-import.html` - Test importu CSV
- 🗑️ `test-crud-interface.html` - Test interfejsu CRUD
- 🗑️ `test-template-editor.html` - Test edytora szablonów
- 🗑️ `test-modal-form.html` - Test formularzy modalnych
- 🗑️ `test-wine-fields-integration.html` - Test integracji pól
- 🗑️ `test-html-pdf.html` - Test generowania PDF
- 🗑️ `test-collection-fields.html` - Test pól kolekcji
- 🗑️ `test-category-static.html` - Test statycznych kategorii
- 🗑️ `test-category-form.html` - Test formularzy kategorii

#### Pliki Debug (przestarzałe):
- 🗑️ `debug-fields.html` - Debug pól
- 🗑️ `debug-form.html` - Debug formularzy
- 🗑️ `debug-wines.html` - Debug win
- 🗑️ `diagnose-api.html` - Diagnostyka API
- 🗑️ `edytor-api.html` - Stary edytor API

#### Inne Nieużywane:
- 🗑️ `navigation-demo.html` - Demo nawigacji
- 🗑️ `szablon-test.html` - Test szablonów
- 🗑️ `options.html` - Opcje (nieużywane)
- 🗑️ `success.html` - Strona sukcesu (nieużywana)
- 🗑️ `public/public/` - Błędny folder (duplikat)
- 🗑️ `public/wines.json` - Testowy plik JSON (duplikat danych)

### ❓ **DO PRZEANALIZOWANIA** - Komponenty JS

#### Potencjalnie Nieużywane:
- ❓ `components/fields.js` - Czy używany? (sprawdzić import)
- ❓ `components/pdfEditor.js` - Czy używany? (sprawdzić vs TemplateEditor.js)
- ❓ `components/pdfTemplates.js` - Czy używany?
- ❓ `components/ContentSectionManager.js` - Czy używany?
- ❓ `components/NavigationComponent.js` - Czy używany?
- ❓ `components/OptionsPage.js` - Czy używany?
- ❓ `config/NavigationConfig.js` - Czy używany?
- ❓ `edytorapi.js` - Stary plik API?

### 🔍 **OBSOLETE PDF TOOLS** (przestarzałe przed Template Editor)

Pliki z okresu przed implementacją Template Editor:
- 🗑️ `pdf-editor.html` - Stary edytor PDF (zastąpiony przez template-editor.html)
- 🗑️ `pdf-templates.html` - Stare szablony PDF (zastąpione przez Template Editor)

## 📋 **Plan Działania**

### Krok 1: Przeniesienie do `_deprecated`
```powershell
# Testy
test-*.html → _deprecated/tests/

# Debug
debug-*.html, diagnose-*.html, edytor-api.html → _deprecated/debug/

# Stare narzędzia
pdf-editor.html, pdf-templates.html → _deprecated/old-tools/

# Inne
navigation-demo.html, szablon-test.html, options.html, success.html → _deprecated/misc/
```

### Krok 2: Analiza Komponentów JS
Sprawdzić użycie każdego z `❓` plików przed decyzją.

### Krok 3: Po Testach (za 1-2 tygodnie)
Usunąć pliki `-modern.html` jeśli wszystko działa poprawnie.

## 🛡️ **Bezpieczeństwo**

**NIGDY nie usuwaj bez backupu:**
- Wszystkie pliki HTML produkcyjne
- Wszystkie komponenty JS używane w produkcji
- Pliki konfiguracyjne
- Pliki CSS

**Zachowaj backup-old-files:** Zawiera oryginalne wersje przed migracją do modern UI.
