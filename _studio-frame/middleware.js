/**
 * Middleware System for Studio Framer
 * Allows plugins and extensions via lifecycle hooks
 */

/**
 * Middleware Hook Types
 * These are the integration points where middleware can hook into the framework lifecycle
 */
const HOOK_TYPES = {
  // Framework initialization
  BEFORE_INIT: 'beforeInit',
  AFTER_INIT: 'afterInit',
  
  // Configuration
  BEFORE_SET_CONFIG: 'beforeSetConfig',
  AFTER_SET_CONFIG: 'afterSetConfig',
  
  // Rendering
  BEFORE_RENDER: 'beforeRender',
  AFTER_RENDER: 'afterRender',
  RENDER_ERROR: 'renderError',
  
  // Navigation
  BEFORE_NAVIGATE: 'beforeNavigate',
  AFTER_NAVIGATE: 'afterNavigate',
  NAVIGATE_ERROR: 'navigateError',
  
  // State management
  BEFORE_STATE_CHANGE: 'beforeStateChange',
  AFTER_STATE_CHANGE: 'afterStateChange',
  STATE_ERROR: 'stateError',
  
  // Virtual DOM
  BEFORE_PATCH: 'beforePatch',
  AFTER_PATCH: 'afterPatch',
  PATCH_ERROR: 'patchError',
  
  // Events
  BEFORE_ACTION: 'beforeAction',
  AFTER_ACTION: 'afterAction',
  ACTION_ERROR: 'actionError'
};

/**
 * Middleware context object passed to hooks
 */
class MiddlewareContext {
  constructor(data = {}) {
    this.data = data;
    this.meta = {
      timestamp: Date.now(),
      cancelled: false,
      skipDefault: false
    };
  }

  cancel() {
    this.meta.cancelled = true;
  }

  skip() {
    this.meta.skipDefault = true;
  }

  isCancelled() {
    return this.meta.cancelled;
  }

  shouldSkipDefault() {
    return this.meta.skipDefault;
  }

  update(updates) {
    this.data = { ...this.data, ...updates };
  }
}

/**
 * Middleware Manager - handles registration and execution
 */
class MiddlewareManager {
  constructor() {
    this.middlewares = {};
    this.errorHandlers = [];
    this.enabled = true;
    
    // Initialize hook storage
    Object.values(HOOK_TYPES).forEach(hook => {
      this.middlewares[hook] = [];
    });
  }

  /**
   * Register middleware for a specific hook
   */
  use(hook, handler, priority = 'normal') {
    if (!this.middlewares[hook]) {
      console.warn(`[Middleware] Unknown hook: ${hook}`);
      return;
    }

    const priority_weight = {
      low: 100,
      normal: 50,
      high: 0
    }[priority] || 50;

    const middleware = {
      handler,
      priority: priority_weight,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now()
    };

    this.middlewares[hook].push(middleware);
    
    // Sort by priority
    this.middlewares[hook].sort((a, b) => a.priority - b.priority);

    // Return unsubscribe function
    return () => this.unuse(hook, middleware.id);
  }

  /**
   * Register multiple middlewares at once
   */
  useMany(middlewares, priority = 'normal') {
    const unsubscribes = [];
    for (const [hook, handler] of Object.entries(middlewares)) {
      const unsubscribe = this.use(hook, handler, priority);
      unsubscribes.push(unsubscribe);
    }
    return () => unsubscribes.forEach(unsub => unsub());
  }

  /**
   * Unregister middleware
   */
  unuse(hook, middlewareId) {
    if (!this.middlewares[hook]) return;
    this.middlewares[hook] = this.middlewares[hook].filter(m => m.id !== middlewareId);
  }

  /**
   * Execute middleware chain for a hook
   */
  async execute(hook, context = {}) {
    if (!this.enabled) {
      return new MiddlewareContext(context);
    }

    if (!this.middlewares[hook]) {
      console.warn(`[Middleware] Unknown hook: ${hook}`);
      return new MiddlewareContext(context);
    }

    const ctx = new MiddlewareContext(context);
    const handlers = this.middlewares[hook];

    for (const middleware of handlers) {
      if (ctx.isCancelled()) break;

      try {
        const result = middleware.handler(ctx);
        
        // Handle async middleware
        if (result instanceof Promise) {
          await result;
        }
      } catch (error) {
        this.handleError(error, hook, ctx);
        
        // Continue to next middleware even on error
        // unless error handler cancels
        if (ctx.isCancelled()) break;
      }
    }

    return ctx;
  }

