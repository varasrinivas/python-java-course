# /gen-module <module-id>

## Purpose
Generate a complete module JSON file from the course-config.json definition.

## Steps

1. **Read** `course-config.json` to get the module's title, eyebrow, and subtitle
2. **Read** `templates/section-types.md` for the section schema reference
3. **Read** `CLAUDE.md` for content principles and design system
4. **Generate** a module JSON with:
   - At least 2-3 `comparison` sections (Java↔Python side-by-side code)
   - At least 1 `insight` with variant `gotcha` (Java-habits-that-break)
   - At least 1 `insight` with variant `win` (Python advantage)
   - 1 `concept-map` or `diagram` for visual learning
   - 1 `table` for quick-reference mapping
   - 1 `quiz` for knowledge check
   - Optional: `prose` for bridging explanations
5. **Apply syntax highlighting** using `<span class="...">` tags per CLAUDE.md code classes
6. **Write** to `modules/<module-id>.json`
7. **Validate** by running `node scripts/validate.js <module-id>`

## Content Rules
- Java code: idiomatic modern Java 11+ (17+ for pattern matching, records)
- Python code: idiomatic modern Python 3.10+ with type hints everywhere
- No Foo/Bar/Baz — use realistic names from data engineering, APIs, cloud
- Comments in code should highlight the KEY DIFFERENCE, not explain basics
- Gotcha insights must describe specifically how Java habits cause Python bugs
- Keep each module to 5-8 sections max
- All code must have syntax highlighting spans

## Example Invocation
```
/gen-module 05-functions
```
