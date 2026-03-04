/**
 * Complete Collection Wizard Configuration
 * All steps for creating a wine collection PDF
 */

/**
 * Helper function to validate required collection fields for a specific step
 * @param {number} stepNumber - Step number (1-4)
 * @param {object} data - Wizard data object (NOT USED - we use actual data from wizard)
 * @returns {Promise<Array<string>>} Array of error messages
 */
async function validateRequiredCollectionFields(stepNumber, data) {
    const errors = [];
    
    // Initialize collection fields config if not already done
    if (!window.collectionFieldsConfig) {
        window.collectionFieldsConfig = new CollectionFieldsConfig();
        await window.collectionFieldsConfig.init();
    }
    
    // Get fields for this step
    const allFields = await window.collectionFieldsConfig.getActiveFields();
    const stepFields = allFields.filter(field => (field.step || 1) === stepNumber);
    
    // Filter for required fields
    const requiredFields = stepFields.filter(field => field.required === true);
    
    console.log(`🔍 Validating step ${stepNumber} required fields:`, {
        stepFieldsCount: stepFields.length,
        requiredFieldsCount: requiredFields.length,
        requiredFields: requiredFields.map(f => ({ id: f.id, name: f.name })),
        collectionFields: data?.collectionFields
    });
    
    // Check each required field
    for (const field of requiredFields) {
        const value = data?.collectionFields?.[field.id];
        
        // Empty check - allow false for checkboxes but not undefined/null/empty string
        if (value === undefined || value === null || value === '') {
            errors.push(`Pole "${field.name}" jest wymagane`);
            console.log(`  ❌ Required field ${field.id} (${field.name}) is empty`);
        } else {
            console.log(`  ✅ Required field ${field.id} (${field.name}) has value: "${value}"`);
        }
    }
    
    return errors;
}

/**
 * Helper function to render collection fields for a specific step
 * @param {number} stepNumber - Step number (1-4)
 * @param {object} data - Wizard data object (NOT USED - we use wizard.data instead)
 * @param {object} wizard - Wizard instance
 * @returns {Promise<string>} HTML string with rendered fields
 */
async function renderCollectionFieldsForStep(stepNumber, data, wizard) {
    // IMPORTANT: Use wizard.data instead of passed data parameter to ensure we have latest values
    const currentData = wizard ? wizard.data : data;
    
    // Initialize collection fields config if not already done
    if (!window.collectionFieldsConfig) {
        window.collectionFieldsConfig = new CollectionFieldsConfig();
        await window.collectionFieldsConfig.init();
    }
    
    // Get fields for this step
    const allFields = await window.collectionFieldsConfig.getActiveFields();
    const stepFields = allFields.filter(field => (field.step || 1) === stepNumber);
    
    console.log(`🎨 Rendering fields for step ${stepNumber}:`, {
        allFieldsCount: allFields.length,
        stepFieldsCount: stepFields.length,
        stepFields: stepFields.map(f => ({ id: f.id, name: f.name, step: f.step })),
        dataCollectionFields: currentData.collectionFields,
        fullData: currentData
    });
    
    if (stepFields.length === 0) {
        return ''; // No fields for this step
    }
    
    // Ensure collectionFields object exists in data
    if (!currentData.collectionFields) {
        currentData.collectionFields = {};
    }
    
    // Render fields using helper
    const fieldsHTML = stepFields.map(field => {
        const value = currentData.collectionFields[field.id] || '';
        console.log(`  📝 Field ${field.id} (${field.name}): value="${value}"`);
        const fieldHTML = window.CollectionFieldsHelpers.generateFormField(field, value, {
            showLabel: true,
            showHelpText: true,
            additionalClasses: 'wizard-input'
        });
        
        return `
            <div class="ds-form-group">
                ${fieldHTML}
            </div>
        `;
    }).join('');
    
    // Return wrapped fields
    return `
        <div class="wizard-custom-fields" id="customFields-step${stepNumber}">
            <div class="ds-divider" style="margin: var(--space-lg) 0;">
                <i class="bi bi-sliders"></i>
                <span>Dodatkowe pola</span>
            </div>
            ${fieldsHTML}
        </div>
    `;
}

/**
 * Helper function to collect collection fields data from DOM
 * @param {HTMLElement} container - Container element
 * @param {object} data - Wizard data object
 */
function collectCollectionFieldsData(container, data) {
    if (!data.collectionFields) {
        data.collectionFields = {};
    }
    
    console.log('📦 Collecting collection fields data from container:', container);
    
    // Find all collection field inputs
    const fieldInputs = container.querySelectorAll('[id^="collection_field_"]');
    console.log(`  Found ${fieldInputs.length} collection field inputs`);
    
    fieldInputs.forEach(input => {
        const fieldId = input.name || input.id.replace('collection_field_', '');
        
        if (input.type === 'checkbox') {
            data.collectionFields[fieldId] = input.checked;
            console.log(`  ✓ Checkbox ${fieldId}: ${input.checked}`);
        } else if (input.type === 'radio') {
            if (input.checked) {
                data.collectionFields[fieldId] = input.value;
                console.log(`  ✓ Radio ${fieldId}: ${input.value}`);
            }
        } else {
            data.collectionFields[fieldId] = input.value;
            console.log(`  ✓ Field ${fieldId}: ${input.value}`);
        }
    });
    
    console.log('📦 Final collectionFields:', data.collectionFields);
}

