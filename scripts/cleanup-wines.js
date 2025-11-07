#!/usr/bin/env node

/**
 * Data cleanup script for wine database
 * Standardizes structure and fills missing fields
 */

const fs = require('fs').promises;
const path = require('path');

async function cleanupWineData() {
  try {
    console.log('🍷 Starting wine data cleanup...');
    
    // Read wines.json
    const winesPath = path.join(__dirname, '../data/wines.json');
    const winesData = await fs.readFile(winesPath, 'utf8');
    const wines = JSON.parse(winesData);
    
    console.log(`📊 Found ${wines.length} wines to process`);
    
    // Define standard structure with default values
    const standardFields = {
      // Core fields (required order)
      id: '',
      catalogNumber: '',
      name: '',
      producer: '',
      country: '',
      region: '',
      year: null,
      type: '',
      price: null,
      description: '',
      image: '',
      
      // Wine specific fields
      szczepy: '',
      category: '',
      vol: '',
      alcohol: '',
      
      // Timestamps (always last)
      createdAt: '',
      updatedAt: ''
    };
    
    const cleanedWines = wines.map((wine, index) => {
      console.log(`🔧 Processing wine ${index + 1}: ${wine.name || 'Unnamed'}`);
      
      // Create standardized wine object
      const cleanedWine = { ...standardFields };
      
      // Copy existing data, ensuring proper structure
      Object.keys(wine).forEach(key => {
        if (key in standardFields) {
          cleanedWine[key] = wine[key];
        }
      });
      
      // Auto-fill image if catalogNumber exists but image is empty
      if (cleanedWine.catalogNumber && !cleanedWine.image) {
        cleanedWine.image = `/images/${cleanedWine.catalogNumber}.jpg`;
        console.log(`  ✅ Auto-generated image URL: ${cleanedWine.image}`);
      }
      
      // Ensure timestamps exist
      if (!cleanedWine.createdAt) {
        cleanedWine.createdAt = new Date().toISOString();
        console.log(`  ✅ Added createdAt timestamp`);
      }
      
      if (!cleanedWine.updatedAt) {
        cleanedWine.updatedAt = cleanedWine.createdAt;
        console.log(`  ✅ Added updatedAt timestamp`);
      }
      
      // Clean up empty strings vs null
      if (cleanedWine.year === '') cleanedWine.year = null;
      if (cleanedWine.price === '') cleanedWine.price = null;
      
      // Standardize alcohol format
      if (cleanedWine.alcohol && !cleanedWine.alcohol.includes('%') && cleanedWine.alcohol.trim() !== '') {
        cleanedWine.alcohol = `${cleanedWine.alcohol}%`;
        console.log(`  ✅ Standardized alcohol: ${cleanedWine.alcohol}`);
      }
      
      return cleanedWine;
    });
    
    // Remove test wines (those with obviously test data)
    const validWines = cleanedWines.filter(wine => {
      const isTest = wine.name.toLowerCase().includes('test') || 
                     wine.name.trim() === '' || 
                     wine.name.length < 2 ||
                     !isNaN(Number(wine.name.trim()));
      
      if (isTest) {
        console.log(`  ❌ Removing test wine: "${wine.name}"`);
        return false;
      }
      return true;
    });
    
    console.log(`📝 ${validWines.length} valid wines after cleanup (removed ${wines.length - validWines.length} test entries)`);
    
    // Create backup
    const backupPath = path.join(__dirname, '../data/wines.json.backup');
    await fs.writeFile(backupPath, winesData);
    console.log(`💾 Created backup: ${backupPath}`);
    
    // Write cleaned data
    await fs.writeFile(winesPath, JSON.stringify(validWines, null, 2));
    console.log(`✅ Wine data cleanup completed successfully!`);
    console.log(`📊 Final count: ${validWines.length} wines`);
    
  } catch (error) {
    console.error('❌ Error during wine data cleanup:', error);
    process.exit(1);
  }
}

// Run cleanup
cleanupWineData();