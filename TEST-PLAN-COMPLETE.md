# 🧪 KOMPLETNY PLAN TESTÓW SYSTEMU ZARZĄDZANIA WINAMI

## 📋 **LISTA KONTROLNA - Co testujemy**

### 1. 🚀 **Test Uruchomienia Systemu**
### 2. 🍷 **Test Zarządzania Winami**  
### 3. 📁 **Test Kolekcji**
### 4. 📄 **Test Generowania PDF (RGB)**
### 5. 🎨 **Test Konwersji CMYK**
### 6. 🔧 **Test Szablonów**
### 7. 📊 **Test Importu Danych**

---

## 🚀 **TEST 1: URUCHOMIENIE SYSTEMU**

### Kroki testowe:
```powershell
# 1. Sprawdź czy projekt się buduje
npm run build

# 2. Uruchom serwer
npm start

# 3. Sprawdź czy serwer działa
curl http://localhost:3001/api/wines

# 4. Otwórz aplikację w przeglądarce
start http://localhost:3001
```

### ✅ **Oczekiwane rezultaty:**
- ✅ Build bez błędów
- ✅ Serwer startuje na porcie 3001
- ✅ API odpowiada JSON-em
- ✅ Strona główna się ładuje

---

## 🍷 **TEST 2: ZARZĄDZANIE WINAMI**

### A) Test dodawania wina
```powershell
# Otwórz w przeglądarce:
start http://localhost:3001/wines.html
```

**Kroki manualne:**
1. Kliknij "Dodaj nowe wino"
2. Wypełnij formularz:
   - Catalog Number: `TEST001`
   - Nazwa: `Test Wino`
   - Szczepy: `Cabernet Sauvignon`
   - Rocznik: `2023`
   - Cena: `59.99`
3. Zapisz

### ✅ **Oczekiwane rezultaty:**
- ✅ Formularz się otwiera
- ✅ Wszystkie pola są dostępne
- ✅ Wino zapisuje się poprawnie
- ✅ Pojawia się w tabeli

### B) Test edycji wina
1. Kliknij "Edytuj" przy winie TEST001
2. Zmień cenę na `69.99`
3. Zapisz

### ✅ **Oczekiwany rezultat:**
- ✅ Cena się aktualizuje

---

## 📁 **TEST 3: KOLEKCJE**

### A) Test tworzenia kolekcji
```powershell
# Otwórz kolekcje:
start http://localhost:3001/collections.html
```

**Kroki manualne:**
1. Kliknij "Dodaj nową kolekcję"
2. Wypełnij:
   - Nazwa: `Test Kolekcja CMYK`
   - Opis: `Kolekcja do testów CMYK`
3. Zaznacz wino TEST001
4. Zapisz

### ✅ **Oczekiwane rezultaty:**
- ✅ Kolekcja się tworzy
- ✅ Wino jest przypisane
- ✅ Kolekcja pojawia się na liście

---

## 📄 **TEST 4: GENEROWANIE PDF (RGB)**

### A) Test przez interfejs webowy
1. W kolekcjach kliknij "Generuj PDF" dla `Test Kolekcja CMYK`
2. Wybierz szablon z aktywnym statusem
3. Wybierz format `109x301mm`
4. Kliknij "Generuj PDF"

### B) Test przez API
```powershell
# Pobierz ID kolekcji (skopiuj z interfejsu)
$collectionId = "collection_XXXXXX"  # Zastąp prawdziwym ID

# Generuj PDF
$body = @{
    collectionId = $collectionId
    template = "header-4plus5-cmyk-2025"
    format = "109x301mm"
} | ConvertTo-Json -Depth 3

$response = Invoke-WebRequest -Uri "http://localhost:3001/api/collections/pdf/generate" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing

$responseJson = $response.Content | ConvertFrom-Json
Write-Host "Success: $($responseJson.success)"
if($responseJson.success) {
    Write-Host "PDF: $($responseJson.data.filename)"
}
```

