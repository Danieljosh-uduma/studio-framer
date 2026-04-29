import { h, mount, patch, htmlToVNode, Fragment } from "./vdom.js";
import { style } from "./css.js";
import { StudioError, errorRegistry, ERROR_CODES, validate } from "./errors.js";
import { middlewareManager, pluginSystem, HOOK_TYPES, builtinMiddleware } from "./middleware.js";
import { createSignal, createComputed, createState, createEffect, signalContext } from "./signals.js";
import { html, css, fragment, templateUtils } from "./template.js";
import { usePixelEffect, useLayoutEffect, useMemo, useCallback, useReducer, useRef, cleanupHooks } from "./lifecycle.js";
import { createScopedStyles, useStyles, createStyleModule, createTheme, createKeyframes } from "./styling.js";

/**
 * Main Studio Framer class
 * @typedef {Object} Studio
 * @property {HTMLElement|null} base - DOM base element
 * @property {Object|null} oldVDom - Previous virtual DOM
 * @property {Object} state - Application state
 * @property {Object} style - Style object
 * @property {Object} actions - Event actions
 * @property {Object} config - Configuration
 */
class Studio {
    /**
     * Initialize Studio instance
     * @param {Document} [base=document] - Document or base element reference
     */
    constructor(base = document) {
        this.base = base ? base.getElementById('base') : null;
        this.oldVDom = null;
        this.state = {};
        this.style = {}
        this.actions = {};
        this.config = {}; // Initialize empty, set later

        this.middlewareManager = middlewareManager;
        this.errorRegistry = errorRegistry;

        this.initRouter();
        this.initErrorHandlers();
    }

    initErrorHandlers() {
        // Global error listener for middleware errors
        this.middlewareManager.onError((error, hook, context) => {
            errorRegistry.record(error);
        });

        // Window error handler
        window.addEventListener('error', (event) => {
            const error = new StudioError(
                ERROR_CODES.COMPONENT_RENDER_FAILED,
                `Uncaught error: ${event.message}`,
                { originalEvent: event }
            );
            errorRegistry.record(error);
        });
    }

    /**
     * Set Studio configuration
     * @param {Object} config - Configuration object
     * @param {boolean} [config.tailwind] - Enable Tailwind CSS
     * @param {Object} [config.routes] - Route configuration
     * @returns {Promise<void>}
     */
    async setConfig(config) {
        // Execute beforeSetConfig middleware
        const beforeCtx = await this.middlewareManager.execute(HOOK_TYPES.BEFORE_SET_CONFIG, { config });
        
        if (beforeCtx.isCancelled()) {
            const error = new StudioError(
                ERROR_CODES.NAVIGATION_MISSING_CONFIG,
                'Config setup was cancelled by middleware'
            );
            errorRegistry.record(error);
            return;
        }

        this.config = beforeCtx.data.config || config;
        
        if (this.config.tailwind) {
            this.injectTailwind();
        }
        
        // Execute afterSetConfig middleware
        await this.middlewareManager.execute(HOOK_TYPES.AFTER_SET_CONFIG, { config: this.config });
        
        // Handle initial route after config is set
        this.handleRoute(window.location.pathname);
    }

