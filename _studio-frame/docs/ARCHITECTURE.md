# Studio Framer v2.0 - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Studio Framer Application                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
        ┌───────────────────┐ ┌──────────────────┐
        │   User Code       │ │  Your Plugins    │
        │  (Components)     │ │  (Middleware)    │
        └───────┬───────────┘ └────────┬─────────┘
                │                      │
                └──────────┬───────────┘
                           ▼
        ┌──────────────────────────────────────┐
        │      Studio Framer Core (v2.0)       │
        ├──────────────────────────────────────┤
        │                                      │
        │  ┌──────────────────────────────┐   │
        │  │  Middleware System           │   │
        │  │  ├─ Hook Execution          │   │
        │  │  ├─ Plugin Management       │   │
        │  │  ├─ Priority Levels         │   │
        │  │  └─ Error Isolation         │   │
        │  └──────────────────────────────┘   │
        │                                      │
        │  ┌──────────────────────────────┐   │
        │  │  Error Handling System       │   │
        │  │  ├─ Error Registry           │   │
        │  │  ├─ Error Codes              │   │
        │  │  ├─ Validation               │   │
        │  │  └─ Debug Mode               │   │
        │  └──────────────────────────────┘   │
        │                                      │
        │  ┌──────────────────────────────┐   │
        │  │  Framework Core              │   │
        │  │  ├─ Virtual DOM (VDOM)       │   │
        │  │  ├─ Navigation               │   │
        │  │  ├─ State Management         │   │
        │  │  └─ CSS Injection            │   │
        │  └──────────────────────────────┘   │
        │                                      │
        └──────────────────────────────────────┘
```

## Middleware Lifecycle Hooks

```
┌─────────────────────────────────────────────────────┐
│              Framework Initialization                │
├─────────────────────────────────────────────────────┤
│  BEFORE_INIT ──▶ [Initialize] ──▶ AFTER_INIT       │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│            Configuration Setup                       │
├─────────────────────────────────────────────────────┤
│  BEFORE_SET_CONFIG ──▶ [Apply Config] ──▶ AFTER    │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│              Navigation Flow                         │
├─────────────────────────────────────────────────────┤
│  BEFORE_NAVIGATE ──▶ [Route] ──▶ AFTER_NAVIGATE    │
│       │                              │               │
│       └──────── NAVIGATE_ERROR ◀─────┘              │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│           State Management Flow                      │
├─────────────────────────────────────────────────────┤
│  BEFORE_STATE_CHANGE ──▶ [Update] ──▶ AFTER        │
│           │                            │             │
│           └────── STATE_ERROR ◀───────┘             │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│            Rendering Flow                           │
├─────────────────────────────────────────────────────┤
│  BEFORE_RENDER ──▶ [Render] ──▶ AFTER_RENDER       │
│        │                            │                │
│        └────── RENDER_ERROR ◀───────┘               │
└─────────────────────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
    ┌──────────────────┐  ┌──────────────────┐
    │  Virtual DOM     │  │   VDOM Patching  │
    │  Operations      │  └──────────────────┘
    └──────────────────┘         │
                         ┌───────┴────────┐
                         ▼                ▼
                    BEFORE_PATCH     AFTER_PATCH
                         │                │
                         └──── PATCH_ERROR ◀
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│            Event Handling Flow                      │
├─────────────────────────────────────────────────────┤
│  BEFORE_ACTION ──▶ [Handler] ──▶ AFTER_ACTION       │
│       │                             │                │
│       └────── ACTION_ERROR ◀────────┘               │
└─────────────────────────────────────────────────────┘
```

## Error System Architecture

```
┌─────────────────────────────────────────────┐
│           Error Handling System             │
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │  Framework Operations                 │ │
│  │  (render, navigate, setState, etc)    │ │
│  └────────────────┬──────────────────────┘ │
│                   │                        │
│                   ▼ (throws/catches)       │
│  ┌───────────────────────────────────────┐ │
│  │  StudioError Creation                 │ │
│  │  ├─ Error Code                        │ │
│  │  ├─ Message                           │ │
│  │  ├─ Severity (ERROR/WARNING/INFO)    │ │
│  │  ├─ Hint (helpful suggestion)         │ │
│  │  ├─ Context (additional data)         │ │
│  │  └─ Stack Trace                       │ │
│  └────────────────┬──────────────────────┘ │
│                   │                        │
│                   ▼                        │
│  ┌───────────────────────────────────────┐ │
│  │  ErrorRegistry                        │ │
│  │  ├─ Record Error                      │ │
│  │  ├─ Maintain History (max 100)        │ │
│  │  └─ Notify Subscribers                │ │
│  └────────────────┬──────────────────────┘ │
│                   │                        │
│      ┌────────────┴────────────┐           │
│      ▼                         ▼           │
│  ┌────────┐           ┌──────────────┐    │
│  │Console │           │ Subscribers  │    │
│  │  Log   │           │ (analytics,  │    │
│  └────────┘           │  logging,    │    │
│                       │  error       │    │
│                       │  tracking)   │    │
│                       └──────────────┘    │
│                                             │
└─────────────────────────────────────────────┘

