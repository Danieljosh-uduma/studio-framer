# TypeScript Support in Studio Framer

Complete guide to using TypeScript types for IDE support and type safety.

## Overview

Studio Framer now includes comprehensive TypeScript type definitions enabling:
- Full IDE autocomplete and IntelliSense
- Real-time type checking in JavaScript
- JSDoc support for enhanced documentation
- Better error catching during development
- Improved code maintainability

## Files

### Type Definitions

- **`_studio-frame/types.d.ts`** - Complete TypeScript definitions for all framework APIs
- **`tsconfig.json`** - Strict TypeScript configuration
- **`jsconfig.json`** - JavaScript type checking configuration

### JSDoc Annotations

All framework files include JSDoc comments for:
- Parameter type hints
- Return type documentation
- Error documentation
- Usage examples

## Getting Started

### Option 1: JavaScript with JSDoc (Recommended for JS projects)

Use JavaScript with JSDoc comments and let TypeScript check your code:

```javascript
// src/components/Button.js
/**
 * @param {Object} props
 * @param {string} props.text - Button text
 * @param {Function} props.onClick - Click handler
 * @returns {Object} Frame object
 */
export function Button({ text = 'Click me', onClick }) {
  return {
    canvas: `<button>${text}</button>`,
    action: {
      id: 'btn-click',
      type: 'click',
      func: onClick
    }
  };
}
```

### Option 2: TypeScript (.ts files)

Convert files to TypeScript for strict type checking:

```typescript
// src/components/Button.ts
import type { Frame, Action } from '@studio/types';

interface ButtonProps {
  text?: string;
  onClick: (event: Event) => void;
}

export function Button({ text = 'Click me', onClick }: ButtonProps): Frame {
  return {
    canvas: `<button>${text}</button>`,
    action: {
      id: 'btn-click',
      type: 'click',
      func: onClick
    }
  };
}
```

## Type Imports

### Import in JavaScript with JSDoc

```javascript
/** @type {import('@studio/types').VNode} */
const myNode = h('div', { class: 'container' }, 'Hello');

/**
 * @param {import('@studio/types').Frame} frame
 * @returns {Promise<void>}
 */
async function renderFrame(frame) {
  // ...
}
```

### Import in TypeScript

```typescript
import type { 
  VNode, 
  Frame, 
  Action, 
  StudioConfig 
} from '@studio/types';

const myNode: VNode = h('div', { class: 'container' }, 'Hello');

async function renderFrame(frame: Frame): Promise<void> {
  // ...
}
```

## Core Types

### VNode - Virtual DOM Node

```typescript
interface VNode {
  type: string;           // HTML tag or 'TEXT_ELEMENT'
  props: VNodeProps;      // Properties and attributes
  dom?: Node;             // DOM reference after mount
}

interface VNodeProps {
  children: (VNode | string)[];
  nodeValue?: string;
  className?: string;
  style?: Record<string, string | number>;
  [key: string]: any;
}
```

**Usage:**
```javascript
/** @type {import('@studio/types').VNode} */
const button = h('button', 
  { className: 'btn', onClick: handleClick },
  'Click me'
);
```

### Frame - Component Output

```typescript
interface Frame {
  canvas: string | VNode;     // Rendered content
  action?: Action | Action[];  // Event handlers
  style?: StyleObject | string; // CSS styles
  state?: StateObject;         // Initial state
}
```

**Usage:**
```javascript
/**
 * @returns {import('@studio/types').Frame}
 */
function MyComponent() {
  return {
    canvas: h('div', null, 'Hello'),
    action: {
      id: 'my-action',
      type: 'click',
      func: (e) => console.log('Clicked')
    }
  };
}
```

### StudioConfig - Configuration

```typescript
interface StudioConfig {
  tailwind?: boolean;           // Enable Tailwind CSS
  routes?: RouteConfig;         // Route definitions
  [key: string]: any;          // Custom config
}

interface RouteConfig {
  [path: string]: (props?: any) => Frame;
}
```

