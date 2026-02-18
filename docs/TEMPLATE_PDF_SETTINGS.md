# Jak ustawić rozmiar papieru i marginesy w szablonie HTML

## Przegląd

Od tej wersji systemu, **format papieru i marginesy są definiowane bezpośrednio w szablonie HTML**, a nie wybierane podczas generowania PDF. Dzięki temu każdy szablon ma przypisane optymalne ustawienia dla swojego układu.

## Lokalizacja ustawień

Ustawienia PDF są przechowywane w polu `pdfSettings` szablonu HTML. Możesz je edytować w edytorze szablonów lub bezpośrednio w pliku `data/html-templates.json`.

## Struktura ustawień PDF

```json
{
  "id": "template-id",
  "name": "Nazwa szablonu",
  "htmlContent": "...",
  "pdfSettings": {
    "format": "A4",
    "margins": {
      "top": "10mm",
      "right": "10mm",
      "bottom": "10mm",
      "left": "10mm"
    },
    "orientation": "portrait",
    "printBackground": true
  }
}
```

## Dostępne opcje

### 1. Format strony (`format`)

#### Standardowe formaty:
- `"A4"` - 210×297 mm (najpopularniejszy)
- `"A5"` - 148×210 mm
- `"A6"` - 105×148 mm
- `"Letter"` - 216×279 mm (US)
- `"Legal"` - 216×356 mm (US)

#### Niestandardowy format:
Możesz również użyć ID niestandardowego formatu utworzonego w module Custom Formats:
```json
{
  "format": "custom:72af14a2-3716-49f3-8369-b059d4793e60"
}
```

Lub zdefiniować niestandardowy format bezpośrednio w szablonie:
```json
{
  "pdfSettings": {
    "customFormat": {
      "width": 105,
      "height": 301,
      "unit": "mm",
      "orientation": "portrait"
    }
  }
}
```

### 2. Marginesy (`margins`)

Marginesy mogą być zdefiniowane w różnych jednostkach:
- `mm` - milimetry (zalecane)
- `in` - cale
- `px` - piksele

```json
{
  "margins": {
    "top": "10mm",
    "right": "5mm",
    "bottom": "10mm",
    "left": "5mm"
  }
}
```

**Marginesy zerowe** (dla pełnego wydruku):
```json
{
  "margins": {
    "top": "0mm",
    "right": "0mm",
    "bottom": "0mm",
    "left": "0mm"
  }
}
```

### 3. Orientacja (`orientation`)

- `"portrait"` - pionowa (domyślna)
- `"landscape"` - pozioma

### 4. Drukowanie tła (`printBackground`)

- `true` - drukuje kolory tła i obrazy tła (zalecane dla materiałów marketingowych)
- `false` - pomija tła (zalecane dla dokumentów tekstowych)

## Przykłady użycia

### Przykład 1: Standardowy katalog A4
```json
{
  "id": "catalog-template",
  "name": "Katalog win A4",
  "pdfSettings": {
    "format": "A4",
    "margins": {
      "top": "15mm",
      "right": "10mm",
      "bottom": "15mm",
      "left": "10mm"
    },
    "orientation": "portrait",
    "printBackground": true
  }
}
```

### Przykład 2: Ulotka składana (format niestandardowy)
```json
{
  "id": "leaflet-template",
  "name": "Ulotka składana w V",
  "pdfSettings": {
    "customFormat": {
      "width": 210,
      "height": 297,
      "unit": "mm",
      "orientation": "landscape"
    },
    "margins": {
      "top": "3mm",
      "right": "3mm",
      "bottom": "3mm",
      "left": "3mm"
    },
    "printBackground": true
  }
}
```

### Przykład 3: Etykieta bez marginesów
```json
{
  "id": "label-template",
  "name": "Etykieta na butelkę",
  "pdfSettings": {
    "customFormat": {
      "width": 90,
      "height": 120,
      "unit": "mm",
      "orientation": "portrait"
    },
    "margins": {
      "top": "0mm",
      "right": "0mm",
      "bottom": "0mm",
      "left": "0mm"
    },
    "printBackground": true
  }
}
```

