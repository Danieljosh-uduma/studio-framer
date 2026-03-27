# Studio Framer v2.0 - New Features

This document outlines the two major features added to Studio Framer: **Error Handling System** and **Middleware System**.

## 📊 What's New

### 1. Error Handling System ⚠️

A comprehensive error handling framework providing:

- **Structured Error Codes** - 40+ error codes organized by category (1000-1599)
- **Helpful Error Messages** - Every error includes a message and actionable hint
- **Error Registry** - Centralized error tracking with subscription support
- **Severity Levels** - Errors categorized as ERROR, WARNING, or INFO
- **Debug Mode** - Enhanced logging with stack traces and context
- **Validation Utilities** - Pre-built validators for common scenarios

**Files:**
- `_studio-frame/errors.js` - Error system implementation (323 lines)

**Key Classes:**
- `StudioError` - Main error class
- `ErrorRegistry` - Global error tracking
- `validate` - Validation utilities

### 2. Middleware System 🔌

A plugin-based middleware system enabling:

- **7 Hook Categories** - 17+ lifecycle hooks for extensibility
- **Priority Levels** - high/normal/low execution order
- **Async Support** - Full async/await middleware support
- **Built-in Middleware** - Logger, performance, rate limit, validator
- **Plugin System** - Easy plugin installation/uninstallation
- **Context Modification** - Intercept and modify framework behavior
- **Error Isolation** - Middleware errors don't break the app

**Files:**
- `_studio-frame/middleware.js` - Middleware system (405 lines)

**Key Classes:**
- `MiddlewareManager` - Manages middleware registration/execution
- `PluginSystem` - Plugin installation system
- `MiddlewareContext` - Data passed to middleware

## 🎯 Quick Start

### Error Monitoring

```javascript
import { studio, errorRegistry } from './_studio-frame/frame.js';

// Track all errors
errorRegistry.subscribe((error) => {
    console.error(`[${error.code}] ${error.message}`);
    // Send to Sentry, LogRocket, etc.
});

// Get statistics
const stats = errorRegistry.getCounts();
// { total: 5, errors: 3, warnings: 2, info: 0 }
```

### Middleware Usage

```javascript
import { 
    middlewareManager, 
    HOOK_TYPES,
    pluginSystem 
} from './_studio-frame/frame.js';

// Register middleware
middlewareManager.use(
    HOOK_TYPES.BEFORE_RENDER,
    (ctx) => console.log('State:', ctx.data)
);

// Create a plugin
const analyticsPlugin = (manager, options) => {
    manager.use(HOOK_TYPES.AFTER_NAVIGATE, async (ctx) => {
        await trackPageView(ctx.data);
    });
};

// Install plugin
pluginSystem.install(analyticsPlugin, { apiKey: 'key' });
```

## 📚 Documentation

### Error System Guide
See `_studio-frame/EXTENSIONS.md` - **Error Handling System** section

- Error codes reference
- Error registry usage
- Custom error throwing
- Debug mode setup

### Middleware System Guide
See `_studio-frame/EXTENSIONS.md` - **Middleware System** section

- Hook types reference
- Middleware registration
- Priority levels
- Async middleware
- Error handling

### Plugin System Guide
See `_studio-frame/EXTENSIONS.md` - **Plugin System** section

- Plugin creation
- Plugin installation
- Built-in middleware helpers

### Usage Examples
See `_studio-frame/examples.js` - 10 complete examples including:

1. Basic error monitoring
2. State validation
3. Analytics tracking
4. Performance monitoring
5. Rate limiting
6. Auth protection
7. Data persistence
8. Custom plugins
9. Error recovery
10. Complete setup

## 🔄 Framework Integration

The error handling and middleware systems are integrated throughout the framework:

**frame.js (main)**
- Error handling in: `render()`, `navigate()`, `setState()`, `addEvent()`
- Middleware hooks at all lifecycle points
- Error registry subscription setup

**vdom.js (virtual DOM)**
- HTML parsing validation
- Mount operation error handling
- Type validation

**css.js (styling)**
- Selector validation
- CSS parsing error handling
- Property validation

## 📈 Feature Comparison