### ✅ **Oczekiwane rezultaty:**
- ✅ PDF się generuje bez błędów
- ✅ Plik pojawia się w `public/pdf-output/`
- ✅ PDF zawiera dane wina TEST001
- ✅ Layout wygląda poprawnie

---

## 🎨 **TEST 5: KONWERSJA CMYK**

### Automatyczny test CMYK
```powershell
# Przejdź do katalogu
cd "d:\!!!SKRYPTY PYTHON\WINANEWPDF-bck"

# Znajdź najnowszy PDF
$latestPdf = Get-ChildItem "public\pdf-output\*.pdf" | Where-Object { $_.Name -notlike "*cmyk*" } | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($latestPdf) {
    Write-Host "Konwertuję: $($latestPdf.Name)"
    
    # Konwertuj na CMYK
    node simple-cmyk-converter.js $latestPdf.FullName
    
    # Sprawdź rezultaty
    $cmykFile = $latestPdf.FullName -replace '\.pdf$', '-cmyk-simple.pdf'
    $reportFile = $latestPdf.FullName -replace '\.pdf$', '-cmyk-simple-conversion-report.json'
    
    if (Test-Path $cmykFile) {
        Write-Host "✅ CMYK PDF utworzony: $(Split-Path $cmykFile -Leaf)"
        Write-Host "Rozmiar oryginalny: $([math]::Round($latestPdf.Length/1KB, 1)) KB"
        Write-Host "Rozmiar CMYK: $([math]::Round((Get-Item $cmykFile).Length/1KB, 1)) KB"
        
        if (Test-Path $reportFile) {
            Write-Host "✅ Raport konwersji utworzony"
            $report = Get-Content $reportFile | ConvertFrom-Json
            Write-Host "Profil CMYK: $($report.cmykProfile)"
        }
    } else {
        Write-Host "❌ Błąd konwersji CMYK"
    }
} else {
    Write-Host "❌ Nie znaleziono PDF do konwersji"
}
```

### ✅ **Oczekiwane rezultaty:**
- ✅ Konwersja kończy się sukcesem
- ✅ Plik CMYK jest mniejszy od oryginału
- ✅ Raport JSON zawiera specyfikacje druku
- ✅ Metadata CMYK jest poprawnie dodana

---

## 🔧 **TEST 6: ZARZĄDZANIE SZABLONAMI**

### Test filtrowania szablonów
1. Przejdź do kolekcji
2. Kliknij "Generuj PDF"
3. Sprawdź listę dostępnych szablonów

### ✅ **Oczekiwany rezultat:**
- ✅ Pokazują się tylko szablony ze statusem "aktywny"
- ✅ Lista nie zawiera szablonów nieaktywnych

---

## 📊 **TEST 7: IMPORT DANYCH**

### A) Test importu CSV
```powershell
# Utwórz testowy plik CSV
@"
catalogNumber,nazwa,szczepy,rocznik,cena
TEST002,Testowe Wino 2,Merlot,2022,45.99
TEST003,Testowe Wino 3,Chardonnay,2023,38.50
"@ | Out-File -FilePath "test-import.csv" -Encoding UTF8

# Następnie importuj przez interfejs
start http://localhost:3001
```

**Kroki manualne:**
1. Na stronie głównej kliknij "Import"
2. Wybierz plik `test-import.csv`
3. Kliknij "Importuj"

### ✅ **Oczekiwane rezultaty:**
- ✅ Import przebiega bez błędów
- ✅ Nowe wina pojawiają się w systemie
- ✅ Wszystkie pola są poprawnie zmapowane

---

## 🎯 **SKRYPT AUTOMATYCZNEGO TESTU**

Stwórz plik `run-all-tests.ps1`:

