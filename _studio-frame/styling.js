/**
 * Scoped Styling System for Studio Framer
 * Provides component-scoped CSS with unique class names
 */

const scopedStyles = new Map();
let styleTag = null;

/**
 * Initialize style tag if not exists
 * @private
 */
function initStyleTag() {
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.setAttribute('data-studio-scoped', 'true');
    document.head.appendChild(styleTag);
  }
}

/**
 * Generate hash for scoping
 * @private
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Create scoped style object
 * @param {string} componentName - Component identifier
 * @param {Object} styles - Style object
 * @returns {Object} Scoped style with className
 */
export function createScopedStyles(componentName, styles) {
  const scopeId = `${componentName}-${hashCode(JSON.stringify(styles))}`;
  
  if (scopedStyles.has(scopeId)) {
    return scopedStyles.get(scopeId);
  }

  const scopedObj = {};
  initStyleTag();

  for (const [className, styleObj] of Object.entries(styles)) {
    const scopedClassName = `${scopeId}-${className}`;
    const cssText = objectToCss(className, styleObj, scopeId);
    
    // Inject into style tag
    styleTag.textContent += cssText;
    
    scopedObj[className] = scopedClassName;
    scopedObj[`${className}Class`] = scopedClassName;
  }

  scopedStyles.set(scopeId, scopedObj);
  return scopedObj;
}

/**
 * Convert style object to CSS with scope
 * @private
 */
function objectToCss(className, styleObj, scopeId) {
  const scopedClass = `${scopeId}-${className}`;
  let css = `.${scopedClass} {\n`;

  for (const [prop, value] of Object.entries(styleObj)) {
    const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
    css += `  ${cssProp}: ${value};\n`;
  }

  css += '}\n';
  return css;
}

/**
 * CSS-in-JS style hook
 * @param {Object} styles - Style definitions
 * @param {string} [componentName] - Optional component name for debugging
 * @returns {Object} Scoped styles
 */
export function useStyles(styles, componentName = 'component') {
  return createScopedStyles(componentName, styles);
}

/**
 * Create CSS module-like object
 * @param {string} componentName
 * @param {Object} styles
 * @returns {Object} Scoped styles object
 */
export function createStyleModule(componentName, styles) {
  const scoped = createScopedStyles(componentName, styles);
  
  return {
    ...scoped,
    toString() {
      return Object.values(scoped)
        .filter(v => typeof v === 'string' && !v.includes('Class'))
        .join(' ');
    }
  };
}

/**
 * Dynamic style injection
 * @param {string} selector
 * @param {Object} styleObj
 */
export function injectDynamicStyle(selector, styleObj) {
  initStyleTag();
  let css = `${selector} {\n`;
  
  for (const [prop, value] of Object.entries(styleObj)) {
    const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
    css += `  ${cssProp}: ${value};\n`;
  }
  
  css += '}\n';
  styleTag.textContent += css;
}

/**
 * Responsive style helper
 * @param {Object} breakpoints
 * @returns {Function}
 */
export function createResponsiveStyles(breakpoints) {
  return (styles) => {
    let css = '';
    
    for (const [breakpoint, breakpointStyles] of Object.entries(styles)) {
      if (breakpoint === 'default') {
        for (const [prop, value] of Object.entries(breakpointStyles)) {
          css += `${prop}: ${value};\n`;
        }
      } else if (breakpoints[breakpoint]) {
        css += `@media (min-width: ${breakpoints[breakpoint]}) {\n`;
        for (const [prop, value] of Object.entries(breakpointStyles)) {
          css += `  ${prop}: ${value};\n`;
        }
        css += '}\n';
      }
    }
    
    return css;
  };
}

/**
 * CSS variable helper for theming
 * @param {Object} theme
 * @returns {Object}
 */
export function createTheme(theme) {
  let cssVars = ':root {\n';
  
  for (const [key, value] of Object.entries(theme)) {
    const varName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    cssVars += `  --${varName}: ${value};\n`;
  }
  
  cssVars += '}\n';
  
  initStyleTag();
  styleTag.textContent += cssVars;
  
  return {
    ...theme,
    var(key) {
      return `var(--${key.replace(/([A-Z])/g, '-$1').toLowerCase()})`;
    }
  };
}

/**
 * Keyframe animation helper
 * @param {string} name
 * @param {Object} frames
 */
export function createKeyframes(name, frames) {
  let css = `@keyframes ${name} {\n`;
  
  for (const [percent, styles] of Object.entries(frames)) {
    css += `  ${percent} {\n`;
    for (const [prop, value] of Object.entries(styles)) {
      const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      css += `    ${cssProp}: ${value};\n`;
    }
    css += '  }\n';
  }
  
  css += '}\n';
  
  initStyleTag();
  styleTag.textContent += css;
  
  return name;
}

/**
 * Clear all scoped styles
 */
export function clearScopedStyles() {
  scopedStyles.clear();
  if (styleTag) {
    styleTag.textContent = '';
  }
}

/**
 * Style composition helper
 * @param {...Object} styleObjects
 * @returns {Object}
 */
export function mergeStyles(...styleObjects) {
  return styleObjects.reduce((acc, obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        acc[key] = { ...acc[key], ...value };
      } else {
        acc[key] = value;
      }
    }
    return acc;
  }, {});
}

export default {
  createScopedStyles,
  useStyles,
  createStyleModule,
  injectDynamicStyle,
  createResponsiveStyles,
  createTheme,
  createKeyframes,
  clearScopedStyles,
  mergeStyles
};
