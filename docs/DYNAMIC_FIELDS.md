# Dynamic Wine Fields Management System

## Przegląd systemu

System zarządzania polami win został przeprojektowany, aby umożliwić łatwe dodawanie, modyfikowanie i usuwanie pól bez konieczności edytowania wielu plików w całej aplikacji.

## Jak dodać nowe pole

### 1. Dodaj pole do interfejsu TypeScript

Edytuj plik `src/types/index.ts`:

```typescript
export interface Wine {
  // ... istniejące pola
  nowePoле?: string; // Dodaj nowe pole tutaj
}
```

### 2. Dodaj konfigurację pola

Edytuj pliki konfiguracyjne:

**Backend:** `src/config/wine-fields.ts`
**Frontend:** `public/js/config/wine-fields.js`

Dodaj nową konfigurację pola do tablicy `WINE_FIELDS`:

```javascript
{
  key: 'nowePoле', // Klucz pola (musi być identyczny z interfejsem)
  label: 'Nowe Pole', // Etykieta wyświetlana w UI
  type: 'text', // Typ: 'text', 'number', 'select', 'textarea', 'url', 'readonly'
  required: false, // Czy pole jest wymagane
  validation: { 
    max: 100 // Walidacja (opcjonalna)
  },
  displayInTable: true, // Czy wyświetlać w tabeli
  displayInForm: true, // Czy wyświetlać w formularzu
  displayInCard: true, // Czy wyświetlać w kartach
  formOrder: 20, // Kolejność w formularzu
  tableOrder: 10, // Kolejność w tabeli
  placeholder: 'Wprowadź wartość', // Placeholder w formularzu
  group: 'details' // Grupa: 'basic', 'details', 'technical', 'system'
}
```

### 3. Skompiluj i uruchom

```bash
npm run build
npm start
```

## Dostępne typy pól

### text
Standardowe pole tekstowe
```javascript
{
  type: 'text',
  validation: { min: 1, max: 255, pattern: '^[A-Za-z]+$' }
}
```

### number
Pole numeryczne
```javascript
{
  type: 'number',
  validation: { min: 0, max: 9999 }
}
```

### select
Lista rozwijana
```javascript
{
  type: 'select',
  validation: { 
    options: ['Opcja 1', 'Opcja 2', 'Opcja 3'] 
  }
}
```

### textarea
Wieloliniowe pole tekstowe
```javascript
{
  type: 'textarea',
  validation: { max: 2000 }
}
```

### url
Pole do wprowadzania URL-i
```javascript
{
  type: 'url',
  validation: { max: 255 }
}
```

### readonly
Pole tylko do odczytu (dla pól systemowych)
```javascript
{
  type: 'readonly'
}
```

## Konfiguracja wyświetlania

### displayInTable
Określa, czy pole ma być wyświetlane w tabeli głównej.

### displayInForm  
Określa, czy pole ma być wyświetlane w formularzu dodawania/edycji.

### displayInCard
Określa, czy pole ma być wyświetlane w widoku kart.

### formOrder / tableOrder
Określają kolejność wyświetlania pól (mniejsze liczby = wyżej).

## Grupy pól

### basic
Podstawowe informacje o winie (nazwa, producent, cena, itp.)

### details
Szczegółowe informacje (kategoria, odmiany, opis)

### technical
Dane techniczne (pojemność, alkohol, numer katalogowy)

### system
Pola systemowe (ID, daty utworzenia/modyfikacji)

## Walidacja

System automatycznie generuje schematy walidacji Joi na podstawie konfiguracji pól.

### Przykłady walidacji:

```javascript
validation: {
  min: 5,           // Minimalna długość tekstu lub wartość liczby
  max: 100,         // Maksymalna długość tekstu lub wartość liczby
  pattern: '^\\d+$', // Regex pattern dla tekstu
  options: ['A', 'B'] // Dostępne opcje dla select
}
```

## Automatyczne funkcje

Po dodaniu pola do konfiguracji, automatycznie:

1. ✅ **Tabela** - kolumna pojawi się w tabeli
2. ✅ **Formularz** - pole pojawi się w formularzu
3. ✅ **Karty** - informacja pojawi się w widoku kart
4. ✅ **Walidacja** - pole będzie walidowane zgodnie z konfiguracją
5. ✅ **API** - pole będzie akceptowane przez backend
6. ✅ **Zapisy/Odczyt** - pole będzie zapisywane i odczytywane z bazy

## Przykład dodania pola "ABV" (zawartość alkoholu w %)

### 1. Dodaj do interfejsu (`src/types/index.ts`):
```typescript
export interface Wine {
  // ... inne pola
  abv?: number;
}
```

### 2. Dodaj do konfiguracji:
```javascript
{
  key: 'abv',
  label: 'ABV (%)',
  type: 'number',
  required: false,
  validation: { min: 0, max: 50 },
  displayInTable: false,
  displayInForm: true,
  displayInCard: true,
  formOrder: 11,
  placeholder: 'np. 13.5',
  group: 'technical'
}
```

### 3. Skompiluj i gotowe!

Pole automatycznie pojawi się w formularzu w odpowiedniej grupie, będzie walidowane (0-50%) i wyświetlane w kartach.

## Usuwanie pól

Aby usunąć pole:
1. Usuń z konfiguracji `WINE_FIELDS`
2. Oznacz jako opcjonalne w interfejsie TypeScript (dodaj `?`)
3. Skompiluj aplikację

**Uwaga:** Nie usuwaj pól z interfejsu całkowicie, jeśli dane już istnieją w bazie!

## Korzyści systemu

- 🚀 **Szybkość** - dodanie pola zajmuje 2 minuty
- 🔧 **Konsystencja** - wszystkie widoki aktualizują się automatycznie  
- 🛡️ **Bezpieczeństwo** - walidacja generowana automatycznie
- 📱 **Responsywność** - układ automatycznie dostosowuje się
- 🧹 **Czytelność** - cała konfiguracja w jednym miejscu