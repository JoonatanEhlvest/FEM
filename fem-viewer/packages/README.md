# FEM Viewer Packages

## Package Structure

- **@fem-viewer/types**: Type definitions shared across all packages
- **@fem-viewer/parser**: XML parsing functionality
- **@fem-viewer/client**: Client-side application code
- **@fem-viewer/server**: Server-side application code

## Development Workflow

### Building all packages

```bash
# From the packages directory
yarn build

# Or from the project root
cd packages && yarn build
```

### Building specific packages

```bash
# Build only the types package
yarn build:types

# Build only the parser package
yarn build:parser
```

### Development mode

```bash
# Watch all packages for changes
yarn dev
```

## Package Dependencies

The packages have the following dependency structure:

- `types` has no dependencies on other packages
- `parser` depends on `types`
- `client` depends on `types` and `parser`
- `server` depends on `types` and `parser`

## Adding New Packages

When adding a new package:

1. Create a new directory in the packages folder
2. Add a package.json, tsconfig.json, and README.md
3. Add the package to the workspaces array in the root package.json
4. Add build scripts to the root package.json 