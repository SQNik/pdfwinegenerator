# 🧪 CHECKLIST TESTÓW PO CZYSZCZENIU

**Data:** 2025-01-XX  
**Wersja:** 2.1.0  
**Status Serwera:** ✅ Uruchomiony na http://localhost:3001

---

## 📋 TESTY DO WYKONANIA

### 1. ✅ Test Dashboard (`index.html`)
**URL:** http://localhost:3001/index.html

- [ ] **Załadowanie strony**
  - [ ] Strona ładuje się bez błędów 404
  - [ ] Brak błędów w konsoli przeglądarki (F12)
  - [ ] Nawigacja wyświetla się poprawnie
  - [ ] Branding i logo widoczne

- [ ] **Import CSV**
  - [ ] Modal importu CSV otwiera się
  - [ ] Wybór pliku CSV działa
  - [ ] Pre-import field validation działa (sprawdza kolumny)
  - [ ] Import poprawnych danych działa
  - [ ] Błędy walidacji wyświetlają się poprawnie

- [ ] **Import Google Sheets**
  - [ ] Modal Google Sheets otwiera się
  - [ ] Wklejenie linku działa
  - [ ] Pre-import validation działa
  - [ ] Import danych działa

- [ ] **Lista Kolekcji**
  - [ ] Kolekcje wyświetlają się na dashboardzie
  - [ ] Kliknięcie w kolekcję przekierowuje do collections.html
  - [ ] Liczba win w kolekcji wyświetla się poprawnie

---

### 2. 🍷 Test Zarządzania Winami (`wines.html`)
**URL:** http://localhost:3001/wines.html

- [ ] **Załadowanie strony**
  - [ ] Strona ładuje się bez błędów 404
  - [ ] Komponenty ładują się: `wines.js`, `wine-fields.js`
  - [ ] Brak błędów w konsoli
  - [ ] Tabela win wyświetla się

- [ ] **CRUD Operations**
  - [ ] **CREATE**: Dodanie nowego wina
    - [ ] Modal "Dodaj Wino" otwiera się
    - [ ] Wszystkie pola formularza są widoczne (dynamiczne pola)
    - [ ] Walidacja działa (wymagane pola)
    - [ ] Zapis wina działa
    - [ ] Wino pojawia się w tabeli
  
  - [ ] **READ**: Wyświetlanie win
    - [ ] Tabela win wyświetla wszystkie wina
    - [ ] Paginacja działa
    - [ ] Wyszukiwanie działa (real-time search)
    - [ ] Filtry działają (kategoria, typ, region)
  
  - [ ] **UPDATE**: Edycja wina
    - [ ] Kliknięcie "Edytuj" otwiera modal
    - [ ] Formularz wypełnia się danymi wina
    - [ ] Case-insensitive matching działa (kategorie)
    - [ ] Zapis zmian działa
    - [ ] Zmiany widoczne w tabeli
  
  - [ ] **DELETE**: Usuwanie wina
    - [ ] Potwierdzenie usunięcia wyświetla się
    - [ ] Usunięcie działa
    - [ ] Wino znika z tabeli

- [ ] **Zarządzanie Polami Win** (🔥 FLAGSHIP)
  - [ ] Sekcja "Zarządzanie Polami Win" jest widoczna
  - [ ] Lista pól wyświetla się (12 pól domyślnych)
  - [ ] **Dodanie pola:**
    - [ ] Modal dodawania pola otwiera się
    - [ ] Można wybrać typ pola (text, select, number, etc.)
    - [ ] Zapis pola działa
    - [ ] Pole pojawia się w formularzu dodawania wina
  - [ ] **Edycja pola:**
    - [ ] Modal edycji otwiera się z danymi pola
    - [ ] Zapis zmian działa
  - [ ] **Usunięcie pola:**
    - [ ] Potwierdzenie usunięcia
    - [ ] Pole znika z formularza

---

### 3. 📋 Test Kolekcji (`collections.html`)
**URL:** http://localhost:3001/collections.html

- [ ] **Załadowanie strony**
  - [ ] Strona ładuje się bez błędów 404
  - [ ] Komponenty ładują się: `collections.js`, `CollectionFieldsManager.js`
  - [ ] Brak błędów w konsoli
  - [ ] Lista kolekcji wyświetla się

