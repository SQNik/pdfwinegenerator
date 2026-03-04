/**
 * Wine Fields Configuration
 * Central configuration for all wine fields across the application
 */

export interface WineFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'url' | 'readonly';
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  displayInTable?: boolean;
  displayInForm?: boolean;
  displayInCard?: boolean;
  formOrder?: number;
  tableOrder?: number;
  placeholder?: string;
  group?: 'basic' | 'details' | 'technical' | 'system';
}

export const WINE_FIELDS: WineFieldConfig[] = [
  // Basic Information
  {
    key: 'name',
    label: 'Nazwa',
    type: 'text',
    required: true,
    validation: { min: 1, max: 255 },
    displayInTable: true,
    displayInForm: true,
    displayInCard: true,
    formOrder: 1,
    tableOrder: 1,
    placeholder: 'Wprowadź nazwę wina',
    group: 'basic'
  },
  {
    key: 'producer',
    label: 'Producent',
    type: 'text',
    required: false,
    validation: { max: 255 },
    displayInTable: true,
    displayInForm: true,
    displayInCard: true,
    formOrder: 2,
    tableOrder: 2,
    placeholder: 'Wprowadź nazwę producenta',
    group: 'basic'
  },
  {
    key: 'year',
    label: 'Rocznik',
    type: 'number',
    required: false,
    validation: { min: 1800, max: 2100 },
    displayInTable: true,
    displayInForm: true,
    displayInCard: true,
    formOrder: 3,
    tableOrder: 3,
    placeholder: 'YYYY',
    group: 'basic'
  },
  {
    key: 'country',
    label: 'Kraj',
    type: 'text',
    required: false,
    validation: { max: 100 },
    displayInTable: false,
    displayInForm: true,
    displayInCard: true,
    formOrder: 4,
    placeholder: 'Wprowadź kraj pochodzenia',
    group: 'basic'
  },
  {
    key: 'region',
    label: 'Region',
    type: 'text',
    required: false,
    validation: { max: 100 },
    displayInTable: false,
    displayInForm: true,
    displayInCard: true,
    formOrder: 5,
    placeholder: 'Wprowadź region',
    group: 'basic'
  },

  // Category & Type
  {
    key: 'category',
    label: 'Kategoria',
    type: 'select',
    required: false,
    validation: { 
      options: ['Czerwone', 'Białe', 'Różowe', 'Musujące', 'Deserowe', 'Fortyfikowane'] 
    },
    displayInTable: true,
    displayInForm: true,
    displayInCard: true,
    formOrder: 6,
    tableOrder: 4,
    group: 'details'
  },
  {
    key: 'type',
    label: 'Typ',
    type: 'text',
    required: false,
    validation: { max: 50 },
    displayInTable: false,
    displayInForm: true,
    displayInCard: false,
    formOrder: 7,
    placeholder: 'np. Wytrawne, Półwytrawne',
    group: 'details'
  },
  {
    key: 'variety',
    label: 'Odmiany winorośli',
    type: 'text',
    required: false,
    validation: { max: 255 },
    displayInTable: false,
    displayInForm: true,
    displayInCard: true,
    formOrder: 8,
    placeholder: 'np. Chardonnay, Cabernet Sauvignon',
    group: 'details'
  },

  // Technical Details
  {
    key: 'vol',
    label: 'Pojemność',
    type: 'text',
    required: false,
    validation: { max: 20 },
    displayInTable: false,
    displayInForm: true,
    displayInCard: false,
    formOrder: 9,
    placeholder: 'np. 750ml',
    group: 'technical'
  },
  {
    key: 'alcohol',
    label: 'Zawartość alkoholu',
    type: 'text',
    required: false,
    validation: { max: 20 },
    displayInTable: false,
    displayInForm: true,
    displayInCard: false,
    formOrder: 10,
    placeholder: 'np. 13.5%',
    group: 'technical'
  },
  {
    key: 'abv',
    label: 'ABV (%)',
    type: 'number',
    required: false,
    validation: { min: 0, max: 50 },
    displayInTable: true,
    displayInForm: true,
    displayInCard: true,
    formOrder: 10.5,
    tableOrder: 6,
    placeholder: 'np. 13.5',
    group: 'technical'
  },

  // Price & Commercial
  {
    key: 'price',
    label: 'Cena',
    type: 'number',
    required: false,
    validation: { min: 0 },
    displayInTable: true,
    displayInForm: true,
    displayInCard: true,
    formOrder: 11,
    tableOrder: 5,
    placeholder: 'Wprowadź cenę',
    group: 'basic'
  },
  {
    key: 'catalogNumber',
    label: 'Numer katalogowy',
    type: 'text',
    required: false,
    validation: { max: 20 },
    displayInTable: false,
    displayInForm: true,
    displayInCard: false,
    formOrder: 12,
    placeholder: 'Wprowadź numer katalogowy',
    group: 'technical'
  },

  // Media & Description
  {
    key: 'image',
    label: 'Obraz',
    type: 'url',
    required: false,
    validation: { max: 255 },
    displayInTable: false,
    displayInForm: true,
    displayInCard: false,
    formOrder: 13,
    placeholder: 'URL do obrazu lub ścieżka do pliku',
    group: 'basic'
  },
  {
    key: 'description',
    label: 'Opis',
    type: 'textarea',
    required: false,
    validation: { max: 2000 },
    displayInTable: false,
    displayInForm: true,
    displayInCard: true,
    formOrder: 14,
    placeholder: 'Wprowadź opis wina',
    group: 'details'
  },

  // System Fields (readonly)
  {
    key: 'id',
    label: 'ID',
    type: 'readonly',
    required: true,
    displayInTable: false,
    displayInForm: false,
    displayInCard: false,
    group: 'system'
  },
  {
    key: 'createdAt',
    label: 'Data utworzenia',
    type: 'readonly',
    required: true,
    displayInTable: false,
    displayInForm: false,
    displayInCard: false,
    group: 'system'
  },
  {
    key: 'updatedAt',
    label: 'Data aktualizacji',
    type: 'readonly',
    required: true,
    displayInTable: false,
    displayInForm: false,
    displayInCard: false,
    group: 'system'
  }
];

