/**
 * Test walidacji pól importu CSV - przypadek z nieprawidłowymi polami
 */

const fetch = require('node-fetch');

const baseUrl = 'http://localhost:3001';

async function testInvalidFieldsImport() {
  console.log('=== TEST WALIDACJI PÓL CSV - NIEPRAWIDŁOWE POLA ===');
  
  // CSV z nieprawidłowymi nazwami kolumn
  const invalidCsvData = `badField1,wrongColumn,unknownField,name,region
"value1","value2","value3","Test Wine","Tuscany"`;

  const requestBody = {
    csvData: invalidCsvData,
    clearBefore: false,
    validateFields: true
  };

  try {
    console.log('📤 Wysyłanie CSV z nieprawidłowymi polami...');
    console.log('📋 Kolumny CSV:', 'badField1, wrongColumn, unknownField, name, region');
    
    const response = await fetch(`${baseUrl}/api/import/csv`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    
    console.log('📊 Status odpowiedzi:', response.status);
    console.log('✅ Success:', result.success);
    
    if (!result.success) {
      console.log('❌ Błąd:', result.error);
      console.log('🔍 Błędy walidacji:');
      result.validationErrors?.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.field}: ${error.message}`);
      });
    }
    
    return result;
  } catch (error) {
    console.error('💥 Błąd testu:', error.message);
    return null;
  }
}

async function testValidFieldsImport() {
  console.log('\n=== TEST WALIDACJI PÓL CSV - PRAWIDŁOWE POLA ===');
  
  // CSV z prawidłowymi nazwami kolumn
  const validCsvData = `name,region,type,category,alcohol,catalogNumber
"Test Wine Valid","Tuscany","wytrawne","czerwone","13.5%","TEST-VALID-001"`;

  const requestBody = {
    csvData: validCsvData,
    clearBefore: false,
    validateFields: true
  };

  try {
    console.log('📤 Wysyłanie CSV z prawidłowymi polami...');
    console.log('📋 Kolumny CSV:', 'name, region, type, category, alcohol, catalogNumber');
    
    const response = await fetch(`${baseUrl}/api/import/csv`, {
      method: 'POST',  
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    
    console.log('📊 Status odpowiedzi:', response.status);
    console.log('✅ Success:', result.success);
    
    if (result.success) {
      console.log('🎉 Import udany!');
      console.log('📈 Wyniki:', `${result.data.imported} importowanych, ${result.data.errors.length} błędów`);
    } else {
      console.log('❌ Błąd:', result.error);
      if (result.validationErrors) {
        console.log('🔍 Błędy walidacji:');
        result.validationErrors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error.field}: ${error.message}`);
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error('💥 Błąd testu:', error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Uruchamianie testów walidacji pól importu...\n');
  
  // Test 1: Nieprawidłowe pola
  await testInvalidFieldsImport();
  
  // Test 2: Prawidłowe pola  
  await testValidFieldsImport();
  
  console.log('\n=== KONIEC TESTÓW ===');
}

// Uruchom testy tylko jeśli serwer jest dostępny
fetch(`${baseUrl}/api/fields/config`)
  .then(() => {
    console.log('🌐 Serwer jest dostępny, uruchamianie testów...');
    runTests();
  })
  .catch(() => {
    console.log('❌ Serwer nie jest dostępny na', baseUrl);
    console.log('💡 Uruchom serwer komendą: npm run dev');
  });