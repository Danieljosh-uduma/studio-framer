/**
 * Error Handling System for Studio Framer
 * Provides structured error codes, helpful messages, and debugging utilities
 */

// Error codes by category
const ERROR_CODES = {
  // Rendering errors (1000-1099)
  RENDER_NO_BASE: 1000,
  RENDER_NO_FRAME: 1001,
  RENDER_INVALID_VDOM: 1002,
  RENDER_CANVAS_FAILED: 1003,
  
  // Navigation errors (1100-1199)
  NAVIGATION_ROUTE_NOT_FOUND: 1100,
  NAVIGATION_INVALID_TEMPLATE: 1101,
  NAVIGATION_MISSING_CONFIG: 1102,
  NAVIGATION_ROUTE_UNDEFINED: 1103,
  
  // State management errors (1200-1299)
  STATE_INVALID_VALUE: 1200,
  STATE_CIRCULAR_REFERENCE: 1201,
  STATE_UPDATE_FAILED: 1202,
  
  // Component errors (1300-1399)
  COMPONENT_INVALID_PROPS: 1300,
  COMPONENT_CHILDREN_REQUIRED: 1301,
  COMPONENT_RENDER_FAILED: 1302,
  
  // Virtual DOM errors (1400-1499)
  VDOM_INVALID_TYPE: 1400,
  VDOM_MOUNT_FAILED: 1401,
  VDOM_PATCH_FAILED: 1402,
  VDOM_HTML_PARSE_ERROR: 1403,
  
  // CSS errors (1500-1599)
  CSS_INVALID_SELECTOR: 1500,
  CSS_PARSE_ERROR: 1501,
  CSS_INJECTION_FAILED: 1502,
};

// Error messages with helpful context
const ERROR_MESSAGES = {
  [ERROR_CODES.RENDER_NO_BASE]: {
    message: "Rendering failed: No DOM base element found",
    hint: "Ensure your HTML has a <div id='base'> element where Studio Framer can mount components",
    severity: "ERROR"
  },
  [ERROR_CODES.RENDER_NO_FRAME]: {
    message: "Rendering failed: No current frame to render",
    hint: "Make sure you've called navigate() or defined an initial route before rendering",
    severity: "ERROR"
  },
  [ERROR_CODES.RENDER_INVALID_VDOM]: {
    message: "Rendering failed: Invalid Virtual DOM structure",
    hint: "Check that your component returns a valid h() element or string",
    severity: "ERROR"
  },
  [ERROR_CODES.RENDER_CANVAS_FAILED]: {
    message: "Rendering failed: Canvas generation threw an error",
    hint: "Check your component's canvas() method for errors. Enable debug mode for more details.",
    severity: "ERROR"
  },
  
  [ERROR_CODES.NAVIGATION_ROUTE_NOT_FOUND]: {
    message: "Navigation failed: Route not found in config",
    hint: "Add the route to your studio.config.js routes object",
    severity: "ERROR"
  },
  [ERROR_CODES.NAVIGATION_INVALID_TEMPLATE]: {
    message: "Navigation failed: Template is neither a string nor a function",
    hint: "Pass a valid route path (string) or component function to navigate()",
    severity: "ERROR"
  },
  [ERROR_CODES.NAVIGATION_MISSING_CONFIG]: {
    message: "Navigation failed: No configuration found",
    hint: "Call studio.setConfig() before using navigate()",
    severity: "ERROR"
  },
  
  [ERROR_CODES.STATE_INVALID_VALUE]: {
    message: "State update failed: Invalid state value",
    hint: "Ensure state values are serializable (no circular references or functions)",
    severity: "WARNING"
  },
  [ERROR_CODES.STATE_CIRCULAR_REFERENCE]: {
    message: "State circular reference detected",
    hint: "Remove circular references in your state object",
    severity: "ERROR"
  },
  
  [ERROR_CODES.COMPONENT_INVALID_PROPS]: {
    message: "Component received invalid props",
    hint: "Check your component's expected prop types and pass valid values",
    severity: "WARNING"
  },
  [ERROR_CODES.COMPONENT_RENDER_FAILED]: {
    message: "Component failed to render",
    hint: "Check the component function for errors. Enable debug mode for stack traces.",
    severity: "ERROR"
  },
  
  [ERROR_CODES.VDOM_INVALID_TYPE]: {
    message: "Virtual DOM: Invalid element type",
    hint: "Element type must be a string (HTML tag), TEXT_ELEMENT, or valid component",
    severity: "ERROR"
  },
  [ERROR_CODES.VDOM_MOUNT_FAILED]: {
    message: "Virtual DOM mount operation failed",
    hint: "Ensure the target container exists in the DOM",
    severity: "ERROR"
  },
  [ERROR_CODES.VDOM_PATCH_FAILED]: {
    message: "Virtual DOM patch operation failed",
    hint: "Check for DOM structure mismatches between old and new vnodes",
    severity: "ERROR"
  },
  [ERROR_CODES.VDOM_HTML_PARSE_ERROR]: {
    message: "Failed to parse HTML string to Virtual DOM",
    hint: "Check that your HTML is valid and well-formed",
    severity: "ERROR"
  },
  
  [ERROR_CODES.CSS_INVALID_SELECTOR]: {
    message: "CSS error: Invalid selector provided",
    hint: "Use valid CSS selectors (e.g., '.class', '#id', 'tag', '.class > tag')",
    severity: "WARNING"
  },
  [ERROR_CODES.CSS_PARSE_ERROR]: {
    message: "CSS error: Failed to parse style object",
    hint: "Check that CSS properties use camelCase (e.g., 'backgroundColor', 'fontSize')",
    severity: "WARNING"
  },
  [ERROR_CODES.CSS_INJECTION_FAILED]: {
    message: "CSS error: Failed to inject styles into DOM",
    hint: "Ensure document.head is accessible",
    severity: "ERROR"
  },
};

