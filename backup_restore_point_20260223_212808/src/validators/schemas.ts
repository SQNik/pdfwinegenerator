import Joi from 'joi';
import { Wine } from '../types';
import { WINE_FIELDS, WineFieldConfig } from '../config/wine-fields';

// Dynamic wine schema generator based on field configuration
const generateWineSchema = (): Joi.ObjectSchema<Wine> => {
  const schemaFields: Record<string, Joi.Schema> = {};
  
  WINE_FIELDS.forEach((field: WineFieldConfig) => {
    let joiField: Joi.Schema;
    
    switch (field.type) {
      case 'number':
        joiField = Joi.number();
        if (field.validation?.min !== undefined) {
          joiField = (joiField as Joi.NumberSchema).min(field.validation.min);
        }
        if (field.validation?.max !== undefined) {
          joiField = (joiField as Joi.NumberSchema).max(field.validation.max);
        }
        joiField = joiField.allow(null);
        break;
        
      case 'select':
        joiField = Joi.string();
        if (field.validation?.options) {
          joiField = (joiField as Joi.StringSchema).valid(...field.validation.options);
        }
        joiField = joiField.allow('');
        break;
        
      case 'textarea':
      case 'text':
      case 'url':
        joiField = Joi.string();
        if (field.validation?.min !== undefined) {
          joiField = (joiField as Joi.StringSchema).min(field.validation.min);
        }
        if (field.validation?.max !== undefined) {
          joiField = (joiField as Joi.StringSchema).max(field.validation.max);
        }
        if (field.validation?.pattern) {
          joiField = (joiField as Joi.StringSchema).pattern(new RegExp(field.validation.pattern));
        }
        joiField = joiField.allow('');
        break;
        
      case 'readonly':
        if (field.key === 'id') {
          joiField = Joi.string().required();
        } else {
          joiField = Joi.string().isoDate().required();
        }
        break;
        
      default:
        joiField = Joi.string().allow('');
        break;
    }
    
    // Apply required constraint
    if (field.required && field.type !== 'readonly') {
      if (field.type === 'number') {
        joiField = joiField.required();
      } else {
        joiField = (joiField as Joi.StringSchema).min(1).required();
      }
    }
    
    schemaFields[field.key] = joiField;
  });
  
  return Joi.object<Wine>(schemaFields);
};

export const wineSchema = generateWineSchema();

export const wineCreateSchema = wineSchema.fork(['id', 'createdAt', 'updatedAt'], (schema) => 
  schema.optional()
);

export const wineUpdateSchema = wineSchema.fork(
  ['id', 'createdAt', 'updatedAt', 'name'], 
  (schema) => schema.optional()
);

export const importSchema = Joi.object({
  url: Joi.string().uri().required(),
  clearBefore: Joi.boolean().optional(),
  validateFields: Joi.boolean().optional(),
});

// Collection schemas
export const collectionFieldSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(1).max(100).required(),
  type: Joi.string().valid('text', 'number', 'boolean', 'date', 'select', 'textarea', 'url', 'email').required(),
  required: Joi.boolean().default(false),
  defaultValue: Joi.any(),
  options: Joi.array().items(Joi.string()).when('type', {
    is: 'select',
    then: Joi.required(),
    otherwise: Joi.forbidden()
  }),
  validation: Joi.object({
    min: Joi.number(),
    max: Joi.number(),
    pattern: Joi.string(),
    message: Joi.string() // Custom validation message
  }).optional(),
  displayOrder: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().default(true),
  helpText: Joi.string().max(500).allow('', null).optional(),
  placeholder: Joi.string().max(100).allow('', null).optional(),
  createdAt: Joi.string().isoDate().required(),
  updatedAt: Joi.string().isoDate().required()
});

export const collectionSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow('').optional(),
  wines: Joi.array().items(Joi.string()).default([]),
  tags: Joi.array().items(Joi.string()).default([]),
  status: Joi.string().valid('active', 'archived', 'draft').default('active'),
  dynamicFields: Joi.object().pattern(Joi.string(), Joi.any()).default({}),
  metadata: Joi.object().pattern(Joi.string(), Joi.any()).default({}),
  coverImage: Joi.string().allow('', null).optional(), // URL/path to cover image
  createdAt: Joi.string().isoDate().required(),
  updatedAt: Joi.string().isoDate().required()
});

export const collectionCreateSchema = collectionSchema.fork(['id', 'createdAt', 'updatedAt'], (schema) => 
  schema.optional()
);

export const collectionUpdateSchema = collectionSchema.fork(
  ['id', 'createdAt', 'updatedAt', 'name'], 
  (schema) => schema.optional()
);

export const collectionFieldCreateSchema = collectionFieldSchema.fork(['id', 'createdAt', 'updatedAt'], (schema) => 
  schema.optional()
);

