# Studio Framer - 6 Framework Improvements

This document outlines the 6 major framework improvements that have been implemented to enhance Studio Framer's capabilities, developer experience, and code quality.

## Overview

All improvements are **100% backwards compatible**. Existing code continues to work without any changes. New features are opt-in and gradually adoptable.

---

## 1. Signals-Based Reactivity System

**File**: `_studio-frame/signals.js`

A fine-grained reactive state management system inspired by SolidJS and Preact Signals.

### Key Features
- **createSignal(initialValue)** - Create reactive state with automatic subscriptions
- **createComputed(computeFn)** - Derived signals that auto-update on dependencies
- **createState(initialValue)** - Batch state updates for objects
- **createEffect(effectFn, deps)** - Track dependencies and run side effects
- **createCombined(signals, combiner)** - Merge multiple signals into one

### Example
```javascript
import { createSignal, createEffect } from 'studio-framer';

// Create reactive signals
const [count, setCount] = createSignal(0);
const [doubled, setDoubled] = createComputed(() => count() * 2);

// Auto-run on changes
createEffect(() => {
  console.log(`Count is now ${count()}, doubled: ${doubled()}`);
});

setCount(5); // Logs: Count is now 5, doubled: 10
```

### Benefits
- **Performance** - Only rerenders what actually changed
- **Memory efficient** - Automatic cleanup of subscriptions
- **Predictable** - Explicit dependency tracking
- **Fine-grained** - Update single values without full component rerenders

---

## 2. Template System with html`` Tagged Templates

**File**: `_studio-frame/template.js`

Direct VNode templating without DOMParser overhead.

### Key Features
- **html``** - Create VNodes directly from template strings
- **css``** - Scoped styling with automatic class generation
- **fragment``** - Multi-root component support
- **templateUtils** - Helper functions for common template patterns

### Example
```javascript
import { html, css } from 'studio-framer';

const MyComponent = ({ title, count }) => {
  const styles = css`
    .button {
      padding: 8px 16px;
      background: blue;
      color: white;
    }
  `;

  return html`
    <div class="${styles.className}">
      <h1>${title}</h1>
      <button class="${styles.button}">
        Click me (${count} clicks)
      </button>
    </div>
  `;
};
```

### Benefits
- **No parsing overhead** - Direct VNode creation
- **Type-safe** - Full TypeScript support
- **Scoped styles** - Automatic class name generation prevents conflicts
- **Cleaner syntax** - More readable than h() calls

---

## 3. Automatic Event Binding via Directives

**File**: Support integrated in vdom.js and template.js

Event handlers are automatically bound to elements with `@event` syntax.

### Example
```javascript
import { html } from 'studio-framer';

const Button = () => {
  const handleClick = (e) => console.log('Clicked!');
  
  return html`
    <button @click="${handleClick}">
      Click me
    </button>
  `;
};
```

### Benefits
- **Cleaner syntax** - More intuitive than onEvent props
- **Auto-binding** - No need to manually attach listeners
- **Better performance** - Leverages event delegation

---

## 4. Scoped Styling with Unique Class Names

**File**: `_studio-frame/styling.js`

Component-scoped CSS that prevents naming conflicts and style leaks.

### Key Features
- **createScopedStyles(name, styles)** - Generate unique class names
- **useStyles(styles, name)** - Style hook for components
- **createTheme(theme)** - CSS variable theming
- **createKeyframes(name, frames)** - Animation definitions
- **createStyleModule(name, styles)** - CSS module-like objects

### Example
```javascript
import { createScopedStyles } from 'studio-framer';

const MyComponent = () => {
  const styles = createScopedStyles('MyComponent', {
    container: {
      padding: '16px',
      backgroundColor: 'white'
    },
    title: {
      fontSize: '24px',
      color: 'black'
    }
  });

  return html`
    <div class="${styles.container}">
      <h1 class="${styles.title}">Hello</h1>
    </div>
  `;
};
```

### Benefits
- **No conflicts** - Unique class names per component
- **Maintainable** - Styles co-located with components
- **Theme support** - CSS variables for easy customization
- **Type-safe** - Full TypeScript support for style objects

---

## 5. Fragment Support for Multi-Root Components

**File**: `_studio-frame/vdom.js`

Return multiple root elements without wrapping in a container.

### Key Features
- **Fragment component** - Return arrays of VNodes
- **fragment`` template tag** - Multi-root template strings

### Example
```javascript
import { Fragment, html, fragment } from 'studio-framer';

// Using h() API
const Header = () => ({
  canvas: () => h(Fragment, {}, 
    h('header', {}, 'Header'),
    h('nav', {}, 'Navigation')
  )
});

// Using html`` template
const Header = () => fragment`
  <header>Header</header>
  <nav>Navigation</nav>
`;
```

### Benefits
- **Cleaner DOM** - No unnecessary wrapper divs
- **Better semantics** - Proper HTML structure
- **Flexible composition** - Multiple roots in one component

---

## 6. Lifecycle Hooks with Async Effect Handling

**File**: `_studio-frame/lifecycle.js`

Comprehensive lifecycle hooks similar to React Hooks.

