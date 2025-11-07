/**
 * Test script to verify Google Sheets import functionality
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';
const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQG6QpmcXuj1ept4y1ANqjhtD711ui6EnmUXOEZix_3nKQ2RvxjsKkBaLCJb4bfHNktH2Uk7ws6SwKU/pub?gid=332876755&single=true&output=csv';

async function testGoogleSheetsImport() {
    console.log('🧪 Testing Google Sheets import functionality...\n');

    try {
        // Test 1: Check if URL is accessible directly
        console.log('Test 1: Checking if Google Sheets URL is accessible...');
        console.log('URL:', GOOGLE_SHEETS_URL);
        
        const directResponse = await fetch(GOOGLE_SHEETS_URL);
        console.log('Direct fetch status:', directResponse.status);
        console.log('Direct fetch headers:', Object.fromEntries(directResponse.headers.entries()));
        
        if (directResponse.ok) {
            const csvContent = await directResponse.text();
            console.log('CSV content length:', csvContent.length);
            console.log('First 200 characters:', csvContent.substring(0, 200));
            console.log('✅ Google Sheets URL is accessible\n');
        } else {
            console.log('❌ Google Sheets URL is not accessible');
            console.log('Status:', directResponse.status, directResponse.statusText);
            return;
        }

        // Test 2: Test import via API
        console.log('Test 2: Testing import via API...');
        
        const importData = {
            url: GOOGLE_SHEETS_URL,
            clearBefore: true,
            validateFields: true
        };

        const apiResponse = await fetch(`${BASE_URL}/api/import/google-sheets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(importData)
        });

        console.log('API Response status:', apiResponse.status);
        const result = await apiResponse.json();
        
        if (result.success) {
            console.log('✅ Import successful!');
            console.log('Imported wines:', result.data.imported);
            console.log('Errors:', result.data.errors.length);
            
            if (result.data.errors.length > 0) {
                console.log('Import errors:');
                result.data.errors.forEach((error, index) => {
                    console.log(`  ${index + 1}. ${error.error}`);
                });
            }
        } else {
            console.log('❌ Import failed:', result.error);
            if (result.validationErrors) {
                console.log('Validation errors:', result.validationErrors);
            }
        }

        // Test 3: Check imported wines
        console.log('\nTest 3: Checking imported wines...');
        const winesResponse = await fetch(`${BASE_URL}/api/wines`);
        const winesResult = await winesResponse.json();
        
        if (winesResult.success) {
            console.log('✅ Total wines in system:', winesResult.data.length);
            if (winesResult.data.length > 0) {
                console.log('Sample wine:', {
                    name: winesResult.data[0].name,
                    catalogNumber: winesResult.data[0].catalogNumber,
                    region: winesResult.data[0].region,
                    type: winesResult.data[0].type
                });
            }
        }

        console.log('\n🏁 Test completed!');

    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testGoogleSheetsImport();