// PDF Templates Management Component
class PDFTemplatesManager {
    constructor() {
        console.log('PDFTemplatesManager: Constructor called');
        this.templates = [];
        this.selectedTemplate = null;
        this.init();
    }

    /**
     * Initialize PDF templates manager
     */
    async init() {
        console.log('PDFTemplatesManager: Init called');
        this.bindEvents();
        await this.loadTemplates();
        this.renderTemplatesTable();
        console.log('PDFTemplatesManager: Init completed');
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        // Add template button
        document.getElementById('add-template-btn')?.addEventListener('click', () => {
            this.showTemplateModal();
        });

        // Template modal save button
        document.getElementById('save-template-btn')?.addEventListener('click', () => {
            this.saveTemplate();
        });

        // Template modal cancel button
        document.getElementById('cancel-template-btn')?.addEventListener('click', () => {
            this.hideTemplateModal();
        });

        // Close modal on backdrop click
        document.getElementById('template-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'template-modal') {
                this.hideTemplateModal();
            }
        });
    }

    /**
     * Load templates from server
     */
    async loadTemplates() {
        try {
            console.log('PDFTemplatesManager: Loading templates from server...');
            const response = await api.get('/pdf/templates');
            
            if (response.success) {
                this.templates = response.data || [];
                console.log('PDFTemplatesManager: Loaded', this.templates.length, 'templates');
            } else {
                throw new Error(response.error || 'Failed to load templates');
            }
        } catch (error) {
            console.error('PDFTemplatesManager: Error loading templates:', error);
            this.showAlert('Błąd podczas ładowania szablonów: ' + error.message, 'danger');
        }
    }

    /**
     * Render templates table
     */
    renderTemplatesTable() {
        const tbody = document.getElementById('templates-table-body');
        if (!tbody) return;

        if (this.templates.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        <i class="fas fa-file-pdf fa-2x mb-2"></i>
                        <p>Brak szablonów PDF. Kliknij "Dodaj szablon" aby utworzyć pierwszy.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.templates.map(template => `
            <tr data-template-id="${template.id}">
                <td>
                    <strong>${this.escapeHtml(template.name)}</strong>
                    ${template.description ? `<br><small class="text-muted">${this.escapeHtml(template.description)}</small>` : ''}
                </td>
                <td>
                    <span class="badge badge-info">${template.printSettings.format.name}</span>
                </td>
                <td>
                    <div class="status-indicators">
                        ${template.sections.front.enabled ? '<span class="badge badge-success">Okładka</span>' : ''}
                        ${template.sections.content.enabled ? '<span class="badge badge-primary">Zawartość</span>' : ''}
                        ${template.sections.back.enabled ? '<span class="badge badge-secondary">Rewers</span>' : ''}
                    </div>
                </td>
                <td>
                    <small class="text-muted">
                        ${new Date(template.updatedAt).toLocaleDateString('pl-PL')}
                    </small>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-sm btn-outline-info" 
                                onclick="pdfTemplatesManager.openPdfEditor('${template.id}')"
                                title="Edytor wizualny PDF">
                            <i class="fas fa-magic"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-primary" 
                                onclick="pdfTemplatesManager.editTemplate('${template.id}')"
                                title="Edytuj właściwości">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary" 
                                onclick="pdfTemplatesManager.previewTemplate('${template.id}')"
                                title="Podgląd PDF">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-success" 
                                onclick="pdfTemplatesManager.generateFromTemplate('${template.id}')"
                                title="Generuj PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-danger" 
                                onclick="pdfTemplatesManager.deleteTemplate('${template.id}')"
                                title="Usuń szablon">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Show template modal for create/edit
     */
    showTemplateModal(template = null) {
        this.selectedTemplate = template;
        const modal = document.getElementById('template-modal');
        const form = document.getElementById('template-form');
        
        if (!modal || !form) return;

        // Reset form
        form.reset();

        if (template) {
            // Edit mode
            document.getElementById('modal-title').textContent = 'Edytuj szablon PDF';
            document.getElementById('template-name').value = template.name;
            document.getElementById('template-description').value = template.description || '';
            document.getElementById('paper-format').value = template.printSettings.format.name;
            document.getElementById('dpi-setting').value = template.printSettings.dpi;
            document.getElementById('color-mode').value = template.printSettings.colorMode;
            
            // Sections
            document.getElementById('front-enabled').checked = template.sections.front.enabled;
            document.getElementById('content-enabled').checked = template.sections.content.enabled;
            document.getElementById('back-enabled').checked = template.sections.back.enabled;
            // ✅ USUNIĘTO: Te właściwości są teraz zarządzane przez elementy product-list
            // Ustawione są domyślne wartości UI
            document.getElementById('products-per-page').value = '12';
            document.getElementById('columns-count').value = '2';
        } else {
            // Create mode
            document.getElementById('modal-title').textContent = 'Nowy szablon PDF';
            // Set defaults
            document.getElementById('paper-format').value = 'A4';
            document.getElementById('dpi-setting').value = '300';
            document.getElementById('color-mode').value = 'cmyk';
            document.getElementById('front-enabled').checked = true;
            document.getElementById('content-enabled').checked = true;
            document.getElementById('back-enabled').checked = true;
            document.getElementById('products-per-page').value = '12';
            document.getElementById('columns-count').value = '2';
        }

        modal.style.display = 'block';
        document.body.classList.add('modal-open');
    }

    /**
     * Hide template modal
     */
    hideTemplateModal() {
        const modal = document.getElementById('template-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
        this.selectedTemplate = null;
    }

    /**
     * Save template (create or update)
     */
    async saveTemplate() {
        try {
            const formData = this.getTemplateFormData();
            
            if (!this.validateTemplateData(formData)) {
                return;
            }

            let response;
            if (this.selectedTemplate) {
                // Update existing template
                response = await api.put(`/pdf/templates/${this.selectedTemplate.id}`, formData);
            } else {
                // Create new template
                response = await api.post('/pdf/templates', formData);
            }

            if (response.success) {
                this.hideTemplateModal();
                await this.loadTemplates();
                this.renderTemplatesTable();
                
                const action = this.selectedTemplate ? 'zaktualizowany' : 'utworzony';
                this.showAlert(`Szablon został ${action} pomyślnie!`, 'success');
            } else {
                throw new Error(response.error || 'Błąd podczas zapisywania szablonu');
            }
        } catch (error) {
            console.error('PDFTemplatesManager: Error saving template:', error);
            this.showAlert('Błąd podczas zapisywania szablonu: ' + error.message, 'danger');
        }
    }

    /**
     * Get form data for template
     */
    getTemplateFormData() {
        return {
            name: document.getElementById('template-name').value,
            description: document.getElementById('template-description').value,
            printSettings: {
                format: {
                    name: document.getElementById('paper-format').value,
                    width: this.getFormatDimensions(document.getElementById('paper-format').value).width,
                    height: this.getFormatDimensions(document.getElementById('paper-format').value).height,
                    unit: 'mm'
                },
                dpi: parseInt(document.getElementById('dpi-setting').value),
                colorMode: document.getElementById('color-mode').value,
                margins: {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                    unit: 'mm'
                },
                bleed: 3
            },
            sections: {
                front: {
                    enabled: document.getElementById('front-enabled').checked,
                    backgroundColor: '#8B0000',
                    elements: []
                },
                content: {
                    enabled: document.getElementById('content-enabled').checked,
                    backgroundColor: '#FFFFFF',
                    elements: [],
                    // ✅ USUNIĘTO: Duplikujące się właściwości layoutu produktów
                    // Te właściwości są teraz zarządzane przez elementy product-list
                    productLayout: {
                        id: 'default-product-layout',
                        name: 'Domyślny układ produktów',
                        width: 200,
                        height: 150,
                        elements: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    },
                    groupByCategory: false,
                    categoryHeaderEnabled: false,
                    categoryHeaderStyle: {
                        content: '',
                        fontSize: 16,
                        fontFamily: 'Helvetica',
                        fontWeight: 'bold',
                        fontStyle: 'normal',
                        color: '#8B0000',
                        textAlign: 'left',
                        lineHeight: 1.2,
                        letterSpacing: 0
                    },
                    productLayout: {
                        id: this.generateId(),
                        name: 'Default Layout',
                        width: 555,
                        height: 700,
                        elements: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                },
                back: {
                    enabled: document.getElementById('back-enabled').checked,
                    backgroundColor: '#F5F5F5',
                    elements: []
                }
            }
        };
    }

    /**
     * Get format dimensions
     */
    getFormatDimensions(format) {
        const formats = {
            'A4': { width: 210, height: 297 },
            'A5': { width: 148, height: 210 },
            'A6': { width: 105, height: 148 },
            'Letter': { width: 216, height: 279 },
            'Legal': { width: 216, height: 356 }
        };
        return formats[format] || formats['A4'];
    }

    /**
     * Validate template data
     */
    validateTemplateData(data) {
        if (!data.name || data.name.trim() === '') {
            this.showAlert('Nazwa szablonu jest wymagana', 'warning');
            return false;
        }

        if (!data.sections.front.enabled && !data.sections.content.enabled && !data.sections.back.enabled) {
            this.showAlert('Przynajmniej jedna sekcja musi być włączona', 'warning');
            return false;
        }

        return true;
    }

    /**
     * Edit template
     */
    editTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (template) {
            this.showTemplateModal(template);
        }
    }

    /**
     * Preview template
     */
    async previewTemplate(templateId) {
        try {
            this.showAlert('Generowanie podglądu...', 'info');
            
            const response = await api.get(`/pdf/templates/${templateId}/preview`);
            
            if (response.success) {
                // Open PDF in new window
                const pdfUrl = response.data.downloadUrl;
                window.open(pdfUrl, '_blank');
                this.showAlert('Podgląd PDF został wygenerowany!', 'success');
            } else {
                throw new Error(response.error || 'Błąd podczas generowania podglądu');
            }
        } catch (error) {
            console.error('PDFTemplatesManager: Error previewing template:', error);
            this.showAlert('Błąd podczas generowania podglądu: ' + error.message, 'danger');
        }
    }

    /**
     * Generate PDF from template
     */
    async generateFromTemplate(templateId) {
        // This will be implemented with collection selection
        this.showAlert('Funkcja generowania PDF z kolekcji będzie dostępna wkrótce', 'info');
    }

    /**
     * Delete template
     */
    async deleteTemplate(templateId) {
        const template = this.templates.find(t => t.id === templateId);
        if (!template) return;

        if (!confirm(`Czy na pewno chcesz usunąć szablon "${template.name}"?`)) {
            return;
        }

        try {
            const response = await api.delete(`/pdf/templates/${templateId}`);
            
            if (response.success) {
                await this.loadTemplates();
                this.renderTemplatesTable();
                this.showAlert('Szablon został usunięty', 'success');
            } else {
                throw new Error(response.error || 'Błąd podczas usuwania szablonu');
            }
        } catch (error) {
            console.error('PDFTemplatesManager: Error deleting template:', error);
            this.showAlert('Błąd podczas usuwania szablonu: ' + error.message, 'danger');
        }
    }

    /**
     * Show alert message
     */
    showAlert(message, type = 'info') {
        const alertContainer = document.getElementById('alert-container');
        if (!alertContainer) return;

        const alertId = 'alert-' + Date.now();
        const alertHtml = `
            <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="close" data-dismiss="alert">
                    <span>&times;</span>
                </button>
            </div>
        `;

        alertContainer.insertAdjacentHTML('beforeend', alertHtml);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            const alertElement = document.getElementById(alertId);
            if (alertElement) {
                alertElement.classList.remove('show');
                setTimeout(() => alertElement.remove(), 150);
            }
        }, 5000);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Generate unique ID
     */
    generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    /**
     * Open PDF visual editor for template
     */
    openPdfEditor(templateId) {
        // Redirect to PDF editor with template ID (using 'id' parameter as expected by editor)
        window.location.href = `pdf-editor.html?id=${templateId}`;
    }
}

// Global instance
let pdfTemplatesManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('templates-table-body')) {
        pdfTemplatesManager = new PDFTemplatesManager();
    }
});