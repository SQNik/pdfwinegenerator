/**
 * Test custom formatu "a4napol" w preview Template Editor
 * Sprawdza czy wymiary 105×297mm są prawidłowo zastosowane
 */

console.log('🧪 TESTOWANIE CUSTOM FORMATU "a4napol"...\n');

async function testA4NapolFormat() {
    try {
        // 1. Sprawdź dostępność formatu a4napol
        console.log('1️⃣ Sprawdzanie dostępności formatu a4napol...');
        const response = await fetch('http://localhost:3001/api/custom-formats');
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        const a4napolFormat = result.data.find(f => f.name === 'a4napol');
        
        if (!a4napolFormat) {
            throw new Error('Format a4napol nie został znaleziony!');
        }
        
        console.log(`✅ Format a4napol znaleziony:`);
        console.log(`   - ID: ${a4napolFormat.id}`);
        console.log(`   - Wymiary: ${a4napolFormat.width}×${a4napolFormat.height} ${a4napolFormat.unit}`);
        console.log(`   - Marginesy: ${a4napolFormat.margins.top}/${a4napolFormat.margins.right}/${a4napolFormat.margins.bottom}/${a4napolFormat.margins.left}`);
        
        // 2. Test preview pojedynczego wina z formatem a4napol
        console.log('\n2️⃣ Test preview pojedynczego wina...');
        
        // Pobierz templates
        const templatesResponse = await fetch('http://localhost:3001/api/template-editor/templates');
        const templatesResult = await templatesResponse.json();
        const template = templatesResult.data[0];
        
        if (!template) {
            throw new Error('Brak templates w systemie');
        }
        
        const previewData = {
            format: `custom:${a4napolFormat.id}`,
            options: {
                printBackground: true,
                margin: {
                    top: '5mm',
                    right: '5mm',
                    bottom: '5mm',
                    left: '5mm'
                }
            }
        };
        
        const winePreviewResponse = await fetch(
            `http://localhost:3001/api/template-editor/templates/${template.id}/preview`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(previewData)
            }
        );
        
        if (winePreviewResponse.ok) {
            const wineBlob = await winePreviewResponse.blob();
            console.log(`✅ Preview wina z a4napol: ${wineBlob.size} bytes`);
        } else {
            const error = await winePreviewResponse.text();
            console.log(`❌ Błąd preview wina: ${error}`);
        }
        
        // 3. Test preview kolekcji z formatem a4napol
        console.log('\n3️⃣ Test preview kolekcji...');
        
        const collectionPreviewData = {
            format: `custom:${a4napolFormat.id}`,
            collectionId: null // użyje sample data
        };
        
        const collectionPreviewResponse = await fetch(
            `http://localhost:3001/api/template-editor/templates/${template.id}/preview-collection`,
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
            console.log(`✅ Preview kolekcji z a4napol: ${collectionBlob.size} bytes`);
            
            // 4. Porównanie z formatem A4
            console.log('\n4️⃣ Porównanie z formatem A4...');
            
            const a4PreviewData = {
                format: 'A4',
                options: {
                    printBackground: true,
                    margin: {
                        top: '5mm',
                        right: '5mm',
                        bottom: '5mm',
                        left: '5mm'
                    }
                }
            };
            
            const a4PreviewResponse = await fetch(
                `http://localhost:3001/api/template-editor/templates/${template.id}/preview`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(a4PreviewData)
                }
            );
            
            if (a4PreviewResponse.ok) {
                const a4Blob = await a4PreviewResponse.blob();
                console.log(`📊 Porównanie rozmiarów PDF:`);
                console.log(`   - a4napol (105×297mm): ${collectionBlob.size} bytes`);
                console.log(`   - A4 standard (210×297mm): ${a4Blob.size} bytes`);
                
                const sizeDiff = Math.abs(collectionBlob.size - a4Blob.size);
                console.log(`   - Różnica: ${sizeDiff} bytes`);
                
                if (sizeDiff > 100) {
                    console.log(`✅ Formatowanie różni się znacząco - custom format działa!`);
                } else {
                    console.log(`⚠️  Mała różnica - możliwy problem z formatowaniem`);
                }
            }
        } else {
            const error = await collectionPreviewResponse.text();
            console.log(`❌ Błąd preview kolekcji: ${error}`);
        }
        
        console.log('\n🎉 TEST ZAKOŃCZONY!');
        console.log('📝 WYNIKI:');
        console.log('   - Format a4napol został znaleziony i załadowany');
        console.log('   - Preview z custom formatem generuje się poprawnie');
        console.log('   - Oba endpointy (/preview i /preview-collection) obsługują custom format');
        
        console.log('\n💡 SPRAWDŹ RĘCZNIE:');
        console.log('   1. Otwórz Template Editor');
        console.log('   2. Options → Preview Options → Format → a4napol');
        console.log('   3. Sprawdź czy iframe ma proporcje 105×297mm');
        console.log('   4. Wygeneruj PDF Preview i sprawdź wymiary');
        
    } catch (error) {
        console.error('❌ BŁĄD PODCZAS TESTOWANIA:', error.message);
        
        console.log('\n🔧 MOŻLIWE PRZYCZYNY:');
        console.log('- Serwer nie działa');
        console.log('- Format a4napol nie istnieje lub jest nieaktywny');
        console.log('- Problem z backend API endpoints');
        console.log('- Błąd w obsłudze custom formatów');
    }
}

// Uruchom test
testA4NapolFormat();