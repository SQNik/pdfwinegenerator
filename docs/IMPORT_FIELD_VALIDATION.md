# 🔍 WALIDACJA PÓL IMPORTU - System walidacji kompatybilności pól

## 🎯 Problem rozwiązany
**Przed importem z CSV i Google Sheets system teraz zawsze sprawdza czy importowane pola odpowiadają dostępnym polom dynamicznym. Jeśli nie - wskazuje pole do poprawy zanim zaimportuje.**

## ✅ Implementacja

### 1. **Funkcja walidacji pól (`validateImportFields`)**
```typescript
private validateImportFields(importColumns: string[]): {
  valid: boolean;
  errors: string[];
  mappedFields: Record<string, string>;
  unmappedColumns: string[];
}
```

**Funkcjonalność:**
- ✅ **Case-insensitive matching** - ignoruje różnice w wielkości liter
- ✅ **Intelligent mapping** - automatyczne mapowanie alternatywnych nazw kolumn:
  - `variety` → `szczepy`
  - `vol` / `volume` → `poj` 
  - `catalog` → `catalogNumber`
- ✅ **Comprehensive validation** - sprawdza wszystkie kolumny względem konfiguracji dynamicznej
- ✅ **Detailed error reporting** - konkretne błędy dla każdej nieprawidłowej kolumny

### 2. **Import CSV - walidacja przed parsowaniem**
```typescript
// 🔍 WALIDACJA PÓL PRZED IMPORTEM
logger.info(`🔍 Sprawdzanie kompatybilności pól CSV z konfiguracją dynamiczną...`);
logger.info(`📋 Znalezione kolumny CSV: ${headers.join(', ')}`);

const fieldValidation = this.validateImportFields(headers);

if (!fieldValidation.valid) {
  logger.error('❌ Błędy walidacji pól CSV:');
  fieldValidation.errors.forEach(error => logger.error(`   - ${error}`));
  
  const response: ApiResponse = {
    success: false,
    error: 'Nieprawidłowe pola CSV',
    validationErrors: fieldValidation.errors.map((error, index) => ({
      field: fieldValidation.unmappedColumns[index] || 'unknown',
      message: error,
      value: ''
    }))
  };
  
  res.status(400).json(response);
  return;
}
```

### 3. **Import Google Sheets - walidacja po parsowaniu**
```typescript
// 🔍 WALIDACJA PÓL PRZED IMPORTEM Z GOOGLE SHEETS  
if (results.length > 0 && results[0]) {
  const headers = Object.keys(results[0]);
  logger.info(`🔍 Sprawdzanie kompatybilności pól Google Sheets z konfiguracją dynamiczną...`);
  logger.info(`📋 Znalezione kolumny Google Sheets: ${headers.join(', ')}`);
  
  const fieldValidation = this.validateImportFields(headers);
  
  if (!fieldValidation.valid) {
    // ... analogiczne obsługa błędów
  }
}
```

### 4. **Mapowanie pól (Field Mapping)**
```typescript
const fieldMapping: Record<string, string> = {
  'name': 'name',
  'region': 'region', 
  'type': 'type',
  'alcohol': 'alcohol',
  'description': 'description',
  'category': 'category',
  'szczepy': 'szczepy',
  'variety': 'szczepy',      // ✨ Alternatywna nazwa
  'vol': 'poj',
  'volume': 'poj',           // ✨ Alternatywna nazwa
  'poj': 'poj',
  'catalogNumber': 'catalogNumber',
  'catalog': 'catalogNumber', // ✨ Alternatywna nazwa
  'image': 'image',
  'price1': 'price1',
  'price2': 'price2'
};
```

## 🔄 Przepływ walidacji

### Import CSV:
1. **Parse headers** z pierwszej linii CSV
2. **Validate fields** przeciwko konfiguracji dynamicznej  
3. **Stop import** jeśli pola są nieprawidłowe
4. **Show detailed errors** ze wskazaniem dostępnych pól
5. **Continue import** tylko jeśli wszystkie pola są OK

### Import Google Sheets:
1. **Parse CSV** z Google Sheets URL
2. **Extract headers** z pierwszego rekordu
3. **Validate fields** przeciwko konfiguracji dynamicznej
4. **Stop import** jeśli pola są nieprawidłowe
5. **Continue processing** tylko jeśli wszystkie pola są OK

## 🎯 Korzyści

### ✅ **Bezpieczeństwo danych:**
- **Zapobiega importom** z nieprawidłowymi polami
- **Chroni integralność** bazy danych
- **Eliminuje silent failures** - każdy błąd jest raportowany

### ✅ **User Experience:**
- **Jasne komunikaty błędów** ze wskazaniem problematycznych pól
- **Lista dostępnych pól** dla łatwej poprawy
- **Intelligent mapping** - automatyczne rozpoznawanie alternatywnych nazw

### ✅ **Maintainability:**
- **Centralized validation** - jedna funkcja dla wszystkich typów importu
- **Dynamic field support** - automatycznie używa aktualnej konfiguracji pól
- **Extensible mapping** - łatwe dodawanie nowych alternatywnych nazw

## 📝 Przykłady użycia

### ❌ **Import z nieprawidłowymi polami:**
```
CSV: "badField1,wrongColumn,name,region"
Błąd: "Nieznana kolumna: badField1, wrongColumn"
Dostępne pola: alcohol, catalogNumber, category, description, image, name, poj, price1, price2, region, szczepy, type
```

### ✅ **Import z prawidłowymi polami:**
```
CSV: "name,region,variety,vol,catalog"
Mapowanie: name→name, region→region, variety→szczepy, vol→poj, catalog→catalogNumber
Status: Import rozpoczęty pomyślnie
```

## 🧪 **Testowanie**

Stworzono skrypt testowy `test-import-validation.js` weryfikujący:
- Import z nieprawidłowymi polami → błąd walidacji
- Import z prawidłowymi polami → pomyślny import
- Intelligent mapping alternatywnych nazw
- Detailed error reporting

## 📄 **Pliki zmodyfikowane:**
- `src/controllers/importController.ts` - główna logika walidacji
- `test-import-validation.js` - testy funkcjonalności (nowy)

**Status**: ✅ **ZAIMPLEMENTOWANE - System walidacji pól importu w pełni funkcjonalny**

## 🚀 **Jak używać:**

1. **Przygotuj CSV/Google Sheets** z prawidłowymi nazwami kolumn
2. **Uruchom import** przez UI lub API
3. **System automatycznie zwaliduje** pola przed importem
4. **Jeśli błąd** - popraw nazwy kolumn według wskazówek
5. **Import zostanie wykonany** tylko jeśli wszystkie pola są OK

**System teraz chroni przed błędnymi importami i wskazuje dokładnie co poprawić!** 🛡️