# 🔒 REGUŁA: TYLKO POLA DYNAMICZNE W OBSŁUDZE WIN

## KRYTYCZNA ZASADA SYSTEMU

**W obsłudze win ZAWSZE bazować WYŁĄCZNIE na polach dynamicznych zdefiniowanych w zarządzaniu polami win (`fields-config.json`).**

### ❌ ZABRONIONE:
- Dodawanie pól hardcoded w kodzie
- Używanie pól nie zdefiniowanych w konfiguracji dynamicznej
- Tworzenie "ukrytych" pól w backend/frontend

### ✅ DOZWOLONE:
- Tylko pola z `fields-config.json`
- Pola systemowe: `id`, `createdAt`, `updatedAt` (automatyczne)
- Nowe pola TYLKO przez interfejs zarządzania polami

### 🎯 IMPLEMENTACJA:
1. **Backend**: Wszystkie kontrolery używają `dataStore.getFieldsConfig()`
2. **Frontend**: WineFieldsManager ładuje pola z API `/api/fields/config`
3. **Walidacja**: Tylko pola z konfiguracji są akceptowane
4. **Formularze**: Generowane dynamicznie z `fieldsConfig.getFormFields()`

### 📋 PROCEDURA DODAWANIA NOWYCH PÓL:
1. Użytkownik używa interfejsu "Zarządzanie Polami Win"
2. System automatycznie aktualizuje `fields-config.json`
3. Real-time synchronizacja przez `fieldsConfigChanged` event
4. Wszystkie komponenty automatycznie obsługują nowe pole

**Ta zasada zapewnia pełną dynamiczność i eliminuje hardcoded dependencies.**