import { DocLayout } from "../components/layout/DocLayout.js";
import { ApiItem } from "../components/atoms/ApiItem.js";
import { CodeBlock } from "../components/atoms/CodeBlock.js";

export default function docsPage() {
    const categories = [
        {
            title: 'Foundation',
            links: [
                { label: 'Introduction', href: '#intro', active: true },
                { label: 'Quick Start', href: '#quickstart' },
                { label: 'Architecture', href: '#architecture' }
            ]
        },
        {
            title: 'Core Reactivity',
            links: [
                { label: 'Signals', href: '#signals' },
                { label: 'usePixel', href: '#usepixel' },
                { label: 'useStore', href: '#usestore' },
                { label: 'Computed', href: '#computed' }
            ]
        },
        {
            title: 'Templating',
            links: [
                { label: 'html Template', href: '#html' },
                { label: 'Fragment', href: '#fragment' },
                { label: 'Event Binding', href: '#events' }
            ]
        },
        {
            title: 'Styling',
            links: [
                { label: 'Scoped Styles', href: '#scoped' },
                { label: 'style API', href: '#style' },
                { label: 'rstyle', href: '#rstyle' },
                { label: 'injectCSS', href: '#injectcss' },
                { label: 'Tailwind CSS', href: '#tailwind' }
            ]
        },
        {
            title: 'Lifecycle & Hooks',
            links: [
                { label: 'usePixelEffect', href: '#useeffect' },
                { label: 'useMemo', href: '#usememo' },
                { label: 'useCallback', href: '#usecallback' },
                { label: 'useReducer', href: '#usereducer' },
                { label: 'useRef', href: '#useref' }
            ]
        },
        {
            title: 'Virtual DOM',
            links: [
                { label: 'h (hyperscript)', href: '#h' },
                { label: 'mount', href: '#mount' },
                { label: 'patch', href: '#patch' }
            ]
        },
        {
            title: 'Routing & Navigation',
            links: [
                { label: 'navigate', href: '#navigate' },
                { label: 'Route Config', href: '#routes' }
            ]
        },
        {
            title: 'Advanced',
            links: [
                { label: 'Middleware', href: '#middleware' },
                { label: 'Error Handling', href: '#errors' },
                { label: 'Plugins', href: '#plugins' }
            ]
        }
    ];

    // Code blocks for various examples
    const quickStartCode = CodeBlock({
        language: 'javascript',
        code: `import { html, createSignal } from 'studio-framer';\n\nconst Counter = () => {\n  const [count, setCount] = createSignal(0);\n  \n  return html\`\n    <div class="p-8 bg-white rounded-lg shadow-md">\n      <h1>Count: \\${count()}</h1>\n      <button @click="\\${() => setCount(c => c + 1)}"\n        class="px-4 py-2 bg-blue-600 text-white rounded">\n        Increment\n      </button>\n    </div>\n  \`;\n};\n\nexport default Counter;`
    });

    const signalsCode = CodeBlock({
        language: 'javascript',
        code: `import { createSignal, createComputed, createEffect } from 'studio-framer';\n\nconst [count, setCount] = createSignal(0);\nconst doubled = createComputed(() => count() * 2);\n\ncreateEffect(() => {\n  console.log(\`Count: \\${count()}, Doubled: \\${doubled()}\`);\n});\n\nsetCount(5); // Logs: Count: 5, Doubled: 10`
    });

    const htmlTemplateCode = CodeBlock({
        language: 'javascript',
        code: `import { html, createSignal } from 'studio-framer';\n\nconst Component = ({ title }) => {\n  const [active, setActive] = createSignal(false);\n  \n  return html\`\n    <div class="container">\n      <h1>\\${title}</h1>\n      <button \n        @click="\\${() => setActive(!active())}"\n        class="\\${active() ? 'bg-blue-600' : 'bg-gray-400'}"\n      >\n        \\${active() ? 'Active' : 'Inactive'}\n      </button>\n    </div>\n  \`;\n};`
    });

    const scopedStylesCode = CodeBlock({
        language: 'javascript',
        code: `import { createScopedStyles, html } from 'studio-framer';\n\nconst Card = () => {\n  const styles = createScopedStyles('Card', {\n    container: {\n      padding: '16px',\n      backgroundColor: '#fff',\n      borderRadius: '8px',\n      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'\n    },\n    title: {\n      fontSize: '20px',\n      fontWeight: 'bold',\n      color: '#333'\n    }\n  });\n  \n  return html\`\n    <div class="\\${styles.container}">\n      <h2 class="\\${styles.title}">Card Title</h2>\n    </div>\n  \`;\n};`
    });

    const usePixelCode = CodeBlock({
        language: 'javascript',
        code: `const [getValue, setValue] = usePixel('count', 0);\n\n// Get value\nconsole.log(getValue());\n\n// Set value\nsetValue(prev => prev + 1);\n\n// Use in template\ncanvas: () => \`<div>Count: \\${getValue()}</div>\``
    });

    const useStoreCode = CodeBlock({
        language: 'javascript',
        code: `// Access global store\nconst userEmail = useStore('user.email');\nconst theme = useStore('theme');\n\n// Update via studio instance\nstudio.setState({ \n  'user.email': 'new@example.com'\n});`
    });

    const styleCode = CodeBlock({
        language: 'javascript',
        code: `import { style } from 'studio-framer';\n\nstyle('.card', {\n  padding: '20px',\n  backgroundColor: '#fff',\n  borderRadius: '8px',\n  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',\n  transition: 'all 0.3s ease'\n});`
    });

    const rstyleCode = CodeBlock({
        language: 'javascript',
        code: `const cssString = rstyle('.dynamic', {\n  color: active ? 'red' : 'blue',\n  fontWeight: importance > 5 ? 'bold' : 'normal'\n});\n\n// Returns CSS string without injection\n// Useful for dynamic or SSR rendering`
    });

    const injectCssCode = CodeBlock({
        language: 'javascript',
        code: `injectCSS(\`\n  @keyframes fadeIn {\n    from { opacity: 0; }\n    to { opacity: 1; }\n  }\n  .fade-in { animation: fadeIn 0.3s ease; }\n\`);`
    });

    const useEffectCode = CodeBlock({
        language: 'javascript',
        code: `import { usePixelEffect } from 'studio-framer';\n\nusePixelEffect(() => {\n  console.log('Component mounted');\n  \n  // Cleanup function\n  return () => {\n    console.log('Component unmounting');\n  };\n}, []);`
    });

    const useMemoCode = CodeBlock({
        language: 'javascript',
        code: `import { useMemo, createSignal } from 'studio-framer';\n\nconst [items, setItems] = createSignal([]);\n\nconst total = useMemo(() => {\n  return items().reduce((sum, item) => sum + item.price, 0);\n}, [items]);`
    });

    const useCallbackCode = CodeBlock({
        language: 'javascript',
        code: `import { useCallback, createSignal } from 'studio-framer';\n\nconst [count, setCount] = createSignal(0);\n\nconst increment = useCallback(() => {\n  setCount(c => c + 1);\n}, []);`
    });

    const navigateCode = CodeBlock({
        language: 'javascript',
        code: `import { navigate } from 'studio-framer';\n\n// Navigate to route\nnavigate('/dashboard');\n\n// Navigate to component\nnavigate(HomePage);\n\n// With props\nnavigate(ProfilePage, { userId: 123 });\n\n// Without history push\nnavigate('/page', null, false);`
    });

    const middlewareCode = CodeBlock({
        language: 'javascript',
        code: `import { middlewareManager, HOOK_TYPES } from 'studio-framer';\n\n// Add middleware\nmiddlewareManager.use(\n  HOOK_TYPES.BEFORE_RENDER,\n  (context) => {\n    console.log('Before render:', context);\n  },\n  'high' // Priority\n);\n\n// Subscribe to errors\nerrorRegistry.subscribe((error) => {\n  console.error('Error:', error.code, error.message);\n});`
    });

    const tailwindCode = CodeBlock({
        language: 'javascript',
        code: `import { html, createSignal } from 'studio-framer';\n\nconst Button = () => {\n  const [isHovered, setIsHovered] = createSignal(false);\n  \n  return html\`\n    <button\n      class="px-4 py-2 bg-blue-600 text-white rounded-lg\n        hover:bg-blue-700 transition-colors duration-200\n        md:px-6 md:py-3 lg:text-lg"\n      @click="\\${() => console.log('clicked')}"\n    >\n      Click Me\n    </button>\n  \`;\n};`
    });

    const architectureCode = CodeBlock({
        language: 'text',
        code: `Ethereal Studio Architecture\n\n┌─────────────────────────────────────┐\n│   Application Layer (Your Code)    │\n│  Pages • Components • Hooks        │\n└──────────────┬──────────────────────┘\n               │\n┌──────────────▼──────────────────────┐\n│    Framework Features Layer         │\n│  Signals • Templates • Lifecycle    │\n│  Styling • Middleware • Routing     │\n└──────────────┬──────────────────────┘\n               │\n┌──────────────▼──────────────────────┐\n│    Core Engine (_studio-frame)      │\n│  Virtual DOM • State • Error Handle │\n│  CSS System • Server • Build        │\n└──────────────┬──────────────────────┘\n               │\n┌──────────────▼──────────────────────┐\n│      Browser / Runtime             │\n└─────────────────────────────────────┘`
    });

    const content = `
        <!-- INTRODUCTION -->
        <section id="intro" class="mb-20">
            <h2 class="text-3xl font-bold text-white mb-6">Ethereal Studio</h2>
            <p class="text-slate-400 mb-6 text-lg leading-relaxed">
                A next-generation JavaScript framework built for creating lightning-fast, 
                beautifully designed interfaces. Ethereal Studio combines fine-grained reactivity, 
                elegant templating, and scoped styling into a cohesive developer experience.
            </p>
            <div class="grid grid-cols-2 gap-6 mb-6">
                <div class="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h4 class="font-semibold text-cyan-400 mb-2">Signals-Based Reactivity</h4>
                    <p class="text-sm text-slate-400">Fine-grained state management that only rerenders what changed</p>
                </div>
                <div class="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h4 class="font-semibold text-cyan-400 mb-2">Template Literals</h4>
                    <p class="text-sm text-slate-400">Clean, readable templates with automatic event binding</p>
                </div>
                <div class="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h4 class="font-semibold text-cyan-400 mb-2">Scoped Styles</h4>
                    <p class="text-sm text-slate-400">Component-level CSS without naming conflicts</p>
                </div>
                <div class="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <h4 class="font-semibold text-cyan-400 mb-2">Tailwind Ready</h4>
                    <p class="text-sm text-slate-400">Full Tailwind CSS integration without CDN dependency</p>
                </div>
            </div>
        </section>

        <!-- QUICK START -->
        <section id="quickstart" class="mb-20">
            <h2 class="text-3xl font-bold text-white mb-6">Quick Start</h2>
            <p class="text-slate-400 mb-6">
                Get up and running with Ethereal Studio in minutes. Here's a complete example:
            </p>
            ${quickStartCode.canvas()}
        </section>

        <!-- ARCHITECTURE -->
        <section id="architecture" class="mb-20">
            <h2 class="text-3xl font-bold text-white mb-6">Architecture</h2>
            <p class="text-slate-400 mb-6">
                Ethereal Studio is built in layers, each providing increasingly powerful capabilities:
            </p>
            ${architectureCode.canvas()}
        </section>

        <!-- SIGNALS & REACTIVITY -->
        <section id="signals" class="mb-20">
            ${ApiItem({
                name: 'createSignal',
                type: 'Reactivity',
                signature: 'createSignal<T>(initialValue: T): [() => T, (value: T | (prev: T) => T) => void]',
                description: 'Create reactive state with fine-grained updates. Returns a getter and setter tuple.',
                exampleCode: signalsCode.canvas()
            })}
        </section>

        <!-- usePixel (Legacy) -->
        <section id="usepixel" class="mb-20">
            ${ApiItem({
                name: 'usePixel',
                type: 'Hook (Legacy)',
                signature: 'usePixel(name: string, initialValue: any): [() => any, (value: any) => void]',
                description: 'Atomic state hook for granular reactivity. Still supported for backwards compatibility.',
                exampleCode: usePixelCode.canvas()
            })}
        </section>

        <!-- useStore -->
        <section id="usestore" class="mb-20">
            ${ApiItem({
                name: 'useStore',
                type: 'Global State',
                signature: 'useStore(key: string): any',
                description: 'Access global framework state. Use dot notation for nested values (e.g., "user.email").',
                exampleCode: useStoreCode.canvas()
            })}
        </section>

        <!-- createComputed -->
        <section id="computed" class="mb-20">
            ${ApiItem({
                name: 'createComputed',
                type: 'Reactivity',
                signature: 'createComputed<T>(computeFn: () => T): () => T',
                description: 'Derived state that automatically updates when dependencies change. Read-only.',
                exampleCode: CodeBlock({
                    language: 'javascript',
                    code: \`const [count, setCount] = createSignal(5);\nconst doubled = createComputed(() => count() * 2);\nconsole.log(doubled()); // 10\nsetCount(10);\nconsole.log(doubled()); // 20 (auto-updated)\`
                }).canvas()
            })}
        </section>

        <!-- HTML Template -->
        <section id="html" class="mb-20">
            ${ApiItem({
                name: 'html\`...\`',
                type: 'Template',
                signature: 'html\`<div>...\\${values}...</div>\`',
                description: 'Tagged template for creating VNodes with automatic event binding and signal interpolation.',
                exampleCode: htmlTemplateCode.canvas()
            })}
        </section>

        <!-- Fragment -->
        <section id="fragment" class="mb-20">
            ${ApiItem({
                name: 'fragment\`...\`',
                type: 'Template',
                signature: 'fragment\`<element1>...</element1><element2>...</element2>\`',
                description: 'Create multi-root components without wrapper elements.',
                exampleCode: CodeBlock({
                    language: 'javascript',
                    code: \`import { fragment } from 'studio-framer';\n\nconst MultiRoot = () => fragment\`\n  <header class="bg-gray-900 p-4">Header</header>\n  <main class="flex-1">Main content</main>\n  <footer class="bg-gray-800 p-4">Footer</footer>\n\`;\`
                }).canvas()
            })}
        </section>

        <!-- Event Binding -->
        <section id="events" class="mb-20">
            ${ApiItem({
                name: 'Event Binding (@event)',
                type: 'Template',
                signature: '@click, @change, @input, @submit, etc.',
                description: 'Automatically bind DOM events in templates using @event syntax.',
                exampleCode: CodeBlock({
                    language: 'javascript',
                    code: \`html\`\n  <input\n    type="text"\n    @input="\\${(e) => setValue(e.target.value)}"\n  />\n  <button @click="\\${handleClick}" @dblclick="\\${handleDoubleClick}">Click</button>\n  <form @submit="\\${handleSubmit}">...</form>\n\`\`
                }).canvas()
            })}
        </section>

        <!-- Scoped Styles -->
        <section id="scoped" class="mb-20">
            ${ApiItem({
                name: 'createScopedStyles',
                type: 'Styling',
                signature: 'createScopedStyles(componentName: string, styles: StyleObject): ScopedStyles',
                description: 'Generate unique, component-scoped class names to prevent CSS conflicts.',
                exampleCode: scopedStylesCode.canvas()
            })}
        </section>

        <!-- style API -->
        <section id="style" class="mb-20">
            ${ApiItem({
                name: 'style',
                type: 'CSS',
                signature: 'style(selector: string, styleObject: Record<string, any>): void',
                description: 'Inject CSS directly from JavaScript objects. Automatically namespaced and scoped.',
                exampleCode: styleCode.canvas()
            })}
        </section>

        <!-- rstyle -->
        <section id="rstyle" class="mb-20">
            ${ApiItem({
                name: 'rstyle',
                type: 'CSS',
                signature: 'rstyle(selector: string, styleObject: Record<string, any>): string',
                description: 'Convert style object to CSS string without injecting. Useful for dynamic styles.',
                exampleCode: rstyleCode.canvas()
            })}
        </section>

        <!-- injectCSS -->
        <section id="injectcss" class="mb-20">
            ${ApiItem({
                name: 'injectCSS',
                type: 'CSS',
                signature: 'injectCSS(cssText: string): void',
                description: 'Inject raw CSS text directly into the document head.',
                exampleCode: injectCssCode.canvas()
            })}
        </section>

        <!-- Tailwind CSS -->
        <section id="tailwind" class="mb-20">
            ${ApiItem({
                name: 'Tailwind CSS',
                type: 'Styling',
                signature: 'class="px-4 py-2 bg-blue-600 hover:bg-blue-700"',
                description: 'Use Tailwind utility classes directly in templates. Full integration without CDN.',
                exampleCode: tailwindCode.canvas()
            })}
        </section>

        <!-- usePixelEffect -->
        <section id="useeffect" class="mb-20">
            ${ApiItem({
                name: 'usePixelEffect',
                type: 'Lifecycle',
                signature: 'usePixelEffect(effectFn: () => void | CleanupFn, deps?: any[]): void',
                description: 'Run side effects after component render with automatic cleanup.',
                exampleCode: useEffectCode.canvas()
            })}
        </section>

        <!-- useMemo -->
        <section id="usememo" class="mb-20">
            ${ApiItem({
                name: 'useMemo',
                type: 'Optimization',
                signature: 'useMemo<T>(computeFn: () => T, deps?: any[]): T',
                description: 'Memoize expensive computations. Value only recalculates when dependencies change.',
                exampleCode: useMemoCode.canvas()
            })}
        </section>

        <!-- useCallback -->
        <section id="usecallback" class="mb-20">
            ${ApiItem({
                name: 'useCallback',
                type: 'Optimization',
                signature: 'useCallback<T extends (...args: any[]) => any>(callback: T, deps?: any[]): T',
                description: 'Memoize function references. Prevents unnecessary function recreations.',
                exampleCode: useCallbackCode.canvas()
            })}
        </section>

        <!-- useReducer -->
        <section id="usereducer" class="mb-20">
            ${ApiItem({
                name: 'useReducer',
                type: 'State Management',
                signature: 'useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, (action: A) => void]',
                description: 'Complex state management with reducers. Useful for state machines and complex logic.',
                exampleCode: CodeBlock({
                    language: 'javascript',
                    code: \`const [state, dispatch] = useReducer(\n  (state, action) => {\n    switch (action.type) {\n      case 'INCREMENT': return { count: state.count + 1 };\n      case 'DECREMENT': return { count: state.count - 1 };\n      default: return state;\n    }\n  },\n  { count: 0 }\n);\n\ndispatch({ type: 'INCREMENT' });\`
                }).canvas()
            })}
        </section>

        <!-- useRef -->
        <section id="useref" class="mb-20">
            ${ApiItem({
                name: 'useRef',
                type: 'State',
                signature: 'useRef<T>(initialValue: T): RefObject<T>',
                description: 'Create a persistent mutable container. Useful for direct DOM access or timers.',
                exampleCode: CodeBlock({
                    language: 'javascript',
                    code: \`import { useRef } from 'studio-framer';\n\nconst ref = useRef(null);\n\nconst focusInput = () => {\n  if (ref.current) {\n    ref.current.focus();\n  }\n};\n\nreturn html\`\n  <input type="text" ref="\\${ref}" />\n  <button @click="\\${focusInput}">Focus</button>\n\`;\`
                }).canvas()
            })}
        </section>

        <!-- h (hyperscript) -->
        <section id="h" class="mb-20">
            ${ApiItem({
                name: 'h (hyperscript)',
                type: 'VDOM',
                signature: 'h(type: string | Function, props: any, ...children: any[]): VNode',
                description: 'Create virtual DOM nodes. Lower-level alternative to html`` templates.',
                exampleCode: CodeBlock({
                    language: 'javascript',
                    code: \`import { h } from 'studio-framer';\n\nconst Button = ({ label, onClick }) => h(\n  'button',\n  { \n    class: 'px-4 py-2 bg-blue-600 text-white rounded',\n    onClick\n  },\n  label\n);\`
                }).canvas()
            })}
        </section>

        <!-- mount -->
        <section id="mount" class="mb-20">
            ${ApiItem({
                name: 'mount',
                type: 'VDOM',
                signature: 'mount(vnode: VNode, container: HTMLElement): HTMLElement',
                description: 'Mount a virtual node into the DOM.',
                exampleCode: CodeBlock({
                    language: 'javascript',
                    code: \`import { h, mount } from 'studio-framer';\n\nconst node = h('div', { class: 'container' }, 'Hello');\nconst container = document.getElementById('app');\nmount(node, container);\`
                }).canvas()
            })}
        </section>

        <!-- patch -->
        <section id="patch" class="mb-20">
            ${ApiItem({
                name: 'patch',
                type: 'VDOM',
                signature: 'patch(parent: HTMLElement, oldVNode: VNode, newVNode: VNode): void',
                description: 'Update DOM by diffing old and new virtual nodes. Used internally during re-renders.',
                exampleCode: CodeBlock({
                    language: 'javascript',
                    code: \`import { h, mount, patch } from 'studio-framer';\n\nconst v1 = h('div', {}, 'Hello');\nconst v2 = h('div', {}, 'World');\n\nconst container = document.getElementById('app');\nmount(v1, container);\npatch(container, v1, v2); // Update to v2\`
                }).canvas()
            })}
        </section>

        <!-- navigate -->
        <section id="navigate" class="mb-20">
            ${ApiItem({
                name: 'navigate',
                type: 'Router',
                signature: 'navigate(path: string | Component, props?: any, pushState?: boolean): Promise<void>',
                description: 'Navigate to a route or component. Supports both string paths and component functions.',
                exampleCode: navigateCode.canvas()
            })}
        </section>

        <!-- Route Config -->
        <section id="routes" class="mb-20">
            <h2 class="text-3xl font-bold text-white mb-6">Route Configuration</h2>
            <p class="text-slate-400 mb-6">
                Define routes in your studio config:
            </p>
            ${CodeBlock({
                language: 'javascript',
                code: \`import { studio } from 'studio-framer';\nimport HomePage from './pages/home';\nimport DocsPage from './pages/docs';\n\nstudio.setConfig({\n  routes: {\n    '/': HomePage,\n    '/docs': DocsPage,\n    '/about': AboutPage\n  },\n  tailwind: true // Enable Tailwind CSS\n});\`
            }).canvas()}
        </section>

        <!-- Middleware -->
        <section id="middleware" class="mb-20">
            ${ApiItem({
                name: 'Middleware System',
                type: 'Advanced',
                signature: 'middlewareManager.use(hook: string, fn: Function, priority?: "high" | "normal" | "low"): void',
                description: 'Hook into framework lifecycle events. Execute custom logic at render, navigation, state changes, and more.',
                exampleCode: middlewareCode.canvas()
            })}
        </section>

        <!-- Error Handling -->
        <section id="errors" class="mb-20">
            <h2 class="text-3xl font-bold text-white mb-6">Error Handling</h2>
            <p class="text-slate-400 mb-6">
                Ethereal Studio provides comprehensive error tracking and debugging:
            </p>
            ${CodeBlock({
                language: 'javascript',
                code: \`import { errorRegistry, StudioError, ERROR_CODES } from 'studio-framer';\n\n// Subscribe to errors\nerrorRegistry.subscribe((error) => {\n  console.error(\`[\\${error.code}] \\${error.message}\`);\n  // Send to error tracking service\n});\n\n// Throw custom errors\nthrow new StudioError(\n  ERROR_CODES.COMPONENT_RENDER_FAILED,\n  'Component failed to render',\n  { component: MyComponent }\n);\`
            }).canvas()}
        </section>

        <!-- Plugins -->
        <section id="plugins" class="mb-20">
            <h2 class="text-3xl font-bold text-white mb-6">Plugin System</h2>
            <p class="text-slate-400 mb-6">
                Extend Ethereal Studio with plugins:
            </p>
            ${CodeBlock({
                language: 'javascript',
                code: \`import { pluginSystem } from 'studio-framer';\n\nconst analyticsPlugin = {\n  name: 'analytics',\n  install(studio) {\n    studio.middlewareManager.use(\n      HOOK_TYPES.AFTER_NAVIGATE,\n      (ctx) => trackPageView(ctx.path)\n    );\n  }\n};\n\npluginSystem.install(analyticsPlugin);\`
            }).canvas()}
        </section>
    `;

    return DocLayout({
        title: 'Ethereal Studio',
        description: 'Complete API reference and guide for building lightning-fast interfaces with Ethereal Studio.',
        categories,
        children: content
    });
}