**Usage:**
```javascript
/** @type {import('@studio/types').StudioConfig} */
const config = {
  tailwind: true,
  routes: {
    '/': HomePage,
    '/about': AboutPage,
    '/products/:id': ProductPage
  }
};

studio.setConfig(config);
```

### StudioError - Error Handling

```typescript
enum ERROR_CODES {
  RENDER_NO_BASE = 1000,
  NAVIGATION_ROUTE_NOT_FOUND = 1100,
  STATE_CIRCULAR_REFERENCE = 1201,
  // ... and more
}

class StudioError extends Error {
  code: ERROR_CODES;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  context: Record<string, any>;
  timestamp: Date;
}
```

**Usage:**
```javascript
import { errorRegistry, ERROR_CODES } from '@studio/frame';

errorRegistry.subscribe((error) => {
  console.error(`[${error.code}] ${error.message}`);
  if (error.severity === 'ERROR') {
    // Handle critical errors
  }
});
```

### Middleware Types

```typescript
enum HOOK_TYPES {
  BEFORE_RENDER = 'beforeRender',
  AFTER_RENDER = 'afterRender',
  BEFORE_NAVIGATE = 'beforeNavigate',
  // ... more hooks
}

interface Middleware {
  name: string;
  hook: HOOK_TYPES;
  handler: (context: MiddlewareContext) => void | Promise<void>;
  priority?: 'high' | 'normal' | 'low';
  enabled?: boolean;
}
```

**Usage:**
```javascript
import { middlewareManager, HOOK_TYPES } from '@studio/frame';

middlewareManager.use({
  name: 'my-plugin',
  hook: HOOK_TYPES.BEFORE_RENDER,
  priority: 'high',
  handler: async (context) => {
    console.log('About to render', context.data);
  }
});
```

## IDE Configuration

### VS Code Setup

1. **Install TypeScript Plugin** (recommended):
   ```json
   // .vscode/extensions.json
   {
     "recommendations": ["ms-vscode.vscode-typescript-vue-plugin"]
   }
   ```

2. **TypeScript IntelliSense** works automatically:
   - Hover over variables for type info
   - Get autocomplete in JSDoc comments
   - See error squiggles for type mismatches

3. **Enable Type Checking** (optional):
   ```json
   // .vscode/settings.json
   {
     "js/ts.implicitProjectConfig.checkJs": true,
     "typescript.enablePromptUseWorkspaceTsdk": true
   }
   ```

### WebStorm / JetBrains IDEs

1. **Enable JavaScript type checking**:
   - Settings → Languages & Frameworks → JavaScript
   - Enable "TypeScript" and "JavaScript" code inspections

2. **JSDoc support is enabled by default**

### Other Editors

TypeScript types and JSDoc work with:
- Sublime Text (with TypeScript plugin)
- Vim/Neovim (with appropriate LSP)
- Emacs (with LSP mode)
- Any editor with LSP support

## Validation and Type Checking

### Run Type Checking

Check for type errors without running code:

```bash
npm run type-check
```

This uses the TypeScript compiler in no-emit mode.

### Run Linting with Type Safety

```bash
npm run lint
```

ESLint with TypeScript support catches type-related issues.

## Common Patterns

### Component with Props

**JavaScript:**
```javascript
/**
 * @typedef {Object} UserCardProps
 * @property {string} name
 * @property {string} email
 * @property {Function} onDelete
 */

/**
 * @param {UserCardProps} props
 * @returns {import('@studio/types').Frame}
 */
function UserCard({ name, email, onDelete }) {
  return {
    canvas: `<div class="card">
      <h2>${name}</h2>
      <p>${email}</p>
      <button>Delete</button>
    </div>`,
    action: {
      id: 'delete-user',
      type: 'click',
      func: onDelete
    }
  };
}
```

