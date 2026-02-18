export interface Wine {
  id: string; // 🔧 Techniczny identyfikator systemowy (UUID) - używany wewnętrznie
  catalogNumber: string; // 🏷️ UNIKALNY BIZNESOWY IDENTYFIKATOR - używany w referencjach, eksportach, PDF
  name: string;
  description?: string;
  type?: string;
  category?: string;
  variety?: string;
  region?: string;
  alcohol?: string;
  abv?: number; // Nowe pole - zawartość alkoholu w %
  price1?: string;
  price2?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'url' | 'file';
  group?: string;
  placeholder?: string;
  validation?: {
    min?: string | number;
    max?: string | number;
    step?: number;
    pattern?: string;
  };
  options?: string[];
  formOrder?: number;
  tableOrder?: number;
  displayInTable?: boolean;
  displayInForm?: boolean;
  displayInCards?: boolean;
  required?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  isSystemField?: boolean; // 🔒 Pole systemowe - nie można usunąć
  accept?: string; // dla typu file
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: ValidationError[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ImportResult {
  imported: number;
  errors: Array<{
    row: Record<string, unknown>;
    error: string;
  }>;
  warnings?: string[]; // 🔄 Ostrzeżenia dotyczące synchronizacji pól
}

// Collection interfaces
export interface CollectionField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'boolean' | 'date' | 'select' | 'textarea' | 'url' | 'email';
  required?: boolean;
  defaultValue?: unknown;
  options?: string[]; // For select type
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string; // Custom validation message
  };
  displayOrder?: number;
  isActive?: boolean;
  helpText?: string;
  placeholder?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string; // 🔧 Techniczny identyfikator kolekcji
  name: string;
  description?: string;
  wines: string[]; // 🏷️ Array of wine CATALOG NUMBERS (biznesowe identyfikatory)
  tags?: string[];
  status: 'active' | 'archived' | 'draft';
  coverImage?: string; // URL/path to cover image
  dynamicFields: Record<string, unknown>; // Dynamic field values
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  lastGeneratedPdf?: {
    url: string;
    filename: string;
    templateId: string;
    templateName: string;
    generatedAt: string;
  };
}

// PDF Generator Types
export interface PDFPageFormat {
  name: string;
  width: number;
  height: number;
  unit: 'mm' | 'in' | 'px';
}

export interface PDFMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: 'mm' | 'in' | 'px';
}

export interface PDFPrintSettings {
  margins: PDFMargins;
  bleed: number; // pole ochronne
  colorMode: 'rgb' | 'cmyk';
  dpi: number;
  format: PDFPageFormat;
}

export interface PDFElement {
  id: string;
  type: 'text' | 'image' | 'container' | 'product-field';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  properties: Record<string, any>;
  children?: PDFElement[];
}

export interface PDFTextElement extends PDFElement {
  type: 'text';
  properties: {
    content: string;
    fontSize: number;
    fontFamily: string;
    fontWeight: 'normal' | 'bold' | 'lighter';
    fontStyle: 'normal' | 'italic';
    color: string;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    lineHeight: number;
    letterSpacing: number;
  };
}

export interface PDFImageElement extends PDFElement {
  type: 'image';
  properties: {
    src: string;
    alt: string;
    objectFit: 'cover' | 'contain' | 'fill' | 'scale-down';
    borderRadius: number;
    opacity: number;
  };
}

export interface PDFContainerElement extends PDFElement {
  type: 'container';
  properties: {
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    padding: PDFMargins;
    display: 'block' | 'flex' | 'grid';
    flexDirection?: 'row' | 'column';
    justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    gap?: number;
    gridColumns?: number;
    gridRows?: number;
  };
}

export interface PDFProductFieldElement extends PDFElement {
  type: 'product-field';
  properties: {
    fieldName: string; // np. 'name', 'price', 'image'
    fontSize: number;
    fontFamily: string;
    color: string;
    textAlign: 'left' | 'center' | 'right';
    format?: string; // dla formatowania cen, dat itp.
  };
}

