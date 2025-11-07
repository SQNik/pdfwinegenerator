# 📋 Grupowanie Win po Kategoriach - Przykład Użycia

## 🎯 Nowa Funkcjonalność

Dodano możliwość automatycznego grupowania win w kolekcji według kategorii (category).

## 🔧 Składnia

```html
{{#each collection.winesByCategory}}
  <!-- Dla każdej kategorii -->
  <div class="category-section">
    <h2>{{category}}</h2>
    <p>Liczba win: {{categoryWineCount}}</p>
    
    <!-- Wina w tej kategorii -->
    {{#each wines}}
      <div class="wine-item">
        <h3>{{wine.name}}</h3>
        <p>{{wine.description}}</p>
        <p>Cena: {{wine.price1}}</p>
      </div>
    {{/each}}
  </div>
{{/each}}
```

## 📝 Pełny Przykład Szablonu

```html
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>{{collection.name}} - Pogrupowane po Kategoriach</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20mm;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #8B0000;
            padding-bottom: 20px;
        }
        
        .header h1 {
            color: #8B0000;
            margin: 0;
        }
        
        .collection-info {
            text-align: center;
            color: #666;
            margin-bottom: 40px;
        }
        
        .category-section {
            margin-bottom: 50px;
            page-break-inside: avoid;
        }
        
        .category-header {
            background: #8B0000;
            color: white;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .category-header h2 {
            margin: 0;
            font-size: 24px;
        }
        
        .category-header .wine-count {
            font-size: 14px;
            opacity: 0.9;
            margin-top: 5px;
        }
        
        .wine-item {
            border-left: 4px solid #8B0000;
            padding-left: 20px;
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .wine-item h3 {
            color: #8B0000;
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        
        .wine-details {
            color: #333;
            line-height: 1.6;
        }
        
        .wine-specs {
            display: flex;
            gap: 20px;
            margin-top: 10px;
            font-size: 14px;
            color: #666;
        }
        
        .wine-price {
            font-size: 18px;
            font-weight: bold;
            color: #8B0000;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <!-- Nagłówek kolekcji -->
    <div class="header">
        <h1>{{collection.name}}</h1>
    </div>
    
    <div class="collection-info">
        <p>{{collection.description}}</p>
        <p><strong>Łączna liczba win:</strong> {{collection.wineCount}}</p>
        <p><strong>Data:</strong> {{date}}</p>
    </div>
    
    <!-- Wina pogrupowane po kategoriach -->
    {{#each collection.winesByCategory}}
      <div class="category-section">
        <div class="category-header">
          <h2>Wina {{category}}</h2>
          <div class="wine-count">Liczba pozycji: {{categoryWineCount}}</div>
        </div>
        
        {{#each wines}}
          <div class="wine-item">
            <h3>{{wine.name}}</h3>
            <div class="wine-details">
              <p>{{wine.description}}</p>
              
              <div class="wine-specs">
                <span><strong>Typ:</strong> {{wine.type}}</span>
                <span><strong>Region:</strong> {{wine.region}}</span>
                <span><strong>Szczepy:</strong> {{wine.szczepy}}</span>
                <span><strong>Pojemność:</strong> {{wine.poj}}</span>
                <span><strong>Alkohol:</strong> {{wine.alcohol}}</span>
              </div>
              
              <div class="wine-price">
                Cena: {{wine.price1}}
              </div>
            </div>
          </div>
        {{/each}}
      </div>
    {{/each}}
</body>
</html>
```

## 🎨 Wynik

Szablon automatycznie pogrupuje wina według kategorii:

### 1. Wina Czerwone
- BERTANI AMARONE DELLA VALPOLICELLA...
- CHATEAU DE BEAUCASTEL...
- DOM PERIGNON...

### 2. Wina Białe  
- CHABLIS GRAND CRU...
- RIESLING SPATLESE...
- PULIGNY-MONTRACHET...

### 3. Wina Różowe
- WHISPERING ANGEL...
- MINUTY PRESTIGE...

### 4. Inne
- (Wina bez określonej kategorii)

## 📊 Dostępne Tokeny

### W pętli kategorii (`{{#each collection.winesByCategory}}`):
- `{{category}}` - nazwa kategorii (np. "czerwone", "białe", "różowe")
- `{{categoryWineCount}}` - liczba win w tej kategorii

### W pętli win (`{{#each wines}}`):
- `{{wine.name}}` - nazwa wina
- `{{wine.description}}` - opis
- `{{wine.type}}` - typ wina
- `{{wine.category}}` - kategoria
- `{{wine.szczepy}}` - szczepy winogron
- `{{wine.region}}` - region pochodzenia
- `{{wine.poj}}` - pojemność
- `{{wine.alcohol}}` - zawartość alkoholu
- `{{wine.price1}}` - cena 1
- `{{wine.price2}}` - cena 2
- `{{wine.catalogNumber}}` - numer katalogowy
- `{{wine.image}}` - ścieżka do obrazu

## ✅ Zastosowania

1. **Karty win** - każda kategoria na osobnej stronie
2. **Menu restauracyjne** - wina pogrupowane czytelnie
3. **Katalogi handlowe** - łatwa nawigacja po kategoriach
4. **Listy degustacyjne** - uporządkowane według kolorów
5. **Raporty sprzedażowe** - analiza według kategorii

## 🔄 Kompatybilność Wsteczna

Stare szablony nadal działają:
- `{{#each collection.wines}}` - wszystkie wina bez grupowania
- `{{#each winesList}}` - alternatywna składnia

## 🚀 Jak Użyć

1. Otwórz edytor szablonów (Template Editor)
2. Wybierz typ podglądu: **Kolekcja**
3. Wybierz kolekcję z listy
4. Wklej powyższy szablon lub stwórz własny
5. Kliknij **"Odśwież podgląd"**
6. Wygeneruj PDF przyciskiem **"Generuj PDF"**

## 📅 Data Wdrożenia

24 października 2025

## 🎯 Status

✅ **GOTOWE** - Działa zarówno w podglądzie live jak i w generowaniu PDF
