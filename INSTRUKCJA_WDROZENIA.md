# Instrukcja wdrożenia na serwer CloudLinux

## Pakiet: `pdfwinegenerator_production_20251121_010208.zip`

### ✅ Poprawki zawarte w tej wersji (WERSJA FINALNA)

1. **CSP (Content Security Policy)** - Usunięto WSZYSTKIE inline scripts
   - `index.html` → `public/js/dashboard.js`
   - `collections.html` → `public/js/components/collections-init.js`
   
2. **API URL (KRYTYCZNA POPRAWKA)** - Naprawiono hardcoded localhost
   - `public/js/config.js` → `window.location.origin + '/api'`
   - `public/js/api.js` → `window.location.origin + "/api"`
   
3. **Rate Limiting** - Dodano rozluźnione limity dla trybu development
   - Development: 1000 req/min
   - Production: 100 req/15 min
   
4. **Favicon** - Dodano `public/favicon.ico` (brak błędu 404)

5. **TypeScript** - Dodano `pdfSettings` do wszystkich interfejsów

6. **Theme Loader** - Lepsza obsługa błędu 404 dla `/api/theme-settings`
   - Zamiast powtarzających się błędów w konsoli, pokazuje tylko ostrzeżenie

---

## 📦 Krok 1: Upload paczki na serwer

### Opcja A: Przez FTP/SFTP (FileZilla, WinSCP)
```
Host: ratunek.it (lub IP serwera)
User: srv52568
Port: 22 (SFTP) lub 21 (FTP)
Protokół: SFTP

Katalog docelowy: /home/srv52568/
```

Wgraj plik: `pdfwinegenerator_production_20251121_010208.zip`

### Opcja B: Przez panel plików w CloudLinux
1. Zaloguj się do panelu CloudLinux
2. Przejdź do "Menedżer plików"
3. Wgraj ZIP do `/home/srv52568/`

---

## 🔧 Krok 2: Rozpakowanie i instalacja (SSH)

```bash
# Połącz się SSH z serwerem
ssh srv52568@ratunek.it

# Przejdź do katalogu aplikacji Node.js
cd /home/srv52568/domains/ratunek.it/

# BACKUP starej wersji (WAŻNE!)
mkdir -p ~/backups
tar -czf ~/backups/backup_$(date +%Y%m%d_%H%M%S).tar.gz ./*

# Wyczyść katalog (zachowaj node_modules jeśli są duże)
# LUB użyj unzip -o do nadpisania bez usuwania
rm -rf dist/ public/ data/ src/ scripts/ *.js *.json docs/

# Rozpakuj nową wersję (użyj -o aby nadpisać bez usuwania katalogów)
unzip -o ~/pdfwinegenerator_production_20251121_010208.zip

# Instalacja zależności (bez devDependencies)
npm install --production

# Weryfikacja instalacji
npm list --depth=0
```

---

## ⚙️ Krok 3: Konfiguracja zmiennych środowiskowych

### Przez panel CloudLinux (ZALECANE):

1. Przejdź do: **Pulpit → Nginx Unit → WinePDFGenerator**
2. Kliknij zakładkę **"Zaawansowane"**
3. W sekcji **"Środowisko"** dodaj zmienne:

```
NODE_ENV = production
PORT = 3001
CORS_ORIGIN = https://pdf.wsparcie-24.pl,https://ratunek.it
CORS_CREDENTIALS = true
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100
ENABLE_COMPRESSION = true
ENABLE_ETAG = true
STATIC_CACHE_MAX_AGE = 86400
LOG_LEVEL = info
```

4. Kliknij **"ZMIEŃ"**

### Przez SSH (alternatywnie):

```bash
# Utwórz plik .env w katalogu aplikacji
cd /home/srv52568/domains/ratunek.it/
nano .env
```

Wklej:
```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://pdf.wsparcie-24.pl,https://ratunek.it
CORS_CREDENTIALS=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_COMPRESSION=true
ENABLE_ETAG=true
STATIC_CACHE_MAX_AGE=86400
LOG_LEVEL=info
```

Zapisz: `Ctrl+O` → Enter → `Ctrl+X`

---

## 🚀 Krok 4: Konfiguracja aplikacji w panelu CloudLinux

1. Przejdź do: **Pulpit → Nginx Unit → WinePDFGenerator**
2. W zakładce **"Konfiguracja"** sprawdź:
   - **Katalog roboczy**: `/home/srv52568/domains/ratunek.it/`
   - **Skrypt**: `dist/server.js`
   - **Argumenty**: pozostaw puste lub `-1`
3. W zakładce **"Zaawansowane"**:
   - **Procesy**: Dynamiczny
   - **Limit czasu**: 300
   - **Zapytania**: 1000
4. Kliknij **"ZMIEŃ"**

---

## 🔄 Krok 5: Restart aplikacji

### Przez panel CloudLinux:
1. Przejdź do: **Pulpit → Nginx Unit → Aplikacje Unit**
2. Znajdź **WinePDFGenerator**
3. Kliknij przycisk **"RESTART"** (czerwony)

### Przez SSH:
```bash
# Restart aplikacji Node.js przez CloudLinux selector
cloudlinux-selector restart --json --interpreter nodejs --app WinePDFGenerator
```

---

## 🔍 Krok 6: Weryfikacja

### Sprawdź logi aplikacji:
```bash
# Logi CloudLinux Node.js
tail -f /home/srv52568/logs/WinePDFGenerator.log

# Lub w panelu: Pulpit → Nginx Unit → WinePDFGenerator → Zobacz logi
```