Error Code Structure:
  1000-1099: Rendering
  1100-1199: Navigation
  1200-1299: State Management
  1300-1399: Components
  1400-1499: Virtual DOM
  1500-1599: CSS/Styling
```

## Data Flow Through Middleware

```
User Action
    │
    ▼
┌─────────────────────┐
│ Middleware Chain    │
│ (Priority: HIGH)    │
└────────┬────────────┘
         │
         ▼ (can cancel/skip/modify)
┌─────────────────────┐
│ Middleware Chain    │
│ (Priority: NORMAL)  │
└────────┬────────────┘
         │
         ▼ (can cancel/skip/modify)
┌─────────────────────┐
│ Middleware Chain    │
│ (Priority: LOW)     │
└────────┬────────────┘
         │
         ▼
    ┌────────────┐
    │  Cancelled?│────▶ Skip operation
    └─────┬──────┘
          │ No
          ▼
    ┌────────────────┐
    │ Execute        │
    │ Operation      │
    └─────┬──────────┘
          │
    ┌─────┴──────┐
    │            │
Success      Error
    │            │
    ▼            ▼
┌────────┐  ┌─────────┐
│AFTER_* │  │*_ERROR  │
│Hook    │  │Hook     │
└────────┘  └─────────┘
```

## Plugin System Architecture

```
┌──────────────────────────────────────────────┐
│          Plugin System                       │
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  pluginSystem                        │   │
│  │  ├─ install()                        │   │
│  │  ├─ uninstall()                      │   │
│  │  ├─ list()                           │   │
│  │  └─ plugins: Map                     │   │
│  └────────────────┬─────────────────────┘   │
│                   │                         │
│      ┌────────────┴─────────────┐           │
│      ▼                          ▼           │
│  ┌────────────┐        ┌──────────────┐    │
│  │Function    │        │Object-Based  │    │
│  │Plugin      │        │Plugin        │    │
│  │            │        │              │    │
│  │(middleware)├──┐  ┌──┤install()     │    │
│  │(options)   │  │  │  │uninstall()   │    │
│  └────────────┘  │  │  └──────────────┘    │
│                  │  │                       │
│     ┌────────────┴──┴────────┐             │
│     ▼                        ▼             │
│  ┌──────────────────────────────────┐     │
│  │  middlewareManager.use()         │     │
│  │  (registers middleware in hooks) │     │
│  └──────────────────────────────────┘     │
│                                            │
└──────────────────────────────────────────────┘
```

## Validation System

```
┌──────────────────────────────────────────────┐
│        Validation Utilities                  │
├──────────────────────────────────────────────┤
│                                              │
│  validate.isValidVNode(vnode)               │
│  └─▶ Check: type, props, children           │
│                                              │
│  validate.isValidSelector(selector)         │
│  └─▶ Check: valid CSS selector              │
│                                              │
│  validate.isSerializable(obj)               │
│  └─▶ Check: can JSON.stringify()            │
│                                              │
│  validate.hasCircularReference(obj)         │
│  └─▶ Check: no circular references          │
│                                              │
│  validate.isValidRoute(route)               │
│  └─▶ Check: route format valid              │
│                                              │
└──────────────────────────────────────────────┘
```

## Integration Points

```
Core Framework Functions:
    ├─ frame.js
    │  ├─ constructor()
    │  ├─ setConfig()          ◀─ BEFORE/AFTER_SET_CONFIG
    │  ├─ render()             ◀─ BEFORE/AFTER/ERROR_RENDER + BEFORE/AFTER/ERROR_PATCH
    │  ├─ navigate()           ◀─ BEFORE/AFTER/ERROR_NAVIGATE
    │  ├─ setState()           ◀─ BEFORE/AFTER/ERROR_STATE
    │  └─ addEvent()           ◀─ BEFORE/AFTER/ERROR_ACTION
    │
    ├─ vdom.js
    │  ├─ mount()              ◀─ Error handling + validation
    │  └─ htmlToVNode()        ◀─ Error handling + parsing
    │
    └─ css.js
       ├─ style()              ◀─ Error handling + validation
       ├─ rstyle()             ◀─ Error handling
       └─ jsonToCssString()    ◀─ Validation
