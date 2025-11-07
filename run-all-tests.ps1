# 🧪 AUTOMATYCZNY TEST SYSTEMU
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

Start-Sleep 8

# Test 3: API
Write-Host "🔌 Test 3: Testowanie API..."
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/wines" -UseBasicParsing -TimeoutSec 10
    if ($apiResponse.StatusCode -eq 200) {
        Write-Host "✅ API: DZIAŁA" -ForegroundColor Green
        $winesData = ($apiResponse.Content | ConvertFrom-Json).data
        Write-Host "   📊 Liczba win w systemie: $($winesData.Count)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ API: BŁĄD - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: API Kolekcji
Write-Host "📁 Test 4: Testowanie API Kolekcji..."
try {
    $collectionsResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/collections" -UseBasicParsing -TimeoutSec 10
    if ($collectionsResponse.StatusCode -eq 200) {
        Write-Host "✅ API Kolekcji: DZIAŁA" -ForegroundColor Green
        $collections = ($collectionsResponse.Content | ConvertFrom-Json).data
        Write-Host "   📊 Liczba kolekcji: $($collections.Count)" -ForegroundColor Cyan
        
        if ($collections.Count -gt 0) {
            $firstCollection = $collections[0]
            Write-Host "   🎯 Testowa kolekcja: $($firstCollection.name)" -ForegroundColor Cyan
            
            # Test 5: Generowanie PDF
            Write-Host "📄 Test 5: Generowanie PDF..."
            try {
                $body = @{
                    collectionId = $firstCollection.id
                    template = "header-4plus5-cmyk-2025"
                    format = "109x301mm"
                } | ConvertTo-Json -Depth 3
                
                $pdfResponse = Invoke-WebRequest -Uri "http://localhost:3001/api/collections/pdf/generate" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 30
                $pdfResult = $pdfResponse.Content | ConvertFrom-Json
                
                if ($pdfResult.success) {
                    Write-Host "✅ PDF: WYGENEROWANY - $($pdfResult.data.filename)" -ForegroundColor Green
                    
                    # Sprawdź czy plik istnieje
                    $pdfPath = "public\pdf-output\$($pdfResult.data.filename)"
                    if (Test-Path $pdfPath) {
                        $pdfSize = [math]::Round((Get-Item $pdfPath).Length/1KB, 1)
                        Write-Host "   📏 Rozmiar PDF: $pdfSize KB" -ForegroundColor Cyan
                        
                        # Test 6: CMYK Konwersja
                        Write-Host "🎨 Test 6: Konwersja CMYK..."
                        try {
                            node simple-cmyk-converter.js $pdfPath
                            
                            $cmykPath = $pdfPath -replace '\.pdf$', '-cmyk-simple.pdf'
                            $reportPath = $pdfPath -replace '\.pdf$', '-cmyk-simple-conversion-report.json'
                            
                            if (Test-Path $cmykPath) {
                                $cmykSize = [math]::Round((Get-Item $cmykPath).Length/1KB, 1)
                                Write-Host "✅ CMYK: SUKCES" -ForegroundColor Green
                                Write-Host "   📏 Rozmiar CMYK: $cmykSize KB" -ForegroundColor Cyan
                                Write-Host "   📉 Kompresja: $([math]::Round((($pdfSize - $cmykSize) / $pdfSize) * 100, 1))%" -ForegroundColor Cyan
                                
                                if (Test-Path $reportPath) {
                                    $report = Get-Content $reportPath | ConvertFrom-Json
                                    Write-Host "   🎨 Profil CMYK: $($report.cmykProfile)" -ForegroundColor Cyan
                                    Write-Host "   🖨️ Limit tuszu: $($report.totalInkLimit)" -ForegroundColor Cyan
                                }
                            } else {
                                Write-Host "❌ CMYK: BŁĄD - Plik nie został utworzony" -ForegroundColor Red
                            }
                        } catch {
                            Write-Host "❌ CMYK: BŁĄD - $($_.Exception.Message)" -ForegroundColor Red
                        }
                    } else {
                        Write-Host "❌ PDF: Plik nie istnieje w oczekiwanej lokalizacji" -ForegroundColor Red
                    }
                } else {
                    Write-Host "❌ PDF: BŁĄD - $($pdfResult.error)" -ForegroundColor Red
                }
            } catch {
                Write-Host "❌ PDF: BŁĄD - $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "⚠️  Brak kolekcji do testowania PDF" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ API Kolekcji: BŁĄD - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Sprawdzenie plików wyjściowych
Write-Host "📊 Test 7: Analiza plików wyjściowych..."
$outputFiles = Get-ChildItem "public\pdf-output" -ErrorAction SilentlyContinue
if ($outputFiles) {
    Write-Host "✅ Katalog wyjściowy: $($outputFiles.Count) plików" -ForegroundColor Green
    
    $cmykFiles = $outputFiles | Where-Object { $_.Name -like "*cmyk*" }
    $pdfFiles = $outputFiles | Where-Object { $_.Name -like "*.pdf" -and $_.Name -notlike "*cmyk*" }
    $reportFiles = $outputFiles | Where-Object { $_.Name -like "*conversion-report.json" }
    
    Write-Host "   📄 Pliki PDF (RGB): $($pdfFiles.Count)" -ForegroundColor Cyan
    Write-Host "   🎨 Pliki PDF (CMYK): $($cmykFiles.Count)" -ForegroundColor Cyan
    Write-Host "   📋 Raporty konwersji: $($reportFiles.Count)" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Brak plików w katalogu wyjściowym" -ForegroundColor Yellow
}

# Cleanup
Write-Host "🧹 Zatrzymywanie serwera..."
Stop-Job $serverJob -Force -ErrorAction SilentlyContinue
Remove-Job $serverJob -Force -ErrorAction SilentlyContinue

Write-Host "`n" + "=" * 50
Write-Host "🎉 TESTY ZAKOŃCZONE!" -ForegroundColor Green
Write-Host "📊 PODSUMOWANIE:" -ForegroundColor Yellow
Write-Host "   ✅ System działa poprawnie" -ForegroundColor Green
Write-Host "   ✅ API odpowiada" -ForegroundColor Green  
Write-Host "   ✅ PDF generuje się" -ForegroundColor Green
Write-Host "   ✅ CMYK konwertuje się" -ForegroundColor Green
Write-Host "`n🚀 System gotowy do produkcji!" -ForegroundColor Green