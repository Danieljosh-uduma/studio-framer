# Studio Framer - Quick Reference

## Error Handling - Quick Reference

### Import
```javascript
import { 
    errorRegistry, 
    StudioError, 
    ERROR_CODES,
    validate 
} from './_studio-frame/frame.js';
```

### Subscribe to Errors
```javascript
errorRegistry.subscribe((error) => {
    console.error(error.message);
    // error.code, error.severity, error.hint, error.context
});
```

### Get Error Stats
```javascript
const { total, errors, warnings } = errorRegistry.getCounts();
const recent = errorRegistry.getRecent(10);
errorRegistry.clear();
```

### Throw Custom Error
```javascript
throw new StudioError(ERROR_CODES.COMPONENT_INVALID_PROPS, 'custom message', {});
```

### Validate Data
```javascript
validate.isValidVNode(vnode)
validate.isValidSelector(selector)
validate.isSerializable(obj)
validate.hasCircularReference(obj)
validate.isValidRoute(route)
```

### Enable Debug Mode
```javascript
globalThis.__STUDIO_DEBUG = true;
```

---

## Middleware - Quick Reference

### Import
```javascript
import {
    middlewareManager,
    pluginSystem,
    HOOK_TYPES,
    builtinMiddleware
} from './_studio-frame/frame.js';
```

### Register Middleware
```javascript
// Simple
middlewareManager.use(HOOK_TYPES.BEFORE_RENDER, (ctx) => {
    console.log(ctx.data);
});

// With priority
middlewareManager.use(
    HOOK_TYPES.BEFORE_RENDER,
    (ctx) => {},
    'high' // 'high' | 'normal' | 'low'
);

// Async
middlewareManager.use(HOOK_TYPES.BEFORE_NAVIGATE, async (ctx) => {
    await fetch('/api/track');
});

// Multiple at once
middlewareManager.useMany({
    beforeRender: (ctx) => {},
    afterNavigate: (ctx) => {}
});
```

### Control Middleware
```javascript
// Unsubscribe
const unsub = middlewareManager.use(HOOK_TYPES.BEFORE_RENDER, handler);
unsub();

// List middlewares
middlewareManager.getMiddlewares(HOOK_TYPES.BEFORE_RENDER);

// Get stats
middlewareManager.stats();

// Enable/disable
middlewareManager.setEnabled(false);

// Clear all
middlewareManager.clear();

// Error handling
middlewareManager.onError((error, hook, context) => {
    console.error(error);
});
```

### Hook Types
```javascript
// Framework
HOOK_TYPES.BEFORE_INIT
HOOK_TYPES.AFTER_INIT

// Config
HOOK_TYPES.BEFORE_SET_CONFIG
HOOK_TYPES.AFTER_SET_CONFIG

// Rendering
HOOK_TYPES.BEFORE_RENDER
HOOK_TYPES.AFTER_RENDER
HOOK_TYPES.RENDER_ERROR

// Navigation
HOOK_TYPES.BEFORE_NAVIGATE
HOOK_TYPES.AFTER_NAVIGATE
HOOK_TYPES.NAVIGATE_ERROR

// State
HOOK_TYPES.BEFORE_STATE_CHANGE
HOOK_TYPES.AFTER_STATE_CHANGE
HOOK_TYPES.STATE_ERROR

// DOM
HOOK_TYPES.BEFORE_PATCH
HOOK_TYPES.AFTER_PATCH
HOOK_TYPES.PATCH_ERROR

// Events
HOOK_TYPES.BEFORE_ACTION
HOOK_TYPES.AFTER_ACTION
HOOK_TYPES.ACTION_ERROR
```

### Context API
```javascript
middlewareManager.use(hook, (ctx) => {
    // Access data
    ctx.data              // Object with hook-specific data
    
    // Modify data
    ctx.update({ key: value })
    
    // Control flow
    ctx.cancel()          // Stop operation & prevent default
    ctx.skip()            // Skip default behavior
    
    // Query state
    ctx.isCancelled()
    ctx.shouldSkipDefault()
    
    // Metadata
    ctx.meta              // { timestamp, cancelled, skipDefault }
});
```

---

## Plugins - Quick Reference

### Create Plugin
```javascript
// Function-based
const myPlugin = (manager, options) => {
    manager.use(HOOK_TYPES.BEFORE_RENDER, (ctx) => {});
};

// Object-based
const myPlugin = {
    name: 'my-plugin',
    install(manager, options) {},
    uninstall(manager) {}
};
```

### Install Plugin
```javascript
pluginSystem.install(myPlugin, { option: 'value' });
pluginSystem.list();
pluginSystem.uninstall('my-plugin');
```

### Built-in Middleware
```javascript
// Logger
const logger = builtinMiddleware.logger(HOOK_TYPES.BEFORE_RENDER);
middlewareManager.useMany(logger);

// Performance (logs > 100ms operations)
const perf = builtinMiddleware.performance(HOOK_TYPES.AFTER_RENDER);
middlewareManager.useMany(perf);

// Rate limiter (5 calls per 1000ms)
const limit = builtinMiddleware.rateLimit(
    HOOK_TYPES.BEFORE_ACTION,
    5,    // max calls
    1000  // time window
);
middlewareManager.useMany(limit);

// Validator
const validator = builtinMiddleware.validator(
    HOOK_TYPES.BEFORE_STATE_CHANGE,
    {
        newState: (val) => typeof val === 'object',
        previousState: (val) => typeof val === 'object'
    }
);
middlewareManager.useMany(validator);

// Analytics (requires window.__studioAnalytics)
const analytics = builtinMiddleware.analytics(HOOK_TYPES.AFTER_NAVIGATE);
middlewareManager.useMany(analytics);
```

