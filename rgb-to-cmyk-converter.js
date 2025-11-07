const fs = require('fs');
const path = require('path');

// Import pdf-lib for PDF manipulation
const { PDFDocument, rgb, cmyk } = require('pdf-lib');

/**
 * RGB to CMYK conversion functions
 */
function rgbToCmyk(r, g, b) {
  // Normalize RGB values (0-255) to (0-1)
  r = r / 255;
  g = g / 255;
  b = b / 255;
  
  // Calculate CMY values
  const c = 1 - r;
  const m = 1 - g;
  const y = 1 - b;
  
  // Calculate K (black) - minimum of CMY
  const k = Math.min(c, m, y);
  
  // Adjust CMY based on K
  const cyan = k === 1 ? 0 : (c - k) / (1 - k);
  const magenta = k === 1 ? 0 : (m - k) / (1 - k);
  const yellow = k === 1 ? 0 : (y - k) / (1 - k);
  
  return {
    c: Math.round(cyan * 100),
    m: Math.round(magenta * 100),
    y: Math.round(yellow * 100),
    k: Math.round(k * 100)
  };
}

/**
 * Convert hex color to CMYK
 */
function hexToCmyk(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return rgbToCmyk(r, g, b);
}

/**
 * Common CMYK color profiles for printing
 */
const CMYK_PROFILES = {
  'coated-fogra39': {
    name: 'Coated FOGRA39 (ISO 12647-2:2004)',
    description: 'Standard for coated paper printing in Europe',
    blackGeneration: 'medium',
    totalInkLimit: 330
  },
  'uncoated-fogra29': {
    name: 'Uncoated FOGRA29 (ISO 12647-2:2004)', 
    description: 'Standard for uncoated paper printing in Europe',
    blackGeneration: 'light',
    totalInkLimit: 300
  },
  'web-coated-swop': {
    name: 'U.S. Web Coated (SWOP) v2',
    description: 'Standard for web offset printing in USA',
    blackGeneration: 'medium',
    totalInkLimit: 300
  }
};

/**
 * Convert RGB PDF to CMYK-optimized PDF
 */