| Feature | Before | After |
|---------|--------|-------|
| Error Tracking | ❌ | ✅ Centralized registry |
| Error Messages | Generic | ✅ Helpful & specific |
| Error Codes | ❌ | ✅ 40+ codes |
| Plugins | ❌ | ✅ Full plugin system |
| Lifecycle Hooks | ❌ | ✅ 17+ hooks |
| Async Support | Partial | ✅ Full async/await |
| Analytics | ❌ | ✅ Via middleware |
| Validation | ❌ | ✅ Built-in validators |
| Rate Limiting | ❌ | ✅ Built-in middleware |
| Performance Monitoring | ❌ | ✅ Built-in middleware |

## 🚀 Use Cases

### 1. Error Monitoring Service Integration
```javascript
errorRegistry.subscribe((error) => {
    Sentry.captureException(error);
});
```

### 2. Analytics Tracking
```javascript
middlewareManager.use(HOOK_TYPES.AFTER_NAVIGATE, async (ctx) => {
    await analytics.trackPageView(ctx.data);
});
```

### 3. Form Validation
```javascript
middlewareManager.use(HOOK_TYPES.BEFORE_STATE_CHANGE, (ctx) => {
    validateForm(ctx.data.newState);
});
```

### 4. Auth Protection
```javascript
middlewareManager.use(HOOK_TYPES.BEFORE_NAVIGATE, (ctx) => {
    if (!isAuthenticated()) {
        ctx.cancel();
        navigate('/login');
    }
});
```

### 5. Performance Optimization
```javascript
const perf = builtinMiddleware.performance(HOOK_TYPES.AFTER_RENDER);
middlewareManager.useMany(perf);
```

## 🔧 Configuration

### Enable Debug Mode
```javascript
globalThis.__STUDIO_DEBUG = true;
```

### Get Middleware Statistics
```javascript
console.log(middlewareManager.stats());
// { total: 5, byHook: { beforeRender: 2, ... } }
```

### List Installed Plugins
```javascript
console.log(pluginSystem.list());
// [ { id: 'analytics', name: 'analytics', ... } ]
```

### Disable Middleware System
```javascript
middlewareManager.setEnabled(false);
```

## 📋 Breaking Changes

**None** - All changes are backwards compatible. The old API still works, and new features are additive.

## 🎓 Learning Path

1. Start with **Error Monitoring** - Add error tracking first
2. Add **Basic Middleware** - Log key lifecycle events
3. Implement **Analytics** - Track user behavior
4. Build **Custom Plugins** - Extend with custom logic
5. Monitor **Performance** - Use built-in performance middleware

## 💡 Best Practices

1. **Handle Errors Gracefully** - Don't break the app in error handlers
2. **Keep Middleware Lightweight** - Defer heavy operations
3. **Use Priority Levels** - High for validations, low for logging
4. **Clean Up Subscriptions** - Always call unsubscribe functions
5. **Test Middleware** - Ensure plugins don't conflict
6. **Log Wisely** - Use debug mode in development only

## 🐛 Troubleshooting

### Middleware not executing?
1. Check `middlewareManager.enabled` is true
2. Verify hook name from `HOOK_TYPES`
3. Check browser console for errors
4. Use `middlewareManager.stats()` to verify registration

### Performance issues?
1. Check `middlewareManager.stats()` for too many middlewares
2. Use performance monitoring middleware to identify slow handlers
3. Consider disabling non-critical middleware
4. Check error registry size with `errorRegistry.getRecent()`

### Large state causing issues?
1. Use `validate.hasCircularReference()` to check
2. Monitor state size in middleware
3. Clear state when navigating to new pages
4. Use error registry to track state-related errors

## 📖 Complete Documentation

For comprehensive documentation, guides, and examples, see:
- `_studio-frame/EXTENSIONS.md` - Full API documentation
- `_studio-frame/examples.js` - 10 complete working examples
- `_studio-frame/errors.js` - Error system source code
- `_studio-frame/middleware.js` - Middleware system source code

## 🤝 Contributing

To add custom middleware or plugins:

1. Create your middleware/plugin function
2. Register with `middlewareManager.use()` or `pluginSystem.install()`
3. Use proper error handling
4. Document your middleware
5. Share examples of usage

---

**Studio Framer v2.0** - Built with error handling and extensibility as first-class features. 🎉
