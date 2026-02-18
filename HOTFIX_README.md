# 🔥 HOTFIX - Content Security Policy

## Problem który rozwiązuje ta paczka

Jeśli widzisz ten błąd w konsoli przeglądarki na stronie głównej:

```
navigation-loader.js:48 Executing inline script violates the following 
Content Security Policy directive 'script-src 'self' ...
```

**Ta paczka naprawia ten problem!** ✅

---

## 🚀 Jak zaktualizować

### Opcja 1: Szybka aktualizacja (5 minut)

1. **Backup danych**:
   ```bash
   pm2 stop pdfwine-generator
   tar -czf backup_$(date +%Y%m%d).tar.gz data/ public/uploads/
   ```

2. **Zastąp 3 pliki**:
   ```bash
   # Skopiuj nowe pliki z paczki:
   cp -r nowa_paczka/public/js/components/navigation.js public/js/components/
   cp -r nowa_paczka/public/js/navigation-loader.js public/js/
   cp -r nowa_paczka/public/components/navigation.html public/components/
   ```

3. **Rebuild i restart**:
   ```bash
   npm run build
   pm2 restart pdfwine-generator
   ```

4. **Sprawdź** - otwórz aplikację, naciśnij F12, odśwież (F5) - **nie powinno być błędów CSP!**

### Opcja 2: Pełna instrukcja

Szczegółowe kroki znajdziesz w pliku: **`INSTRUKCJA_AKTUALIZACJI.md`**

---

## ✅ Jak sprawdzić czy działa

1. Otwórz aplikację w przeglądarce
2. Naciśnij **F12** (DevTools)
3. Zakładka **Console**
4. Odśwież stronę (**F5**)
5. Sprawdź:
   - ✅ Brak błędów CSP
   - ✅ Widzisz: `✅ Navigation Loader: Navigation script loaded`
   - ✅ Nawigacja działa

---

## 📁 Zawartość paczki

```
pdfwinegenerator_production_20251125_093222/
├── src/                              # Kod źródłowy
├── public/
│   ├── js/
│   │   ├── navigation-loader.js     # ✨ ZMIENIONY
│   │   └── components/
│   │       └── navigation.js        # ✨ NOWY PLIK
│   └── components/
│       └── navigation.html          # ✨ ZMIENIONY
├── data/                             # Twoje dane (zachowaj!)
├── README_PRODUKCJA.md              # Ten plik
├── INSTRUKCJA_AKTUALIZACJI.md       # Szczegóły aktualizacji
└── CHANGELOG.md                     # Historia zmian
```

---

## 🔍 Co się zmieniło

**Problem**: Inline skrypty w `navigation.html` były blokowane przez Content Security Policy w trybie produkcyjnym.

**Rozwiązanie**:
1. Przeniesiono kod JavaScript z `navigation.html` do nowego pliku `navigation.js`
2. Zaktualizowano `navigation-loader.js` aby ładował zewnętrzny skrypt
3. Usunięto tag `<script>` z `navigation.html`

**Rezultat**: Pełna zgodność z CSP, brak błędów, nawigacja działa! 🎉

---

## ⚠️ WAŻNE

- **Zachowaj katalogi**: `data/` i `public/uploads/` (nie nadpisuj!)
- **Zrób backup** przed aktualizacją
- **Sprawdź logi** po restarcie: `pm2 logs pdfwine-generator`

---

## 📞 Potrzebujesz pomocy?

Zobacz pliki:
- `INSTRUKCJA_AKTUALIZACJI.md` - szczegółowe kroki
- `CHANGELOG.md` - pełna lista zmian

---

**Wersja**: 20251125_093222  
**Data**: 25 listopada 2025, 09:32  
**Typ**: Hotfix - Krytyczna poprawka CSP  
**Rozmiar**: 242.84 MB
