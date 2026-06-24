# /add-visual <module-id> <type: diagram|animation|concept-map>

## Purpose
Create a new visual element and insert it into a module.

## Steps

1. **Load** `modules/<module-id>.json` to understand the module context
2. **Read** the module's existing sections to determine what visual would add value
3. **Generate** the visual:
   - `diagram`: SVG with viewBox max 800x400, using design system colors, Space Grotesk for labels, JetBrains Mono for code
   - `animation`: Self-contained HTML/CSS/JS with play/reset controls, under 100 lines JS
   - `concept-map`: Grid/flex layout with --java-* and --python-* colored boxes
4. **Insert** into the module at a logical position (usually after the first comparison that the visual supports)
5. **Write** updated module JSON
6. **Validate**

## Design Rules
- SVG diagrams: rounded rects (rx=10), dashed connector lines, design system font families
- Animations: use requestAnimationFrame, include play/pause/reset buttons
- Concept maps: max 5 elements, use inline styles (single-file HTML output)
- All visuals must use CSS variable color tokens

## Example
```
/add-visual 02-types-variables diagram
```
