# Python for Java Developers — Interactive Visual Course

## Project Identity

A **single-file interactive HTML course** that teaches Python to experienced Java developers through side-by-side visual comparisons, animated diagrams, concept maps, quizzes, and "gotcha" alerts. The course leverages existing Java knowledge as a bridge, never explaining basic programming concepts — only the Python delta.

**Target Learner**: Senior Java developer (10+ years) moving to Python for data engineering, AI/ML, or automation.

---

## Architecture

```
python-java-course/
├── CLAUDE.md                  ← You are here
├── course-config.json         ← Module registry, metadata, ordering
├── modules/                   ← Individual module content as JSON
│   ├── 00-welcome.json
│   ├── 01-program-structure.json
│   ├── 02-types-variables.json
│   └── ...
├── templates/
│   ├── shell.html             ← HTML/CSS/JS shell (player chrome)
│   └── section-types.md       ← Reference for all section block types
├── scripts/
│   ├── build.js               ← Assembles modules → single HTML
│   └── validate.js            ← Validates module JSON structure
├── commands/                  ← Slash command definitions
│   ├── gen-module.md
│   ├── add-module.md
│   ├── audit-course.md
│   ├── build-course.md
│   ├── add-section.md
│   └── preview-module.md
└── output/
    └── python-for-java-devs.html  ← Final built artifact
```

---

## Design System

### Typography
| Role     | Family             | Usage                          |
|----------|--------------------|--------------------------------|
| Display  | Space Grotesk 700  | Module titles, section headers |
| Body     | Inter 400/500      | Prose, insights, quiz text     |
| Code     | JetBrains Mono 400 | All code blocks, labels, data  |

### Color Tokens
```
--bg:            #0f1117      (deep navy-black)
--surface:       #181b25      (card/panel background)
--surface2:      #1e2230      (interactive element bg)
--border:        #2a2e3d      (dividers, borders)
--text:          #e2e4ea      (primary text)
--text-dim:      #8b8fa3      (secondary text, labels)
--java:          #f89820      (Java-side accent, from Java logo)
--java-bg:       rgba(248,152,32,0.08)
--java-border:   rgba(248,152,32,0.25)
--python:        #4584b6      (Python-side accent, from Python logo)
--python-bg:     rgba(69,132,182,0.08)
--python-border: rgba(69,132,182,0.25)
--accent:        #a78bfa      (interactive elements, highlights)
--green:         #34d399      (correct, success, win insights)
--red:           #f87171      (incorrect, danger)
--yellow:        #fbbf24      (gotcha warnings)
```

### Code Syntax Highlighting Classes
```
.kw    → #c792ea   (keywords: class, def, if, for, import, return)
.type  → #82aaff   (type names: String, int, List, Optional)
.str   → #c3e88d   (string literals)
.num   → #f78c6c   (number literals)
.cm    → #546e7a   (comments, italic)
.fn    → #82aaff   (function/method names)
.op    → #89ddff   (operators, brackets in f-strings)
.dec   → #ffd700   (decorators like @property)
.self  → #f07178   (self parameter)
.bi    → #e06c75   (built-in functions)
```

---

## Module JSON Schema

Each module file in `modules/` follows this structure:

```json
{
  "id": "02-types-variables",
  "title": "Types & Variables",
  "eyebrow": "Module 02",
  "subtitle": "From static typing to dynamic — but not lawless",
  "sections": [
    {
      "type": "comparison",
      "java": "// Java code with <span> syntax highlighting",
      "python": "# Python code with <span> syntax highlighting"
    },
    {
      "type": "insight",
      "variant": "gotcha | win | (empty for neutral)",
      "title": "Insight Title",
      "content": "HTML content explaining the insight"
    },
    {
      "type": "concept-map",
      "title": "Map Title",
      "content": "HTML for the visual concept map layout"
    },
    {
      "type": "table",
      "headers": ["Col1", "Col2", "Col3"],
      "rows": [["cell", "cell", "cell"]]
    },
    {
      "type": "prose",
      "content": "<p>Paragraph content with <code>inline code</code>.</p>"
    },
    {
      "type": "quiz",
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correct": 2,
      "explanation": "Why the answer is correct."
    },
    {
      "type": "diagram",
      "id": "unique-diagram-id",
      "svg": "<svg>...</svg>"
    },
    {
      "type": "animation",
      "id": "unique-anim-id",
      "description": "What the animation demonstrates",
      "html": "HTML/CSS/JS for the interactive animation"
    },
    {
      "type": "tab-group",
      "tabs": [
        { "label": "Tab 1", "content": "HTML content" },
        { "label": "Tab 2", "content": "HTML content" }
      ]
    }
  ]
}
```

---

## Section Type Rules

### `comparison` (Java ↔ Python side-by-side)
- **Always lead with Java on the left**, Python on the right
- Java code should be idiomatic modern Java (11+ features OK, 17+ for pattern matching)
- Python code should be idiomatic modern Python (3.10+ features OK)
- Use `<span class="...">` for syntax highlighting (see code classes above)
- Keep both sides roughly the same vertical height when possible
- Add inline comments in the code to call out key differences
- **Never explain basic programming** — the learner knows what a for loop IS, show them Python's syntax

