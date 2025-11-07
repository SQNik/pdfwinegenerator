/**
 * DOMYŚLNE POLA SYSTEMOWE - NIEZBĘDNE I ZABLOKOWANE
 * 
 * Te pola są NIEZBĘDNE dla funkcjonowania systemu zarządzania winami.
 * ZAKAZ USUWANIA lub modyfikacji kluczowych właściwości!
 * 
 * Zablokowane właściwości:
 * - key (klucz pola)
 * - type (typ pola) 
 * - required (wymagane)
 * - isSystemField (flaga systemowa)
 */

import { FieldConfig } from '../types';

export const DEFAULT_SYSTEM_FIELDS: FieldConfig[] = [
  {
    key: "catalogNumber",
    label: "Nr kat.",
    type: "text",
    group: "basic",
    placeholder: "Wprowadź numer katalogowy",
    validation: {
      min: "",
      max: "20"
    },
    formOrder: 1,
    tableOrder: 1,
    displayInTable: true,
    displayInForm: true,
    displayInCards: true,
    required: true,
    searchable: true,
    filterable: false,
    isSystemField: true // 🔒 ZABLOKOWANE POLE SYSTEMOWE
  },
  {
    key: "image",
    label: "Obraz",
    type: "url",
    group: "basic",
    placeholder: "URL do obrazu lub ścieżka do pliku",
    validation: {
      min: "",
      max: "255"
    },
    formOrder: 2,
    tableOrder: 2,
    displayInTable: true,
    displayInForm: true,
    displayInCards: true,
    required: false,
    searchable: true,
    filterable: false,
    isSystemField: true // 🔒 ZABLOKOWANE POLE SYSTEMOWE
  },
  {
    key: "name",
    label: "Nazwa",
    type: "text",
    group: "basic",
    placeholder: "Wprowadź nazwę wina",
    validation: {
      min: "1",
      max: "255"
    },
    formOrder: 3,
    tableOrder: 3,
    displayInTable: true,
    displayInForm: true,
    displayInCards: true,
    required: true,
    searchable: true,
    filterable: false,
    isSystemField: true // 🔒 ZABLOKOWANE POLE SYSTEMOWE
  },
  {
    key: "description",
    label: "Opis",
    type: "textarea",
    group: "details",
    placeholder: "Wprowadź opis wina",
    validation: {
      min: "",
      max: "2000"
    },
    formOrder: 4,
    tableOrder: 4,
    displayInTable: true,
    displayInForm: true,
    displayInCards: true,
    required: false,
    searchable: true,
    filterable: false,
    isSystemField: true // 🔒 ZABLOKOWANE POLE SYSTEMOWE
  },
  {
    key: "type",
    label: "Typ",
    type: "select",
    group: "details",
    placeholder: "np. Wytrawne, Półwytrawne",
    validation: {
      min: "",
      max: "50"
    },
    options: [
      "wytrawne",
      "półwytrawne", 
      "słodkie",
      "wytrawne musujące",
      "półwytrawne musujące",
      "słodkie musujące",
      "słodko-gorzkie musujące"
    ],
    formOrder: 5,
    tableOrder: 5,
    displayInTable: true,
    displayInForm: true,
    displayInCards: true,
    required: false,
    searchable: true,
    filterable: true,
    isSystemField: true // 🔒 ZABLOKOWANE POLE SYSTEMOWE
  },
  {
    key: "category",
    label: "Kolor",
    type: "select",
    group: "details",
    placeholder: "",
    validation: {
      min: "",
      max: ""
    },
    options: [
      "Czerwone",
      "Białe", 
      "Różowe",
      "pomarańczowoczerwony"
    ],
    formOrder: 6,
    tableOrder: 6,
    displayInTable: true,
    displayInForm: true,
    displayInCards: true,
    required: false,
    searchable: true,
    filterable: true,
    isSystemField: true // 🔒 ZABLOKOWANE POLE SYSTEMOWE
  },
  {
    key: "szczepy",
    label: "Szczep",
    type: "text",
    group: "basic",
    placeholder: "Wprowadź nazwę szczep",
    validation: {
      min: "",
      max: "255"
    },
    formOrder: 7,
    tableOrder: 7,
    displayInTable: true,
    displayInForm: true,
    displayInCards: true,
    required: false,
    searchable: true,
    filterable: false,
    isSystemField: true // 🔒 ZABLOKOWANE POLE SYSTEMOWE
  },
  {
    key: "region",
    label: "Region",
    type: "text",
    group: "basic",
    placeholder: "Wprowadź region",
    validation: {
      min: "",
      max: "100"
    },
    formOrder: 8,
    tableOrder: 8,
    displayInTable: true,
    displayInForm: true,
    displayInCards: true,
    required: false,
    searchable: true,
    filterable: false,
    isSystemField: true // 🔒 ZABLOKOWANE POLE SYSTEMOWE
  },
  {
    key: "poj",
    label: "Pojemność",
    type: "text",
    group: "technical",
    placeholder: "np. 750ml",
    validation: {
      min: "",
      max: "20"
    },
    formOrder: 9,
    tableOrder: 9,
    displayInTable: true,
    displayInForm: true,
    displayInCards: true,
    required: false,
    searchable: true,
    filterable: false,
    isSystemField: true // 🔒 ZABLOKOWANE POLE SYSTEMOWE
  },
  {
    key: "alcohol",
    label: "Zawartość alkoholu",
    type: "text",
    group: "technical",
    placeholder: "np. 13.5%",
    validation: {
      min: "",
      max: "20"
    },
    formOrder: 10,
    tableOrder: 10,
    displayInTable: true,
    displayInForm: true,
    displayInCards: true,
    required: false,
    searchable: true,
    filterable: false,
    isSystemField: true // 🔒 ZABLOKOWANE POLE SYSTEMOWE
  },
  {
    key: "price1",
    label: "Cena1",
    type: "text",
    group: "basic",
    placeholder: "Wprowadź cenę",
    validation: {
      min: "",
      max: ""
    },
    formOrder: 11,
    tableOrder: 11,
    displayInTable: true,
    displayInForm: true,
    displayInCards: true,
    required: false,
    searchable: true,
    filterable: false,
    isSystemField: true // 🔒 ZABLOKOWANE POLE SYSTEMOWE
  },
  {
    key: "price2",
    label: "Cena 2",
    type: "text",
    group: "basic",  
    placeholder: "Wprowadź cenę 2",
    validation: {
      min: "",
      max: ""
    },
    formOrder: 12,
    tableOrder: 12,
    displayInTable: true,
    displayInForm: true,
    displayInCards: true,
    required: false,
    searchable: true,
    filterable: false,
    isSystemField: true // 🔒 ZABLOKOWANE POLE SYSTEMOWE
  }
];

/**
 * Sprawdza czy pole jest systemowe (niezbędne)
 */
export const isSystemField = (fieldKey: string): boolean => {
  return DEFAULT_SYSTEM_FIELDS.some(field => field.key === fieldKey);
};

/**
 * Pobiera listę kluczy pól systemowych
 */
export const getSystemFieldKeys = (): string[] => {
  return DEFAULT_SYSTEM_FIELDS.map(field => field.key);
};

/**
 * Sprawdza czy konfiguracja zawiera wszystkie niezbędne pola systemowe
 */
export const validateSystemFields = (config: FieldConfig[]): { valid: boolean; missing: string[] } => {
  const configKeys = config.map(field => field.key);
  const systemKeys = getSystemFieldKeys();
  const missing = systemKeys.filter(key => !configKeys.includes(key));
  
  return {
    valid: missing.length === 0,
    missing
  };
};