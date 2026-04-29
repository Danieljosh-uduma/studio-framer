/**
 * Template System for Studio Framer
 * Enables direct VNode templating with html`` tagged templates
 */

import { h } from './vdom.js';

/**
 * HTML template tag for creating VNodes
 * Eliminates need for DOMParser, creates VNodes directly
 * @param {Array<string>} strings - Template strings
 * @param {...any} values - Interpolated values (signals, variables, components)
 * @returns {Object} VNode or array of VNodes
 */
export function html(strings, ...values) {
  let result = '';

  // Interleave strings and values
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      const value = values[i];
      // Handle signals (functions that return values)
      if (typeof value === 'function' && value.isSignal) {
        result += value();
      } else if (typeof value === 'function') {
        result += value();
      } else if (value != null) {
        result += String(value);
      }
    }
  }

  return parseTemplateString(result);
}

/**
 * CSS template tag for scoped styling
 * Creates unique class names and returns style + class
 * @param {Array<string>} strings - CSS strings
 * @param {...any} values - CSS values
 * @returns {Object} { style: string, className: string }
 */
export function css(strings, ...values) {
  let cssText = '';

  // Interleave strings and values
  for (let i = 0; i < strings.length; i++) {
    cssText += strings[i];
    if (i < values.length) {
      const value = values[i];
      if (typeof value === 'function' && value.isSignal) {
        cssText += value();
      } else if (value != null) {
        cssText += String(value);
      }
    }
  }

  // Generate unique class name
  const hash = generateHash(cssText);
  const className = `scoped-${hash}`;

  // Wrap CSS with class name
  const scopedCSS = `.${className} { ${cssText} }`;

  return {
    style: scopedCSS,
    className,
    toString() {
      return className;
    }
  };
}

/**
 * Fragment template tag for multi-root components
 * @param {Array<string>} strings - Template strings
 * @param {...any} values - Values
 * @returns {Array<Object>} Array of VNodes
 */
export function fragment(strings, ...values) {
  let result = '';

  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      const value = values[i];
      if (typeof value === 'function' && value.isSignal) {
        result += value();
      } else if (value != null) {
        result += String(value);
      }
    }
  }

  // Wrap in a temporary container and extract children
  const container = `<div>${result}</div>`;
  const vnode = parseTemplateString(container);
  
  // Return children as array (fragment representation)
  return vnode.props.children || [];
}

/**
 * Parse template string into VNode structure
 * Uses innerHTML trick to avoid DOMParser overhead
 * @private
 * @param {string} htmlString
 * @returns {Object} VNode
 */
function parseTemplateString(htmlString) {
  // Create a temporary container
  const container = document.createElement('div');
  container.innerHTML = htmlString.trim();
  
  // Convert DOM to VNode
  return domToVNode(container.firstChild);
}

/**
 * Convert DOM element to VNode
 * @private
 * @param {Node} node
 * @returns {Object} VNode
 */
function domToVNode(node) {
  if (!node) return null;

  if (node.nodeType === 3) {
    // Text node
    return {
      type: 'TEXT_ELEMENT',
      props: { nodeValue: node.nodeValue },
      children: []
    };
  }

  const type = node.nodeName.toLowerCase();
  const props = {};

  // Extract attributes
  if (node.attributes) {
    for (let attr of node.attributes) {
      props[attr.name] = attr.value;
    }
  }

  // Extract children
  const children = [];
  for (let child of node.childNodes) {
    if (child.nodeType === 1 || child.nodeType === 3) {
      children.push(domToVNode(child));
    }
  }

  return {
    type,
    props: { ...props, children },
    children
  };
}

/**
 * Simple hash function for generating class names
 * @private
 * @param {string} str
 * @returns {string}
 */
function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Template utilities
 */
export const templateUtils = {
  /**
   * Safely interpolate values into templates
   */
  safe(value) {
    if (typeof value === 'string') {
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    return String(value);
  },

  /**
   * Create conditional template
   */
  when(condition, trueBranch, falseBranch = '') {
    return condition ? trueBranch : falseBranch;
  },

  /**
   * Create list from array
   */
  map(array, fn) {
    if (!Array.isArray(array)) return '';
    return array.map((item, i) => fn(item, i)).join('');
  },

  /**
   * Handle null/undefined gracefully
   */
  optional(value, defaultValue = '') {
    return value != null ? value : defaultValue;
  }
};

export default {
  html,
  css,
  fragment,
  templateUtils
};
