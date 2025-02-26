# @fem-viewer/parser

This package contains XML parsing functionality for the FEM Viewer application.

## Purpose

The parser package provides utilities for parsing XML data into structured objects that conform to the types defined in `@fem-viewer/types`. It abstracts away the complexities of XML parsing and provides a clean API for working with FEM model data.

## Usage

```typescript
import { Parser } from '@fem-viewer/parser';
import { Model } from '@fem-viewer/types';

// Parse XML data
const xmlData = '...'; // XML string
const parser = new Parser();
const model: Model = parser.parse(xmlData);
```

## Features

- XML parsing with validation
- Conversion to strongly-typed model objects
- Support for all FEM model elements (instances, connectors, etc.)

## Development

```bash
# Install dependencies
yarn install

# Build the package
yarn build

# Watch for changes during development
yarn dev

# Run tests
yarn test
```

## Dependencies

- `@fem-viewer/types` - Type definitions
- `fast-xml-parser` - XML parsing library 