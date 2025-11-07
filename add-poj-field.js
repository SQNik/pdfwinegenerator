const fs = require('fs');
const path = require('path');

console.log('➕ Dodawanie brakującego pola "poj" do wines.json...');

try {
    // Wczytaj dane
    const winesPath = path.join(__dirname, 'data', 'wines.json');
    const winesData = JSON.parse(fs.readFileSync(winesPath, 'utf8'));
    
    console.log(`📊 Znaleziono ${winesData.length} win`);
    
    // Sprawdź które wina nie mają pola poj
    const winesWithoutPoj = winesData.filter(wine => !wine.hasOwnProperty('poj'));
    console.log(`🔍 Win bez pola "poj": ${winesWithoutPoj.length}`);
    
    if (winesWithoutPoj.length === 0) {
        console.log('✅ Wszystkie wina już mają pole "poj"');
        process.exit(0);
    }
    
    // Utwórz kopię zapasową
    const backupPath = winesPath + '.backup-before-poj-addition';
    fs.copyFileSync(winesPath, backupPath);
    console.log(`💾 Utworzono kopię zapasową: ${backupPath}`);
    
    // Dodaj puste pole poj do win, które go nie mają
    const updatedWines = winesData.map(wine => {
        if (!wine.hasOwnProperty('poj')) {
            // Dodajemy pole poj przed polami systemowymi (id, createdAt, updatedAt)
            const { id, createdAt, updatedAt, ...otherFields } = wine;
            return {
                ...otherFields,
                poj: "", // Dodaj puste pole poj
                id,
                createdAt,
                updatedAt
            };
        }
        return wine;
    });
    
    // Zapisz zaktualizowane dane
    fs.writeFileSync(winesPath, JSON.stringify(updatedWines, null, 2));
    
    console.log('✅ Pomyślnie dodano pole "poj" do wszystkich win');
    console.log(`📝 Zaktualizowano ${updatedWines.length} rekordów win`);
    
    // Weryfikacja
    const verifyData = JSON.parse(fs.readFileSync(winesPath, 'utf8'));
    const winesStillWithoutPoj = verifyData.filter(wine => !wine.hasOwnProperty('poj'));
    
    if (winesStillWithoutPoj.length > 0) {
        console.log(`❌ BŁĄD: ${winesStillWithoutPoj.length} win nadal nie ma pola "poj"`);
        process.exit(1);
    } else {
        console.log('✅ Weryfikacja: Wszystkie wina mają pole "poj"');
        
        // Pokaż aktualną strukturę pierwszego wina
        console.log('📋 Aktualna struktura pól:');
        const firstWine = verifyData[0];
        const fields = Object.keys(firstWine).filter(key => !['id', 'createdAt', 'updatedAt'].includes(key));
        fields.forEach(field => console.log(`   - ${field}`));
    }
    
} catch (error) {
    console.error('❌ Błąd podczas dodawania pola poj:', error.message);
    process.exit(1);
}