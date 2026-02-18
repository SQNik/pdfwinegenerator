# 🗂️ Struktura serwera ratunek.it

## Lokalizacja plików

### Aplikacja (Root)
```
/home/srv52568/pdfapp/
```
**Zawartość:**
- `dist/` - skompilowany kod TypeScript (Node.js)
- `public/` - pliki statyczne (HTML, CSS, JS)
- `data/` - baza danych JSON
- `src/` - kod źródłowy TypeScript
- `package.json` - definicja zależności
- `ecosystem.config.json` - konfiguracja PM2
- `.env.production` - zmienne środowiskowe

### Node.js Virtualenv (Moduły)
```
/home/srv52568/nodevenv/pdfapp/22/lib/
```
**Zawartość:**
- `node_modules/` - zainstalowane pakiety NPM (~200+ modułów)

**Wersja Node.js:** 22.x

### Public URL (Web Root)
```
/home/srv52568/domains/ratunek.it/public_html/
```
**Przeznaczenie:** Publiczny dostęp do aplikacji przez HTTPS

---

## Polecenia administracyjne

### Nawigacja
```bash
# Przejdź do głównego katalogu aplikacji
cd /home/srv52568/pdfapp

# Sprawdź aktualną lokalizację
pwd
```

### Instalacja zależności
```bash
cd /home/srv52568/pdfapp
npm install --production

# Moduły zostaną zainstalowane w:
# /home/srv52568/nodevenv/pdfapp/22/lib/node_modules
```

### Kompilacja TypeScript
```bash
cd /home/srv52568/pdfapp
npm run build

# Wynik kompilacji trafi do:
# /home/srv52568/pdfapp/dist/
```

### Zarządzanie procesem PM2
```bash
# Sprawdź status
pm2 status

# Uruchom aplikację
cd /home/srv52568/pdfapp
pm2 start ecosystem.config.json

# Restart aplikacji
pm2 restart wine-management

# Zatrzymaj aplikację
pm2 stop wine-management

# Usuń proces z PM2
pm2 delete wine-management

# Zobacz logi
pm2 logs wine-management
pm2 logs wine-management --lines 50
pm2 logs wine-management --err
```

---

## Wdrażanie aktualizacji

### 1. Backup obecnej wersji
```bash
cd /home/srv52568/pdfapp
tar -czf backup_before_$(date +%Y%m%d_%H%M%S).tar.gz dist/ public/js/ data/
```

### 2. Upload pliku ZIP
```bash
# Przez SCP z lokalnej maszyny:
scp pdfwinegenerator_production_*.zip user@ratunek.it:/home/srv52568/pdfapp/
```

### 3. Wypakowanie
```bash
cd /home/srv52568/pdfapp
unzip -o pdfwinegenerator_production_*.zip
```

### 4. Instalacja zależności
```bash
cd /home/srv52568/pdfapp
npm install --production
```

### 5. Restart serwera
```bash
pm2 delete wine-management 2>/dev/null || true
pm2 start ecosystem.config.json
pm2 save
```

### 6. Weryfikacja
```bash
# Sprawdź status
pm2 status

# Sprawdź logi
pm2 logs wine-management --lines 20

# Test endpointu
curl http://localhost:3001/api/wines?limit=1
```

---

## Diagnostyka

### Szybka diagnostyka
```bash
cd /home/srv52568/pdfapp
bash scripts/diagnose-server.sh
```

### Ręczne sprawdzanie

#### 1. Czy serwer działa?
```bash
pm2 status
# Szukaj: wine-management │ online
```

#### 2. Czy Node.js działa?
```bash
ps aux | grep node
```

#### 3. Czy port 3001 jest zajęty?
```bash
lsof -i :3001
```

#### 4. Czy pliki dist/ istnieją?
```bash
ls -la /home/srv52568/pdfapp/dist/
```

#### 5. Czy node_modules są zainstalowane?
```bash
ls /home/srv52568/nodevenv/pdfapp/22/lib/node_modules | wc -l
# Powinno pokazać ~200+
```

#### 6. Sprawdź logi błędów
```bash
pm2 logs wine-management --err --lines 50
```

#### 7. Test lokalnego endpointu
```bash
curl http://localhost:3001/api/wines?limit=1
# Powinno zwrócić JSON
```

---

## Najczęstsze problemy

### ❌ Błąd 503 Service Unavailable
**Przyczyna:** Serwer Node.js nie działa

**Rozwiązanie:**
```bash
cd /home/srv52568/pdfapp
pm2 start ecosystem.config.json
pm2 save
```

### ❌ Błąd: Cannot find module
**Przyczyna:** Brak node_modules

**Rozwiązanie:**
```bash
cd /home/srv52568/pdfapp
npm install --production
pm2 restart wine-management
```

### ❌ Błąd: Port 3001 already in use
**Przyczyna:** Stary proces blokuje port

**Rozwiązanie:**
```bash
lsof -ti:3001 | xargs kill -9
pm2 restart wine-management
```

### ❌ Błąd: ENOENT dist/app.js
**Przyczyna:** Brak skompilowanego kodu

**Rozwiązanie:**
```bash
cd /home/srv52568/pdfapp
npm run build
pm2 restart wine-management
```

---

## Zmienne środowiskowe

### Plik: /home/srv52568/pdfapp/.env.production
```env
NODE_ENV=production
PORT=3001
DATA_DIR=/home/srv52568/pdfapp/data
UPLOAD_DIR=/home/srv52568/pdfapp/public/uploads
```

### Ładowanie zmiennych
Zmienne są automatycznie ładowane przez PM2 z pliku `.env.production` zgodnie z konfiguracją w `ecosystem.config.json`.

---

## Logi

### Lokalizacja logów PM2
```bash
~/.pm2/logs/wine-management-out.log  # Standardowe wyjście
~/.pm2/logs/wine-management-err.log  # Błędy
```

### Przeglądanie logów
```bash
# Wszystkie logi (ostatnie 20 linii)
pm2 logs wine-management --lines 20

# Tylko błędy
pm2 logs wine-management --err --lines 50

# Ciągłe śledzenie logów (Ctrl+C aby wyjść)
pm2 logs wine-management
```

---

## Dostęp SSH

### Połączenie
```bash
ssh user@ratunek.it
```

### Po zalogowaniu
```bash
# Przejdź do aplikacji
cd /home/srv52568/pdfapp

# Sprawdź status
pm2 status
```

---

## Uprawnienia

### Sprawdzanie uprawnień
```bash
ls -la /home/srv52568/pdfapp/
```

### Ustawienie poprawnych uprawnień (jeśli potrzebne)
```bash
cd /home/srv52568/pdfapp

# Pliki data/ muszą być zapisywalne
chmod -R 755 data/
chmod -R 755 public/uploads/

# Pliki dist/ mogą być tylko do odczytu
chmod -R 755 dist/
```

---

## Wsparcie

### Pliki pomocnicze
- `QUICK_FIX_503.md` - Szybka pomoc dla błędu 503
- `DEPLOYMENT_CHECKLIST_20251121.md` - Pełna lista kontrolna wdrożenia
- `scripts/diagnose-server.sh` - Skrypt diagnostyczny

### Kontakt
W razie problemów:
1. Uruchom diagnostykę: `bash scripts/diagnose-server.sh`
2. Sprawdź logi: `pm2 logs wine-management --lines 100`
3. Sprawdź dokumentację: `QUICK_FIX_503.md`

---

**Data:** 22.11.2025  
**Serwer:** ratunek.it  
**Hosting:** Node.js virtualenv (v22)  
**Process Manager:** PM2
