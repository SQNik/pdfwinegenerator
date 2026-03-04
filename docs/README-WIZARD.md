# 🧙‍♂️ System Wizard - Dokumentacja

## 📋 Spis Treści

1. [Wprowadzenie](#wprowadzenie)
2. [Architektura](#architektura)
3. [Szybki Start](#szybki-start)
4. [Tworzenie Nowej Konfiguracji](#tworzenie-nowej-konfiguracji)
5. [Dodawanie Kroków](#dodawanie-kroków)
6. [API Reference](#api-reference)
7. [Przykłady](#przykłady)
8. [Najlepsze Praktyki](#najlepsze-praktyki)

---

## 🎯 Wprowadzenie

System Wizard to **wielokrotnego użytku komponent** do tworzenia wieloetapowych formularzy z:

- ✅ **Walidacją** każdego kroku przed przejściem dalej
- 💾 **Automatycznym zapisem** stanu do localStorage
- 🎨 **Responsywnym designem** z pełnym dopasowaniem do Design System 2.0
- 🔄 **Nawigacją** między krokami (wstecz/dalej/bezpośrednia)
- 📊 **Paskiem postępu** z wizualizacją ukończenia
- 🧩 **Konfiguracją przez tablicę** - łatwe tworzenie nowych wizardów

### Istniejące Wizardy

| Wizard | Plik Konfiguracji | Użycie |
|--------|-------------------|--------|
| **Kreator Kolekcji** | `collection-wizard-config.js` | 5-krokowy kreator PDF (szablon, okładka, produkty, podsumowanie, zakończenie) |
| **Formularz Kontaktowy** | `contact-wizard-config.js` | Przykład 3-krokowy (dane, zapytanie, podsumowanie) |

---

## 🏗️ Architektura

System składa się z **3 warstw**:

```
┌─────────────────────────────────────────┐
│   wizard.css (455 linii)                │ ← Style dla wszystkich komponentów
│   - Progress bar, steps, navigation     │
│   - Cards, grids, filters, uploads      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   wizard.js (Klasa Wizard)              │ ← Logika zarządzania stanem
│   - State management (data, completed)  │
│   - Validation, navigation              │
│   - LocalStorage persistence            │
│   - Event system (onChange, onComplete) │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│   *-wizard-config.js                    │ ← Konfiguracja kroków
│   - Array of step objects               │
│   - Custom renderFunction per step      │
│   - Validation per step                 │
└─────────────────────────────────────────┘
```

### Przepływ Danych

```
User Input → Step Validation → State Update → localStorage
                                     ↓
                             onChange Event
                                     ↓
                            Next Step Render
                                     ↓ (ostatni krok)
                            onComplete Callback
```

---

## 🚀 Szybki Start

### 1. Dodaj Pliki CSS i JS

```html
<!-- W <head> -->
<link rel="stylesheet" href="css/wizard.css">

<!-- Przed </body> -->
<script src="js/components/wizard.js"></script>
<script src="js/config/collection-wizard-config.js"></script>
```

### 2. Utwórz Kontener

```html
<div id="wizard-container"></div>
```

### 3. Inicjalizuj Wizard

```javascript
document.addEventListener('DOMContentLoaded', function() {
    const wizard = new Wizard({
        containerId: 'wizard-container',
        steps: collectionWizardSteps,  // Twoja konfiguracja
        persistKey: 'my-wizard-state',
        
        onComplete: async (data, wizard) => {
            console.log('Completed with:', data);
            // Wyślij dane do API, przekieruj, itp.
        }
    });
});
```

**Gotowe!** 🎉 Wizard jest w pełni funkcjonalny.

---

## 🛠️ Tworzenie Nowej Konfiguracji

### Krok 1: Utwórz Plik Konfiguracji

Stwórz `public/js/config/moj-wizard-config.js`:

```javascript
const mojWizardSteps = [
    {
        id: 'step1',              // Unikalny ID (używany w localStorage)
        title: 'Pierwszy Krok',   // Wyświetlana nazwa
        label: 'Krok 1',          // Label na progress bar
        icon: 'check',            // Ikona Bootstrap Icons (bez 'bi-')
        description: 'Opis kroku',
        
        // OPCJA A: Automatyczne renderowanie z fields
        fields: [
            {
                name: 'username',
                label: 'Nazwa użytkownika',
                type: 'text',
                required: true,
                placeholder: 'jan.kowalski'
            }
        ],
        
        // OPCJA B: Własna funkcja renderująca (zaawansowane)
        renderFunction: async (container, wizardData) => {
            container.innerHTML = `
                <div class="mb-3">
                    <label>Custom Field</label>
                    <input type="text" 
                           class="form-control" 
                           id="customField"
                           value="${wizardData.customField || ''}">
                </div>
            `;
            
            // Bindowanie zdarzeń
            document.getElementById('customField').addEventListener('input', (e) => {
                wizardData.customField = e.target.value;
            });
        },
        
        // Walidacja kroku
        validate: async (data) => {
            const errors = [];
            
            if (!data.username) {
                errors.push('Nazwa użytkownika jest wymagana');
            }
            
            return {
                valid: errors.length === 0,
                errors: errors
            };
        }
    },
    
    // ... kolejne kroki
];
```

### Krok 2: Użyj w HTML

```html
<script src="js/config/moj-wizard-config.js"></script>
<script>
    new Wizard({
        containerId: 'wizard-container',
        steps: mojWizardSteps,
        persistKey: 'moj-wizard',
        onComplete: async (data) => {
            console.log(data);
        }
    });
</script>
```

---

## ➕ Dodawanie Kroków do Istniejącej Konfiguracji

### Przykład: Dodaj krok do collection-wizard-config.js

Otwórz `public/js/config/collection-wizard-config.js` i dodaj nowy obiekt do tablicy:

```javascript
const collectionWizardSteps = [
    // ... istniejące kroki
    
    {
        id: 'additional-options',
        title: 'Dodatkowe Opcje',
        label: 'Krok 6',
        icon: 'sliders',
        description: 'Ustaw dodatkowe parametry kolekcji',
        
        fields: [
            {
                name: 'visibility',
                label: 'Widoczność',
                type: 'select',
                required: true,
                options: [
                    { value: 'public', label: 'Publiczna' },
                    { value: 'private', label: 'Prywatna' }
                ]
            },
            {
                name: 'tags',
                label: 'Tagi (oddzielone przecinkami)',
                type: 'text',
                placeholder: 'czerwone, wytrawne, 2020'
            }
        ],
        
        validate: async (data) => {
            const errors = [];
            if (!data.visibility) {
                errors.push('Wybierz widoczność');
            }
            return { valid: errors.length === 0, errors };
        }
    }
];
```

**Gotowe!** Nowy krok pojawi się automatycznie w progress bar i nawigacji.

---

## 📚 API Reference

### Konstruktor Wizard

```javascript
new Wizard(options)
```

**Parametry:**

| Parametr | Typ | Wymagany | Domyślnie | Opis |
|----------|-----|----------|-----------|------|
| `containerId` | string | ✅ | - | ID elementu DOM jako kontener |
| `steps` | Array | ✅ | - | Tablica kroków (patrz [Step Object](#step-object)) |
| `persistKey` | string | ❌ | null | Klucz localStorage do zapisywania stanu |
| `autoSave` | boolean | ❌ | true | Automatyczny zapis przy każdej zmianie |
| `completeButtonText` | string | ❌ | 'Zakończ' | Tekst przycisku zakończenia |
| `onChange` | function | ❌ | null | Callback wywoływany przy zmianie kroku |
| `onComplete` | function | ❌ | null | Callback wywoływany po zakończeniu |

**onChange Signature:**
```javascript
(stepIndex, step, wizardData) => { }
```

**onComplete Signature:**
```javascript
async (wizardData, wizardInstance) => { }
```

### Step Object

```javascript
{
    id: string,                    // Unikalny identyfikator
    title: string,                 // Tytuł wyświetlany w kroku
    label: string,                 // Label w progress bar
    icon: string,                  // Nazwa ikony Bootstrap Icons
    description: string,           // Opis pod tytułem
    
    // OPCJA 1: Automatyczne pola
    fields: [                      
        {
            name: string,          // Klucz w wizardData
            label: string,         // Label pola
            type: string,          // 'text'|'email'|'select'|'textarea'|'checkbox'|...
            required: boolean,
            placeholder: string,
            options: Array,        // Dla 'select' - [{value, label}]
            rows: number,          // Dla 'textarea'
            helpText: string       // Tekst pomocy pod polem
        }
    ],
    
    // OPCJA 2: Własne renderowanie
    renderFunction: async (container, wizardData) => {
        // Utwórz HTML w container
        // Zaktualizuj wizardData
    },
    
    // Walidacja
    validate: async (wizardData) => {
        return {
            valid: boolean,
            errors: string[]       // Komunikaty błędów
        };
    },
    
    // Opcjonalne
    visible: (wizardData) => boolean,  // Warunek widoczności kroku
    onEnter: (wizardData) => void,     // Callback wejścia do kroku
    onExit: (wizardData) => void       // Callback wyjścia z kroku
}
```

### Metody Publiczne

#### `wizard.nextStep()`
Przechodzi do następnego kroku (z walidacją).

#### `wizard.previousStep()`
Wraca do poprzedniego kroku.

#### `wizard.goToStep(index)`
Przechodzi bezpośrednio do podanego kroku (tylko jeśli ukończony).

**Parametry:**
- `index` (number) - Indeks kroku (0-based)

#### `wizard.reset()`
Resetuje wizard do stanu początkowego, czyści localStorage.

#### `wizard.getData()`
Zwraca bieżący obiekt danych wizarda.

**Returns:** Object

#### `wizard.setData(newData)`
Ustawia dane wizarda (merge z istniejącymi).

**Parametry:**
- `newData` (Object) - Obiekt z nowymi danymi

#### `wizard.saveState()`
Ręcznie zapisuje stan do localStorage (jeśli persistKey ustawiony).

#### `wizard.loadState()`
Ładuje stan z localStorage.

**Returns:** Object | null

---

## 💡 Przykłady

### Przykład 1: Prosty 2-krokowy Wizard

```javascript
const simpleSteps = [
    {
        id: 'name',
        title: 'Twoje Imię',
        label: 'Krok 1',
        icon: 'person',
        description: 'Jak się nazywasz?',
        
        fields: [
            { name: 'fullName', label: 'Imię i nazwisko', type: 'text', required: true }
        ],
        
        validate: async (data) => ({
            valid: !!data.fullName,
            errors: data.fullName ? [] : ['Podaj imię']
        })
    },
    {
        id: 'finish',
        title: 'Gotowe!',
        label: 'Krok 2',
        icon: 'check-circle',
        description: 'To wszystko',
        
        renderFunction: async (container, data) => {
            container.innerHTML = `<p>Witaj, <strong>${data.fullName}</strong>!</p>`;
        },
        
        validate: async () => ({ valid: true, errors: [] })
    }
];

new Wizard({
    containerId: 'container',
    steps: simpleSteps,
    onComplete: async (data) => {
        alert(`Submitted: ${data.fullName}`);
    }
});
```

### Przykład 2: Warunkowa Widoczność Kroków

```javascript
{
    id: 'conditional-step',
    title: 'Dodatkowe Info',
    label: 'Krok 3',
    icon: 'info',
    
    // Krok widoczny tylko jeśli użytkownik wybrał 'yes' w poprzednim kroku
    visible: (data) => data.needsMoreInfo === 'yes',
    
    fields: [
        { name: 'details', label: 'Szczegóły', type: 'textarea', required: true }
    ],
    
    validate: async (data) => ({
        valid: !!data.details,
        errors: data.details ? [] : ['Pole wymagane']
    })
}
```

### Przykład 3: Integracja z API

```javascript
{
    id: 'products',
    title: 'Wybierz Produkty',
    label: 'Krok 2',
    icon: 'grid',
    
    renderFunction: async (container, data) => {
        // Pobierz produkty z API
        const response = await fetch('/api/products');
        const products = await response.json();
        
        container.innerHTML = `
            <div class="product-grid">
                ${products.map(p => `
                    <div class="product-card" data-id="${p.id}">
                        <img src="${p.image}" alt="${p.name}">
                        <h4>${p.name}</h4>
                        <button class="btn btn-primary select-product">Wybierz</button>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Bindowanie zdarzeń
        container.querySelectorAll('.select-product').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.product-card');
                const productId = card.dataset.id;
                
                data.selectedProducts = data.selectedProducts || [];
                data.selectedProducts.push(productId);
                card.classList.add('selected');
            });
        });
    },
    
    validate: async (data) => ({
        valid: data.selectedProducts?.length > 0,
        errors: data.selectedProducts?.length ? [] : ['Wybierz przynajmniej 1 produkt']
    })
}
```

### Przykład 4: Zapisywanie Wersji Roboczej

```javascript
new Wizard({
    containerId: 'wizard',
    steps: mySteps,
    persistKey: 'draft-wizard', // Automatyczny zapis
    
    onComplete: async (data, wizard) => {
        // Wyślij do API
        await fetch('/api/submit', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        // Wyczyść draft po sukcesie
        wizard.reset();
    }
});

// Dodaj przycisk "Zapisz wersję roboczą"
document.getElementById('save-draft').addEventListener('click', () => {
    wizard.saveState();
    alert('Wersja robocza zapisana!');
});
```

---

## ✨ Najlepsze Praktyki

### 1. **Używaj `fields` dla Prostych Pól**

Jeśli krok zawiera standardowe inputy (text, select, checkbox), używaj tablicy `fields` zamiast `renderFunction`:

```javascript
// ✅ DOBRZE - automatyczne renderowanie
fields: [
    { name: 'email', label: 'Email', type: 'email', required: true }
]

// ❌ ŹLE - niepotrzebne ręczne renderowanie
renderFunction: async (container, data) => {
    container.innerHTML = '<input type="email"...>';
    // ... manual event binding
}
```

### 2. **Zawsze Waliduj**

Każdy krok powinien mieć funkcję `validate`:

```javascript
validate: async (data) => {
    const errors = [];
    
    // Sprawdź wymagane pola
    if (!data.requiredField) errors.push('Pole wymagane');
    
    // Walidacja formatu
    if (data.email && !/\S+@\S+/.test(data.email)) {
        errors.push('Nieprawidłowy email');
    }
    
    // Async walidacja (np. sprawdzenie unikalności)
    if (data.username) {
        const exists = await checkUsernameExists(data.username);
        if (exists) errors.push('Nazwa zajęta');
    }
    
    return { valid: errors.length === 0, errors };
}
```

### 3. **Używaj LocalStorage dla Długich Wizardów**

Dla wizardów z wieloma krokami dodaj `persistKey`:

```javascript
new Wizard({
    containerId: 'wizard',
    steps: longWizardSteps,
    persistKey: 'long-wizard-state', // Auto-save
    autoSave: true
});
```

### 4. **Obsługuj Błędy API Gracefully**

```javascript
onComplete: async (data, wizard) => {
    try {
        const response = await fetch('/api/submit', {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }
        
        alert('✅ Sukces!');
        wizard.reset();
        
    } catch (error) {
        console.error('Submission error:', error);
        alert('❌ Błąd: ' + error.message);
        // Nie resetuj - użytkownik może spróbować ponownie
    }
}
```

### 5. **Dodawaj Ikony dla Lepszego UX**

Używaj ikon Bootstrap Icons bez prefiksu `bi-`:

```javascript
{
    id: 'upload',
    icon: 'cloud-upload',  // ✅ Prawidłowo
    // icon: 'bi-cloud-upload'  // ❌ Błąd
}
```

### 6. **Grupuj Powiązane Dane**

Zamiast płaskiej struktury:

```javascript
// ❌ Płaska struktura
data = {
    firstName: 'Jan',
    lastName: 'Kowalski',
    street: 'Główna 1',
    city: 'Warszawa'
}
```

Używaj zagnieżdżonych obiektów:

```javascript
// ✅ Zagnieżdżone
data = {
    user: {
        firstName: 'Jan',
        lastName: 'Kowalski'
    },
    address: {
        street: 'Główna 1',
        city: 'Warszawa'
    }
}
```

### 7. **Wyczyść Dane przy Resecie**

Jeśli wizard zawiera wrażliwe dane (hasła, karty płatnicze), wymuś reset po zakończeniu:

```javascript
onComplete: async (data, wizard) => {
    await submitData(data);
    wizard.reset(); // Czyści localStorage i dane w pamięci
}
```

---

## 🐛 Troubleshooting

### Problem: Dane nie zapisują się do localStorage

**Rozwiązanie:** Sprawdź czy ustawiłeś `persistKey`:

```javascript
new Wizard({
    containerId: 'wizard',
    steps: mySteps,
    persistKey: 'unique-key-here' // ← Wymagane dla localStorage
});
```

### Problem: Walidacja nie blokuje przejścia do następnego kroku

**Rozwiązanie:** Upewnij się, że `validate` zwraca obiekt z `valid` i `errors`:

```javascript
validate: async (data) => {
    return {
        valid: false,  // ← Musi być boolean
        errors: ['Komunikat błędu']  // ← Musi być array
    };
}
```

### Problem: Custom renderFunction nie aktualizuje danych

**Rozwiązanie:** Modyfikuj obiekt `wizardData` bezpośrednio w event handlerach:

```javascript
renderFunction: async (container, wizardData) => {
    container.innerHTML = '<input id="field">';
    
    document.getElementById('field').addEventListener('input', (e) => {
        wizardData.fieldName = e.target.value; // ← Bezpośrednia modyfikacja
    });
}
```

### Problem: Krok nie pojawia się w wizardzie

**Rozwiązanie:** Sprawdź funkcję `visible`:

```javascript
{
    id: 'step',
    visible: (data) => {
        console.log('Checking visibility:', data);
        return true; // ← Zawsze widoczny dla testu
    }
}
```

---

## 📁 Pliki Systemu

| Plik | Rozmiar | Opis |
|------|---------|------|
| `public/css/wizard.css` | 455 linii | Style komponentów wizard |
| `public/js/components/wizard.js` | 500+ linii | Klasa Wizard (core logic) |
| `public/js/config/collection-wizard-config.js` | ~400 linii | Konfiguracja 5-krokowa (kreator kolekcji) |
| `public/js/config/contact-wizard-config.js` | ~200 linii | Przykład 3-krokowy (formularz kontaktowy) |
| `public/pages/kreator.html` | - | Strona używająca collection-wizard |

---

## 🔗 Powiązane Dokumentacje

- [DEVELOPMENT_RULES.md](../DEVELOPMENT_RULES.md) - Zasady budowania HTML
- [DYNAMIC_FIELDS_SYSTEM.md](docs/DYNAMIC_FIELDS_SYSTEM.md) - System dynamicznych pól
- [DESIGN_SYSTEM_QUICKSTART.md](docs/DESIGN_SYSTEM_QUICKSTART.md) - Design System 2.0

---

## 📝 Changelog

### v1.0.0 (2026-02-19)

- ✨ Pierwsza wersja systemu Wizard
- ✅ Klasa Wizard z pełnym API
- ✅ Konfiguracja collection-wizard (5 kroków)
- ✅ Przykład contact-wizard (3 kroki)
- ✅ Responsywne style z Design System 2.0
- ✅ LocalStorage persistence
- ✅ Walidacja async per-step
- ✅ Warunkowa widoczność kroków

---

**Ostatnia Aktualizacja:** 19 lutego 2026  
**Autor:** Wine Management System Team  
**Wersja:** 1.0.0
