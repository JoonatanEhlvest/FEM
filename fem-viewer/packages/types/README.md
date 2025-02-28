# @fem-viewer/types

This package contains core type definitions for the FEM Viewer application.

## Usage

```typescript
// Core interfaces
import { Model, Instance } from '@fem-viewer/types';

// Utilities and other exports
import { isSubclass } from '@fem-viewer/types/Instance';
```

## Available Interfaces

- `Model` - Core model representation
- `Instance` - Instance definitions
- `Connector` - Connector definitions
- `ModelAttributes` - Model attributes
- `InstanceClass` - Instance class definitions
- `Reference` - Reference definitions

## Development

```bash
# Build the package
yarn build

# Watch for changes
yarn dev
```

## Guidelines

- Export primary interfaces from `index.ts`
- Import utilities and types from specific paths
- When adding new files, update exports in `package.json`
