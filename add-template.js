const fs = require('fs');
const path = require('path');

// Read template HTML file
const templatePath = path.join(__dirname, 'template-1col-header-4plus5-v2.html');
const templateHTML = fs.readFileSync(templatePath, 'utf8');

// Read current templates
const templatesPath = path.join(__dirname, 'data', 'html-templates.json');
const templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));

// Create new template entry
const newTemplate = {
  "id": "header-4plus5-template-2025",
  "name": "Nagłówek + 4/5 produktów (109×301mm)",
  "description": "Szablon z wymiarami 109mm × 301mm. Pierwsza strona: nagłówek (20%) + 4 produkty. Kolejne strony: po 5 produktów. Custom pagination: 4-5-5-5...",
  "category": "general",
  "htmlContent": templateHTML,
  "cssContent": "",
  "jsContent": "",
  "thumbnailUrl": "",
  "placeholders": [
    { "key": "image", "label": "Obraz wina", "type": "url" },
    { "key": "name", "label": "Nazwa wina", "type": "text" },
    { "key": "price1", "label": "Cena 1", "type": "text" },
    { "key": "price2", "label": "Cena 2", "type": "text" },
    { "key": "szczepy", "label": "Szczep", "type": "text" },
    { "key": "catalogNumber", "label": "Nr katalogowy", "type": "text" },
    { "key": "region", "label": "Region", "type": "text" },
    { "key": "type", "label": "Typ", "type": "text" },
    { "key": "category", "label": "Kolor", "type": "text" },
    { "key": "description", "label": "Opis", "type": "textarea" },
    { "key": "alcohol", "label": "Alkohol", "type": "text" },
    { "key": "collection.customTitle", "label": "Tytuł nagłówka", "type": "text" },
    { "key": "collection.dynamicFieldsByName.zwykly_tekst", "label": "Tło nagłówka", "type": "url" }
  ],
  "sampleData": {},
  "isPublic": true,
  "tags": ["single-column", "header", "custom-pagination", "wine", "109mm"],
  "version": "1.0.0",
  "status": "published",
  "metadata": {
    "layout": "single-column",
    "width": "109mm",
    "height": "301mm",
    "firstPage": 4,
    "nextPages": 5,
    "pagination": "custom"
  },
  "createdAt": new Date().toISOString(),
  "updatedAt": new Date().toISOString()
};

// Add new template
templates.push(newTemplate);

// Save updated templates
fs.writeFileSync(templatesPath, JSON.stringify(templates, null, 2), 'utf8');

console.log('✅ Template added successfully!');
console.log(`📊 Total templates: ${templates.length}`);
console.log(`🆔 Template ID: ${newTemplate.id}`);
console.log(`📝 Template name: ${newTemplate.name}`);
