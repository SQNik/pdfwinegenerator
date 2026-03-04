/**
 * 🎯 SINGLE SOURCE OF TRUTH - Product List Layout Defaults
 * 
 * Centralne domyślne wartości dla konfiguracji wyświetlania list produktów.
 * Eliminuje duplikacje i zapewnia spójność w całym systemie.
 */

import { ProductListLayoutConfig } from '../types/index.js';

// ✅ JEDYNE ŹRÓDŁO DOMYŚLNYCH WARTOŚCI
export const PRODUCT_LIST_DEFAULTS: ProductListLayoutConfig = {
  // Layout configuration
  columns: 2,                    // Standardowe 2 kolumny dla optymalnej czytelności
  rowsPerPage: 10,              // 10 wierszy na stronę dla dobrego balance
  displayMode: 'columns',       // Domyślny tryb kolumnowy
  itemSpacing: 10,              // 10 points odstępu między elementami
  
  // Display options
  showImages: true,             // Domyślnie pokazuj obrazy produktów
  showPrices: true,             // Domyślnie pokazuj ceny
  showDescriptions: false,      // Domyślnie ukryj opisy (oszczędność miejsca)
  displayFields: ['name', 'catalogNumber', 'type', 'category'], // 🆕 Domyślne pola do wyświetlenia
  
  // Typography defaults
  fontSize: 10,                 // Standardowy rozmiar czcionki
  fontFamily: 'Arial',          // Bezpieczna czcionka
  textColor: '#000000',         // Czarny tekst
  
  // Header defaults
  headerText: 'Produkty',       // Domyślny tytuł
  showHeader: false,            // Domyślnie ukryj nagłówek
  headerFontSize: 14,          // Większa czcionka dla nagłówka
  headerColor: '#000000'       // Czarny kolor nagłówka
};

/**
 * Funkcja pomocnicza do scalania konfiguracji z hierarchią:
 * Element Properties > Template Defaults > System Defaults
 */
export function mergeProductListConfig(
  elementProps: Partial<ProductListLayoutConfig> = {},
  templateDefaults: Partial<ProductListLayoutConfig> = {}
): ProductListLayoutConfig {
  return {
    // Layout properties - hierarchia: element > template > system defaults
    columns: elementProps.columns ?? templateDefaults.columns ?? PRODUCT_LIST_DEFAULTS.columns,
    rowsPerPage: elementProps.rowsPerPage ?? templateDefaults.rowsPerPage ?? PRODUCT_LIST_DEFAULTS.rowsPerPage,
    displayMode: elementProps.displayMode ?? templateDefaults.displayMode ?? PRODUCT_LIST_DEFAULTS.displayMode,
    itemSpacing: elementProps.itemSpacing ?? templateDefaults.itemSpacing ?? PRODUCT_LIST_DEFAULTS.itemSpacing,
    
    // Display options
    showImages: elementProps.showImages ?? templateDefaults.showImages ?? PRODUCT_LIST_DEFAULTS.showImages,
    showPrices: elementProps.showPrices ?? templateDefaults.showPrices ?? PRODUCT_LIST_DEFAULTS.showPrices,
    showDescriptions: elementProps.showDescriptions ?? templateDefaults.showDescriptions ?? PRODUCT_LIST_DEFAULTS.showDescriptions,
    
    // Typography - użyj domyślnych jeśli nie podano
    fontSize: elementProps.fontSize ?? templateDefaults.fontSize ?? PRODUCT_LIST_DEFAULTS.fontSize!,
    fontFamily: elementProps.fontFamily ?? templateDefaults.fontFamily ?? PRODUCT_LIST_DEFAULTS.fontFamily!,
    textColor: elementProps.textColor ?? templateDefaults.textColor ?? PRODUCT_LIST_DEFAULTS.textColor!,
    
    // Header - użyj domyślnych jeśli nie podano
    headerText: elementProps.headerText ?? templateDefaults.headerText ?? PRODUCT_LIST_DEFAULTS.headerText!,
    showHeader: elementProps.showHeader ?? templateDefaults.showHeader ?? PRODUCT_LIST_DEFAULTS.showHeader!,
    headerFontSize: elementProps.headerFontSize ?? templateDefaults.headerFontSize ?? PRODUCT_LIST_DEFAULTS.headerFontSize!,
    headerColor: elementProps.headerColor ?? templateDefaults.headerColor ?? PRODUCT_LIST_DEFAULTS.headerColor!
  };
}

/**
 * Validacja konfiguracji z sensownymi ograniczeniami
 */
export function validateProductListConfig(config: ProductListLayoutConfig): ProductListLayoutConfig {
  return {
    ...config,
    columns: Math.max(1, Math.min(6, config.columns)),           // 1-6 kolumn
    rowsPerPage: Math.max(1, Math.min(50, config.rowsPerPage)), // 1-50 wierszy
    itemSpacing: Math.max(0, Math.min(50, config.itemSpacing)), // 0-50 points odstępu
    fontSize: config.fontSize !== undefined ? Math.max(6, Math.min(24, config.fontSize)) : PRODUCT_LIST_DEFAULTS.fontSize!,
    fontFamily: config.fontFamily ?? PRODUCT_LIST_DEFAULTS.fontFamily!,
    textColor: config.textColor ?? PRODUCT_LIST_DEFAULTS.textColor!,
    headerText: config.headerText ?? PRODUCT_LIST_DEFAULTS.headerText!,
    showHeader: config.showHeader ?? PRODUCT_LIST_DEFAULTS.showHeader!,
    headerFontSize: config.headerFontSize !== undefined ? Math.max(8, Math.min(32, config.headerFontSize)) : PRODUCT_LIST_DEFAULTS.headerFontSize!,
    headerColor: config.headerColor ?? PRODUCT_LIST_DEFAULTS.headerColor!
  };
}