# Instrukcja wdrożenia - 21.11.2025

## 📦 Paczka do wgrania
**Plik:** `pdfwinegenerator_production_20251121_190504.zip` (239 MB)

## ✨ Nowe funkcje i poprawki

### 1. Naprawiono błędy 404 na serwerze produkcyjnym
- ✅ Dodano alias routingu `/theme-settings` (oprócz `/api/theme-settings`)
- ✅ Poprawiono `theme-loader.js` - próbuje 2 ścieżki API
- ✅ Usunięto spam w konsoli - cicha obsługa braku endpointu
- ✅ Zmniejszono częstotliwość odświeżania (5 minut zamiast 30 sekund)

### 2. Edytowalne pola w PDF
- ✅ Implementacja PDF AcroForms (pola do wypełnienia w PDF)
- ✅ Metoda `addEditableFieldsToPDF()` w PDFService
- ✅ Wykrywanie atrybutów HTML `data-editable-price`
- ✅ Dokumentacja: `docs/EDITABLE_PDF_FIELDS.md`
- ✅ Przykładowy szablon: `docs/examples/editable-price-template.html`

### 3. Pole coverImage w kolekcjach
- ✅ Rozszerzona walidacja Joi o pole `coverImage`
- ✅ Frontend może zapisywać ścieżki do okładek
- ✅ Szablon może używać `{{collection.coverImage}}`

## 🚀 Kroki wdrożenia

### Na serwerze ratunek.it:

```bash
# 1. Zatrzymaj serwer
pm2 stop wine-management

# 2. Stwórz backup (WAŻNE!)
cd /home/srv52568/pdfapp
tar -czf backup_before_$(date +%Y%m%d_%H%M%S).tar.gz dist/ public/js/ data/ 2>/dev/null

# 3. Wgraj plik ZIP przez FTP/SFTP do katalogu tymczasowego
# pdfwinegenerator_production_20251121_190504.zip

# 4. Wypakuj archiwum (NADPISUJE istniejące pliki)
unzip -o pdfwinegenerator_production_20251121_190504.zip -d /home/srv52568/pdfapp/

# 5. Zainstaluj/zaktualizuj zależności (ZAWSZE wykonaj ten krok!)
cd /home/srv52568/pdfapp
npm install --production
# Moduły zostaną zainstalowane w virtualenv: /home/srv52568/nodevenv/pdfapp/22/lib/node_modules

# 6. Usuń stary proces i uruchom nowy
pm2 delete wine-management 2>/dev/null || true
pm2 start ecosystem.config.json
pm2 save

# 7. Sprawdź czy działa
pm2 status
pm2 logs wine-management --lines 20

# 8. Test endpointu
curl http://localhost:3001/api/wines?limit=1
```

### 🔍 Diagnostyka (jeśli coś nie działa):
```bash
# Uruchom skrypt diagnostyczny
bash scripts/diagnose-server.sh
```

## ✅ Weryfikacja po wdrożeniu

### 🚨 Najpierw sprawdź czy serwer działa:
```bash
# Na serwerze wykonaj:
pm2 status

# Powinno pokazać:
# wine-management │ online │ ...
```

**Jeśli pokazuje `stopped` lub brak procesu** → serwer nie działa, przejdź do sekcji "Rozwiązywanie problemów"

### Sprawdź endpointy:
1. https://ratunek.it/theme-settings - powinno zwrócić JSON
2. https://ratunek.it/api/theme-settings - powinno zwrócić JSON
3. https://ratunek.it/api/settings/appearance - powinno zwrócić JSON

**Jeśli widzisz błąd 503** → serwer Node.js nie działa, sprawdź PM2

### Sprawdź konsolę przeglądarki:
- ❌ Nie powinno być błędów 404 dla theme-settings
- ❌ Nie powinno być błędów 404 dla api/settings/appearance
- ✅ Dashboard powinien ładować się bez problemów

## 📝 Pliki zmienione w tej aktualizacji

