/**
 * Dynamic Wine Fields Configuration
 * 
 * 🔒 REGUŁA: TYLKO POLA DYNAMICZNE
 * Wszystkie pola są ładowane dynamicznie z serwera przez WineFieldsManager
 * Ta tablica MUSI pozostać pusta - służy tylko jako fallback dla kompatybilności wstecznej
 */

// 🚨 UWAGA: Ta tablica MUSI być pusta! Pola ładowane dynamicznie z serwera
const WINE_FIELDS_CONFIG = [];

// Helper functions
const getFieldConfig = (key) => {
  return window.WineFieldsConfig.WINE_FIELDS_CONFIG.find(field => field.key === key);
};

const getFormFields = () => {
  return window.WineFieldsConfig.WINE_FIELDS_CONFIG
    .filter(field => field.displayInForm)
    .sort((a, b) => (a.formOrder || 999) - (b.formOrder || 999));
};

const getTableFields = () => {
  return window.WineFieldsConfig.WINE_FIELDS_CONFIG
    .filter(field => field.displayInTable)
    .sort((a, b) => (a.tableOrder || 999) - (b.tableOrder || 999));
};

const getCardFields = () => {
  return window.WineFieldsConfig.WINE_FIELDS_CONFIG.filter(field => field.displayInCards);
};

const getRequiredFields = () => {
  return window.WineFieldsConfig.WINE_FIELDS_CONFIG.filter(field => field.required);
};

const getFieldsByGroup = (group) => {
  return window.WineFieldsConfig.WINE_FIELDS_CONFIG.filter(field => field.group === group);
};

// Dynamic form generator
const generateFormField = (fieldConfig) => {
  const { key, label, type, required, validation, placeholder } = fieldConfig;
  
  let inputElement = '';
  const requiredAttr = required ? 'required' : '';
  const requiredLabel = required ? '<span class="text-danger">*</span>' : '';
  
  switch (type) {
    case 'textarea':
      inputElement = `
        <textarea 
          class="form-control" 
          id="wine${key.charAt(0).toUpperCase() + key.slice(1)}" 
          name="${key}"
          placeholder="${placeholder || ''}"
          ${validation?.max ? `maxlength="${validation.max}"` : ''}
          ${requiredAttr}
        ></textarea>`;
      break;
      
    case 'select':
      // Check both fieldConfig.options and validation.options for backward compatibility
      const options = fieldConfig.options || validation?.options || [];
      const emptyOption = required ? '' : '<option value="">-- Wybierz --</option>';
      const optionElements = options.map(option => 
        `<option value="${option.toLowerCase()}">${option}</option>`
      ).join('');
      
      inputElement = `
        <select 
          class="form-control" 
          id="wine${key.charAt(0).toUpperCase() + key.slice(1)}" 
          name="${key}"
          ${requiredAttr}
        >
          ${emptyOption}
          ${optionElements}
        </select>`;
      break;
      
    case 'number':
      inputElement = `
        <input 
          type="number" 
          class="form-control" 
          id="wine${key.charAt(0).toUpperCase() + key.slice(1)}" 
          name="${key}"
          placeholder="${placeholder || ''}"
          ${validation?.min !== undefined ? `min="${validation.min}"` : ''}
          ${validation?.max !== undefined ? `max="${validation.max}"` : ''}
          ${validation?.step !== undefined ? `step="${validation.step}"` : ''}
          ${requiredAttr}
        />`;
      break;
      
    case 'file':
      inputElement = `
        <input 
          type="file" 
          class="form-control" 
          id="wine${key.charAt(0).toUpperCase() + key.slice(1)}" 
          name="${key}"
          ${fieldConfig.accept ? `accept="${fieldConfig.accept}"` : ''}
          ${requiredAttr}
        />`;
      break;
      
    default: // text, url
      inputElement = `
        <input 
          type="text" 
          class="form-control" 
          id="wine${key.charAt(0).toUpperCase() + key.slice(1)}" 
          name="${key}"
          placeholder="${placeholder || ''}"
          ${validation?.max ? `maxlength="${validation.max}"` : ''}
          ${requiredAttr}
        />`;
      break;
  }
  
  return `
    <div class="mb-3">
      <label for="wine${key.charAt(0).toUpperCase() + key.slice(1)}" class="form-label">
        ${label} ${requiredLabel}
      </label>
      ${inputElement}
    </div>`;
};

// Dynamic table header generator
const generateTableHeaders = () => {
  const tableFields = getTableFields();
  let headers = '<th>Akcje</th>'; // Always include actions column
  
  tableFields.forEach(field => {
    headers += `<th>${field.label}</th>`;
  });
  
  return headers;
};

