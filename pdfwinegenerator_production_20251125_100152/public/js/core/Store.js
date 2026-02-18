/**
 * Store - Simple State Management
 * Reactive state management with subscriptions
 */

class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.subscribers = new Set();
    this.middleware = [];
    this.history = [];
    this.maxHistory = 50;

    // Enable time-travel debugging in development
    if (this.isDevelopment()) {
      this.enableTimeTravel();
    }
  }

  /**
   * Get current state
   */
  getState(key) {
    if (key) {
      return this.state[key];
    }
    return { ...this.state };
  }

  /**
   * Set state and notify subscribers
   */
  setState(updates, meta = {}) {
    if (typeof updates === 'function') {
      updates = updates(this.state);
    }

    const prevState = { ...this.state };
    const nextState = { ...this.state, ...updates };

    // Run middleware
    const action = {
      type: meta.type || 'SET_STATE',
      payload: updates,
      prevState,
      nextState,
      meta
    };

    const shouldUpdate = this.runMiddleware(action);
    if (!shouldUpdate) {
      return;
    }

    // Update state
    this.state = nextState;

    // Save to history
    this.saveToHistory(prevState, nextState, action);

    // Notify subscribers
    this.notify(prevState, nextState);
  }

  /**
   * Subscribe to state changes
   */
  subscribe(callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    this.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers
   */
  notify(prevState, nextState) {
    this.subscribers.forEach(callback => {
      try {
        callback(nextState, prevState);
      } catch (error) {
        console.error('Error in store subscriber:', error);
      }
    });
  }

  /**
   * Add middleware
   */
  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function');
    }
    this.middleware.push(middleware);
  }

  /**
   * Run middleware chain
   */
  runMiddleware(action) {
    for (const middleware of this.middleware) {
      const result = middleware(action, this);
      if (result === false) {
        return false; // Cancel state update
      }
    }
    return true;
  }

  /**
   * Save state to history
   */
  saveToHistory(prevState, nextState, action) {
    this.history.push({
      timestamp: Date.now(),
      prevState,
      nextState,
      action
    });

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * Get state history
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Time travel to specific state
   */
  timeTravel(index) {
    if (index < 0 || index >= this.history.length) {
      throw new Error('Invalid history index');
    }

    const historyItem = this.history[index];
    this.state = { ...historyItem.nextState };
    this.notify(historyItem.prevState, historyItem.nextState);
  }

  /**
   * Undo last state change
   */
  undo() {
    if (this.history.length < 2) return;

    const prevHistoryItem = this.history[this.history.length - 2];
    this.state = { ...prevHistoryItem.nextState };
    this.notify(this.history[this.history.length - 1].nextState, prevHistoryItem.nextState);
    this.history.pop();
  }

  /**
   * Reset state to initial
   */
  reset(initialState) {
    const prevState = { ...this.state };
    this.state = initialState || {};
    this.notify(prevState, this.state);
    this.clearHistory();
  }

  /**
   * Batch updates
   */
  batch(callback) {
    const batchUpdates = {};
    const batchedSetState = (updates) => {
      Object.assign(batchUpdates, updates);
    };

    // Run callback with batched setState
    callback(batchedSetState);

    // Apply all updates at once
    if (Object.keys(batchUpdates).length > 0) {
      this.setState(batchUpdates);
    }
  }

  /**
   * Watch specific key
   */
  watch(key, callback) {
    return this.subscribe((nextState, prevState) => {
      if (nextState[key] !== prevState[key]) {
        callback(nextState[key], prevState[key]);
      }
    });
  }

  /**
   * Compute derived state
   */
  computed(key, getter) {
    Object.defineProperty(this.state, key, {
      get: () => getter(this.state),
      enumerable: true,
      configurable: true
    });
  }

  /**
   * Persist state to localStorage
   */
  persist(storageKey = 'store') {
    // Load from localStorage
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsedState = JSON.parse(stored);
        this.state = { ...this.state, ...parsedState };
      } catch (error) {
        console.error('Error loading persisted state:', error);
      }
    }

    // Subscribe to changes and save
    this.subscribe((nextState) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextState));
      } catch (error) {
        console.error('Error persisting state:', error);
      }
    });
  }

  /**
   * Enable time-travel debugging
   */
  enableTimeTravel() {
    window.__STORE_DEVTOOLS__ = {
      getState: () => this.getState(),
      getHistory: () => this.getHistory(),
      timeTravel: (index) => this.timeTravel(index),
      undo: () => this.undo(),
      reset: () => this.reset()
    };

    console.log('Store DevTools enabled. Access via window.__STORE_DEVTOOLS__');
  }

  /**
   * Check if in development mode
   */
  isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
  }

  /**
   * Create namespaced sub-store
   */
  createNamespace(namespace) {
    const namespacedStore = new Store(this.state[namespace] || {});

    // Sync changes back to parent
    namespacedStore.subscribe((nextState) => {
      this.setState({
        [namespace]: nextState
      });
    });

    return namespacedStore;
  }
}

/**
 * Create global store
 */
function createStore(initialState = {}) {
  return new Store(initialState);
}

// Export
window.Store = Store;
window.createStore = createStore;
