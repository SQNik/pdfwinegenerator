# 📊 Funkcjonalność Eksportu Kolekcji JSON

## ✅ **Zaimplementowane funkcje:**

### 1. **Backend API Endpoints**

#### 🔗 **GET `/api/collections/export/merged`**
- **Opis**: Zwraca wszystkie kolekcje z pełnymi danymi win w jednym JSON
- **Zastosowanie**: API do integracji z zewnętrznymi systemami
- **Zwraca**: Scalone dane kolekcji + pełne obiekty win z `wines.json`

**Przykład odpowiedzi:**
```json
{
  "success": true,
  "data": [
    {
      "id": "collection_xxx",
      "name": "Moja Kolekcja",
      "description": "Opis kolekcji",
      "wines": [
        {
          "catalogNumber": "680701",
          "name": "BERTANI AMARONE DELLA VALPOLICELLA",
          "description": "Intensywna czerwona barwa...",
          "category": "czerwone",
          "region": "Veneto",
          "alcohol": "15%",
          // ... wszystkie pola wina
        }
      ],
      "wineCount": 17
    }
  ]
}
```

#### 🔗 **GET `/api/collections/:id/export`**
- **Opis**: Eksportuje pojedynczą kolekcję z pełnymi danymi win jako plik JSON
- **Zastosowanie**: Pobieranie pliku JSON bezpośrednio przez użytkownika
- **Headers**: `Content-Disposition: attachment; filename="collection-nazwa-timestamp.json"`

**Przykład struktury pliku:**
```json
{
  "collection": {
    "id": "collection_xxx",
    "name": "Moja Kolekcja",
    "description": "Opis",
    "wineCount": 17
  },
  "wines": [
    {
      "catalogNumber": "680701",
      "name": "BERTANI AMARONE...",
      // pełne dane wina
    }
  ],
  "exportInfo": {
    "exportedAt": "2025-10-19T16:45:00.000Z",
    "totalWines": 17,
    "exportFormat": "JSON"
  }
}
```

### 2. **Frontend Integration**

#### 🔲 **Przycisk "JSON" na każdej karcie kolekcji**
- **Lokalizacja**: Card footer w `collections.html`
- **Funkcja**: `exportCollectionJSON(collectionId, collectionName)`
- **Działanie**: Automatycznie pobiera plik JSON z nazwą `collection-NAZWA-timestamp.json`

#### 🔧 **API Client Methods**
```javascript
// Pobranie scalonych danych
await api.getCollectionsWithFullWineData()

// Eksport jako plik
await api.exportCollectionWithWines(collectionId)

// Automatyczne pobieranie pliku
await api.downloadCollectionJSON(collectionId, collectionName)
```

### 3. **Zalety systemu**

✅ **Niezależność**: Nie modyfikuje istniejących endpointów  
✅ **Pełne dane**: Scalanie `collections.json` + `wines.json`  
✅ **Metadata**: Dodatkowe informacje o eksporcie  
✅ **UX**: Jeden klik = automatyczne pobieranie pliku  
✅ **Naming**: Automatyczne nazewnictwo plików z timestamp  

### 4. **Testowanie**

Otwórz w przeglądarce:
```
http://localhost:3001/test-export.html
```

**Testy dostępne:**
- ✨ Test API scalonych kolekcji
- 📥 Test eksportu pojedynczej kolekcji  
- 🔍 Podgląd struktury JSON
- ⬇️ Demo pobierania pliku

### 5. **Użycie w interfejsie**

1. **Przejdź do**: `http://localhost:3001/collections.html`
2. **Na każdej karcie kolekcji** znajdziesz nowy przycisk **"JSON"**
3. **Kliknij przycisk** - plik zostanie automatycznie pobrany
4. **Nazwa pliku**: `collection-NAZWA_KOLEKCJI-timestamp.json`

### 6. **Struktura pliku JSON**

```json
{
  "collection": {
    // Metadane kolekcji
    "id": "...",
    "name": "...",
    "description": "...",
    "tags": [...],
    "status": "active",
    "dynamicFields": {...},
    "createdAt": "...",
    "updatedAt": "...",
    "wineCount": 17
  },
  "wines": [
    // Pełne obiekty win z wines.json
    {
      "catalogNumber": "680701",
      "image": "/images/680701.jpg", 
      "name": "BERTANI AMARONE DELLA VALPOLICELLA CLASSICO DOCG",
      "description": "Intensywna czerwona barwa z ceglastymi przebłyskami...",
      "type": "wytrawne",
      "category": "czerwone", 
      "szczepy": "Corvina, Rondinella",
      "region": "Veneto",
      "poj": "0,75 l",
      "alcohol": "15%",
      "price1": "........",
      "price2": ".........",
      "id": "e055f380-951a-453c-9752-f2494b4ad402",
      "createdAt": "2025-10-16T12:13:02.737Z",
      "updatedAt": "2025-10-16T12:13:02.737Z"
    }
    // ... więcej win
  ],
  "exportInfo": {
    "exportedAt": "2025-10-19T16:45:00.000Z",
    "totalWines": 17,
    "exportFormat": "JSON"
  }
}
```

## 🎯 **Status: GOTOWE DO UŻYCIA!**

✅ Backend endpoints zaimplementowane  
✅ Frontend integration dodana  
✅ Przycisk na kartach kolekcji  
✅ Automatyczne pobieranie plików  
✅ Testowa strona dostępna  

**Aby przetestować**, uruchom serwer i przejdź do `collections.html` - każda kolekcja będzie miała nowy przycisk "JSON"!