# Build Commands Quick Reference

## Production Build

```bash
# Full production build with optimizations
npm run build:prod

# Analyze bundle size and composition
npm run analyze

# Build and analyze in one command
npm run build:analyze

# Test production build locally
npm run build:test
```

## Development Build

```bash
# Development build (faster, with source maps)
npm run build:dev

# Start development server
npm run dev
```

## Staging Build

```bash
# Staging build (moderate optimizations)
npm run build:staging
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint
```

## Preview

```bash
# Preview production build locally
npm run preview
```

## Code Quality

```bash
# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Build Output

Production builds are output to the `dist/` directory:

```
dist/
├── index.html
├── assets/
│   ├── js/
│   │   ├── vendor-*.js (vendor libraries)
│   │   ├── react-vendor-*.js (React)
│   │   ├── mui-vendor-*.js (Material-UI)
│   │   ├── aws-vendor-*.js (AWS Amplify)
│   │   ├── chart-vendor-*.js (Recharts)
│   │   ├── query-vendor-*.js (React Query)
│   │   └── [page]-*.js (page chunks)
│   └── css/
│       └── index-*.css
└── build-report.json
```

## Environment Variables

Set environment-specific variables in:
- `.env.development` - Development
- `.env.staging` - Staging
- `.env.production` - Production

## Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Total Bundle | < 2 MB | 1.51 MB ✅ |
| Gzipped | < 1 MB | 465 KB ✅ |
| Build Time | < 2 min | 55s ✅ |

## Troubleshooting

### Build Fails

1. Clear cache: `rm -rf node_modules/.vite`
2. Reinstall: `npm ci`
3. Check TypeScript: `npm run type-check`

### Large Bundle

1. Run analysis: `npm run analyze`
2. Check for duplicate dependencies
3. Review import statements

### Slow Build

1. Use development build: `npm run build:dev`
2. Disable source maps in `.env`
3. Check for large dependencies

## Documentation

- Full optimization guide: `docs/BUILD_OPTIMIZATION.md`
- Task summary: `docs/TASK_22_BUILD_OPTIMIZATION_SUMMARY.md`
