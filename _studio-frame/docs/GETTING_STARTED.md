# Getting Started with Error Handling & Middleware

This guide will help you get started with the new error handling and middleware systems in Studio Framer v2.0.

## 5-Minute Quick Start

### Step 1: Enable Error Monitoring (1 minute)

In your app initialization file:

```javascript
import { studio, errorRegistry } from './_studio-frame/frame.js';

// Subscribe to all errors
errorRegistry.subscribe((error) => {
    console.log(`Error ${error.code}: ${error.message}`);
    console.log(`Hint: ${error.hint}`);
    
    // In production, send to error tracking service
    // Sentry.captureException(error);
});

// Configure and use studio normally
studio.setConfig({ routes: { '/': HomePage } });
```

✅ Done! Now all framework errors are tracked and logged.

### Step 2: Add Basic Middleware (2 minutes)

```javascript
import { middlewareManager, HOOK_TYPES } from './_studio-frame/frame.js';

// Log page navigations
middlewareManager.use(HOOK_TYPES.AFTER_NAVIGATE, (ctx) => {
    console.log('📍 Navigated to:', ctx.data.frame);
});

// Log state changes
middlewareManager.use(HOOK_TYPES.AFTER_STATE_CHANGE, (ctx) => {
    console.log('📊 State updated:', ctx.data.state);
});
```

✅ Now you're logging all lifecycle events!

### Step 3: Add Error Recovery (2 minutes)

```javascript
// Handle render errors
middlewareManager.use(HOOK_TYPES.RENDER_ERROR, (ctx) => {
    console.error('Render failed:', ctx.data.error.message);
    // Show error UI or fallback
});

// Handle navigation errors
middlewareManager.use(HOOK_TYPES.NAVIGATE_ERROR, (ctx) => {
    console.error('Navigation failed:', ctx.data.error.message);
    // Fallback to home
    navigate('/');
});
```

✅ Your app now handles errors gracefully!

## Step-by-Step Guide

### Phase 1: Add Error Tracking (15 minutes)

**Goal:** Centralize all error tracking in your app

#### 1. Create error monitor file

`src/utils/errorMonitor.js`:
```javascript
import { errorRegistry } from '../_studio-frame/frame.js';

export function initErrorMonitoring() {
    // In-browser error history
    const errorLog = [];
    
    errorRegistry.subscribe((error) => {
        errorLog.push({
            code: error.code,
            message: error.message,
            severity: error.severity,
            timestamp: new Date().toISOString()
        });
        
        // Keep last 50 errors
        if (errorLog.length > 50) {
            errorLog.shift();
        }
        
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
            error.log();
        }
        
        // Send to service in production
        if (process.env.NODE_ENV === 'production') {
            sendToErrorTracker(error);
        }
    });
    
    // Expose for debugging
    globalThis.__errorLog = errorLog;
    
    return errorLog;
}

async function sendToErrorTracker(error) {
    try {
        await fetch('/api/errors', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: error.code,
                message: error.message,
                severity: error.severity,
                context: error.context,
                timestamp: error.timestamp,
                userAgent: navigator.userAgent,
                url: window.location.href
            })
        });
    } catch (e) {
        console.error('Failed to send error:', e);
    }
}
```

#### 2. Initialize in your app

`src/main.js`:
```javascript
import { studio } from './_studio-frame/frame.js';
import { initErrorMonitoring } from './utils/errorMonitor.js';

// Initialize error monitoring first
initErrorMonitoring();

// Then configure studio
studio.setConfig({
    routes: { /* ... */ },
    tailwind: true
});
```

#### 3. Debug errors

In browser console:
```javascript
// View all errors
console.log(__errorLog);

// Get statistics
console.log(errorRegistry.getCounts());

// Enable debug mode for more details
globalThis.__STUDIO_DEBUG = true;
```

### Phase 2: Add Analytics (20 minutes)

**Goal:** Track user behavior with middleware

#### 1. Create analytics module