```powershell
# AUTOMATYCZNY TEST SYSTEMU
Write-Host "🧪 URUCHAMIAM KOMPLEKSOWE TESTY SYSTEMU" -ForegroundColor Green
Write-Host "=" * 50

# Test 1: Build
Write-Host "📦 Test 1: Budowanie projektu..."
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build: SUKCES" -ForegroundColor Green
} else {
    Write-Host "❌ Build: BŁĄD" -ForegroundColor Red
    exit 1
}

# Test 2: Start serwera w tle
Write-Host "🚀 Test 2: Uruchamianie serwera..."
$serverJob = Start-Job -ScriptBlock { 
    Set-Location "d:\!!!SKRYPTY PYTHON\WINANEWPDF-bck"
    npm start 
}

Start-Sleep 5

# Test 3: API
Write-Host "🔌 Test 3: Testowanie API..."
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/wines" -UseBasicParsing -TimeoutSec 10
    if ($apiResponse.StatusCode -eq 200) {
        Write-Host "✅ API: DZIAŁA" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ API: BŁĄD - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Generowanie PDF (jeśli są kolekcje)
Write-Host "📄 Test 4: Testowanie PDF..."
try {
    $collectionsResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/collections" -UseBasicParsing
    $collections = ($collectionsResponse.Content | ConvertFrom-Json).data
    
    if ($collections.Count -gt 0) {
        $firstCollection = $collections[0]
        
        $body = @{
            collectionId = $firstCollection.id
            template = "header-4plus5-cmyk-2025"
            format = "109x301mm"
        } | ConvertTo-Json -Depth 3
        
        $pdfResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/collections/pdf/generate" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
        $pdfResult = $pdfResponse.Content | ConvertFrom-Json
        
        if ($pdfResult.success) {
            Write-Host "✅ PDF: WYGENEROWANY - $($pdfResult.data.filename)" -ForegroundColor Green
            
            # Test 5: CMYK
            Write-Host "🎨 Test 5: Konwersja CMYK..."
            $pdfPath = "public\pdf-output\$($pdfResult.data.filename)"
            node simple-cmyk-converter.js $pdfPath
            
            $cmykPath = $pdfPath -replace '\.pdf$', '-cmyk-simple.pdf'
            if (Test-Path $cmykPath) {
                Write-Host "✅ CMYK: SUKCES" -ForegroundColor Green
            } else {
                Write-Host "❌ CMYK: BŁĄD" -ForegroundColor Red
            }
        }
    }
} catch {
    Write-Host "❌ PDF: BŁĄD - $($_.Exception.Message)" -ForegroundColor Red
}

# Cleanup
Write-Host "🧹 Zatrzymywanie serwera..."
Stop-Job $serverJob -Force
Remove-Job $serverJob

Write-Host "`n🎉 TESTY ZAKOŃCZONE!" -ForegroundColor Green
Write-Host "Sprawdź wyniki powyżej." -ForegroundColor Yellow
```

---

## 📊 **KRYTERIA SUKCESU**

System uznajemy za w pełni działający gdy:

### ✅ **Podstawowe funkcje:**
- [x] Serwer startuje bez błędów
- [x] API odpowiada poprawnie
- [x] Interfejs webowy się ładuje
- [x] CRUD win działa
- [x] CRUD kolekcji działa

### ✅ **Zaawansowane funkcje:**
- [x] PDF generuje się poprawnie
- [x] Szablony CMYK działają
- [x] Konwersja CMYK kończy się sukcesem
- [x] Import CSV działa
- [x] Filtrowanie szablonów działa

### ✅ **Jakość wyjściowa:**
- [x] PDF zawiera poprawne dane
- [x] Kolory CMYK są profesjonalne
- [x] Pliki nadają się do druku
- [x] Metadata jest kompletna

---

## 🎯 **JAK URUCHOMIĆ TESTY**

1. **Testy manualne**: Wykonaj każdy test krok po kroku
2. **Testy automatyczne**: Uruchom `run-all-tests.ps1`
3. **Test pełnego workflow**: Dodaj wino → Utwórz kolekcję → Generuj PDF → Konwertuj CMYK

**Wszystkie testy powinny kończyć się sukcesem! ✅**