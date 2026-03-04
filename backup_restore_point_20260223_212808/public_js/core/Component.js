/**
 * Component Base Class
 * Provides lifecycle management and state handling for UI components
 */

class Component {
  constructor(options = {}) {
    this.options = options;
    this.element = null;
    this.state = options.initialState || {};
    this.subscriptions = [];
    this._mounted = false;
    this._destroyed = false;

    // Auto-bind methods
    this.autobind();
  }

  /**
   * Auto-bind all methods to component instance
   */
  autobind() {
    const prototype = Object.getPrototypeOf(this);
    const propertyNames = Object.getOwnPropertyNames(prototype);

    propertyNames.forEach(name => {
      if (name !== 'constructor' && typeof this[name] === 'function') {
        this[name] = this[name].bind(this);
      }
    });
  }

  /**
   * Lifecycle: Initialize component (called before mount)
   * Override in subclass
   */
  async init() {
    // Override in subclass
  }

  /**
   * Lifecycle: Create and return DOM element
   * Must be implemented in subclass
   */
  render() {
    throw new Error('Component.render() must be implemented in subclass');
  }

  /**
   * Lifecycle: Mount component to container
   * @param {HTMLElement|string} container - DOM element or selector
   */
  async mount(container) {
    if (this._mounted) {
      console.warn('Component already mounted');
      return this;
    }

    // Get container element
    const containerEl = typeof container === 'string'
      ? document.querySelector(container)
      : container;

    if (!containerEl) {
      throw new Error(`Container not found: ${container}`);
    }

    try {
      // Call init lifecycle
      await this.init();

      // Render component
      this.element = this.render();

      if (!this.element) {
        throw new Error('Component.render() must return an HTMLElement');
      }

      // Append to container
      containerEl.appendChild(this.element);

      // Mark as mounted
      this._mounted = true;

      // Call mounted lifecycle
      await this.mounted();

      return this;
    } catch (error) {
      console.error('Error mounting component:', error);
      throw error;
    }
  }

  /**
   * Lifecycle: Called after component is mounted to DOM
   * Override in subclass
   */
  async mounted() {
    // Override in subclass
  }

  /**
   * Lifecycle: Update component
   * Override in subclass
   */
  async update() {
    if (!this._mounted) {
      console.warn('Cannot update unmounted component');
      return;
    }

    // Override in subclass
  }

  /**
   * Lifecycle: Unmount and cleanup
   */
  async unmount() {
    if (!this._mounted) {
      return;
    }

    try {
      // Call beforeUnmount lifecycle
      await this.beforeUnmount();

      // Remove from DOM
      if (this.element && this.element.parentElement) {
        this.element.parentElement.removeChild(this.element);
      }

      // Cleanup subscriptions
      this.unsubscribeAll();

      // Mark as unmounted
      this._mounted = false;
      this._destroyed = true;

      // Call unmounted lifecycle
      await this.unmounted();
    } catch (error) {
      console.error('Error unmounting component:', error);
      throw error;
    }
  }

  /**
   * Lifecycle: Called before unmount
   * Override in subclass
   */
  async beforeUnmount() {
    // Override in subclass
  }

  /**
   * Lifecycle: Called after unmount
   * Override in subclass
   */
  async unmounted() {
    // Override in subclass
  }

  /**
   * State management: Get state
   */
  getState(key) {
    if (key) {
      return this.state[key];
    }
    return { ...this.state };
  }

  /**
   * State management: Set state and trigger update
   */
  async setState(updates, shouldUpdate = true) {
    if (typeof updates === 'function') {
      updates = updates(this.state);
    }

    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };

    // Call state changed callback
    await this.onStateChange(prevState, this.state);

    // Trigger update if mounted and enabled
    if (shouldUpdate && this._mounted) {
      await this.update();
    }
  }

  /**
   * Called when state changes
   * Override in subclass
   */
  async onStateChange(prevState, newState) {
    // Override in subclass
  }

  /**
   * Create element helper
   */
  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('on') && typeof value === 'function') {
        const event = key.substring(2).toLowerCase();
        element.addEventListener(event, value);
      } else if (key === 'dataset' && typeof value === 'object') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else {
        element.setAttribute(key, value);
      }
    });

    // Append children
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      } else if (child instanceof Component) {
        element.appendChild(child.element);
      }
    });

    return element;
  }

  /**
   * Query selector within component
   */
  $(selector) {
    if (!this.element) return null;
    return this.element.querySelector(selector);
  }

  /**
   * Query selector all within component
   */
  $$(selector) {
    if (!this.element) return [];
    return Array.from(this.element.querySelectorAll(selector));
  }

  /**
   * Add event listener and track for cleanup
   */
  on(target, event, handler, options) {
    const element = typeof target === 'string' ? this.$(target) : target;
    if (!element) return;

    element.addEventListener(event, handler, options);
    
    // Track for cleanup
    this.subscriptions.push(() => {
      element.removeEventListener(event, handler, options);
    });
  }

  /**
   * Subscribe to store changes
   */
  subscribe(store, callback) {
    if (!store || typeof store.subscribe !== 'function') {
      console.warn('Invalid store provided to subscribe()');
      return;
    }

    const unsubscribe = store.subscribe(callback);
    this.subscriptions.push(unsubscribe);
    return unsubscribe;
  }

  /**
   * Cleanup all subscriptions
   */
  unsubscribeAll() {
    this.subscriptions.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.subscriptions = [];
  }

  /**
   * Emit custom event
   */
  emit(eventName, detail = {}) {
    if (!this.element) return;

    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true
    });

    this.element.dispatchEvent(event);
  }

  /**
   * Check if component is mounted
   */
  isMounted() {
    return this._mounted;
  }

  /**
   * Check if component is destroyed
   */
  isDestroyed() {
    return this._destroyed;
  }

  /**
   * Show element
   */
  show() {
    if (this.element) {
      this.element.style.display = '';
      this.element.classList.remove('d-none');
    }
  }

  /**
   * Hide element
   */
  hide() {
    if (this.element) {
      this.element.classList.add('d-none');
    }
  }

  /**
   * Toggle visibility
   */
  toggle(force) {
    if (this.element) {
      if (force !== undefined) {
        force ? this.show() : this.hide();
      } else {
        this.element.classList.contains('d-none') ? this.show() : this.hide();
      }
    }
  }

  /**
   * Add class to element
   */
  addClass(...classes) {
    if (this.element) {
      this.element.classList.add(...classes);
    }
  }

  /**
   * Remove class from element
   */
  removeClass(...classes) {
    if (this.element) {
      this.element.classList.remove(...classes);
    }
  }

  /**
   * Toggle class on element
   */
  toggleClass(className, force) {
    if (this.element) {
      this.element.classList.toggle(className, force);
    }
  }

  /**
   * Check if element has class
   */
  hasClass(className) {
    return this.element ? this.element.classList.contains(className) : false;
  }
}

// Export
window.Component = Component;
