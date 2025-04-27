# Icon Renderer

This component renders icons for FEM instances (Process, Asset, etc.) in the SVG diagram.

## Icon Files

The actual icon files are stored in the public directory at `/icons/` to ensure they are accessible in the built application.

If you add new icons:

1. Add the icon file to `public/icons/` directory
2. Make sure the filename matches the enum value in the IconTypes definition
3. Update the corresponding enum in `@fem-viewer/types/Icons.ts` if necessary

## Important Notes

-   For Process instances, icons are rendered at the middle-left position
-   For Asset instances, icons are rendered at the top-left with some padding
-   The special "artefact" icon type has subtypes that are rendered based on the `iconForArtefact` property

## Troubleshooting

If icons are not displaying:

-   Check that the icon files exist in the public/icons directory
-   Verify the icon name in the instance matches a file name in the icons directory
