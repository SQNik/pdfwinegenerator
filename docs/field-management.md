# Zarządzanie Polami - Dokumentacja

## Przegląd
System zarządzania polami umożliwia dynamiczne konfigurowanie pól używanych w aplikacji zarządzania winami. Użytkownicy mogą dodawać, edytować i usuwać pola, definiować ich typy, walidację i opcje wyświetlania.

## Dostęp do Funkcji
1. Otwórz aplikację Wine Manager
2. Kliknij zakładkę **"Pola"** w nawigacji
3. Zostaniesz przeniesiony do interfejsu zarządzania polami

## Funkcje

### Dodawanie Nowego Pola
1. Kliknij przycisk **"Dodaj Pole"**
2. Wypełnij formularz:
   - **Nazwa pola**: Unikalna nazwa pola (np. "abv", "region")
   - **Etykieta**: Czytelna nazwa wyświetlana użytkownikowi
   - **Opis**: Opcjonalny opis pola
   - **Typ pola**: Wybierz z dostępnych typów (text, number, select, etc.)
   - **Wymagane**: Czy pole jest obowiązkowe
   - **Widoczne**: Czy pole jest widoczne w interfejsie
3. Kliknij **"Zapisz"**

### Edytowanie Pola
1. W tabeli pól kliknij przycisk **"Edytuj"** przy wybranym polu
2. Zmodyfikuj wymagane właściwości
3. Kliknij **"Zapisz"**

### Usuwanie Pola
1. W tabeli pól kliknij przycisk **"Usuń"** przy wybranym polu
2. Potwierdź usunięcie w oknie dialogowym

### Podgląd
System oferuje podgląd w czasie rzeczywistym:
- **Podgląd formularza**: Pokazuje jak pole będzie wyglądać w formularzu
- **Podgląd tabeli**: Pokazuje jak pole będzie wyświetlane w tabeli
- **Podgląd karty**: Pokazuje jak pole będzie prezentowane na karcie produktu

### Eksport Konfiguracji
1. Kliknij przycisk **"Eksportuj Konfigurację"**
2. Pobierz plik JSON z kompletną konfiguracją pól
3. Użyj tego pliku do backupu lub transferu konfiguracji

## Typy Pól

### Dostępne Typy
- **text**: Podstawowe pole tekstowe
- **textarea**: Wieloliniowe pole tekstowe
- **number**: Pole numeryczne z walidacją
- **email**: Pole email z walidacją
- **url**: Pole URL z walidacją
- **tel**: Pole telefonu
- **password**: Pole hasła
- **select**: Lista rozwijana z opcjami
- **radio**: Przyciski radio
- **checkbox**: Pola wyboru
- **date**: Selektor daty
- **time**: Selektor czasu
- **datetime-local**: Selektor daty i czasu
- **color**: Selektor koloru
- **range**: Suwak zakresu
- **file**: Upload pliku

### Walidacja
Każdy typ pola może mieć własne reguły walidacji:
- **Wymagane**: Pole musi być wypełnione
- **Minimalna/Maksymalna długość**: Dla pól tekstowych
- **Minimalna/Maksymalna wartość**: Dla pól numerycznych
- **Wzorzec**: Wyrażenie regularne dla zaawansowanej walidacji

## Integracja z Systemem
- Pola są automatycznie integrowane z formularzami dodawania/edycji win
- Dynamiczne generowanie tabel z konfigurowalnymi kolumnami
- Automatyczna walidacja danych wejściowych
- Persystencja konfiguracji w localStorage z możliwością eksportu

## Bezpieczeństwo
- Walidacja po stronie klienta i serwera
- Sanityzacja danych wejściowych
- Zabezpieczenia przed XSS i injection attacks

## Przykład Konfiguracji
```json
{
  "name": "abv",
  "label": "Zawartość alkoholu",
  "description": "Procentowa zawartość alkoholu w winie",
  "type": "number",
  "required": true,
  "visible": true,
  "validation": {
    "min": 0,
    "max": 20,
    "step": 0.1
  }
}
```

## Wsparcie Techniczne
- Sprawdź konsolę przeglądarki w przypadku błędów
- Konfiguracja jest przechowywana w localStorage
- W przypadku problemów wyczyść cache przeglądarki