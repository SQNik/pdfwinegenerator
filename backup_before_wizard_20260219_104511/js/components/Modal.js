/**
 * Modal Component
 * Reusable modal component with animations
 */

class Modal extends Component {
  constructor(options = {}) {
    super({
      title: '',
      content: '',
      footer: null,
      size: 'md', // sm, md, lg, xl
      backdrop: true,
      keyboard: true,
      focus: true,
      centered: false,
      scrollable: false,
      ...options
    });

    this.isOpen = false;
    this.backdrop = null;
  }

  render() {
    const modal = this.createElement('div', {
      className: `modal fade`,
      tabindex: '-1',
      role: 'dialog',
      'aria-hidden': 'true'
    });

    const dialog = this.createElement('div', {
      className: this.getDialogClasses()
    });

    const content = this.createElement('div', {
      className: 'modal-content'
    });

    // Header
    if (this.options.title) {
      const header = this.renderHeader();
      content.appendChild(header);
    }

    // Body
    const body = this.renderBody();
    content.appendChild(body);

    // Footer
    if (this.options.footer !== null) {
      const footer = this.renderFooter();
      content.appendChild(footer);
    }

    dialog.appendChild(content);
    modal.appendChild(dialog);

    return modal;
  }

  renderHeader() {
    const header = this.createElement('div', {
      className: 'modal-header'
    });

    const title = this.createElement('h5', {
      className: 'modal-title'
    }, [this.options.title]);

    const closeBtn = this.createElement('button', {
      type: 'button',
      className: 'btn-close',
      'aria-label': 'Close'
    });

    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(title);
    header.appendChild(closeBtn);

    return header;
  }

  renderBody() {
    const body = this.createElement('div', {
      className: 'modal-body'
    });

    if (typeof this.options.content === 'string') {
      body.innerHTML = this.options.content;
    } else if (this.options.content instanceof HTMLElement) {
      body.appendChild(this.options.content);
    }

    return body;
  }

  renderFooter() {
    const footer = this.createElement('div', {
      className: 'modal-footer'
    });

    if (this.options.footer === undefined) {
      // Default footer
      const closeBtn = this.createElement('button', {
        type: 'button',
        className: 'btn btn-secondary'
      }, ['Zamknij']);

      closeBtn.addEventListener('click', () => this.close());
      footer.appendChild(closeBtn);
    } else if (this.options.footer instanceof HTMLElement) {
      footer.appendChild(this.options.footer);
    }

    return footer;
  }

  getDialogClasses() {
    const classes = ['modal-dialog'];

    if (this.options.size && this.options.size !== 'md') {
      classes.push(`modal-${this.options.size}`);
    }

    if (this.options.centered) {
      classes.push('modal-dialog-centered');
    }

    if (this.options.scrollable) {
      classes.push('modal-dialog-scrollable');
    }

    return classes.join(' ');
  }

  async mounted() {
    // Setup event listeners
    if (this.options.keyboard) {
      this.on(document, 'keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    // Backdrop click
    if (this.options.backdrop) {
      this.on(this.element, 'click', (e) => {
        if (e.target === this.element && this.options.backdrop !== 'static') {
          this.close();
        }
      });
    }
  }

  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.element.style.display = 'block';
    this.element.classList.add('show');
    document.body.classList.add('modal-open');

    // Create backdrop
    if (this.options.backdrop) {
      this.showBackdrop();
    }

    // Focus management
    if (this.options.focus) {
      const firstFocusable = this.element.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (firstFocusable) {
        firstFocusable.focus();
      }
    }

    // Emit event
    this.emit('modal:open');
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.element.classList.remove('show');
    document.body.classList.remove('modal-open');

    // Remove backdrop
    if (this.backdrop) {
      this.hideBackdrop();
    }

    setTimeout(() => {
      this.element.style.display = 'none';
    }, 300);

    // Emit event
    this.emit('modal:close');
  }

  showBackdrop() {
    this.backdrop = this.createElement('div', {
      className: 'modal-backdrop fade show'
    });
    document.body.appendChild(this.backdrop);
  }

  hideBackdrop() {
    if (this.backdrop) {
      this.backdrop.classList.remove('show');
      setTimeout(() => {
        if (this.backdrop && this.backdrop.parentElement) {
          this.backdrop.parentElement.removeChild(this.backdrop);
        }
        this.backdrop = null;
      }, 300);
    }
  }

  setTitle(title) {
    const titleEl = this.$('.modal-title');
    if (titleEl) {
      titleEl.textContent = title;
    }
  }

  setContent(content) {
    const bodyEl = this.$('.modal-body');
    if (bodyEl) {
      if (typeof content === 'string') {
        bodyEl.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        bodyEl.innerHTML = '';
        bodyEl.appendChild(content);
      }
    }
  }

  async beforeUnmount() {
    if (this.isOpen) {
      this.close();
    }
  }
}

// Export
window.Modal = Modal;
