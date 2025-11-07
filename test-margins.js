/**
 * Test marginesów dla custom format a4napol
 */

console.log('🔍 DIAGNOZA MARGINESÓW CUSTOM FORMAT "a4napol"...\n');

const templateId = '68c864f1-e83d-4b2e-9c2b-9627cbbd5279';
const customFormatId = '72af14a2-3716-49f3-8369-b059d4793e60'; // a4napol

async function testCustomFormatMargins() {
    try {
        console.log('1️⃣ Sprawdzanie custom format a4napol...');
        
        const formatResponse = await fetch('http://localhost:3001/api/custom-formats');
        const formatResult = await formatResponse.json();
        
        const a4napolFormat = formatResult.data.find(f => f.name === 'a4napol');
        if (a4napolFormat) {
            console.log('✅ Format a4napol znaleziony:');
            console.log(`   - Wymiary: ${a4napolFormat.width}x${a4napolFormat.height} ${a4napolFormat.unit}`);
            console.log(`   - Marginesy: top:${a4napolFormat.margins.top}, right:${a4napolFormat.margins.right}, bottom:${a4napolFormat.margins.bottom}, left:${a4napolFormat.margins.left}`);
        } else {
            console.log('❌ Format a4napol nie znaleziony!');
            return;
        }
        
        console.log('\n2️⃣ Test PDF preview z custom format...');
        
        const pdfPreviewData = {
            format: `custom:${customFormatId}`,
            options: {
                printBackground: true,
                margin: {
                    top: '0mm',
                    right: '0mm', 
                    bottom: '0mm',
                    left: '0mm'
                }
            }
        };
        
        const pdfResponse = await fetch(
            `http://localhost:3001/api/template-editor/templates/${templateId}/preview-collection`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pdfPreviewData)
            }
        );
        
        if (pdfResponse.ok) {
            const blob = await pdfResponse.blob();
            console.log(`   ✅ PDF z custom format: ${blob.size} bytes`);
        } else {
            const error = await pdfResponse.text();
            console.log(`   ❌ PDF preview błąd: ${error}`);
        }
        
        console.log('\n3️⃣ Test PDF preview z standardowym A4 dla porównania...');
        
        const standardPreviewData = {
            format: 'A4',
            options: {
                printBackground: true,
                margin: {
                    top: '0mm',
                    right: '0mm',
                    bottom: '0mm', 
                    left: '0mm'
                }
            }
        };
        
        const standardResponse = await fetch(
            `http://localhost:3001/api/template-editor/templates/${templateId}/preview-collection`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(standardPreviewData)
            }
        );
        
        if (standardResponse.ok) {
            const blob = await standardResponse.blob();
            console.log(`   ✅ PDF ze standardowym A4: ${blob.size} bytes`);
        } else {
            const error = await standardResponse.text();
            console.log(`   ❌ Standard PDF błąd: ${error}`);
        }
        
        console.log('\n💡 ANALIZA:');
        console.log('   🔍 Problem może być w:');
        console.log('   1. Frontend iframe preview - CSS padding z custom format margins');
        console.log('   2. Backend PDF generation - domyślne marginesy Puppeteer');
        console.log('   3. Konflikt między options.margin i customFormat.margins');
        
        console.log('\n🎯 ROZWIĄZANIE:');
        console.log('   - W Template Editor: sprawdź opcje preview');
        console.log('   - Custom format margins powinny nadpisywać options.margin');
        console.log('   - Puppeteer powinien używać margin: 0 dla custom formatów z zerowymi marginesami');
        
    } catch (error) {
        console.error('❌ BŁĄD TESTU:', error.message);
    }
}

// Uruchom test
testCustomFormatMargins();