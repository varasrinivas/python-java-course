# /add-section <module-id> <section-type> [after-section-index]

## Purpose
Add a new section to an existing module JSON.

## Steps

1. **Load** `modules/<module-id>.json`
2. **Read** `templates/section-types.md` for the schema of the requested type
3. **Generate** the section content following CLAUDE.md content principles
4. **Insert** at the specified index (or append if no index given)
5. **Write** updated module JSON
6. **Validate** by running `node scripts/validate.js <module-id>`

## Section Types
- `comparison` — Java↔Python code side-by-side
- `insight` — gotcha/win/neutral callout
- `concept-map` — visual overview grid
- `table` — reference mapping table
- `prose` — explanatory text
- `quiz` — knowledge check
- `diagram` — SVG technical diagram
- `animation` — interactive HTML/CSS/JS visual
- `tab-group` — tabbed content

## Example
```
/add-section 05-functions insight gotcha 2
```
Adds a gotcha insight after section index 2 in the functions module.