### Test API:
```bash
# Przez SSH
curl http://localhost:3001/api/health
```

Otwórz w przeglądarce: 
- `https://ratunek.it` (lub subdomena wskazana w panelu)
- `https://pdf.wsparcie-24.pl` (jeśli skonfigurowana)

---

## 📊 Weryfikacja poprawek

### 1. Wymuś przeładowanie cache w przeglądarce (WAŻNE!)
- **Windows/Linux**: `CTRL + SHIFT + R`
- **Mac**: `CMD + SHIFT + R`
- **Lub**: DevTools (F12) → Network → Zaznacz "Disable cache"

### 2. Sprawdź CSP (brak błędów inline script)
Otwórz DevTools (F12) → Console
- **Oczekiwane**: Brak błędów "Content Security Policy directive"

### 3. Sprawdź API URL (KRYTYCZNE!)
Otwórz DevTools (F12) → Console → Sprawdź logi
- **Oczekiwane**: `Making request to: https://ratunek.it/api/...`
- **NIE**: `http://localhost:3001/api/...`

### 4. Sprawdź Rate Limiting
Odśwież stronę kilka razy
- **Oczekiwane**: Brak błędu 429 (Too Many Requests)

### 5. Sprawdź Favicon
Sprawdź zakładkę przeglądarki
- **Oczekiwane**: Widoczna ikona (brak błędu 404)

### 6. Sprawdź API (SSH)
```bash
curl http://localhost:3001/api/wines?limit=1
curl http://localhost:3001/api/collections
```

---

## 🔄 Rollback (przywrócenie starej wersji)

W razie problemów:

```bash
# Połącz się SSH
ssh srv52568@ratunek.it

# Zatrzymaj aplikację w panelu CloudLinux (RESTART)

# Przywróć backup
cd /home/srv52568/domains/ratunek.it/
rm -rf ./*
tar -xzf ~/backups/backup_XXXXXXXX_XXXXXX.tar.gz

# Restart aplikacji w panelu CloudLinux
```

---

## 📝 Logi i monitoring

### Przez panel CloudLinux:
1. **Pulpit → Nginx Unit → WinePDFGenerator**
2. Kliknij **"Zobacz logi"** w prawym górnym rogu

### Przez SSH:
```bash
# Logi aplikacji
tail -f /home/srv52568/logs/WinePDFGenerator.log

# Logi błędów
tail -f /home/srv52568/logs/WinePDFGenerator.error.log

# Wszystkie logi
ls -la /home/srv52568/logs/
```

---

## ⚠️ Ważne uwagi dla CloudLinux

1. **Node.js v22.x** - Wybierz odpowiednią wersję w panelu CloudLinux
   - **Pulpit → Nginx Unit → Aplikacje Unit → Kolumna "Typ"**

2. **Puppeteer** - Może wymagać dodatkowych zależności systemowych
   - Skontaktuj się z supportem hostingu jeśli PDF generation nie działa
   - Wymagane biblioteki: `libx11-xcb1, libxcomposite1, libnss3, libgbm1`

3. **Uprawnienia katalogów**:
   ```bash
   chmod -R 755 /home/srv52568/domains/ratunek.it/data/
   chmod -R 755 /home/srv52568/domains/ratunek.it/public/uploads/
   ```

4. **Backup danych przed wdrożeniem**:
   ```bash
   cd /home/srv52568/domains/ratunek.it/
   tar -czf ~/backups/data_backup_$(date +%Y%m%d_%H%M%S).tar.gz data/
   ```

5. **Limit pamięci** - W panelu CloudLinux możesz zwiększyć limity w zakładce "Zaawansowane"

---

## 🎯 Checklist wdrożenia CloudLinux

- [ ] Upload pliku ZIP przez FTP/SFTP do `/home/srv52568/`
- [ ] SSH: Backup starej wersji (`tar -czf`)
- [ ] SSH: Rozpakowanie paczki w `/home/srv52568/domains/ratunek.it/`
- [ ] SSH: `npm install --production`
- [ ] Panel: Dodanie zmiennych środowiskowych (zakładka "Zaawansowane")
- [ ] Panel: Sprawdzenie konfiguracji (Katalog roboczy, Skrypt)
- [ ] Panel: RESTART aplikacji (czerwony przycisk)
- [ ] Weryfikacja w przeglądarce
- [ ] Sprawdzenie logów w panelu
- [ ] Test generowania PDF
- [ ] Backup bazy danych (data/)

---

## 💡 Wsparcie

### Logi i debugowanie:
- **Panel CloudLinux**: Pulpit → Nginx Unit → WinePDFGenerator → Zobacz logi
- **SSH logi**: `tail -f /home/srv52568/logs/WinePDFGenerator.log`
- **Test API**: `curl http://localhost:3001/api/health`

### Restart aplikacji:
- **Panel**: Pulpit → Nginx Unit → Aplikacje → RESTART
- **SSH**: `cloudlinux-selector restart --json --interpreter nodejs --app WinePDFGenerator`

### Problemy z Puppeteer:
Jeśli generowanie PDF nie działa, skontaktuj się z supportem hostingu:
```
Temat: Prośba o instalację zależności dla Puppeteer (Chrome Headless)
Treść: Proszę o instalację następujących pakietów systemowych:
libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxi6 
libxtst6 libnss3 libcups2 libxss1 libxrandr2 libasound2 
libpangocairo-1.0-0 libatk1.0-0 libatk-bridge2.0-0 
libgtk-3-0 libgbm1
```