  /**
   * Register global error handler for middleware errors
   */
  onError(handler) {
    this.errorHandlers.push(handler);
    return () => {
      this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Handle errors in middleware
   */
  handleError(error, hook, context) {
    for (const handler of this.errorHandlers) {
      try {
        handler(error, hook, context);
      } catch (e) {
        console.error('[Middleware] Error in error handler:', e);
      }
    }
  }

  /**
   * Get all registered middlewares for a hook
   */
  getMiddlewares(hook) {
    return this.middlewares[hook] || [];
  }

  /**
   * Clear all middlewares
   */
  clear() {
    Object.values(HOOK_TYPES).forEach(hook => {
      this.middlewares[hook] = [];
    });
  }

  /**
   * Get middleware statistics
   */
  stats() {
    const stats = {
      total: 0,
      byHook: {}
    };

    Object.entries(this.middlewares).forEach(([hook, handlers]) => {
      stats.byHook[hook] = handlers.length;
      stats.total += handlers.length;
    });

    return stats;
  }

  /**
   * Toggle middleware system on/off
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }
}

/**
 * Built-in middleware helpers
 */
const builtinMiddleware = {
  /**
   * Logging middleware - logs lifecycle events
   */
  logger: (hook) => ({
    [hook]: (ctx) => {
      console.log(`[Middleware] ${hook}:`, ctx.data);
    }
  }),

  /**
   * Performance monitoring middleware
   */
  performance: (hook) => ({
    [hook]: (ctx) => {
      ctx.meta.startTime = performance.now();
      
      return () => {
        const duration = performance.now() - ctx.meta.startTime;
        if (duration > 100) {
          console.warn(`[Performance] ${hook} took ${duration.toFixed(2)}ms`);
        }
      };
    }
  }),

  /**
   * Rate limiting middleware
   */
  rateLimit: (hook, maxCalls, timeWindow = 1000) => {
    const calls = [];
    return {
      [hook]: (ctx) => {
        const now = Date.now();
        calls.push(now);

        // Remove old calls outside time window
        while (calls.length > 0 && calls[0] < now - timeWindow) {
          calls.shift();
        }

        if (calls.length > maxCalls) {
          console.warn(`[RateLimit] ${hook} exceeded ${maxCalls} calls in ${timeWindow}ms`);
          ctx.cancel();
        }
      }
    };
  },

  /**
   * Validation middleware
   */
  validator: (hook, schema) => ({
    [hook]: (ctx) => {
      for (const [key, validator] of Object.entries(schema)) {
        const value = ctx.data[key];
        if (!validator(value)) {
          console.error(`[Validation] Invalid ${key}: ${value}`);
          ctx.cancel();
          return;
        }
      }
    }
  }),

  /**
   * Analytics/tracking middleware
   */
  analytics: (hook) => ({
    [hook]: (ctx) => {
      if (typeof window !== 'undefined' && window.__studioAnalytics) {
        window.__studioAnalytics.track(hook, ctx.data);
      }
    }
  })
};

/**
 * Plugin system built on top of middleware
 */
class PluginSystem {
  constructor(middlewareManager) {
    this.manager = middlewareManager;
    this.plugins = new Map();
  }

  /**
   * Install a plugin
   */
  install(plugin, options = {}) {
    if (typeof plugin !== 'function' && typeof plugin !== 'object') {
      throw new Error('Plugin must be a function or object with install method');
    }

    const id = plugin.name || `plugin_${Date.now()}`;
    
    if (this.plugins.has(id)) {
      console.warn(`[Plugin] Plugin "${id}" is already installed`);
      return;
    }

    if (typeof plugin === 'function') {
      plugin(this.manager, options);
    } else if (typeof plugin.install === 'function') {
      plugin.install(this.manager, options);
    }

    this.plugins.set(id, { plugin, options, installedAt: Date.now() });
    console.log(`[Plugin] "${id}" installed successfully`);
  }

  /**
   * Uninstall a plugin
   */
  uninstall(pluginId) {
    const pluginData = this.plugins.get(pluginId);
    if (!pluginData) {
      console.warn(`[Plugin] Plugin "${pluginId}" not found`);
      return;
    }

    if (typeof pluginData.plugin.uninstall === 'function') {
      pluginData.plugin.uninstall(this.manager);
    }

    this.plugins.delete(pluginId);
    console.log(`[Plugin] "${pluginId}" uninstalled`);
  }

  /**
   * List installed plugins
   */
  list() {
    return Array.from(this.plugins.entries()).map(([id, data]) => ({
      id,
      name: data.plugin.name || id,
      installedAt: new Date(data.installedAt).toISOString(),
      options: data.options
    }));
  }
}

// Create global middleware manager instance
const middlewareManager = new MiddlewareManager();
const pluginSystem = new PluginSystem(middlewareManager);

export {
  MiddlewareManager,
  MiddlewareContext,
  PluginSystem,
  HOOK_TYPES,
  builtinMiddleware,
  middlewareManager,
  pluginSystem
};
