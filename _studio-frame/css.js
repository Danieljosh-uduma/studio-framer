import { injectCSS } from "./frame.js";
import { StudioError, ERROR_CODES, validate } from "./errors.js";

const styleRegistry = {}

export function style(selector, styleObject) {
    if (!selector || typeof selector !== 'string') {
        const error = new StudioError(
            ERROR_CODES.CSS_INVALID_SELECTOR,
            'CSS selector must be a non-empty string'
        );
        throw error;
    }

    if (!validate.isValidSelector(selector)) {
        const error = new StudioError(
            ERROR_CODES.CSS_INVALID_SELECTOR,
            `Invalid CSS selector: "${selector}"`
        );
        throw error;
    }

    try {
        const cssText = jsonToCssString(selector, styleObject);
        styleRegistry[selector] = cssText;
        injectCSS(cssText);
    } catch (e) {
        const error = e instanceof StudioError ? e : new StudioError(
            ERROR_CODES.CSS_PARSE_ERROR,
            `Failed to apply style: ${e.message}`,
            { selector, styleObject }
        );
        throw error;
    }
}
export function rstyle(selector, styleObject) {
    if (!selector || typeof selector !== 'string') {
        throw new StudioError(
            ERROR_CODES.CSS_INVALID_SELECTOR,
            'CSS selector must be a non-empty string'
        );
    }

    try {
        const cssText = jsonToCssString(selector, styleObject);
        return cssText;
    } catch (e) {
        const error = e instanceof StudioError ? e : new StudioError(
            ERROR_CODES.CSS_PARSE_ERROR,
            `Failed to generate style: ${e.message}`,
            { selector, styleObject }
        );
        throw error;
    }
}

function jsonToCssString(selector, styleObject) {
    if (typeof styleObject === "string") {
        return `${selector} { ${styleObject} }`;
    }

    if (typeof styleObject !== 'object' || styleObject === null) {
        throw new StudioError(
            ERROR_CODES.CSS_PARSE_ERROR,
            'Style object must be a string or object'
        );
    }

    let cssRule = `${selector} {\n`;

    try {
        for (const prop in styleObject) {
            if (styleObject.hasOwnProperty(prop)) {
                const value = styleObject[prop];
                
                if (value === null || value === undefined) {
                    continue;
                }
                
                const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
                cssRule += `  ${cssProp}: ${value};\n`;
            }
        }
    } catch (e) {
        throw new StudioError(
            ERROR_CODES.CSS_PARSE_ERROR,
            `Error parsing CSS properties: ${e.message}`
        );
    }

    cssRule += '}\n';
    return cssRule;
}                                                                                                         
