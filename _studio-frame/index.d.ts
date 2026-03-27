/**
 * Studio Framer - Complete Type Definitions
 * Main export point for all framework types and APIs
 */

// Re-export all types from types.d.ts
export type {
  VNode,
  VNodeProps,
  Frame,
  Action,
  StateObject,
  RouteConfig,
  StudioConfig,
  StyleObject,
  ErrorMetadata,
  ErrorMessage,
  ErrorStats,
  MiddlewareContext,
  Middleware,
  MiddlewareManager,
  PluginSystem,
  Plugin,
  BuiltinMiddleware,
  ValidationUtils,
  ErrorRegistry,
  ComponentFunction,
  EventHandler,
  StateUpdater,
  LifecycleCallback,
  RouteMatcher,
} from './types.d.ts';

export {
  ERROR_CODES,
  HOOK_TYPES,
  StudioError,
  studio,
  navigate,
  usePixel,
  useStore,
  injectCSS,
  style,
  rstyle,
  h,
  mount,
  patch,
  htmlToVNode,
  errorRegistry,
  validate,
  middlewareManager,
  pluginSystem,
  builtinMiddleware,
} from '../_studio-frame/types.d.ts';

// Re-export for backwards compatibility
export namespace Studio {
  /**
   * Virtual DOM Node
   */
  export type VNode = import('./types.d.ts').VNode;

  /**
   * Component Function
   */
  export type Component<P = any> = import('./types.d.ts').ComponentFunction<P>;

  /**
   * Action definition for components
   */
  export type Action = import('./types.d.ts').Action;

  /**
   * Standard return object for Studio components
   */
  export type Frame = import('./types.d.ts').Frame;

  /**
   * Framework Configuration
   */
  export type Config = import('./types.d.ts').StudioConfig;
}

/**
 * Main Studio Instance class
 */
export type StudioInstance = import('./types.d.ts').Studio;

/**
 * Global Studio instance
 */
export const studio: import('./types.d.ts').Studio;

// JSX namespace for type-safe JSX
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    interface Element extends import('./types.d.ts').VNode {}
  }
}
