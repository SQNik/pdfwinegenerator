/**
 * Collection Wizard Configuration
 * Defines steps for creating a wine collection PDF
 */

const collectionWizardConfig = [
    // ========================================================================
    // KROK 1: Wybór szablonu (Choose Template)
    // ========================================================================
    {
        id: 'template',
        title: 'Wybierz szablon',
        label: 'Szablon',
        icon: 'file-earmark-text',
        description: 'Nadaj nazwę kolekcji i wybierz szablon PDF do wygenerowania katalogu',
        
        // Fields
        fields: [
            {
                type: 'text',
                name: 'collectionName',
                label: 'Nazwa kolekcji',
                placeholder: 'np. Wina białe 2024',
                required: true,
                icon: 'tag',
                help: 'Podaj nazwę identyfikującą tę kolekcję'
            }
        ],
        
        // Custom render function for template selection
        renderFunction: async (container, data, wizard) => {
            // Render collection name field first
            const nameField = `
                <div class="ds-form-group">
                    <label class="ds-label" for="field-collectionName">
                        <i class="bi bi-tag"></i>
                        Nazwa kolekcji
                        <span class="text-danger">*</span>
                    </label>
                    <input 
                        type="text" 
                        class="ds-input" 
                        id="field-collectionName" 
                        name="collectionName"
                        value="${data.collectionName || ''}"
                        placeholder="np. Wina białe 2024"
                        required
                    >
                    <small class="ds-help-text">Podaj nazwę identyfikującą tę kolekcję</small>
                </div>
                
                <div class="ds-form-group">
                    <label class="ds-label">
                        <i class="bi bi-file-earmark-pdf"></i>
                        Wybierz szablon PDF
                        <span class="text-danger">*</span>
                    </label>
                    <div class="wizard-grid wizard-grid-3" id="templates-grid">
                        <div class="text-center" style="grid-column: 1 / -1;">
                            <i class="bi bi-hourglass-split"></i> Ładowanie szablonów...
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML = nameField;
            
            // Add change listener for collection name
            const nameInput = container.querySelector('#field-collectionName');
            nameInput.addEventListener('change', (e) => {
                data.collectionName = e.target.value;
                wizard.saveState();
            });
            
            // Load templates from API
            try {
                const response = await fetch('/api/pdf/templates');
                const templates = await response.json();
                
                const templatesGrid = container.querySelector('#templates-grid');
                
                if (templates.length === 0) {
                    templatesGrid.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                            <i class="bi bi-inbox" style="font-size: 3rem; color: #cbd5e0;"></i>
                            <p style="color: #718096; margin-top: 1rem;">Brak dostępnych szablonów</p>
                        </div>
                    `;
                    return;
                }
                
                templatesGrid.innerHTML = templates.map(template => `
                    <div class="wizard-card ${data.templateId === template.id ? 'selected' : ''}" 
                         data-template-id="${template.id}">
                        <div class="wizard-card-checkmark">
                            <i class="bi bi-check"></i>
                        </div>
                        <div class="wizard-card-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">
                            <i class="bi bi-file-earmark-pdf"></i>
                        </div>
                        <h4 class="wizard-card-title">${template.name}</h4>
                        <p class="wizard-card-description">${template.description || 'Szablon PDF'}</p>
                        <small style="color: #718096; font-size: 0.75rem;">
                            Format: ${template.format || 'A4'}
                        </small>
                    </div>
                `).join('');
                
                // Add click handlers
                templatesGrid.querySelectorAll('.wizard-card').forEach(card => {
                    card.addEventListener('click', () => {
                        // Deselect all
                        templatesGrid.querySelectorAll('.wizard-card').forEach(c => c.classList.remove('selected'));
                        // Select clicked
                        card.classList.add('selected');
                        
                        // Save selection
                        const templateId = card.dataset.templateId;
                        data.templateId = templateId;
                        data.templateName = templates.find(t => t.id === templateId)?.name;
                        wizard.saveState();
                    });
                });
                
            } catch (error) {
                console.error('Error loading templates:', error);
                container.querySelector('#templates-grid').innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #e53e3e;">
                        <i class="bi bi-exclamation-triangle"></i>
                        <p>Błąd ładowania szablonów</p>
                    </div>
                `;
            }
        },
        
        // Validation
        validate: async (data) => {
            const errors = [];
            if (!data.collectionName || data.collectionName.trim() === '') {
                errors.push('Nazwa kolekcji jest wymagana');
            }
            if (!data.templateId) {
                errors.push('Wybierz szablon PDF');
            }
            return errors;
        }
    },
    
    // ========================================================================
    // KROK 2: Wybór okładki (Choose Cover)
    // ========================================================================
    {
        id: 'cover',
        title: 'Wybierz okładkę',
        label: 'Okładka',
        icon: 'card-image',
        description: 'Wybierz obraz okładki z dostępnych lub prześlij własny',
        
        renderFunction: async (container, data, wizard) => {
            container.innerHTML = `
                <div class="ds-form-group">
                    <label class="ds-label">
                        <i class="bi bi-images"></i>
                        Dostępne okładki
                    </label>
                    <div class="wizard-grid wizard-grid-3" id="covers-grid">
                        <div class="text-center" style="grid-column: 1 / -1;">
                            <i class="bi bi-hourglass-split"></i> Ładowanie okładek...
                        </div>
                    </div>
                </div>
                
                <div class="ds-form-group">
                    <label class="ds-label">
                        <i class="bi bi-cloud-upload"></i>
                        Lub prześlij własną okładkę
                    </label>
                    <div class="wizard-upload-area" id="cover-upload">
                        <i class="bi bi-cloud-arrow-up" style="font-size: 3rem; color: #cbd5e0;"></i>
                        <p style="margin-top: 1rem; color: #718096;">
                            Przeciągnij plik lub kliknij, aby wybrać
                        </p>
                        <small style="color: #a0aec0;">PNG, JPG (max 5MB)</small>
                        <input type="file" id="cover-file-input" accept="image/*" style="display: none;">
                    </div>
                    <div id="upload-preview" style="display: none; margin-top: 1rem;">
                        <img id="uploaded-cover" style="max-width: 100%; max-height: 300px; border-radius: 0.75rem;">
                        <button type="button" class="ds-btn ds-btn-secondary mt-2" id="remove-upload">
                            <i class="bi bi-trash"></i> Usuń
                        </button>
                    </div>
                </div>
            `;
            
            // Load available covers
            const coversGrid = container.querySelector('#covers-grid');
            try {
                const response = await fetch('/api/covers');  // You'll need to implement this endpoint
                const covers = await response.json();
                
                if (covers.length === 0) {
                    coversGrid.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                            <i class="bi bi-image" style="font-size: 3rem; color: #cbd5e0;"></i>
                            <p style="color: #718096; margin-top: 1rem;">Brak dostępnych okładek</p>
                        </div>
                    `;
                } else {
                    coversGrid.innerHTML = covers.map(cover => `
                        <div class="wizard-card ${data.coverId === cover.id ? 'selected' : ''}" 
                             data-cover-id="${cover.id}">
                            <div class="wizard-card-checkmark">
                                <i class="bi bi-check"></i>
                            </div>
                            <img src="${cover.url}" class="wizard-card-image" alt="${cover.name}">
                            <h4 class="wizard-card-title">${cover.name}</h4>
                        </div>
                    `).join('');
                    
                    // Add click handlers
                    coversGrid.querySelectorAll('.wizard-card').forEach(card => {
                        card.addEventListener('click', () => {
                            coversGrid.querySelectorAll('.wizard-card').forEach(c => c.classList.remove('selected'));
                            card.classList.add('selected');
                            
                            data.coverId = card.dataset.coverId;
                            data.coverUrl = covers.find(c => c.id === card.dataset.coverId)?.url;
                            data.uploadedCover = null; // Clear uploaded if selecting from library
                            wizard.saveState();
                        });
                    });
                }
            } catch (error) {
                console.error('Error loading covers:', error);
                // Show default covers or empty state
                coversGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                        <i class="bi bi-image" style="font-size: 3rem; color: #cbd5e0;"></i>
                        <p style="color: #718096; margin-top: 1rem;">Brak dostępnych okładek</p>
                    </div>
                `;
            }
            
            // File upload handling
            const uploadArea = container.querySelector('#cover-upload');
            const fileInput = container.querySelector('#cover-file-input');
            const uploadPreview = container.querySelector('#upload-preview');
            const uploadedImg = container.querySelector('#uploaded-cover');
            const removeBtn = container.querySelector('#remove-upload');
            
            uploadArea.addEventListener('click', () => fileInput.click());
            
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('dragover');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('dragover');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('dragover');
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    handleFileUpload(file);
                }
            });
            
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    handleFileUpload(file);
                }
            });
            
            removeBtn.addEventListener('click', () => {
                data.uploadedCover = null;
                uploadPreview.style.display = 'none';
                fileInput.value = '';
                wizard.saveState();
            });
            
            function handleFileUpload(file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('Plik jest za duży. Maksymalny rozmiar to 5 MB.');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadedImg.src = e.target.result;
                    uploadPreview.style.display = 'block';
                    
                    // Clear library selection
                    coversGrid.querySelectorAll('.wizard-card').forEach(c => c.classList.remove('selected'));
                    
                    // Save uploaded image data
                    data.uploadedCover = {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        data: e.target.result
                    };
                    data.coverId = null;
                    wizard.saveState();
                };
                reader.readAsDataURL(file);
            }
            
            // Restore uploaded cover if exists
            if (data.uploadedCover) {
                uploadedImg.src = data.uploadedCover.data;
                uploadPreview.style.display = 'block';
            }
        },
        
        validate: async (data) => {
            const errors = [];
            if (!data.coverId && !data.uploadedCover) {
                errors.push('Wybierz okładkę lub prześlij własną');
            }
            return errors;
        }
    },
    
    // Rest of the configuration will be in another file due to length...
];

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = collectionWizardConfig;
}
