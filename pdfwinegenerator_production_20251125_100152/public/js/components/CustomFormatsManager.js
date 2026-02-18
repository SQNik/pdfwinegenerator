/**
 * CustomFormatsManager - Zarządzanie niestandardowymi formatami PDF
 * Umożliwia tworzenie, edytowanie i usuwanie niestandardowych formatów PDF
 */
class CustomFormatsManager {
  constructor() {
    this.formats = [];
    this.currentFormat = null;
    this.isInitialized = false;
  }

  async init() {
    try {
      console.log('CustomFormatsManager: Starting initialization...');
      await this.loadFormats();
      this.initializeEventHandlers();
      this.isInitialized = true;
      console.log('CustomFormatsManager initialized successfully');
    } catch (error) {
      console.error('Error initializing CustomFormatsManager:', error);
    }
  }

  // ==================== DATA LOADING ====================

  async loadFormats() {
    try {
      console.log('CustomFormatsManager: Loading formats...');
      const response = await api.getCustomFormats();
      console.log('CustomFormatsManager: API response:', response);
      if (response.success) {
        this.formats = response.data || [];
        console.log('CustomFormatsManager: Loaded formats:', this.formats);
        this.renderFormatsList();
      } else {
        console.error('Failed to load custom formats:', response.error);
        this.showError('Nie udało się załadować formatów PDF');
      }
    } catch (error) {
      console.error('Error loading custom formats:', error);
      this.showError('Błąd podczas ładowania formatów PDF');
    }
  }

  // ==================== UI RENDERING ====================

  renderFormatsList() {
    console.log('CustomFormatsManager: Rendering formats list...');
    const container = document.getElementById('customFormatsSection');
    if (!container) {
      console.error('CustomFormatsManager: Container customFormatsSection not found!');
      return;
    }
    console.log('CustomFormatsManager: Container found, formats count:', this.formats.length);

    if (this.formats.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="bi bi-file-earmark-pdf" style="font-size: 2rem; color: var(--color-text-tertiary);"></i>
          <p style="font-size: 0.8125rem; margin-top: var(--space-sm); margin-bottom: 0;">
            Brak formatów PDF
          </p>
          <p style="font-size: 0.75rem; color: var(--color-text-tertiary); margin: 0;">
            Kliknij "Dodaj format" aby utworzyć pierwszy
          </p>
        </div>
      `;
      return;
    }

    const formatsHtml = this.formats.map(format => {
      const orientation = format.orientation === 'portrait' ? 'Pionowa' : 'Pozioma';
      const statusBadge = format.isActive 
        ? '<span class="format-card-badge active"><i class="bi bi-check-circle"></i> Aktywny</span>'
        : '<span class="format-card-badge inactive"><i class="bi bi-x-circle"></i> Nieaktywny</span>';
      
      return `
        <div class="format-card" data-format-id="${format.id}">
          <div class="format-card-header">
            <div>
              <h6 class="format-card-title">${this.escapeHtml(format.name)}</h6>
              ${statusBadge}
            </div>
            <div class="format-card-actions">
              <button type="button" class="format-card-btn" 
                      onclick="window.customFormatsManager.editFormat('${format.id}')"
                      title="Edytuj format">
                <i class="bi bi-pencil"></i>
              </button>
              <button type="button" class="format-card-btn delete" 
                      onclick="window.customFormatsManager.deleteFormat('${format.id}')"
                      title="Usuń format">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
          <div class="format-card-body">
            ${format.description ? `
              <div class="format-card-description">${this.escapeHtml(format.description)}</div>
            ` : ''}
            <div class="format-card-specs">
              <span class="format-card-spec">
                <i class="bi bi-arrows-angle-expand"></i>
                ${format.width} × ${format.height} ${format.unit}
              </span>
              <span class="format-card-spec">
                <i class="bi bi-phone-landscape"></i>
                ${orientation}
              </span>
            </div>
            <div class="format-card-specs" style="margin-top: 0.25rem;">
              <span class="format-card-spec">
                <i class="bi bi-border-outer"></i>
                ${format.margins.top}/${format.margins.right}/${format.margins.bottom}/${format.margins.left} ${format.unit}
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = formatsHtml;
  }

  // ==================== EVENT HANDLERS ====================

  initializeEventHandlers() {
    // Add format button
    const addButton = document.getElementById('addCustomFormatBtn');
    if (addButton) {
      addButton.addEventListener('click', () => this.showCreateModal());
    }

    // Form submission
    const form = document.getElementById('customFormatForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Save button
    const saveButton = document.getElementById('saveCustomFormatBtn');
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        const form = document.getElementById('customFormatForm');
        if (form) {
          // Create and dispatch submit event
          const submitEvent = new Event('submit', { 
            bubbles: true, 
            cancelable: true 
          });
          form.dispatchEvent(submitEvent);
        }
      });
    }

