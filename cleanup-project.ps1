# Skrypt Czyszczenia Projektu Wine Management System
# Wersja: 1.0
# Data: 2026-03-04
# Użycie: .\cleanup-project.ps1

Write-Host "`n" -NoNewline
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🧹 WINE MANAGEMENT SYSTEM - CZYSZCZENIE PROJEKTU        ║" -ForegroundColor Cyan
Write-Host "║     Automatyczne usuwanie zbędnych plików (~450 MB)      ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Sprawdzenie czy jesteśmy w głównym katalogu projektu
if (-not (Test-Path "package.json")) {
    Write-Host "❌ BŁĄD: Nie znaleziono package.json" -ForegroundColor Red
    Write-Host "   Uruchom skrypt w głównym katalogu projektu." -ForegroundColor Yellow
    exit 1
}

# Potwierdzenie od użytkownika
Write-Host "⚠️  UWAGA: Ten skrypt usunie:" -ForegroundColor Yellow
Write-Host "   • ~422 MB w folderach backup" -ForegroundColor White
Write-Host "   • ~24 pliki testowe HTML" -ForegroundColor White
Write-Host "   • Katalog _deprecated" -ForegroundColor White
Write-Host "   • Duplikaty plików" -ForegroundColor White
Write-Host "   • Stare backupy danych`n" -ForegroundColor White

$confirmation = Read-Host "Czy chcesz kontynuować? (tak/nie)"
if ($confirmation -ne "tak") {
    Write-Host "`n❌ Przerwano przez użytkownika.`n" -ForegroundColor Yellow
    exit 0
}

Write-Host ""

# ====================================
# 0. BACKUP GIT
# ====================================
Write-Host "📦 [1/7] Tworzenie backupu Git..." -ForegroundColor Cyan

$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "   Commitowanie niezapisanych zmian..." -ForegroundColor Gray
    git add -A
    $commitMsg = "Backup przed czyszczeniem projektu - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git commit -m $commitMsg | Out-Null
}

$tagName = "backup-before-cleanup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git tag $tagName 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Utworzono tag Git: $tagName" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Nie udało się utworzyć tagu Git (możliwe że już istnieje)" -ForegroundColor Yellow
}

Write-Host ""

# ====================================
# 1. WIELKIE FOLDERY BACKUP
# ====================================
Write-Host "🗑️  [2/7] Usuwanie wielkich folderów backup..." -ForegroundColor Cyan

$backupFolders = @(
    "backup_before_wizard_20260219_104505",
    "backup_before_wizard_20260219_104511", 
    "backup_restore_point_20260219_122655",
    "backup_restore_point_20260223_212808",
    "pdfwinegenerator_production_20251125_100152"
)

$deletedBackups = 0
foreach ($folder in $backupFolders) {
    if (Test-Path $folder) {
        Remove-Item -Recurse -Force $folder -ErrorAction SilentlyContinue
        if (-not (Test-Path $folder)) {
            $deletedBackups++
            Write-Host "   ✓ Usunięto: $folder" -ForegroundColor Gray
        }
    }
}

Write-Host "   ✅ Usunięto $deletedBackups folderów backup (~422 MB)" -ForegroundColor Green
Write-Host ""

# ====================================
# 2. PLIKI TESTOWE
# ====================================
Write-Host "🧪 [3/7] Usuwanie plików testowych..." -ForegroundColor Cyan

$testPatterns = @(
    "public\test-*.html",
    "public\debug-*.html",
    "public\diagnose-api.html",
    "public\example-page.html",
    "public\navigation-demo.html",
    "public\success.html",
    "public\table.html",
    "public\szablon*.html"
)

$deletedTests = 0
foreach ($pattern in $testPatterns) {
    $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        Remove-Item $file.FullName -ErrorAction SilentlyContinue
        if (-not (Test-Path $file.FullName)) {
            $deletedTests++
        }
    }
}

Write-Host "   ✅ Usunięto $deletedTests plików testowych" -ForegroundColor Green
Write-Host ""

# ====================================
# 3. KATALOG _DEPRECATED
# ====================================
Write-Host "📁 [4/7] Usuwanie katalogu _deprecated..." -ForegroundColor Cyan

