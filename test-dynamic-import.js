const fetch = require('node-fetch');

/**
 * 🧪 TEST NOWEGO IMPORTU Z DYNAMICZNĄ KONFIGURACJĄ PÓL
 */

async function testDynamicFieldsImport() {
    console.log('🧪 TESTOWANIE IMPORTU Z DYNAMICZNĄ KONFIGURACJĄ PÓL...\n');
    
    try {
        const SERVER_URL = 'http://localhost:3001';
        
        // Test CSV z różnymi nazwami kolumn aby przetestować mapowanie
        const testCSV = `name,region,type,alcohol,description,category,variety,vol,catalogNumber,image
"Test Wine Dynamic 1","Toskania","wytrawne","13.5%","Opis testowego wina z mapowaniem","czerwone","Sangiovese","750ml","TESTDYN001","/images/test1.jpg"
"Test Wine Dynamic 2","Piemont","półwytrawne","12%","Drugie wino testowe","białe","Chardonnay","750ml","TESTDYN002","/images/test2.jpg"`;

        const importData = {
            csvData: testCSV,
            clearBefore: true,
            validateFields: true
        };

        console.log('🚀 Wysyłanie żądania importu...');
        console.log('📋 Test CSV zawiera kolumny:');
        console.log('   - variety (powinno być mapowane na szczepy)');
        console.log('   - vol (powinno być mapowane na poj)');
        console.log('   - standardowe pola dynamiczne\n');

        const response = await fetch(`${SERVER_URL}/api/import/csv`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(importData),
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ IMPORT ZAKOŃCZONY SUKCESEM!');
            console.log(`📊 Zaimportowano: ${result.data.imported} win`);
            
            if (result.data.errors && result.data.errors.length > 0) {
                console.log(`⚠️  Błędy: ${result.data.errors.length}`);
                result.data.errors.forEach((error, index) => {
                    console.log(`   ${index + 1}. ${error.error}`);
                });
            }

            if (result.data.warnings && result.data.warnings.length > 0) {
                console.log(`⚠️  Ostrzeżenia: ${result.data.warnings.length}`);
                result.data.warnings.forEach((warning, index) => {
                    console.log(`   ${index + 1}. ${warning}`);
                });
            }
            
            // Sprawdź synchronizację po imporcie
            console.log('\n🔍 SPRAWDZANIE SYNCHRONIZACJI PO IMPORCIE...');
            
            const winesResponse = await fetch(`${SERVER_URL}/api/wines?limit=2`);
            if (winesResponse.ok) {
                const winesResult = await winesResponse.json();
                const wines = winesResult.data || [];
                
                if (wines.length > 0) {
                    console.log('📝 STRUKTURA PIERWSZEGO ZAIMPORTOWANEGO WINA:');
                    const firstWine = wines[0];
                    const wineFields = Object.keys(firstWine).filter(key => 
                        !['id', 'createdAt', 'updatedAt'].includes(key)
                    );
                    
                    wineFields.forEach(field => {
                        const value = firstWine[field];
                        console.log(`   - ${field}: "${value}"`);
                    });
                    
                    // Sprawdź czy mapowanie działa
                    console.log('\n🔍 WERYFIKACJA MAPOWANIA:');
                    console.log(`   szczepy (variety->szczepy): "${firstWine.szczepy}"`);
                    console.log(`   poj (vol->poj): "${firstWine.poj}"`);
                    
                    if (firstWine.szczepy === 'Sangiovese') {
                        console.log('   ✅ Mapowanie variety->szczepy działa!');
                    } else {
                        console.log('   ❌ Mapowanie variety->szczepy nie działa');
                    }
                    
                    if (firstWine.poj === '750ml') {
                        console.log('   ✅ Mapowanie vol->poj działa!');
                    } else {
                        console.log('   ❌ Mapowanie vol->poj nie działa');
                    }
                }
            }
            
        } else {
            console.log('❌ BŁĄD IMPORTU:');
            console.log(`   Status: ${response.status}`);
            console.log(`   Error: ${result.error || 'Nieznany błąd'}`);
            
            if (result.validationErrors) {
                console.log('📋 Błędy walidacji:');
                result.validationErrors.forEach((error, index) => {
                    console.log(`   ${index + 1}. ${error.field}: ${error.message}`);
                });
            }
        }
        
    } catch (error) {
        console.error('❌ BŁĄD TESTU:', error.message);
    }
}

// Uruchom test
testDynamicFieldsImport();