// Helper functions
export const getFieldConfig = (key: string): WineFieldConfig | undefined => {
  return WINE_FIELDS.find(field => field.key === key);
};

export const getFormFields = (): WineFieldConfig[] => {
  return WINE_FIELDS
    .filter(field => field.displayInForm)
    .sort((a, b) => (a.formOrder || 999) - (b.formOrder || 999));
};

export const getTableFields = (): WineFieldConfig[] => {
  return WINE_FIELDS
    .filter(field => field.displayInTable)
    .sort((a, b) => (a.tableOrder || 999) - (b.tableOrder || 999));
};

export const getCardFields = (): WineFieldConfig[] => {
  return WINE_FIELDS.filter(field => field.displayInCard);
};

export const getRequiredFields = (): WineFieldConfig[] => {
  return WINE_FIELDS.filter(field => field.required);
};

export const getFieldsByGroup = (group: string): WineFieldConfig[] => {
  return WINE_FIELDS.filter(field => field.group === group);
};

export const getValidationSchema = () => {
  const schema: any = {};
  
  WINE_FIELDS.forEach(field => {
    if (field.group === 'system') return;
    
    let fieldSchema: any;
    
    switch (field.type) {
      case 'number':
        fieldSchema = {
          type: 'number',
          min: field.validation?.min,
          max: field.validation?.max,
          required: field.required
        };
        break;
      case 'select':
        fieldSchema = {
          type: 'string',
          enum: field.validation?.options,
          required: field.required
        };
        break;
      case 'textarea':
      case 'text':
      case 'url':
      default:
        fieldSchema = {
          type: 'string',
          minLength: field.validation?.min,
          maxLength: field.validation?.max,
          pattern: field.validation?.pattern,
          required: field.required
        };
        break;
    }
    
    schema[field.key] = fieldSchema;
  });
  
  return schema;
};