### Przykład 4: Dokument US Letter
```json
{
  "id": "us-catalog",
  "name": "Katalog US Letter",
  "pdfSettings": {
    "format": "Letter",
    "margins": {
      "top": "1in",
      "right": "0.75in",
      "bottom": "1in",
      "left": "0.75in"
    },
    "orientation": "portrait",
    "printBackground": false
  }
}
```

## Jak edytować ustawienia?

### Metoda 1: Przez edytor szablonów (zalecane)

1. Przejdź do **Edytor szablonów** (`/template-editor.html`)
2. Wybierz szablon z listy
3. W sekcji **Ustawienia PDF** wypełnij pola:
   - Format strony
   - Marginesy (góra, prawo, dół, lewo)
   - Orientacja
   - Drukowanie tła
4. Kliknij **Zapisz szablon**

### Metoda 2: Bezpośrednio w pliku JSON

1. Otwórz plik `data/html-templates.json`
2. Znajdź szablon po `id` lub `name`
3. Dodaj lub edytuj sekcję `pdfSettings`
4. Zapisz plik
5. Odśwież stronę w przeglądarce

## Domyślne ustawienia

Jeśli szablon **nie ma** zdefiniowanych `pdfSettings`, system użyje domyślnych wartości:
```json
{
  "format": "A4",
  "margins": {
    "top": "10mm",
    "right": "10mm",
    "bottom": "10mm",
    "left": "10mm"
  },
  "orientation": "portrait",
  "printBackground": true
}
```

## Najlepsze praktyki

1. **Zawsze testuj szablon** po zmianie ustawień PDF
2. **Używaj mm jako jednostki** dla marginesów (bardziej precyzyjne niż piksele)
3. **Dla materiałów drukowanych** ustaw `printBackground: true`
4. **Dla dokumentów tekstowych** ustaw `printBackground: false` (mniej atramentu)
5. **Dostosuj marginesy do spadów** - dla profesjonalnych drukarni zostaw 3-5mm na spady
6. **Pamiętaj o orientacji** - upewnij się, że HTML jest zaprojektowany dla wybranej orientacji

## Rozwiązywanie problemów

### Problem: PDF ma niewłaściwy rozmiar
**Rozwiązanie**: Sprawdź, czy `format` lub `customFormat` jest poprawnie zdefiniowany w `pdfSettings`.

### Problem: Treść jest obcięta
**Rozwiązanie**: Zwiększ marginesy lub zmniejsz zawartość w HTML/CSS.

### Problem: Tło nie jest drukowane
**Rozwiązanie**: Ustaw `printBackground: true` w `pdfSettings`.

### Problem: Szablon używa starego formatu
**Rozwiązanie**: Usuń cache przeglądarki (Ctrl+Shift+R) i wygeneruj PDF ponownie.

## Integracja z Custom Formats

Możesz tworzyć niestandardowe formaty w module **Custom Formats** i używać ich w szablonach:

1. Przejdź do **Custom Formats** (`/custom-formats.html`)
2. Utwórz nowy format z nazwą, rozmiarem i marginesami
3. Skopiuj ID formatu
4. W szablonie ustaw: `"format": "custom:{ID}"`

## Migracja starych szablonów

Jeśli masz stare szablony bez `pdfSettings`, możesz je zaktualizować masowo:

1. Otwórz `data/html-templates.json`
2. Dla każdego szablonu dodaj:
```json
"pdfSettings": {
  "format": "A4",
  "margins": {
    "top": "10mm",
    "right": "10mm",
    "bottom": "10mm",
    "left": "10mm"
  },
  "orientation": "portrait",
  "printBackground": true
}
```
3. Zapisz i zrestartuj serwer

---

**Data aktualizacji:** 2025-11-20
**Wersja systemu:** 2.0.0
