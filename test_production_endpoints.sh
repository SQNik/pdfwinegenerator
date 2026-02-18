#!/bin/bash
# Test endpointów po wdrożeniu na ratunek.it

echo "🧪 Testing Wine Management API Endpoints..."
echo "==========================================="
echo ""

# Kolory
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funkcja testująca endpoint
test_endpoint() {
    local url=$1
    local name=$2
    
    echo -n "Testing $name... "
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$response" -eq 200 ]; then
        echo -e "${GREEN}✅ OK (200)${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED ($response)${NC}"
        return 1
    fi
}

# Lista endpointów do przetestowania
BASE_URL="https://ratunek.it"

echo "📡 Backend API Tests:"
test_endpoint "$BASE_URL/api/wines?limit=1" "Wines API"
test_endpoint "$BASE_URL/api/collections" "Collections API"
test_endpoint "$BASE_URL/theme-settings" "Theme Settings (new)"
test_endpoint "$BASE_URL/api/theme-settings" "Theme Settings API (legacy)"
test_endpoint "$BASE_URL/api/settings/appearance" "Appearance Settings"
test_endpoint "$BASE_URL/api/settings/security" "Security Settings"
test_endpoint "$BASE_URL/api/settings/users" "Users Settings"
test_endpoint "$BASE_URL/api/settings/system" "System Settings"

echo ""
echo "📄 Frontend Tests:"
test_endpoint "$BASE_URL/" "Dashboard"
test_endpoint "$BASE_URL/wines.html" "Wines Manager"
test_endpoint "$BASE_URL/collections.html" "Collections Manager"
test_endpoint "$BASE_URL/template-editor.html" "Template Editor"
test_endpoint "$BASE_URL/settings/index.html" "Settings Panel"

echo ""
echo "==========================================="
echo "✅ All tests completed!"
