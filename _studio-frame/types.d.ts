/**
 * Studio Framer - TypeScript Type Definitions
 * Comprehensive type definitions for IDE support and type safety
 */

// ============================================================================
// VIRTUAL DOM TYPES
// ============================================================================

/**
 * Virtual DOM Node representation
 */
export interface VNode {
  /** Element type: HTML tag name or 'TEXT_ELEMENT' for text nodes */
  type: string;
  /** Element properties: attributes, event handlers, and children */
  props: VNodeProps;
  /** Reference to DOM element (set during mount/patch) */
  dom?: Node;
}

/**
 * Virtual DOM Node properties
 */
export interface VNodeProps {
  /** Child elements */
  children: Array<VNode | string>;
  /** Text node value */
  nodeValue?: string;
  /** Class names */
  className?: string;
  /** Inline styles */
  style?: Record<string, string | number>;
  /** Element attributes */
  [key: string]: any;
}

/**
 * JSX element creation function
 * @param type - HTML tag name or component function
 * @param props - Element properties and attributes
 * @param children - Child elements
 * @returns Virtual DOM node
 */
export function h(
  type: string | Function,
  props?: Record<string, any> | null,
  ...children: any[]
): VNode;

/**
 * Mount virtual DOM tree to container
 * @param vnode - Virtual node to mount
 * @param container - DOM element container
 */
export function mount(vnode: VNode, container: Element): void;

/**
 * Update virtual DOM tree (patch)
 * @param container - DOM container
 * @param oldVNode - Previous virtual node
 * @param newVNode - New virtual node
 */
export function patch(container: Element, oldVNode: VNode, newVNode: VNode): void;

/**
 * Convert HTML string to Virtual DOM node
 * @param htmlString - HTML string to parse
 * @returns Virtual node representation
 */
export function htmlToVNode(htmlString: string): VNode;

// ============================================================================
// ERROR HANDLING TYPES
// ============================================================================

/**
 * Error code enumeration
 */
export enum ERROR_CODES {
  // Rendering errors (1000-1099)
  RENDER_NO_BASE = 1000,
  RENDER_NO_FRAME = 1001,
  RENDER_INVALID_VDOM = 1002,
  RENDER_CANVAS_FAILED = 1003,

  // Navigation errors (1100-1199)
  NAVIGATION_ROUTE_NOT_FOUND = 1100,
  NAVIGATION_INVALID_TEMPLATE = 1101,
  NAVIGATION_MISSING_CONFIG = 1102,
  NAVIGATION_ROUTE_UNDEFINED = 1103,

  // State management errors (1200-1299)
  STATE_INVALID_VALUE = 1200,
  STATE_CIRCULAR_REFERENCE = 1201,
  STATE_UPDATE_FAILED = 1202,

  // Component errors (1300-1399)
  COMPONENT_INVALID_PROPS = 1300,
  COMPONENT_CHILDREN_REQUIRED = 1301,
  COMPONENT_RENDER_FAILED = 1302,

  // Virtual DOM errors (1400-1499)
  VDOM_INVALID_TYPE = 1400,
  VDOM_MOUNT_FAILED = 1401,
  VDOM_PATCH_FAILED = 1402,
  VDOM_HTML_PARSE_ERROR = 1403,

  // CSS errors (1500-1599)
  CSS_INVALID_SELECTOR = 1500,
  CSS_PARSE_ERROR = 1501,
  CSS_INJECTION_FAILED = 1502,

  // Action errors (1600-1699)
  ACTION_ERROR = 1600,
}

/**
 * Error severity level
 */
export type ErrorSeverity = 'ERROR' | 'WARNING' | 'INFO';

/**
 * Error metadata
 */
export interface ErrorMetadata {
  [key: string]: any;
}

/**
 * Error message with context
 */
export interface ErrorMessage {
  message: string;
  hint: string;
  severity: ErrorSeverity;
}

/**
 * Studio Error class
 */
export class StudioError extends Error {
  code: ERROR_CODES;
  severity: ErrorSeverity;
  context: ErrorMetadata;
  timestamp: Date;

  constructor(
    code: ERROR_CODES,
    message?: string,
    context?: ErrorMetadata
  );

  toJSON(): object;
}