- [ ] **CRUD Kolekcji**
  - [ ] **CREATE**: Tworzenie kolekcji
    - [ ] Modal "Nowa Kolekcja" otwiera się
    - [ ] Formularz z dynamicznymi polami kolekcji
    - [ ] Wybór win do kolekcji działa (catalogNumber)
    - [ ] Zapis kolekcji działa
  
  - [ ] **READ**: Wyświetlanie kolekcji
    - [ ] Lista kolekcji wyświetla się
    - [ ] Liczba win w kolekcji jest poprawna
    - [ ] Kliknięcie pokazuje szczegóły kolekcji
  
  - [ ] **UPDATE**: Edycja kolekcji
    - [ ] Modal edycji otwiera się
    - [ ] Dane kolekcji są załadowane
    - [ ] Można dodać/usunąć wina
    - [ ] Zapis zmian działa
  
  - [ ] **DELETE**: Usuwanie kolekcji
    - [ ] Potwierdzenie usunięcia
    - [ ] Usunięcie działa

- [ ] **Generowanie PDF z Kolekcji** (🔥 KRYTYCZNE)
  - [ ] **Preview PDF:**
    - [ ] Modal "Podgląd PDF" otwiera się
    - [ ] Wybór formatu PDF widoczny (A4, A5, Letter, Custom)
    - [ ] Custom formaty widoczne na liście (np. "A4-moj")
    - [ ] Wybór custom formatu (0mm margins) działa
    - [ ] Podgląd PDF generuje się
    - [ ] PDF preview otwiera się w nowej karcie
    - [ ] **⚠️ SPRAWDŹ MARGINESY**: PDF ma 0mm margins (nie 10mm!)
  
  - [ ] **Generate PDF:**
    - [ ] Modal "Generuj PDF" otwiera się
    - [ ] Wybór custom formatu działa
    - [ ] Generowanie PDF działa
    - [ ] PDF pobiera się na dysk
    - [ ] **⚠️ SPRAWDŹ MARGINESY**: Pobrany PDF ma 0mm margins

- [ ] **Zarządzanie Polami Kolekcji** (🔥 FLAGSHIP)
  - [ ] Sekcja "Zarządzanie Polami Kolekcji" jest widoczna
  - [ ] Lista pól kolekcji wyświetla się
  - [ ] **Dodanie pola kolekcji:**
    - [ ] Modal dodawania otwiera się
    - [ ] Można wybrać typ pola (text, select, number, date, etc.)
    - [ ] Opcje walidacji (min/max, pattern)
    - [ ] Zapis pola działa
    - [ ] Pole pojawia się w formularzu tworzenia kolekcji
  - [ ] **Edycja pola kolekcji:**
    - [ ] Modal edycji otwiera się
    - [ ] Zapis zmian działa
  - [ ] **Usunięcie pola kolekcji:**
    - [ ] Potwierdzenie usunięcia
    - [ ] Pole znika z formularza

---

### 4. 🎨 Test Edytora Szablonów (`template-editor.html`)
**URL:** http://localhost:3001/template-editor.html

- [ ] **Załadowanie strony**
  - [ ] Strona ładuje się bez błędów 404
  - [ ] Komponenty ładują się: `TemplateEditor.js`, `CustomFormatsManager.js`
  - [ ] CodeMirror (editor kodu) ładuje się poprawnie
  - [ ] Brak błędów w konsoli

- [ ] **Template Editor**
  - [ ] Lista szablonów wyświetla się
  - [ ] **Edycja szablonu:**
    - [ ] Kliknięcie szablonu ładuje jego HTML/CSS/JS
    - [ ] CodeMirror wyświetla kod z syntax highlighting
    - [ ] Można edytować kod (HTML, CSS, JS)
    - [ ] Live preview działa (F5 odświeża podgląd)
  
  - [ ] **Preview Options:**
    - [ ] Wybór formatu PDF widoczny
    - [ ] Standard formaty: A4, A5, Letter
    - [ ] Custom formaty widoczne (np. "A4-moj")
    - [ ] Zmiana formatu aktualizuje podgląd
  
  - [ ] **Zapis szablonu:**
    - [ ] Przycisk "Zapisz" działa
    - [ ] Zmiany są zapisane
    - [ ] Reload strony pokazuje zapisane zmiany

