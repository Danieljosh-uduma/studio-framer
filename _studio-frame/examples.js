/**
 * Studio Framer - Error Handling & Middleware Examples
 * 
 * This file demonstrates practical usage of the error handling
 * and middleware systems for building robust applications.
 */

import {
    studio,
    navigate,
    usePixel,
    errorRegistry,
    StudioError,
    ERROR_CODES,
    validate,
    middlewareManager,
    pluginSystem,
    HOOK_TYPES,
    builtinMiddleware
} from './frame.js';

// ============================================================================
// EXAMPLE 1: Basic Error Monitoring
// ============================================================================

export function exampleErrorMonitoring() {
    // Track all errors in your app
    errorRegistry.subscribe((error) => {
        console.group(`📋 Error Reported: ${error.code}`);
        console.log('Message:', error.message);
        console.log('Severity:', error.severity);
        console.log('Hint:', error.hint);
        if (error.context && Object.keys(error.context).length > 0) {
            console.log('Context:', error.context);
        }
        console.groupEnd();

        // In production, send to error tracking service
        if (typeof window !== 'undefined' && window.__errorTracking) {
            window.__errorTracking.captureException(error);
        }
    });

    // Get error statistics periodically
    setInterval(() => {
        const counts = errorRegistry.getCounts();
        console.log(`App Health: ${counts.errors} errors, ${counts.warnings} warnings`);
    }, 60000);
}

// ============================================================================
// EXAMPLE 2: State Validation Middleware
// ============================================================================

export function exampleStateValidation() {
    // Validate all state updates match expected schema
    middlewareManager.use(
        HOOK_TYPES.BEFORE_STATE_CHANGE,
        (context) => {
            const { newState } = context.data;

            // Define your state schema
            const schema = {
                user: (val) => val === null || (typeof val === 'object' && val.id),
                isLoading: (val) => typeof val === 'boolean',
                error: (val) => val === null || typeof val === 'string',
                items: (val) => Array.isArray(val)
            };

            // Validate each property
            for (const [key, validator] of Object.entries(schema)) {
                if (key in newState && !validator(newState[key])) {
                    console.warn(
                        `Invalid state.${key}: expected valid value, got`,
                        newState[key]
                    );
                }
            }
        }
    );
}

// ============================================================================
// EXAMPLE 3: Analytics Tracking Middleware
// ============================================================================

export function exampleAnalyticsTracking() {
    // Track page navigation
    middlewareManager.use(
        HOOK_TYPES.AFTER_NAVIGATE,
        async (context) => {
            const { frame } = context.data;

            // Find route path
            const routes = studio.config.routes || {};
            const routePath = Object.keys(routes).find(
                (path) => routes[path] === frame
            ) || 'unknown';

            console.log('📍 Navigated to:', routePath);

            // Send analytics
            if (window.__analytics) {
                await window.__analytics.trackPageView({
                    path: routePath,
                    timestamp: new Date(),
                    userId: studio.state.user?.id
                });
            }
        }
    );

    // Track user interactions
    middlewareManager.use(
        HOOK_TYPES.AFTER_ACTION,
        async (context) => {
            const { id, type, event } = context.data;

            console.log(`🖱️  User action: ${type} on ${id}`);

            if (window.__analytics) {
                await window.__analytics.trackEvent('user_action', {
                    actionId: id,
                    actionType: type,
                    timestamp: new Date()
                });
            }
        }
    );
}

// ============================================================================
// EXAMPLE 4: Performance Monitoring Middleware
// ============================================================================

export function examplePerformanceMonitoring() {
    // Monitor render performance
    const renders = new Map();

    middlewareManager.use(
        HOOK_TYPES.BEFORE_RENDER,
        (context) => {
            context.meta._renderStart = performance.now();
        }
    );

    middlewareManager.use(
        HOOK_TYPES.AFTER_RENDER,
        (context) => {
            const duration = performance.now() - context.meta._renderStart;
            renders.set(Date.now(), duration);

            // Log slow renders
            if (duration > 100) {
                console.warn(
                    `⚠️  Slow render: ${duration.toFixed(2)}ms (state keys: ${Object.keys(studio.state).length})`
                );
            }
        }
    );

    // Monitor state changes
    middlewareManager.use(
        HOOK_TYPES.AFTER_STATE_CHANGE,
        (context) => {
            const stateSize = JSON.stringify(studio.state).length;
            if (stateSize > 1000000) {
                console.warn(
                    `⚠️  Large state: ${(stateSize / 1024).toFixed(2)}KB`
                );
            }
        }
    );
}

// ============================================================================
// EXAMPLE 5: Rate Limiting Middleware
// ============================================================================

export function exampleRateLimiting() {
    // Prevent action spam
    const actionCalls = new Map();

    middlewareManager.use(
        HOOK_TYPES.BEFORE_ACTION,
        (context) => {
            const { id, type } = context.data;
            const now = Date.now();
            const key = `${id}:${type}`;

            if (!actionCalls.has(key)) {
                actionCalls.set(key, []);
            }

            const calls = actionCalls.get(key);
            const recentCalls = calls.filter((time) => now - time < 1000);

            if (recentCalls.length > 5) {
                console.warn(`⏱️  Rate limit: Too many ${type} events on ${id}`);
                context.cancel();
                return;
            }

            recentCalls.push(now);
            actionCalls.set(key, recentCalls);
        }
    );
}

// ============================================================================
// EXAMPLE 6: Auth Protection Middleware
// ============================================================================

