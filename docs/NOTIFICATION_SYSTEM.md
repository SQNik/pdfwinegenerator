# Notification Service - Dokumentacja

## Przegląd

System powiadomień toast z nowoczesnymi animacjami i pełnym wsparciem dla trybu ciemnego.

## Funkcjonalności

✅ **4 typy powiadomień**: success, error, warning, info  
✅ **6 pozycji**: top-right, top-left, bottom-right, bottom-left, top-center, bottom-center  
✅ **Animacje**: Slide-in, fade-out, pulse icon  
✅ **Auto-hide**: Konfigurowalne timery  
✅ **Akcje**: Opcjonalne przyciski akcji  
✅ **Responsywność**: Pełne wsparcie mobile  
✅ **Tryb ciemny**: Automatyczna adaptacja  
✅ **Kolejka**: Maksymalnie 5 powiadomień jednocześnie  
✅ **Loading state**: Spinner dla operacji w toku  

## Użycie

### Podstawowe powiadomienia

```javascript
// Success
notify.success('Wino zapisane pomyślnie!');

// Error
notify.error('Błąd podczas zapisywania wina');

// Warning
notify.warning('To pole jest wymagane');

// Info
notify.info('Dane zostały załadowane');
```

### Zaawansowane opcje

```javascript
// Niestandardowy czas trwania (w ms)
notify.success('Operacja zakończona', { duration: 3000 });

// Bez auto-hide
notify.info('Ważna informacja', { persistent: true });

// Bez przycisku zamknięcia
notify.info('Ładowanie...', { closable: false });

// Niestandardowa ikona (Bootstrap Icons)
notify.success('Gotowe!', { icon: 'rocket-takeoff' });
```

### Powiadomienia z akcjami

```javascript
notify.warning('Niezapisane zmiany', {
  action: {
    label: 'Zapisz teraz',
    callback: () => {
      // Zapisz dane
      saveData();
    },
    closeOnClick: true // Zamknij po kliknięciu
  }
});
```

### Loading state

```javascript
// Rozpocznij loading
const loadingId = notify.loading('Wczytywanie danych...');

// Aktualizuj po zakończeniu
setTimeout(() => {
  notify.update(loadingId, 'Dane wczytane!', 'success');
  setTimeout(() => notify.hide(loadingId), 2000);
}, 3000);
```

### Zmiana pozycji

```javascript
// Zmień pozycję na lewy górny róg
notify.setPosition('top-left');

// Dostępne pozycje:
// 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
```

### Ukrywanie powiadomień

```javascript
// Ukryj konkretne powiadomienie
const id = notify.success('Test');
notify.hide(id);

// Ukryj wszystkie
notify.hideAll();
```

## Integracja z istniejącym kodem

Serwis automatycznie zastępuje `Utils.showAlert()`:

```javascript
// Stary kod (nadal działa)
Utils.showAlert('Komunikat', 'success');

// Nowy kod (rekomendowane)
notify.success('Komunikat');
```

## Przykłady z aplikacji

### Zapisywanie wina

```javascript
async function saveWine(wineData) {
  const loadingId = notify.loading('Zapisywanie wina...');
  
  try {
    const response = await fetch('/api/wines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(wineData)
    });
    
    if (response.ok) {
      notify.hide(loadingId);
      notify.success('Wino zapisane pomyślnie!');
    } else {
      throw new Error('Błąd serwera');
    }
  } catch (error) {
    notify.hide(loadingId);
    notify.error('Nie udało się zapisać wina');
  }
}
```

### Usuwanie z potwierdzeniem

```javascript
function confirmDelete(wineId) {
  const id = notify.warning('Czy na pewno usunąć to wino?', {
    persistent: true,
    action: {
      label: 'Usuń',
      callback: async () => {
        notify.hide(id);
        await deleteWine(wineId);
      }
    }
  });
}
```

### Walidacja formularza

```javascript
function validateForm(formData) {
  const errors = [];
  
  if (!formData.name) {
    errors.push('Nazwa wina jest wymagana');
  }
  
  if (!formData.vintage) {
    errors.push('Rocznik jest wymagany');
  }
  
  if (errors.length > 0) {
    errors.forEach(error => notify.warning(error));
    return false;
  }
  
  return true;
}
```

## API Reference

### NotificationService Class

#### Methods

**show(message, type, options)**
- `message` (string): Treść powiadomienia
- `type` (string): 'success' | 'error' | 'warning' | 'info'
- `options` (object):
  - `duration` (number): Czas w ms (domyślnie 5000)
  - `closable` (boolean): Czy pokazać przycisk zamknięcia (domyślnie true)
  - `icon` (string): Nazwa ikony Bootstrap Icons
  - `action` (object): { label, callback, closeOnClick }
  - `persistent` (boolean): Czy powiadomienie pozostaje bez auto-hide

**success(message, options)** - Skrót dla typu 'success'

**error(message, options)** - Skrót dla typu 'error' (domyślnie 7s)

**warning(message, options)** - Skrót dla typu 'warning'

**info(message, options)** - Skrót dla typu 'info'

**loading(message, options)** - Powiadomienie loading ze spinnerem

**hide(id)** - Ukryj powiadomienie po ID

**hideAll()** - Ukryj wszystkie powiadomienia

**update(id, message, type)** - Aktualizuj istniejące powiadomienie

**setPosition(position)** - Zmień pozycję kontenera

## Stylizacja

### CSS Custom Properties

Powiadomienia używają zmiennych z `modern-admin.css`:

```css
--color-bg-primary
--color-bg-secondary
--color-bg-tertiary
--color-text-primary
--color-accent
--space-sm, --space-md, --space-lg
--radius-sm, --radius-lg
--shadow-xl
--transition-base
```

### Customizacja

Nadpisz style w swoim CSS:

```css
.notification {
  border-radius: 16px;
  padding: 20px;
}

.notification-success {
  border-left-color: #00ff00;
}
```

## Responsive Design

- Desktop: 420px szerokości, pozycjonowanie według ustawień
- Mobile: Full width minus 2rem padding
- Automatyczne przełączanie animacji slide dla małych ekranów

## Accessibility

- `role="alert"` dla screen readers
- `aria-live="polite"` dla dynamicznych zmian
- `aria-label` dla przycisków zamknięcia
- Keyboard support (Tab, Enter, Escape)

## Performance

- Maximum 5 powiadomień jednocześnie (starsze automatycznie usuwane)
- Debounced animations dla płynności
- Lazy initialization kontenera
- GPU-accelerated transforms

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Roadmap

- [ ] Grupowanie podobnych powiadomień
- [ ] Persistence między sesjami (opcjonalne)
- [ ] Dźwięki dla powiadomień
- [ ] Rich content (HTML w wiadomościach)
- [ ] Swipe-to-dismiss na mobile
