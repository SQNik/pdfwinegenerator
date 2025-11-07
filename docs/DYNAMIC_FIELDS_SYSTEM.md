# Dynamic Fields System - Critical Architecture Guide

## Overview

The Dynamic Fields System is the **core architecture** of the Wine Management System. It enables users to completely customize wine data structure through a web interface, without requiring code changes.

## Key Principle: Server-Driven Configuration

**All field definitions come from the server (`/api/fields/config`) - NEVER use hardcoded fields**

## Architecture Flow

```
User Interface (wines.html)
    ↓
WineFieldsManager.saveField()
    ↓
api.saveFieldConfig() → POST /api/fields/config
    ↓
Backend: fieldsController.ts → dataStore.ts
    ↓
Update: data/fields-config.json
    ↓
WineFieldsManager.notifyConfigurationChange()
    ↓
Event: 'fieldsConfigChanged'
    ↓
WineManager.refreshFieldsConfig()
    ↓
UI Refresh: Forms, Tables, Validation
```

## Critical Code Patterns

### 1. Loading Fields (CORRECT)
```javascript
// WineFieldsManager constructor
constructor() {
    this.fields = []; // Start empty - load from server
    this.init();
}

async loadFieldsFromServer() {
    const response = await api.getFieldsConfig();
    if (response.success && response.data) {
        this.fields = response.data;
        window.WineFieldsConfig.WINE_FIELDS_CONFIG = [...this.fields];
        this.notifyConfigurationChange();
    }
}
```

### 2. Form Generation (CORRECT)
```javascript
// WineManager - Dynamic form generation
initializeDynamicForm() {
    const formFields = this.fieldsConfig.getFormFields(); // From server data
    formFields.forEach(field => {
        formHTML += this.fieldsConfig.generateFormField(field);
    });
}
```

### 3. Event Synchronization (CORRECT)
```javascript
// WineFieldsManager - Notify changes
notifyConfigurationChange() {
    window.WineFieldsConfig.WINE_FIELDS_CONFIG = [...this.fields];
    document.dispatchEvent(new CustomEvent('fieldsConfigChanged', {
        detail: { fields: this.fields }
    }));
}

// WineManager - Listen for changes
document.addEventListener('fieldsConfigChanged', () => {
    this.refreshFieldsConfig();
});
```

## Anti-Patterns (NEVER DO THIS)

### ❌ Wrong: Using Hardcoded Fields
```javascript
// BAD - Never hardcode fields
const fields = [
    { key: 'name', label: 'Name' },
    { key: 'producer', label: 'Producer' } // This will override user config!
];
```

### ❌ Wrong: Fallback to Static Config
```javascript
// BAD - Don't fallback to static config
if (!serverFields) {
    this.fields = [...window.WineFieldsConfig.WINE_FIELDS_CONFIG]; // Static fallback
}
```

### ❌ Wrong: Missing Event Handling
```javascript
// BAD - UI won't update when fields change
this.fields = newFields; // Missing notifyConfigurationChange()
```

## Field Configuration Properties

Each field in `data/fields-config.json` has these properties:

```json
{
  "key": "unique_field_key",
  "label": "Display Label",
  "type": "text|number|email|select|textarea|date",
  "group": "basic|details|technical",
  "required": true|false,
  "displayInForm": true|false,
  "displayInTable": true|false,
  "displayInCard": true|false,
  "formOrder": 1,
  "tableOrder": 1,
  "placeholder": "Input placeholder",
  "validation": {
    "min": 1,
    "max": 255,
    "pattern": "regex_pattern"
  },
  "options": ["Option1", "Option2"] // For select fields
}
```

## Integration Points

### Backend Integration
- **Controller**: `src/controllers/fieldsController.ts`
- **Routes**: `src/routes/fields.ts`
- **Storage**: `data/fields-config.json`
- **Validation**: `src/validators/schemas.ts` (dynamic generation)

### Frontend Integration
- **Manager**: `WineFieldsManager` class in `wines.js`
- **UI**: "Zarządzanie Polami Win" section in `wines.html`
- **Helpers**: Functions in `public/js/config/wine-fields.js`
- **Global State**: `window.WineFieldsConfig.WINE_FIELDS_CONFIG`

## Development Guidelines

### Adding New Field Types
1. Update `generateFormField()` in `wine-fields.js`
2. Add validation logic in `src/validators/schemas.ts`
3. Test with UI field management interface

### Extending Field Properties
1. Update field schema in backend
2. Modify field management form in `wines.html`
3. Update helper functions if needed

### Debugging Field Issues
1. Check browser console for loading errors
2. Verify `/api/fields/config` endpoint response
3. Ensure `fieldsConfigChanged` event is fired
4. Confirm `window.WineFieldsConfig.WINE_FIELDS_CONFIG` is updated

## User Workflow

1. User opens "Zarządzanie Polami Win" in `wines.html`
2. Adds/edits field with properties (type, label, validation, etc.)
3. Clicks "Zapisz Pole" → saves to server
4. System automatically updates all wine forms and tables
5. User can immediately use new field in wine CRUD operations

## Future Extensions

This system can be extended for:
- Collection fields (already implemented)
- PDF template fields
- Export/import field configurations
- Field templates and presets
- Advanced validation rules
- Conditional field display

---

**Remember: The Dynamic Fields System is the foundation that makes this application infinitely customizable without code changes. Always respect the server-driven architecture!**