/**
 * Error registry for tracking errors
 */
export interface ErrorRegistry {
  /** Record an error */
  record(error: StudioError): void;
  /** Get all recorded errors */
  getErrors(): StudioError[];
  /** Clear error history */
  clear(): void;
  /** Subscribe to errors */
  subscribe(callback: (error: StudioError) => void): () => void;
  /** Enable/disable recording */
  setEnabled(enabled: boolean): void;
  /** Get error statistics */
  getStats(): ErrorStats;
}

/**
 * Error statistics
 */
export interface ErrorStats {
  total: number;
  byCode: Record<ERROR_CODES, number>;
  bySeverity: Record<ErrorSeverity, number>;
}

/**
 * Validation utilities
 */
export interface ValidationUtils {
  isValidVNode(node: any): boolean;
  isValidSelector(selector: string): boolean;
  hasCircularReference(obj: any): boolean;
  isValidTemplate(template: any): boolean;
}

export const validate: ValidationUtils;
export const errorRegistry: ErrorRegistry;

// ============================================================================
// MIDDLEWARE TYPES
// ============================================================================

/**
 * Middleware hook types
 */
export enum HOOK_TYPES {
  BEFORE_INIT = 'beforeInit',
  AFTER_INIT = 'afterInit',
  BEFORE_SET_CONFIG = 'beforeSetConfig',
  AFTER_SET_CONFIG = 'afterSetConfig',
  BEFORE_RENDER = 'beforeRender',
  AFTER_RENDER = 'afterRender',
  RENDER_ERROR = 'renderError',
  BEFORE_NAVIGATE = 'beforeNavigate',
  AFTER_NAVIGATE = 'afterNavigate',
  NAVIGATE_ERROR = 'navigateError',
  BEFORE_STATE_CHANGE = 'beforeStateChange',
  AFTER_STATE_CHANGE = 'afterStateChange',
  STATE_ERROR = 'stateError',
  BEFORE_PATCH = 'beforePatch',
  AFTER_PATCH = 'afterPatch',
  PATCH_ERROR = 'patchError',
  BEFORE_ACTION = 'beforeAction',
  AFTER_ACTION = 'afterAction',
  ACTION_ERROR = 'actionError',
}

/**
 * Middleware context object
 */
export interface MiddlewareContext {
  data: Record<string, any>;
  isCancelled(): boolean;
  cancel(): void;
  modify(newData: Record<string, any>): void;
}

/**
 * Middleware priority level
 */
export type MiddlewarePriority = 'high' | 'normal' | 'low';

/**
 * Middleware hook handler
 */
export type MiddlewareHandler = (
  context: MiddlewareContext
) => void | Promise<void>;

/**
 * Middleware definition
 */
export interface Middleware {
  name: string;
  hook: HOOK_TYPES;
  handler: MiddlewareHandler;
  priority?: MiddlewarePriority;
  enabled?: boolean;
}

/**
 * Middleware manager interface
 */
export interface MiddlewareManager {
  /** Register middleware */
  use(middleware: Middleware): void;
  /** Unregister middleware */
  unuse(name: string): void;
  /** Execute all middleware for a hook */
  execute(hook: HOOK_TYPES, data: Record<string, any>): Promise<MiddlewareContext>;
  /** Set error handler */
  onError(callback: (error: Error, hook: HOOK_TYPES, context: MiddlewareContext) => void): void;
  /** Get registered middleware */
  getMiddleware(hook?: HOOK_TYPES): Middleware[];
}

/**
 * Plugin system interface
 */
export interface PluginSystem {
  /** Install a plugin */
  install(plugin: Plugin): void;
  /** Uninstall a plugin */
  uninstall(name: string): void;
  /** Get installed plugins */
  getPlugins(): Plugin[];
}

/**
 * Plugin definition
 */
export interface Plugin {
  name: string;
  version: string;
  description?: string;
  install(studio: Studio): void;
  uninstall?(): void;
}

/**
 * Built-in middleware helpers
 */
export interface BuiltinMiddleware {
  logger: Middleware;
  performance: Middleware;
  rateLimit: Middleware;
  validator: Middleware;
  analytics: Middleware;
}

export const middlewareManager: MiddlewareManager;
export const pluginSystem: PluginSystem;
export const builtinMiddleware: BuiltinMiddleware;