### Backend (TypeScript):
- `src/app.ts` - dodano alias `/theme-settings`
- `src/services/pdfService.ts` - edytowalne pola PDF
- `src/validators/schemas.ts` - pole `coverImage`

### Frontend (JavaScript):
- `public/js/theme-loader.js` - wielokrotne ścieżki API, cicha obsługa błędów

### Dokumentacja:
- `docs/EDITABLE_PDF_FIELDS.md` - instrukcja edytowalnych pól
- `docs/examples/editable-price-template.html` - przykład użycia

## 🔧 Rozwiązywanie problemów

### ⚠️ WAŻNE: Błąd 503 Service Unavailable
Jeśli widzisz błąd 503, serwer Node.js **nie działa**. Sprawdź:

```bash
# 1. Sprawdź status PM2
pm2 status

# 2. Sprawdź logi aplikacji
pm2 logs wine-management --lines 50

# 3. Jeśli proces nie istnieje, uruchom:
cd /home/srv52568/pdfapp
pm2 start ecosystem.config.json
pm2 save

# 4. Jeśli proces istnieje ale nie działa:
pm2 restart wine-management

# 5. Sprawdź czy Node.js działa:
pm2 ps
```

### Jeśli wciąż 404 dla /theme-settings:
```bash
# Sprawdź czy dist/ został wypakowany
ls -la /home/srv52568/pdfapp/dist/routes/

# Powinny być pliki:
# - themeSettings.js
# - settings/ (folder)
```

### Jeśli błędy w logach:
```bash
# Sprawdź szczegółowe logi
pm2 logs wine-management --lines 100 --err

# Sprawdź błędy kompilacji
cat logs/wine-management.log | tail -50

# Jeśli brakuje modułów:
npm install --production

# Jeśli błędy TypeScript:
npm run build
```

### Jeśli port jest zajęty:
```bash
# Sprawdź co używa portu (domyślnie 3001)
lsof -i :3001

# Lub sprawdź wszystkie procesy Node
ps aux | grep node

# Zabij stary proces jeśli potrzeba
pm2 delete wine-management
pm2 start ecosystem.config.json
```

## 📊 Struktura wdrożonej aplikacji

**UWAGA:** Aplikacja używa Node.js virtualenv!

```
/home/srv52568/pdfapp/           ← Root aplikacji
├── dist/                        ← Skompilowany TypeScript (Node.js)
│   ├── app.js
│   ├── server.js
│   ├── routes/
│   │   ├── themeSettings.js     ← NOWY routing
│   │   └── settings/            ← Routing ustawień
│   │       ├── index.js
│   │       ├── appearance.js
│   │       ├── security.js
│   │       ├── system.js
│   │       └── users.js
│   └── services/
│       └── pdfService.js        ← Edytowalne pola PDF
├── public/             ← Pliki statyczne (HTML, CSS, JS)
│   └── js/
│       └── theme-loader.js      ← Poprawiony plik
├── data/                        ← Baza danych JSON
├── package.json
└── ecosystem.config.json

/home/srv52568/nodevenv/pdfapp/22/lib/   ← Node.js virtualenv
└── node_modules/                         ← Zainstalowane moduły NPM

/home/srv52568/domains/ratunek.it/public_html/  ← Public URL (symlink lub redirect)
```

## ⚠️ Ważne uwagi

1. **Backup danych** - przed wdrożeniem wykonaj backup folderu `data/`
2. **Node.js** - upewnij się, że serwer używa Node.js 16+
3. **PM2** - aplikacja wymaga PM2 do zarządzania procesem
4. **Uprawnienia** - sprawdź uprawnienia do zapisu w `data/` i `public/uploads/`

## 📞 Support

W razie problemów sprawdź:
- `logs/wine-management.log` - logi aplikacji
- `pm2 logs wine-management` - logi PM2
- Konsola przeglądarki - błędy JavaScript

---
**Data wdrożenia:** 21.11.2025  
**Wersja:** 2.0.0  
**Deployment package:** pdfwinegenerator_production_20251121_190504.zip
