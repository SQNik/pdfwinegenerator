# 🧹 Szybki Start - Czyszczenie Projektu

## ⚡ Szybkie Czyszczenie (~422 MB w 5 minut)

### 🛡️ KROK 0: BACKUP (OBOWIĄZKOWY!)

```powershell
# Stwórz punkt przywrócenia Git
git add -A
git commit -m "Backup przed czyszczeniem - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git tag "backup-before-cleanup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
```

### 🗑️ KROK 1: Usuń Wielkie Backupy (~422 MB)

```powershell
# Usuń stare foldery backup (BEZPIECZNE):
Remove-Item -Recurse -Force "backup_before_wizard_20260219_104505" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "backup_before_wizard_20260219_104511" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "backup_restore_point_20260219_122655" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "backup_restore_point_20260223_212808" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "pdfwinegenerator_production_20251125_100152" -ErrorAction SilentlyContinue

Write-Host "✅ Usunięto ~422 MB starych backupów" -ForegroundColor Green
```

### 🧪 KROK 2: Usuń Pliki Testowe

```powershell
# Usuń pliki testowe i debugowe (BEZPIECZNE):
Remove-Item "public\test-*.html" -ErrorAction SilentlyContinue
Remove-Item "public\debug-*.html" -ErrorAction SilentlyContinue
Remove-Item "public\diagnose-api.html" -ErrorAction SilentlyContinue
Remove-Item "public\example-page.html" -ErrorAction SilentlyContinue
Remove-Item "public\navigation-demo.html" -ErrorAction SilentlyContinue
Remove-Item "public\success.html" -ErrorAction SilentlyContinue
Remove-Item "public\table.html" -ErrorAction SilentlyContinue
Remove-Item "public\szablon*.html" -ErrorAction SilentlyContinue

Write-Host "✅ Usunięto pliki testowe" -ForegroundColor Green
```

### 📁 KROK 3: Usuń Katalog Deprecated

```powershell
# Usuń stare zarchiwizowane narzędzia (BEZPIECZNE):
Remove-Item -Recurse -Force "public\_deprecated" -ErrorAction SilentlyContinue

Write-Host "✅ Usunięto katalog _deprecated" -ForegroundColor Green
```

### 🔄 KROK 4: Usuń Duplikaty

```powershell
# Backend:
Remove-Item "src\services\pdfService — kopia.ts" -ErrorAction SilentlyContinue

# Frontend:
Remove-Item "public\pages\wines copy.html" -ErrorAction SilentlyContinue
Remove-Item "public\wines copy.html" -ErrorAction SilentlyContinue
Remove-Item "public\a5-card — kopia.html" -ErrorAction SilentlyContinue

# Data:
Remove-Item "data\collections — kopia.json" -ErrorAction SilentlyContinue

Write-Host "✅ Usunięto duplikaty" -ForegroundColor Green
```

### 💾 KROK 5: Wyczyść Stare Backupy Danych

```powershell
# Usuń stare backupy (zachowaj główny wines.json.backup):
Remove-Item "data\wines.json.backup-auto-fix-*" -ErrorAction SilentlyContinue
Remove-Item "data\wines.json.backup-before-poj-addition" -ErrorAction SilentlyContinue
Remove-Item "data\wines.json.backup-before-variety-cleanup" -ErrorAction SilentlyContinue

Write-Host "✅ Wyczyszczono stare backupy danych" -ForegroundColor Green
```

### 🧹 KROK 6: Wyczyść Pliki Tymczasowe

```powershell
# Root:
Remove-Item "debug-categories-output.html" -ErrorAction SilentlyContinue
Remove-Item "template-fixed.html" -ErrorAction SilentlyContinue
Remove-Item "new-template-category-list.json" -ErrorAction SilentlyContinue

# Data:
Remove-Item "data\template_export_1547703.json" -ErrorAction SilentlyContinue

# Tests:
Remove-Item "__tests__\test.html" -ErrorAction SilentlyContinue

Write-Host "✅ Wyczyszczono pliki tymczasowe" -ForegroundColor Green
```

### ✅ KROK 7: Weryfikacja

```powershell
# Przebuduj projekt:
npm run build

# Testy:
npm test

# Uruchom dev server:
npm run dev
```

Otwórz: http://localhost:3001

Sprawdź:
- ✅ Strona główna działa
- ✅ Zarządzanie winami działa
- ✅ Zarządzanie kolekcjami działa
- ✅ Generowanie PDF działa

### 📝 KROK 8: Commit

```powershell
git add -A
git commit -m "Czyszczenie projektu: usunięto ~450MB zbędnych plików`n`n- Usunięto stare backupy (422 MB)`n- Usunięto pliki testowe i deprecated`n- Usunięto duplikaty`n- Wyczyszczono stare backupy danych"
git push
```

---

## 🚀 KOMPLETNY SKRYPT (Wszystkie kroki razem)

```powershell
# ===== CZYSZCZENIE PROJEKTU =====

Write-Host "`n🧹 ROZPOCZĘCIE CZYSZCZENIA PROJEKTU" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

# 0. BACKUP
Write-Host "📦 Tworzenie backupu Git..." -ForegroundColor Yellow
git add -A
git commit -m "Backup przed czyszczeniem projektu - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
$tagName = "backup-before-cleanup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git tag $tagName
Write-Host "✅ Utworzono tag: $tagName`n" -ForegroundColor Green

# 1. WIELKIE BACKUPY
Write-Host "🗑️  Usuwanie wielkich folderów backup..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "backup_before_wizard_20260219_104505" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "backup_before_wizard_20260219_104511" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "backup_restore_point_20260219_122655" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "backup_restore_point_20260223_212808" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "pdfwinegenerator_production_20251125_100152" -ErrorAction SilentlyContinue
Write-Host "✅ Usunięto ~422 MB starych backupów`n" -ForegroundColor Green

