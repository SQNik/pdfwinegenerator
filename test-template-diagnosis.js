/**
 * Test szablonu "Uklad-Karta składana na pol" - diagnoza pustego podglądu
 */

console.log('🔍 DIAGNOZA SZABLONU "Uklad-Karta składana na pol"...\n');

const templateId = '68c864f1-e83d-4b2e-9c2b-9627cbbd5279';

async function diagnoseTemplate() {
    try {
        console.log('1️⃣ Sprawdzanie szczegółów szablonu...');
        
        const templateResponse = await fetch(`http://localhost:3001/api/template-editor/templates/${templateId}`);
        const templateResult = await templateResponse.json();
        
        if (!templateResult.success) {
            throw new Error(`Nie można pobrać szablonu: ${templateResult.error}`);
        }
        
        const template = templateResult.data;
        console.log(`✅ Szablon załadowany: "${template.name}"`);
        console.log(`   - ID: ${template.id}`);
        console.log(`   - Kategoria: ${template.category}`);
        console.log(`   - HTML Size: ${template.htmlContent.length} znaków`);
        
        // Sprawdź czy szablon używa prawidłowych handlebar expressions
        const handlebarsChecks = [
            { pattern: '{{#each winesList}}', name: 'Each loop dla winesList' },
            { pattern: '{{this.name}}', name: 'Wine name binding' },
            { pattern: '{{this.price1}}', name: 'Price1 binding' },
            { pattern: '{{this.image}}', name: 'Image binding' },
            { pattern: '{{/each}}', name: 'End each loop' }
        ];
        
        console.log('\n2️⃣ Sprawdzanie Handlebars expressions...');
        handlebarsChecks.forEach(check => {
            if (template.htmlContent.includes(check.pattern)) {
                console.log(`   ✅ ${check.name}`);
            } else {
                console.log(`   ❌ ${check.name} - BRAKUJE!`);
            }
        });
        
        console.log('\n3️⃣ Test preview z typem wine (pojedyncze wino)...');
        
        const winePreviewData = {
            format: 'A4',
            options: {
                printBackground: true,
                margin: {
                    top: '10mm',
                    right: '10mm',
                    bottom: '10mm',
                    left: '10mm'
                }
            }
        };
        
        const winePreviewResponse = await fetch(
            `http://localhost:3001/api/template-editor/templates/${templateId}/preview`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(winePreviewData)
            }
        );
        
        if (winePreviewResponse.ok) {
            const wineBlob = await winePreviewResponse.blob();
            console.log(`   ✅ Wine preview wygenerowany: ${wineBlob.size} bytes`);
        } else {
            const error = await winePreviewResponse.text();
            console.log(`   ❌ Wine preview błąd: ${error}`);
        }
        
        console.log('\n4️⃣ Test preview z typem collection (lista win)...');
        
        const collectionPreviewData = {
            format: 'A4',
            collectionId: null // użyje sample data
        };
        
        const collectionPreviewResponse = await fetch(
            `http://localhost:3001/api/template-editor/templates/${templateId}/preview-collection`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(collectionPreviewData)
            }
        );
        
        if (collectionPreviewResponse.ok) {
            const collectionBlob = await collectionPreviewResponse.blob();
            console.log(`   ✅ Collection preview wygenerowany: ${collectionBlob.size} bytes`);
        } else {
            const error = await collectionPreviewResponse.text();
            console.log(`   ❌ Collection preview błąd: ${error}`);
        }
        
        console.log('\n5️⃣ Sprawdzanie dostępnych win dla podglądu...');
        
        const winesResponse = await fetch('http://localhost:3001/api/wines?limit=5');
        const winesResult = await winesResponse.json();
        
        if (winesResult.success && winesResult.data.wines.length > 0) {
            console.log(`   ✅ Dostępne wina: ${winesResult.data.wines.length}`);
            const sampleWine = winesResult.data.wines[0];
            console.log(`   📋 Przykładowe wino: ${sampleWine.name || sampleWine.nazwa}`);
            console.log(`   🏷️  CatalogNumber: ${sampleWine.catalogNumber}`);
        } else {
            console.log(`   ❌ Brak dostępnych win!`);
        }
        
        console.log('\n6️⃣ Analiza problemów...');
        
        // Sprawdź główne przyczyny pustego podglądu
        const issues = [];
        
        if (!template.htmlContent.includes('{{#each winesList}}')) {
            issues.push('Szablon nie zawiera loop dla winesList');
        }
        
        if (!template.htmlContent.includes('{{this.name}}') && !template.htmlContent.includes('{{wine.name}}')) {
            issues.push('Szablon nie zawiera bindingu dla nazwy wina');
        }
        
        if (template.htmlContent.includes('{{wine.') && !template.htmlContent.includes('{{#each')) {
            issues.push('Szablon używa {{wine.*}} ale bez loop - potrzebuje danych pojedynczego wina');
        }
        
        if (issues.length > 0) {
            console.log('   ❌ Znalezione problemy:');
            issues.forEach(issue => console.log(`      - ${issue}`));
        } else {
            console.log('   ✅ Struktura szablonu wygląda poprawnie');
        }
        
        console.log('\n💡 REKOMENDACJE:');
        
        if (template.htmlContent.includes('{{#each winesList}}')) {
            console.log('   🎯 Szablon jest COLLECTION TEMPLATE:');
            console.log('      - Użyj Preview Type: "Collection"');
            console.log('      - Wybierz kolekcję lub użyj sample data');
            console.log('      - Template powinien renderować listę win');
        } else if (template.htmlContent.includes('{{wine.')) {
            console.log('   🍷 Szablon jest WINE TEMPLATE:');
            console.log('      - Użyj Preview Type: "Wine"');
            console.log('      - Wybierz konkretne wino do podglądu');
            console.log('      - Template renderuje pojedyncze wino');
        }
        
        console.log('\n🔧 INSTRUKCJE DEBUGOWANIA:');
        console.log('   1. W Template Editor → Options → Preview Options');
        console.log('   2. Sprawdź "Preview Type" (Wine vs Collection)');
        console.log('   3. Jeśli Collection - wybierz kolekcję lub zostaw puste dla sample data');
        console.log('   4. Jeśli Wine - wybierz konkretne wino z dropdown');
        console.log('   5. Kliknij Apply i sprawdź iframe preview');
        console.log('   6. Jeśli iframe jest pusty - kliknij "PDF Preview" dla debugowania');
        
    } catch (error) {
        console.error('❌ BŁĄD DIAGNOZY:', error.message);
        
        console.log('\n🔧 MOŻLIWE PRZYCZYNY:');
        console.log('- Serwer nie działa na porcie 3001');
        console.log('- Szablon nie istnieje lub został usunięty');
        console.log('- Błędny format danych w szablonie');
        console.log('- Problem z API endpoint');
    }
}

// Uruchom diagnozę
diagnoseTemplate();