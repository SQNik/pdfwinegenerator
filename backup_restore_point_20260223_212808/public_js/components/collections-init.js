// Collections Page Initialization

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize logo modal
    BrandingManager.initModal();
    
    // Initialize CollectionFieldsManager first and make it globally available
    const collectionFieldsManager = new CollectionFieldsManager();
    window.collectionFieldsManager = collectionFieldsManager;
    
    // Initialize fields configuration first (with proper selectors)
    await collectionFieldsManager.init(
        '#collection-fields-table-body',  // containerSelector
        '#collectionFieldModal',           // modalSelector  
        '#collectionFieldEditModal'        // editModalSelector
    );
    
    // Now initialize CollectionsManager (it will find collectionFieldsManager)
    const collectionsManager = new CollectionsManager();
    
    window.collectionsApp = { 
        currentSection: 'collections', 
        managers: { 
            collections: collectionsManager,
            collectionFields: collectionFieldsManager 
        } 
    };
    
    // Initialize CollectionsManager
    await collectionsManager.init();
    
    // Update stats
    updateStats();
    
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Update buttons
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update content - hide all tabs first
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
                content.classList.add('d-none');
            });
            
            // Show selected tab
            const selectedTab = document.getElementById(tabName + 'Tab');
            if (selectedTab) {
                selectedTab.classList.add('active');
                selectedTab.classList.remove('d-none');
            }
        });
    });
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            collectionsManager.filterCollections();
        });
    }
});

function updateStats() {
    const collections = window.collectionsApp?.managers?.collections?.collections || [];
    
    const totalCount = collections.length;
    const activeCount = collections.filter(c => c.status === 'active').length;
    const totalWines = collections.reduce((sum, c) => sum + (c.wines?.length || 0), 0);
    
    document.getElementById('statsTotal').textContent = totalCount;
    document.getElementById('statsActive').textContent = activeCount;
    document.getElementById('statsTotalWines').textContent = totalWines;
    
    // Show/hide empty state
    const emptyState = document.getElementById('emptyState');
    const container = document.getElementById('collectionsContainer');
    if (totalCount === 0) {
        emptyState.classList.remove('d-none');
        container.style.display = 'none';
    } else {
        emptyState.classList.add('d-none');
        container.style.display = 'grid';
    }
}

// Export function for collections manager
window.updateCollectionStats = updateStats;