```

## Module Exports

```
frame.js exports:
  ├─ studio
  ├─ navigate
  ├─ usePixel
  ├─ useStore
  ├─ injectCSS
  ├─ style
  │
  ├─ errorRegistry        (NEW)
  ├─ StudioError          (NEW)
  ├─ ERROR_CODES          (NEW)
  ├─ validate             (NEW)
  │
  ├─ middlewareManager    (NEW)
  ├─ pluginSystem         (NEW)
  ├─ HOOK_TYPES           (NEW)
  └─ builtinMiddleware    (NEW)

errors.js exports:
  ├─ StudioError
  ├─ ErrorRegistry
  ├─ errorRegistry
  ├─ ERROR_CODES
  ├─ ERROR_MESSAGES
  ├─ validate
  └─ DEBUG_MODE

middleware.js exports:
  ├─ MiddlewareManager
  ├─ MiddlewareContext
  ├─ PluginSystem
  ├─ HOOK_TYPES
  ├─ builtinMiddleware
  ├─ middlewareManager
  └─ pluginSystem
```

## Context Modification Pattern

```
┌─────────────────────────────────────┐
│  Middleware Function                │
├─────────────────────────────────────┤
│                                     │
│  (context) ──────────────────▶ {}   │
│                                     │
│  context.data         ◀─ Hook-specific data
│  context.meta         ◀─ Metadata (timestamp, etc)
│  context.cancel()     ◀─ Cancel operation
│  context.skip()       ◀─ Skip default behavior
│  context.update({})   ◀─ Modify data
│                                     │
│  Return: Promise (async) or void    │
│                                     │
└─────────────────────────────────────┘
```

## Error Handling Flow

```
Operation throws error
        │
        ▼
Try/catch block
        │
        ├─ Is StudioError?
        │  ├─ Yes: Use as-is
        │  └─ No: Wrap in StudioError
        │
        ▼
errorRegistry.record(error)
        │
        ├─ Add to history
        ├─ Update statistics
        └─ Notify subscribers
        │
        ▼
Middleware hook (*_ERROR)
        │
        ├─ Handle in middleware
        ├─ Can modify context
        └─ Can cancel next actions
        │
        ▼
Console (if DEBUG_MODE)
```

---

This architecture ensures:
✅ Clean separation of concerns
✅ Extensibility through middleware
✅ Error handling at every level
✅ Backwards compatibility
✅ Performance optimization
✅ Easy debugging and monitoring

