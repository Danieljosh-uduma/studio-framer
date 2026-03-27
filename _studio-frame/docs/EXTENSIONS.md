# Studio Framer - Error Handling & Middleware System

This guide covers the error handling and middleware systems that enable better debugging and extensibility in Studio Framer.

## Error Handling System

### Overview

The error handling system provides structured error codes, helpful messages, and a centralized error registry.

### Error Codes by Category

**Rendering Errors (1000-1099)**
- `1000` - No base element found (`RENDER_NO_BASE`)
- `1001` - No frame to render (`RENDER_NO_FRAME`)
- `1002` - Invalid Virtual DOM (`RENDER_INVALID_VDOM`)
- `1003` - Canvas generation failed (`RENDER_CANVAS_FAILED`)

**Navigation Errors (1100-1199)**
- `1100` - Route not found (`NAVIGATION_ROUTE_NOT_FOUND`)
- `1101` - Invalid template (`NAVIGATION_INVALID_TEMPLATE`)
- `1102` - Missing config (`NAVIGATION_MISSING_CONFIG`)
- `1103` - Route undefined (`NAVIGATION_ROUTE_UNDEFINED`)

**State Management Errors (1200-1299)**
- `1200` - Invalid state value (`STATE_INVALID_VALUE`)
- `1201` - Circular reference detected (`STATE_CIRCULAR_REFERENCE`)
- `1202` - State update failed (`STATE_UPDATE_FAILED`)

**Component Errors (1300-1399)**
- `1300` - Invalid props (`COMPONENT_INVALID_PROPS`)
- `1301` - Missing required children (`COMPONENT_CHILDREN_REQUIRED`)
- `1302` - Component render failed (`COMPONENT_RENDER_FAILED`)

**Virtual DOM Errors (1400-1499)**
- `1400` - Invalid element type (`VDOM_INVALID_TYPE`)
- `1401` - Mount failed (`VDOM_MOUNT_FAILED`)
- `1402` - Patch failed (`VDOM_PATCH_FAILED`)
- `1403` - HTML parse error (`VDOM_HTML_PARSE_ERROR`)

**CSS Errors (1500-1599)**
- `1500` - Invalid selector (`CSS_INVALID_SELECTOR`)
- `1501` - CSS parse error (`CSS_PARSE_ERROR`)
- `1502` - CSS injection failed (`CSS_INJECTION_FAILED`)

### Using Error Handling

#### Accessing the Error Registry

```javascript
import { studio, errorRegistry } from './_studio-frame/frame.js';

// Get recent errors
const recentErrors = errorRegistry.getRecent(5);

// Get error statistics
const stats = errorRegistry.getCounts();
console.log(`Total errors: ${stats.total}, Warnings: ${stats.warnings}`);

// Clear error history
errorRegistry.clear();
```

#### Listening to Errors

```javascript
// Subscribe to all errors
const unsubscribe = errorRegistry.subscribe((error) => {
    console.log(`Error ${error.code}: ${error.message}`);
    // Send to logging service, show toast, etc.
});

// Later: unsubscribe
unsubscribe();
```

#### Throwing Custom Errors

```javascript
import { StudioError, ERROR_CODES } from './_studio-frame/frame.js';

// Throw a structured error
throw new StudioError(
    ERROR_CODES.COMPONENT_INVALID_PROPS,
    'Custom message',
    { component: 'MyButton', props: props }
);
```

#### Debug Mode

Enable debug mode to see detailed stack traces and context:

```javascript
globalThis.__STUDIO_DEBUG = true;
```

---

## Middleware System

### Overview

The middleware system enables plugins and extensions through lifecycle hooks. You can intercept and modify behavior at key points in the framework.

### Hook Types

**Framework Hooks**
- `beforeInit` - Before framework initialization
- `afterInit` - After framework initialization

**Configuration Hooks**
- `beforeSetConfig` - Before config is applied
- `afterSetConfig` - After config is applied

**Rendering Hooks**
- `beforeRender` - Before rendering
- `afterRender` - After successful render
- `renderError` - When render fails

**Navigation Hooks**
- `beforeNavigate` - Before route change
- `afterNavigate` - After route change
- `navigateError` - When navigation fails

**State Hooks**
- `beforeStateChange` - Before state updates
- `afterStateChange` - After state updates
- `stateError` - When state update fails

**Virtual DOM Hooks**
- `beforePatch` - Before DOM patching
- `afterPatch` - After DOM patching
- `patchError` - When patching fails

**Event Hooks**
- `beforeAction` - Before event handler
- `afterAction` - After event handler
- `actionError` - When handler fails

### Basic Usage

```javascript
import { studio, middlewareManager, HOOK_TYPES } from './_studio-frame/frame.js';

// Register a simple middleware
middlewareManager.use(HOOK_TYPES.BEFORE_RENDER, (context) => {
    console.log('About to render with state:', context.data);
});

// Cancel an operation
middlewareManager.use(HOOK_TYPES.BEFORE_NAVIGATE, (context) => {
    if (context.data.template === '/admin' && !isUserAdmin()) {
        context.cancel();
        console.log('Navigation cancelled: not admin');
    }
});

// Modify data
middlewareManager.use(HOOK_TYPES.BEFORE_STATE_CHANGE, (context) => {
    const updated = {
        ...context.data.newState,
        timestamp: Date.now()
    };
    context.update({ newState: updated });
});
```

### Priority Levels

Middleware executes in priority order: `high` → `normal` → `low`

