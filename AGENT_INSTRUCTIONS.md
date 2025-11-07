# Agent Instructions - Wine Management System with PDF Template Editor

## Project Overview

**Project Name**: Wine Management System  
**Version**: 2.0.0  
**Type**: TypeScript/Express backend with modular frontend  
**Primary Features**: Wine catalog management with advanced PDF template editor  

## Architecture & Technology Stack

### Backend Stack
- **Runtime**: Node.js with TypeScript (ES2020, strict mode)
- **Framework**: Express.js with middleware (helmet, cors, compression)
- **PDF Generation**: pdf-lib library with custom coordinate conversion
- **Logging**: Winston with structured logging
- **Development**: ts-node-dev with hot reload
- **File Handling**: Multer for uploads, fs/promises for file operations

### Frontend Stack
- **UI Framework**: Bootstrap 5 with FontAwesome icons
- **Architecture**: Modular JavaScript components
- **Editor**: Canvas-based drag & drop PDF template editor
- **API Communication**: Fetch API with structured error handling

### Key Dependencies
```json
{
  "pdf-lib": "^1.17.1",     // PDF generation and manipulation
  "winston": "^3.10.0",     // Structured logging
  "express": "^4.18.2",     // Web framework
  "canvas": "^3.2.0",       // Server-side canvas rendering
  "uuid": "^9.0.0"          // Unique ID generation
}
```

## Project Structure

```
src/
├── server.ts              // Main application entry point
├── app.ts                 // Express app configuration
├── services/
│   ├── pdfService.ts      // PDF generation core service
│   └── dataStore.ts       // Data persistence layer
├── types/
│   └── index.ts           // TypeScript type definitions
├── utils/
│   ├── logger.ts          // Winston logger configuration
│   └── helpers.ts         // Utility functions
├── controllers/           // Route controllers
├── routes/                // Express route definitions
├── middleware/            // Custom middleware
└── validators/            // Input validation schemas

public/
├── pdf-editor.html        // Main PDF template editor interface
├── js/
│   ├── components/
│   │   ├── pdfEditor.js   // Core editor functionality
│   │   └── pdfTemplates.js // Template management
│   ├── api.js             // API communication layer
│   └── utils.js           // Frontend utilities
├── css/
│   └── style.css          // Application styles
└── images/                // Static assets

data/
├── templates.json         // PDF template storage
├── wines.json             // Wine data storage
└── collections.json       // Wine collection data

pdf-output/                // Generated PDF files
```

## TypeScript Configuration

The project uses strict TypeScript configuration with the following key settings:
- **Target**: ES2020 with commonjs modules
- **Strict Mode**: Enabled with additional safety checks
- **Declaration Maps**: For debugging and development
- **No Implicit Any**: Enforced type safety

```json
{
  "strict": true,
  "noImplicitAny": true,
  "noImplicitReturns": true,
  "noFallthroughCasesInSwitch": true,
  "noUncheckedIndexedAccess": true,
  "exactOptionalPropertyTypes": true
}
```

## Core Type Definitions

### Wine Interface
```typescript
interface Wine {
  id: string;
  catalogNumber: string;
  name: string;
  producer?: string;
  description?: string;
  type?: string;
  category?: string;
  variety?: string;
  region?: string;
  country?: string;
  year?: number;
  vol?: string;
  alcohol?: string;
  abv?: number;
  price?: number;
  price1?: string;
  price2?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}
```

### API Response Pattern
```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: ValidationError[];
}
```

## Core Components

### 1. PDF Service (`src/services/pdfService.ts`)

**Purpose**: Core PDF generation with multi-element support

**Key Methods**:
- `generatePreviewPDF()` - Creates preview with sample data
- `renderElement()` - Handles text/rectangle/image elements
- `convertCanvasCoordinatesToPDF()` - Coordinate system conversion
- `renderText()`, `renderRectangle()`, `renderImage()` - Element-specific rendering

**Critical Patterns**:
```typescript
// Color normalization for pdf-lib (MUST use 0-1 range)
const color = this.hexToRgb(hexColor);
rgb(color.r / 255, color.g / 255, color.b / 255)

// Coordinate conversion from canvas pixels to PDF points
const pdfCoords = this.convertCanvasCoordinatesToPDF(element, template);

// Structured logging for debugging
logger.info('PDFService: Operation description', { data });
```

### 2. PDF Editor (`public/js/components/pdfEditor.js`)

