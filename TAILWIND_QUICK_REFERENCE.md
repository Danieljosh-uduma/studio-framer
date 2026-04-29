# Tailwind CSS - Quick Reference

## Installation & Setup

```bash
# Install all dependencies
npm install

# Watch Tailwind during development
npm run tailwind:watch

# Build for production
npm run build

# Start dev server
npm run dev
```

## Basic Usage

### Using Utility Classes

```javascript
import { html } from 'studio-framer';

const Component = () => html`
  <div class="flex items-center gap-4 p-6 bg-white rounded-lg shadow-md">
    <img 
      src="avatar.png" 
      class="w-12 h-12 rounded-full" 
    />
    <div>
      <h2 class="text-xl font-bold text-gray-900">John Doe</h2>
      <p class="text-sm text-gray-600">Product Designer</p>
    </div>
  </div>
`;
```

### Responsive Design

```javascript
html`
  <div class="
    w-full
    md:w-1/2
    lg:w-1/3
    p-4
    md:p-6
    lg:p-8
  ">
    Responsive layout
  </div>
`;
```

### Dark Mode

```javascript
html`
  <div class="
    bg-white text-gray-900
    dark:bg-gray-900 dark:text-white
  ">
    Works in dark mode too
  </div>
`;
```

## Common Patterns

### Flexbox Layout

```javascript
// Row layout
html`<div class="flex gap-4">...</div>`;

// Centered items
html`<div class="flex items-center justify-center">...</div>`;

// Column layout
html`<div class="flex flex-col gap-4">...</div>`;

// Space between
html`<div class="flex justify-between">...</div>`;
```

### Grid Layout

```javascript
// 2 column grid
html`<div class="grid grid-cols-2 gap-4">...</div>`;

// Responsive grid
html`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">...</div>`;

// Auto grid
html`<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">...</div>`;
```

### Buttons

```javascript
html`
  <!-- Primary button -->
  <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
    Click Me
  </button>

  <!-- Secondary button -->
  <button class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
    Cancel
  </button>

  <!-- Danger button -->
  <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
    Delete
  </button>
`;
```

### Forms

```javascript
html`
  <form class="space-y-6">
    <!-- Input -->
    <div class="flex flex-col">
      <label class="mb-2 font-medium text-gray-700">Email</label>
      <input 
        type="email"
        class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="you@example.com"
      />
    </div>

    <!-- Select -->
    <div class="flex flex-col">
      <label class="mb-2 font-medium text-gray-700">Category</label>
      <select class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option>Select...</option>
      </select>
    </div>

    <!-- Checkbox -->
    <div class="flex items-center gap-2">
      <input type="checkbox" class="w-4 h-4 rounded" />
      <label class="text-gray-700">I agree to the terms</label>
    </div>

    <!-- Submit -->
    <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
      Submit
    </button>
  </form>
`;
```

### Cards

```javascript
html`
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-bold mb-4">Card Title</h3>
    <p class="text-gray-600 mb-4">Card content goes here</p>
    <button class="text-blue-600 hover:text-blue-700 font-medium">
      Learn More
    </button>
  </div>
`;
```

### Alerts

```javascript
html`
  <!-- Success -->
  <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
    <p class="text-green-800 font-medium">Success! Your changes have been saved.</p>
  </div>

  <!-- Warning -->
  <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
    <p class="text-yellow-800 font-medium">Warning: Please review your changes.</p>
  </div>

  <!-- Error -->
  <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
    <p class="text-red-800 font-medium">Error: Something went wrong.</p>
  </div>

  <!-- Info -->
  <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
    <p class="text-blue-800 font-medium">Info: New feature available.</p>
  </div>
`;
```

## Colors

### Palette

```
gray, red, orange, amber, yellow, lime, green, emerald, teal, cyan, 
blue, indigo, violet, purple, fuchsia, pink, rose
```

### Shades

Each color has 11 shades: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950

```javascript
// Examples
'bg-blue-50'   // Lightest
'bg-blue-500'  // Medium
'bg-blue-900'  // Darkest
```

## Spacing

```
0, 1, 2, 4, 6, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 
60, 64, 72, 80, 96
```

### Utilities

```javascript
// Padding
'p-4'   // All sides
'px-4'  // Left & right
'py-4'  // Top & bottom
'pt-4'  // Top
'pr-4'  // Right
'pb-4'  // Bottom
'pl-4'  // Left

// Margin
'm-4', 'mx-4', 'my-4', 'mt-4', 'mr-4', 'mb-4', 'ml-4'

// Gap
'gap-4', 'gap-x-4', 'gap-y-4'
```

## Font Sizes

```
xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 
2xl (24px), 3xl (30px), 4xl (36px), 5xl (48px), 6xl (60px), 7xl (72px)
```

## Font Weights

```
100 (thin), 200 (extralight), 300 (light), 400 (normal), 500 (medium),
600 (semibold), 700 (bold), 800 (extrabold), 900 (black)
```

## Display & Visibility

```javascript
'block', 'inline-block', 'inline', 'flex', 'grid'
'hidden', 'visible', 'invisible'
'opacity-0' through 'opacity-100'
```

## Positioning

```javascript
'relative', 'absolute', 'fixed', 'sticky', 'static'
'top-4', 'right-4', 'bottom-4', 'left-4'
'z-10', 'z-20', 'z-30', 'z-40', 'z-50'
```

## States

```javascript
// Hover
'hover:bg-blue-600'
'hover:text-blue-700'

// Focus
'focus:outline-none'
'focus:ring-2'
'focus:ring-blue-500'

// Active
'active:bg-blue-800'

// Disabled
'disabled:opacity-50'
'disabled:cursor-not-allowed'

// Group hover
'group hover:bg-blue-600'
'group-hover:text-white'
```

## Transitions

```javascript
'transition'
'transition-colors'
'transition-opacity'
'duration-200'
'ease-in'
'ease-out'
'ease-in-out'
```

## Shadows

```
'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl'
```

## Borders

```javascript
// Width
'border', 'border-2', 'border-4'

// Color
'border-gray-300'
'border-blue-500'

// Radius
'rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl'
'rounded-full'

// Style
'border-solid', 'border-dashed', 'border-dotted', 'border-double'
```

## Custom Components in CSS

In `src/styles/tailwind.css`:

```css
@layer components {
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }

  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }
}
```

Then use:

```javascript
html`
  <button class="btn-primary">Click</button>
  <div class="card">Content</div>
  <span class="badge bg-blue-100 text-blue-800">New</span>
`;
```

## Customization

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      'brand': '#2563eb',
    },
    spacing: {
      '128': '32rem',
    },
  },
}
```

Then use:

```javascript
html`<div class="bg-brand">...</div>`;
```

## Tips & Tricks

- Use `class="..."` with template literals - not `className`
- Static class names work best (no string interpolation)
- Check `tailwind.config.js` content paths if classes don't work
- Combine with Studio Framer signals for dynamic states
- Use Tailwind's responsive prefixes for mobile-first design
- Dark mode classes: `dark:bg-gray-900`

---

**For full documentation, see TAILWIND_SETUP.md**
