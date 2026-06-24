# /preview-module <module-id>

## Purpose
Generate a standalone HTML preview of a single module for quick visual testing.

## Steps

1. **Load** the module JSON from `modules/<module-id>.json`
2. **Load** the shell template from `templates/shell.html`
3. **Build** a single-module version: inject only the one module as the MODS array
4. **Write** to `output/preview-<module-id>.html`
5. **Report** the output path

## Example
```
/preview-module 06-oop-classes
```