export const collectionFieldUpdateSchema = collectionFieldSchema.fork(
  ['id', 'createdAt', 'updatedAt', 'name', 'type'], 
  (schema) => schema.optional()
);

// PDF Generator Schemas
export const pdfMarginsSchema = Joi.object({
  top: Joi.number().min(0).required(),
  right: Joi.number().min(0).required(),
  bottom: Joi.number().min(0).required(),
  left: Joi.number().min(0).required(),
  unit: Joi.string().valid('mm', 'in', 'px').default('mm')
});

export const pdfPageFormatSchema = Joi.object({
  name: Joi.string().required(),
  width: Joi.number().min(1).required(),
  height: Joi.number().min(1).required(),
  unit: Joi.string().valid('mm', 'in', 'px').default('mm')
});

export const pdfPrintSettingsSchema = Joi.object({
  margins: pdfMarginsSchema.required(),
  bleed: Joi.number().min(0).default(3),
  colorMode: Joi.string().valid('rgb', 'cmyk').default('rgb'),
  dpi: Joi.number().valid(300).default(300),
  format: pdfPageFormatSchema.required()
});

export const pdfElementBaseSchema = Joi.object({
  id: Joi.string().required(),
  type: Joi.string().valid('text', 'image', 'container', 'product-field').required(),
  x: Joi.number().min(0).required(),
  y: Joi.number().min(0).required(),
  width: Joi.number().min(1).required(),
  height: Joi.number().min(1).required(),
  zIndex: Joi.number().integer().default(1),
  visible: Joi.boolean().default(true),
  locked: Joi.boolean().default(false),
  properties: Joi.object().required(),
  children: Joi.array().items(Joi.link('#element')).default([])
});

export const pdfTextElementSchema = pdfElementBaseSchema.keys({
  type: Joi.string().valid('text').required(),
  properties: Joi.object({
    content: Joi.string().default(''),
    fontSize: Joi.number().min(6).max(72).default(12),
    fontFamily: Joi.string().default('Arial'),
    fontWeight: Joi.string().valid('normal', 'bold', 'lighter').default('normal'),
    fontStyle: Joi.string().valid('normal', 'italic').default('normal'),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
    textAlign: Joi.string().valid('left', 'center', 'right', 'justify').default('left'),
    lineHeight: Joi.number().min(0.5).max(3).default(1.2),
    letterSpacing: Joi.number().min(-2).max(10).default(0)
  }).required()
});

export const pdfImageElementSchema = pdfElementBaseSchema.keys({
  type: Joi.string().valid('image').required(),
  properties: Joi.object({
    src: Joi.string().uri().required(),
    alt: Joi.string().default(''),
    objectFit: Joi.string().valid('cover', 'contain', 'fill', 'scale-down').default('cover'),
    borderRadius: Joi.number().min(0).default(0),
    opacity: Joi.number().min(0).max(1).default(1)
  }).required()
});

export const pdfContainerElementSchema = pdfElementBaseSchema.keys({
  type: Joi.string().valid('container').required(),
  properties: Joi.object({
    backgroundColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
    borderColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
    borderWidth: Joi.number().min(0).default(0),
    borderRadius: Joi.number().min(0).default(0),
    padding: pdfMarginsSchema.default({ top: 0, right: 0, bottom: 0, left: 0, unit: 'mm' }),
    display: Joi.string().valid('block', 'flex', 'grid').default('block'),
    flexDirection: Joi.string().valid('row', 'column').when('display', { is: 'flex', then: Joi.string().valid('row', 'column').default('row') }),
    justifyContent: Joi.string().valid('flex-start', 'center', 'flex-end', 'space-between', 'space-around').when('display', { is: 'flex', then: Joi.string().valid('flex-start', 'center', 'flex-end', 'space-between', 'space-around').default('flex-start') }),
    alignItems: Joi.string().valid('flex-start', 'center', 'flex-end', 'stretch').when('display', { is: 'flex', then: Joi.string().valid('flex-start', 'center', 'flex-end', 'stretch').default('flex-start') }),
    gap: Joi.number().min(0).when('display', { is: Joi.valid('flex', 'grid'), then: Joi.number().min(0).default(0) }),
    gridColumns: Joi.number().min(1).when('display', { is: 'grid', then: Joi.number().min(1).default(1) }),
    gridRows: Joi.number().min(1).when('display', { is: 'grid', then: Joi.number().min(1).default(1) })
  }).required()
});

export const pdfProductFieldElementSchema = pdfElementBaseSchema.keys({
  type: Joi.string().valid('product-field').required(),
  properties: Joi.object({
    fieldName: Joi.string().required(),
    fontSize: Joi.number().min(6).max(72).default(12),
    fontFamily: Joi.string().default('Arial'),
    color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
    textAlign: Joi.string().valid('left', 'center', 'right').default('left'),
    format: Joi.string().allow('').default('')
  }).required()
});

