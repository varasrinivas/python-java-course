# Python for Java Developers — Course Builder

A Claude Code-powered authoring system for generating an interactive single-file HTML course that teaches Python through Java comparisons.

## Quick Start with Claude Code

```bash
# 1. Open the project in Claude Code
cd python-java-course
claude

# 2. Generate all modules (Claude reads CLAUDE.md automatically)
/gen-module 02-types-variables
/gen-module 03-collections
/gen-module 04-control-flow
/gen-module 05-functions
/gen-module 06-oop-classes
/gen-module 07-exception-handling
/gen-module 08-comprehensions-generators
/gen-module 09-file-io
/gen-module 10-packages-environments
/gen-module 11-decorators
/gen-module 12-testing

# 3. Validate everything
/audit-course

# 4. Build the final HTML
/build-course
```

## Slash Commands

| Command | Description |
|---------|-------------|
| `/gen-module <id>` | Generate a complete module from config |
| `/add-module <title> <after>` | Add a new module to the course |
| `/add-section <mod> <type>` | Add a section to a module |
| `/add-visual <mod> <type>` | Add diagram/animation/concept-map |
| `/expand-module <mod>` | Analyze gaps and suggest additions |
| `/audit-course` | Validate all modules |
| `/build-course` | Build → `output/python-for-java-devs.html` |
| `/preview-module <id>` | Preview a single module |

## Project Structure

```
├── CLAUDE.md                  ← Master instructions for Claude Code
├── course-config.json         ← Module registry & ordering
├── modules/                   ← Module content (JSON per module)
├── templates/
│   ├── shell.html             ← HTML player template
│   └── section-types.md       ← Section type reference
├── scripts/
│   ├── build.js               ← Assembler
│   └── validate.js            ← Validator
├── commands/                  ← Slash command definitions
└── output/                    ← Built course HTML
```

## Extending the Course

To add a new module (e.g., "Async & Concurrency"):

```
/add-module "Async & Concurrency" 12-testing
/gen-module 13-async-await
/build-course
```

To add a visual to an existing module:

```
/add-visual 06-oop-classes diagram
```

## Manual Build

```bash
node scripts/validate.js        # Check all modules
node scripts/build.js            # Build HTML
node scripts/build.js --out custom-path.html
```