**Purpose**: Interactive visual template editor

**Key Features**:
- Drag & drop element placement
- Real-time property editing
- Section-based template management (front/content/back)
- Element centering and alignment tools
- Background color/image settings per section

**Critical Patterns**:
```javascript
// Element creation with required properties
const newElement = {
    id: this.generateId(),
    type: elementType,
    x: canvasX, y: canvasY,
    width: defaultWidth, height: defaultHeight,
    zIndex: this.getNextZIndex(),
    // Type-specific properties...
};

// Canvas coordinate calculations
const rect = canvas.getBoundingClientRect();
const canvasX = (event.clientX - rect.left) / this.zoom;
const canvasY = (event.clientY - rect.top) / this.zoom;

// Template saving with modification tracking
this.markAsModified();
await this.saveTemplate();
```

### 3. Template Structure

**JSON Schema**:
```json
{
  "id": "uuid",
  "name": "Template Name",
  "description": "Description",
  "printSettings": {
    "format": { "name": "A4", "width": 210, "height": 297, "unit": "mm" },
    "dpi": 300,
    "colorMode": "cmyk",
    "margins": { "top": 20, "right": 20, "bottom": 20, "left": 20, "unit": "mm" }
  },
  "sections": {
    "front": {
      "enabled": true,
      "backgroundColor": "#ffffff",
      "backgroundImage": "",
      "backgroundSize": "cover",
      "elements": []
    },
    "content": { /* similar structure */ },
    "back": { /* similar structure */ }
  }
}
```

**Element Types**:
- **Text**: `content`, `fontSize`, `fontFamily`, `color`, `textAlign`
- **Rectangle**: `backgroundColor`, `borderWidth`, `borderColor`
- **Image**: `src`, `objectFit`
- **Common**: `id`, `type`, `x`, `y`, `width`, `height`, `zIndex`

## Development Guidelines

### 1. Code Organization

**TypeScript Backend**:
- Use strict typing with interfaces from `src/types/index.ts`
- Implement proper error handling with try-catch
- Use structured logging with Winston
- Follow async/await patterns
- Validate input data with appropriate checks
- Use exact optional property types for better type safety

**Frontend JavaScript**:
- Use class-based component architecture
- Implement proper event binding and cleanup
- Use consistent naming conventions (camelCase)
- Handle API errors gracefully
- Maintain separation between UI and business logic

### 2. Naming Conventions

**Files**: kebab-case (`pdf-editor.html`, `wine-fields.js`)  
**Classes**: PascalCase (`PDFService`, `DataStore`)  
**Methods/Variables**: camelCase (`renderElement`, `currentSection`)  
**Constants**: UPPER_SNAKE_CASE (`DEFAULT_DPI`, `MAX_FILE_SIZE`)  
**CSS Classes**: kebab-case (`section-tab`, `property-group`)  

### 3. Error Handling Patterns

**Backend**:
```typescript
try {
  logger.info('Operation starting', { context });
  const result = await performOperation();
  logger.info('Operation completed successfully');
  return result;
} catch (error) {
  logger.error('Operation failed:', error);
  throw new Error(`Specific error description: ${error.message}`);
}
```

**Frontend**:
```javascript
try {
  const response = await api.get('/endpoint');
  if (response.success) {
    this.handleSuccess(response.data);
  } else {
    throw new Error(response.error);
  }
} catch (error) {
  console.error('Operation failed:', error);
  this.showAlert(`Error: ${error.message}`, 'danger');
}
```

### 4. API Patterns

**Response Format**:
```json
{
  "success": true/false,
  "data": {},        // On success
  "error": "message" // On failure
}
```

**Endpoint Conventions**:
- `GET /api/pdf/templates` - List templates
- `GET /api/pdf/templates/:id` - Get specific template
- `PUT /api/pdf/templates/:id` - Update template
- `GET /api/pdf/templates/:id/preview` - Generate preview
- `POST /api/pdf/templates` - Create new template

## Critical Implementation Notes

### 1. PDF Coordinate System
- **Canvas**: Origin top-left, Y increases downward
- **PDF**: Origin bottom-left, Y increases upward
- **Conversion**: `pdfY = pageHeight - (canvasY + elementHeight)`

