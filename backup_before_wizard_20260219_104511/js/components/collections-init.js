// Collections Page Initialization
let currentStep = 1;
const totalSteps = 3;

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
    document.getElementById('statusFilter').addEventListener('change', function() {
        collectionsManager.filterCollections();
    });
    
    // View toggle
    document.getElementById('viewCollectionsCards').addEventListener('click', function() {
        document.getElementById('collectionsCardsView').classList.remove('d-none');
        document.getElementById('collectionsTableView').classList.add('d-none');
        this.classList.add('active');
        document.getElementById('viewCollectionsTable').classList.remove('active');
    });
    
    document.getElementById('viewCollectionsTable').addEventListener('click', function() {
        document.getElementById('collectionsTableView').classList.remove('d-none');
        document.getElementById('collectionsCardsView').classList.add('d-none');
        this.classList.add('active');
        document.getElementById('viewCollectionsCards').classList.remove('active');
    });
    
    // Step navigation in modal
    document.getElementById('nextStepBtn').addEventListener('click', function() {
        if (currentStep < totalSteps) {
            if (validateStep(currentStep)) {
                goToStep(currentStep + 1);
            }
        }
    });
    
    document.getElementById('prevStepBtn').addEventListener('click', function() {
        if (currentStep > 1) {
            goToStep(currentStep - 1);
        }
    });
    
    // Reset steps when modal opens
    document.getElementById('collectionModal').addEventListener('show.bs.modal', function() {
        goToStep(1);
        
        // Reset cover selection
        document.querySelectorAll('.cover-image-item').forEach(item => {
            item.classList.remove('selected');
        });
    });
    
    // Cover selection handler
    document.addEventListener('click', function(e) {
        const coverItem = e.target.closest('.cover-image-item');
        if (coverItem) {
            // Remove selection from all items
            document.querySelectorAll('.cover-image-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Add selection to clicked item
            coverItem.classList.add('selected');
            
            console.log('Selected cover:', coverItem.dataset.imagePath || 'None');
        }
    });
});

function goToStep(step) {
    currentStep = step;
    
    // Update step indicators
    document.querySelectorAll('.step-indicator').forEach(indicator => {
        const stepNum = parseInt(indicator.dataset.step);
        indicator.classList.remove('active', 'completed');
        
        if (stepNum < currentStep) {
            indicator.classList.add('completed');
        } else if (stepNum === currentStep) {
            indicator.classList.add('active');
        }
    });
    
    // Update form steps
    document.querySelectorAll('.form-step').forEach(formStep => {
        const stepNum = parseInt(formStep.dataset.step);
        formStep.classList.toggle('d-none', stepNum !== currentStep);
        formStep.classList.toggle('active', stepNum === currentStep);
    });
    
    // Update buttons
    document.getElementById('prevStepBtn').style.display = currentStep > 1 ? 'block' : 'none';
    document.getElementById('nextStepBtn').style.display = currentStep < totalSteps ? 'block' : 'none';
    document.getElementById('saveCollectionBtn').style.display = currentStep === totalSteps ? 'block' : 'none';
}

function validateStep(step) {
    if (step === 1) {
        const name = document.getElementById('collectionName').value.trim();
        if (!name) {
            alert('Podaj nazwę kolekcji');
            return false;
        }
    }
    return true;
}

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
