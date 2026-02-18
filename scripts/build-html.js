/**
 * HTML Build Script
 * Kompiluje strony HTML z layout'ami i komponentami
 * Wspiera: <!-- INCLUDE: path/to/file.html -->
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class HTMLBuilder {
  constructor() {
    this.publicDir = path.join(__dirname, '../public');
    this.layoutsDir = path.join(this.publicDir, 'layouts');
    this.componentsDir = path.join(this.publicDir, 'components');
    this.pagesDir = path.join(this.publicDir, 'pages');
    this.buildCount = 0;
  }

  /**
   * Recursively include files
   */
  includeFile(content, basePath, visited = new Set()) {
    const includeRegex = /<!--\s*INCLUDE:\s*(.+?)\s*-->/g;
    
    return content.replace(includeRegex, (match, filePath) => {
      const fullPath = path.resolve(basePath, filePath.trim());
      
      // Prevent circular dependencies
      if (visited.has(fullPath)) {
        console.warn(`⚠️  Circular dependency detected: ${fullPath}`);
        return `<!-- Circular dependency: ${filePath} -->`;
      }
      
      if (!fs.existsSync(fullPath)) {
        console.warn(`⚠️  File not found: ${fullPath}`);
        return `<!-- File not found: ${filePath} -->`;
      }
      
      visited.add(fullPath);
      let fileContent = fs.readFileSync(fullPath, 'utf8');
      
      // Recursively process includes in the included file
      fileContent = this.includeFile(fileContent, path.dirname(fullPath), new Set(visited));
      
      return fileContent;
    });
  }

  /**
   * Process variables in content
   * Supports: {{VAR_NAME}} or ${VAR_NAME}
   */
  processVariables(content, variables = {}) {
    // Process {{VAR}} style
    content = content.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return variables[varName] || match;
    });
    
    return content;
  }

  /**
   * Build single page
   */
  buildPage(sourcePath, outputPath, variables = {}) {
    try {
      let content = fs.readFileSync(sourcePath, 'utf8');
      
      // Process includes
      content = this.includeFile(content, path.dirname(sourcePath));
      
      // Process variables
      content = this.processVariables(content, variables);
      
      // Minify HTML in production
      if (process.env.NODE_ENV === 'production') {
        content = this.minifyHTML(content);
      }
      
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Write output
      fs.writeFileSync(outputPath, content, 'utf8');
      
      this.buildCount++;
      console.log(`✓ Built: ${path.basename(outputPath)}`);
      
      return true;
    } catch (error) {
      console.error(`✗ Error building ${sourcePath}:`, error.message);
      return false;
    }
  }

  /**
   * Simple HTML minification
   */
  minifyHTML(html) {
    return html
      // Remove comments (except IE conditional comments)
      .replace(/<!--(?!\[if\s)[\s\S]*?-->/g, '')
      // Remove whitespace between tags
      .replace(/>\s+</g, '><')
      // Remove leading/trailing whitespace
      .trim();
  }

  /**
   * Build all pages
   */
  buildAll() {
    console.log('\n🏗️  Building HTML pages...\n');
    
    const startTime = Date.now();
    this.buildCount = 0;
    
    // Check if pages directory exists
    if (!fs.existsSync(this.pagesDir)) {
      console.log('📁 Creating pages directory...');
      fs.mkdirSync(this.pagesDir, { recursive: true });
    }
    
    // Find all HTML files in pages directory
    const pageFiles = glob.sync('**/*.html', { 
      cwd: this.pagesDir,
      nodir: true 
    });
    
    if (pageFiles.length === 0) {
      console.log('⚠️  No pages found in public/pages/');
      console.log('💡 Run the migration script first: npm run migrate:html\n');
      return;
    }
    
    // Build each page
    pageFiles.forEach(pageFile => {
      const sourcePath = path.join(this.pagesDir, pageFile);
      const outputPath = path.join(this.publicDir, pageFile);
      
      // Extract page name for variables
      const pageName = path.basename(pageFile, '.html');
      const variables = {
        PAGE_NAME: pageName,
        BUILD_TIME: new Date().toISOString(),
        VERSION: require('../package.json').version
      };
      
      this.buildPage(sourcePath, outputPath, variables);
    });
    
    const elapsed = Date.now() - startTime;
    console.log(`\n✨ Built ${this.buildCount} pages in ${elapsed}ms\n`);
  }

  /**
   * Watch for changes
   */
  watch() {
    console.log('\n👀 Watching for changes...\n');
    
    const chokidar = require('chokidar');
    
    const watchPaths = [
      path.join(this.pagesDir, '**/*.html'),
      path.join(this.layoutsDir, '**/*.html'),
      path.join(this.componentsDir, '**/*.html')
    ];
    
    const watcher = chokidar.watch(watchPaths, {
      ignored: /node_modules/,
      persistent: true,
      ignoreInitial: true
    });
    
    watcher
      .on('change', (filePath) => {
        console.log(`\n📝 Changed: ${path.relative(this.publicDir, filePath)}`);
        this.buildAll();
      })
      .on('add', (filePath) => {
        console.log(`\n➕ Added: ${path.relative(this.publicDir, filePath)}`);
        this.buildAll();
      })
      .on('unlink', (filePath) => {
        console.log(`\n➖ Removed: ${path.relative(this.publicDir, filePath)}`);
        this.buildAll();
      });
    
    // Initial build
    this.buildAll();
  }
}

// CLI
const builder = new HTMLBuilder();

const command = process.argv[2];

switch (command) {
  case 'watch':
    builder.watch();
    break;
  case 'build':
  default:
    builder.buildAll();
    break;
}
