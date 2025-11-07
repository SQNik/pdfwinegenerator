# 🚀 Instrukcja Uruchomienia Wine Management System na Serwerze

## 📋 Spis Treści
1. [Wymagania Systemowe](#wymagania-systemowe)
2. [Przygotowanie Serwera](#przygotowanie-serwera)
3. [Instalacja Aplikacji](#instalacja-aplikacji)
4. [Uruchomienie w Trybie Deweloperskim](#uruchomienie-deweloperskim)
5. [Uruchomienie w Trybie Produkcyjnym](#uruchomienie-produkcyjnym)
6. [Zarządzanie Aplikacją](#zarządzanie-aplikacją)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Wymagania Systemowe

### Minimalne Wymagania:
- **System Operacyjny**: Windows 10/11, Linux (Ubuntu 20.04+, Debian 11+), macOS 10.15+
- **Node.js**: v18.0.0 lub nowszy (zalecane: v20 LTS)
- **npm**: v9.0.0 lub nowszy
- **RAM**: minimum 2GB wolnej pamięci
- **Dysk**: minimum 500MB wolnego miejsca
- **Port**: 3001 (domyślny, można zmienić)

### Opcjonalne (dla produkcji):
- **PM2**: Process manager dla Node.js
- **Nginx**: Reverse proxy (zalecane dla produkcji)
- **SSL Certificate**: Dla HTTPS (Let's Encrypt)

---

## 🎯 Przygotowanie Serwera

### KROK 1: Instalacja Node.js

#### Windows:
```powershell
# Pobierz instalator z https://nodejs.org/
# Lub użyj Chocolatey:
choco install nodejs-lts

# Sprawdź wersję
node --version
npm --version
```

#### Linux (Ubuntu/Debian):
```bash
# Dodaj repozytorium NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Zainstaluj Node.js
sudo apt-get install -y nodejs

# Sprawdź wersję
node --version
npm --version
```

#### macOS:
```bash
# Użyj Homebrew
brew install node@20

# Sprawdź wersję
node --version
npm --version
```

### KROK 2: Instalacja PM2 (opcjonalne, zalecane dla produkcji)

```bash
# Globalnie zainstaluj PM2
npm install -g pm2

# Sprawdź instalację
pm2 --version

# (Opcjonalnie) Skonfiguruj autostart przy restarcie systemu
pm2 startup
# Wykonaj komendę wyświetloną przez PM2
```

---

## 📦 Instalacja Aplikacji

### KROK 3: Pobranie Kodu Aplikacji

#### Opcja A: Git Clone (jeśli używasz Git)
```bash
# Sklonuj repozytorium
git clone <URL_REPO>
cd WINANEWPDF-bck
```

#### Opcja B: Ręczne Pobranie
1. Skopiuj folder aplikacji na serwer
2. Przejdź do katalogu aplikacji:
```bash
cd ścieżka/do/WINANEWPDF-bck
```

### KROK 4: Instalacja Zależności

```bash
# Zainstaluj wszystkie wymagane pakiety
npm install

# Sprawdź czy nie ma błędów
npm audit
```

**⚠️ Uwaga**: Ten proces może potrwać 2-5 minut w zależności od szybkości internetu.

### KROK 5: Kompilacja TypeScript

```bash
# Skompiluj kod TypeScript do JavaScript
npm run build

# Sprawdź czy folder 'dist' został utworzony
ls dist  # Linux/macOS
dir dist # Windows
```

**✅ Co się dzieje**: TypeScript zostaje skompilowany do JavaScript w folderze `dist/`

---

## 🔨 Uruchomienie w Trybie Deweloperskim

### KROK 6: Uruchomienie Dev Server

```bash
# Uruchom serwer deweloperski z hot-reload
npm run dev
```

**Co zobaczysz**:
```
[INFO] 16:07:59 Server running on http://localhost:3001
[INFO] 16:07:59 Environment: development
[INFO] 16:07:59 Data directory: ./data
[INFO] 16:07:59 Loaded X wines, Y collections
```

### KROK 7: Sprawdzenie Działania

1. Otwórz przeglądarkę
2. Wejdź na: `http://localhost:3001`
3. Powinieneś zobaczyć dashboard aplikacji

**Testowanie**:
- ✅ Dashboard się ładuje
- ✅ Możesz przejść do zakładki "Wina"
- ✅ Możesz przejść do zakładki "Kolekcje"
- ✅ API odpowiada: http://localhost:3001/api/wines

---

## 🚀 Uruchomienie w Trybie Produkcyjnym

### KROK 8: Przygotowanie do Produkcji

```bash
# 1. Upewnij się że kod jest skompilowany
npm run build

# 2. Sprawdź konfigurację PM2
cat ecosystem.config.json  # Linux/macOS
type ecosystem.config.json # Windows
```

### KROK 9: Uruchomienie z PM2

```bash
# Uruchom aplikację w trybie produkcyjnym
npm run production

# LUB bezpośrednio:
pm2 start ecosystem.config.json --env production
```

**Co się dzieje**:
- PM2 uruchamia aplikację w trybie cluster (max rdzeni CPU)
- Aplikacja działa w tle
- Automatyczny restart przy crash
- Logi są zapisywane do `./logs/`

### KROK 10: Weryfikacja Działania

```bash
# Sprawdź status aplikacji
pm2 status

# Powinieneś zobaczyć:
# ┌─────┬──────────────────────────┬─────────┬─────────┬─────────┐
# │ id  │ name                     │ status  │ cpu     │ memory  │
# ├─────┼──────────────────────────┼─────────┼─────────┼─────────┤
# │ 0   │ wine-management-system   │ online  │ 0%      │ 45.2mb  │
# └─────┴──────────────────────────┴─────────┴─────────┴─────────┘

# Sprawdź logi
pm2 logs wine-management-system --lines 50
```

### KROK 11: Testowanie Aplikacji Produkcyjnej

```bash
# Test API
curl http://localhost:3001/api/wines

# Test interfejsu (otwórz w przeglądarce)
# http://localhost:3001
```

---

## 🔧 Zarządzanie Aplikacją

### Podstawowe Komendy PM2

```bash
# ===== MONITORING =====
# Status wszystkich procesów
pm2 status

# Live monitoring (CPU, memory, logs)
pm2 monit

# Szczegółowe info o aplikacji
pm2 show wine-management-system

# Logi w czasie rzeczywistym
pm2 logs wine-management-system

# ===== RESTART / RELOAD =====
# Restart aplikacji (krótka przerwa w działaniu)
pm2 restart wine-management-system

# Reload aplikacji (zero-downtime)
pm2 reload wine-management-system

# ===== STOP / DELETE =====
# Zatrzymaj aplikację
pm2 stop wine-management-system

# Usuń z PM2 (nie usuwa plików)
pm2 delete wine-management-system

# ===== SAVE / STARTUP =====
# Zapisz aktualną konfigurację PM2
pm2 save

# Konfiguruj autostart przy restarcie systemu
pm2 startup
```

### Aktualizacja Aplikacji

```bash
# 1. Zatrzymaj aplikację
pm2 stop wine-management-system

# 2. Pobierz nowe zmiany (jeśli używasz Git)
git pull

# 3. Zainstaluj nowe zależności (jeśli są)
npm install

# 4. Skompiluj kod
npm run build

# 5. Uruchom ponownie
pm2 restart wine-management-system

# 6. Sprawdź logi
pm2 logs wine-management-system --lines 50
```

### Backup Danych

```bash
# Folder z danymi do backup:
# ./data/
#   ├── wines.json
#   ├── collections.json
#   ├── fields-config.json
#   ├── collection-fields-config.json
#   └── pdf-templates.json

# Utwórz backup (Linux/macOS)
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Utwórz backup (Windows PowerShell)
Compress-Archive -Path .\data\* -DestinationPath "backup-$(Get-Date -Format 'yyyyMMdd').zip"
```

---

## ⚙️ Konfiguracja Zaawansowana

### Zmiana Portu

**Opcja 1: Zmienna środowiskowa**
```bash
# Linux/macOS
export PORT=8080
npm start

# Windows PowerShell
$env:PORT = "8080"
npm start
```

**Opcja 2: Edycja ecosystem.config.json**
```json
{
  "apps": [{
    "env_production": {
      "PORT": 8080
    }
  }]
}
```

### Konfiguracja Nginx (Reverse Proxy)

```nginx
# /etc/nginx/sites-available/wine-management
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Aktywuj konfigurację
sudo ln -s /etc/nginx/sites-available/wine-management /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔍 Troubleshooting

### Problem: Port 3001 jest zajęty

```bash
# Znajdź proces na porcie 3001
# Linux/macOS:
lsof -i :3001

# Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess

# Zabij proces lub zmień port aplikacji
```

### Problem: Błąd "Cannot find module"

```bash
# Usuń node_modules i zainstaluj ponownie
rm -rf node_modules package-lock.json  # Linux/macOS
Remove-Item -Recurse node_modules, package-lock.json  # Windows

npm install
```

### Problem: TypeScript compilation errors

```bash
# Wyczyść cache i przebuduj
npm run clean
npm run build
```

### Problem: PM2 nie startuje

```bash
# Sprawdź logi błędów PM2
pm2 logs wine-management-system --err

# Sprawdź czy dist/ istnieje
ls dist/server.js

# Spróbuj uruchomić bezpośrednio Node.js
node dist/server.js
```

### Problem: Brak danych po uruchomieniu

```bash
# Sprawdź czy folder data/ istnieje i ma pliki
ls -la data/

# Jeśli brak, skopiuj z backup lub pozwól systemowi utworzyć domyślne
```

### Problem: EADDRINUSE błąd

```
Error: listen EADDRINUSE: address already in use :::3001
```

**Rozwiązanie**:
```bash
# 1. Zmień port w konfiguracji
# 2. LUB zatrzymaj aplikację zajmującą port:
pm2 stop all
# 3. Uruchom ponownie
pm2 start ecosystem.config.json --env production
```

---

## 📊 Sprawdzanie Zdrowia Aplikacji

### Health Check Endpoint

```bash
# Sprawdź czy aplikacja odpowiada
curl http://localhost:3001/api/wines

# Powinno zwrócić JSON z listą win
```

### Monitoring Zasobów

```bash
# PM2 monitoring dashboard
pm2 monit

# Statystyki aplikacji
pm2 show wine-management-system
```

### Logi

```bash
# Ostatnie 100 linii logów
pm2 logs wine-management-system --lines 100

# Tylko błędy
pm2 logs wine-management-system --err

# Real-time logs
pm2 logs wine-management-system --raw
```

---

## 🎯 Quick Reference

### Szybki Start (Development)
```bash
npm install
npm run build
npm run dev
# Otwórz: http://localhost:3001
```

### Szybki Start (Production)
```bash
npm install
npm run build
npm run production
pm2 status
# Otwórz: http://localhost:3001
```

### Restart po Zmianach
```bash
npm run build && pm2 restart wine-management-system
```

---

## 📞 Wsparcie

### Przydatne Komendy Diagnostyczne

```bash
# Wersja Node.js i npm
node --version && npm --version

# Lista procesów PM2
pm2 list

# Szczegóły systemu
pm2 info wine-management-system

# Export logów
pm2 logs wine-management-system > logs-export.txt
```

### Struktura Projektu
```
WINANEWPDF-bck/
├── src/                    # TypeScript source code
├── dist/                   # Compiled JavaScript (po build)
├── public/                 # Frontend files
├── data/                   # JSON database files
├── logs/                   # Application logs
├── package.json           # Dependencies
├── ecosystem.config.json  # PM2 configuration
└── tsconfig.json         # TypeScript config
```

---

## ✅ Checklist Przed Wdrożeniem

- [ ] Node.js v18+ zainstalowany
- [ ] npm install wykonane bez błędów
- [ ] npm run build wykonane pomyślnie
- [ ] Port 3001 wolny (lub zmieniony)
- [ ] Folder data/ istnieje
- [ ] PM2 zainstalowane (dla produkcji)
- [ ] Backup danych utworzony
- [ ] Firewall skonfigurowany (jeśli potrzebny)
- [ ] Nginx skonfigurowany (jeśli używany)
- [ ] SSL certyfikat zainstalowany (dla HTTPS)

---

**Powodzenia! 🚀**

Jeśli masz problemy, sprawdź sekcję [Troubleshooting](#troubleshooting) lub logi aplikacji.