### Key Features
- **usePixelEffect(effectFn, deps)** - Run effects after render
- **useLayoutEffect(effectFn, deps)** - Run effects synchronously
- **useMemo(computeFn, deps)** - Memoize expensive computations
- **useCallback(callback, deps)** - Memoize function references
- **useReducer(reducer, init)** - Complex state management
- **useRef(initialValue)** - Persistent mutable references

### Example
```javascript
import { usePixelEffect, useMemo, useCallback } from 'studio-framer';

const MyComponent = ({ items }) => {
  const [count, setCount] = createSignal(0);

  // Run effect with dependencies
  usePixelEffect(() => {
    console.log(`Component mounted with ${items.length} items`);
    
    // Cleanup function
    return () => {
      console.log('Component unmounting');
    };
  }, [items]);

  // Memoize expensive computation
  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price, 0);
  }, [items]);

  // Memoize callback
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  return html`
    <div>
      <p>Total: ${total}</p>
      <button @click="${handleClick}">Increment</button>
    </div>
  `;
};
```

### Benefits
- **Predictable** - Explicit dependency tracking
- **Performant** - Automatic cleanup and memoization
- **Familiar API** - React Hooks-like patterns
- **Async support** - Proper handling of async effects

---

## Complete Integration Example

Here's how all 6 improvements work together:

```javascript
import {
  createSignal,
  createEffect,
  html,
  css,
  usePixelEffect,
  useMemo,
  useCallback,
  createScopedStyles,
  Fragment
} from 'studio-framer';

const TodoApp = () => {
  // 1. Signals-based state
  const [todos, setTodos] = createSignal([]);
  const [input, setInput] = createSignal('');

  // 6. Lifecycle hook
  usePixelEffect(() => {
    console.log('App initialized');
    // Cleanup
    return () => console.log('App destroyed');
  }, []);

  // 4. Scoped styles
  const styles = createScopedStyles('TodoApp', {
    container: { padding: '20px' },
    input: { padding: '8px', fontSize: '16px' },
    button: { padding: '8px 16px', backgroundColor: 'blue', color: 'white' },
    list: { marginTop: '20px' }
  });

  // 2. Computed signal + 6. useMemo
  const remaining = useMemo(() => {
    return todos().filter(t => !t.done).length;
  }, [todos]);

  // 6. useCallback for memoized handlers
  const addTodo = useCallback(() => {
    const text = input();
    if (text.trim()) {
      setTodos([...todos(), { id: Date.now(), text, done: false }]);
      setInput('');
    }
  }, [input, todos]);

  // 3. Template system with event binding
  const todoItems = html`
    <ul class="${styles.list}">
      ${todos().map(todo => html`
        <li key="${todo.id}">${todo.text}</li>
      `)}
    </ul>
  `;

  // 5. Fragment for multi-root
  return fragment`
    <div class="${styles.container}">
      <h1>Todo App</h1>
      <p>${remaining()} items remaining</p>
      
      <input 
        type="text" 
        class="${styles.input}"
        @input="${(e) => setInput(e.target.value)}"
        value="${input()}"
      />
      
      <button class="${styles.button}" @click="${addTodo}">
        Add Todo
      </button>
      
      ${todoItems}
    </div>
  `;
};
```

---

## Migration Guide

### From usePixel to Signals
```javascript
// Old way (still works)
const [value, setValue] = usePixel('myState', 0);

// New way (recommended)
const [value, setValue] = createSignal(0);
```

### From style() to createScopedStyles
```javascript
// Old way
style('.myClass', { color: 'red' });

// New way
const styles = createScopedStyles('MyComponent', {
  myClass: { color: 'red' }
});
```

### From h() to html``
```javascript
// Old way
h('button', { onClick: handleClick }, 'Click me')

// New way
html`
  <button @click="${handleClick}">
    Click me
  </button>
`
```

---

## Performance Improvements

The 6 improvements provide significant performance enhancements:

1. **Signals** - Fine-grained reactivity reduces unnecessary rerenders
2. **Templates** - No DOMParser overhead, direct VNode creation
3. **Event binding** - Auto-delegation reduces memory usage
4. **Scoped styles** - Better CSS organization and smaller payloads
5. **Fragments** - Cleaner DOM structure
6. **Lifecycle hooks** - Proper cleanup and memoization

---

## TypeScript Support

All new features have full TypeScript type definitions:

```typescript
const [count, setCount] = createSignal<number>(0);
const doubled = createComputed<number>(() => count() * 2);
const [state, dispatch] = useReducer<State, Action>(reducer, initialState);
```

---

## Backwards Compatibility

**All existing code continues to work unchanged:**

- `usePixel()` still works alongside `createSignal()`
- `h()` still works alongside `html``
- Old `style()` API coexists with `createScopedStyles()`
- All middleware, error handling, and plugins unchanged

You can adopt new features gradually in your projects.

---

## Next Steps

1. Review the individual API documentation in `_studio-frame/`
2. Check `TYPESCRIPT_GUIDE.md` for type information
3. Explore example usage in `_studio-frame/examples.js`
4. Start migrating components to use the new APIs

All improvements are production-ready and fully tested.
