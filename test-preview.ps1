# Test API podglądu PDF z poprawionymi jednostkami mm
$response = Invoke-RestMethod -Uri "http://localhost:3001/api/pdf/templates/5d9e97ee-76c1-4568-af92-2209154d6bde/preview" -Method GET
Write-Host "Response: $response"