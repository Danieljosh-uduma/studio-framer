# Framework Improvements - Quick Start Guide

6 major framework improvements have been implemented. This guide helps you get started.

## What's New?

### 1. Signals: Fine-Grained Reactivity
```javascript
import { createSignal, createComputed } from 'studio-framer';

const [count, setCount] = createSignal(0);
const doubled = createComputed(() => count() * 2);

console.log(doubled()); // Auto-updates when count changes
```

### 2. HTML Templates: No More DOMParser
```javascript
import { html } from 'studio-framer';

const component = html`
  <div>
    <h1>Hello ${name}</h1>
    <button @click="${handleClick}">Click</button>
  </div>
`;
```

### 3. Auto Event Binding
```javascript
// Use @event syntax in templates
html`<button @click="${handler}">Click me</button>`
```

### 4. Scoped Styling: No CSS Conflicts
```javascript
import { createScopedStyles } from 'studio-framer';

const styles = createScopedStyles('MyComp', {
  title: { fontSize: '24px', color: 'blue' }
});

html`<h1 class="${styles.title}">Title</h1>`
```

### 5. Fragments: Multi-Root Components
```javascript
import { fragment } from 'studio-framer';

const MultiRoot = () => fragment`
  <header>Header</header>
  <main>Content</main>
  <footer>Footer</footer>
`;
```

### 6. Lifecycle Hooks: React-like Effects
```javascript
import { usePixelEffect, useMemo, useCallback } from 'studio-framer';

usePixelEffect(() => {
  console.log('Component mounted');
  return () => console.log('Cleanup');
}, []);

const expensive = useMemo(() => compute(), [deps]);
const memoized = useCallback(() => fn(), [deps]);
```

## Migration Path

### Option 1: Gradual Adoption
Keep using existing APIs. New features are optional.

### Option 2: Full Migration
Replace old APIs with new ones:

| Old | New |
|-----|-----|
| `usePixel()` | `createSignal()` |
| `h()` | `html`` |
| `style()` | `createScopedStyles()` |
| No fragments | `fragment`` |
| No lifecycle | `usePixelEffect()` |

## Complete Example

```javascript
import {
  createSignal,
  createComputed,
  html,
  createScopedStyles,
  usePixelEffect,
  useMemo,
  createKeyframes
} from 'studio-framer';

const CounterApp = () => {
  // Signals for state
  const [count, setCount] = createSignal(0);
  const doubled = createComputed(() => count() * 2);

  // Scoped styles
  const styles = createScopedStyles('Counter', {
    container: {
      padding: '20px',
      textAlign: 'center'
    },
    button: {
      padding: '10px 20px',
      fontSize: '16px',
      backgroundColor: '#0066cc',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      borderRadius: '4px'
    },
    display: {
      fontSize: '32px',
      margin: '20px 0'
    }
  });

  // Lifecycle hook
  usePixelEffect(() => {
    console.log('Counter initialized');
    return () => console.log('Counter cleanup');
  }, []);

  // Memoized computation
  const formattedCount = useMemo(() => {
    return `Count: ${count()}`;
  }, [count]);

  // Template with event binding
  return html`
    <div class="${styles.container}">
      <h1>Counter App</h1>
      <div class="${styles.display}">
        ${formattedCount} (Doubled: ${doubled()})
      </div>
      <button 
        class="${styles.button}"
        @click="${() => setCount(c => c + 1)}"
      >
        Increment
      </button>
      <button 
        class="${styles.button}"
        @click="${() => setCount(0)}"
      >
        Reset
      </button>
    </div>
  `;
};

export default CounterApp;
```

## Files Changed

- `_studio-frame/signals.js` - Signals system (215 lines)
- `_studio-frame/template.js` - HTML templates (228 lines)
- `_studio-frame/lifecycle.js` - Lifecycle hooks (302 lines)
- `_studio-frame/styling.js` - Scoped styling (247 lines)
- `_studio-frame/vdom.js` - Fragment support (updated)
- `_studio-frame/frame.js` - Integration (updated)
- `_studio-frame/types.d.ts` - Type definitions (updated)

## 100% Backwards Compatible

All existing code works unchanged:
- `usePixel()` still works
- `h()` still works
- `style()` still works
- Old components run side-by-side with new ones

## Key Benefits

✅ **Fine-grained reactivity** - Only rerenders what changed
✅ **Better performance** - No DOMParser overhead
✅ **Cleaner code** - More readable templates
✅ **Type-safe** - Full TypeScript support
✅ **No conflicts** - Scoped styles prevent CSS issues
✅ **Flexible** - Multi-root components with fragments
✅ **Familiar** - React Hooks-like API
✅ **Backwards compatible** - Gradual migration

## Next Steps

1. Read `FRAMEWORK_IMPROVEMENTS.md` for detailed docs
2. Check examples in `_studio-frame/examples.js`
3. Review type definitions in `_studio-frame/types.d.ts`
4. Start using new APIs in your components

## Questions?

Refer to:
- `FRAMEWORK_IMPROVEMENTS.md` - Detailed documentation
- `_studio-frame/EXTENSIONS.md` - Advanced patterns
- `TYPESCRIPT_GUIDE.md` - Type system info
- `_studio-frame/examples.js` - Working code samples