`src/utils/analytics.js`:
```javascript
import { middlewareManager, HOOK_TYPES } from '../_studio-frame/frame.js';

export function initAnalytics(config = {}) {
    const { apiUrl = '/api/analytics' } = config;
    
    // Track page views
    middlewareManager.use(
        HOOK_TYPES.AFTER_NAVIGATE,
        async (ctx) => {
            const { frame } = ctx.data;
            
            // Find route path
            const routes = studio.config.routes || {};
            const path = Object.keys(routes).find(p => routes[p] === frame);
            
            // Send analytics
            await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'page_view',
                    path: path || 'unknown',
                    timestamp: new Date().toISOString()
                })
            });
        }
    );
    
    // Track user interactions
    middlewareManager.use(
        HOOK_TYPES.AFTER_ACTION,
        async (ctx) => {
            const { id, type } = ctx.data;
            
            await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event: 'user_action',
                    actionId: id,
                    actionType: type,
                    timestamp: new Date().toISOString()
                })
            });
        }
    );
    
    console.log('Analytics initialized');
}
```

#### 2. Initialize analytics

`src/main.js`:
```javascript
import { studio } from './_studio-frame/frame.js';
import { initErrorMonitoring } from './utils/errorMonitor.js';
import { initAnalytics } from './utils/analytics.js';

// Initialize monitoring
initErrorMonitoring();
initAnalytics({ apiUrl: '/api/analytics' });

// Configure studio
studio.setConfig({ /* ... */ });
```

### Phase 3: Add Validation (15 minutes)

**Goal:** Validate state and props before updates

#### 1. Create validation module

`src/utils/validation.js`:
```javascript
import { middlewareManager, HOOK_TYPES, validate } from '../_studio-frame/frame.js';

export function initValidation() {
    // Validate state updates
    middlewareManager.use(
        HOOK_TYPES.BEFORE_STATE_CHANGE,
        (ctx) => {
            const { newState } = ctx.data;
            
            // Check for circular references
            if (validate.hasCircularReference(newState)) {
                console.error('State has circular reference - cancelling update');
                ctx.cancel();
                return;
            }
            
            // Check if serializable
            if (!validate.isSerializable(newState)) {
                console.error('State is not serializable - cancelling update');
                ctx.cancel();
                return;
            }
            
            // Custom schema validation
            if (newState.user && !validateUser(newState.user)) {
                console.error('Invalid user object');
                ctx.cancel();
                return;
            }
        }
    );
    
    console.log('Validation initialized');
}

function validateUser(user) {
    if (!user || typeof user !== 'object') return false;
    if (typeof user.id !== 'string') return false;
    if (typeof user.email !== 'string') return false;
    return true;
}
```

#### 2. Initialize validation

`src/main.js`:
```javascript
import { initValidation } from './utils/validation.js';

initErrorMonitoring();
initAnalytics();
initValidation();

studio.setConfig({ /* ... */ });
```

### Phase 4: Add Custom Plugins (20 minutes)

**Goal:** Create reusable middleware plugins

#### 1. Create plugin

`src/plugins/performancePlugin.js`:
```javascript
import { HOOK_TYPES, builtinMiddleware } from '../_studio-frame/frame.js';

export const performancePlugin = {
    name: 'performance-monitor',
    
    install(manager, options = {}) {
        const { slowThreshold = 100 } = options;
        
        // Track render times
        const renderTimes = [];
        
        manager.use(HOOK_TYPES.BEFORE_RENDER, (ctx) => {
            ctx.meta._renderStart = performance.now();
        });
        
        manager.use(HOOK_TYPES.AFTER_RENDER, (ctx) => {
            const duration = performance.now() - ctx.meta._renderStart;
            renderTimes.push(duration);
            
            if (duration > slowThreshold) {
                console.warn(
                    `⚠️ Slow render: ${duration.toFixed(2)}ms`
                );
            }
            
            // Keep last 100 times
            if (renderTimes.length > 100) {
                renderTimes.shift();
            }
        });
        
        // Expose stats
        globalThis.__renderStats = () => ({
            count: renderTimes.length,
            avg: renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length,
            min: Math.min(...renderTimes),
            max: Math.max(...renderTimes)
        });
        
        console.log('Performance plugin installed');
    },
    
    uninstall(manager) {
        delete globalThis.__renderStats;
        console.log('Performance plugin uninstalled');
    }
};
```

#### 2. Install plugin

