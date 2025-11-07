/**
 * Test script to verify catalogNumber uniqueness implementation
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

async function testCatalogNumberUniqueness() {
    console.log('🧪 Testing catalogNumber uniqueness implementation...\n');

    try {
        // Test 1: Create wine with valid catalogNumber
        console.log('Test 1: Creating wine with catalogNumber "TEST-001"');
        const wineData1 = {
            name: 'Test Wine 1',
            catalogNumber: 'TEST-001',
            description: 'Test wine for uniqueness validation',
            type: 'wytrawne',
            category: 'Czerwone'
        };

        const response1 = await fetch(`${BASE_URL}/api/wines`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(wineData1)
        });

        const result1 = await response1.json();
        
        if (result1.success) {
            console.log('✅ Wine created successfully with catalogNumber:', result1.data.catalogNumber);
        } else {
            console.log('❌ Failed to create wine:', result1.error);
            return;
        }

        // Test 2: Try to create wine with duplicate catalogNumber
        console.log('\nTest 2: Attempting to create wine with duplicate catalogNumber "TEST-001"');
        const wineData2 = {
            name: 'Test Wine 2',
            catalogNumber: 'TEST-001', // Same as above
            description: 'Another test wine with duplicate catalogNumber',
            type: 'półwytrawne',
            category: 'Białe'
        };

        const response2 = await fetch(`${BASE_URL}/api/wines`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(wineData2)
        });

        const result2 = await response2.json();
        
        if (!result2.success && result2.error && result2.error.includes('already exists')) {
            console.log('✅ Duplicate catalogNumber correctly rejected:', result2.error);
        } else {
            console.log('❌ Duplicate catalogNumber should have been rejected!');
            console.log('Response:', result2);
        }

        // Test 3: Create wine with different catalogNumber
        console.log('\nTest 3: Creating wine with different catalogNumber "TEST-002"');
        const wineData3 = {
            name: 'Test Wine 3',
            catalogNumber: 'TEST-002',
            description: 'Test wine with unique catalogNumber',
            type: 'słodkie',
            category: 'Różowe'
        };

        const response3 = await fetch(`${BASE_URL}/api/wines`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(wineData3)
        });

        const result3 = await response3.json();
        
        if (result3.success) {
            console.log('✅ Wine created successfully with catalogNumber:', result3.data.catalogNumber);
        } else {
            console.log('❌ Failed to create wine with unique catalogNumber:', result3.error);
        }

        // Test 4: Test update with existing catalogNumber
        console.log('\nTest 4: Attempting to update wine to use existing catalogNumber');
        
        const updateResponse = await fetch(`${BASE_URL}/api/wines/${result3.data.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                catalogNumber: 'TEST-001' // Already exists
            })
        });

        const updateResult = await updateResponse.json();
        
        if (!updateResult.success && updateResult.error && updateResult.error.includes('already exists')) {
            console.log('✅ Update with duplicate catalogNumber correctly rejected:', updateResult.error);
        } else {
            console.log('❌ Update with duplicate catalogNumber should have been rejected!');
            console.log('Response:', updateResult);
        }

        console.log('\n🏁 Test completed!');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
    }
}

// Run the test
testCatalogNumberUniqueness();