```javascript
middlewareManager.use(
    HOOK_TYPES.BEFORE_RENDER,
    (ctx) => console.log('High priority'),
    'high'
);

middlewareManager.use(
    HOOK_TYPES.BEFORE_RENDER,
    (ctx) => console.log('Low priority'),
    'low'
);
```

### Async Middleware

Middleware can be async and supports parallel execution:

```javascript
middlewareManager.use(HOOK_TYPES.AFTER_NAVIGATE, async (context) => {
    // Analytics
    await fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({
            route: context.data.frame,
            timestamp: Date.now()
        })
    });
});
```

### Error Handling in Middleware

```javascript
middlewareManager.onError((error, hook, context) => {
    console.error(`Error in ${hook}:`, error);
    // Send to error tracking service
});
```

### Unregistering Middleware

```javascript
// Middleware returns unsubscribe function
const unsubscribe = middlewareManager.use(
    HOOK_TYPES.BEFORE_RENDER,
    (ctx) => console.log('render')
);

// Later: remove the middleware
unsubscribe();
```

### Getting Middleware Info

```javascript
// Get all middlewares for a hook
const renders = middlewareManager.getMiddlewares(HOOK_TYPES.BEFORE_RENDER);
console.log(`${renders.length} render middlewares registered`);

// Get statistics
const stats = middlewareManager.stats();
console.log(`Total middlewares: ${stats.total}`);
```

---

## Plugin System

### Creating Plugins

Plugins are functions or objects that install middleware hooks:

```javascript
// Simple function plugin
const loggingPlugin = (middlewareManager, options) => {
    const prefix = options.prefix || '[Log]';
    
    middlewareManager.use(HOOK_TYPES.BEFORE_RENDER, (ctx) => {
        console.log(`${prefix} Rendering:`, ctx.data);
    });
};

// Or object-based plugin
const analyticsPlugin = {
    name: 'analytics',
    
    install(middlewareManager, options) {
        middlewareManager.use(HOOK_TYPES.AFTER_NAVIGATE, async (ctx) => {
            await sendAnalytics(ctx.data);
        });
    },
    
    uninstall(middlewareManager) {
        // Cleanup
    }
};
```

### Installing Plugins

```javascript
import { studio, pluginSystem } from './_studio-frame/frame.js';

// Install plugins
pluginSystem.install(loggingPlugin, { prefix: '[App]' });
pluginSystem.install(analyticsPlugin, { apiKey: 'key' });

// List installed plugins
pluginSystem.list();

// Uninstall plugin
pluginSystem.uninstall('analytics');
```

---

## Built-in Middleware

The framework provides useful built-in middleware helpers:

### Logger Middleware

```javascript
import { builtinMiddleware } from './_studio-frame/frame.js';

const logger = builtinMiddleware.logger(HOOK_TYPES.BEFORE_RENDER);
middlewareManager.useMany(logger);
```

### Performance Monitoring

```javascript
const perf = builtinMiddleware.performance(HOOK_TYPES.AFTER_RENDER);
middlewareManager.useMany(perf);
// Logs operations taking > 100ms
```

### Rate Limiting

```javascript
const rateLimited = builtinMiddleware.rateLimit(
    HOOK_TYPES.BEFORE_ACTION,
    5,  // max 5 calls
    1000  // per 1000ms
);
middlewareManager.useMany(rateLimited);
```

### Validation

```javascript
const validator = builtinMiddleware.validator(
    HOOK_TYPES.BEFORE_STATE_CHANGE,
    {
        newState: (val) => typeof val === 'object',
        previousState: (val) => typeof val === 'object'
    }
);
middlewareManager.useMany(validator);
```

---

## Complete Example

```javascript
import {
    studio,
    navigate,
    usePixel,
    errorRegistry,
    middlewareManager,
    pluginSystem,
    HOOK_TYPES,
    builtinMiddleware
} from './_studio-frame/frame.js';

// 1. Setup error tracking
errorRegistry.subscribe((error) => {
    // Send to Sentry, LogRocket, etc.
    console.error(`Error ${error.code}:`, error.message);
});

// 2. Register middleware
middlewareManager.use(
    HOOK_TYPES.BEFORE_RENDER,
    (ctx) => console.log('State before render:', ctx.data.state)
);

middlewareManager.use(
    HOOK_TYPES.AFTER_NAVIGATE,
    async (ctx) => {
        await fetch('/api/page-view', {
            method: 'POST',
            body: JSON.stringify({ route: ctx.data.frame })
        });
    }
);

// 3. Install plugins
const perfMiddleware = builtinMiddleware.performance(HOOK_TYPES.AFTER_RENDER);
middlewareManager.useMany(perfMiddleware);

// 4. Use framework normally
studio.setConfig({
    routes: {
        '/': HomePage,
        '/about': AboutPage
    },
    tailwind: true
});

// Everything is logged and monitored!
```

---

## Best Practices

1. **Keep middleware lightweight** - Heavy operations should be deferred or run async
2. **Use priority strategically** - High priority for validations, low for logging
3. **Handle errors gracefully** - Don't break the app in error handlers
4. **Clean up subscriptions** - Use returned unsubscribe functions
5. **Document custom middleware** - Other developers need to understand what it does
6. **Use TypeScript** - The system supports type checking (optional)

---

## Troubleshooting

### Middleware not executing?
- Check if middleware is enabled: `middlewareManager.enabled`
- Verify hook name matches `HOOK_TYPES`
- Check browser console for errors

### Performance degraded?
- Check `middlewareManager.stats()` for too many middlewares
- Use performance monitoring to identify slow handlers
- Consider disabling non-critical middleware in production

### Circular state references?
- Use `validate.hasCircularReference()` to check
- Avoid circular object references in state
- Use error registry to track these issues

