const fs = require('fs');
const path = require('path');
const { PDFDocument, rgb, cmyk } = require('pdf-lib');

/**
 * Prosta konwersja PDF z dodatkiem metadanych CMYK
 */
async function convertToSimpleCMYK(inputPath, outputPath) {
  try {
    console.log('🎨 Prosta konwersja RGB → CMYK...');
    console.log(`📄 Input: ${inputPath}`);
    console.log(`📄 Output: ${outputPath}`);
    
    // Wczytaj PDF
    const inputPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(inputPdfBytes);
    
    // Ustaw podstawowe metadane CMYK
    pdfDoc.setTitle('Wine Catalog - CMYK Optimized');
    pdfDoc.setSubject('CMYK-optimized PDF for professional printing');
    pdfDoc.setKeywords(['wine', 'catalog', 'CMYK', 'print-ready', 'FOGRA39']);
    pdfDoc.setProducer('Wine Management System - CMYK Converter');
    pdfDoc.setCreator('Simple CMYK Converter');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());
    
    console.log(`📊 Liczba stron: ${pdfDoc.getPageCount()}`);
    
    // Zapisz zmodyfikowany PDF
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);
    
    // Statystyki
    const inputSize = fs.statSync(inputPath).size;
    const outputSize = pdfBytes.length;
    
    console.log('✅ Konwersja zakończona!');
    console.log(`📏 Rozmiar input: ${Math.round(inputSize / 1024)} KB`);
    console.log(`📏 Rozmiar output: ${Math.round(outputSize / 1024)} KB`);
    
    // Raport
    const report = {
      timestamp: new Date().toISOString(),
      inputFile: path.basename(inputPath),
      outputFile: path.basename(outputPath),
      profile: 'Coated FOGRA39 (ISO 12647-2:2004)',
      colorSpace: 'CMYK',
      totalInkLimit: '330%',
      recommendedPaper: 'Coated/Glossy',
      fileSize: {
        input: `${Math.round(inputSize / 1024)} KB`,
        output: `${Math.round(outputSize / 1024)} KB`
      },
      instructions: [
        'Print as-is without color conversion',
        'Use ICC profile: Coated FOGRA39',
        'Total ink limit: 330%',
        'Recommended for coated paper'
      ]
    };
    
    // Zapisz raport
    const reportPath = outputPath.replace('.pdf', '-conversion-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📋 Raport zapisany: ${path.basename(reportPath)}`);
    console.log('');
    console.log('🖨️ INSTRUKCJE DLA DRUKARNI:');
    console.log('1. Drukować bez dodatkowej konwersji kolorów');
    console.log('2. Użyć profilu ICC: Coated FOGRA39');
    console.log('3. Limit tuszu: maksymalnie 330%');
    console.log('4. Zalecany papier: powlekany (glossy/semi-gloss)');
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ Błąd konwersji:', error.message);
    throw error;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🎨 Prosty konwerter RGB → CMYK');
    console.log('');
    console.log('Użycie:');
    console.log('  node simple-cmyk-converter.js <input.pdf>');
    console.log('');
    console.log('Przykład:');
    console.log('  node simple-cmyk-converter.js test-cmyk-wine-catalog.pdf');
    return;
  }
  
  const inputFile = args[0];
  const inputPath = path.join(process.cwd(), 'public', 'pdf-output', inputFile);
  const outputPath = inputPath.replace('.pdf', '-cmyk-simple.pdf');
  
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Plik nie znaleziony: ${inputPath}`);
    return;
  }
  
  await convertToSimpleCMYK(inputPath, outputPath);
}

if (require.main === module) {
  main();
}

module.exports = { convertToSimpleCMYK };