- [ ] **Custom Formats Manager** (🔥 FLAGSHIP)
  - [ ] Sekcja "Custom Formats" jest widoczna
  - [ ] Lista custom formatów wyświetla się (np. A4-moj)
  - [ ] **Dodanie formatu:**
    - [ ] Modal "Nowy Format" otwiera się
    - [ ] Można ustawić wymiary (width, height, unit)
    - [ ] Można ustawić marginesy (top, right, bottom, left)
    - [ ] Można wybrać orientację (portrait/landscape)
    - [ ] Zapis formatu działa
    - [ ] Format pojawia się w preview options
  
  - [ ] **Edycja formatu:**
    - [ ] Modal edycji otwiera się z danymi formatu
    - [ ] Zapis zmian działa
    - [ ] Zmiany widoczne w preview options
  
  - [ ] **Usunięcie formatu:**
    - [ ] Potwierdzenie usunięcia
    - [ ] Usunięcie działa
    - [ ] Format znika z preview options

- [ ] **Podgląd z Custom Format (0mm margins)** (🔥 KRYTYCZNE)
  - [ ] Wybierz custom format "A4-moj" (0/0/0/0mm margins)
  - [ ] Kliknij "Refresh Preview" (F5)
  - [ ] **⚠️ SPRAWDŹ**: Preview pokazuje szablon bez marginesów
  - [ ] Tekst/elementy dochodzą do krawędzi strony

---

### 5. 🔍 Sprawdzenie Konsoli Przeglądarki (KRYTYCZNE)

**Otwórz DevTools (F12) na każdej stronie:**

- [ ] **Brak błędów 404** (missing files)
  - [ ] Żadne pliki JS nie zwracają 404
  - [ ] Żadne pliki CSS nie zwracają 404
  - [ ] Wszystkie komponenty ładują się poprawnie

- [ ] **Brak błędów JavaScript**
  - [ ] Brak "Cannot read property of undefined"
  - [ ] Brak "module not found"
  - [ ] Brak "unexpected token"

- [ ] **Network Tab**
  - [ ] Wszystkie requesty 200 OK
  - [ ] API endpoints działają (/api/wines, /api/collections, etc.)
  - [ ] Static files ładują się (JS, CSS, images)

- [ ] **Console Tab**
  - [ ] Brak czerwonych błędów
  - [ ] Tylko info/debug logi (jeśli są)

---

### 6. 🗂️ Weryfikacja Struktury Plików

- [ ] **Główne strony (5 plików):**
  - [ ] `public/index.html` ✅
  - [ ] `public/wines.html` ✅
  - [ ] `public/collections.html` ✅
  - [ ] `public/template-editor.html` ✅
  - [ ] `public/success.html` ✅

- [ ] **Komponenty JS (6 plików):**
  - [ ] `public/js/components/wines.js` ✅
  - [ ] `public/js/components/collections.js` ✅
  - [ ] `public/js/components/CollectionFieldsManager.js` ✅
  - [ ] `public/js/components/import.js` ✅
  - [ ] `public/js/components/TemplateEditor.js` ✅
  - [ ] `public/js/components/CustomFormatsManager.js` ✅

- [ ] **Konfiguracje (2 pliki):**
  - [ ] `public/js/config/wine-fields.js` ✅
  - [ ] `public/js/config/collection-fields.js` ✅

- [ ] **Rdzenne pliki (3 pliki):**
  - [ ] `public/js/api.js` ✅
  - [ ] `public/js/utils.js` ✅
  - [ ] `public/js/branding.js` ✅

- [ ] **Folder _deprecated:**
  - [ ] `public/_deprecated/tests/` - 13 plików test-*.html ✅
  - [ ] `public/_deprecated/debug/` - 5+ plików debug ✅
  - [ ] `public/_deprecated/old-tools/` - pdf-editor.html, pdf-templates.html ✅
  - [ ] `public/_deprecated/misc/` - 8+ plików (backup, demo) ✅
  - [ ] `public/_deprecated/js/` - 8 nieużywanych komponentów ✅

