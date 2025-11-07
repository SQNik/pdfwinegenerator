const fetch = require('node-fetch');

async function testImport() {
    const csvData = `name,region,type,alcohol,description,category,szczepy,vol,catalogNumber,image
"Test Wine 1","Toskania","wytrawne","13.5%","Opis testowego wina 1","czerwone","Sangiovese","750ml","TEST001","/images/test1.jpg"
"Test Wine 2","Bordeaux","półwytrawne","12%","Opis testowego wina 2","białe","Chardonnay","750ml","TEST002","/images/test2.jpg"`;

    try {
        const response = await fetch('http://localhost:3001/api/import/csv', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                csvData: csvData,
                clearBefore: true,
                validateFields: true
            })
        });

        const result = await response.json();
        console.log('Import result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

testImport();