$deprecatedPath = "public\_deprecated"
if (Test-Path $deprecatedPath) {
    Remove-Item -Recurse -Force $deprecatedPath -ErrorAction SilentlyContinue
    if (-not (Test-Path $deprecatedPath)) {
        Write-Host "   ✅ Usunięto katalog _deprecated (~5 MB)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Nie udało się usunąć _deprecated" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ℹ️  Katalog _deprecated nie istnieje (pominięto)" -ForegroundColor Gray
}

Write-Host ""

# ====================================
# 4. DUPLIKATY
# ====================================
Write-Host "🔄 [5/7] Usuwanie duplikatów..." -ForegroundColor Cyan

$duplicates = @(
    "src\services\pdfService — kopia.ts",
    "public\pages\wines copy.html",
    "public\wines copy.html",
    "public\a5-card — kopia.html",
    "data\collections — kopia.json"
)

$deletedDuplicates = 0
foreach ($file in $duplicates) {
    if (Test-Path $file) {
        Remove-Item $file -ErrorAction SilentlyContinue
        if (-not (Test-Path $file)) {
            $deletedDuplicates++
            Write-Host "   ✓ Usunięto: $(Split-Path $file -Leaf)" -ForegroundColor Gray
        }
    }
}

Write-Host "   ✅ Usunięto $deletedDuplicates duplikatów" -ForegroundColor Green
Write-Host ""

# ====================================
# 5. STARE BACKUPY DANYCH
# ====================================
Write-Host "💾 [6/7] Czyszczenie starych backupów danych..." -ForegroundColor Cyan

$oldBackups = @(
    "data\wines.json.backup-auto-fix-*",
    "data\wines.json.backup-before-poj-addition",
    "data\wines.json.backup-before-variety-cleanup"
)

$deletedDataBackups = 0
foreach ($pattern in $oldBackups) {
    $files = Get-ChildItem -Path $pattern -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        Remove-Item $file.FullName -ErrorAction SilentlyContinue
        if (-not (Test-Path $file.FullName)) {
            $deletedDataBackups++
        }
    }
}

Write-Host "   ✅ Usunięto $deletedDataBackups starych backupów" -ForegroundColor Green
Write-Host "   ℹ️  Zachowano: wines.json.backup (główny backup)" -ForegroundColor Gray
Write-Host ""

# ====================================
# 6. PLIKI TYMCZASOWE
# ====================================
Write-Host "🧹 [7/7] Usuwanie plików tymczasowych..." -ForegroundColor Cyan

$tempFiles = @(
    "debug-categories-output.html",
    "template-fixed.html",
    "new-template-category-list.json",
    "data\template_export_1547703.json",
    "__tests__\test.html"
)

$deletedTemp = 0
foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        Remove-Item $file -ErrorAction SilentlyContinue
        if (-not (Test-Path $file)) {
            $deletedTemp++
        }
    }
}

Write-Host "   ✅ Usunięto $deletedTemp plików tymczasowych" -ForegroundColor Green
Write-Host ""

# ====================================
# PODSUMOWANIE
# ====================================
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  🎉 CZYSZCZENIE ZAKOŃCZONE POMYŚLNIE!                    ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Podsumowanie:" -ForegroundColor Cyan
Write-Host "   • Foldery backup:      $deletedBackups usunięto (~422 MB)" -ForegroundColor White
Write-Host "   • Pliki testowe:       $deletedTests usuniętych" -ForegroundColor White
Write-Host "   • Katalog _deprecated: " -NoNewline -ForegroundColor White
if (-not (Test-Path "public\_deprecated")) {
    Write-Host "usunięty (~5 MB)" -ForegroundColor White
} else {
    Write-Host "pominięty" -ForegroundColor Gray
}
Write-Host "   • Duplikaty:           $deletedDuplicates usuniętych" -ForegroundColor White
Write-Host "   • Stare backupy:       $deletedDataBackups usuniętych" -ForegroundColor White
Write-Host "   • Pliki tymczasowe:    $deletedTemp usuniętych" -ForegroundColor White
Write-Host "   ────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "   Razem:                 ~450 MB oszczędności" -ForegroundColor Green
Write-Host ""

Write-Host "Nastepne kroki:" -ForegroundColor Cyan
Write-Host "   1. npm run build       - Przebuduj projekt" -ForegroundColor White
Write-Host "   2. npm test            - Uruchom testy" -ForegroundColor White
Write-Host "   3. npm run dev         - Wystartuj serwer dev" -ForegroundColor White
Write-Host "   4. Przetestuj aplikacje w przegladarce" -ForegroundColor White
Write-Host "   5. git add -A; git commit -m 'Czyszczenie projektu'" -ForegroundColor White
Write-Host ""

Write-Host "Jesli cos pojdzie nie tak, przywroc backup:" -ForegroundColor Yellow
Write-Host "   git reset --hard $tagName" -ForegroundColor Gray
Write-Host ""

# Zapytaj czy uruchomic build
$runBuild = Read-Host "Czy uruchomic 'npm run build' teraz? (tak/nie)"
if ($runBuild -eq "tak") {
    Write-Host "`nUruchamianie npm run build...`n" -ForegroundColor Cyan
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nBuild zakonczony pomyslnie!`n" -ForegroundColor Green
    } else {
        Write-Host "`nBuild zakonczony z bledami. Sprawdz logi powyzej.`n" -ForegroundColor Yellow
    }
}

Write-Host "Gotowe! Projekt wyczyszczony.`n" -ForegroundColor Green
