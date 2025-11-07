# NavigationComponent - Dokumentacja i Przykłady Użycia

## Opis
NavigationComponent to wspólny, konfigulowalny komponent nawigacji dla systemu Wine Management System. Pozwala na spójną nawigację między stronami z możliwością dostosowania kolorów, logo i funkcjonalności.

## Podstawowe użycie

```javascript
// Podstawowa inicjalizacja
const navigation = new NavigationComponent();
navigation.render('#navigation-container');
```

## Konfiguracja Props

### Wszystkie dostępne propsy:

```javascript
const navigation = new NavigationComponent({
    backgroundColor: 'navbar-wine-primary',    // Kolor tła nawigacji
    textColor: 'navbar-dark',                  // Kolor tekstu (navbar-dark/navbar-light)
    brandText: 'Wine Management System',       // Tekst brandu
    brandIcon: 'bi-grape',                     // Ikona brandu (Bootstrap Icons)
    logoUrl: null,                             // URL do logo (opcjonalny)
    logoAlt: 'Logo',                          // Alt text dla logo
    containerClass: 'container',               // Klasa kontenera (container/container-fluid)
    showDropdown: true,                        // Czy pokazać dropdown menu
    dropdownItems: [...],                      // Elementy dropdown
    customButtons: [...]                       // Niestandardowe przyciski
});
```

## Przykłady różnych konfiguracji

### 1. Strona główna (index.html) - Motyw Primary z Dropdown

```javascript
const navigation = new NavigationComponent({
    backgroundColor: 'navbar-wine-primary',
    textColor: 'navbar-dark',
    brandText: 'Wine Management System',
    brandIcon: 'bi-grape',
    logoUrl: null,
    showDropdown: true // Domyślne dropdown menu
});

navigation.render('#navigation-container');
```

**Wygląd:** Gradientowe tło wine-primary, ikona winogron, pełne dropdown menu z backup, ustawieniami i edytorem PDF.

### 2. Strona win (wines.html) - Motyw Secondary z Custom Buttons

```javascript
const navigation = new NavigationComponent({
    backgroundColor: 'navbar-wine-secondary',
    textColor: 'navbar-dark',
    brandText: 'Wine Management System',
    brandIcon: 'bi-bottle',
    logoUrl: null,
    showDropdown: false, // Ukryj dropdown
    customButtons: [
        {
            action: 'backup',
            icon: 'bi-download',
            text: 'Backup',
            class: 'btn-outline-light'
        },
        {
            action: 'settings',
            icon: 'bi-gear-fill',
            text: 'Ustawienia',
            class: 'btn-outline-light'
        }
    ]
});

navigation.render('#navigation-container');
```

**Wygląd:** Złote tło, ikona butelki, przyciski backup i ustawienia zamiast dropdown.

### 3. Kolekcje (collections.html) - Motyw Info

```javascript
const navigation = new NavigationComponent({
    backgroundColor: 'navbar-wine-info',
    textColor: 'navbar-dark',
    brandText: 'Wine Management System',
    brandIcon: 'bi-folder',
    logoUrl: null,
    showDropdown: false,
    customButtons: [
        {
            action: 'backup',
            icon: 'bi-download',
            text: 'Backup',
            class: 'btn-outline-light'
        },
        {
            action: 'settings',
            icon: 'bi-gear-fill',
            text: 'Ustawienia',
            class: 'btn-outline-light'
        }
    ]
});

navigation.render('#navigation-container');
```

**Wygląd:** Niebieskie tło info, ikona folderu, przyciski akcji.

### 4. Szablony PDF (pdf-templates.html) - Motyw Success z Custom Dropdown

```javascript
const navigation = new NavigationComponent({
    backgroundColor: 'navbar-wine-success',
    textColor: 'navbar-dark',
    brandText: 'Wine Management System',
    brandIcon: 'bi-file-pdf',
    logoUrl: null,
    showDropdown: true,
    dropdownItems: [
        {
            id: 'pdf-editor',
            href: 'pdf-editor.html',
            icon: 'bi-file-earmark-text',
            text: 'Edytor PDF',
            isDivider: false
        },
        {
            id: 'divider1',
            isDivider: true
        },
        {
            id: 'backup',
            action: 'backup',
            icon: 'bi-download',
            text: 'Backup danych',
            isDivider: false
        }
    ]
});

navigation.render('#navigation-container');
```

**Wygląd:** Zielone tło success, ikona PDF, niestandardowe dropdown z edytorem PDF.

### 5. Edytor PDF (pdf-editor.html) - Motyw Dark z Funkcjonalnymi Przyciskami

```javascript
const navigation = new NavigationComponent({
    backgroundColor: 'navbar-wine-dark',
    textColor: 'navbar-dark',
    brandText: 'Wine Management System',
    brandIcon: 'bi-file-earmark-text',
    logoUrl: null,
    containerClass: 'container-fluid', // Pełna szerokość
    showDropdown: false,
    customButtons: [
        {
            action: 'save-template',
            icon: 'bi-save',
            text: 'Zapisz',
            class: 'btn-outline-light'
        },
        {
            action: 'generate-preview',
            icon: 'bi-eye',
            text: 'Podgląd PDF',
            class: 'btn-success'
        }
    ]
});

navigation.render('#navigation-container');

// Obsługa akcji przycisków
document.addEventListener('navigationAction', function(e) {
    const { action } = e.detail;
    switch (action) {
        case 'save-template':
            if (window.pdfEditor && window.pdfEditor.saveTemplate) {
                window.pdfEditor.saveTemplate();
            }
            break;
        case 'generate-preview':
            if (window.pdfEditor && window.pdfEditor.generatePreview) {
                window.pdfEditor.generatePreview();
            }
            break;
    }
});
```