### `insight` (callout blocks)
Three variants:
- **`gotcha`** (yellow ⚠️): Traps where Java habits cause Python bugs. These are the most valuable. Examples: mutable default args, `==` vs `is`, indentation errors, forgetting `self`
- **`win`** (green ✨): Where Python is genuinely more expressive/powerful. Examples: list comprehensions, generators, f-strings, unpacking
- **neutral** (purple, no variant): General observations, mental model shifts

### `concept-map` (visual overview diagrams)
- Use inline HTML with grid/flex layouts
- Color-code Java elements with `--java-*` tokens, Python with `--python-*`
- Show mapping/transformation arrows between concepts
- Keep to 3-5 elements max per map

### `quiz` (end-of-module knowledge checks)
- 1-2 per module maximum
- 4 options, exactly 1 correct
- `correct` is 0-indexed
- `explanation` should reference both the Java and Python mental models
- Questions should test *understanding of differences*, not trivia

### `diagram` (SVG technical diagrams)
- Use SVG with the color tokens from the design system
- Font-family must match: Space Grotesk for labels, JetBrains Mono for code
- Keep diagrams under 800x300 viewBox for readability
- Use rounded rects (rx=10), dashed connector lines

### `table` (reference comparison tables)
- Use for mapping Java→Python equivalents (types, methods, tools)
- Allow `<code>` tags in cells
- Keep to 6-10 rows maximum
- Headers should always contrast the two languages

---

## Content Principles

1. **Java is the anchor**: Every concept starts from what the Java dev already knows, then bridges to Python. Never explain the Java side — assume mastery.

2. **Show, don't tell**: Prefer a side-by-side code comparison over a paragraph of explanation. The code IS the lesson.

3. **Gotchas > Features**: The most valuable content is "here's where your Java instinct will bite you." Prioritize these.

4. **Practical over academic**: Use realistic examples from data engineering, APIs, cloud services — not toy examples with `Foo` and `Bar`.

5. **Progressive complexity**: Early modules cover syntax mapping; later modules introduce Python-only concepts (generators, decorators, comprehensions) that have no direct Java equivalent.

6. **Type hints everywhere**: Show modern Python with type hints in all examples. This eases the transition from Java's static typing and represents current best practice.

---

## Slash Commands

### `/gen-module <module-id>`
Generate a new module JSON file from scratch. Reads course-config.json for the module definition, creates the file in `modules/`, and validates it.

### `/add-module <title> <after-module-id>`
Add a new module to the course. Creates the config entry and generates an empty scaffold JSON.

### `/add-section <module-id> <section-type> [after-section-index]`
Add a new section to an existing module. Prompts for content based on the section type.

### `/audit-course`
Validate all module JSONs against the schema, check for:
- Missing syntax highlighting spans
- Unbalanced Java/Python comparison lengths
- Quizzes without explanations
- Duplicate diagram/animation IDs
- Modules referenced in config but missing files

### `/build-course`
Assemble all module JSONs + the shell template into a single `output/python-for-java-devs.html` file. Runs validation first.

### `/preview-module <module-id>`
Generate a standalone HTML preview of a single module for quick visual testing.

### `/add-visual <module-id> <type: diagram|animation|concept-map>`
Create a new visual element (SVG diagram, CSS animation, or concept map) and insert it into the specified module.

### `/expand-module <module-id>`
Analyze a module for gaps and suggest additional sections: missing gotchas, diagrams that could help, topics not yet covered.

---

## Build Process

The build script (`scripts/build.js`) performs:

1. **Read** `course-config.json` for module order and metadata
2. **Load** each module JSON from `modules/` in order
3. **Validate** all modules against schema
4. **Inject** the module data as the `MODS` array into the shell template
5. **Write** the assembled single-file HTML to `output/`

Run with: `node scripts/build.js`

---

## Module Registry (source of truth: course-config.json)

The `course-config.json` file defines:
- Module order (array of module IDs)
- Sidebar groupings (which modules go under which section header)
- Course metadata (title, version, author)
- Total module count for progress tracking

**Always update course-config.json when adding/removing/reordering modules.**

---

## Quality Checklist (used by /audit-course)

- [ ] Every `comparison` section has syntax-highlighted `<span>` tags
- [ ] Every module has at least 1 `comparison`, 1 `insight`, and 1 `quiz`
- [ ] All `quiz.correct` values are valid indices into `quiz.options`
- [ ] No module exceeds 8 sections (keep focused)
- [ ] All SVG diagrams use design system color tokens
- [ ] `concept-map` content uses CSS grid/flex, not tables
- [ ] Every `insight` with variant `gotcha` describes a Java→Python trap specifically
- [ ] Code examples use modern Java (11+) and modern Python (3.10+)
- [ ] Type hints present in all Python code examples
- [ ] No `Foo/Bar/Baz` — realistic variable and class names only
