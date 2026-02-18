/**
 * Migration Script
 * Przenosi istniejące HTML files do nowej struktury
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const pagesDir = path.join(publicDir, 'pages');
const layoutsDir = path.join(publicDir, 'layouts');
const componentsDir = path.join(publicDir, 'components');

console.log('\n🔄 Migrating HTML structure...\n');

// Utwórz katalogi
[pagesDir, layoutsDir, componentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created: ${path.relative(publicDir, dir)}/`);
  }
});

// Lista głównych stron do przeniesienia
const mainPages = [
  'index.html',
  'wines.html',
  'collections.html',
  'template-editor.html'
];

// Przenieś główne strony do pages/
mainPages.forEach(page => {
  const sourcePath = path.join(publicDir, page);
  const targetPath = path.join(pagesDir, page);
  
  if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`✓ Copied: ${page} → pages/${page}`);
  }
});

console.log('\n✨ Migration complete!\n');
console.log('Next steps:');
console.log('1. Review files in public/pages/');
console.log('2. Extract common layouts to public/layouts/');
console.log('3. Run: npm run build:html\n');
