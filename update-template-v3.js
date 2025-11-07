const fs = require('fs');
const path = require('path');

// Wczytaj istniejącą bazę szablonów
const templatesPath = path.join(__dirname, 'data', 'html-templates.json');
const templateFilePath = path.join(__dirname, 'template-1col-header-4plus5-v3.html');

// Wczytaj HTML szablonu
const htmlContent = fs.readFileSync(templateFilePath, 'utf8');

// Wczytaj bazę szablonów
let templates = [];
if (fs.existsSync(templatesPath)) {
  templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
}

// ID template do zaktualizowania/dodania
const templateId = 'header-4plus5-template-2025';

// Znajdź istniejący template lub utwórz nowy
const existingIndex = templates.findIndex(t => t.id === templateId);

const updatedTemplate = {
  id: templateId,
  name: 'Nagłówek + 4/5 produktów (109×301mm) v3',
  description: 'Szablon z wymiarami 109mm × 301mm. Pierwsza strona: nagłówek (20%) + 4 produkty. Kolejne strony: po 5 produktów. Custom pagination: 4-5-5-5... Używa firstPageWines i restPages.',
  htmlContent: htmlContent,
  metadata: {
    layout: 'single-column',
    width: '109mm',
    height: '301mm',
    firstPage: 4,
    nextPages: 5,
    pagination: 'custom',
    variables: ['firstPageWines', 'restPages']
  },
  status: 'published',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

if (existingIndex !== -1) {
  // Aktualizuj istniejący
  templates[existingIndex] = updatedTemplate;
  console.log('✅ Template zaktualizowany!');
} else {
  // Dodaj nowy
  templates.push(updatedTemplate);
  console.log('✅ Template dodany!');
}

// Zapisz
fs.writeFileSync(templatesPath, JSON.stringify(templates, null, 2), 'utf8');
console.log(`📄 Total templates: ${templates.length}`);
console.log(`🔑 Template ID: ${templateId}`);
