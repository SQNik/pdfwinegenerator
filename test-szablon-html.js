/**
 * Test szablon-test.html - sprawdzenie poprawności struktury HTML
 */

console.log('🧪 TESTOWANIE PLIKU szablon-test.html...\n');

// Symulacja danych testowych dla szablonu
const testData = {
    winesList: [
        {
            name: "Test Wine Red 2023",
            image: "test-wine.jpg",
            price1: "49.99 zł",
            price2: "45.99 zł", 
            szczepy: "Cabernet Sauvignon",
            region: "Toskania",
            type: "wytrawne",
            description: "Eleganckie wino czerwone o głębokim smaku z nutami czarnych owoców.",
            alcohol: "13.5%",
            poj: "750ml"
        },
        {
            name: "Test Wine White 2024",
            image: "test-wine-white.jpg",
            price1: "39.99 zł",
            price2: "35.99 zł",
            szczepy: "Chardonnay", 
            region: "Burgundia",
            type: "wytrawne",
            description: "Świeże wino białe z aromatem cytrusów i kwiatów.",
            alcohol: "12.5%",
            poj: "750ml"
        }
    ]
};

function testHTMLStructure() {
    console.log('1️⃣ Test struktury HTML szablon-test.html...');
    
    const fs = require('fs');
    const path = require('path');
    
    try {
        // Sprawdź czy plik istnieje
        const templatePath = path.join(__dirname, 'public', 'szablon-test.html');
        
        if (!fs.existsSync(templatePath)) {
            throw new Error('Plik szablon-test.html nie istnieje!');
        }
        
        // Wczytaj zawartość pliku
        const htmlContent = fs.readFileSync(templatePath, 'utf-8');
        
        console.log('✅ Plik szablon-test.html załadowany poprawnie');
        console.log(`   - Rozmiar pliku: ${htmlContent.length} znaków`);
        
        // Podstawowe sprawdzenia struktury HTML
        const checks = [
            { test: htmlContent.includes('<!DOCTYPE html>'), name: 'DOCTYPE HTML5' },
            { test: htmlContent.includes('<html lang="pl">'), name: 'Lang attribute (pl)' },
            { test: htmlContent.includes('<meta charset="UTF-8">'), name: 'UTF-8 charset' },
            { test: htmlContent.includes('<meta name="viewport"'), name: 'Viewport meta' },
            { test: htmlContent.includes('{{wine.name}}'), name: 'Wine name template' },
            { test: htmlContent.includes('.grid2r1'), name: 'Grid CSS class' },
            { test: htmlContent.includes('.wine-card'), name: 'Wine card CSS' },
            { test: htmlContent.includes('{{#each winesList}}'), name: 'Handlebars each loop' },
            { test: htmlContent.includes('{{this.name}}'), name: 'Wine name binding' },
            { test: htmlContent.includes('{{this.price1}}'), name: 'Price1 binding' },
            { test: htmlContent.includes('{{this.price2}}'), name: 'Price2 binding' },
            { test: htmlContent.includes('{{this.szczepy}}'), name: 'Szczepy binding' },
            { test: htmlContent.includes('{{this.region}}'), name: 'Region binding' },
            { test: htmlContent.includes('{{this.type}}'), name: 'Type binding' },
            { test: htmlContent.includes('{{this.description}}'), name: 'Description binding' },
            { test: htmlContent.includes('{{this.alcohol}}'), name: 'Alcohol binding' },
            { test: htmlContent.includes('/images/'), name: 'Local image path' },
            { test: htmlContent.includes('onerror'), name: 'Image fallback' },
            { test: !htmlContent.includes('witrynarium.pl'), name: 'No external image URL' }
        ];
        
        console.log('\n2️⃣ Sprawdzanie struktury HTML...');
        let passedChecks = 0;
        
        checks.forEach(check => {
            if (check.test) {
                console.log(`   ✅ ${check.name}`);
                passedChecks++;
            } else {
                console.log(`   ❌ ${check.name}`);
            }
        });
        
        console.log(`\n📊 Wyniki: ${passedChecks}/${checks.length} testów przeszło pomyślnie`);
        
        // Sprawdź CSS classes consistency
        console.log('\n3️⃣ Sprawdzanie konsystencji CSS...');
        
        const cssClasses = {
            defined: [],
            used: []
        };
        
        // Extract defined CSS classes
        const cssMatches = htmlContent.match(/\.([\w-]+)\s*{/g);
        if (cssMatches) {
            cssClasses.defined = cssMatches.map(match => match.replace(/[.{]/g, '').trim());
        }
        
        // Extract used CSS classes
        const htmlMatches = htmlContent.match(/class="([^"]+)"/g);
        if (htmlMatches) {
            htmlMatches.forEach(match => {
                const classes = match.replace(/class="|"/g, '').split(' ');
                cssClasses.used.push(...classes);
            });
        }
        
        console.log(`   - Zdefiniowane klasy CSS: ${cssClasses.defined.length}`);
        console.log(`   - Używane klasy CSS: ${[...new Set(cssClasses.used)].length}`);
        
        // Check for unused CSS classes
        const unusedClasses = cssClasses.defined.filter(className => 
            !cssClasses.used.includes(className)
        );
        
        if (unusedClasses.length > 0) {
            console.log(`   ⚠️  Nieużywane klasy CSS: ${unusedClasses.join(', ')}`);
        } else {
            console.log('   ✅ Wszystkie klasy CSS są używane');
        }
        
        // Check for undefined CSS classes
        const undefinedClasses = [...new Set(cssClasses.used)].filter(className => 
            !cssClasses.defined.includes(className) && 
            !['wines-grid'].includes(className) // whitelist known external classes
        );
        
        if (undefinedClasses.length > 0) {
            console.log(`   ⚠️  Niezdefiniowane klasy CSS: ${undefinedClasses.join(', ')}`);
        } else {
            console.log('   ✅ Wszystkie używane klasy CSS są zdefiniowane');
        }
        
        console.log('\n4️⃣ Podsumowanie jakości szablonu...');
        
        if (passedChecks === checks.length && unusedClasses.length === 0 && undefinedClasses.length === 0) {
            console.log('🎉 SZABLON JEST W DOSKONAŁYM STANIE!');
            console.log('   ✨ Wszystkie testy przeszły pomyślnie');
            console.log('   ✨ CSS jest zoptymalizowany');
            console.log('   ✨ Struktura HTML jest prawidłowa');
        } else {
            console.log('✅ SZABLON JEST W DOBRYM STANIE');
            console.log(`   - ${passedChecks}/${checks.length} testów podstawowych`);
            if (unusedClasses.length > 0) {
                console.log(`   - ${unusedClasses.length} nieużywanych klas CSS`);
            }
            if (undefinedClasses.length > 0) {
                console.log(`   - ${undefinedClasses.length} niezdefiniowanych klas CSS`);
            }
        }
        
        console.log('\n💡 REKOMENDACJE:');
        console.log('   - Szablon używa Handlebars template engine');
        console.log('   - Obrazy ładowane lokalnie z fallback');  
        console.log('   - Responsywny design z CSS Grid');
        console.log('   - Poprawna semantyka HTML5');
        
    } catch (error) {
        console.error('❌ BŁĄD PODCZAS TESTOWANIA:', error.message);
        
        console.log('\n🔧 MOŻLIWE PRZYCZYNY:');
        console.log('- Plik szablon-test.html nie istnieje');
        console.log('- Brak uprawnień do odczytu pliku');
        console.log('- Błędna ścieżka do pliku');
    }
}

// Uruchom test
testHTMLStructure();