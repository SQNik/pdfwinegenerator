# 🎯 SZYBKI TEST - SPRAWDŹ CZY WSZYSTKO DZIAŁA

## 🚀 **JEDNYM KLIKNIĘCIEM - Uruchom wszystkie testy:**

```powershell
.\run-all-tests.ps1
```

---

## 🔧 **KROK PO KROKU - Jeśli chcesz testować ręcznie:**

### 1️⃣ **Uruchom serwer**
```powershell
npm run build
npm start
```
➡️ Oczekiwany rezultat: `Serwer działa na porcie 3001`

### 2️⃣ **Sprawdź podstawowe API**
```powershell
curl http://localhost:3001/api/wines
```
➡️ Oczekiwany rezultat: JSON z listą win

### 3️⃣ **Test interfejsu webowego**
```powershell
start http://localhost:3001
```
➡️ Oczekiwany rezultat: Strona główna się ładuje

### 4️⃣ **Test generowania PDF**
1. Przejdź do: http://localhost:3001/collections.html
2. Wybierz kolekcję
3. Kliknij "Generuj PDF"
4. Wybierz szablon CMYK
5. Format: 109x301mm
6. Kliknij "Generuj"

➡️ Oczekiwany rezultat: PDF się pobiera

### 5️⃣ **Test konwersji CMYK**
```powershell
# Znajdź najnowszy PDF
$pdf = Get-ChildItem "public\pdf-output\*.pdf" | Where-Object { $_.Name -notlike "*cmyk*" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1

# Konwertuj
node simple-cmyk-converter.js $pdf.FullName
```
➡️ Oczekiwany rezultat: Plik z końcówką `-cmyk-simple.pdf`

---

## ✅ **KRYTERIA SUKCESU**

System działa prawidłowo gdy:
- ✅ Serwer startuje bez błędów
- ✅ API zwraca poprawne odpowiedzi  
- ✅ PDF generuje się przez interfejs
- ✅ Konwersja CMYK tworzy pliki
- ✅ Pliki CMYK są mniejsze od oryginalnych
- ✅ Raport konwersji zawiera metadata

---

## 🚨 **MOŻLIWE PROBLEMY I ROZWIĄZANIA**

### Problem: `npm start` nie działa
**Rozwiązanie:**
```powershell
# Zatrzymaj wszystkie procesy node
Get-Process node | Stop-Process -Force
# Spróbuj ponownie
npm start
```

### Problem: "Port 3001 zajęty"
**Rozwiązanie:**
```powershell
# Znajdź co używa portu
netstat -ano | findstr :3001
# Zatrzymaj proces (zastąp PID)
Stop-Process -Id [PID] -Force
```

### Problem: PDF się nie generuje
**Sprawdź:**
1. Czy masz wina w systemie?
2. Czy kolekcja zawiera wina?
3. Czy szablon jest aktywny?

### Problem: CMYK konwersja nie działa
**Sprawdź:**
```powershell
# Czy istnieje plik do konwersji?
Test-Path "simple-cmyk-converter.js"

# Czy PDF istnieje?
Get-ChildItem "public\pdf-output\*.pdf"
```

---

## 📊 **SZYBKIE SPRAWDZENIE STATUSU**

```powershell
# Sprawdź czy wszystko działa w 30 sekund
Write-Host "🔍 SZYBKIE SPRAWDZENIE:" -ForegroundColor Green

# 1. Czy serwer działa?
try {
    $response = Invoke-WebRequest "http://localhost:3001/api/wines" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Serwer: DZIAŁA" -ForegroundColor Green
} catch {
    Write-Host "❌ Serwer: NIE DZIAŁA" -ForegroundColor Red
}

# 2. Ile win w systemie?
try {
    $wines = (Invoke-WebRequest "http://localhost:3001/api/wines" -UseBasicParsing).Content | ConvertFrom-Json
    Write-Host "✅ Wina: $($wines.data.Count) sztuk" -ForegroundColor Green
} catch {
    Write-Host "❌ Wina: BŁĄD POBIERANIA" -ForegroundColor Red
}

# 3. Ile kolekcji?
try {
    $collections = (Invoke-WebRequest "http://localhost:3001/api/collections" -UseBasicParsing).Content | ConvertFrom-Json
    Write-Host "✅ Kolekcje: $($collections.data.Count) sztuk" -ForegroundColor Green
} catch {
    Write-Host "❌ Kolekcje: BŁĄD POBIERANIA" -ForegroundColor Red
}

# 4. Ile plików PDF?
$pdfs = Get-ChildItem "public\pdf-output\*.pdf" -ErrorAction SilentlyContinue
Write-Host "✅ PDF: $($pdfs.Count) plików" -ForegroundColor Green

# 5. Ile plików CMYK?
$cmyk = Get-ChildItem "public\pdf-output\*cmyk*.pdf" -ErrorAction SilentlyContinue  
Write-Host "✅ CMYK: $($cmyk.Count) plików" -ForegroundColor Green
```

---

## 🎯 **GOTOWY? URUCHOM TEST!**

Wybierz jedną z opcji:

### 🚀 **Opcja A: Automatyczny test (zalecane)**
```powershell
.\run-all-tests.ps1
```

### 🔧 **Opcja B: Test manualny**
1. `npm start`
2. Otwórz http://localhost:3001  
3. Przetestuj funkcje ręcznie

### ⚡ **Opcja C: Szybkie sprawdzenie**
```powershell
# Skopiuj i wklej powyższy kod "SZYBKIE SPRAWDZENIE"
```

**Po testach powiesz mi czy wszystko działa! ✅**