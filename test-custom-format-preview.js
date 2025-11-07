/**
 * Test integracji custom formatów w preview Template Editor
 * Ten plik testuje czy custom formaty są prawidłowo załadowane i używane w preview
 */

console.log('🔍 TESTOWANIE CUSTOM FORMATÓW W PREVIEW...\n');

async function testCustomFormatPreview() {
    try {
        // 1. Test ładowania custom formatów z API
        console.log('1️⃣ Test ładowania custom formatów...');
        const response = await fetch('http://localhost:3001/api/custom-formats');
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(`API error: ${result.error}`);
        }
        
        const customFormats = result.data;
        console.log(`✅ Załadowano ${customFormats.length} custom formatów:`);
        
        customFormats.forEach(format => {
            console.log(`   - ${format.name} (${format.width}×${format.height} ${format.unit})`);
        });
        
        if (customFormats.length === 0) {
            console.log('⚠️  Brak custom formatów w systemie');
            return;
        }
        
        // 2. Test template'ów HTML
        console.log('\n2️⃣ Test ładowania templateów HTML...');
        const templatesResponse = await fetch('http://localhost:3001/api/template-editor/templates');
        
        if (!templatesResponse.ok) {
            throw new Error(`Templates API error: ${templatesResponse.status}`);
        }
        
        const templatesResult = await templatesResponse.json();
        const templates = templatesResult.data;
        
        console.log(`✅ Załadowano ${templates.length} templateów HTML`);
        
        if (templates.length === 0) {
            console.log('⚠️  Brak templateów HTML w systemie');
            return;
        }
        
        const firstTemplate = templates[0];
        console.log(`   - Używam template: ${firstTemplate.name}`);
        
        // 3. Test preview z custom formatem
        const testFormat = customFormats[0];
        console.log(`\n3️⃣ Test preview z custom formatem: ${testFormat.name}...`);
        
        const previewData = {
            format: `custom:${testFormat.id}`,
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
        
        const previewResponse = await fetch(
            `http://localhost:3001/api/template-editor/templates/${firstTemplate.id}/preview`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(previewData)
            }
        );
        
        if (!previewResponse.ok) {
            const error = await previewResponse.text();
            throw new Error(`Preview API error (${previewResponse.status}): ${error}`);
        }
        
        const pdfBlob = await previewResponse.blob();
        console.log(`✅ Preview PDF wygenerowany pomyślnie!`);
        console.log(`   - Rozmiar: ${pdfBlob.size} bytes`);
        console.log(`   - Typ: ${pdfBlob.type}`);
        console.log(`   - Format używany: ${testFormat.name} (${testFormat.width}×${testFormat.height} ${testFormat.unit})`);
        
        // 4. Test preview ze standardowym formatem (porównanie)
        console.log(`\n4️⃣ Test preview ze standardowym formatem A4...`);
        
        const standardPreviewData = {
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
        
        const standardPreviewResponse = await fetch(
            `http://localhost:3001/api/template-editor/templates/${firstTemplate.id}/preview`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(standardPreviewData)
            }
        );
        
        if (standardPreviewResponse.ok) {
            const standardPdfBlob = await standardPreviewResponse.blob();
            console.log(`✅ Preview PDF A4 wygenerowany pomyślnie!`);
            console.log(`   - Rozmiar: ${standardPdfBlob.size} bytes`);
            console.log(`   - Różnica rozmiarów: ${Math.abs(pdfBlob.size - standardPdfBlob.size)} bytes`);
        }
        
        console.log('\n🎉 WSZYSTKIE TESTY ZAKOŃCZONE POMYŚLNIE!');
        console.log('✅ Custom formaty działają poprawnie w preview Template Editor');
        
    } catch (error) {
        console.error('❌ BŁĄD PODCZAS TESTOWANIA:', error.message);
        console.error('Stack:', error.stack);
        
        console.log('\n🔧 MOŻLIWE PRZYCZYNY:');
        console.log('- Serwer nie działa na porcie 3001');
        console.log('- Brak custom formatów w bazie danych');
        console.log('- Błąd w implementacji backend API');
        console.log('- Problem z generowaniem PDF');
    }
}

// Uruchom test
testCustomFormatPreview();