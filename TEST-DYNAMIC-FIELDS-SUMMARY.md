# Test Dynamicznych Pól w Designerze Produktu

## Zmiany wprowadzone:

### 1. Dodanie ładowania pól dynamicznych w init()
- Dodano wywołanie `await this.loadDynamicFields()` w metodzie `init()`
- Inicjalizacja tablicy `this.dynamicFields = []` w konstruktorze

### 2. Metoda loadDynamicFields()
- Pobiera konfigurację pól z `/api/fields/config`
- Zapisuje pola w `this.dynamicFields`
- Wywołuje `populateDataBindingOptions()` po załadowaniu

### 3. Metoda populateDataBindingOptions()
- Populuje select `text-data-binding` wszystkimi polami oprócz 'image'
- Populuje select `image-data-binding` tylko polem 'image'
- Sprawdza, czy pola są załadowane, jeśli nie - ładuje je

### 4. Integracja z systemem szablonów produktu
- Wywołanie `populateDataBindingOptions()` w `bindProductTemplatePropertyEvents()`
- Ta metoda jest wywoływana gdy otwiera się modal Designera Produktu

## Oczekiwane wyniki:

### W selektorze text-data-binding powinny być opcje:
- Brak (wartość: "")
- Nr kat. (wartość: "catalogNumber")
- Nazwa (wartość: "name")
- Opis (wartość: "description")
- Typ (wartość: "type")
- Kolor (wartość: "category")
- Szczep (wartość: "szczepy")
- Region (wartość: "region")
- Pojemność (wartość: "poj")
- Zawartość alkoholu (wartość: "alcohol")
- Cena1 (wartość: "price1")
- Cena 2 (wartość: "price2")

### W selektorze image-data-binding powinna być opcja:
- Brak (wartość: "")
- Obraz (wartość: "image")

## Test:
1. Otwórz http://localhost:3001/pdf-editor.html
2. Kliknij przycisk "Designer Produktu"
3. Sprawdź czy w panelu właściwości elementów są dostępne wszystkie pola dynamiczne
4. Dodaj element tekstowy i sprawdź opcje data binding
5. Dodaj element obrazu i sprawdź opcje data binding

## Logi w konsoli:
- "PDFTemplateEditor: Loading dynamic fields for data binding"
- "PDFTemplateEditor: Dynamic fields loaded: 12 fields"
- "PDFTemplateEditor: Opening product designer modal"
- "PDFTemplateEditor: Binding product template property events"
- "PDFTemplateEditor: Populating data binding options"
- "PDFTemplateEditor: Text data binding options populated with 11 fields"
- "PDFTemplateEditor: Image data binding options populated with 1 fields"