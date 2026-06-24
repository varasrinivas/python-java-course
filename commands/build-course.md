# /build-course

## Purpose
Assemble all module JSONs + shell template into a single deployable HTML file.

## Steps

1. **Validate** first: run `node scripts/validate.js`
2. If validation passes (no errors), **build**: run `node scripts/build.js`
3. **Report** the output: file path, file size, module count, section count
4. If validation has errors, **stop** and show the errors. Warnings are OK to proceed.

## Example
```
/build-course
```
