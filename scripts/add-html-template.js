const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

async function addHTMLTemplate() {
  try {
    // Read the HTML template
    const htmlPath = path.join(__dirname, '..', 'public', 'szablon.html');
    const htmlContent = await fs.readFile(htmlPath, 'utf-8');
    
    // Read existing templates
    const templatesPath = path.join(__dirname, '..', 'data', 'pdf-templates.json');
    const templatesData = await fs.readFile(templatesPath, 'utf-8');
    const templates = JSON.parse(templatesData);
    
    // Create new template object
    const newTemplate = {
      id: uuidv4(),
      name: "Kolekcja - 2 kolumny (HTML)",
      description: "Szablon HTML z okładką i automatyczną paginacją produktów (2 kolumny × 6 wierszy = 12 produktów na stronę)",
      htmlContent: htmlContent,
      printSettings: {
        format: {
          name: "Custom",
          width: 214,
          height: 301,
          unit: "mm"
        },
        dpi: 300,
        colorMode: "rgb",
        margins: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          unit: "mm"
        },
        bleed: 0
      },
      sections: {
        front: {
          enabled: false,
          elements: []
        },
        content: {
          enabled: false,
          productLayout: { columns: 2 },
          groupByCategory: false,
          categoryHeaderEnabled: false,
          categoryHeaderStyle: {},
          elements: []
        },
        back: {
          enabled: false,
          elements: []
        }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to templates array
    templates.push(newTemplate);
    
    // Save back to file
    await fs.writeFile(templatesPath, JSON.stringify(templates, null, 2), 'utf-8');
    
    console.log('✅ Szablon HTML został dodany pomyślnie!');
    console.log(`📄 ID szablonu: ${newTemplate.id}`);
    console.log(`📝 Nazwa: ${newTemplate.name}`);
    console.log(`🔢 Całkowita liczba szablonów: ${templates.length}`);
    
  } catch (error) {
    console.error('❌ Błąd podczas dodawania szablonu:', error);
    process.exit(1);
  }
}

addHTMLTemplate();
