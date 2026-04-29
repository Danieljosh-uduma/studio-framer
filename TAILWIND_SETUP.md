# Tailwind CSS Setup for Studio Framer

Studio Framer now includes complete Tailwind CSS integration without relying on CDN. This guide walks you through setup and usage.

## Installation

### 1. Install Dependencies

All dependencies are already added to `package.json`:

```bash
npm install
# or
pnpm install
```

This installs:
- `tailwindcss` - Core Tailwind CSS
- `postcss` - CSS processor
- `autoprefixer` - Vendor prefixes
- `postcss-import` - Import support

### 2. Configuration Files

Three configuration files have been created:

#### `tailwind.config.js`
Main Tailwind configuration with:
- Content paths for template scanning
- Theme customization
- Plugin configuration
- Safelist for dynamic classes

```javascript
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './_studio-frame/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#0066cc',
        'secondary': '#6b7280',
      },
    },
  },
}
```

#### `postcss.config.js`
PostCSS pipeline configuration:

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### `src/styles/tailwind.css`
Main CSS file with Tailwind directives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg;
  }
}
```

## Usage

### Development Mode

Watch Tailwind changes during development:

```bash
npm run tailwind:watch
```

This continuously compiles `src/styles/tailwind.css` to `src/styles/tailwind.compiled.css` with hot reload support.

### Production Build

Build optimized CSS for production:

```bash
npm run build
```

The build process:
1. Processes Tailwind CSS
2. Bundles JavaScript with esbuild
3. Combines all styles
4. Minifies output
5. Generates production-ready files in `_studio/`

### Using Tailwind Classes

#### In Templates with html``

```javascript
import { html, createSignal } from 'studio-framer';

const Component = () => {
  const [count, setCount] = createSignal(0);

  return html`
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900">
        Counter: ${count()}
      </h1>
      <button 
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        @click="${() => setCount(c => c + 1)}"
      >
        Increment
      </button>
    </div>
  `;
};
```

#### In Scoped Styles with Tailwind

```javascript
import { createScopedStyles } from 'studio-framer';

const styles = createScopedStyles('Button', {
  container: {
    // Use Tailwind utilities
    display: 'flex',
    padding: '1rem',
    backgroundColor: 'rgb(59, 130, 246)', // blue-500
    borderRadius: '0.375rem',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: 'rgb(17, 24, 39)', // gray-900
  }
});

return html`
  <div class="${styles.container}">
    <h1 class="${styles.title}">Title</h1>
  </div>
`;
```

#### Custom Tailwind Components

Define reusable component classes in `src/styles/tailwind.css`:

```css
@layer components {
  /* Button components */
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }

  .btn-primary {
    @apply btn bg-blue-600 text-white hover:bg-blue-700;
  }

  .btn-secondary {
    @apply btn bg-gray-600 text-white hover:bg-gray-700;
  }

  /* Card component */
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }

  /* Form components */
  .input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}
```

Then use them:

```javascript
return html`
  <button class="btn-primary">Click Me</button>
  <div class="card">Content here</div>
  <input type="text" class="input" />
`;
```

## Customization

### Extending Theme

Edit `tailwind.config.js` to extend colors, spacing, fonts, etc:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        'brand-primary': '#2563eb',
        'brand-secondary': '#1e40af',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
    },
  },
}
```

### Content Paths

Update content paths in `tailwind.config.js` to scan your template files:

```javascript
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './_studio-frame/**/*.{js,jsx,ts,tsx}',
    // Add more paths if needed
    './components/**/*.{js,jsx}',
    './pages/**/*.{js,jsx}',
  ],
}
```

### Plugins

Add Tailwind plugins to extend functionality:

```bash
npm install @tailwindcss/forms @tailwindcss/typography
```

Then in `tailwind.config.js`:

```javascript
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

export default {
  plugins: [
    forms,
    typography,
  ],
}
```

## Responsive Design

Tailwind's responsive prefixes work with all utilities:

```javascript
return html`
  <div class="
    flex flex-col gap-4
    md:flex-row md:gap-8
    lg:gap-12
  ">
    <div class="
      w-full
      md:w-1/2
      lg:w-1/3
    ">
      Content
    </div>
  </div>
`;
```

Available breakpoints:
- `sm: 640px`
- `md: 768px`
- `lg: 1024px`
- `xl: 1280px`
- `2xl: 1536px`

## Dark Mode

Enable dark mode in `tailwind.config.js`:

```javascript
export default {
  darkMode: 'class', // or 'media'
  // ...
}
```

Then use dark mode classes:

```javascript
return html`
  <div class="
    bg-white text-black
    dark:bg-gray-900 dark:text-white
  ">
    Content that changes with dark mode
  </div>
`;
```

## Performance

### File Size

Tailwind includes only the CSS you actually use:

