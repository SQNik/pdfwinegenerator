/**
 * Quick template test after fix
 */

console.log('🧪 SZYBKI TEST SZABLONU PO NAPRAWIE...\n');

const templateId = '68c864f1-e83d-4b2e-9c2b-9627cbbd5279';

async function quickTest() {
    try {
        console.log('📡 Testing template preview...');
        
        const response = await fetch(`http://localhost:3001/api/template-editor/templates/${templateId}/preview-collection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                format: 'A4'
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            console.log(`✅ SUCCESS! Preview generated: ${blob.size} bytes`);
            
            if (blob.size > 10000) {
                console.log('🎉 SZABLON NAPRAWIONY! Duży rozmiar PDF oznacza że wina są renderowane!');
            } else if (blob.size > 1000 && blob.size < 10000) {
                console.log('⚠️  PDF wygenerowany ale może być pusty lub z minimalnymi danymi');
            } else {
                console.log('❌ PDF bardzo mały - prawdopodobnie pusty');
            }
        } else {
            const error = await response.text();
            console.log(`❌ Error: ${error}`);
        }
        
    } catch (error) {
        console.error('❌ BŁĄD:', error.message);
        console.log('🔧 Sprawdź czy serwer działa na porcie 3001');
    }
}

// Wait a bit and test
setTimeout(quickTest, 2000);