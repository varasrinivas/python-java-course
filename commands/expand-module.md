# /expand-module <module-id>

## Purpose
Analyze a module for content gaps and suggest/add sections.

## Steps

1. **Load** `modules/<module-id>.json`
2. **Analyze** existing sections for gaps:
   - Missing gotcha insights (Java habits that break in Python)
   - Missing win insights (Python advantages)
   - Missing visual elements (no diagram/concept-map/animation)
   - Common sub-topics not yet covered for this module's theme
   - Missing quick-reference table
3. **Suggest** 3-5 specific additions with rationale
4. **Ask** which additions to generate
5. **Generate** and insert the selected additions
6. **Validate**

## Gap Detection Heuristics
- If module has only comparisons → needs insights and visuals
- If module has no gotcha → there's almost always a Java-trap to document
- If module covers a complex topic (OOP, generators) → needs a diagram
- If module has no table → a quick-reference mapping table adds value
- If module has >4 comparisons without a break → add prose or visual between them

## Example
```
/expand-module 08-comprehensions-generators
```
