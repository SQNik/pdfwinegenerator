# 🔄 AUTOMATYZACJA SYNCHRONIZACJI PÓL DYNAMICZNYCH

## Przegląd systemu

System został w pełni zautomatyzowany, aby zapewnić synchronizację między polami dynamicznymi w konfiguracji (`fields-config.json`) a danymi win (`wines.json`).

## 🚀 Automatyczne procesy

### 1. **Sprawdzanie przed buildem**
```bash
npm run build  # Automatycznie sprawdza pola przed kompilacją
```

### 2. **Sprawdzanie przed importem**
- Import z Google Sheets automatycznie sprawdza synchronizację
- Blokuje import jeśli pola nie są zsynchronizowane
- Weryfikuje synchronizację po imporcie

### 3. **Middleware dla API**
- Wszystkie operacje na winach sprawdzają synchronizację
- Szybkie sprawdzenie istnienia plików konfiguracji
- Automatyczne logowanie problemów

## 🛠️ Dostępne komendy

### Sprawdzanie synchronizacji
```bash
npm run check-fields     # Sprawdź synchronizację pól
```

### Automatyczna naprawa
```bash
npm run fix-fields       # Napraw synchronizację automatycznie
npm run sync-fields      # Napraw i sprawdź (rekomendowane)
```

### Workflow developerski
```bash
npm run pre-import       # Przed importem danych
npm run post-import      # Po imporcie danych
npm run validate-data    # Walidacja struktury danych
```

## 🔧 Automatyczna naprawa

System automatycznie:

1. **Usuwa zbędne pola** - pola w JSON ale nie w konfiguracji
2. **Dodaje brakujące pola** - pola w konfiguracji ale nie w JSON
3. **Tworzy kopie zapasowe** przed każdą zmianą
4. **Weryfikuje zmiany** po naprawie

### Przykład użycia
```bash
# Jeśli wykryjesz problemy z polami:
npm run sync-fields

# System automatycznie:
# - Znajdzie niezgodności
# - Utworzy kopię zapasową  
# - Naprawi problemy
# - Zweryfikuje synchronizację
```

## 📋 Monitorowanie

### Logi aplikacji
```bash
# Sprawdź logi synchronizacji
grep "🔍\|✅\|❌" logs/app.log
```

### Status synchronizacji
```bash
# Szczegółowy raport
npm run check-fields

# Wyjście:
# ✅ SYNCHRONIZACJA KOMPLETNA!
# 📝 AKTUALNE POLA DYNAMICZNE: ...
```

## ⚡ Workflow zautomatyzowany

### 1. **Rozwój aplikacji**
```bash
# Każdy build sprawdza synchronizację
npm run build
```

### 2. **Import danych**
```bash
# System automatycznie sprawdzi przed i po imporcie
curl -X POST localhost:3001/api/import/google-sheets \
  -H "Content-Type: application/json" \
  -d '{"url": "...", "clearBefore": true}'
```

### 3. **Operacje CRUD na winach**
```bash
# Middleware automatycznie sprawdza pliki
curl localhost:3001/api/wines
```

### 4. **Rozwiązywanie problemów**
```bash
# Jeśli coś poszło nie tak:
npm run sync-fields  # Automatyczna naprawa
npm start            # Restart aplikacji
```

## 🚫 Scenariusze błędów

### Problem: Pola nie są zsynchronizowane
```bash
❌ POLA W JSON ALE NIE W KONFIGURACJI: variety
❌ POLA W KONFIGURACJI ALE NIE W JSON: poj

# Rozwiązanie:
npm run sync-fields
```

### Problem: Import blokowany
```
Error: Pola dynamiczne nie są zsynchronizowane!

# Rozwiązanie:
npm run sync-fields
# Ponów import
```

### Problem: API zwraca błąd synchronizacji
```json
{
  "success": false,
  "error": "Pola dynamiczne nie są zsynchronizowane"
}

# Rozwiązanie:
npm run sync-fields
npm run build
npm start
```

## 🔒 Bezpieczeństwo

### Kopie zapasowe
System automatycznie tworzy kopie przed zmianami:
```
data/wines.json.backup-auto-fix-1697456789123
data/wines.json.backup-before-variety-cleanup
```

### Walidacja
- Sprawdzenie istnienia plików
- Walidacja struktury JSON  
- Veryfikacja typów pól
- Kontrola integralności danych

## 📊 Metryki

### Aktualne pola (12):
- `alcohol` - Zawartość alkoholu (text)
- `catalogNumber` - Nr kat. (text) 🔧 System field
- `category` - Kolor (select)
- `description` - Opis (textarea)
- `image` - Obraz (url)
- `name` - Nazwa (text)
- `poj` - Pojemność (text)
- `price1` - Cena1 (text)
- `price2` - Cena 2 (text)
- `region` - Region (text)
- `szczepy` - Szczep (text)
- `type` - Typ (select)

### Status systemu
✅ **WSZYSTKIE PROCESY ZAUTOMATYZOWANE**
- Build-time checking
- Import-time validation  
- Runtime middleware
- Automatic repair
- Backup creation
- Error reporting

---

**System jest teraz w pełni autonomiczny! 🎉**

Nie musisz pamiętać o ręcznym sprawdzaniu - system sam zadba o synchronizację pól dynamicznych na każdym etapie rozwoju i użytkowania aplikacji.