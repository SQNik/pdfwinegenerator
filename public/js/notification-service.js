/**
 * Notification Service
 * Modern toast notification system with animations
 */

class NotificationService {
  constructor() {
    this.container = null;
    this.notifications = new Map();
    this.defaultDuration = 5000;
    this.maxNotifications = 5;
    this.position = 'top-right'; // top-right, top-left, bottom-right, bottom-left, top-center, bottom-center
    
    this.init();
  }

  /**
   * Initialize notification container
   */
  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createContainer());
    } else {
      this.createContainer();
    }
  }

  /**
   * Create notification container
   */
  createContainer() {
    // Check if container already exists
    this.container = document.getElementById('notificationContainer');
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notificationContainer';
      this.container.className = `notification-container notification-${this.position}`;
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type: success, error, warning, info
   * @param {Object} options - Additional options
   */
  show(message, type = 'info', options = {}) {
    if (!this.container) {
      console.error('Notification container not initialized');
      return null;
    }

    const {
      duration = this.defaultDuration,
      closable = true,
      icon = this.getDefaultIcon(type),
      action = null,
      persistent = false
    } = options;

    // Remove oldest notification if max limit reached
    if (this.notifications.size >= this.maxNotifications) {
      const oldestId = this.notifications.keys().next().value;
      this.hide(oldestId);
    }

    // Create notification element
    const id = this.generateId();
    const notification = this.createNotificationElement(id, message, type, icon, closable, action);

    // Add to container
    this.container.appendChild(notification);
    this.notifications.set(id, notification);

    // Trigger animation
    requestAnimationFrame(() => {
      notification.classList.add('notification-show');
    });

    // Auto-hide after duration (unless persistent)
    if (!persistent && duration > 0) {
      setTimeout(() => this.hide(id), duration);
    }

    return id;
  }

  /**
   * Create notification element
   */
  createNotificationElement(id, message, type, icon, closable, action) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('data-notification-id', id);
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    // Icon
    const iconEl = document.createElement('div');
    iconEl.className = 'notification-icon';
    iconEl.innerHTML = `<i class="bi bi-${icon}"></i>`;

    // Content
    const content = document.createElement('div');
    content.className = 'notification-content';
    content.innerHTML = `<div class="notification-message">${message}</div>`;

    // Action button (optional)
    if (action) {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'notification-action';
      actionBtn.textContent = action.label;
      actionBtn.onclick = () => {
        action.callback();
        if (action.closeOnClick !== false) {
          this.hide(id);
        }
      };
      content.appendChild(actionBtn);
    }

    // Close button
    if (closable) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'notification-close';
      closeBtn.innerHTML = '<i class="bi bi-x"></i>';
      closeBtn.setAttribute('aria-label', 'Close notification');
      closeBtn.onclick = () => this.hide(id);
      notification.appendChild(closeBtn);
    }

    notification.appendChild(iconEl);
    notification.appendChild(content);

    return notification;
  }

  /**
   * Hide notification
   */
  hide(id) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    notification.classList.remove('notification-show');
    notification.classList.add('notification-hide');

    setTimeout(() => {
      if (notification.parentElement) {
        notification.parentElement.removeChild(notification);
      }
      this.notifications.delete(id);
    }, 300);
  }

  /**
   * Hide all notifications
   */
  hideAll() {
    this.notifications.forEach((_, id) => this.hide(id));
  }

  /**
   * Shorthand methods
   */
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  error(message, options = {}) {
    return this.show(message, 'error', { ...options, duration: options.duration || 7000 });
  }

  warning(message, options = {}) {
    return this.show(message, 'warning', options);
  }

  info(message, options = {}) {
    return this.show(message, 'info', options);
  }

  /**
   * Show loading notification
   */
  loading(message = 'Ładowanie...', options = {}) {
    return this.show(message, 'info', {
      ...options,
      icon: 'arrow-clockwise',
      persistent: true,
      closable: false
    });
  }

  /**
   * Get default icon for notification type
   */
  getDefaultIcon(type) {
    const icons = {
      success: 'check-circle-fill',
      error: 'x-circle-fill',
      warning: 'exclamation-triangle-fill',
      info: 'info-circle-fill'
    };
    return icons[type] || icons.info;
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set notification position
   */
  setPosition(position) {
    this.position = position;
    if (this.container) {
      this.container.className = `notification-container notification-${position}`;
    }
  }

  /**
   * Update notification
   */
  update(id, message, type) {
    const notification = this.notifications.get(id);
    if (!notification) return;

    const messageEl = notification.querySelector('.notification-message');
    if (messageEl) {
      messageEl.textContent = message;
    }

    if (type) {
      notification.className = `notification notification-${type} notification-show`;
      const icon = notification.querySelector('.notification-icon i');
      if (icon) {
        icon.className = `bi bi-${this.getDefaultIcon(type)}`;
      }
    }
  }
}

// Initialize notification service
const notificationService = new NotificationService();

// Export for global access
window.notify = notificationService;
window.NotificationService = NotificationService;

// Backward compatibility with existing Utils.showAlert
if (window.Utils && !window.Utils.originalShowAlert) {
  window.Utils.originalShowAlert = window.Utils.showAlert;
  window.Utils.showAlert = function(message, type = 'info') {
    const typeMap = {
      success: 'success',
      error: 'error',
      warning: 'warning',
      info: 'info',
      danger: 'error'
    };
    notificationService.show(message, typeMap[type] || 'info');
  };
}