export interface PDFProductLayout {
  id: string;
  name: string;
  width: number;
  height: number;
  elements: PDFElement[];
  createdAt: string;
  updatedAt: string;
}

export interface PDFSection {
  enabled: boolean;
  backgroundColor: string;
  backgroundType?: 'color' | 'image' | 'none'; // Typ tła: kolor, obraz lub brak
  backgroundImage?: string;
  elements: PDFElement[];
}

export interface PDFTemplate {
  id: string;
  name: string;
  description?: string;
  htmlContent?: string; // 🎨 HTML template content (for new HTML-based templates)
  printSettings: PDFPrintSettings;
  pdfSettings?: {
    format?: string; // 'A4', 'A5', 'Letter', lub ID custom formatu
    customFormat?: CustomPDFFormat; // Niestandardowy format
    margins?: {
      top?: string;    // np. '10mm', '0.5in'
      right?: string;
      bottom?: string;
      left?: string;
    };
    orientation?: 'portrait' | 'landscape';
    printBackground?: boolean;
  };
  sections: {
    front: PDFSection;
    content: PDFSection & {
      productLayout: PDFProductLayout;
      groupByCategory: boolean;
      categoryHeaderEnabled: boolean;
      categoryHeaderStyle: PDFTextElement['properties'];
      // 🎯 Podgląd z wybraną kolekcją
      previewCollectionId?: string; // ID kolekcji używanej do podglądu zawartości
      // 🚫 USUNIĘTO: Duplikujące się właściwości layoutu produktów
      // Te właściwości są teraz zarządzane przez ProductListLayoutConfig
      // w elementach product-list i domyślne wartości systemowe
    };
    back: PDFSection;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PDFGenerationJob {
  id: string;
  collectionId: string;
  templateId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  filePath?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionWithWines extends Omit<Collection, 'wines'> {
  wines: Wine[]; // 🏷️ Full wine objects (resolved from catalog numbers)
}

export interface CollectionCreate {
  name: string;
  description?: string;
  wines?: string[]; // 🏷️ Array of wine catalog numbers
  tags?: string[];
  status?: 'active' | 'archived' | 'draft';
  dynamicFields?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface CollectionUpdate {
  name?: string;
  description?: string;
  wines?: string[]; // 🏷️ Array of wine catalog numbers
  tags?: string[];
  status?: 'active' | 'archived' | 'draft';
  dynamicFields?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// 🎯 SINGLE SOURCE OF TRUTH - Product List Layout Configuration
export interface ProductListLayoutConfig {
  columns: number;                    // ✅ Zunifikowane: columnsCount → columns
  rowsPerPage: number;               // ✅ Zunifikowane: productsPerPage → rowsPerPage
  displayMode: 'columns' | 'grid' | 'list' | 'cards';
  itemSpacing: number;               // Odstęp między elementami w points
  showImages: boolean;               // ✅ Zunifikowane: showProductImages → showImages
  showPrices: boolean;               // ✅ Zunifikowane: showProductPrices → showPrices
  showDescriptions: boolean;         // ✅ Zunifikowane: showProductDescriptions → showDescriptions
  displayFields?: string[];          // 🆕 DYNAMIC: Pola wine do wyświetlenia (np. ['name', 'catalogNumber', 'type', 'category'])
  
  // Opcjonalne style properties
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
  headerText?: string;
  showHeader?: boolean;
  headerFontSize?: number;
  headerColor?: string;
}

// HTML Template Editor Types
export interface HTMLTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  htmlContent: string;
  cssContent?: string;
  jsContent?: string;
  thumbnailUrl?: string;
  placeholders: TemplatePlaceholder[];
  sampleData?: Record<string, any>;
  isPublic: boolean;
  tags: string[];
  version: string;
  status: 'draft' | 'active' | 'archived';
  metadata?: Record<string, any>;
  pdfSettings?: {
    format?: string; // 'A4', 'A5', 'Letter', lub ID custom formatu
    customFormat?: CustomPDFFormat; // Niestandardowy format
    margins?: {
      top?: string;    // np. '10mm', '0.5in'
      right?: string;
      bottom?: string;
      left?: string;
    };
    orientation?: 'portrait' | 'landscape';
    printBackground?: boolean;
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface TemplatePlaceholder {
  id: string;
  name: string; // np. "wine.name", "wine.price1"
  label: string; // np. "Nazwa wina", "Cena"
  type: 'text' | 'number' | 'date' | 'boolean' | 'image' | 'html';
  required: boolean;
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    format?: string; // np. "currency", "date"
  };
  description?: string;
  group?: string; // np. "basic", "pricing", "details"
}

export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  displayOrder: number;
  isActive: boolean;
  parentId?: string; // dla hierarchii kategorii
  createdAt: string;
  updatedAt: string;
}

// Custom PDF Format Types
export interface CustomPDFFormat {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  unit: 'mm' | 'in' | 'px';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  orientation: 'portrait' | 'landscape';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomPDFFormatCreate {
  name: string;
  description?: string;
  width: number;
  height: number;
  unit: 'mm' | 'in' | 'px';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  orientation: 'portrait' | 'landscape';
  isActive: boolean;
}

export interface CustomPDFFormatUpdate {
  name?: string;
  description?: string;
  width?: number;
  height?: number;
  unit?: 'mm' | 'in' | 'px';
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  orientation?: 'portrait' | 'landscape';
  isActive?: boolean;
}

export interface HTMLTemplatePreview {
  templateId: string;
  wineData?: Wine;
  format: string; // Changed to accept custom format IDs
  customFormat?: CustomPDFFormat; // Optional custom format definition
  options?: {
    printBackground?: boolean;
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
  };
}

export interface HTMLTemplateCreate {
  name: string;
  description?: string;
  category: string;
  htmlContent: string;
  cssContent?: string;
  jsContent?: string;
  thumbnailUrl?: string;
  sampleData?: Record<string, any>;
  isPublic?: boolean;
  tags?: string[];
  status?: 'draft' | 'active' | 'archived';
  metadata?: Record<string, any>;
  pdfSettings?: {
    format?: string; // 'A4', 'A5', 'Letter', lub ID custom formatu
    customFormat?: CustomPDFFormat; // Niestandardowy format
    margins?: {
      top?: string;    // np. '10mm', '0.5in'
      right?: string;
      bottom?: string;
      left?: string;
    };
    orientation?: 'portrait' | 'landscape';
    printBackground?: boolean;
  };
}

export interface HTMLTemplateUpdate {
  name?: string;
  description?: string;
  category?: string;
  htmlContent?: string;
  cssContent?: string;
  jsContent?: string;
  thumbnailUrl?: string;
  placeholders?: TemplatePlaceholder[];
  sampleData?: Record<string, any>;
  isPublic?: boolean;
  tags?: string[];
  status?: 'draft' | 'active' | 'archived';
  metadata?: Record<string, any>;
  pdfSettings?: {
    format?: string; // 'A4', 'A5', 'Letter', lub ID custom formatu
    customFormat?: CustomPDFFormat; // Niestandardowy format
    margins?: {
      top?: string;    // np. '10mm', '0.5in'
      right?: string;
      bottom?: string;
      left?: string;
    };
    orientation?: 'portrait' | 'landscape';
    printBackground?: boolean;
  };
}

export interface TemplateFieldMapping {
  placeholderName: string; // {{wine.name}}
  wineField: string; // name
  label: string; // "Nazwa wina"
  type: 'text' | 'number' | 'date' | 'boolean' | 'image' | 'html';
  required: boolean;
  format?: string;
}