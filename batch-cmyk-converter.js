const fs = require('fs');
const path = require('path');
const { convertPdfToOptimizedCmyk, CMYK_PROFILES } = require('./rgb-to-cmyk-converter');

/**
 * Batch convert all PDFs in pdf-output directory
 */
async function convertAllPdfsInOutput() {
  const outputDir = path.join(__dirname, 'public', 'pdf-output');
  
  if (!fs.existsSync(outputDir)) {
    console.log('❌ PDF output directory not found:', outputDir);
    console.log('💡 Generate some PDFs first using the web interface');
    return;
  }
  
  const files = fs.readdirSync(outputDir).filter(file => 
    file.endsWith('.pdf') && !file.includes('-cmyk')
  );
  
  if (files.length === 0) {
    console.log('📂 No RGB PDF files found in pdf-output directory');
    console.log('💡 Generate some PDFs using collections first');
    return;
  }
  
  console.log(`🎨 Found ${files.length} RGB PDF file(s) to convert:`);
  files.forEach(file => console.log(`   📄 ${file}`));
  console.log('');
  
  const results = [];
  
  for (const file of files) {
    try {
      const inputPath = path.join(outputDir, file);
      const outputPath = path.join(outputDir, file.replace('.pdf', '-cmyk.pdf'));
      
      console.log(`🔄 Converting: ${file}`);
      
      const result = await convertPdfToOptimizedCmyk(inputPath, outputPath, {
        profile: 'coated-fogra39', // Default to best quality
        title: `Wine Catalog CMYK - ${file.replace('.pdf', '')}`
      });
      
      results.push({
        original: file,
        converted: path.basename(outputPath),
        success: true
      });
      
      console.log(`✅ Converted: ${file} → ${path.basename(outputPath)}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ Failed to convert ${file}:`, error.message);
      results.push({
        original: file,
        success: false,
        error: error.message
      });
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log('📊 CONVERSION SUMMARY:');
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log('');
  
  if (successful.length > 0) {
    console.log('✅ Successfully converted files:');
    successful.forEach(result => {
      console.log(`   📄 ${result.original} → ${result.converted}`);
    });
    console.log('');
  }
  
  if (failed.length > 0) {
    console.log('❌ Failed conversions:');
    failed.forEach(result => {
      console.log(`   📄 ${result.original}: ${result.error}`);
    });
    console.log('');
  }
  
  console.log('🖨️ NEXT STEPS:');
  console.log('1. Download the -cmyk.pdf files from public/pdf-output/');
  console.log('2. Send CMYK files to your print shop');
  console.log('3. Include the -conversion-report.json files for printer');
  console.log('4. Specify "Print as-is, no color conversion needed"');
  console.log('');
  console.log('📋 Print shop files are optimized for:');
  console.log('   • Coated paper (glossy/semi-gloss)');
  console.log('   • Offset or digital printing');
  console.log('   • Professional color accuracy');
  console.log('   • Total ink limit: 330%');
}

// Quick convert single file helper
async function quickConvert(filename) {
  const outputDir = path.join(__dirname, 'public', 'pdf-output');
  const inputPath = path.join(outputDir, filename);
  
  if (!fs.existsSync(inputPath)) {
    console.log(`❌ File not found: ${filename}`);
    console.log('Available files:');
    const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.pdf'));
    files.forEach(file => console.log(`   📄 ${file}`));
    return;
  }
  
  const outputPath = inputPath.replace('.pdf', '-cmyk.pdf');
  
  try {
    await convertPdfToOptimizedCmyk(inputPath, outputPath, {
      profile: 'coated-fogra39',
      title: `Wine Catalog CMYK - ${filename.replace('.pdf', '')}`
    });
    
    console.log('');
    console.log('🎯 Quick conversion completed!');
    console.log(`📄 Output: ${path.basename(outputPath)}`);
    
  } catch (error) {
    console.error('❌ Quick conversion failed:', error.message);
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🎨 Wine Management System - CMYK Batch Converter');
    console.log('');
    console.log('Commands:');
    console.log('  node batch-cmyk-converter.js               - Convert all PDFs in pdf-output');
    console.log('  node batch-cmyk-converter.js <filename>    - Convert specific file');
    console.log('');
    console.log('Examples:');
    console.log('  node batch-cmyk-converter.js');
    console.log('  node batch-cmyk-converter.js wine-catalog-20251029.pdf');
    console.log('');
    
    await convertAllPdfsInOutput();
  } else {
    const filename = args[0];
    await quickConvert(filename);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  convertAllPdfsInOutput,
  quickConvert
};