- Unused utilities are purged in production
- Content paths determine what to scan
- Result: ~15-50KB (minified + gzipped)

### Build Optimization

The build process handles:
- CSS purging to remove unused styles
- Minification for production
- Vendor prefix addition
- CSS vendor optimization

### Content Path Optimization

Keep content paths specific for faster builds:

```javascript
content: [
  './index.html',
  './src/**/*.{js,jsx}', // Only scan source
  // Don't scan node_modules unless necessary
]
```

## Troubleshooting

### Styles Not Appearing

1. **Check content paths** - Ensure your template files are in the content paths
2. **Rebuild CSS** - Run `npm run tailwind:build`
3. **Clear cache** - Delete `src/styles/tailwind.compiled.css` and rebuild
4. **Check HTML** - Ensure `index.css` is linked in HTML

### Class Names Not Working

1. **Use valid class names** - Dynamic classes like `class-${value}` won't work
2. **Add to safelist** - For dynamic classes, add to `tailwind.config.js`:
   ```javascript
   safelist: ['text-red-500', 'text-blue-500', 'text-green-500']
   ```
3. **Use static strings** - Prefer static strings over template literals:
   ```javascript
   // ✅ Good
   class="text-blue-500"
   
   // ❌ Bad
   class={`text-${color}-500`}
   ```

### Build Errors

If you get build errors:

1. **Verify Node.js version** - Requires Node.js 14+
2. **Check CSS syntax** - Validate `src/styles/tailwind.css`
3. **Review config files** - Check `tailwind.config.js` and `postcss.config.js`
4. **Clean dependencies** - Run `rm -rf node_modules && npm install`

## Migration from CDN

If you were using Tailwind via CDN:

### Before (CDN)
```html
<link href="https://cdn.tailwindcss.com" rel="stylesheet">
```

### After (Installed)
The CSS is now processed at build time and linked locally:
```html
<link rel="stylesheet" href="index.css">
```

**Benefits:**
- No external dependencies
- Better performance (no CDN latency)
- Works offline
- More control over configuration
- Smaller bundle size

## Complete Example

```javascript
import { html, createSignal, createScopedStyles } from 'studio-framer';

const TodoApp = () => {
  const [todos, setTodos] = createSignal([
    { id: 1, text: 'Learn Tailwind', done: false },
    { id: 2, text: 'Build app', done: false },
  ]);
  const [input, setInput] = createSignal('');

  const addTodo = () => {
    if (input().trim()) {
      setTodos([...todos(), { 
        id: Date.now(), 
        text: input(), 
        done: false 
      }]);
      setInput('');
    }
  };

  return html`
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">
            Todo App
          </h1>
          <p class="text-gray-600">
            Stay organized with Tailwind CSS
          </p>
        </div>

        <!-- Input -->
        <div class="flex gap-2 mb-6">
          <input 
            type="text"
            class="
              flex-1 px-4 py-2 border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500
            "
            placeholder="Add a new todo..."
            @input="${(e) => setInput(e.target.value)}"
            value="${input()}"
          />
          <button 
            class="
              px-6 py-2 bg-blue-600 text-white rounded-lg
              hover:bg-blue-700 transition-colors font-medium
            "
            @click="${addTodo}"
          >
            Add
          </button>
        </div>

        <!-- Todos -->
        <div class="bg-white rounded-lg shadow-md">
          ${todos().length === 0 
            ? html`
              <div class="p-8 text-center text-gray-500">
                No todos yet. Add one above!
              </div>
            `
            : html`
              <ul class="divide-y divide-gray-200">
                ${todos().map(todo => html`
                  <li class="p-4 hover:bg-gray-50 transition-colors">
                    <div class="flex items-center gap-3">
                      <input 
                        type="checkbox"
                        class="w-4 h-4 text-blue-600 rounded cursor-pointer"
                        ${todo.done ? 'checked' : ''}
                      />
                      <span class="
                        flex-1
                        ${todo.done ? 'line-through text-gray-400' : 'text-gray-900'}
                      ">
                        ${todo.text}
                      </span>
                    </div>
                  </li>
                `)}
              </ul>
            `
          }
        </div>

        <!-- Stats -->
        <div class="mt-6 p-4 bg-white rounded-lg shadow-md">
          <p class="text-gray-600">
            <span class="font-semibold text-gray-900">
              ${todos().length}
            </span>
            total todos
          </p>
        </div>
      </div>
    </div>
  `;
};

export default TodoApp;
```

## Next Steps

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Watch Tailwind changes: `npm run tailwind:watch` (in another terminal)
4. Start using Tailwind classes in your components
5. Customize theme in `tailwind.config.js`

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com)
- [Tailwind CSS Plugins](https://tailwindcss.com/docs/plugins)
- [Studio Framer Guide](./FRAMEWORK_IMPROVEMENTS.md)

---

**Tailwind CSS is now fully integrated into Studio Framer!**