const DEBUG_MODE = !!globalThis.__STUDIO_DEBUG;

/**
 * Main error handler class
 */
class StudioError extends Error {
  constructor(code, customMessage = null, context = {}) {
    const errorInfo = ERROR_MESSAGES[code] || {
      message: "Unknown error",
      hint: "Check console for more details",
      severity: "ERROR"
    };

    const message = customMessage || errorInfo.message;
    super(message);
    
    this.code = code;
    this.name = "StudioFramerError";
    this.severity = errorInfo.severity;
    this.hint = errorInfo.hint;
    this.context = context;
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toString() {
    return `[${this.code}] ${this.message}\n💡 ${this.hint}`;
  }

  log() {
    const logFn = this.severity === "ERROR" ? console.error : console.warn;
    logFn(
      `%c[Studio Framer ${this.severity}] Code ${this.code}`,
      `color: ${this.severity === 'ERROR' ? '#ff6b6b' : '#ffa500'}; font-weight: bold;`
    );
    logFn(`📝 ${this.message}`);
    logFn(`💡 ${this.hint}`);
    
    if (DEBUG_MODE && Object.keys(this.context).length > 0) {
      logFn("Context:", this.context);
      logFn("Stack:", this.stack);
    }
  }
}

/**
 * Error registry for tracking and reporting
 */
class ErrorRegistry {
  constructor() {
    this.errors = [];
    this.maxErrors = 100;
    this.listeners = [];
  }

  record(error) {
    if (!(error instanceof StudioError)) {
      error = new StudioError(9999, error.message, { originalError: error });
    }

    this.errors.push(error);
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    error.log();
    this.notifyListeners(error);
    
    return error;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(error) {
    this.listeners.forEach(cb => {
      try {
        cb(error);
      } catch (e) {
        console.error("Error in error listener:", e);
      }
    });
  }

  clear() {
    this.errors = [];
  }

  getRecent(count = 10) {
    return this.errors.slice(-count);
  }

  getCounts() {
    const counts = {
      total: this.errors.length,
      errors: 0,
      warnings: 0,
      info: 0
    };
    
    this.errors.forEach(err => {
      if (err.severity === "ERROR") counts.errors++;
      else if (err.severity === "WARNING") counts.warnings++;
      else if (err.severity === "INFO") counts.info++;
    });
    
    return counts;
  }
}

/**
 * Validation utilities
 */
const validate = {
  isValidSelector(selector) {
    try {
      document.querySelector(selector);
      return true;
    } catch {
      return false;
    }
  },

  isSerializable(obj) {
    try {
      JSON.stringify(obj);
      return true;
    } catch {
      return false;
    }
  },

  hasCircularReference(obj, seen = new WeakSet()) {
    if (typeof obj !== 'object' || obj === null) return false;
    if (seen.has(obj)) return true;
    
    seen.add(obj);
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (validate.hasCircularReference(obj[key], seen)) return true;
      }
    }
    return false;
  },

  isValidVNode(vnode) {
    if (!vnode) return false;
    if (typeof vnode !== 'object') return false;
    
    const hasType = 'type' in vnode;
    const hasProps = 'props' in vnode;
    
    return hasType && hasProps;
  },

  isValidRoute(route) {
    return typeof route === 'string' && route.startsWith('/');
  }
};

// Global error registry instance
const errorRegistry = new ErrorRegistry();

export {
  StudioError,
  ErrorRegistry,
  errorRegistry,
  ERROR_CODES,
  ERROR_MESSAGES,
  validate,
  DEBUG_MODE
};