    initRouter() {
        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.pathname);
        });
    }

    handleRoute(path) {
        if (!this.config.routes) return;
        
        // Normalize path for local filesystem or nested paths
        // Try exact match first
        let component = this.config.routes[path];
        
        // If no match, try finding a route that ends with this path
        if (!component) {
            const keys = Object.keys(this.config.routes);
            const matchingKey = keys.find(k => path.endsWith(k) && k !== '/');
            component = matchingKey ? this.config.routes[matchingKey] : this.config.routes['/'];
        }
        
        this.navigate(component, null, false);
    }

    injectTailwind() {
        if (document.head.querySelector('script[src*="tailwindcss"]')) return;
        const script = document.createElement('script');
        script.src = "https://cdn.tailwindcss.com";
        document.head.appendChild(script);
    }
    
    /**
     * Update application state
     * @param {Object} newState - New state values
     * @returns {Promise<void>}
     * @throws {StudioError} If state contains circular references
     */
    async setState(newState) {
        // Validate state before update
        if (validate.hasCircularReference(newState)) {
            const error = new StudioError(ERROR_CODES.STATE_CIRCULAR_REFERENCE);
            errorRegistry.record(error);
            return;
        }

        // Execute beforeStateChange middleware
        const beforeCtx = await this.middlewareManager.execute(HOOK_TYPES.BEFORE_STATE_CHANGE, { 
            previousState: this.state,
            newState 
        });

        if (beforeCtx.isCancelled()) {
            console.log('State change cancelled by middleware');
            return;
        }

        const stateToUpdate = beforeCtx.data.newState || newState;
        Object.assign(this.state, stateToUpdate);
        
        // Execute afterStateChange middleware
        await this.middlewareManager.execute(HOOK_TYPES.AFTER_STATE_CHANGE, { 
            state: this.state 
        });

        this.render();
    } 
    /**
     * Render the current frame
     * @returns {Promise<void>}
     * @throws {StudioError} If rendering fails
     */
    async render() {
        try {
            // Execute beforeRender middleware
            await this.middlewareManager.execute(HOOK_TYPES.BEFORE_RENDER, { 
                state: this.state 
            });

            if (!this.base && !this.currentFrame) {
                throw new StudioError(ERROR_CODES.RENDER_NO_BASE);
            }

            const canvasHTML = await this.getCanvas();
            if (canvasHTML === null) {
                throw new StudioError(ERROR_CODES.RENDER_CANVAS_FAILED);
            }

            let newVDom;
            try {
                newVDom = htmlToVNode(canvasHTML);
            } catch (e) {
                throw new StudioError(
                    ERROR_CODES.VDOM_HTML_PARSE_ERROR,
                    `Failed to parse HTML: ${e.message}`
                );
            }

            if (!validate.isValidVNode(newVDom)) {
                throw new StudioError(ERROR_CODES.RENDER_INVALID_VDOM);
            }

            this.injectActions(newVDom);

            if (!this.oldVDom) {
                if (this.base) {
                    this.base.innerHTML = "";
                    try {
                        mount(newVDom, this.base);
                    } catch (e) {
                        throw new StudioError(
                            ERROR_CODES.VDOM_MOUNT_FAILED,
                            `Mount failed: ${e.message}`
                        );
                    }
                }
            } else {
                try {
                    // Execute beforePatch middleware
                    await this.middlewareManager.execute(HOOK_TYPES.BEFORE_PATCH, { 
                        oldVNode: this.oldVDom,
                        newVNode: newVDom
                    });

                    patch(this.base, this.oldVDom, newVDom);

                    // Execute afterPatch middleware
                    await this.middlewareManager.execute(HOOK_TYPES.AFTER_PATCH, { 
                        vnode: newVDom
                    });
                } catch (e) {
                    throw new StudioError(
                        ERROR_CODES.VDOM_PATCH_FAILED,
                        `Patch failed: ${e.message}`
                    );
                }
            }

            this.oldVDom = newVDom;

            if (this.style["style"]) {
                this.updateStyles();
            }

            // Execute afterRender middleware
            await this.middlewareManager.execute(HOOK_TYPES.AFTER_RENDER, { 
                vnode: newVDom 
            });
        } catch (error) {
            if (!(error instanceof StudioError)) {
                error = new StudioError(
                    ERROR_CODES.RENDER_CANVAS_FAILED,
                    error.message,
                    { originalError: error }
                );
            }

            errorRegistry.record(error);

            // Execute renderError middleware
            await this.middlewareManager.execute(HOOK_TYPES.RENDER_ERROR, { 
                error 
            });
        }
    }

    async getCanvas() {
        if (!this.currentFrame) return null;
        let canvas = await this.currentFrame();
        
        // Better interpolation
        for (const key in this.state) {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
            canvas = canvas.replace(regex, this.state[key]);
        }
        
        return canvas;
    }

    injectActions(vnode) {
        if (!vnode) return;
        
        const id = vnode.props.id;
        if (id && this.actions[id]) {
            const action = this.actions[id];
            vnode.props[`on${action.type}`] = action.func;
        }

        if (vnode.props.children) {
            vnode.props.children.forEach(child => this.injectActions(child));
        }
    }

    /**
     * Navigate to a route or frame
     * @param {string|Function|Object} template - Route path, component function, or frame object
     * @param {Object} [props=null] - Properties to pass to component
     * @param {boolean} [pushState=true] - Whether to update browser history
     * @returns {Promise<void>}
     * @throws {StudioError} If navigation fails or route not found
     */
    async navigate(template, props = null, pushState = true) {
        try {
            // Execute beforeNavigate middleware
            const beforeCtx = await this.middlewareManager.execute(HOOK_TYPES.BEFORE_NAVIGATE, { 
                template,
                props 
            });

            if (beforeCtx.isCancelled()) {
                const error = new StudioError(
                    ERROR_CODES.NAVIGATION_INVALID_TEMPLATE,
                    'Navigation was cancelled by middleware'
                );
                errorRegistry.record(error);
                return;
            }

            template = beforeCtx.data.template || template;
            props = beforeCtx.data.props || props;

            // Handle path strings
            if (typeof template === 'string') {
                if (!this.config.routes) {
                    throw new StudioError(ERROR_CODES.NAVIGATION_MISSING_CONFIG);
                }

                const component = this.config.routes[template];
                if (component) {
                    if (pushState) history.pushState({}, '', template);
                    return this.navigate(component, props, false);
                }
                throw new StudioError(
                    ERROR_CODES.NAVIGATION_ROUTE_NOT_FOUND,
                    `Route "${template}" not found in config`
                );
            }

            // Validate template type
            if (typeof template !== 'function' && typeof template !== 'object') {
                throw new StudioError(
                    ERROR_CODES.NAVIGATION_INVALID_TEMPLATE,
                    'Template must be a function, object, or route path string'
                );
            }

            const frame = (typeof template === 'function') ? template(props) : template;
            
            if (!frame || typeof frame.canvas === 'undefined') {
                throw new StudioError(
                    ERROR_CODES.COMPONENT_RENDER_FAILED,
                    'Component must return an object with a canvas property'
                );
            }

            this.currentFrame = frame.canvas;
            
            this.actions = {};
            if (frame.action) {
                const actions = Array.isArray(frame.action) ? frame.action : [frame.action];
                actions.forEach(act => {
                    if (!act.id || !act.func || !act.type) {
                        const error = new StudioError(
                            ERROR_CODES.COMPONENT_INVALID_PROPS,
                            'Action must have id, func, and type properties'
                        );
                        errorRegistry.record(error);
                        return;
                    }
                    this.addEvent(act.id, { func: act.func, type: act.type });
                });
            }

            if (frame.style) {
                const styleText = typeof frame.style === 'string' ? frame.style : JSON.stringify(frame.style);
                this.addStyle(styleText);
            }

            // Execute afterNavigate middleware
            await this.middlewareManager.execute(HOOK_TYPES.AFTER_NAVIGATE, { 
                frame,
                props 
            });

            if (frame.state) {
                this.setState(frame.state);
            } else {
                this.render();
            }

            // Auto-update URL if pushState is true and we can find a matching path
            if (pushState && typeof template === 'function') {
                const path = Object.keys(this.config.routes).find(key => this.config.routes[key] === template);
                if (path) history.pushState({}, '', path);
            }
        } catch (error) {
            if (!(error instanceof StudioError)) {
                error = new StudioError(
                    ERROR_CODES.NAVIGATION_INVALID_TEMPLATE,
                    error.message,
                    { originalError: error }
                );
            }

            errorRegistry.record(error);

            // Execute navigateError middleware
            await this.middlewareManager.execute(HOOK_TYPES.NAVIGATE_ERROR, { 
                error,
                template,
                props 
            });
        }
    }

    /**
     * Add event handler
     * @param {string} id - Unique event identifier
     * @param {Object} config - Event configuration
     * @param {Function} config.func - Event handler function
     * @param {string} config.type - Event type (click, change, etc.)
     * @returns {Promise<void>}
     */
    async addEvent(id, { func, type }) {
        // Validate event properties
        if (!id || !func || !type) {
            const error = new StudioError(
                ERROR_CODES.COMPONENT_INVALID_PROPS,
                'Event must have id, func, and type'
            );
            errorRegistry.record(error);
            return;
        }

        if (typeof func !== 'function') {
            const error = new StudioError(
                ERROR_CODES.COMPONENT_INVALID_PROPS,
                `Event handler must be a function, got ${typeof func}`
            );
            errorRegistry.record(error);
            return;
        }

        // Wrap the handler with middleware
        const wrappedFunc = async (event) => {
            try {
                // Execute beforeAction middleware
                await this.middlewareManager.execute(HOOK_TYPES.BEFORE_ACTION, { 
                    id,
                    type,
                    event 
                });

                await func(event);

                // Execute afterAction middleware
                await this.middlewareManager.execute(HOOK_TYPES.AFTER_ACTION, { 
                    id,
                    type,
                    event 
                });
            } catch (error) {
                const studioError = error instanceof StudioError ? error : new StudioError(
                    ERROR_CODES.ACTION_ERROR,
                    `Action failed: ${error.message}`,
                    { originalError: error }
                );
                errorRegistry.record(studioError);

                // Execute actionError middleware
                await this.middlewareManager.execute(HOOK_TYPES.ACTION_ERROR, { 
                    error: studioError,
                    id,
                    type,
                    event 
                });
            }
        };

        this.actions[id] = { func: wrappedFunc, type };
    }

    addStyle(style) {
        this.style["style"] = style;
        this.updateStyles();
    }

    updateStyles() {
        let styleTag = document.head.querySelector('style#studio-style');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'studio-style';
            document.head.appendChild(styleTag);
        }
        styleTag.textContent = this.style["style"] || "";
    }

    addDOMStyle(cssText) {
        let styleTag = document.head.querySelector('style#studio-injected-style');
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = 'studio-injected-style';
            document.head.appendChild(styleTag);
        }
        styleTag.textContent += cssText;
    }
}
const studio = new Studio()
const navigate = (template, props) => studio.navigate(template, props)
const useStore = (value) => studio.state[value]
const injectCSS = (cssText) => studio.addDOMStyle(cssText)
const usePixel = (state, initialValue) => {
    const dict = {}
    dict[state] = initialValue
    if (studio.state[state] === undefined) {
        Object.assign(studio.state, dict);
    }
    
    // Return a getter function to ensure we always have the latest value
    const getPixel = () => studio.state[state];
    
    const setPixel = (valueOrUpdater) => {
        if (typeof valueOrUpdater === 'function') {
            const prev = studio.state[state];
            const next = valueOrUpdater(prev);
            dict[state] = next
            studio.setState(dict);
        } else {
            dict[state] = valueOrUpdater
            studio.setState(dict);
        }
    };
    return [getPixel, setPixel];
};

export { 
    studio, 
    navigate, 
    usePixel, 
    useStore, 
    injectCSS, 
    style,
    // Error handling exports
    errorRegistry,
    StudioError,
    ERROR_CODES,
    validate,
    // Middleware exports
    middlewareManager,
    pluginSystem,
    HOOK_TYPES,
    builtinMiddleware,
    // Signals & Reactivity
    createSignal,
    createComputed,
    createState,
    createEffect,
    signalContext,
    // Template System
    html,
    css,
    fragment,
    templateUtils,
    // Lifecycle Hooks
    usePixelEffect,
    useLayoutEffect,
    useMemo,
    useCallback,
    useReducer,
    useRef,
    cleanupHooks,
    // Styling System
    createScopedStyles,
    useStyles,
    createStyleModule,
    createTheme,
    createKeyframes,
    // VNode Components
    Fragment
}
