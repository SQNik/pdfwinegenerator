const fs = require('fs');
const path = require('path');

// Wczytaj istniejącą bazę szablonów
const templatesPath = path.join(__dirname, 'data', 'html-templates.json');
const templateFilePath = path.join(__dirname, 'template-1col-header-4plus5-CMYK.html');

// Wczytaj HTML szablonu
const htmlContent = fs.readFileSync(templateFilePath, 'utf8');

// Wczytaj bazę szablonów
let templates = [];
if (fs.existsSync(templatesPath)) {
  templates = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));
}

// Nowy szablon CMYK
const newTemplate = {
  id: 'header-4plus5-cmyk-2025',
  name: 'Nagłówek + 4/5 produktów CMYK (109×301mm)',
  description: 'Szablon z kolorystyką CMYK przygotowany do druku profesjonalnego. Wymiary 109mm × 301mm. Pierwsza strona: nagłówek + 4 produkty. Kolejne strony: po 5 produktów. Wszystkie kolory w przestrzeni CMYK.',
  htmlContent: htmlContent,
  metadata: {
    layout: 'single-column',
    width: '109mm',
    height: '301mm',
    firstPage: 4,
    nextPages: 5,
    pagination: 'custom',
    variables: ['firstPageWines', 'restPages'],
    colorSpace: 'CMYK',
    printReady: true
  },
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cssContent: '',
  jsContent: '',
  placeholders: [],
  category: 'print'
};

// Sprawdź czy już istnieje
const existingIndex = templates.findIndex(t => t.id === newTemplate.id);

if (existingIndex !== -1) {
  templates[existingIndex] = newTemplate;
  console.log('✅ Szablon CMYK zaktualizowany!');
} else {
  templates.push(newTemplate);
  console.log('✅ Szablon CMYK dodany!');
}

// Zapisz
fs.writeFileSync(templatesPath, JSON.stringify(templates, null, 2), 'utf8');
console.log(`📄 Total templates: ${templates.length}`);
console.log(`🔑 Template ID: ${newTemplate.id}`);
console.log(`🎨 Color space: CMYK`);
console.log(`🖨️ Print ready: Tak`);
