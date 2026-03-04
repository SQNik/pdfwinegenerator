# Punkt Przywrócenia - 19.02.2026 12:26:55

## 📦 Zawartość Backupu

- **data/** - Wszystkie dane aplikacji (wina, kolekcje, konfiguracje pól, szablony PDF)
- **public_pages/** - Źródłowe pliki HTML ze strony publicznej
- **public_html/** - Wygenerowane pliki HTML
- **package.json** - Konfiguracja zależności
- **tsconfig.json** - Konfiguracja TypeScript

## 🔄 Jak Przywrócić

### Przywrócenie Danych
```powershell
# Przywróć katalog data
Copy-Item -Path "backup_restore_point_20260219_122655\data\*" -Destination "data\" -Recurse -Force
```

### Przywrócenie Stron HTML
```powershell
# Przywróć źródłowe pliki HTML
Copy-Item -Path "backup_restore_point_20260219_122655\public_pages\*" -Destination "public\pages\" -Recurse -Force

# Przywróć wygenerowane pliki HTML
Copy-Item -Path "backup_restore_point_20260219_122655\public_html\*.html" -Destination "public\" -Force

# Przebuduj HTML
npm run build:html
```

### Pełne Przywrócenie
```powershell
# Przywróć wszystko
Copy-Item -Path "backup_restore_point_20260219_122655\data\*" -Destination "data\" -Recurse -Force
Copy-Item -Path "backup_restore_point_20260219_122655\public_pages\*" -Destination "public\pages\" -Recurse -Force
Copy-Item -Path "backup_restore_point_20260219_122655\package.json" -Destination "." -Force
Copy-Item -Path "backup_restore_point_20260219_122655\tsconfig.json" -Destination "." -Force
npm run build
```

## ℹ️ Informacje

- **Data utworzenia**: 19 lutego 2026, 12:26:55
- **Rozmiar**: ~4.6 MB
- **Liczba plików**: 43
- **Cel**: Punkt przywrócenia przed zmianami

---
*Automatycznie wygenerowany backup systemu Wine Management*
