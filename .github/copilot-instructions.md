# Instrukcje GitHub Copilot - System Zarządzania Winami

## 🎯 Istota Projektu

**System Zarządzania Winami** to backend TypeScript/Express z modularnym frontendem vanilla-JS, który umożliwia użytkownikom końcowym całkowite dostosowanie struktury danych win i szablonów PDF poprzez interfejsy webowe—**bez zmian kodu**. Dwa rewolucyjne systemy napędzają to rozwiązanie: Dynamiczne Pola (wina + kolekcje) i Niestandardowe Formaty PDF.

**Kluczowe Technologie**: Node.js 18+, Express, TypeScript 5, pdf-lib, Bootstrap 5, przechowywanie JSON

---

## 🏗️ Krytyczne Decyzje Architektoniczne

### 0. 🚨 System Budowania HTML (NAJWAŻNIEJSZA ZASADA)
**KRYTYCZNE**: Projekt używa automatycznego systemu budowania HTML. **NIGDY** nie edytuj plików bezpośrednio w `public/` - zostaną nadpisane!

**Przepływ Budowania**:
```
public/pages/*.html (ŹRÓDŁA - edytuj tutaj)
       ↓
   npm run build
       ↓  
public/*.html (WYGENEROWANE - NIE EDYTUJ!)
```

**Zawsze Edytuj**: `public/pages/index.html`, `public/pages/wines.html`, `public/pages/collections.html`, `public/pages/template-editor.html`

**Nigdy Nie Edytuj**: `public/index.html`, `public/wines.html`, `public/collections.html`, `public/template-editor.html` (są generowane)

**Wyjątki** (edytuj bezpośrednio): `public/pdf-editor.html`, `public/settings/index.html` - NIE są budowane

**Po każdej edycji uruchom**: `npm run build:html` lub `npm run build`

**Zobacz**: [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) dla szczegółów

### 1. Pola Dynamiczne Sterowane Serwerem (Wzorzec Główny)
**ZASADA**: Wszystkie definicje pól pochodzą z serwera (`/api/fields/config`) — NIGDY nie hardkoduj pól.

**Przepływ Danych**:
```
Zmiana UI → WineFieldsManager → POST /api/fields/config → fieldsController → dataStore 
→ data/fields-config.json → CustomEvent('fieldsConfigChanged') → odświeżenie UI
```

**Pliki**: [public/js/components/wines.js](public/js/components/wines.js), [src/controllers/fieldsController.ts](src/controllers/fieldsController.ts), [docs/DYNAMIC_FIELDS_SYSTEM.md](docs/DYNAMIC_FIELDS_SYSTEM.md)

**Kluczowy Wzorzec**:
- Frontend ładuje pola z `/api/fields/config` przy inicjalizacji
- Każda zmiana konfiguracji pól emituje zdarzenie `fieldsConfigChanged`
- Komponenty nasłuchujące odświeżają schematy z danych serwera
- **Nigdy** nie używaj fallbacku do statycznej konfiguracji, jeśli pola serwera nie istnieją

### 2. System Identyfikatorów Biznesowych (`catalogNumber`)
Wszystkie kolekcje i eksporty odnoszą się do win poprzez `catalogNumber` (nie `_id`). System utrzymuje:
- `_id`: UUID dla operacji wewnętrznych
- `catalogNumber`: Unikalny identyfikator biznesowy
- Kolekcje przechowują tablice `catalogNumber` (nie `_id`)

**Pliki**: [src/services/dataStore.ts](src/services/dataStore.ts), [src/controllers/collectionController.ts](src/controllers/collectionController.ts)

### 3. Architektura Wielostronicowa z Izolowanym Stanem
Każda strona HTML (wines.html, collections.html, pdf-editor.html) niezależnie zarządza swoim stanem. Warstwa API ([public/js/api.js](public/js/api.js)) zapewnia spójną komunikację z backendem Express.

