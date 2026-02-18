// Dashboard initialization and statistics
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Dashboard initializing...');
    
    // Initialize logo modal
    BrandingManager.initModal();
    
    // Load dashboard statistics
    loadDashboardStats();
});

// Show import section
window.showImportSection = function() {
    const section = document.getElementById('import-section');
    section.classList.remove('d-none');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Hide import section
window.hideImportSection = function() {
    const section = document.getElementById('import-section');
    section.classList.add('d-none');
};

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        console.log('📊 Loading dashboard statistics...');
        
        // Load wines count
        const winesResponse = await fetch('/api/wines?limit=1');
        if (winesResponse.ok) {
            const winesData = await winesResponse.json();
            if (winesData.success && winesData.pagination) {
                const wineCount = winesData.pagination.total;
                document.getElementById('totalWines').textContent = wineCount;
                console.log(`✅ Loaded wines count: ${wineCount}`);
            }
        }
        
        // Load collections count
        const collectionsResponse = await fetch('/api/collections');
        if (collectionsResponse.ok) {
            const collectionsData = await collectionsResponse.json();
            if (collectionsData.success && collectionsData.data) {
                const activeCollections = collectionsData.data.filter(c => c.status === 'active');
                document.getElementById('totalCollections').textContent = activeCollections.length;
                console.log(`✅ Loaded collections count: ${activeCollections.length}`);
            }
        }
        
        // Set last import info (placeholder - could be extended with real data)
        document.getElementById('lastImport').textContent = 'Nigdy';
        
        console.log('✅ Dashboard statistics loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading dashboard stats:', error);
        // Show friendly error in UI
        document.getElementById('totalWines').textContent = '—';
        document.getElementById('totalCollections').textContent = '—';
        document.getElementById('lastImport').textContent = 'Błąd';
    }
}