// This file combines all wizard steps into one configuration array
const collectionWizardSteps = [
    // Step 1: Template Selection
    {
        id: 'template',
        title: 'Wybierz szablon',
        label: 'Szablon',
        icon: 'file-earmark-text',
        description: 'Nadaj nazwę kolekcji i wybierz szablon PDF do wygenerowania katalogu',
        
        renderFunction: async (container, data, wizard) => {
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
            
            // Render collection fields for step 1
            const customFieldsHTML = await renderCollectionFieldsForStep(1, data, wizard);
            
            container.innerHTML = nameField + customFieldsHTML;
            
            const nameInput = container.querySelector('#field-collectionName');
            nameInput.addEventListener('change', (e) => {
                data.collectionName = e.target.value;
                wizard.saveState();
            });
            
            // Add event listeners for custom fields
            const customFieldsContainer = container.querySelector('#customFields-step1');
            if (customFieldsContainer) {
                customFieldsContainer.querySelectorAll('input, select, textarea').forEach(input => {
                    input.addEventListener('change', () => {
                        collectCollectionFieldsData(container, data);
                        wizard.saveState();
                    });
                });
            }
            
            try {
                const response = await fetch('/api/template-editor/templates?status=active');
                const result = await response.json();
                
                // API zwraca {success: true, data: [...]}
                const templates = result.data || result || [];
                
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
                        <div class="wizard-card-checkmark"><i class="bi bi-check"></i></div>
                        <div class="wizard-card-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">
                            <i class="bi bi-file-earmark-pdf"></i>
                        </div>
                        <h4 class="wizard-card-title">${template.name}</h4>
                        <p class="wizard-card-description">${template.description || 'Szablon PDF'}</p>
                    </div>
                `).join('');
                
                templatesGrid.querySelectorAll('.wizard-card').forEach(card => {
                    card.addEventListener('click', () => {
                        console.log('🎯 Template card clicked:', card.dataset.templateId);
                        templatesGrid.querySelectorAll('.wizard-card').forEach(c => c.classList.remove('selected'));
                        card.classList.add('selected');
                        const newTemplateId = card.dataset.templateId;
                        const newTemplateName = templates.find(t => t.id === newTemplateId)?.name;
                        
                        console.log('📝 Updating template:', {
                            old: { id: data.templateId, name: data.templateName },
                            new: { id: newTemplateId, name: newTemplateName }
                        });
                        
                        data.templateId = newTemplateId;
                        data.templateName = newTemplateName;
                        wizard.saveState();
                        
                        console.log('✅ Template updated in wizard data:', { templateId: data.templateId, templateName: data.templateName });
                    });
                });
            } catch (error) {
                console.error('Error loading templates:', error);
                const templatesGrid = container.querySelector('#templates-grid');
                if (templatesGrid) {
                    templatesGrid.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #e53e3e;">
                            <i class="bi bi-exclamation-triangle"></i>
                            <p>Błąd ładowania szablonów: ${error.message}</p>
                        </div>
                    `;
                }
            }
        },
        
        collectData: async (container, data) => {
            // Collect collection fields data before validation
            collectCollectionFieldsData(container, data);
            return {};
        },
        
        validate: async (data) => {
            const errors = [];
            
            // Validate built-in fields
            if (!data.collectionName || data.collectionName.trim() === '') {
                errors.push('Nazwa kolekcji jest wymagana');
            }
            if (!data.templateId) {
                errors.push('Wybierz szablon PDF');
            }
            
            // Validate required collection fields for step 1
            const fieldErrors = await validateRequiredCollectionFields(1, data);
            errors.push(...fieldErrors);
            
            return {
                valid: errors.length === 0,
                errors: errors
            };
        }
    },
    
    // Step 2: Cover Selection  
    {
        id: 'cover',
        title: 'Wybierz okładkę',
        label: 'Okładka',
        icon: 'card-image',
        description: 'Wybierz istniejącą okładkę lub dodaj nową (opcjonalne)',
        
        renderFunction: async (container, data, wizard) => {
            container.innerHTML = `
                <div class="ds-form-group">
                    <label class="ds-label">
                        <i class="bi bi-images"></i>
                        Wybierz z galerii
                    </label>
                    <div id="covers-gallery" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                        <div class="text-center" style="grid-column: 1 / -1;">
                            <i class="bi bi-hourglass-split"></i> Ładowanie okładek...
                        </div>
                    </div>
                </div>
                
                <div class="ds-divider" style="margin: 2rem 0; border-top: 1px solid #e2e8f0; position: relative;">
                    <span style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: white; padding: 0 1rem; color: #718096; font-size: 0.875rem;">
                        lub dodaj nową
                    </span>
                </div>
                
                <div class="wizard-upload-area" id="cover-upload">
                    <i class="bi bi-cloud-arrow-up" style="font-size: 3rem; color: #cbd5e0;"></i>
                    <p style="margin-top: 1rem; color: #718096;">
                        Przeciągnij plik lub kliknij, aby wybrać okładkę
                    </p>
                    <small style="color: #a0aec0;">PNG, JPG (max 5MB) - opcjonalne</small>
                    <input type="file" id="cover-file-input" accept="image/*" style="display: none;">
                </div>
                <div id="upload-preview" style="display: none; margin-top: 1rem; text-align: center;">
                    <img id="uploaded-cover" style="max-width: 100%; max-height: 300px; border-radius: 0.75rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <button type="button" class="ds-btn ds-btn-secondary mt-2" id="remove-upload">
                        <i class="bi bi-trash"></i> Usuń okładkę
                    </button>
                </div>
                <div id="cover-custom-fields"></div>
            `;
            
            // Load existing covers from server
            try {
                const response = await fetch('/api/upload/covers');
                const result = await response.json();
                
                const gallery = container.querySelector('#covers-gallery');
                const covers = result.data || [];
                
                if (covers.length === 0) {
                    gallery.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #a0aec0;">
                            <i class="bi bi-images" style="font-size: 2rem;"></i>
                            <p style="margin-top: 0.5rem;">Brak zapisanych okładek</p>
                        </div>
                    `;
                } else {
                    gallery.innerHTML = covers.map(cover => `
                        <div class="cover-gallery-item ${data.coverImagePath === cover.path ? 'selected' : ''}" 
                             data-cover-path="${cover.path}"
                             data-cover-filename="${cover.filename}"
                             style="position: relative; cursor: pointer; border: 2px solid ${data.coverImagePath === cover.path ? '#4299e1' : '#e2e8f0'}; border-radius: 0.5rem; overflow: hidden; transition: all 0.2s;">
                            <div style="position: absolute; top: 0.5rem; right: 0.5rem; background: ${data.coverImagePath === cover.path ? '#4299e1' : 'rgba(255,255,255,0.9)'}; color: ${data.coverImagePath === cover.path ? 'white' : '#718096'}; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; z-index: 10;">
                                <i class="bi ${data.coverImagePath === cover.path ? 'bi-check-circle-fill' : 'bi-circle'}"></i>
                            </div>
                            <img src="${cover.path}" alt="${cover.filename}" style="width: 100%; height: 150px; object-fit: cover;">
                            <div style="padding: 0.5rem; font-size: 0.75rem; color: #718096; background: #f7fafc;">
                                ${cover.filename.substring(0, 20)}${cover.filename.length > 20 ? '...' : ''}
                            </div>
                        </div>
                    `).join('');
                    
                    // Add click handlers to gallery items
                    gallery.querySelectorAll('.cover-gallery-item').forEach(item => {
                        item.addEventListener('click', () => {
                            const coverPath = item.dataset.coverPath;
                            const coverFilename = item.dataset.coverFilename;
                            
                            // Update selection
                            gallery.querySelectorAll('.cover-gallery-item').forEach(i => {
                                i.classList.remove('selected');
                                i.style.borderColor = '#e2e8f0';
                                i.querySelector('.bi').className = 'bi bi-circle';
                                i.querySelector('[style*="background"]').style.background = 'rgba(255,255,255,0.9)';
                                i.querySelector('[style*="background"]').style.color = '#718096';
                            });
                            
                            item.classList.add('selected');
                            item.style.borderColor = '#4299e1';
                            const checkmark = item.querySelector('.bi');
                            checkmark.className = 'bi bi-check-circle-fill';
                            const badge = item.querySelector('[style*="background"]');
                            badge.style.background = '#4299e1';
                            badge.style.color = 'white';
                            
                            // Update wizard data
                            data.coverImagePath = coverPath;
                            data.coverImageFilename = coverFilename;
                            data.uploadedCover = {
                                serverPath: coverPath,
                                filename: coverFilename
                            };
                            
                            // Show preview
                            const uploadedImg = container.querySelector('#uploaded-cover');
                            const uploadPreview = container.querySelector('#upload-preview');
                            uploadedImg.src = coverPath;
                            uploadPreview.style.display = 'block';
                            
                            wizard.saveState();
                            console.log('Selected cover:', coverPath);
                        });
                    });
                }
            } catch (error) {
                console.error('Error loading covers:', error);
                const gallery = container.querySelector('#covers-gallery');
                gallery.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #e53e3e;">
                        <i class="bi bi-exclamation-triangle"></i>
                        <p>Błąd ładowania okładek</p>
                    </div>
                `;
            }
            
            // Render collection fields for step 2 (cover-related fields)
            const customFieldsHTML = await renderCollectionFieldsForStep(2, data, wizard);
            const customFieldsContainer = container.querySelector('#cover-custom-fields');
            if (customFieldsHTML && customFieldsContainer) {
                customFieldsContainer.innerHTML = customFieldsHTML;
                
                // Add event listeners for custom fields
                const fieldsWrapper = customFieldsContainer.querySelector('#customFields-step2');
                if (fieldsWrapper) {
                    fieldsWrapper.querySelectorAll('input, select, textarea').forEach(input => {
                        input.addEventListener('change', () => {
                            collectCollectionFieldsData(container, data);
                            wizard.saveState();
                        });
                    });
                }
            }
            
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
            
            removeBtn.addEventListener('click', async () => {
                // Clear selection from gallery
                const gallery = container.querySelector('#covers-gallery');
                if (gallery) {
                    gallery.querySelectorAll('.cover-gallery-item').forEach(item => {
                        item.classList.remove('selected');
                        item.style.borderColor = '#e2e8f0';
                        item.querySelector('.bi').className = 'bi bi-circle';
                        const badge = item.querySelector('[style*="background"]');
                        badge.style.background = 'rgba(255,255,255,0.9)';
                        badge.style.color = '#718096';
                    });
                }
                
                data.uploadedCover = null;
                data.coverImagePath = null;
                data.coverImageFilename = null;
                uploadPreview.style.display = 'none';
                fileInput.value = '';
                wizard.saveState();
            });
            
            async function handleFileUpload(file) {
                if (file.size > 5 * 1024 * 1024) {
                    alert('Plik jest za duży. Maksymalny rozmiar to 5 MB.');
                    return;
                }
                
                // Show preview immediately from FileReader
                const reader = new FileReader();
                reader.onload = (e) => {
                    uploadedImg.src = e.target.result;
                    uploadPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
                
                // Upload to server
                try {
                    const formData = new FormData();
                    formData.append('coverImage', file);
                    
                    const response = await fetch('/api/upload/cover', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    
                    if (result.success) {
                        // Save server path instead of base64
                        data.coverImagePath = result.data.path;
                        data.coverImageFilename = result.data.filename;
                        data.uploadedCover = {
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            serverPath: result.data.path,
                            filename: result.data.filename
                        };
                        wizard.saveState();
                        console.log('Cover uploaded successfully:', result.data);
                        
                        // Reload gallery to show new cover
                        const reloadResponse = await fetch('/api/upload/covers');
                        const reloadResult = await reloadResponse.json();
                        const gallery = container.querySelector('#covers-gallery');
                        const covers = reloadResult.data || [];
                        
                        if (covers.length > 0) {
                            gallery.innerHTML = covers.map(cover => `
                                <div class="cover-gallery-item ${data.coverImagePath === cover.path ? 'selected' : ''}" 
                                     data-cover-path="${cover.path}"
                                     data-cover-filename="${cover.filename}"
                                     style="position: relative; cursor: pointer; border: 2px solid ${data.coverImagePath === cover.path ? '#4299e1' : '#e2e8f0'}; border-radius: 0.5rem; overflow: hidden; transition: all 0.2s;">
                                    <div style="position: absolute; top: 0.5rem; right: 0.5rem; background: ${data.coverImagePath === cover.path ? '#4299e1' : 'rgba(255,255,255,0.9)'}; color: ${data.coverImagePath === cover.path ? 'white' : '#718096'}; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; z-index: 10;">
                                        <i class="bi ${data.coverImagePath === cover.path ? 'bi-check-circle-fill' : 'bi-circle'}"></i>
                                    </div>
                                    <img src="${cover.path}" alt="${cover.filename}" style="width: 100%; height: 150px; object-fit: cover;">
                                    <div style="padding: 0.5rem; font-size: 0.75rem; color: #718096; background: #f7fafc;">
                                        ${cover.filename.substring(0, 20)}${cover.filename.length > 20 ? '...' : ''}
                                    </div>
                                </div>
                            `).join('');
                            
                            // Re-add click handlers
                            gallery.querySelectorAll('.cover-gallery-item').forEach(item => {
                                item.addEventListener('click', () => {
                                    const coverPath = item.dataset.coverPath;
                                    const coverFilename = item.dataset.coverFilename;
                                    
                                    gallery.querySelectorAll('.cover-gallery-item').forEach(i => {
                                        i.classList.remove('selected');
                                        i.style.borderColor = '#e2e8f0';
                                        i.querySelector('.bi').className = 'bi bi-circle';
                                        i.querySelector('[style*="background"]').style.background = 'rgba(255,255,255,0.9)';
                                        i.querySelector('[style*="background"]').style.color = '#718096';
                                    });
                                    
                                    item.classList.add('selected');
                                    item.style.borderColor = '#4299e1';
                                    const checkmark = item.querySelector('.bi');
                                    checkmark.className = 'bi bi-check-circle-fill';
                                    const badge = item.querySelector('[style*="background"]');
                                    badge.style.background = '#4299e1';
                                    badge.style.color = 'white';
                                    
                                    data.coverImagePath = coverPath;
                                    data.coverImageFilename = coverFilename;
                                    data.uploadedCover = {
                                        serverPath: coverPath,
                                        filename: coverFilename
                                    };
                                    
                                    uploadedImg.src = coverPath;
                                    uploadPreview.style.display = 'block';
                                    
                                    wizard.saveState();
                                });
                            });
                        }
                    } else {
                        alert('Błąd uploadu: ' + result.error);
                        uploadPreview.style.display = 'none';
                    }
                } catch (error) {
                    console.error('Upload error:', error);
                    alert('Błąd podczas uploadu pliku');
                    uploadPreview.style.display = 'none';
                }
            }
            
            if (data.uploadedCover || data.coverImagePath) {
                // If cover was uploaded (has serverPath), use it
                if (data.coverImagePath) {
                    uploadedImg.src = data.coverImagePath;
                } else if (data.uploadedCover && data.uploadedCover.serverPath) {
                    uploadedImg.src = data.uploadedCover.serverPath;
                } else if (data.uploadedCover && data.uploadedCover.data) {
                    // Fallback for old base64 data
                    uploadedImg.src = data.uploadedCover.data;
                }
                uploadPreview.style.display = 'block';
            }
        },
        
        collectData: async (container, data) => {
            // Collect collection fields data before validation
            collectCollectionFieldsData(container, data);
            return {};
        },
        
        validate: async (data) => {
            // Validate required collection fields for step 2
            const fieldErrors = await validateRequiredCollectionFields(2, data);
            
            return {
                valid: fieldErrors.length === 0,
                errors: fieldErrors // Cover is optional, but custom fields may be required
            };
        }
    },
    
    // Step 3: Product Selection
    {
        id: 'products',
        title: 'Wybierz produkty',
        label: 'Produkty',
        icon: 'bottle',
        description: 'Wybierz wina, które chcesz dodać do kolekcji',
        
        renderFunction: async (container, data, wizard) => {
            if (!data.selectedWines) {
                data.selectedWines = [];
            }
            
            container.innerHTML = `
                <div class="wizard-filters">
                    <div class="wizard-search">
                        <input type="text" class="ds-input" id="wine-search" placeholder="Szukaj po nazwie lub numerze...">
                    </div>
                    <div class="wizard-filters-row">
                        <select class="ds-select wizard-filter-select" id="category-filter">
                            <option value="">Wszystkie kategorie</option>
                            <option value="czerwone">Czerwone</option>
                            <option value="białe">Białe</option>
                            <option value="różowe">Różowe</option>
                        </select>
                        <select class="ds-select wizard-filter-select" id="type-filter">
                            <option value="">Wszystkie typy</option>
                            <option value="wytrawne">Wytrawne</option>
                            <option value="półwytrawne">Półwytrawne</option>
                            <option value="półsłodkie">Półsłodkie</option>
                            <option value="słodkie">Słodkie</option>
                        </select>
                    </div>
                    <button type="button" class="ds-btn ds-btn-ghost" id="reset-filters-btn" style="width: 100%; margin-top: 0.5rem;">
                        <i class="bi bi-arrow-counterclockwise"></i> Resetuj filtry
                    </button>
                </div>
                
                <div style="margin-bottom: 1rem; padding: 0.75rem; background: #f0fdf4; border-radius: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <strong>Wybrano: <span id="selected-count">0</span> win</strong>
                            <button type="button" class="ds-btn ds-btn-ghost" id="clear-selection-btn" style="padding: 0.25rem 0.75rem; font-size: 0.875rem;">
                                <i class="bi bi-x-circle"></i> Wyczyść wybór
                            </button>
                        </div>
                        <div id="category-counts" style="display: flex; gap: 1rem; font-size: 0.875rem; color: #718096;"></div>
                    </div>
                </div>
                
                <div class="wizard-wine-grid" id="wines-grid">
                    <div class="text-center" style="grid-column: 1 / -1;">
                        <i class="bi bi-hourglass-split"></i> Ładowanie win...
                    </div>
                </div>
            `;
            
            let allWines = [];
            let filteredWines = [];
            
            try {
                const response = await fetch('/api/wines?limit=1000');
                const result = await response.json();
                
                // API zwraca {success: true, data: [...], pagination: {...}}
                allWines = result.data || result.wines || result || [];
                filteredWines = [...allWines];
                
                renderWines(filteredWines);
                updateSelectedCount();
                
            } catch (error) {
                console.error('Error loading wines:', error);
                container.querySelector('#wines-grid').innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #e53e3e;">
                        <i class="bi bi-exclamation-triangle"></i>
                        <p>Błąd ładowania win: ${error.message}</p>
                    </div>
                `;
            }
            
            function renderWines(wines) {
                const winesGrid = container.querySelector('#wines-grid');
                
                if (wines.length === 0) {
                    winesGrid.innerHTML = `
                        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                            <i class="bi bi-inbox" style="font-size: 3rem; color: #cbd5e0;"></i>
                            <p style="color: #718096;">Nie znaleziono win</p>
                        </div>
                    `;
                    return;
                }
                
                winesGrid.innerHTML = wines.map(wine => {
                    const isSelected = data.selectedWines.some(w => w.catalogNumber === wine.catalogNumber);
                    
                    return `
                        <div class="wizard-wine-card ${isSelected ? 'selected' : ''}" data-catalog-number="${wine.catalogNumber}">
                            <div class="wizard-wine-card-badge">✓ Wybrano</div>
                            <div class="wizard-wine-card-image" style="background-image: url('${wine.image || '/images/wine-placeholder.png'}'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>
                            <div class="wizard-wine-card-body">
                                <div style="text-align: center; font-size: 0.875rem; color: #718096; margin-bottom: 0.5rem;">
                                    <i class="bi bi-hash"></i> ${wine.catalogNumber || 'N/A'}
                                </div>
                                <h4 class="wizard-wine-card-name">${wine.name || 'Bez nazwy'}</h4>
                                <div class="wizard-wine-card-meta">
                                    ${wine.category || wine.type ? `<div>
                                        ${wine.category ? `<i class="bi bi-circle-fill" style="color: ${wine.category === 'czerwone' ? '#8b0000' : wine.category === 'białe' ? '#f4e4c1' : wine.category === 'różowe' ? '#ff69b4' : '#999'};"></i> ${wine.category.charAt(0).toUpperCase() + wine.category.slice(1)}` : ''}
                                        ${wine.category && wine.type ? ' • ' : ''}
                                        ${wine.type ? `<i class="bi bi-droplet"></i> ${wine.type.charAt(0).toUpperCase() + wine.type.slice(1)}` : ''}
                                    </div>` : ''}
                                    ${wine.producent || wine.region ? `<div>
                                        ${wine.producent ? `<i class="bi bi-building"></i> ${wine.producent}` : ''}
                                        ${wine.producent && wine.region ? ' • ' : ''}
                                        ${wine.region ? `<i class="bi bi-geo-alt"></i> ${wine.region}` : ''}
                                    </div>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
                
                winesGrid.querySelectorAll('.wizard-wine-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const catalogNumber = card.dataset.catalogNumber;
                        const wine = wines.find(w => w.catalogNumber === catalogNumber);
                        
                        if (card.classList.contains('selected')) {
                            card.classList.remove('selected');
                            data.selectedWines = data.selectedWines.filter(w => w.catalogNumber !== catalogNumber);
                        } else {
                            card.classList.add('selected');
                            data.selectedWines.push(wine);
                        }
                        
                        updateSelectedCount();
                        wizard.saveState();
                    });
                });
            }
            
            function updateSelectedCount() {
                const countEl = container.querySelector('#selected-count');
                const categoryCountsEl = container.querySelector('#category-counts');
                
                if (countEl) {
                    countEl.textContent = data.selectedWines.length;
                }
                
                if (categoryCountsEl) {
                    // Count wines per category
                    const categoryCounts = {};
                    data.selectedWines.forEach(wine => {
                        const category = wine.category || 'inne';
                        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                    });
                    
                    // Define category colors and names
                    const categoryInfo = {
                        'białe': { name: 'Białe', color: '#f4e4c1', icon: 'bi-brightness-high' },
                        'czerwone': { name: 'Czerwone', color: '#8b0000', icon: 'bi-gem' },
                        'różowe': { name: 'Różowe', color: '#ff69b4', icon: 'bi-flower1' },
                        'musujące': { name: 'Musujące', color: '#4a90e2', icon: 'bi-stars' },
                        'deserowe': { name: 'Deserowe', color: '#d4af37', icon: 'bi-heart' },
                        'inne': { name: 'Inne', color: '#999', icon: 'bi-bottle' }
                    };
                    
                    // Render category counts
                    const categoryHTML = Object.entries(categoryCounts)
                        .sort((a, b) => {
                            const order = ['białe', 'czerwone', 'różowe', 'musujące', 'deserowe', 'inne'];
                            return order.indexOf(a[0]) - order.indexOf(b[0]);
                        })
                        .map(([category, count]) => {
                            const info = categoryInfo[category] || categoryInfo['inne'];
                            return `
                                <span style="display: flex; align-items: center; gap: 0.25rem;">
                                    <i class="bi ${info.icon}" style="color: ${info.color};"></i>
                                    <span>${info.name}: <strong>${count}</strong></span>
                                </span>
                            `;
                        })
                        .join('');
                    
                    categoryCountsEl.innerHTML = categoryHTML;
                }
            }
            
            function filterWines() {
                const searchTerm = container.querySelector('#wine-search').value.toLowerCase();
                const category = container.querySelector('#category-filter').value;
                const type = container.querySelector('#type-filter').value;
                
                filteredWines = allWines.filter(wine => {
                    const matchesSearch = !searchTerm || 
                        (wine.name && wine.name.toLowerCase().includes(searchTerm)) ||
                        (wine.catalogNumber && wine.catalogNumber.toLowerCase().includes(searchTerm));
                    
                    const matchesCategory = !category || (wine.category && wine.category.toLowerCase() === category);
                    const matchesType = !type || (wine.type && wine.type.toLowerCase() === type);
                    
                    return matchesSearch && matchesCategory && matchesType;
                });
                
                renderWines(filteredWines);
            }
            
            function resetFilters() {
                container.querySelector('#wine-search').value = '';
                container.querySelector('#category-filter').value = '';
                container.querySelector('#type-filter').value = '';
                filterWines();
            }
            
            function clearSelection() {
                // Clear selected wines array
                data.selectedWines = [];
                
                // Remove 'selected' class from all wine cards
                container.querySelectorAll('.wizard-wine-card').forEach(card => {
                    card.classList.remove('selected');
                });
                
                // Update counters
                updateSelectedCount();
                
                // Save state
                wizard.saveState();
            }
            
            container.querySelector('#wine-search').addEventListener('input', filterWines);
            container.querySelector('#category-filter').addEventListener('change', filterWines);
            container.querySelector('#type-filter').addEventListener('change', filterWines);
            container.querySelector('#reset-filters-btn').addEventListener('click', resetFilters);
            container.querySelector('#clear-selection-btn').addEventListener('click', clearSelection);
            
            // Render collection fields for step 3 (product/wine selection related)
            const customFieldsHTML = await renderCollectionFieldsForStep(3, data, wizard);
            if (customFieldsHTML) {
                const fieldsDiv = document.createElement('div');
                fieldsDiv.innerHTML = customFieldsHTML;
                container.appendChild(fieldsDiv);
                
                // Add event listeners for custom fields
                const fieldsWrapper = fieldsDiv.querySelector('#customFields-step3');
                if (fieldsWrapper) {
                    fieldsWrapper.querySelectorAll('input, select, textarea').forEach(input => {
                        input.addEventListener('change', () => {
                            collectCollectionFieldsData(container, data);
                            wizard.saveState();
                        });
                    });
                }
            }
        },
        
        collectData: async (container, data) => {
            // Collect collection fields data before validation
            collectCollectionFieldsData(container, data);
            return {};
        },
        
        validate: async (data) => {
            const errors = [];
            
            // Validate built-in requirement
            if (!data.selectedWines || data.selectedWines.length === 0) {
                errors.push('Wybierz co najmniej jedno wino');
            }
            
            // Validate required collection fields for step 3
            const fieldErrors = await validateRequiredCollectionFields(3, data);
            errors.push(...fieldErrors);
            
            return {
                valid: errors.length === 0,
                errors: errors
            };
        }
    },
    
    // Step 4: Summary
    {
        id: 'summary',
        title: 'Podsumowanie',
        label: 'Podsumowanie',
        icon: 'list-check',
        description: 'Określ cenę i pojemność dla każdego wina (opcjonalnie)',
        
        renderFunction: async (container, data, wizard) => {
            if (!data.wineDetails) {
                data.wineDetails = {};
            }
            
            // Initialize category names if not exists
            if (!data.categoryNames) {
                data.categoryNames = {};
            }
            
            // Helper functions to parse values from wine data
            const parsePrice = (value) => {
                if (!value) return '';
                // Convert Polish format (46,90) to English format (46.90)
                return String(value).replace(',', '.').replace(/[^\d.]/g, '');
            };
            
            const parseVolume = (value) => {
                if (!value) return '';
                // Extract only numbers from strings like "0,75 l" or "750ml"
                const cleaned = String(value).replace(',', '.').replace(/[^\d.]/g, '');
                // Convert liters to ml if needed (0.75 -> 750)
                const num = parseFloat(cleaned);
                if (!isNaN(num) && num < 10) {
                    return String(Math.round(num * 1000)); // Convert liters to ml
                }
                return cleaned;
            };
            
            if (!data.categoryNames) {
                data.categoryNames = {};
            }
            
            // Initialize wine categories map (tracks wines moved between sections)
            if (!data.wineCategories) {
                data.wineCategories = {};
            }
            
            // Helper function to format category name
            const formatCategoryName = (category) => {
                if (!category) return 'Bez kategorii';
                const categoryMap = {
                    'białe': 'Wina białe',
                    'czerwone': 'Wina czerwone',
                    'różowe': 'Wina różowe',
                    'musujące': 'Wina musujące',
                    'deserowe': 'Wina deserowe'
                };
                return categoryMap[category.toLowerCase()] || `Wina ${category}`;
            };
            
            // Helper function to get category icon
            const getCategoryIcon = (category) => {
                if (!category) return 'bi-bottle';
                const iconMap = {
                    'białe': 'bi-brightness-high',
                    'czerwone': 'bi-gem',
                    'różowe': 'bi-flower1',
                    'musujące': 'bi-stars',
                    'deserowe': 'bi-heart'
                };
                return iconMap[category.toLowerCase()] || 'bi-bottle';
            };
            
            // Group wines by category (use saved category if wine was moved, otherwise use original)
            const winesByCategory = {};
            (data.selectedWines || []).forEach((wine, index) => {
                // Use saved category if exists (wine was moved), otherwise use original category
                const displayCategory = data.wineCategories[wine.catalogNumber] || wine.category || 'inne';
                if (!winesByCategory[displayCategory]) {
                    winesByCategory[displayCategory] = [];
                }
                winesByCategory[displayCategory].push({ ...wine, originalIndex: index });
            });
            
            // Sort categories by the order they appear in selectedWines (preserve user's drag&drop order)
            // Find first occurrence of each category to determine its display order
            const categoryFirstAppearance = {};
            (data.selectedWines || []).forEach((wine, index) => {
                const displayCategory = data.wineCategories[wine.catalogNumber] || wine.category || 'inne';
                if (categoryFirstAppearance[displayCategory] === undefined) {
                    categoryFirstAppearance[displayCategory] = index;
                }
            });
            
            const sortedCategories = Object.keys(winesByCategory).sort((a, b) => {
                return categoryFirstAppearance[a] - categoryFirstAppearance[b];
            });
            
            container.innerHTML = `
                <div style="margin-bottom: 1.5rem;">
                    <p style="color: #718096;">
                        <strong>${data.selectedWines ? data.selectedWines.length : 0}</strong> wybranych win
                    </p>
                    <p style="color: #718096; font-size: 0.875rem; margin-top: 0.5rem;">
                        <i class="bi bi-grip-vertical"></i> <strong>Kategorie:</strong> Przeciągnij nagłówek kategorii, aby zmienić kolejność sekcji<br>
                        <i class="bi bi-arrow-down-up"></i> <strong>Wina:</strong> Przeciągnij wino, aby zmienić kolejność lub przenieść do innej kategorii
                    </p>
                </div>
                
                ${sortedCategories.map(category => {
                    const wines = winesByCategory[category];
                    const defaultCategoryName = category;
                    const customCategoryName = data.categoryNames[category] || defaultCategoryName;
                    const categoryIcon = getCategoryIcon(category);
                    
                    return `
                        <div class="wizard-category-section" data-category="${category}" draggable="true">
                            <div class="wizard-category-header">
                                <div class="wizard-category-drag-handle" title="Przeciągnij, aby zmienić kolejność kategorii">
                                    <i class="bi bi-grip-vertical"></i>
                                </div>
                                <div class="wizard-category-arrows">
                                    <button class="wizard-arrow-btn wizard-category-up" data-category="${category}" title="Przesuń kategorię w górę">
                                        <i class="bi bi-arrow-up"></i>
                                    </button>
                                    <button class="wizard-arrow-btn wizard-category-down" data-category="${category}" title="Przesuń kategorię w dół">
                                        <i class="bi bi-arrow-down"></i>
                                    </button>
                                </div>
                                <i class="${categoryIcon}"></i>
                                <input type="text" 
                                       class="wizard-category-name-input" 
                                       data-category="${category}"
                                       value="${customCategoryName}"
                                       placeholder="${defaultCategoryName}"
                                       title="Kliknij, aby edytować nazwę kategorii w PDF">
                                <span class="wizard-category-count">
                                    ${wines.length} ${wines.length === 1 ? 'wino' : wines.length < 5 ? 'wina' : 'win'}
                                </span>
                            </div>
                            <ul class="wizard-summary-list wizard-category-wines" data-category="${category}">
                                ${wines.map((wine) => {
                                    const details = data.wineDetails[wine.catalogNumber] || {};
                                    
                                    return `
                                        <li class="wizard-summary-item" 
                                            draggable="true" 
                                            data-index="${wine.originalIndex}"
                                            data-catalog-number="${wine.catalogNumber}"
                                            data-category="${category}">
                                            <div class="wizard-summary-drag-handle">
                                                <i class="bi bi-grip-vertical"></i>
                                            </div>
                                            <div class="wizard-wine-arrows">
                                                <button class="wizard-arrow-btn wizard-wine-up" data-catalog-number="${wine.catalogNumber}" title="Przesuń wino w górę">
                                                    <i class="bi bi-arrow-up"></i>
                                                </button>
                                                <button class="wizard-arrow-btn wizard-wine-down" data-catalog-number="${wine.catalogNumber}" title="Przesuń wino w dół">
                                                    <i class="bi bi-arrow-down"></i>
                                                </button>
                                            </div>
                                            <div class="wizard-summary-image" style="background-image: url('${wine.image || '/images/wine-placeholder.png'}'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>
                                            <div class="wizard-summary-info">
                                                <h4>${wine.name || 'Bez nazwy'}</h4>
                                                <p><i class="bi bi-hash"></i> ${wine.catalogNumber || 'N/A'}</p>
                                                <p style="font-size: 0.75rem; color: #718096;"><i class="bi bi-tag"></i> ${formatCategoryName(wine.category)}</p>
                                            </div>
                                            <div class="wizard-summary-inputs">
                                                <div>
                                                    <label style="font-size: 0.75rem; color: #718096;">Cena (zł)</label>
                                                    <input type="number" class="ds-input wizard-summary-input" 
                                                           data-catalog-number="${wine.catalogNumber}" data-field="price"
                                                           value="${details.price || parsePrice(wine.price1)}" placeholder="0.00" step="0.01" min="0">
                                                </div>
                                                <div>
                                                    <label style="font-size: 0.75rem; color: #718096;">Pojemność (ml)</label>
                                                    <input type="number" class="ds-input wizard-summary-input" 
                                                           data-catalog-number="${wine.catalogNumber}" data-field="volume"
                                                           value="${details.volume || parseVolume(wine.poj) || 750}" placeholder="750" step="1" min="0">
                                                </div>
                                            </div>
                                        </li>
                                    `;
                                }).join('')}
                            </ul>
                        </div>
                    `;
                }).join('')}
            `;
            
            // Handle input changes for price and volume
            container.querySelectorAll('.wizard-summary-input').forEach(input => {
                input.addEventListener('change', (e) => {
                    const catalogNumber = e.target.dataset.catalogNumber;
                    const field = e.target.dataset.field;
                    
                    if (!data.wineDetails[catalogNumber]) {
                        data.wineDetails[catalogNumber] = {};
                    }
                    
                    data.wineDetails[catalogNumber][field] = e.target.value;
                    wizard.saveState();
                });
            });
            
            // Handle category name changes
            container.querySelectorAll('.wizard-category-name-input').forEach(input => {
                input.addEventListener('input', (e) => {
                    const category = e.target.dataset.category;
                    data.categoryNames[category] = e.target.value;
                    wizard.saveState();
                });
                
                input.addEventListener('blur', (e) => {
                    // If empty, reset to default
                    if (!e.target.value.trim()) {
                        const category = e.target.dataset.category;
                        const defaultName = category;
                        e.target.value = defaultName;
                        data.categoryNames[category] = defaultName;
                        wizard.saveState();
                    }
                });
            });
            
            // ===== ARROW BUTTONS FOR WINES =====
            container.querySelectorAll('.wizard-wine-up').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const catalogNumber = btn.dataset.catalogNumber;
                    const currentIndex = data.selectedWines.findIndex(w => w.catalogNumber === catalogNumber);
                    
                    if (currentIndex > 0) {
                        // Swap with previous wine
                        [data.selectedWines[currentIndex - 1], data.selectedWines[currentIndex]] = 
                        [data.selectedWines[currentIndex], data.selectedWines[currentIndex - 1]];
                        
                        wizard.saveState();
                        wizard.showStep(wizard.currentStepIndex);
                        
                        // Scroll to the moved wine after re-render
                        setTimeout(() => {
                            const wizardContainer = document.querySelector('.wizard-content');
                            const movedElement = wizardContainer?.querySelector(`.wizard-summary-item[data-catalog-number="${catalogNumber}"]`);
                            if (movedElement) {
                                movedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }, 100);
                    }
                });
            });
            
            container.querySelectorAll('.wizard-wine-down').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const catalogNumber = btn.dataset.catalogNumber;
                    const currentIndex = data.selectedWines.findIndex(w => w.catalogNumber === catalogNumber);
                    
                    if (currentIndex >= 0 && currentIndex < data.selectedWines.length - 1) {
                        // Swap with next wine
                        [data.selectedWines[currentIndex], data.selectedWines[currentIndex + 1]] = 
                        [data.selectedWines[currentIndex + 1], data.selectedWines[currentIndex]];
                        
                        wizard.saveState();
                        wizard.showStep(wizard.currentStepIndex);
                        
                        // Scroll to the moved wine after re-render
                        setTimeout(() => {
                            const wizardContainer = document.querySelector('.wizard-content');
                            const movedElement = wizardContainer?.querySelector(`.wizard-summary-item[data-catalog-number="${catalogNumber}"]`);
                            if (movedElement) {
                                movedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }, 100);
                    }
                });
            });
            
            // ===== ARROW BUTTONS FOR CATEGORIES =====
            container.querySelectorAll('.wizard-category-up').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const category = btn.dataset.category;
                    
                    // Get all wines from this category
                    const categoryWines = data.selectedWines.filter(
                        w => (data.wineCategories[w.catalogNumber] || w.category || 'inne') === category
                    );
                    
                    if (categoryWines.length === 0) return;
                    
                    // Find first wine index of this category
                    const firstWineIndex = data.selectedWines.findIndex(
                        w => (data.wineCategories[w.catalogNumber] || w.category || 'inne') === category
                    );
                    
                    if (firstWineIndex > 0) {
                        // Find the category before this one
                        const prevWineCategory = data.wineCategories[data.selectedWines[firstWineIndex - 1].catalogNumber] || 
                                                data.selectedWines[firstWineIndex - 1].category || 'inne';
                        
                        // Get all wines from previous category
                        const prevCategoryWines = data.selectedWines.filter(
                            w => (data.wineCategories[w.catalogNumber] || w.category || 'inne') === prevWineCategory
                        );
                        
                        // Remove current category wines
                        data.selectedWines = data.selectedWines.filter(
                            w => (data.wineCategories[w.catalogNumber] || w.category || 'inne') !== category
                        );
                        
                        // Find where previous category starts
                        const prevCategoryStartIndex = data.selectedWines.findIndex(
                            w => (data.wineCategories[w.catalogNumber] || w.category || 'inne') === prevWineCategory
                        );
                        
                        // Insert current category before previous category
                        data.selectedWines.splice(prevCategoryStartIndex, 0, ...categoryWines);
                        
                        wizard.saveState();
                        wizard.showStep(wizard.currentStepIndex);
                        
                        // Scroll to the moved category after re-render
                        setTimeout(() => {
                            const wizardContainer = document.querySelector('.wizard-content');
                            const movedCategory = wizardContainer?.querySelector(`.wizard-category-section[data-category="${category}"]`);
                            if (movedCategory) {
                                movedCategory.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }, 100);
                    }
                });
            });
            
            container.querySelectorAll('.wizard-category-down').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const category = btn.dataset.category;
                    
                    // Get all wines from this category
                    const categoryWines = data.selectedWines.filter(
                        w => (data.wineCategories[w.catalogNumber] || w.category || 'inne') === category
                    );
                    
                    if (categoryWines.length === 0) return;
                    
                    // Find last wine index of this category
                    let lastWineIndex = -1;
                    for (let i = data.selectedWines.length - 1; i >= 0; i--) {
                        if ((data.wineCategories[data.selectedWines[i].catalogNumber] || data.selectedWines[i].category || 'inne') === category) {
                            lastWineIndex = i;
                            break;
                        }
                    }
                    
                    if (lastWineIndex >= 0 && lastWineIndex < data.selectedWines.length - 1) {
                        // Find the category after this one
                        const nextWineCategory = data.wineCategories[data.selectedWines[lastWineIndex + 1].catalogNumber] || 
                                                data.selectedWines[lastWineIndex + 1].category || 'inne';
                        
                        // Get all wines from next category
                        const nextCategoryWines = data.selectedWines.filter(
                            w => (data.wineCategories[w.catalogNumber] || w.category || 'inne') === nextWineCategory
                        );
                        
                        // Remove current category wines
                        data.selectedWines = data.selectedWines.filter(
                            w => (data.wineCategories[w.catalogNumber] || w.category || 'inne') !== category
                        );
                        
                        // Find where next category ends (or find start and add length)
                        const nextCategoryStartIndex = data.selectedWines.findIndex(
                            w => (data.wineCategories[w.catalogNumber] || w.category || 'inne') === nextWineCategory
                        );
                        const insertIndex = nextCategoryStartIndex + nextCategoryWines.length;
                        
                        // Insert current category after next category
                        data.selectedWines.splice(insertIndex, 0, ...categoryWines);
                        
                        wizard.saveState();
                        wizard.showStep(wizard.currentStepIndex);
                        
                        // Scroll to the moved category after re-render
                        setTimeout(() => {
                            const wizardContainer = document.querySelector('.wizard-content');
                            const movedCategory = wizardContainer?.querySelector(`.wizard-category-section[data-category="${category}"]`);
                            if (movedCategory) {
                                movedCategory.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        }, 100);
                    }
                });
            });
            
            // Enhanced Drag and Drop functionality - supports cross-category dragging
            let draggedElement = null;
            let draggedCatalogNumber = null;
            let draggedSourceCategory = null;
            
            const items = container.querySelectorAll('.wizard-summary-item');
            const categoryLists = container.querySelectorAll('.wizard-category-wines');
            
            // Setup drag handlers for wine items
            items.forEach((item) => {
                // Drag start
                item.addEventListener('dragstart', (e) => {
                    draggedElement = item;
                    draggedCatalogNumber = item.dataset.catalogNumber;
                    draggedSourceCategory = item.dataset.category;
                    item.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', draggedCatalogNumber);
                });
                
                // Drag end
                item.addEventListener('dragend', (e) => {
                    item.classList.remove('dragging');
                    // Remove all drag-over highlights
                    items.forEach(i => i.classList.remove('drag-over'));
                    categoryLists.forEach(list => list.classList.remove('drag-over-category'));
                    draggedElement = null;
                    draggedCatalogNumber = null;
                    draggedSourceCategory = null;
                });
                
                // Drag over item
                item.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    
                    if (draggedElement && draggedElement !== item) {
                        item.classList.add('drag-over');
                    }
                });
                
                // Drag enter item
                item.addEventListener('dragenter', (e) => {
                    e.preventDefault();
                    if (draggedElement && draggedElement !== item) {
                        item.classList.add('drag-over');
                    }
                });
                
                // Drag leave item
                item.addEventListener('dragleave', (e) => {
                    item.classList.remove('drag-over');
                });
                
                // Drop on item
                item.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    item.classList.remove('drag-over');
                    
                    if (draggedElement && draggedElement !== item) {
                        const targetCatalogNumber = item.dataset.catalogNumber;
                        const targetCategory = item.dataset.category;
                        
                        // Find wine indices
                        const draggedIndex = data.selectedWines.findIndex(w => w.catalogNumber === draggedCatalogNumber);
                        const targetIndex = data.selectedWines.findIndex(w => w.catalogNumber === targetCatalogNumber);
                        
                        if (draggedIndex !== -1 && targetIndex !== -1) {
                            // Remove dragged wine
                            const [movedWine] = data.selectedWines.splice(draggedIndex, 1);
                            
                            // Track category change if dropped in different category (but keep wine.category as original)
                            if (draggedSourceCategory !== targetCategory) {
                                data.wineCategories[movedWine.catalogNumber] = targetCategory;
                                console.log(`🔄 Wine ${movedWine.catalogNumber} moved from ${draggedSourceCategory} to ${targetCategory}`);
                            }
                            
                            // Recalculate target index after removal
                            const newTargetIndex = data.selectedWines.findIndex(w => w.catalogNumber === targetCatalogNumber);
                            
                            // Insert at new position
                            data.selectedWines.splice(newTargetIndex, 0, movedWine);
                            
                            wizard.saveState();
                            wizard.showStep(wizard.currentStepIndex);
                        }
                    }
                });
            });
            
            // Setup drop handlers for category lists (allows dropping into empty categories)
            categoryLists.forEach((list) => {
                const targetCategory = list.dataset.category;
                
                list.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    
                    // Only highlight if different category
                    if (draggedSourceCategory && draggedSourceCategory !== targetCategory) {
                        list.classList.add('drag-over-category');
                    }
                });
                
                list.addEventListener('dragenter', (e) => {
                    e.preventDefault();
                    if (draggedSourceCategory && draggedSourceCategory !== targetCategory) {
                        list.classList.add('drag-over-category');
                    }
                });
                
                list.addEventListener('dragleave', (e) => {
                    // Only remove if actually leaving the list
                    if (!list.contains(e.relatedTarget)) {
                        list.classList.remove('drag-over-category');
                    }
                });
                
                list.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    list.classList.remove('drag-over-category');
                    
                    // Only process if dropping into different category
                    if (draggedCatalogNumber && draggedSourceCategory !== targetCategory) {
                        const draggedIndex = data.selectedWines.findIndex(w => w.catalogNumber === draggedCatalogNumber);
                        
                        if (draggedIndex !== -1) {
                            // Remove from original position
                            const [movedWine] = data.selectedWines.splice(draggedIndex, 1);
                            
                            // Track category change (but keep wine.category as original)
                            data.wineCategories[movedWine.catalogNumber] = targetCategory;
                            console.log(`🔄 Wine ${movedWine.catalogNumber} moved to ${targetCategory}`);
                            
                            // Find last wine in target category and insert after it
                            let insertIndex = -1;
                            for (let i = data.selectedWines.length - 1; i >= 0; i--) {
                                const wineDisplayCategory = data.wineCategories[data.selectedWines[i].catalogNumber] || data.selectedWines[i].category;
                                if (wineDisplayCategory === targetCategory) {
                                    insertIndex = i + 1;
                                    break;
                                }
                            }
                            
                            // If category is empty, find where it should be in category order
                            if (insertIndex === -1) {
                                const categoryOrder = ['białe', 'różowe', 'czerwone', 'musujące', 'deserowe', 'inne'];
                                const targetCategoryIndex = categoryOrder.indexOf(targetCategory.toLowerCase());
                                
                                // Find first wine from a category that comes after target category
                                for (let i = 0; i < data.selectedWines.length; i++) {
                                    const wineDisplayCategory = data.wineCategories[data.selectedWines[i].catalogNumber] || data.selectedWines[i].category || 'inne';
                                    const wineCategoryIndex = categoryOrder.indexOf(wineDisplayCategory.toLowerCase());
                                    
                                    if (wineCategoryIndex > targetCategoryIndex) {
                                        insertIndex = i;
                                        break;
                                    }
                                }
                                
                                // If no category comes after, append to end
                                if (insertIndex === -1) {
                                    insertIndex = data.selectedWines.length;
                                }
                            }
                            
                            // Insert at calculated position
                            data.selectedWines.splice(insertIndex, 0, movedWine);
                            
                            wizard.saveState();
                            wizard.showStep(wizard.currentStepIndex);
                        }
                    }
                });
            });
            
            // ===== DRAG & DROP FOR CATEGORY SECTIONS =====
            let draggedCategorySection = null;
            let draggedCategoryName = null;
            
            const categorySections = container.querySelectorAll('.wizard-category-section');
            
            categorySections.forEach((section) => {
                const categoryName = section.dataset.category;
                
                // Prevent dragging when user is editing category name input
                const categoryInput = section.querySelector('.wizard-category-name-input');
                if (categoryInput) {
                    categoryInput.addEventListener('mousedown', (e) => {
                        e.stopPropagation();
                        section.setAttribute('draggable', 'false');
                    });
                    
                    categoryInput.addEventListener('blur', () => {
                        section.setAttribute('draggable', 'true');
                    });
                }
                
                // Drag start
                section.addEventListener('dragstart', (e) => {
                    // Don't allow dragging if user is editing the input
                    if (document.activeElement === categoryInput) {
                        e.preventDefault();
                        return;
                    }
                    
                    draggedCategorySection = section;
                    draggedCategoryName = categoryName;
                    section.classList.add('dragging-category');
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', categoryName);
                });
                
                // Drag end
                section.addEventListener('dragend', (e) => {
                    section.classList.remove('dragging-category');
                    categorySections.forEach(s => s.classList.remove('drag-over-category-section'));
                    draggedCategorySection = null;
                    draggedCategoryName = null;
                });
                
                // Drag over
                section.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    
                    if (draggedCategorySection && draggedCategorySection !== section) {
                        e.dataTransfer.dropEffect = 'move';
                        section.classList.add('drag-over-category-section');
                    }
                });
                
                // Drag enter
                section.addEventListener('dragenter', (e) => {
                    e.preventDefault();
                    if (draggedCategorySection && draggedCategorySection !== section) {
                        section.classList.add('drag-over-category-section');
                    }
                });
                
                // Drag leave
                section.addEventListener('dragleave', (e) => {
                    // Only remove if actually leaving the section
                    if (!section.contains(e.relatedTarget)) {
                        section.classList.remove('drag-over-category-section');
                    }
                });
                
                // Drop
                section.addEventListener('drop', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    section.classList.remove('drag-over-category-section');
                    
                    if (draggedCategorySection && draggedCategorySection !== section) {
                        const targetCategoryName = section.dataset.category;
                        
                        console.log(`🔄 Moving category "${draggedCategoryName}" before/after "${targetCategoryName}"`);
                        
                        // Get all wines from dragged category (check both original category and moved category)
                        const draggedCategoryWines = data.selectedWines.filter(
                            w => (data.wineCategories[w.catalogNumber] || w.category || 'inne') === draggedCategoryName
                        );
                        
                        // Remove dragged category wines from array
                        data.selectedWines = data.selectedWines.filter(
                            w => (data.wineCategories[w.catalogNumber] || w.category || 'inne') !== draggedCategoryName
                        );
                        
                        // Find insertion point (first wine of target category)
                        const targetIndex = data.selectedWines.findIndex(
                            w => (data.wineCategories[w.catalogNumber] || w.category || 'inne') === targetCategoryName
                        );
                        
                        if (targetIndex !== -1) {
                            // Insert dragged wines before target category
                            data.selectedWines.splice(targetIndex, 0, ...draggedCategoryWines);
                        } else {
                            // If target not found, append at end
                            data.selectedWines.push(...draggedCategoryWines);
                        }
                        
                        console.log(`✅ Category moved. New order:`, 
                            [...new Set(data.selectedWines.map(w => data.wineCategories[w.catalogNumber] || w.category || 'inne'))]);
                        
                        wizard.saveState();
                        wizard.showStep(wizard.currentStepIndex);
                    }
                });
            });
        },
        
        collectData: async (container, data) => {
            // ✅ FIX: Collect wine details (price, volume) from inputs before proceeding
            // This ensures default values are saved even if user doesn't change them
            console.log('📦 Collecting wine details from step 4 (summary)...');
            
            if (!data.wineDetails) {
                data.wineDetails = {};
            }
            
            const inputs = container.querySelectorAll('.wizard-summary-input');
            console.log(`  Found ${inputs.length} input fields`);
            
            inputs.forEach(input => {
                const catalogNumber = input.dataset.catalogNumber;
                const field = input.dataset.field;
                const value = input.value;
                
                if (catalogNumber && field) {
                    if (!data.wineDetails[catalogNumber]) {
                        data.wineDetails[catalogNumber] = {};
                    }
                    data.wineDetails[catalogNumber][field] = value;
                    console.log(`  ✅ Saved ${field} for wine ${catalogNumber}: ${value}`);
                }
            });
            
            console.log('📦 Final wineDetails:', data.wineDetails);
            return {};
        },
        
        validate: async (data) => {
            return {
                valid: true,
                errors: [] // Optional fields
            };
        }
    },
    
    // Step 5: Completion
    {
        id: 'completion',
        title: 'Zakończenie',
        label: 'Zakończ',
        icon: 'check-circle',
        description: 'Wygeneruj kolekcję lub zapisz do późniejszego użycia',
        completeLabel: 'Zapisz i zamknij',
        saveLabel: 'Zapisz na później',
        
        renderFunction: async (container, data, wizard) => {
            container.innerHTML = `
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 2rem; border-radius: 1rem; margin-bottom: 2rem; text-align: center;">
                    <i class="bi bi-check-circle" style="font-size: 4rem;"></i>
                    <h3 style="margin:1rem 0 0.5rem 0;">Kolekcja gotowa!</h3>
                    <p style="opacity: 0.9;">Wszystko jest przygotowane do wygenerowania PDF</p>
                </div>
                
                <div class="ds-card">
                    <div class="ds-card-body">
                        <h4 style="margin-bottom: 1rem;"><i class="bi bi-info-circle"></i> Podsumowanie kolekcji</h4>
                        
                        <div style="display: grid; gap: 1rem;">
                            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f7fafc; border-radius: 0.5rem;">
                                <span style="color: #718096;">Nazwa kolekcji:</span>
                                <strong>${data.collectionName || 'Bez nazwy'}</strong>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f7fafc; border-radius: 0.5rem;">
                                <span style="color: #718096;">Szablon:</span>
                                <strong>${data.templateName || 'Nie wybrano'}</strong>
                            </div>
                            
                            <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: #f7fafc; border-radius: 0.5rem;">
                                <span style="color: #718096;">Liczba win:</span>
                                <strong>${data.selectedWines ? data.selectedWines.length : 0}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },
        
        validate: async (data) => {
            const errors = [];
            if (!data.collectionName) errors.push('Brak nazwy kolekcji');
            if (!data.templateId) errors.push('Nie wybrano szablonu');
            if (!data.selectedWines || data.selectedWines.length === 0) errors.push('Nie wybrano żadnych win');
            return {
                valid: errors.length === 0,
                errors: errors
            };
        }
    }
];