**Pliki**: public/*.html, src/app.ts (konfiguracja tras)

---

## 🔑 Kluczowe Komponenty i Przepływy Pracy

### Architektura Backendu
| Warstwa | Cel | Kluczowe Pliki |
|---------|-----|---------|
| **Serwisy** | Logika biznesowa (generowanie PDF, trwałość danych) | `pdfService.ts`, `dataStore.ts` |
| **Kontrolery** | Handlery tras + logika walidacji | `fieldsController.ts`, `wineController.ts` |
| **Trasy** | Definicje tras Express | `src/routes/*.ts` |
| **Typy** | Interfejsy TypeScript + walidacja JOI | `src/types/index.ts`, `src/validators/schemas.ts` |

### Potok Generowania PDF
```
Edytor Szablonu (frontend) → Zapis szablonu → POST /api/pdf/templates
→ pdfService.renderTemplate() → pdf-lib → /api/pdf/preview (wyjście HTML)
→ Puppeteer (renderowanie po stronie serwera) → bajty PDF
```

**Krytyczne**: Konwersja systemów współrzędnych (piksele canvas → punkty PDF), normalizacja kolorów (hex → rgb 0-1), warstwy elementów poprzez z-index.

### Dynamiczne Pola Kolekcji
Kolekcje mają własne pola dynamiczne (oddzielone od pól win). Zarządzane poprzez:
- [src/controllers/collectionFieldsController.ts](src/controllers/collectionFieldsController.ts)
- `data/collection-fields-config.json`
- Podobny przepływ oparty na zdarzeniach jak pola win

---

## 📋 Niezbędne Przepływy Pracy Deweloperów

### Budowanie i Uruchamianie
```bash
npm run dev              # Rozwój z gorącym przeładowaniem (ts-node-dev)
npm run build           # Kompilacja TypeScript + HTML → dist/ i public/
npm run build:ts        # Kompilacja tylko TypeScript
npm run build:html      # Kompilacja tylko HTML (public/pages/ → public/)
npm run watch:html      # Watch mode - auto-rebuild HTML przy zmianach
npm run dev:all         # Development z watch (TypeScript + HTML)
npm start               # Uruchomienie skompilowanego serwera
npm run check-fields    # Walidacja synchronizacji pól (wines.json ↔ fields-config.json)
npm run fix-fields      # Automatyczna naprawa niezgodności pól
```

### Testowanie i Walidacja
```bash
npm test                # Uruchomienie testów Jest
npm run lint            # ESLint dla TypeScript
npm run validate-data   # Sprawdzenie spójności pól i danych
```

### Synchronizacja Pól (Krytyczne)
Przed importowaniem dużych zbiorów danych:
1. Przejrzyj bieżące pola: `npm run check-fields`
2. Dodaj brakujące pola poprzez interfejs użytkownika jeśli potrzeba
3. Uruchom `npm run fix-and-check` po imporcie
4. **Dlaczego**: Zapobiega osieroconym wartościom dynamicznych pól w wines.json

---

## 🎨 Wzorzce Kodowe i Konwencje

### Wzorzce Backendu TypeScript
```typescript
// ❌ Nigdy: Bezpośrednia manipulacja plikami poza DataStore
// ✅ Zawsze: Używaj metod DataStore
const wines = await dataStore.getWines();
await dataStore.saveWine(wine);

// ❌ Nigdy: Hardkodowanie reguł walidacji
// ✅ Zawsze: Używaj schematów JOI z validators/schemas.ts
const schema = getWineValidationSchema(fieldsConfig);
const { error, value } = schema.validate(data);
```

### Wzorzce Frontendu JavaScript
```javascript
// ❌ Nigdy: Bezpośrednia manipulacja DOM bez delegacji zdarzeń
// ✅ Zawsze: Używaj architektury opartej na zdarzeniach
class WineManager {
    constructor() {
        document.addEventListener('fieldsConfigChanged', () => this.refreshFieldsConfig());
    }
}

// ❌ Nigdy: Hardkodowanie nazw pól w szablonach
// ✅ Zawsze: Dynamicznie generuj interfejs użytkownika z fieldsConfig
generateFormField(field) { /* czyta z konfiguracji serwera */ }
```

### Nazewnictwo Plików
- Backend: `camelCase.ts` (dataStore.ts)
- Frontend: `kebab-case.js` (wine-fields.js), HTML: `kebab-case.html`
- CSS: klasy `kebab-case` (.section-tab)

### Obsługa Błędów
- **Backend**: Strukturowane logowanie z Winston + interfejs ApiResponse
- **Frontend**: Try-catch z przyjazną dla użytkownika wiadomością
- **Walidacja**: Zwracaj `{ success, data?, error?, validationErrors? }`

---

## ⚠️ Częste Pułapki i Rozwiązania

| Problem | Przyczyna | Rozwiązanie |
|---------|-----------|------------|
| Zmiany pól nie aktualizują UI | Brakujący nasłuchiwacz zdarzenia | Dodaj `document.addEventListener('fieldsConfigChanged', ...)` |
| Kolory PDF są niewidoczne | Wartości RGB nie są znormalizowane | Zawsze dziel przez 255 przy przesyłaniu do pdf-lib |
| Niedopasowanie współrzędnych w PDF | Zamieszanie między systemem canvas a PDF | Użyj helpera `convertCanvasCoordinatesToPDF()` |
| Import milcząco zawodzi | Niezauważona niezgodność pól | Uruchom `npm run check-fields` przed importem |
| Zamieszanie `_id` z `catalogNumber` | Użycie niewłaściwego identyfikatora | Kolekcje używają tablic `catalogNumber` |

---

## 🚀 Dodawanie Funkcji (Krok po Kroku)

1. **Zdefiniuj Typy**: Dodaj interfejs do [src/types/index.ts](src/types/index.ts)
2. **Dodaj Walidację**: Stwórz schemat JOI w [src/validators/schemas.ts](src/validators/schemas.ts)
3. **Implementuj Backend**: Napisz metodę serwisu + kontroler + trasy
4. **Implementuj Frontend**: Stwórz klasę komponentu + obsługę zdarzeń + wywołania warstwy API
5. **Dokumentuj**: Aktualizuj [DYNAMIC_FIELDS_SYSTEM.md](docs/DYNAMIC_FIELDS_SYSTEM.md) lub podobny dokument
6. **Testuj**: Testy jednostkowe w `__tests__/`, testy ręczne na którychtkniętych stronach

**Przykład**: Aby dodać nowy typ pola wina:
- Dodaj do interfejsu FieldConfig (types/index.ts)
- Aktualizuj schemat walidacji
- Rozszerz WineFieldsManager.generateFormField()
- Rozszerz renderowanie tabeli w WineManager
- Testuj spójność pól-danych za pomocą `npm run check-fields`

---

## 📁 Odnośnik do Plików

| Plik | Cel | Kluczowe Eksporty |
|------|-----|-----------|
| [src/services/dataStore.ts](src/services/dataStore.ts) | Trwałość JSON + mapy w pamięci | Klasa DataStore (getWines, saveWine, itd.) |
| [src/services/pdfService.ts](src/services/pdfService.ts) | Renderowanie szablonów PDF | PDFService (renderTemplate, generatePreviewPDF) |
| [src/types/index.ts](src/types/index.ts) | Interfejsy TypeScript | Wine, FieldConfig, Template, itd. |
| [src/validators/schemas.ts](src/validators/schemas.ts) | Walidacja JOI | getWineValidationSchema(), getFieldConfigSchema() |
| [public/js/api.js](public/js/api.js) | Warstwa HTTP frontendu | api.getWines(), api.saveWine(), itd. |
| [public/js/components/wines.js](public/js/components/wines.js) | Interfejs CRUD win | Klasy WineManager, WineFieldsManager |
| [data/fields-config.json](data/fields-config.json) | Bieżące pola win | Tablica obiektów FieldConfig |
| [public/pages/*.html](public/pages/) | Źródłowe pliki HTML | Pliki do edycji (budowane → public/) |
| [scripts/build-html.js](scripts/build-html.js) | Skrypt budowania HTML | Kompilator HTML z include'ami |

---

## 🔗 Powiązana Dokumentacja

- **[DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md)**: **PRZECZYTAJ NAJPIERW** - Zasady budowania HTML, edycji plików
- **[DYNAMIC_FIELDS_SYSTEM.md](docs/DYNAMIC_FIELDS_SYSTEM.md)**: Głębokie zagłębienie się w architekturę pól, antywzorce
- **[CATEGORY_MANAGEMENT.md](docs/CATEGORY_MANAGEMENT.md)**: Dynamiczny system kategorii i typów pól
- **[COLLECTION_FIELDS_IMPLEMENTATION.md](docs/COLLECTION_FIELDS_IMPLEMENTATION.md)**: CRUD pół kolekcji
- **[package.json](package.json)**: Skrypty, zależności, informacje o wersji
- **[AGENT_INSTRUCTIONS.md](AGENT_INSTRUCTIONS.md)**: Szczegółowe wzorzce edytora PDF (konwersja współrzędnych, obsługa kolorów)

---

## 💡 Szybki Model Mentalny

Myśl o systemie jako **trzech wzajemnie połączonych domenach**:

1. **Zarządzanie Winami**: Operacje CRUD na winach z polami dynamicznymi (zdefiniowanymi przez użytkownika)
2. **Zarządzanie Kolekcjami**: CRUD kolekcji + pola dynamiczne kolekcji + referencje catalogNumber
3. **Szablony PDF**: Edytor wizualny + renderowanie szablonów → podgląd/wyjście PDF

Wszystkie trzy domeny dzielą **wzorzec konfiguracji pól sterowany serwerem**: interfejs użytkownika ładuje schemat z API, użytkownik go modyfikuje, schemat utrwala się w JSON, wszystkie nasłuchujące interfejsy użytkownika odświeżają się.

---

**Ostatnia Aktualizacja**: Luty 2026 | System Zarządzania Winami v2.0.0+
