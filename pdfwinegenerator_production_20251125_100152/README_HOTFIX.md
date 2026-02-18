# Paczka Produkcyjna - 25.11.2025 10:01

## Zawartość Paczki
Paczka zawiera **dwie krytyczne poprawki**:

### 1. Poprawka CSP (Content Security Policy)
**Problem**: Błąd naruszenia CSP na produkcji - inline scripts blokowane przez Helmet.js

**Rozwiązanie**:
- Utworzono zewnętrzny plik `public/js/components/navigation.js`
- Zaktualizowano `public/js/navigation-loader.js` do ładowania zewnętrznego skryptu
- Usunięto inline script z `public/components/navigation.html`

### 2. Usunięcie Kroku 3 z Kreotora Kolekcji
**Problem**: Krok 3 "Okładka" niepotrzebnie komplikuje proces tworzenia kolekcji

**Rozwiązanie**:
- Zmieniono `totalSteps` z 4 na 3 w `public/js/components/collections-init.js`
- Usunięto wskaźnik kroku 3 "Okładka" z `public/collections.html`
- Usunięto formularz wyboru okładki (Step 3: Cover Image Selection)
- Przemianowano krok 4 "Wybór Win" na krok 3

## Pliki Zmodyfikowane

### CSP Fix:
1. `public/js/components/navigation.js` - **NOWY PLIK**
2. `public/js/navigation-loader.js` - zmodyfikowany (linie 20-65)
3. `public/components/navigation.html` - usunięto inline script

### Usunięcie Kroku 3:
1. `public/js/components/collections-init.js` - `totalSteps = 3`
2. `public/collections.html` - usunięto krok 3, przemianowano krok 4 → 3

## Instrukcja Wdrożenia

### Krok 1: Backup
```bash
# Na serwerze produkcyjnym
cp -r /var/www/pdfwinegenerator /var/www/pdfwinegenerator_backup_$(date +%Y%m%d_%H%M%S)
```

### Krok 2: Zatrzymaj PM2
```bash
pm2 stop pdfwinegenerator
```

### Krok 3: Upload Paczki
Skopiuj całą zawartość paczki `pdfwinegenerator_production_20251125_100152` na serwer produkcyjny do `/var/www/pdfwinegenerator`

### Krok 4: Weryfikacja Plików
```bash
# Sprawdź czy nowy plik navigation.js istnieje
ls -la /var/www/pdfwinegenerator/public/js/components/navigation.js

# Sprawdź czy collections.html ma 3 kroki (nie 4)
grep -c "data-step=\"4\"" /var/www/pdfwinegenerator/public/collections.html
# Powinno zwrócić 0
```

### Krok 5: Restart PM2
```bash
pm2 restart pdfwinegenerator
pm2 logs pdfwinegenerator --lines 50
```

### Krok 6: Test Funkcjonalności
1. Otwórz http://twój-serwer.pl w przeglądarce
2. Sprawdź konsolę deweloperską - nie powinno być błędów CSP
3. Przejdź do "Kolekcje" → "Dodaj Kolekcję"
4. Zweryfikuj że są tylko 3 kroki: Podstawowe → Dodatkowe → Wybór Win

## Rollback (Jeśli Coś Pójdzie Nie Tak)
```bash
pm2 stop pdfwinegenerator
rm -rf /var/www/pdfwinegenerator
mv /var/www/pdfwinegenerator_backup_TIMESTAMP /var/www/pdfwinegenerator
pm2 restart pdfwinegenerator
```

## Logi i Monitorowanie
```bash
# Sprawdź logi PM2
pm2 logs pdfwinegenerator --lines 100

# Sprawdź logi aplikacji
tail -f /var/www/pdfwinegenerator/logs/combined.log

# Sprawdź status PM2
pm2 status
```

## Oczekiwane Rezultaty
✅ Brak błędów CSP w konsoli przeglądarki  
✅ Nawigacja działa poprawnie  
✅ Kreator kolekcji ma tylko 3 kroki  
✅ Wszystkie inne funkcje działają bez zmian  

## Kontakt
W razie problemów skontaktuj się z administratorem systemu.