export function exampleAuthProtection() {
    // Protect routes that require authentication
    middlewareManager.use(
        HOOK_TYPES.BEFORE_NAVIGATE,
        (context) => {
            const { template } = context.data;
            const protectedRoutes = ['/dashboard', '/admin', '/profile'];

            // Find route path
            const routes = studio.config.routes || {};
            const routePath = Object.keys(routes).find(
                (path) => routes[path] === template
            );

            // Check if route is protected
            if (routePath && protectedRoutes.includes(routePath)) {
                const user = studio.state.user;
                const isAdmin = user && user.role === 'admin';

                if (!user) {
                    console.warn('🔐 Navigation blocked: Not authenticated');
                    context.cancel();
                    navigate('/login');
                    return;
                }

                if (routePath === '/admin' && !isAdmin) {
                    console.warn('🔐 Navigation blocked: Not admin');
                    context.cancel();
                    navigate('/');
                    return;
                }
            }
        },
        'high' // High priority to run first
    );
}

// ============================================================================
// EXAMPLE 7: Data Persistence Middleware
// ============================================================================

export function exampleDataPersistence() {
    // Auto-save state to localStorage
    let saveTimeout;

    middlewareManager.use(
        HOOK_TYPES.AFTER_STATE_CHANGE,
        (context) => {
            // Debounce saves
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                const state = studio.state;
                localStorage.setItem('app_state', JSON.stringify(state));
                console.log('💾 State saved to localStorage');
            }, 1000);
        }
    );

    // Restore state on init
    middlewareManager.use(
        HOOK_TYPES.AFTER_SET_CONFIG,
        (context) => {
            const saved = localStorage.getItem('app_state');
            if (saved) {
                try {
                    const state = JSON.parse(saved);
                    studio.setState(state);
                    console.log('📂 State restored from localStorage');
                } catch (e) {
                    console.error('Failed to restore state:', e);
                }
            }
        }
    );
}

// ============================================================================
// EXAMPLE 8: Creating a Custom Plugin
// ============================================================================

export function createLoggingPlugin(options = {}) {
    const {
        verbose = false,
        hooks = [HOOK_TYPES.BEFORE_RENDER, HOOK_TYPES.AFTER_NAVIGATE]
    } = options;

    return {
        name: 'logging-plugin',

        install(manager) {
            hooks.forEach((hook) => {
                manager.use(hook, (context) => {
                    if (verbose) {
                        console.group(`📝 [${hook}]`);
                        console.log('Data:', context.data);
                        console.log('Timestamp:', new Date(context.meta.timestamp).toISOString());
                        console.groupEnd();
                    }
                });
            });
        },

        uninstall(manager) {
            console.log('Logging plugin uninstalled');
        }
    };
}

// ============================================================================
// EXAMPLE 9: Error Recovery Middleware
// ============================================================================

export function exampleErrorRecovery() {
    // Auto-retry failed navigations
    let navigationAttempts = 0;
    const maxRetries = 3;

    middlewareManager.use(
        HOOK_TYPES.NAVIGATE_ERROR,
        async (context) => {
            const { error, template, props } = context.data;

            navigationAttempts++;

            if (navigationAttempts < maxRetries) {
                console.log(`🔄 Retrying navigation (attempt ${navigationAttempts})`);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await navigate(template, props);
            } else {
                console.error('❌ Navigation failed after retries');
                navigationAttempts = 0;
                // Fallback to home
                navigate('/');
            }
        }
    );

    // Handle render errors gracefully
    middlewareManager.use(
        HOOK_TYPES.RENDER_ERROR,
        (context) => {
            const { error } = context.data;
            console.error('🚨 Render error:', error.message);
            // Show error UI, notify user, etc.
        }
    );
}

// ============================================================================
// EXAMPLE 10: Complete Setup
// ============================================================================

export function setupCompleteErrorHandlingAndMiddleware() {
    console.log('🚀 Initializing Studio Framer with error handling & middleware');

    // 1. Setup error monitoring
    exampleErrorMonitoring();

    // 2. Add state validation
    exampleStateValidation();

    // 3. Add analytics
    exampleAnalyticsTracking();

    // 4. Monitor performance
    examplePerformanceMonitoring();

    // 5. Add rate limiting
    exampleRateLimiting();

    // 6. Protect routes
    exampleAuthProtection();

    // 7. Persist data
    exampleDataPersistence();

    // 8. Install custom plugin
    const loggingPlugin = createLoggingPlugin({
        verbose: false,
        hooks: [HOOK_TYPES.BEFORE_NAVIGATE, HOOK_TYPES.AFTER_NAVIGATE]
    });
    pluginSystem.install(loggingPlugin);

    // 9. Add error recovery
    exampleErrorRecovery();

    console.log('✅ All middleware and error handling configured');
    console.log('📊 Middleware stats:', middlewareManager.stats());
}

// ============================================================================
// USAGE
// ============================================================================

/*
In your app initialization file (e.g., main.js):

import { setupCompleteErrorHandlingAndMiddleware } from './_studio-frame/examples.js';
import { studio } from './_studio-frame/frame.js';

// Setup everything
setupCompleteErrorHandlingAndMiddleware();

// Then configure studio normally
studio.setConfig({
    routes: {
        '/': HomePage,
        '/about': AboutPage,
        '/dashboard': DashboardPage
    },
    tailwind: true
});

// Everything will now be logged, monitored, validated, and tracked!
*/