---

## Common Patterns

### Analytics Tracking
```javascript
middlewareManager.use(HOOK_TYPES.AFTER_NAVIGATE, async (ctx) => {
    await fetch('/api/track', {
        method: 'POST',
        body: JSON.stringify({ route: ctx.data.frame })
    });
});
```

### Auth Protection
```javascript
middlewareManager.use(
    HOOK_TYPES.BEFORE_NAVIGATE,
    (ctx) => {
        if (!isAuthenticated()) {
            ctx.cancel();
        }
    },
    'high'
);
```

### State Validation
```javascript
middlewareManager.use(HOOK_TYPES.BEFORE_STATE_CHANGE, (ctx) => {
    if (!validate.isSerializable(ctx.data.newState)) {
        ctx.cancel();
    }
});
```

### Auto-save
```javascript
let timeout;
middlewareManager.use(HOOK_TYPES.AFTER_STATE_CHANGE, (ctx) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        localStorage.setItem('state', JSON.stringify(studio.state));
    }, 1000);
});
```

### Rate Limiting
```javascript
const calls = [];
middlewareManager.use(HOOK_TYPES.BEFORE_ACTION, (ctx) => {
    calls.push(Date.now());
    if (calls.filter(t => Date.now() - t < 1000).length > 5) {
        ctx.cancel();
    }
});
```

### Performance Logging
```javascript
middlewareManager.use(HOOK_TYPES.BEFORE_RENDER, (ctx) => {
    ctx.meta._start = performance.now();
});

middlewareManager.use(HOOK_TYPES.AFTER_RENDER, (ctx) => {
    const time = performance.now() - ctx.meta._start;
    if (time > 100) console.warn(`Slow render: ${time}ms`);
});
```

---

## Error Codes Reference

| Code | Error | Category |
|------|-------|----------|
| 1000 | RENDER_NO_BASE | Rendering |
| 1001 | RENDER_NO_FRAME | Rendering |
| 1002 | RENDER_INVALID_VDOM | Rendering |
| 1003 | RENDER_CANVAS_FAILED | Rendering |
| 1100 | NAVIGATION_ROUTE_NOT_FOUND | Navigation |
| 1101 | NAVIGATION_INVALID_TEMPLATE | Navigation |
| 1102 | NAVIGATION_MISSING_CONFIG | Navigation |
| 1103 | NAVIGATION_ROUTE_UNDEFINED | Navigation |
| 1200 | STATE_INVALID_VALUE | State |
| 1201 | STATE_CIRCULAR_REFERENCE | State |
| 1202 | STATE_UPDATE_FAILED | State |
| 1300 | COMPONENT_INVALID_PROPS | Component |
| 1301 | COMPONENT_CHILDREN_REQUIRED | Component |
| 1302 | COMPONENT_RENDER_FAILED | Component |
| 1400 | VDOM_INVALID_TYPE | VDOM |
| 1401 | VDOM_MOUNT_FAILED | VDOM |
| 1402 | VDOM_PATCH_FAILED | VDOM |
| 1403 | VDOM_HTML_PARSE_ERROR | VDOM |
| 1500 | CSS_INVALID_SELECTOR | CSS |
| 1501 | CSS_PARSE_ERROR | CSS |
| 1502 | CSS_INJECTION_FAILED | CSS |

---

## Debugging Tips

### Check Middleware Stats
```javascript
console.log(middlewareManager.stats());
// { total: 5, byHook: { beforeRender: 2, afterNavigate: 3 } }
```

### List Recent Errors
```javascript
errorRegistry.getRecent(5).forEach(err => {
    console.log(`[${err.code}] ${err.message}`);
});
```

### Check Plugin List
```javascript
pluginSystem.list().forEach(p => {
    console.log(`${p.name} installed at ${p.installedAt}`);
});
```

### Enable Full Debug Logging
```javascript
globalThis.__STUDIO_DEBUG = true;
errorRegistry.subscribe(err => err.log());
middlewareManager.use(HOOK_TYPES.BEFORE_RENDER, (ctx) => {
    console.log('[DEBUG]', HOOK_TYPES.BEFORE_RENDER, ctx);
});
```

### Disable All Middleware Temporarily
```javascript
middlewareManager.setEnabled(false);
// ... do something ...
middlewareManager.setEnabled(true);
```

---

## Files Overview

| File | Purpose | Size |
|------|---------|------|
| `errors.js` | Error handling system | 323 lines |
| `middleware.js` | Middleware & plugin system | 405 lines |
| `EXTENSIONS.md` | Full documentation | 419 lines |
| `examples.js` | 10 working examples | 430 lines |
| `README_UPGRADES.md` | Feature overview | 289 lines |
| `QUICK_REFERENCE.md` | This file | API reference |

---

## See Also

- `EXTENSIONS.md` - Complete documentation
- `examples.js` - Working code examples
- `errors.js` - Error system source
- `middleware.js` - Middleware system source

