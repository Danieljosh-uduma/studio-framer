/**
 * Lifecycle Hooks for Studio Framer
 * Provides useEffect, useLayoutEffect, useCallback, useMemo patterns
 */

import { createEffect, createMemo } from './signals.js';

let currentComponent = null;
let hookIndex = 0;

/**
 * Set current component context for hooks
 * @private
 */
export function setCurrentComponent(component) {
  currentComponent = component;
  hookIndex = 0;
}

/**
 * Get next hook index and validate
 * @private
 */
function getHookIndex() {
  if (!currentComponent) {
    throw new Error('Hooks can only be called during component render');
  }
  return hookIndex++;
}

/**
 * Initialize hooks storage for component
 * @private
 */
function initHooksStorage() {
  if (!currentComponent._hooks) {
    currentComponent._hooks = [];
  }
  return currentComponent._hooks;
}

/**
 * Effect hook - runs after render
 * @param {() => void | (() => void)} effectFn - Effect function that can return cleanup
 * @param {Array<any>} [dependencies] - Dependency array
 */
export function usePixelEffect(effectFn, dependencies = []) {
  const index = getHookIndex();
  const hooks = initHooksStorage();

  if (!hooks[index]) {
    hooks[index] = {
      type: 'effect',
      cleanup: null,
      lastDeps: []
    };
  }

  const hook = hooks[index];
  const hasChanged = !hook.lastDeps.length ||
    hook.lastDeps.length !== dependencies.length ||
    hook.lastDeps.some((dep, i) => !Object.is(dep, dependencies[i]));

  if (hasChanged) {
    // Clear previous cleanup
    if (hook.cleanup) hook.cleanup();
    
    // Run new effect
    const result = effectFn();
    hook.cleanup = typeof result === 'function' ? result : null;
    hook.lastDeps = dependencies;
  }
}

/**
 * Layout effect hook - runs synchronously after DOM mutations
 * @param {() => void | (() => void)} effectFn - Effect function
 * @param {Array<any>} [dependencies] - Dependency array
 */
export function useLayoutEffect(effectFn, dependencies = []) {
  const index = getHookIndex();
  const hooks = initHooksStorage();

  if (!hooks[index]) {
    hooks[index] = {
      type: 'layoutEffect',
      cleanup: null,
      lastDeps: []
    };
  }

  const hook = hooks[index];
  const hasChanged = !hook.lastDeps.length ||
    hook.lastDeps.length !== dependencies.length ||
    hook.lastDeps.some((dep, i) => !Object.is(dep, dependencies[i]));

  if (hasChanged) {
    if (hook.cleanup) hook.cleanup();
    const result = effectFn();
    hook.cleanup = typeof result === 'function' ? result : null;
    hook.lastDeps = dependencies;
  }
}

/**
 * Memoization hook - caches value based on dependencies
 * @template T
 * @param {() => T} computeFn - Function that computes value
 * @param {Array<any>} [dependencies] - Dependency array
 * @returns {T} Memoized value
 */
export function useMemo(computeFn, dependencies = []) {
  const index = getHookIndex();
  const hooks = initHooksStorage();

  if (!hooks[index]) {
    hooks[index] = {
      type: 'memo',
      value: null,
      lastDeps: []
    };
  }

  const hook = hooks[index];
  const hasChanged = !hook.lastDeps.length ||
    hook.lastDeps.length !== dependencies.length ||
    hook.lastDeps.some((dep, i) => !Object.is(dep, dependencies[i]));

  if (hasChanged) {
    hook.value = computeFn();
    hook.lastDeps = dependencies;
  }

  return hook.value;
}

/**
 * Callback hook - memoizes function
 * @template T
 * @param {T} callback - Function to memoize
 * @param {Array<any>} [dependencies] - Dependency array
 * @returns {T} Memoized callback
 */
export function useCallback(callback, dependencies = []) {
  const index = getHookIndex();
  const hooks = initHooksStorage();

  if (!hooks[index]) {
    hooks[index] = {
      type: 'callback',
      callback: null,
      lastDeps: []
    };
  }

  const hook = hooks[index];
  const hasChanged = !hook.lastDeps.length ||
    hook.lastDeps.length !== dependencies.length ||
    hook.lastDeps.some((dep, i) => !Object.is(dep, dependencies[i]));

  if (hasChanged) {
    hook.callback = callback;
    hook.lastDeps = dependencies;
  }

  return hook.callback;
}

/**
 * Reducer hook - complex state management
 * @template S, A
 * @param {(state: S, action: A) => S} reducer - Reducer function
 * @param {S} initialState - Initial state
 * @returns {[S, (action: A) => void]} Current state and dispatch
 */
export function useReducer(reducer, initialState) {
  const index = getHookIndex();
  const hooks = initHooksStorage();

  if (!hooks[index]) {
    hooks[index] = {
      type: 'reducer',
      state: initialState
    };
  }

  const hook = hooks[index];
  const dispatch = (action) => {
    hook.state = reducer(hook.state, action);
    if (currentComponent && currentComponent.render) {
      currentComponent.render();
    }
  };

  return [hook.state, dispatch];
}

/**
 * Ref hook - persistent mutable container
 * @template T
 * @param {T} initialValue - Initial value
 * @returns {{ current: T }} Ref object
 */
export function useRef(initialValue) {
  const index = getHookIndex();
  const hooks = initHooksStorage();

  if (!hooks[index]) {
    hooks[index] = {
      type: 'ref',
      current: initialValue
    };
  }

  return hooks[index];
}

/**
 * Context hook - access context value
 * @template T
 * @returns {T} Context value
 */
export function useContext(context) {
  if (!context || !context._provider) {
    throw new Error('useContext must be used within context provider');
  }
  return context._provider.value;
}

/**
 * Cleanup all hooks for component
 * @param {Object} component
 */
export function cleanupHooks(component) {
  if (component._hooks) {
    component._hooks.forEach(hook => {
      if (hook.cleanup) {
        hook.cleanup();
      }
    });
    component._hooks = [];
  }
}

/**
 * Lifecycle constants
 */
export const LifecyclePhase = {
  BEFORE_RENDER: 'beforeRender',
  AFTER_RENDER: 'afterRender',
  BEFORE_UPDATE: 'beforeUpdate',
  AFTER_UPDATE: 'afterUpdate',
  BEFORE_UNMOUNT: 'beforeUnmount',
  ERROR: 'error'
};

/**
 * Component lifecycle manager
 */
export const lifecycleManager = {
  phases: new Map(),

  register(component, phase, callback) {
    if (!this.phases.has(phase)) {
      this.phases.set(phase, new Set());
    }
    this.phases.get(phase).add({ component, callback });
  },

  trigger(phase, component, data) {
    if (this.phases.has(phase)) {
      this.phases.get(phase).forEach(({ component: c, callback }) => {
        if (c === component) {
          callback(data);
        }
      });
    }
  },

  unregisterComponent(component) {
    this.phases.forEach(set => {
      for (let item of set) {
        if (item.component === component) {
          set.delete(item);
        }
      }
    });
  }
};

export default {
  usePixelEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  useReducer,
  useRef,
  useContext,
  LifecyclePhase,
  lifecycleManager
};