export const pdfElementSchema = Joi.alternatives().try(
  pdfTextElementSchema,
  pdfImageElementSchema,
  pdfContainerElementSchema,
  pdfProductFieldElementSchema
);

export const pdfProductLayoutSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(1).max(100).required(),
  width: Joi.number().min(1).required(),
  height: Joi.number().min(1).required(),
  elements: Joi.array().items(pdfElementSchema).default([]),
  createdAt: Joi.string().isoDate(),
  updatedAt: Joi.string().isoDate()
});

export const pdfSectionSchema = Joi.object({
  enabled: Joi.boolean().default(true),
  backgroundColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#FFFFFF'),
  backgroundImage: Joi.string().uri().allow(''),
  elements: Joi.array().items(pdfElementSchema).default([])
});

export const pdfTemplateSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow(''),
  printSettings: pdfPrintSettingsSchema.required(),
  sections: Joi.object({
    front: pdfSectionSchema.required(),
    content: pdfSectionSchema.keys({
      productLayout: pdfProductLayoutSchema.required(),
      groupByCategory: Joi.boolean().default(false),
      categoryHeaderEnabled: Joi.boolean().default(true),
      categoryHeaderStyle: Joi.object({
        content: Joi.string().default(''),
        fontSize: Joi.number().min(6).max(72).default(16),
        fontFamily: Joi.string().default('Arial'),
        fontWeight: Joi.string().valid('normal', 'bold', 'lighter').default('bold'),
        fontStyle: Joi.string().valid('normal', 'italic').default('normal'),
        color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#000000'),
        textAlign: Joi.string().valid('left', 'center', 'right', 'justify').default('left'),
        lineHeight: Joi.number().min(0.5).max(3).default(1.2),
        letterSpacing: Joi.number().min(-2).max(10).default(0)
      }).default({
        content: '',
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'bold',
        fontStyle: 'normal',
        color: '#000000',
        textAlign: 'left',
        lineHeight: 1.2,
        letterSpacing: 0
      }),
      previewCollectionId: Joi.string().optional()
      // ✅ USUNIĘTO: Duplikujące się właściwości layoutu produktów
      // Te właściwości są teraz zarządzane przez ProductListLayoutConfig
      // w elementach product-list i domyślnych wartościach systemowych
    }).required(),
    back: pdfSectionSchema.required()
  }).required(),
  createdAt: Joi.string().isoDate(),
  updatedAt: Joi.string().isoDate()
});

export const pdfGenerationJobSchema = Joi.object({
  id: Joi.string().required(),
  collectionId: Joi.string().required(),
  templateId: Joi.string().required(),
  status: Joi.string().valid('pending', 'processing', 'completed', 'failed').default('pending'),
  progress: Joi.number().min(0).max(100).default(0),
  filePath: Joi.string().allow(''),
  error: Joi.string().allow(''),
  createdAt: Joi.string().isoDate(),
  updatedAt: Joi.string().isoDate()
});

// Create/Update schemas
export const pdfTemplateCreateSchema = pdfTemplateSchema.fork(['id', 'createdAt', 'updatedAt'], (schema) => schema.optional());
export const pdfTemplateUpdateSchema = pdfTemplateSchema.fork(['id', 'createdAt', 'updatedAt', 'name'], (schema) => schema.optional());

export const pdfProductLayoutCreateSchema = pdfProductLayoutSchema.fork(['id', 'createdAt', 'updatedAt'], (schema) => schema.optional());
export const pdfProductLayoutUpdateSchema = pdfProductLayoutSchema.fork(['id', 'createdAt', 'updatedAt', 'name'], (schema) => schema.optional());

// Custom PDF Format schemas
export const customPDFFormatSchema = Joi.object({
  id: Joi.string().required(),
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow('').optional(),
  width: Joi.number().positive().required(),
  height: Joi.number().positive().required(),
  unit: Joi.string().valid('mm', 'cm', 'in', 'pt', 'px').default('mm'),
  orientation: Joi.string().valid('portrait', 'landscape').default('portrait'),
  margins: Joi.object({
    top: Joi.number().min(0).required(),
    right: Joi.number().min(0).required(),
    bottom: Joi.number().min(0).required(),
    left: Joi.number().min(0).required()
  }).required(),
  isActive: Joi.boolean().default(true),
  createdAt: Joi.date().iso(),
  updatedAt: Joi.date().iso()
});

export const customPDFFormatCreateSchema = customPDFFormatSchema.fork(['id', 'createdAt', 'updatedAt'], (schema) => schema.optional());
export const customPDFFormatUpdateSchema = customPDFFormatSchema.fork(['id', 'createdAt', 'updatedAt', 'name'], (schema) => schema.optional());