---

## 🎯 KRYTYCZNE TESTY BUGÓW

### Bug #1: Custom Format Margins w Collections (FIXED ✅)
**Problem:** Collections PDF używało 10mm margins zamiast 0mm dla custom formatu "A4-moj"

**Test:**
1. Otwórz http://localhost:3001/collections.html
2. Wybierz kolekcję
3. Kliknij "Preview PDF"
4. Wybierz custom format "A4-moj" (0/0/0/0mm)
5. Kliknij "Generuj Podgląd"
6. **⚠️ SPRAWDŹ**: PDF ma marginesy 0mm (nie 10mm!)
7. Tekst/elementy dochodzą do krawędzi strony

**Expected:** ✅ PDF z 0mm margins  
**Previously:** ❌ PDF z 10mm margins  
**Fix:** `collections.js` line ~661 + `templateEditorController.ts` line ~656, ~784

---

### Bug #2: Modal Backdrop Cleanup (FIXED ✅)
**Problem:** Bootstrap modal backdrop pozostawał po zamknięciu modalów

**Test:**
1. Otwórz dowolną stronę z modalami (wines.html, collections.html)
2. Otwórz i zamknij modal kilka razy
3. **⚠️ SPRAWDŹ**: Brak ciemnych overlayów
4. Strona jest klikalną (nie zablokowana)

**Expected:** ✅ Brak backdrop po zamknięciu modalu  
**Previously:** ❌ Ciemny overlay blokował stronę  

---

### Bug #3: Case-Insensitive Select Fields (FIXED ✅)
**Problem:** Edycja wina nie wypełniała pól select jeśli wielkość liter była inna

**Test:**
1. Otwórz http://localhost:3001/wines.html
2. Dodaj wino z kategorią "Czerwone"
3. Edytuj to wino
4. **⚠️ SPRAWDŹ**: Pole "Kategoria" ma zaznaczone "Czerwone"
5. Zapisz wino
6. Edytuj ponownie
7. **⚠️ SPRAWDŹ**: Pole nadal ma zaznaczone "Czerwone"

**Expected:** ✅ Case-insensitive matching w formularzu  
**Previously:** ❌ Puste pole select po edycji  
**Fix:** `wineController.ts` normalizacja + `wines.js` case-insensitive matching

---

## 📊 WYNIKI TESTÓW

### Podsumowanie:
- **Testy wykonane:** __ / 100+
- **Testy passed:** __ / __
- **Testy failed:** __ / __
- **Błędy krytyczne:** __
- **Błędy minor:** __

### Status:
- [ ] ✅ Wszystkie testy przeszły - system gotowy do produkcji
- [ ] ⚠️ Minor issues - do poprawy
- [ ] ❌ Critical issues - wymagają natychmiastowej naprawy

---

## 📝 Znalezione Problemy (jeśli są)

### Problem #1:
**Opis:**  
**Severity:** 🔴 Critical / 🟡 Medium / 🟢 Low  
**Reprodukcja:**  
**Expected:**  
**Actual:**  

### Problem #2:
...

---

## ✅ AKCJE PO TESTACH

Po pozytywnym przejściu wszystkich testów:

1. **Zaktualizuj wersję:**
   - [ ] `package.json`: version "2.1.0"
   - [ ] `README.md`: badge Version-2.1.0

2. **Usuń stare backupy (po 2 tygodniach):**
   ```bash
   Remove-Item "public\_deprecated" -Recurse -Force
   Remove-Item "public\backup-old-files" -Recurse -Force
   ```

3. **Git commit:**
   ```bash
   git add .
   git commit -m "v2.1.0: Cleanup - removed deprecated files, production ready"
   git tag v2.1.0
   ```

4. **Dokumentacja:**
   - [ ] Zaktualizuj CHANGELOG.md
   - [ ] Archiwizuj dokumenty migracji (MIGRATION-*, CLEANUP-*)

---

**Tester:** ___________  
**Data:** ___________  
**Status:** ⏳ W trakcie / ✅ Zakończone