# 2. PLIKI TESTOWE
Write-Host "🧪 Usuwanie plików testowych..." -ForegroundColor Yellow
Remove-Item "public\test-*.html" -ErrorAction SilentlyContinue
Remove-Item "public\debug-*.html" -ErrorAction SilentlyContinue
Remove-Item "public\diagnose-api.html" -ErrorAction SilentlyContinue
Remove-Item "public\example-page.html" -ErrorAction SilentlyContinue
Remove-Item "public\navigation-demo.html" -ErrorAction SilentlyContinue
Remove-Item "public\success.html" -ErrorAction SilentlyContinue
Remove-Item "public\table.html" -ErrorAction SilentlyContinue
Remove-Item "public\szablon*.html" -ErrorAction SilentlyContinue
Write-Host "✅ Usunięto pliki testowe`n" -ForegroundColor Green

# 3. DEPRECATED
Write-Host "📁 Usuwanie katalogu _deprecated..." -ForegroundColor Yellow
Remove-Item -Recurse -Force "public\_deprecated" -ErrorAction SilentlyContinue
Write-Host "✅ Usunięto katalog _deprecated`n" -ForegroundColor Green

# 4. DUPLIKATY
Write-Host "🔄 Usuwanie duplikatów..." -ForegroundColor Yellow
Remove-Item "src\services\pdfService — kopia.ts" -ErrorAction SilentlyContinue
Remove-Item "public\pages\wines copy.html" -ErrorAction SilentlyContinue
Remove-Item "public\wines copy.html" -ErrorAction SilentlyContinue
Remove-Item "public\a5-card — kopia.html" -ErrorAction SilentlyContinue
Remove-Item "data\collections — kopia.json" -ErrorAction SilentlyContinue
Write-Host "✅ Usunięto duplikaty`n" -ForegroundColor Green

# 5. STARE BACKUPY DANYCH
Write-Host "💾 Czyszczenie starych backupów danych..." -ForegroundColor Yellow
Remove-Item "data\wines.json.backup-auto-fix-*" -ErrorAction SilentlyContinue
Remove-Item "data\wines.json.backup-before-poj-addition" -ErrorAction SilentlyContinue
Remove-Item "data\wines.json.backup-before-variety-cleanup" -ErrorAction SilentlyContinue
Write-Host "✅ Wyczyszczono stare backupy (zachowano wines.json.backup)`n" -ForegroundColor Green

# 6. PLIKI TYMCZASOWE
Write-Host "🧹 Usuwanie plików tymczasowych..." -ForegroundColor Yellow
Remove-Item "debug-categories-output.html" -ErrorAction SilentlyContinue
Remove-Item "template-fixed.html" -ErrorAction SilentlyContinue
Remove-Item "new-template-category-list.json" -ErrorAction SilentlyContinue
Remove-Item "data\template_export_1547703.json" -ErrorAction SilentlyContinue
Remove-Item "__tests__\test.html" -ErrorAction SilentlyContinue
Write-Host "✅ Wyczyszczono pliki tymczasowe`n" -ForegroundColor Green

Write-Host "====================================`n" -ForegroundColor Cyan
Write-Host "🎉 CZYSZCZENIE ZAKOŃCZONE!" -ForegroundColor Green
Write-Host "   Usunięto ~450 MB zbędnych plików`n" -ForegroundColor Green

Write-Host "📝 Następne kroki:" -ForegroundColor Cyan
Write-Host "   1. npm run build     - Przebuduj projekt" -ForegroundColor White
Write-Host "   2. npm test          - Uruchom testy" -ForegroundColor White
Write-Host "   3. npm run dev       - Wystartuj serwer dev" -ForegroundColor White
Write-Host "   4. git add -A && git commit -m 'Czyszczenie projektu'" -ForegroundColor White
Write-Host "   5. git push          - Wypchnij zmiany`n" -ForegroundColor White
```

---

## ⚠️ Przywracanie Backupu (Jeśli coś pójdzie nie tak)

```powershell
# Znajdź tag backupu:
git tag | Select-String "backup-before-cleanup"

# Przywróć do tagu:
git reset --hard backup-before-cleanup-XXXXXXXX-XXXXXX

# UWAGA: To usunie wszystkie niezacommitowane zmiany!
```

---

## 📊 Oczekiwane Oszczędności

| Krok | Oszczędność | Opis |
|------|-------------|------|
| 1. Wielkie backupy | ~422 MB | 5 starych folderów backup |
| 2. Pliki testowe | ~2 MB | 24 pliki test/debug HTML |
| 3. Deprecated | ~5 MB | Stare narzędzia i testy |
| 4. Duplikaty | ~10 MB | Kopie plików |
| 5. Stare backupy | ~10 MB | 5 starych backupów wines.json |
| 6. Tymczasowe | ~1 MB | Debugi, cache |
| **RAZEM** | **~450 MB** | - |

---

## ✅ Checklist

Po czyszczeniu sprawdź:

- [ ] `npm run build` - bez błędów
- [ ] `npm test` - testy przechodzą
- [ ] `npm run dev` - serwer startuje
- [ ] http://localhost:3001 - strona główna działa
- [ ] Zarządzanie winami - działa
- [ ] Zarządzanie kolekcjami - działa
- [ ] Generowanie PDF - działa
- [ ] Import CSV - działa
- [ ] Edytor szablonów - działa

Jeśli wszystko działa:

- [ ] `git add -A`
- [ ] `git commit -m "Czyszczenie projektu"`
- [ ] `git push`

---

**Gotowe! Projekt wyczyszczony i zoptymalizowany. 🎉**
