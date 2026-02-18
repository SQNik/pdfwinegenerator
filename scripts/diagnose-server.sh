#!/bin/bash
# Skrypt diagnostyczny dla serwera ratunek.it
# Uruchom na serwerze: bash diagnose-server.sh

echo "🔍 Wine Management Server - Diagnostyka"
echo "========================================"
echo ""

# Kolory
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Sprawdź PM2
echo "📊 Status PM2:"
if command -v pm2 &> /dev/null; then
    pm2 status
    echo ""
else
    echo -e "${RED}❌ PM2 nie jest zainstalowane${NC}"
    echo ""
fi

# 2. Sprawdź procesy Node.js
echo "🔄 Procesy Node.js:"
ps aux | grep node | grep -v grep
echo ""

# 3. Sprawdź port 3001
echo "🔌 Port 3001:"
if lsof -i :3001 &> /dev/null; then
    echo -e "${GREEN}✅ Port 3001 jest używany${NC}"
    lsof -i :3001
else
    echo -e "${RED}❌ Port 3001 jest wolny (serwer nie działa)${NC}"
fi
echo ""

# 4. Sprawdź ostatnie logi PM2
echo "📋 Ostatnie logi PM2 (ostatnie 20 linii):"
if pm2 logs wine-management --lines 20 --nostream &> /dev/null; then
    pm2 logs wine-management --lines 20 --nostream
else
    echo -e "${YELLOW}⚠️ Brak logów PM2${NC}"
fi
echo ""

# 5. Sprawdź strukturę katalogów
echo "📁 Struktura katalogów:"
if [ -d "/home/srv52568/pdfapp" ]; then
    echo "Katalog główny: OK"
    
    if [ -d "/home/srv52568/pdfapp/dist" ]; then
        echo -e "${GREEN}✅ dist/ istnieje${NC}"
        echo "   Pliki w dist/:"
        ls -lh /home/srv52568/pdfapp/dist/ | head -10
    else
        echo -e "${RED}❌ dist/ nie istnieje${NC}"
    fi
    
    if [ -f "/home/srv52568/pdfapp/package.json" ]; then
        echo -e "${GREEN}✅ package.json istnieje${NC}"
    else
        echo -e "${RED}❌ package.json nie istnieje${NC}"
    fi
    
    if [ -f "/home/srv52568/pdfapp/ecosystem.config.json" ]; then
        echo -e "${GREEN}✅ ecosystem.config.json istnieje${NC}"
    else
        echo -e "${RED}❌ ecosystem.config.json nie istnieje${NC}"
    fi
else
    echo -e "${RED}❌ Katalog /home/srv52568/pdfapp nie istnieje${NC}"
fi
echo ""

# 6. Sprawdź node_modules (w virtualenv)
echo "📦 Node modules (virtualenv):"
if [ -d "/home/srv52568/nodevenv/pdfapp/22/lib/node_modules" ]; then
    MODULE_COUNT=$(ls /home/srv52568/nodevenv/pdfapp/22/lib/node_modules | wc -l)
    echo -e "${GREEN}✅ node_modules istnieje ($MODULE_COUNT modułów)${NC}"
    echo "   Lokalizacja: /home/srv52568/nodevenv/pdfapp/22/lib/node_modules"
else
    echo -e "${RED}❌ node_modules nie istnieje - uruchom: cd /home/srv52568/pdfapp && npm install${NC}"
fi
echo ""

# 7. Sprawdź wersję Node.js
echo "🟢 Wersja Node.js:"
node --version
echo ""

# 8. Sprawdź wersję npm
echo "📦 Wersja npm:"
npm --version
echo ""

# 9. Test endpointu lokalnie
echo "🧪 Test endpointu lokalnie:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/wines?limit=1 | grep -q "200"; then
    echo -e "${GREEN}✅ Endpoint /api/wines działa (200)${NC}"
else
    CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/wines?limit=1)
    echo -e "${RED}❌ Endpoint /api/wines nie działa (kod: $CODE)${NC}"
fi
echo ""

# 10. Podsumowanie
echo "========================================"
echo "💡 Zalecane kroki:"
echo ""

if ! pm2 list | grep -q "wine-management"; then
    echo "1. Serwer nie jest zarządzany przez PM2"
    echo "   Uruchom: pm2 start ecosystem.config.json"
    echo ""
fi

if [ ! -d "/home/srv52568/nodevenv/pdfapp/22/lib/node_modules" ]; then
    echo "2. Brak node_modules w virtualenv"
    echo "   Uruchom: cd /home/srv52568/pdfapp && npm install --production"
    echo ""
fi

if [ ! -d "/home/srv52568/pdfapp/dist" ]; then
    echo "3. Brak skompilowanego kodu"
    echo "   Uruchom: cd /home/srv52568/pdfapp && npm run build"
    echo ""
fi

echo "Aby zobaczyć szczegółowe logi:"
echo "  pm2 logs wine-management --lines 100"
echo ""
