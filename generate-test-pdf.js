const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Test generator PDF z CMYK kolorami
 */
async function generateTestCMYKPDF() {
  console.log('🎨 Generowanie testowego PDF z kolorami CMYK...');
  
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Załaduj testowy template HTML
    const templatePath = path.join(__dirname, 'test-cmyk-template.html');
    const templateUrl = `file://${templatePath}`;
    
    console.log(`📄 Ładowanie template: ${templateUrl}`);
    await page.goto(templateUrl, { waitUntil: 'networkidle0' });
    
    // Generuj PDF z ustawieniami dla CMYK
    const pdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm', 
        bottom: '10mm',
        left: '10mm'
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false
    };
    
    console.log('🔄 Generowanie PDF...');
    const pdfBuffer = await page.pdf(pdfOptions);
    
    await browser.close();
    
    // Zapisz PDF
    const outputPath = path.join(__dirname, 'public', 'pdf-output', 'test-cmyk-wine-catalog.pdf');
    
    // Utwórz folder jeśli nie istnieje
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log('✅ PDF wygenerowany pomyślnie!');
    console.log(`📁 Ścieżka: ${outputPath}`);
    console.log(`📏 Rozmiar: ${Math.round(pdfBuffer.length / 1024)} KB`);
    console.log('');
    console.log('🔄 Następny krok: Konwersja do CMYK');
    console.log('Uruchom: node batch-cmyk-converter.js test-cmyk-wine-catalog.pdf');
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ Błąd podczas generowania PDF:', error);
    throw error;
  }
}

// Uruchom jeśli wywołany bezpośrednio
if (require.main === module) {
  generateTestCMYKPDF();
}

module.exports = { generateTestCMYKPDF };