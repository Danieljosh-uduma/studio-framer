export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './_studio-frame/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Extend with custom colors
        'primary': '#0066cc',
        'secondary': '#6b7280',
      },
      spacing: {
        // Extend with custom spacing
      },
      typography: {
        // Extend with custom typography
      },
    },
  },
  plugins: [
    // Add plugins here if needed
  ],
  safelist: [
    // Add dynamic classes here to prevent purging
  ],
}
