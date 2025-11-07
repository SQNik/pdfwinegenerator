const fs = require('fs');
const path = require('path');

// Ścieżka do pliku szablonów
const templatesPath = path.join(__dirname, '..', 'data', 'pdf-templates.json');

// Domyślne wartości dla nowych właściwości układu zawartości
const defaultLayoutSettings = {
  displayMode: 'columns',
  columnsCount: 2,
  itemSpacing: 10,
  showProductImages: true,
  showProductPrices: true,
  showProductDescriptions: true,
  imagePosition: 'top',
  pricePosition: 'bottom'
};

try {
  // Wczytaj istniejące szablony
  const templatesData = fs.readFileSync(templatesPath, 'utf8');
  const templates = JSON.parse(templatesData);
  
  console.log(`🔄 Aktualizacja ${templates.length} szablonów...`);
  
  let updatedCount = 0;
  
  // Zaktualizuj każdy szablon
  templates.forEach((template, index) => {
    if (template.sections && template.sections.content) {
      let hasChanges = false;
      
      // Dodaj brakujące właściwości układu
      Object.keys(defaultLayoutSettings).forEach(key => {
        if (template.sections.content[key] === undefined) {
          template.sections.content[key] = defaultLayoutSettings[key];
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        template.updatedAt = new Date().toISOString();
        updatedCount++;
        console.log(`✅ Zaktualizowano szablon: ${template.name} (ID: ${template.id})`);
      }
    }
  });
  
  if (updatedCount > 0) {
    // Zapisz zaktualizowane szablony
    fs.writeFileSync(templatesPath, JSON.stringify(templates, null, 2), 'utf8');
    console.log(`\n🎉 Pomyślnie zaktualizowano ${updatedCount} szablonów!`);
    console.log(`📝 Dodane domyślne wartości układu zawartości:`);
    Object.entries(defaultLayoutSettings).forEach(([key, value]) => {
      console.log(`   - ${key}: ${value}`);
    });
  } else {
    console.log(`\n✨ Wszystkie szablony są już aktualne!`);
  }
  
} catch (error) {
  console.error('❌ Błąd podczas aktualizacji szablonów:', error.message);
  process.exit(1);
}