### 2. Color Handling
- **Input**: Hex colors (#ffffff)
- **Storage**: Hex format in JSON
- **PDF Rendering**: Normalized rgb(0-1) values
- **Conversion**: `rgb(r/255, g/255, b/255)` - **CRITICAL**: Always divide by 255

### 3. Element Management
- **IDs**: UUID v4 for uniqueness
- **Z-Index**: Incremental for layering
- **Coordinates**: Pixel-based in canvas, converted to points for PDF
- **Selection**: Single element selection with property panel updates

### 4. Template Sections
- **Front**: Cover page with custom elements
- **Content**: Wine catalog with automatic layout
- **Back**: Back cover with custom elements
- **Background**: Color and image support per section

## Debugging Guidelines

### 1. Logging Levels
- `logger.info()` - Normal operations
- `logger.warn()` - Recoverable issues
- `logger.error()` - Critical failures
- Include context objects for detailed debugging

### 2. Common Issues

**PDF Generation Failures**:
- ❗ **Most Critical**: Check color value normalization (0-1 range, not 0-255)
- Verify coordinate conversion accuracy
- Validate element property completeness
- Check font embedding and text rendering

**Canvas Rendering Issues**:
- Verify zoom factor calculations
- Check coordinate system consistency
- Validate element bounds and positioning
- Ensure proper event handling

**API Communication**:
- Check response format compliance
- Verify error handling implementation
- Validate request payload structure
- Handle network timeouts gracefully

### 3. Known Bug Fixes Applied
1. **HTTP 500 Error**: Fixed color normalization in pdf-lib (divide rgb values by 255)
2. **Invisible Elements**: Added support for rectangle and image rendering
3. **Coordinate Conversion**: Proper Y-axis flip for PDF coordinate system

## Development Workflow

### 1. Starting Development
```bash
npm run dev        # Start development server with hot reload
npm run build      # Compile TypeScript
npm run lint       # Check code quality
npm test           # Run test suite
```

### 2. Adding New Features
1. Define TypeScript interfaces in `src/types/index.ts`
2. Implement backend service methods with proper logging
3. Add frontend UI components with event handling
4. Test with various data scenarios
5. Update documentation and type definitions

### 3. Debugging Process
1. Check browser console for frontend errors
2. Monitor server logs for backend issues
3. Use structured logging data for tracing
4. Test with minimal reproduction cases
5. Verify fix with comprehensive testing

## Testing Approach

### 1. Manual Testing
- Test all element types (text, rectangle, image)
- Verify PDF generation with various configurations
- Check UI responsiveness and error handling
- Test coordinate conversion accuracy
- Validate section background settings

### 2. Error Scenarios
- Invalid template data
- Missing element properties
- Network failures
- File system errors
- Color value edge cases

### 3. Test Configuration
The project uses Jest for testing with TypeScript support:
```json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "testMatch": ["**/__tests__/**/*.test.ts"]
}
```

## Performance Considerations

### 1. PDF Generation
- Use efficient coordinate calculations
- Minimize font embedding operations
- Cache frequently used resources
- Optimize image processing

### 2. Frontend Performance
- Debounce rapid user interactions
- Use efficient DOM manipulation
- Optimize canvas rendering operations
- Implement lazy loading for large datasets

## Security Guidelines

1. **Input Validation**: Always validate user input on both frontend and backend
2. **File Uploads**: Restrict file types and sizes for image uploads
3. **API Security**: Use appropriate middleware (helmet, cors)
4. **Error Messages**: Don't expose sensitive information in error responses

## Data Persistence

The application uses JSON file storage with the following patterns:
- **Atomic writes**: Use temporary files and rename operations
- **Backup strategy**: Keep backup copies of important data
- **Validation**: Validate data structure before saving
- **Error recovery**: Implement graceful fallbacks for corrupted data

## Maintenance Tasks

### Regular Maintenance
1. Update dependencies regularly
2. Monitor log files for errors
3. Clean up temporary PDF files
4. Validate data integrity
5. Review and update documentation

### Troubleshooting Checklist
1. Check server logs for errors
2. Verify file system permissions
3. Validate template JSON structure
4. Test PDF generation with minimal data
5. Check frontend console for JavaScript errors

---

**Last Updated**: Based on Wine Management System v2.0.0 with all bug fixes applied including HTTP 500 error resolution, element rendering support, and UI enhancements.

This instruction set provides comprehensive guidelines for working with the Wine Management System's PDF template editor. Follow these patterns for consistent, maintainable code that aligns with the project's architecture and conventions.