// Dynamic table row generator
const generateTableRow = (wine) => {
  const tableFields = getTableFields();
  let row = `
    <td>
      <button class="btn btn-sm btn-outline-primary me-1" onclick="wineManager.editWine('${wine.id}')">
        <i class="bi bi-pencil"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger" onclick="wineManager.deleteWine('${wine.id}')">
        <i class="bi bi-trash"></i>
      </button>
    </td>`;
  
  tableFields.forEach(field => {
    let value = wine[field.key] || '';
    
    // Format specific field types and fields
    if (field.key === 'name') {
      // Name with description preview
      const name = window.Utils ? Utils.escapeHTML(value) : value;
      const desc = wine.description ? 
        `<br><small class="text-muted">${window.Utils ? Utils.escapeHTML(wine.description.substring(0, 50)) : wine.description.substring(0, 50)}${wine.description.length > 50 ? '...' : ''}</small>` : '';
      value = `<strong>${name}</strong>${desc}`;
    } else if (field.key === 'image') {
      // Image thumbnail
      if (value) {
        const imageUrl = window.Utils ? Utils.getWineImageUrl(value) : value;
        value = `<img src="${imageUrl}" alt="Wine" class="wine-table-thumbnail" style="height: 150px; width: auto; object-fit: cover; border-radius: 4px;" onerror="this.src='/images/default-wine.jpg'">`;
      } else {
        value = `<img src="/images/default-wine.jpg" alt="No image" class="wine-table-thumbnail" style="height: 150px; width: auto; object-fit: cover; border-radius: 4px;">`;
      }
    } else if (field.key === 'category') {
      // Capitalize first letter for display while keeping lowercase value in data
      const displayValue = value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
      value = displayValue ? `<span class="badge badge-category">${window.Utils ? Utils.escapeHTML(displayValue) : displayValue}</span>` : '-';
    } else if (field.type === 'select' && value) {
      // For select fields, capitalize first letter for display
      const displayValue = value.charAt(0).toUpperCase() + value.slice(1);
      value = window.Utils ? Utils.escapeHTML(displayValue) : displayValue;
    } else if (field.type === 'number' && value) {
      if (field.key === 'price1' || field.key === 'price2') {
        value = window.Utils ? Utils.formatCurrency(value) : `${value} zł`;
      } else {
        value = value.toString();
      }
    } else if (value) {
      value = window.Utils ? Utils.escapeHTML(value) : value;
    } else {
      value = '-';
    }
    
    row += `<td>${value}</td>`;
  });
  
  return `<tr>${row}</tr>`;
};

// Dynamic card generator
const generateWineCard = (wine) => {
  const cardFields = getCardFields();
  
  let cardContent = '';
  cardFields.forEach(field => {
    const value = wine[field.key];
    if (value && field.key !== 'name') { // Name is handled separately
      let displayValue = value;
      let icon = '';
      
      // Field-specific formatting and icons
      switch (field.key) {
        case 'region':
          icon = '<i class="bi bi-geo-alt"></i>';
          displayValue = window.Utils ? Utils.escapeHTML(value) : value;
          break;
        case 'szczepy':
          icon = '<i class="bi bi-grape"></i>';
          displayValue = window.Utils ? Utils.escapeHTML(value) : value;
          break;
        case 'category':
          // Capitalize first letter for display
          const displayCategory = value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
          cardContent += `<span class="modern-badge modern-badge-success" style="margin-bottom: 8px; display: inline-block;">${window.Utils ? Utils.escapeHTML(displayCategory) : displayCategory}</span>`;
          return;
        case 'type':
          icon = '<i class="bi bi-wine"></i>';
          displayValue = window.Utils ? Utils.escapeHTML(value) : value;
          break;
        case 'alcohol':
          icon = '<i class="bi bi-percent"></i>';
          displayValue = `${value}%`;
          break;
        case 'poj':
          icon = '<i class="bi bi-cup"></i>';
          displayValue = value;
          break;
        case 'price1':
        case 'price2':
          // Price is handled in footer
          return;
        case 'description':
          if (value.length > 100) {
            displayValue = window.Utils ? Utils.escapeHTML(value.substring(0, 100) + '...') : value.substring(0, 100) + '...';
          } else {
            displayValue = window.Utils ? Utils.escapeHTML(value) : value;
          }
          icon = '<i class="bi bi-text-left"></i>';
          break;
        default:
          if (field.type === 'number') {
            displayValue = value.toString();
          } else if (field.type === 'select') {
            // For select fields, capitalize first letter for display
            displayValue = value.charAt(0).toUpperCase() + value.slice(1);
            displayValue = window.Utils ? Utils.escapeHTML(displayValue) : displayValue;
          } else {
            displayValue = window.Utils ? Utils.escapeHTML(value) : value;
          }
          break;
      }
      
      cardContent += `<div style="margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">${icon} <span>${displayValue}</span></div>`;
    }
  });
  
  const imageUrl = window.Utils ? Utils.getWineImageUrl(wine.image) : (wine.image || '/images/default-wine.jpg');
  const escapedName = window.Utils ? Utils.escapeHTML(wine.name) : wine.name;
  const formattedPrice = wine.price1 ? 
    (window.Utils ? Utils.formatCurrency(wine.price1) : `${wine.price1} zł`) : 
    (wine.price2 ? (window.Utils ? Utils.formatCurrency(wine.price2) : `${wine.price2} zł`) : 'Brak ceny');
  
  // If no content to display, show a default message
  if (!cardContent.trim()) {
    cardContent = '<div style="color: var(--color-text-tertiary); font-style: italic;">Brak dodatkowych informacji</div>';
  }
  
  return `
    <div class="modern-card" style="display: flex; flex-direction: column; height: 100%;">
      <div style="position: relative; width: 100%; padding-top: 100%; background-color: var(--color-bg-tertiary); border-radius: var(--radius-lg) var(--radius-lg) 0 0; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url('${imageUrl}'); background-size: contain; background-repeat: no-repeat; background-position: center;">
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%); opacity: 0; transition: opacity 0.3s;" onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0'">
            <div style="position: absolute; bottom: var(--space-sm); left: var(--space-sm); right: var(--space-sm); display: flex; gap: var(--space-xs);">
              <button type="button" class="modern-btn modern-btn-sm modern-btn-secondary" onclick="window.wineApp.managers.wines.editWine('${wine._id || wine.id}')" style="flex: 1;">
                <i class="bi bi-pencil"></i>
              </button>
              <button type="button" class="modern-btn modern-btn-sm modern-btn-ghost" onclick="window.wineApp.managers.wines.deleteWine('${wine._id || wine.id}')" style="flex: 1; color: var(--color-danger); border-color: var(--color-danger);">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modern-card-body" style="flex: 1; padding: var(--space-md); display: flex; flex-direction: column;">
        <h6 style="font-size: 1rem; font-weight: 600; margin-bottom: var(--space-sm); color: var(--color-text-primary);">${escapedName}</h6>
        <div style="flex: 1; font-size: 0.8125rem; color: var(--color-text-secondary);">
          ${cardContent}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--space-sm); padding-top: var(--space-sm); border-top: 1px solid var(--color-border-light);">
          <span style="font-size: 1rem; font-weight: 600; color: var(--color-accent);">${formattedPrice}</span>
          <small style="color: var(--color-text-tertiary); font-size: 0.75rem;">${wine.catalogNumber || wine._id || wine.id}</small>
        </div>
      </div>
    </div>`;
};