**TypeScript:**
```typescript
import type { Frame } from '@studio/types';

interface UserCardProps {
  name: string;
  email: string;
  onDelete: (userId: string) => void;
}

function UserCard({ name, email, onDelete }: UserCardProps): Frame {
  return {
    canvas: `<div class="card">
      <h2>${name}</h2>
      <p>${email}</p>
      <button>Delete</button>
    </div>`,
    action: {
      id: 'delete-user',
      type: 'click',
      func: onDelete
    }
  };
}
```

### State Management

```javascript
import { studio } from '@studio/frame';

// Get state with type hints
/**
 * @type {Object}
 */
const currentState = studio.state;

// Update state with validation
await studio.setState({
  user: {
    id: '123',
    name: 'John'
  },
  isLoading: false
});
```

### Error Handling

```javascript
import { errorRegistry, StudioError } from '@studio/frame';

// Subscribe to errors
const unsubscribe = errorRegistry.subscribe((error) => {
  console.error(`Error ${error.code}: ${error.message}`);
  if (error.context.originalError) {
    console.error('Original:', error.context.originalError);
  }
});

// Throw typed errors
throw new StudioError(
  ERROR_CODES.COMPONENT_INVALID_PROPS,
  'Missing required prop: onClick',
  { componentName: 'Button' }
);
```

## Migration Guide

### From Untyped JavaScript

1. **Add JSDoc gradually**:
   ```javascript
   // Before
   function Button(props) {
     return { canvas: `<button>${props.text}</button>` };
   }

   // After
   /**
    * @param {Object} props
    * @param {string} props.text
    * @returns {import('@studio/types').Frame}
    */
   function Button(props) {
     return { canvas: `<button>${props.text}</button>` };
   }
   ```

2. **Enable type checking**:
   - ESLint will catch type issues
   - IDE will show errors inline

3. **Convert to TypeScript** (optional):
   - Rename `.js` to `.ts`
   - Update imports/exports
   - Use TypeScript syntax

## Troubleshooting

### IntelliSense Not Working

1. Restart IDE/TypeScript server
2. Check that `types.d.ts` exists in `_studio-frame/`
3. Verify import paths are correct
4. Check `jsconfig.json` or `tsconfig.json` exists

### Type Errors on Valid Code

1. Check ESLint/TypeScript version compatibility
2. Review type definitions in `types.d.ts`
3. Add type assertions if needed:
   ```javascript
   /** @type {any} */
   const value = someFunction();
   ```

### JSDoc Not Recognized

1. Use proper JSDoc syntax: `/** ... */`
2. Ensure semicolons after type declarations
3. Check IDE has JSDoc support enabled

## Best Practices

1. **Use JSDoc for JavaScript**:
   - Easier than TypeScript conversion
   - Works in any JavaScript file
   - IDE support is excellent

2. **Type all function parameters**:
   ```javascript
   /**
    * @param {string} name
    * @param {number} age
    */
   function createUser(name, age) { }
   ```

3. **Type return values**:
   ```javascript
   /**
    * @returns {Promise<User>}
    */
   async function getUser(id) { }
   ```

4. **Use type aliases for complex types**:
   ```javascript
   /**
    * @typedef {Object} User
    * @property {string} id
    * @property {string} name
    * @property {string} email
    */
   ```

5. **Document errors that can be thrown**:
   ```javascript
   /**
    * @throws {StudioError} If user not found
    * @returns {Promise<User>}
    */
   async function getUser(id) { }
   ```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JSDoc Documentation](https://jsdoc.app/)
- [TypeScript JSDoc Handbook](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)
- Studio Framer `types.d.ts` - Full type definitions

## Next Steps

1. Install dependencies: `npm install`
2. Enable type checking in your IDE
3. Start adding JSDoc comments to your components
4. Run `npm run type-check` to verify types
5. Use IDE IntelliSense for autocomplete