    // Format preview
    const widthInput = document.getElementById('formatWidth');
    const heightInput = document.getElementById('formatHeight');
    const orientationSelect = document.getElementById('formatOrientation');
    
    if (widthInput) widthInput.addEventListener('input', () => this.updatePreview());
    if (heightInput) heightInput.addEventListener('input', () => this.updatePreview());
    if (orientationSelect) orientationSelect.addEventListener('change', () => this.updatePreview());
  }

  // ==================== MODAL MANAGEMENT ====================

  showCreateModal() {
    this.currentFormat = null;
    this.resetForm();
    document.getElementById('customFormatModalTitle').textContent = 'Dodaj nowy format PDF';
    
    const modal = new bootstrap.Modal(document.getElementById('customFormatModal'));
    modal.show();
  }

  showEditModal(format) {
    this.currentFormat = format;
    this.populateForm(format);
    document.getElementById('customFormatModalTitle').textContent = 'Edytuj format PDF';
    
    const modal = new bootstrap.Modal(document.getElementById('customFormatModal'));
    modal.show();
  }

  resetForm() {
    const form = document.getElementById('customFormatForm');
    if (form) {
      form.reset();
      form.classList.remove('was-validated');
      
      // Set default values
      document.getElementById('formatUnit').value = 'mm';
      document.getElementById('formatOrientation').value = 'portrait';
      document.getElementById('formatActive').checked = true;
      
      // Set default margins
      document.getElementById('marginTop').value = '10';
      document.getElementById('marginRight').value = '10';
      document.getElementById('marginBottom').value = '10';
      document.getElementById('marginLeft').value = '10';
      
      this.clearValidationErrors();
      this.updatePreview();
    }
  }

  populateForm(format) {
    document.getElementById('formatName').value = format.name;
    document.getElementById('formatDescription').value = format.description || '';
    document.getElementById('formatWidth').value = format.width;
    document.getElementById('formatHeight').value = format.height;
    document.getElementById('formatUnit').value = format.unit;
    document.getElementById('formatActive').checked = format.isActive;
    
    // Orientation
    document.getElementById('formatOrientation').value = format.orientation;
    
    // Margins
    document.getElementById('marginTop').value = format.margins.top;
    document.getElementById('marginRight').value = format.margins.right;
    document.getElementById('marginBottom').value = format.margins.bottom;
    document.getElementById('marginLeft').value = format.margins.left;
    
    this.clearValidationErrors();
    this.updatePreview();
  }

  // ==================== FORM HANDLING ====================

  async handleFormSubmit(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const form = event.target;
    
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const formData = this.getFormData();
    
    try {
      let response;
      if (this.currentFormat) {
        response = await api.updateCustomFormat(this.currentFormat.id, formData);
      } else {
        response = await api.createCustomFormat(formData);
      }

      if (response.success) {
        this.showSuccess(
          this.currentFormat ? 'Format został zaktualizowany' : 'Format został utworzony'
        );
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('customFormatModal'));
        modal.hide();
        
        // Reload formats
        await this.loadFormats();
      } else {
        this.handleValidationErrors(response);
      }
    } catch (error) {
      console.error('Error saving format:', error);
      this.showError('Błąd podczas zapisywania formatu');
    }
  }

  getFormData() {
    return {
      name: document.getElementById('formatName').value.trim(),
      description: document.getElementById('formatDescription').value.trim(),
      width: parseFloat(document.getElementById('formatWidth').value),
      height: parseFloat(document.getElementById('formatHeight').value),
      unit: document.getElementById('formatUnit').value,
      orientation: document.getElementById('formatOrientation').value,
      margins: {
        top: parseFloat(document.getElementById('marginTop').value),
        right: parseFloat(document.getElementById('marginRight').value),
        bottom: parseFloat(document.getElementById('marginBottom').value),
        left: parseFloat(document.getElementById('marginLeft').value)
      },
      isActive: document.getElementById('formatActive').checked
    };
  }

  // ==================== CRUD OPERATIONS ====================

  async editFormat(formatId) {
    const format = this.formats.find(f => f.id === formatId);
    if (format) {
      this.showEditModal(format);
    } else {
      this.showError('Nie znaleziono formatu');
    }
  }

  async deleteFormat(formatId) {
    const format = this.formats.find(f => f.id === formatId);
    if (!format) {
      this.showError('Nie znaleziono formatu');
      return;
    }

    const confirmed = await this.showConfirmDialog(
      'Usuń format',
      `Czy na pewno chcesz usunąć format "${format.name}"?`,
      'Usuń',
      'btn-danger'
    );

    if (!confirmed) return;

    try {
      const response = await api.deleteCustomFormat(formatId);
      
      if (response.success) {
        this.showSuccess('Format został usunięty');
        await this.loadFormats();
      } else {
        this.showError(`Błąd podczas usuwania formatu: ${response.error}`);
      }
    } catch (error) {
      console.error('Error deleting format:', error);
      this.showError('Błąd podczas usuwania formatu');
    }
  }

  // ==================== PREVIEW ====================

  updatePreview() {
    const width = parseFloat(document.getElementById('formatWidth').value) || 210;
    const height = parseFloat(document.getElementById('formatHeight').value) || 297;
    const unit = document.getElementById('formatUnit').value || 'mm';
    const orientation = document.getElementById('formatOrientation').value || 'portrait';
    
    const preview = document.getElementById('formatPreview');
    if (!preview) return;

    // Calculate aspect ratio for preview
    let previewWidth = width;
    let previewHeight = height;
    
    if (orientation === 'landscape') {
      [previewWidth, previewHeight] = [previewHeight, previewWidth];
    }

    // Scale to fit preview container (max 200px)
    const maxSize = 180;
    const scale = Math.min(maxSize / previewWidth, maxSize / previewHeight);
    
    const scaledWidth = previewWidth * scale;
    const scaledHeight = previewHeight * scale;

    preview.innerHTML = `
      <div class="text-center">
        <div class="format-preview-paper" style="
          width: ${scaledWidth}px; 
          height: ${scaledHeight}px;
          border: 2px solid #007bff;
          background: white;
          margin: 0 auto;
          position: relative;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        ">
          <div style="
            position: absolute;
            top: 5px;
            left: 5px;
            right: 5px;
            bottom: 5px;
            border: 1px dashed #6c757d;
          "></div>
        </div>
        <div class="mt-2 small text-muted">
          ${previewWidth} × ${previewHeight} ${unit}<br>
          <span class="badge bg-light text-dark">${orientation === 'portrait' ? 'Pionowa' : 'Pozioma'}</span>
        </div>
      </div>
    `;
  }

  // ==================== VALIDATION ====================

  handleValidationErrors(response) {
    this.clearValidationErrors();
    
    if (response.validationErrors) {
      response.validationErrors.forEach(error => {
        this.showFieldError(error.field, error.message);
      });
    } else {
      this.showError(response.error || 'Błąd walidacji');
    }
  }

  showFieldError(fieldPath, message) {
    const fieldMap = {
      'name': 'formatName',
      'width': 'formatWidth',
      'height': 'formatHeight',
      'margins.top': 'marginTop',
      'margins.right': 'marginRight',
      'margins.bottom': 'marginBottom',
      'margins.left': 'marginLeft'
    };
    
    const fieldId = fieldMap[fieldPath] || fieldPath;
    const field = document.getElementById(fieldId);
    
    if (field) {
      field.classList.add('is-invalid');
      
      // Find or create error element
      let errorElement = field.parentNode.querySelector('.invalid-feedback');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'invalid-feedback';
        field.parentNode.appendChild(errorElement);
      }
      
      errorElement.textContent = message;
    }
  }

  clearValidationErrors() {
    document.querySelectorAll('.is-invalid').forEach(field => {
      field.classList.remove('is-invalid');
    });
    
    document.querySelectorAll('.invalid-feedback').forEach(error => {
      error.remove();
    });
  }

  // ==================== UTILITY METHODS ====================

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showSuccess(message) {
    this.showAlert(message, 'success');
  }

  showError(message) {
    this.showAlert(message, 'danger');
  }

  showAlert(message, type = 'info') {
    const alertsContainer = document.getElementById('customFormatsAlerts') || document.body;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    alertsContainer.appendChild(alert);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 5000);
  }

  showConfirmDialog(title, message, confirmText = 'Potwierdź', confirmClass = 'btn-primary') {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'modal fade';
      modal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${title}</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
              <p>${message}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Anuluj</button>
              <button type="button" class="btn ${confirmClass}" id="confirmAction">${confirmText}</button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      const bootstrapModal = new bootstrap.Modal(modal);
      
      modal.querySelector('#confirmAction').addEventListener('click', () => {
        resolve(true);
        bootstrapModal.hide();
      });
      
      modal.addEventListener('hidden.bs.modal', () => {
        if (modal.parentNode) {
          modal.remove();
        }
        resolve(false);
      });
      
      bootstrapModal.show();
    });
  }

  // ==================== PUBLIC API ====================

  getFormats() {
    return [...this.formats];
  }

  getActiveFormats() {
    return this.formats.filter(format => format.isActive);
  }

  getFormatById(id) {
    return this.formats.find(format => format.id === id);
  }

  async refreshFormats() {
    await this.loadFormats();
  }
}