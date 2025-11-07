/**
 * Test skrypt do sprawdzenia działania normalizacji kategorii
 */

console.log('=== TEST NORMALIZACJI KATEGORII ===');

// Test case-insensitive comparison
const testCases = [
  { data: 'czerwone', config: ['Czerwone', 'Białe', 'Różowe'] },
  { data: 'BIAŁE', config: ['Czerwone', 'Białe', 'Różowe'] }, 
  { data: 'różowe', config: ['Czerwone', 'Białe', 'Różowe'] },
  { data: 'Pomarańczowoczerwony', config: ['Czerwone', 'Białe', 'Różowe', 'pomarańczowoczerwony'] }
];

testCases.forEach((testCase, index) => {
  console.log(`\nTest ${index + 1}:`);
  console.log(`Data value: "${testCase.data}"`);
  console.log(`Config options: [${testCase.config.map(o => `"${o}"`).join(', ')}]`);
  
  // Simulate backend normalization
  const matchingOption = testCase.config.find(option => 
    option.toLowerCase() === testCase.data.toLowerCase()
  );
  const normalizedValue = matchingOption ? matchingOption.toLowerCase() : testCase.data;
  
  console.log(`Matching option: "${matchingOption || 'NONE'}"`);
  console.log(`Normalized value: "${normalizedValue}"`);
  
  // Simulate frontend display
  const displayValue = normalizedValue.charAt(0).toUpperCase() + normalizedValue.slice(1);
  console.log(`Display value: "${displayValue}"`);
  
  console.log(`✅ ${matchingOption ? 'MATCH FOUND' : '❌ NO MATCH'}`);
});

console.log('\n=== KONIEC TESTÓW ===');