// Validation functions
const validateField = (fieldKey, value) => {
  const fieldConfig = getFieldConfig(fieldKey);
  if (!fieldConfig) return { valid: true };
  
  const errors = [];
  
  // Required validation
  if (fieldConfig.required && (!value || value.toString().trim() === '')) {
    errors.push(`${fieldConfig.label} jest wymagane`);
  }
  
  // Type specific validation
  if (value && value.toString().trim() !== '') {
    switch (fieldConfig.type) {
      case 'number':
        const numValue = parseFloat(value);
        if (isNaN(numValue)) {
          errors.push(`${fieldConfig.label} musi być liczbą`);
        } else {
          if (fieldConfig.validation?.min !== undefined && numValue < fieldConfig.validation.min) {
            errors.push(`${fieldConfig.label} nie może być mniejsze niż ${fieldConfig.validation.min}`);
          }
          if (fieldConfig.validation?.max !== undefined && numValue > fieldConfig.validation.max) {
            errors.push(`${fieldConfig.label} nie może być większe niż ${fieldConfig.validation.max}`);
          }
        }
        break;
        
      case 'text':
      case 'textarea':
      case 'url':
        const strValue = value.toString();
        if (fieldConfig.validation?.min !== undefined && strValue.length < fieldConfig.validation.min) {
          errors.push(`${fieldConfig.label} musi mieć co najmniej ${fieldConfig.validation.min} znaków`);
        }
        if (fieldConfig.validation?.max !== undefined && strValue.length > fieldConfig.validation.max) {
          errors.push(`${fieldConfig.label} nie może mieć więcej niż ${fieldConfig.validation.max} znaków`);
        }
        break;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
};

const validateWineData = (wineData) => {
  const allErrors = {};
  let isValid = true;
  
  // Validate all configured fields
  window.WineFieldsConfig.WINE_FIELDS_CONFIG.forEach(fieldConfig => {
    if (fieldConfig.displayInForm) {
      const validation = validateField(fieldConfig.key, wineData[fieldConfig.key]);
      if (!validation.valid) {
        allErrors[fieldConfig.key] = validation.errors;
        isValid = false;
      }
    }
  });
  
  return {
    valid: isValid,
    errors: allErrors
  };
};

// Export for use in other modules
window.WineFieldsConfig = {
  WINE_FIELDS_CONFIG,
  getFieldConfig,
  getFormFields,
  getTableFields,
  getCardFields,
  getRequiredFields,
  getFieldsByGroup,
  generateFormField,
  generateTableHeaders,
  generateTableRow,
  generateWineCard,
  validateField,
  validateWineData
};