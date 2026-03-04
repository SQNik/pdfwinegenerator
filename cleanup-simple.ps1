# Skrypt Czyszczenia Projektu - Wersja Uproszczona
# Uzycie: .\cleanup-simple.ps1

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  CZYSZCZENIE PROJEKTU" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Sprawdzenie katalogu
if (-not (Test-Path "package.json")) {
    Write-Host "BLAD: Nie znaleziono package.json" -ForegroundColor Red
    exit 1
}

# Potwierdzenie
Write-Host "Ten skrypt usunie:" -ForegroundColor Yellow
Write-Host "  - ~422 MB w folderach backup" -ForegroundColor White
Write-Host "  - ~24 pliki testowe HTML" -ForegroundColor White
Write-Host "  - Katalog _deprecated" -ForegroundColor White
Write-Host "  - Duplikaty plikow" -ForegroundColor White
Write-Host "  - Stare backupy danych" -ForegroundColor White
Write-Host ""

$confirmation = Read-Host "Kontynuowac? (tak/nie)"
if ($confirmation -ne "tak") {
    Write-Host "Przerwano." -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# BACKUP GIT
Write-Host "[1/7] Tworzenie backupu Git..." -ForegroundColor Cyan
$tagName = "backup-before-cleanup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git add -A 2>&1 | Out-Null
git commit -m "Backup przed czyszczeniem - $(Get-Date -Format 'yyyy-MM-dd HH:mm')" 2>&1 | Out-Null
git tag $tagName 2>&1 | Out-Null
Write-Host "  Utworzono tag: $tagName" -ForegroundColor Green
Write-Host ""

# 1. WIELKIE BACKUPY
Write-Host "[2/7] Usuwanie wielkich folderow backup..." -ForegroundColor Cyan
$backupFolders = @(
    "backup_before_wizard_20260219_104505",
    "backup_before_wizard_20260219_104511", 
    "backup_restore_point_20260219_122655",
    "backup_restore_point_20260223_212808",
    "pdfwinegenerator_production_20251125_100152"
)

$deleted = 0
foreach ($folder in $backupFolders) {
    if (Test-Path $folder) {
        Remove-Item -Recurse -Force $folder -ErrorAction SilentlyContinue
        if (-not (Test-Path $folder)) {
            $deleted++
            Write-Host "  Usunieto: $folder" -ForegroundColor Gray
        }
    }
}
Write-Host "  Usunieto $deleted folderow (~422 MB)" -ForegroundColor Green
Write-Host ""

# 2. PLIKI TESTOWE
Write-Host "[3/7] Usuwanie plikow testowych..." -ForegroundColor Cyan
$testPatterns = @("test-*.html", "debug-*.html", "diagnose-api.html", "example-page.html", 
                  "navigation-demo.html", "success.html", "table.html", "szablon*.html")
$deleted = 0
foreach ($pattern in $testPatterns) {
    $files = Get-ChildItem -Path "public\$pattern" -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        Remove-Item $file.FullName -ErrorAction SilentlyContinue
        $deleted++
    }
}
Write-Host "  Usunieto $deleted plikow testowych" -ForegroundColor Green
Write-Host ""

# 3. DEPRECATED
Write-Host "[4/7] Usuwanie katalogu _deprecated..." -ForegroundColor Cyan
if (Test-Path "public\_deprecated") {
    Remove-Item -Recurse -Force "public\_deprecated" -ErrorAction SilentlyContinue
    Write-Host "  Usunieto katalog _deprecated" -ForegroundColor Green
} else {
    Write-Host "  Katalog nie istnieje (pominieeto)" -ForegroundColor Gray
}
Write-Host ""

# 4. DUPLIKATY
Write-Host "[5/7] Usuwanie duplikatow..." -ForegroundColor Cyan
$duplicates = @(
    "src\services\pdfService - kopia.ts",
    "public\pages\wines copy.html",
    "public\wines copy.html",
    "public\a5-card - kopia.html",
    "data\collections - kopia.json"
)
$deleted = 0
foreach ($file in $duplicates) {
    if (Test-Path $file) {
        Remove-Item $file -ErrorAction SilentlyContinue
        $deleted++
    }
}
Write-Host "  Usunieto $deleted duplikatow" -ForegroundColor Green
Write-Host ""

# 5. STARE BACKUPY
Write-Host "[6/7] Czyszczenie starych backupow danych..." -ForegroundColor Cyan
$oldBackups = Get-ChildItem -Path "data\wines.json.backup-*" -ErrorAction SilentlyContinue
$deleted = $oldBackups.Count
foreach ($file in $oldBackups) {
    Remove-Item $file.FullName -ErrorAction SilentlyContinue
}
if (Test-Path "data\wines.json.backup-before-poj-addition") {
    Remove-Item "data\wines.json.backup-before-poj-addition" -ErrorAction SilentlyContinue
    $deleted++
}
if (Test-Path "data\wines.json.backup-before-variety-cleanup") {
    Remove-Item "data\wines.json.backup-before-variety-cleanup" -ErrorAction SilentlyContinue
    $deleted++
}
Write-Host "  Usunieto $deleted starych backupow" -ForegroundColor Green
Write-Host "  Zachowano: wines.json.backup" -ForegroundColor Gray
Write-Host ""

# 6. TYMCZASOWE
Write-Host "[7/7] Usuwanie plikow tymczasowych..." -ForegroundColor Cyan
$tempFiles = @(
    "debug-categories-output.html",
    "template-fixed.html",
    "new-template-category-list.json",
    "data\template_export_1547703.json",
    "__tests__\test.html"
)
$deleted = 0
foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        Remove-Item $file -ErrorAction SilentlyContinue
        $deleted++
    }
}
Write-Host "  Usunieto $deleted plikow tymczasowych" -ForegroundColor Green
Write-Host ""

# PODSUMOWANIE
Write-Host "=========================================" -ForegroundColor Green
Write-Host "  CZYSZCZENIE ZAKONCZONE!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Oszczednosc: ~450 MB" -ForegroundColor Green
Write-Host ""
Write-Host "Nastepne kroki:" -ForegroundColor Cyan
Write-Host "  1. npm run build" -ForegroundColor White
Write-Host "  2. npm test" -ForegroundColor White
Write-Host "  3. npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Przywracanie backupu:" -ForegroundColor Yellow
Write-Host "  git reset --hard $tagName" -ForegroundColor Gray
Write-Host ""

$runBuild = Read-Host "Uruchomic 'npm run build' teraz? (tak/nie)"
if ($runBuild -eq "tak") {
    Write-Host ""
    Write-Host "Uruchamianie npm run build..." -ForegroundColor Cyan
    Write-Host ""
    npm run build
    Write-Host ""
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build zakonczony pomyslnie!" -ForegroundColor Green
    } else {
        Write-Host "Build zakonczony z bledami." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Gotowe! Projekt wyczyszczony." -ForegroundColor Green
Write-Host ""