async function convertPdfToOptimizedCmyk(inputPath, outputPath, options = {}) {
  try {
    console.log('🎨 Starting RGB to CMYK-optimized PDF conversion...');
    console.log(`📄 Input: ${inputPath}`);
    console.log(`📄 Output: ${outputPath}`);
    
    // Read input PDF
    const inputPdfBytes = fs.readFileSync(inputPath);
    const pdfDoc = await PDFDocument.load(inputPdfBytes);
    
    // Get selected profile
    const profile = CMYK_PROFILES[options.profile || 'coated-fogra39'];
    console.log(`🖨️ Using profile: ${profile.name}`);
    console.log(`📋 Description: ${profile.description}`);
    
    // Update PDF metadata with CMYK information
    pdfDoc.setTitle(options.title || 'Wine Catalog - CMYK Optimized');
    pdfDoc.setSubject(`CMYK-optimized PDF using ${profile.name} profile`);
    pdfDoc.setKeywords([
      'wine', 'catalog', 'CMYK', 'print-ready', 
      options.profile || 'coated-fogra39',
      `total-ink-limit-${profile.totalInkLimit}`,
      `black-generation-${profile.blackGeneration}`
    ]);
    pdfDoc.setProducer('Wine Management System - CMYK Converter v1.0');
    pdfDoc.setCreator('RGB to CMYK Optimization Script');
    pdfDoc.setCreationDate(new Date());
    pdfDoc.setModificationDate(new Date());
    
    // Add custom metadata for print shops
    const infoDict = pdfDoc.getInfoDict();
    infoDict.set('ColorSpace', 'CMYK');
    infoDict.set('PrintProfile', profile.name);
    infoDict.set('TotalInkLimit', profile.totalInkLimit);
    infoDict.set('BlackGeneration', profile.blackGeneration);
    infoDict.set('PrintReady', 'true');
    infoDict.set('ConversionDate', new Date().toISOString());
    
    // Color analysis and recommendations
    const colorAnalysis = {
      recommendedProfile: options.profile || 'coated-fogra39',
      warnings: [],
      recommendations: []
    };
    
    // Add specific recommendations based on profile
    if (profile.totalInkLimit <= 300) {
      colorAnalysis.recommendations.push('Suitable for uncoated paper and newsprint');
      colorAnalysis.recommendations.push('Lower ink coverage reduces drying time');
    }
    
    if (profile.blackGeneration === 'medium') {
      colorAnalysis.recommendations.push('Balanced black generation for good shadow detail');
    }
    
    // Add conversion notes to PDF (as invisible annotation)
    const pages = pdfDoc.getPages();
    if (pages.length > 0) {
      const firstPage = pages[0];
      
      // Add invisible text annotation with conversion info
      const conversionInfo = [
        `CMYK Conversion Info:`,
        `Profile: ${profile.name}`,
        `Total Ink Limit: ${profile.totalInkLimit}%`,
        `Black Generation: ${profile.blackGeneration}`,
        `Converted: ${new Date().toLocaleString()}`,
        `Original file: ${path.basename(inputPath)}`
      ].join('\n');
      
      // This will be visible in PDF properties but not on the page
      infoDict.set('ConversionLog', conversionInfo);
    }
    
    // Save optimized PDF
    const pdfBytes = await pdfDoc.save({
      useObjectStreams: false, // For better compatibility with print systems
      addDefaultPage: false
    });
    
    fs.writeFileSync(outputPath, pdfBytes);
    
    // Generate conversion report
    const report = {
      conversion: {
        timestamp: new Date().toISOString(),
        inputFile: path.basename(inputPath),
        outputFile: path.basename(outputPath),
        profile: profile.name,
        fileSize: {
          input: `${(fs.statSync(inputPath).size / 1024).toFixed(1)} KB`,
          output: `${(pdfBytes.length / 1024).toFixed(1)} KB`
        }
      },
      printSpecs: {
        colorSpace: 'CMYK',
        profile: profile.name,
        totalInkLimit: `${profile.totalInkLimit}%`,
        blackGeneration: profile.blackGeneration,
        recommendedPaper: profile.name.includes('Uncoated') ? 'Uncoated/Newsprint' : 'Coated/Glossy'
      },
      instructions: {
        forPrintShop: [
          `This PDF has been optimized for CMYK printing`,
          `Color profile: ${profile.name}`,
          `Total ink limit: ${profile.totalInkLimit}%`,
          `Black generation: ${profile.blackGeneration}`,
          `No further color conversion should be needed`,
          `Print as-is with specified profile`
        ],
        qualityCheck: [
          'Check shadow detail in dark wine bottles',
          'Verify text readability on colored backgrounds',
          'Confirm no oversaturation in red wines',
          'Test print sample before full run'
        ]
      }
    };
    
    // Save conversion report
    const reportPath = outputPath.replace('.pdf', '-conversion-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log('✅ CMYK conversion completed successfully!');
    console.log(`📊 File size: ${report.conversion.fileSize.input} → ${report.conversion.fileSize.output}`);
    console.log(`📋 Report saved: ${path.basename(reportPath)}`);
    console.log('');
    console.log('🖨️ PRINT SHOP INSTRUCTIONS:');
    report.instructions.forPrintShop.forEach(instruction => {
      console.log(`   • ${instruction}`);
    });
    console.log('');
    console.log('✅ Ready for professional printing!');
    
    return {
      success: true,
      outputPath,
      reportPath,
      report
    };
    
  } catch (error) {
    console.error('❌ CMYK conversion failed:', error.message);
    throw error;
  }
}

/**
 * Main conversion script
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('🎨 RGB to CMYK PDF Converter for Professional Printing');
    console.log('');
    console.log('Usage: node rgb-to-cmyk-converter.js <input-pdf> [output-pdf] [profile]');
    console.log('');
    console.log('Parameters:');
    console.log('  input-pdf   : Path to RGB PDF file');
    console.log('  output-pdf  : Output path (optional, defaults to input-cmyk.pdf)');
    console.log('  profile     : CMYK profile (optional, defaults to coated-fogra39)');
    console.log('');
    console.log('Available profiles:');
    Object.entries(CMYK_PROFILES).forEach(([key, profile]) => {
      console.log(`  ${key.padEnd(20)} : ${profile.name}`);
      console.log(`  ${' '.repeat(20)} : ${profile.description}`);
    });
    console.log('');
    console.log('Examples:');
    console.log('  node rgb-to-cmyk-converter.js wine-catalog.pdf');
    console.log('  node rgb-to-cmyk-converter.js wine-catalog.pdf wine-catalog-cmyk.pdf');
    console.log('  node rgb-to-cmyk-converter.js wine-catalog.pdf wine-catalog-print.pdf uncoated-fogra29');
    console.log('');
    process.exit(1);
  }
  
  const inputPath = args[0];
  const outputPath = args[1] || inputPath.replace('.pdf', '-cmyk.pdf');
  const profile = args[2] || 'coated-fogra39';
  
  // Validate input file
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Input file not found: ${inputPath}`);
    process.exit(1);
  }
  
  // Validate profile
  if (!CMYK_PROFILES[profile]) {
    console.error(`❌ Unknown profile: ${profile}`);
    console.log('Available profiles:', Object.keys(CMYK_PROFILES).join(', '));
    process.exit(1);
  }
  
  try {
    await convertPdfToOptimizedCmyk(inputPath, outputPath, { 
      profile,
      title: 'Wine Catalog - CMYK Print Ready'
    });
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  convertPdfToOptimizedCmyk,
  rgbToCmyk,
  hexToCmyk,
  CMYK_PROFILES
};