`src/main.js`:
```javascript
import { pluginSystem } from './_studio-frame/frame.js';
import { performancePlugin } from './plugins/performancePlugin.js';

initErrorMonitoring();
initAnalytics();
initValidation();

// Install plugin
pluginSystem.install(performancePlugin, { slowThreshold: 100 });

studio.setConfig({ /* ... */ });
```

#### 3. Check performance

In browser console:
```javascript
console.log(__renderStats());
// { count: 10, avg: 45.2, min: 20, max: 120 }
```

## Common Recipes

### Recipe 1: Toast Notifications for Errors

```javascript
import { errorRegistry } from './_studio-frame/frame.js';

errorRegistry.subscribe((error) => {
    if (error.severity === 'ERROR') {
        showToast({
            type: 'error',
            title: `Error ${error.code}`,
            message: error.message,
            duration: 5000
        });
    }
});
```

### Recipe 2: Local Storage Persistence

```javascript
import { middlewareManager, HOOK_TYPES } from './_studio-frame/frame.js';

let saveTimeout;

middlewareManager.use(HOOK_TYPES.AFTER_STATE_CHANGE, (ctx) => {
    // Debounce saves
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        localStorage.setItem(
            'appState',
            JSON.stringify(studio.state)
        );
    }, 1000);
});

// Restore on init
const saved = localStorage.getItem('appState');
if (saved) {
    studio.setState(JSON.parse(saved));
}
```

### Recipe 3: Protected Routes

```javascript
import { middlewareManager, HOOK_TYPES, navigate } from './_studio-frame/frame.js';

middlewareManager.use(
    HOOK_TYPES.BEFORE_NAVIGATE,
    (ctx) => {
        const protectedRoutes = ['/admin', '/dashboard'];
        const user = studio.state.user;
        
        if (protectedRoutes.some(route => 
            Object.keys(studio.config.routes || {}).includes(route)
        )) {
            if (!user) {
                ctx.cancel();
                navigate('/login');
            }
        }
    },
    'high' // Run first
);
```

### Recipe 4: Form Validation

```javascript
import { 
    middlewareManager, 
    HOOK_TYPES,
    errorRegistry,
    StudioError,
    ERROR_CODES
} from './_studio-frame/frame.js';

middlewareManager.use(
    HOOK_TYPES.BEFORE_STATE_CHANGE,
    (ctx) => {
        const { form } = ctx.data.newState;
        
        if (form && form.email) {
            if (!isValidEmail(form.email)) {
                const error = new StudioError(
                    ERROR_CODES.COMPONENT_INVALID_PROPS,
                    'Invalid email format'
                );
                errorRegistry.record(error);
                ctx.cancel();
            }
        }
    }
);

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

## Troubleshooting

### Middleware not executing?

1. Check if enabled:
   ```javascript
   console.log(middlewareManager.enabled); // should be true
   ```

2. Verify hook name:
   ```javascript
   console.log(HOOK_TYPES.BEFORE_RENDER); // 'beforeRender'
   ```

3. Check registration:
   ```javascript
   console.log(middlewareManager.stats());
   ```

### Performance degradation?

1. Check middleware count:
   ```javascript
   const stats = middlewareManager.stats();
   console.log(`Total middlewares: ${stats.total}`);
   ```

2. Monitor render times:
   ```javascript
   const perf = builtinMiddleware.performance(HOOK_TYPES.AFTER_RENDER);
   middlewareManager.useMany(perf);
   ```

### Errors not being tracked?

1. Verify subscription:
   ```javascript
   const unsub = errorRegistry.subscribe(err => console.log(err));
   // Later: unsub();
   ```

2. Check error history:
   ```javascript
   console.log(errorRegistry.getRecent(10));
   ```

## Next Steps

1. **Start with Phase 1** - Add error monitoring
2. **Add Phase 2** - Track analytics
3. **Add Phase 3** - Validate your data
4. **Create Phase 4** - Build custom plugins

## Resources

- **API Reference**: `_studio-frame/EXTENSIONS.md`
- **Working Examples**: `_studio-frame/examples.js`
- **Quick Reference**: `_studio-frame/QUICK_REFERENCE.md`
- **Feature Overview**: `_studio-frame/README_UPGRADES.md`

---

Happy error handling and middleware development! 🚀
