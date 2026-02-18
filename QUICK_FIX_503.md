# 🚨 Szybka pomoc - Błąd 503 Service Unavailable

## Problem
Strona https://ratunek.it pokazuje błąd **503 Service Unavailable**

## Przyczyna
Serwer Node.js **nie działa** - proces PM2 jest zatrzymany lub nie istnieje.

---

## ✅ Rozwiązanie (krok po kroku)

### 1. Zaloguj się przez SSH na serwer
```bash
ssh user@ratunek.it
```

### 2. Sprawdź status PM2
```bash
pm2 status
```

**Co zobaczysz:**
- ✅ `wine-management │ online` → Serwer działa (przejdź do kroku 4)
- ❌ `wine-management │ stopped` → Serwer zatrzymany (przejdź do kroku 3)
- ❌ Brak procesu → Serwer nie został uruchomiony (przejdź do kroku 3)

### 3. Uruchom serwer
```bash
cd /home/srv52568/pdfapp
pm2 start ecosystem.config.json
pm2 save
```

### 4. Sprawdź czy działa
```bash
# Pokaż status
pm2 status

# Zobacz logi (Ctrl+C aby wyjść)
pm2 logs wine-management

# Test endpointu
curl http://localhost:3001/api/wines?limit=1
```

### 5. Jeśli wciąż nie działa - sprawdź logi błędów
```bash
pm2 logs wine-management --err --lines 50
```

**Najczęstsze błędy:**

#### A) Błąd: "Cannot find module"
```bash
# Zainstaluj brakujące moduły
cd /home/srv52568/pdfapp
npm install --production
pm2 restart wine-management
```

#### B) Błąd: "Port 3001 already in use"
```bash
# Zabij proces na porcie
lsof -ti:3001 | xargs kill -9
pm2 restart wine-management
```

#### C) Błąd: "Error: ENOENT: no such file or directory, open 'dist/app.js'"
```bash
# Brak skompilowanego kodu - przekompiluj
cd /home/srv52568/pdfapp
npm run build
pm2 restart wine-management
```

#### D) Błąd kompilacji TypeScript
```bash
# Sprawdź błędy
npx tsc --noEmit

# Jeśli błędy w kodzie - przywróć backup:
tar -xzf backup_before_*.tar.gz
pm2 restart wine-management
```

---

## 🔍 Diagnostyka zaawansowana

### Sprawdź wszystko jednocześnie:
```bash
bash scripts/diagnose-server.sh
```

### Ręczna weryfikacja:

1. **Proces Node.js działa?**
   ```bash
   ps aux | grep node
   ```

2. **Port 3001 jest zajęty?**
   ```bash
   lsof -i :3001
   ```

3. **Pliki dist/ istnieją?**
   ```bash
   ls -la /home/srv52568/pdfapp/dist/
   ```

4. **node_modules zainstalowane?**
   ```bash
   ls /home/srv52568/nodevenv/pdfapp/22/lib/node_modules | wc -l
   ```
   *(Powinno pokazać ~200+ modułów)*
   
   **Uwaga:** Środowisko Node.js jest w virtualenv:
   - Aplikacja: `/home/srv52568/pdfapp`
   - Node modules: `/home/srv52568/nodevenv/pdfapp/22/lib`
   - Public URL: `/home/srv52568/domains/ratunek.it/public_html/`

---

## 📞 Kontakt

Jeśli problem nie został rozwiązany:
1. Uruchom: `bash scripts/diagnose-server.sh`
2. Skopiuj wynik
3. Sprawdź logi: `pm2 logs wine-management --lines 100`
4. Wyślij diagnostykę

---

## ⚡ Awaryjny restart (ostateczność)

```bash
# 1. Zabij wszystkie procesy Node
pm2 delete all

# 2. Usuń cache PM2
pm2 flush
pm2 save --force

# 3. Uruchom od nowa
cd /home/srv52568/pdfapp
pm2 start ecosystem.config.json
pm2 save

# 4. Sprawdź
pm2 status
curl http://localhost:3001/api/wines?limit=1
```

---

**Data:** 22.11.2025  
**Problem:** Błąd 503 na https://ratunek.it  
**Rozwiązanie:** Restart PM2 + sprawdzenie node_modules
