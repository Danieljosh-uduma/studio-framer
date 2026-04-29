/**
 * Signals-based Reactivity System for Studio Framer
 * Provides fine-grained reactive state management
 */

let currentEffect = null;
const effectDependencies = new WeakMap();

/**
 * Creates a reactive signal with getter and setter
 * @template T
 * @param {T} initialValue - Initial value
 * @returns {[() => T, (newValue: T | ((prev: T) => T)) => void]} [getter, setter]
 */
export function createSignal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();
  const computedDependents = new Set();

  /**
   * Getter function
   * @returns {T}
   */
  const getter = () => {
    if (currentEffect) {
      subscribers.add(currentEffect);
    }
    return value;
  };

  /**
   * Setter function with optional updater callback
   * @param {T | ((prev: T) => T)} newValue
   */
  const setter = (newValue) => {
    const nextValue = typeof newValue === 'function' ? newValue(value) : newValue;
    
    if (!Object.is(nextValue, value)) {
      value = nextValue;
      
      // Notify all subscribers
      subscribers.forEach(effect => {
        effect.run();
      });

      // Notify computed dependents
      computedDependents.forEach(computed => {
        computed.invalidate();
      });
    }
  };

  getter.subscribe = (effect) => subscribers.add(effect);
  getter.unsubscribe = (effect) => subscribers.delete(effect);
  getter.addDependent = (computed) => computedDependents.add(computed);
  getter.removeDependent = (computed) => computedDependents.delete(computed);

  return [getter, setter];
}

/**
 * Creates a computed (derived) signal
 * @template T
 * @param {() => T} computeFn - Function that computes the value
 * @returns {() => T} getter function
 */
export function createComputed(computeFn) {
  let cachedValue;
  let isDirty = true;
  const dependencies = new Set();

  const getter = () => {
    if (isDirty) {
      currentEffect = { dependencies, invalidate: () => { isDirty = true; } };
      cachedValue = computeFn();
      currentEffect = null;
    }
    return cachedValue;
  };

  getter.invalidate = () => {
    isDirty = true;
  };

  return getter;
}

/**
 * Creates a signal that batches multiple updates
 * @template T
 * @param {T} initialValue
 * @returns {[() => T, (updates: Partial<T>) => void]}
 */
export function createState(initialValue) {
  const [getValue, setValue] = createSignal(initialValue);
  
  const setStateUpdater = (updates) => {
    setValue(prev => ({
      ...prev,
      ...updates
    }));
  };

  return [getValue, setStateUpdater];
}

/**
 * Runs a function with automatic dependency tracking
 * @param {() => void} effectFn - Effect function
 * @param {Array<any>} [dependencies] - Optional dependency array
 */
export function createEffect(effectFn, dependencies = null) {
  let cleanup;
  let lastDeps = [];

  const run = () => {
    if (cleanup) cleanup();
    currentEffect = { run, dependencies: new Set() };
    cleanup = effectFn();
    currentEffect = null;
  };

  // For manual dependency tracking
  if (dependencies === null) {
    run();
  } else {
    const hasChanged = !lastDeps.length || 
      lastDeps.length !== dependencies.length ||
      lastDeps.some((dep, i) => !Object.is(dep, dependencies[i]));
    
    if (hasChanged) {
      lastDeps = dependencies;
      run();
    }
  }

  return () => {
    if (cleanup) cleanup();
  };
}

/**
 * Merges multiple signals into one
 * @param {...Function} signals
 * @returns {() => Array}
 */
export function createMemo(computeFn, dependencies = []) {
  return createEffect(() => {
    return computeFn();
  }, dependencies);
}

/**
 * Global context for signal subscriptions
 */
export const signalContext = {
  signals: new Map(),
  effects: new Set(),
  
  subscribe(key, effect) {
    if (!this.signals.has(key)) {
      this.signals.set(key, new Set());
    }
    this.signals.get(key).add(effect);
  },
  
  unsubscribe(key, effect) {
    if (this.signals.has(key)) {
      this.signals.get(key).delete(effect);
    }
  },
  
  notify(key) {
    if (this.signals.has(key)) {
      this.signals.get(key).forEach(effect => effect());
    }
  },
  
  registerEffect(effect) {
    this.effects.add(effect);
  },
  
  unregisterEffect(effect) {
    this.effects.delete(effect);
  },
  
  clear() {
    this.signals.clear();
    this.effects.clear();
  }
};

/**
 * Combines multiple signals into a single value
 * @param {Array<() => any>} signals
 * @param {Function} combiner
 * @returns {() => any}
 */
export function createCombined(signals, combiner) {
  return createComputed(() => {
    const values = signals.map(sig => sig());
    return combiner(...values);
  });
}

export default {
  createSignal,
  createComputed,
  createState,
  createEffect,
  createMemo,
  createCombined,
  signalContext
};