**Wygląd:** Ciemne tło, ikona edytora, przyciski zapisz i podgląd zintegrowane z funkcjonalnością edytora.

### 6. Przykład z logo

```javascript
const navigation = new NavigationComponent({
    backgroundColor: 'navbar-wine-primary',
    textColor: 'navbar-dark',
    brandText: 'Moja Piwnica',
    brandIcon: null, // Wyłącz ikonę
    logoUrl: '/images/logo.png',
    logoAlt: 'Logo Moja Piwnica',
    showDropdown: true
});

navigation.render('#navigation-container');
```

## Dostępne tematy kolorystyczne

Komponent oferuje predefiniowane tematy:

- `navbar-wine-primary` - Bordowy gradient (domyślny)
- `navbar-wine-secondary` - Złoty gradient
- `navbar-wine-dark` - Ciemny gradient
- `navbar-wine-success` - Zielony gradient
- `navbar-wine-info` - Niebieski gradient

## API Events

Komponent emituje wydarzenia dla interakcji:

### navigationAction
Wyemitowane gdy użytkownik kliknie przycisk z data-action:

```javascript
document.addEventListener('navigationAction', function(e) {
    const { action, originalEvent } = e.detail;
    console.log('Akcja nawigacji:', action);
});
```

### sectionNavigation
Wyemitowane przy nawigacji do sekcji (na stronie głównej):

```javascript
document.addEventListener('sectionNavigation', function(e) {
    const { section, originalEvent } = e.detail;
    console.log('Nawigacja do sekcji:', section);
});
```

## Metody komponentu

### updateActiveItem(pageId)
Aktualizuje podświetlenie aktywnej strony:

```javascript
navigation.updateActiveItem('wines');
```

### updateProps(newProps)
Aktualizuje propsy komponentu:

```javascript
navigation.updateProps({
    backgroundColor: 'navbar-wine-info',
    brandText: 'Nowy Tytuł'
});
```

### getNavigationElement()
Zwraca referencję do elementu DOM:

```javascript
const navElement = navigation.getNavigationElement();
```

## Integracja z istniejącymi stronami

### Krok 1: Dodaj kontener
```html
<div id="navigation-container"></div>
```

### Krok 2: Dołącz skrypt
```html
<script src="js/components/NavigationComponent.js"></script>
```

### Krok 3: Inicjalizuj
```javascript
document.addEventListener('DOMContentLoaded', function() {
    const navigation = new NavigationComponent({
        // konfiguracja...
    });
    navigation.render('#navigation-container');
    window.navigationComponent = navigation;
});
```

## Responsive Design

Komponent automatycznie dostosowuje się do różnych rozmiarów ekranu:
- **Desktop:** Pozioma nawigacja z wszystkimi elementami
- **Mobile:** Collapsible menu z hamburger button
- **Tablet:** Adaptacyjny layout zależnie od zawartości

## CSS Classes

Komponent korzysta z Bootstrap 5 i dodatkowych klas:

- `.navbar-logo` - Logo w nawigacji
- `.navbar-wine-*` - Tematy kolorystyczne
- `.dropdown-item` - Elementy dropdown z animacjami
- Loading states i hover effects

## Przykład pełnej integracji

```javascript
// Kompletny przykład z obsługą wydarzeń
document.addEventListener('DOMContentLoaded', function() {
    const navigation = new NavigationComponent({
        backgroundColor: 'navbar-wine-primary',
        textColor: 'navbar-dark',
        brandText: 'Wine Management System',
        brandIcon: 'bi-grape',
        showDropdown: true
    });
    
    navigation.render('#navigation-container');
    
    // Globalna dostępność
    window.navigationComponent = navigation;
    
    // Obsługa akcji nawigacji
    document.addEventListener('navigationAction', function(e) {
        const { action } = e.detail;
        
        switch (action) {
            case 'backup':
                startBackup();
                break;
            case 'settings':
                openSettings();
                break;
            default:
                console.log('Nieznana akcja:', action);
        }
    });
    
    // Obsługa nawigacji sekcji
    document.addEventListener('sectionNavigation', function(e) {
        const { section } = e.detail;
        showSection(section);
    });
});
```

## Zalety rozwiązania

1. **Spójność** - Jednolity wygląd i zachowanie na wszystkich stronach
2. **Konfigurowalność** - Łatwe dostosowanie kolorów, logo i funkcjonalności
3. **Responsywność** - Automatyczne dostosowanie do różnych ekranów
4. **Rozszerzalność** - Prosty system dodawania nowych opcji
5. **Event-driven** - Czysta komunikacja z innymi komponentami
6. **Bootstrap Integration** - Pełna kompatybilność z Bootstrap 5

Komponent NavigationComponent zapewnia profesjonalną, spójną nawigację dla całego systemu Wine Management z możliwością pełnej personalizacji według potrzeb każdej strony.