# Developer Experience Setup

This project includes comprehensive tooling for code quality, consistency, and safety.

## Quick Start

After cloning the repository, install dependencies:

```bash
npm install
# or yarn install / pnpm install
```

The `prepare` script will automatically set up Git hooks via Husky.

## Available Commands

### Code Quality

```bash
# Lint JavaScript/TypeScript files
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check if code is properly formatted (CI mode)
npm run format:check

# Type check TypeScript
npm run type-check
```

## Tool Overview

### TypeScript (tsconfig.json)

Strict type checking enabled for production-grade safety:

- `strict: true` - Enables all strict type checking options
- `noImplicitAny` - Errors on implicit `any` types
- `strictNullChecks` - Strict null/undefined checking
- `noUnusedLocals` - Errors on unused variables
- `noUnusedParameters` - Errors on unused function parameters
- `noImplicitReturns` - Ensures all code paths return values

**Benefits:**
- Catch bugs at compile time, not runtime
- Better IDE autocomplete and refactoring
- Self-documenting code through types

### ESLint (.eslintrc.json)

Code quality rules enforcing best practices:

- **Recommended rules** from ESLint and TypeScript
- **Type-aware rules** from `@typescript-eslint`
- **Code style enforcement** (quotes, semicolons, indentation)
- **Best practices** (no floating promises, proper null coalescing)

**Key Rules:**
- `prefer-const` - Use `const` by default
- `no-var` - Eliminate `var` keyword
- `@typescript-eslint/no-explicit-any` - Ban `any` type
- `@typescript-eslint/no-floating-promises` - Catch unhandled promises

**Console Warnings Allowed:**
The only `console` statements allowed are `warn` and `error`. Use `console.warn()` and `console.error()` for important messages.

### Prettier (.prettierrc.json)

Opinionated code formatter for consistency:

- Single quotes for strings
- 2-space indentation
- 100-character line width
- Trailing commas in multi-line structures
- Semicolons required
- LF (Unix) line endings

**Why Prettier?**
- Eliminates style debates - enforces one standard
- Formats entire codebase consistently
- Integrates seamlessly with editors

### EditorConfig (.editorconfig)

Maintains consistent editor settings across IDEs:

- Character encoding (UTF-8)
- Line endings (LF)
- Indentation (2 spaces)
- Trailing whitespace removal

**Supported Editors:**
- VS Code (requires EditorConfig extension)
- JetBrains IDEs (built-in support)
- Sublime Text (requires plugin)
- Vim (requires plugin)

### Git Hooks (Husky + Lint-Staged)

Automatic code quality checks before commits:

**How it works:**
1. Before each commit, Husky runs the pre-commit hook
2. Lint-staged identifies changed files
3. ESLint and Prettier run on staged files only (faster!)
4. If checks fail, commit is blocked

**File-specific rules:**
- `.js`, `.jsx`, `.ts`, `.tsx` - ESLint + Prettier
- `.json`, `.md`, `.yml`, `.yaml` - Prettier only

**Setup required after cloning:**
```bash
npm install
npm run prepare  # Sets up Git hooks (runs automatically)
```

## IDE Integration

### VS Code

#### Recommended Extensions:

1. **ESLint** (`dbaeumer.vscode-eslint`)
   - Real-time linting feedback
   - Quick fixes on hover

2. **Prettier** (`esbenp.prettier-vscode`)
   - Format on save
   - Automatic code formatting

3. **EditorConfig** (`EditorConfig.EditorConfig`)
   - Applies editor settings from `.editorconfig`

#### Settings (`.vscode/settings.json`):

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

#### Launch VS Code Settings UI:
- Press `Cmd+,` (Mac) or `Ctrl+,` (Windows/Linux)
- Search for "format on save" and enable

### JetBrains IDEs (WebStorm, IntelliJ, etc.)

**Built-in support** - EditorConfig settings apply automatically.

**Enable ESLint:**
1. Go to Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. Check "Run ESLint --fix on save"

**Enable Prettier:**
1. Go to Settings → Languages & Frameworks → JavaScript → Prettier
2. Check "Run prettier on save"

## Workflow Examples

### Committing Code

```bash
# Make changes to files
git add .

# Run linting/formatting (automatic via pre-commit hook)
git commit -m "feat: add new feature"

# If checks fail, fix them and try again
npm run lint:fix
npm run format
git add .
git commit -m "feat: add new feature"
```

### Before Pushing

```bash
# Ensure all code quality checks pass
npm run lint
npm run format:check
npm run type-check

# If any checks fail, fix them
npm run lint:fix
npm run format
npm run type-check
```

## Troubleshooting

### ESLint/Prettier conflicts

If ESLint and Prettier rules conflict:

1. ESLint's formatting rules are disabled in `.eslintrc.json` (via extensions)
2. Prettier handles all formatting
3. ESLint handles code quality rules

### "no-console" warnings on `console.log`

The ESLint config only allows `console.warn()` and `console.error()`. For debug logging:

```javascript
// ✓ Allowed
console.warn('Debug info:', value);
console.error('Error:', error);

// ✗ Not allowed
console.log('Debug info:', value);
```

### Husky hook not running

```bash
# Ensure Husky is installed
npm run prepare

# Verify hook permissions
chmod +x .husky/pre-commit

# Check Git configuration
git config --local core.hooksPath
```

### Files not auto-formatting on save in VS Code

1. Ensure Prettier extension is installed
2. Check `.vscode/settings.json` has `"editor.formatOnSave": true`
3. Verify `prettier` is installed: `npm list prettier`
4. Restart VS Code (Cmd/Ctrl + Shift + P → "Reload Window")

### Type checking errors with `npm run type-check`

```bash
# View detailed TypeScript errors
npm run type-check

# Check a specific file
npx tsc --noEmit src/myfile.ts

# Get more verbose output
npx tsc --noEmit --pretty
```

## Best Practices

### Writing Code

1. **Use meaningful variable names** - Enables better autocomplete
2. **Add type annotations** - Especially for function parameters/returns
3. **Avoid `any` type** - TypeScript can usually infer better types
4. **Use const by default** - Only use `let` when reassignment needed

### Committing

1. **Keep commits small** - Easier to review and revert if needed
2. **Write descriptive messages** - Follow Conventional Commits
3. **Run tests before pushing** - Avoid CI failures

### Reviewing Code

1. **Trust the linter** - It catches common mistakes
2. **Check types carefully** - TypeScript errors are usually correct
3. **Validate error messages** - They guide you to the fix

## Performance Tips

### Faster Linting

Lint-staged only checks changed files during commits, making the process fast. For full codebase linting:

```bash
# Lint only changed files (fast)
npm run lint

# Or run through Git
git diff --name-only --diff-filter=ACM | xargs eslint
```

### Faster Type Checking

TypeScript caches type information. If you have issues:

```bash
# Clear TypeScript cache
rm -rf dist/
npm run type-check
```

## Continuous Integration

For CI/CD pipelines, use:

```bash
# Fail if code isn't properly formatted
npm run format:check

# Fail if lint issues exist
npm run lint

# Fail if type errors exist
npm run type-check
```

## Further Reading

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [EditorConfig Homepage](https://editorconfig.org/)