// ============================================================================
// CSS TYPES
// ============================================================================

/**
 * Style object
 */
export type StyleObject = Record<string, string | number>;

/**
 * CSS style function
 * @param selector - CSS selector
 * @param styleObject - Style properties
 */
export function style(selector: string, styleObject: StyleObject | string): void;

/**
 * Return CSS string without injection
 * @param selector - CSS selector
 * @param styleObject - Style properties
 * @returns CSS string
 */
export function rstyle(selector: string, styleObject: StyleObject | string): string;

/**
 * Inject CSS string into document
 * @param cssText - CSS text to inject
 */
export function injectCSS(cssText: string): void;

// ============================================================================
// FRAMEWORK TYPES
// ============================================================================

/**
 * Frame component
 */
export interface Frame {
  canvas: string | VNode;
  action?: Action | Action[];
  style?: StyleObject | string;
  state?: StateObject;
}

/**
 * Event action
 */
export interface Action {
  id: string;
  type: string;
  func: (event?: any) => void | Promise<void>;
}

/**
 * State object
 */
export type StateObject = Record<string, any>;

/**
 * Routing configuration
 */
export interface RouteConfig {
  [path: string]: (props?: any) => Frame;
}

/**
 * Studio configuration
 */
export interface StudioConfig {
  tailwind?: boolean;
  routes?: RouteConfig;
  [key: string]: any;
}

/**
 * Main Studio class
 */
export class Studio {
  base: HTMLElement | null;
  oldVDom: VNode | null;
  state: StateObject;
  style: StyleObject;
  actions: Record<string, Action>;
  config: StudioConfig;
  currentFrame?: string | VNode;
  middlewareManager: MiddlewareManager;
  errorRegistry: ErrorRegistry;

  constructor(base?: Document | null);

  /**
   * Set configuration
   */
  setConfig(config: StudioConfig): Promise<void>;

  /**
   * Update state
   */
  setState(newState: Partial<StateObject>): Promise<void>;

  /**
   * Render current frame
   */
  render(): Promise<void>;

  /**
   * Navigate to a route or frame
   */
  navigate(
    template: string | Function | Frame,
    props?: any,
    pushState?: boolean
  ): Promise<void>;

  /**
   * Add event handler
   */
  addEvent(
    id: string,
    config: { func: Function; type: string }
  ): Promise<void>;

  /**
   * Add style
   */
  addStyle(styleText: string): void;

  /**
   * Get canvas HTML
   */
  getCanvas(): Promise<string | null>;

  /**
   * Update styles
   */
  updateStyles(): void;

  /**
   * Inject Tailwind CSS
   */
  injectTailwind(): void;

  /**
   * Initialize router
   */
  initRouter(): void;

  /**
   * Handle route changes
   */
  handleRoute(pathname: string): void;

  /**
   * Inject actions into VNode
   */
  injectActions(vnode: VNode): void;
}

/**
 * Create or get studio instance
 */
export const studio: Studio;

/**
 * Navigate function
 * @param template - Route path or component function
 * @param props - Navigation props
 * @param pushState - Whether to update browser history
 */
export function navigate(
  template: string | Function | Frame,
  props?: any,
  pushState?: boolean
): Promise<void>;

/**
 * Use pixel values from design
 * @param value - Pixel value
 * @returns Converted value
 */
export function usePixel(value: number): number;

/**
 * Use store/state hook
 * @param key - State key
 * @returns State value and setter
 */
export function useStore(key: string): [any, (value: any) => void];

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Component function
 */
export type ComponentFunction<P = any> = (props: P) => Frame;

/**
 * Event handler
 */
export type EventHandler = (event: Event) => void | Promise<void>;

/**
 * State updater
 */
export type StateUpdater<T> = (state: T) => T;

/**
 * Lifecycle callback
 */
export type LifecycleCallback = () => void | Promise<void>;

/**
 * Route matcher
 */
export interface RouteMatcher {
  pattern: string | RegExp;
  handler: ComponentFunction;
}

// ============================================================================
// GLOBAL TYPES
// ============================================================================

declare global {
  /**
   * JSX namespace for type-safe JSX
   */
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element extends VNode {}
  }
}

export {};
