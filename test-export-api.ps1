# Test nowych endpointów eksportu kolekcji

# 1. Test endpointu scalonych kolekcji
Write-Host "=== Test 1: Scalone kolekcje z pełnymi danymi win ==="
try {
    $merged = Invoke-RestMethod -Uri "http://localhost:3001/api/collections/export/merged" -Method GET
    if ($merged.success) {
        Write-Host "✅ Endpoint działa. Liczba kolekcji: $($merged.data.Count)"
        $firstCollection = $merged.data[0]
        Write-Host "   Pierwsza kolekcja: '$($firstCollection.name)' z $($firstCollection.wineCount) winami"
        Write-Host "   Pierwsza kolekcja ma $($firstCollection.wines.Count) pełnych obiektów win"
        if ($firstCollection.wines.Count -gt 0) {
            $firstWine = $firstCollection.wines[0]
            Write-Host "   Pierwsze wino: '$($firstWine.name)' (catalogNumber: $($firstWine.catalogNumber))"
        }
    } else {
        Write-Host "❌ Błąd API: $($merged.error)"
    }
} catch {
    Write-Host "❌ Błąd połączenia: $($_.Exception.Message)"
}

Write-Host ""

# 2. Test endpointu eksportu pojedynczej kolekcji
Write-Host "=== Test 2: Eksport pojedynczej kolekcji ==="
$collectionId = "collection_1760696863906_s12awxd32"
try {
    $exportUrl = "http://localhost:3001/api/collections/$collectionId/export"
    $response = Invoke-WebRequest -Uri $exportUrl -Method GET
    Write-Host "✅ Endpoint eksportu działa. Status: $($response.StatusCode)"
    Write-Host "   Content-Type: $($response.Headers.'Content-Type')"
    Write-Host "   Content-Disposition: $($response.Headers.'Content-Disposition')"
    
    # Parse JSON response
    $exportData = $response.Content | ConvertFrom-Json
    Write-Host "   Eksportowana kolekcja: '$($exportData.collection.name)'"
    Write-Host "   Liczba win w eksporcie: $($exportData.wines.Count)"
    Write-Host "   Data eksportu: $($exportData.exportInfo.exportedAt)"
} catch {
    Write-Host "❌ Błąd eksportu: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Testy zakończone ==="