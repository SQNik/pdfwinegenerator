/**
 * EXAMPLE: Contact Form Wizard Configuration
 * 
 * Demonstrates how to create a simple 3-step contact/inquiry wizard
 * using the same Wizard component as the collection creator.
 * 
 * Shows:
 * - Simpler step configuration
 * - Different field types (text, email, select, textarea)
 * - Custom validation
 * - How to reuse the wizard component
 */

const contactWizardSteps = [
    {
        id: 'personal',
        title: 'Dane osobowe',
        label: 'Krok 1',
        icon: 'person',
        description: 'Podaj swoje dane kontaktowe',
        
        // Simple fields-based rendering (no custom renderFunction)
        fields: [
            {
                name: 'firstName',
                label: 'Imię',
                type: 'text',
                required: true,
                placeholder: 'Jan'
            },
            {
                name: 'lastName',
                label: 'Nazwisko',
                type: 'text',
                required: true,
                placeholder: 'Kowalski'
            },
            {
                name: 'email',
                label: 'Email',
                type: 'email',
                required: true,
                placeholder: 'jan.kowalski@example.com'
            },
            {
                name: 'phone',
                label: 'Telefon',
                type: 'tel',
                required: false,
                placeholder: '+48 123 456 789'
            }
        ],
        
        validate: async (data) => {
            const errors = [];
            
            if (!data.firstName?.trim()) {
                errors.push('Imię jest wymagane');
            }
            if (!data.lastName?.trim()) {
                errors.push('Nazwisko jest wymagane');
            }
            if (!data.email?.trim()) {
                errors.push('Email jest wymagany');
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
                errors.push('Podaj poprawny adres email');
            }
            
            return {
                valid: errors.length === 0,
                errors
            };
        }
    },
    
    {
        id: 'inquiry',
        title: 'Zapytanie',
        label: 'Krok 2',
        icon: 'envelope',
        description: 'Wybierz temat i opisz sprawę',
        
        fields: [
            {
                name: 'subject',
                label: 'Temat',
                type: 'select',
                required: true,
                options: [
                    { value: '', label: 'Wybierz temat...' },
                    { value: 'order', label: 'Zamówienie' },
                    { value: 'question', label: 'Pytanie o produkt' },
                    { value: 'support', label: 'Pomoc techniczna' },
                    { value: 'other', label: 'Inne' }
                ]
            },
            {
                name: 'message',
                label: 'Wiadomość',
                type: 'textarea',
                required: true,
                placeholder: 'Opisz swoją sprawę...',
                rows: 6
            },
            {
                name: 'urgent',
                label: 'Pilne',
                type: 'checkbox',
                helpText: 'Zaznacz jeśli sprawa wymaga szybkiej odpowiedzi'
            }
        ],
        
        validate: async (data) => {
            const errors = [];
            
            if (!data.subject) {
                errors.push('Wybierz temat wiadomości');
            }
            if (!data.message?.trim()) {
                errors.push('Wiadomość jest wymagana');
            } else if (data.message.trim().length < 10) {
                errors.push('Wiadomość musi mieć co najmniej 10 znaków');
            }
            
            return {
                valid: errors.length === 0,
                errors
            };
        }
    },
    
    {
        id: 'summary',
        title: 'Podsumowanie',
        label: 'Krok 3',
        icon: 'check-circle',
        description: 'Sprawdź dane przed wysłaniem',
        
        // Custom render for summary
        renderFunction: async (container, wizardData) => {
            const subjectLabels = {
                'order': 'Zamówienie',
                'question': 'Pytanie o produkt',
                'support': 'Pomoc techniczna',
                'other': 'Inne'
            };
            
            container.innerHTML = `
                <div class="summary-section">
                    <h3 class="summary-title">
                        <i class="bi bi-person-circle"></i>
                        Dane osobowe
                    </h3>
                    <dl class="summary-list">
                        <dt>Imię i nazwisko:</dt>
                        <dd>${wizardData.firstName} ${wizardData.lastName}</dd>
                        
                        <dt>Email:</dt>
                        <dd>${wizardData.email}</dd>
                        
                        ${wizardData.phone ? `
                            <dt>Telefon:</dt>
                            <dd>${wizardData.phone}</dd>
                        ` : ''}
                    </dl>
                </div>
                
                <div class="summary-section">
                    <h3 class="summary-title">
                        <i class="bi bi-envelope-fill"></i>
                        Treść zapytania
                    </h3>
                    <dl class="summary-list">
                        <dt>Temat:</dt>
                        <dd>
                            ${subjectLabels[wizardData.subject] || wizardData.subject}
                            ${wizardData.urgent ? '<span class="badge bg-danger ms-2">PILNE</span>' : ''}
                        </dd>
                        
                        <dt>Wiadomość:</dt>
                        <dd class="message-preview">${wizardData.message}</dd>
                    </dl>
                </div>
                
                <div class="alert alert-info d-flex align-items-center">
                    <i class="bi bi-info-circle me-2"></i>
                    <div>
                        <strong>Gotowe do wysłania!</strong><br>
                        Kliknij "Wyślij" aby przesłać wiadomość. Odpowiemy najszybciej jak to możliwe.
                    </div>
                </div>
            `;
        },
        
        validate: async (data) => {
            // All validation already done in previous steps
            return { valid: true, errors: [] };
        }
    }
];

// Example usage (uncomment to use on a page):
/*
document.addEventListener('DOMContentLoaded', function() {
    new Wizard({
        containerId: 'wizard-container',
        steps: contactWizardSteps,
        persistKey: 'contact-wizard-state',
        completeButtonText: 'Wyślij',
        
        onComplete: async (data, wizard) => {
            console.log('Contact form submitted:', data);
            
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (!response.ok) throw new Error('Failed to send message');
                
                alert('✅ Wiadomość wysłana pomyślnie!');
                wizard.reset();
                
            } catch (error) {
                console.error('Error sending message:', error);
                alert('❌ Błąd podczas wysyłania: ' + error.message);
            }
        }
    });
});
*/
